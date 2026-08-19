#!/usr/bin/env node
/**
 * scripts/build-vector-index.mjs
 *
 * Reads all knowledge documents in data/knowledge/*.json,
 * chunks them, generates Gemini embeddings, and writes data/vector-index.json.
 *
 * Features:
 *   - Content hashing: only re-embeds chunks whose content has changed
 *   - Rate-limit friendly: 200ms delay between API calls
 *   - Safe: never overwrites the index on API failure
 *
 * Usage:
 *   npm run build:knowledge
 *
 * Requires GEMINI_API_KEY in .env or environment.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

const API_KEY = process.env.GEMINI_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'gemini-embedding-001';
const KNOWLEDGE_DIR = path.join(ROOT, 'data', 'knowledge');
const INDEX_PATH = path.join(ROOT, 'data', 'vector-index.json');
const CHUNK_SIZE = 300;
const CHUNK_OVERLAP = 50;
const CALL_DELAY_MS = 250;

if (!API_KEY) {
  console.error('❌  GEMINI_API_KEY is not set. Add it to .env or export it before running.');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

// ── Chunker (inline — avoids ESM import complexity in the script) ─────────────
function splitSentences(text) {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function chunkDocument(doc) {
  const { id, title, content, sourceUrl, category } = doc;
  const sentences = splitSentences(content);
  const chunks = [];
  let current = '';
  let chunkIndex = 0;

  for (const sentence of sentences) {
    if (current.length + sentence.length + 1 > CHUNK_SIZE && current.length > 0) {
      chunks.push({ id: `${id}-chunk-${chunkIndex}`, documentId: id, title, content: current.trim(), sourceUrl, category, chunkIndex });
      const overlapStart = Math.max(0, current.length - CHUNK_OVERLAP);
      current = current.slice(overlapStart) + ' ' + sentence;
      chunkIndex++;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }
  if (current.trim()) {
    chunks.push({ id: `${id}-chunk-${chunkIndex}`, documentId: id, title, content: current.trim(), sourceUrl, category, chunkIndex });
  }
  return chunks;
}

// ── Embedding API ─────────────────────────────────────────────────────────────
async function generateEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text: text.slice(0, 2048) }] }
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`API ${res.status}: ${err?.error?.message || 'unknown'}`);
  }
  const data = await res.json();
  const values = data?.embedding?.values;
  if (!Array.isArray(values) || values.length === 0) throw new Error('Empty embedding returned');
  return values;
}

// ── Verify API before bulk operation ─────────────────────────────────────────
async function verifyApi() {
  console.log(`\n🔍  Verifying Gemini embedding API (model: ${EMBEDDING_MODEL})…`);
  const testVector = await generateEmbedding('Sri Anjaneya Youth test');
  console.log(`✅  API OK — vector dimension: ${testVector.length}`);
  return testVector.length;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📚  Sri Anjaneya Youth — Vector Index Builder\n');

  // 1. Verify API works before doing anything else
  const dimension = await verifyApi();

  // 2. Load existing index for hash comparison
  let existingMap = {};
  if (existsSync(INDEX_PATH)) {
    try {
      const existing = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
      for (const chunk of existing) {
        if (chunk.contentHash) existingMap[chunk.contentHash] = chunk.embedding;
      }
      console.log(`\n📂  Existing index: ${existing.length} chunks (${Object.keys(existingMap).length} with hashes)`);
    } catch {
      console.warn('⚠️  Could not parse existing index — will rebuild from scratch');
    }
  }

  // 3. Load and chunk knowledge documents
  const knowledgeFiles = readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith('.json'));
  console.log(`\n📄  Knowledge files: ${knowledgeFiles.join(', ')}`);

  const allChunks = [];
  for (const file of knowledgeFiles) {
    const docs = JSON.parse(readFileSync(path.join(KNOWLEDGE_DIR, file), 'utf-8'));
    for (const doc of docs) {
      allChunks.push(...chunkDocument(doc));
    }
  }
  console.log(`🔪  Total chunks: ${allChunks.length}`);

  // 4. Generate embeddings (skip unchanged chunks)
  const results = [];
  let embedded = 0;
  let reused = 0;

  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    const hash = sha256(chunk.content);

    if (existingMap[hash]) {
      results.push({ ...chunk, contentHash: hash, embedding: existingMap[hash] });
      reused++;
      process.stdout.write(`\r⚡  Chunk ${i + 1}/${allChunks.length} — reused (unchanged)`);
      continue;
    }

    try {
      const embedding = await generateEmbedding(chunk.content);
      results.push({ ...chunk, contentHash: hash, embedding });
      embedded++;
      process.stdout.write(`\r🧠  Chunk ${i + 1}/${allChunks.length} — embedded (${embedded} new)`);
      if (i < allChunks.length - 1) await sleep(CALL_DELAY_MS);
    } catch (err) {
      console.error(`\n❌  Failed to embed chunk ${chunk.id}: ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`\n\n✅  Embedding complete: ${embedded} new, ${reused} reused`);

  // 5. Validate all chunks have embeddings of correct dimension
  const invalid = results.filter((r) => !Array.isArray(r.embedding) || r.embedding.length !== dimension);
  if (invalid.length > 0) {
    console.error(`❌  ${invalid.length} chunks have invalid embeddings. Aborting.`);
    process.exit(1);
  }

  // 6. Write index
  writeFileSync(INDEX_PATH, JSON.stringify(results, null, 2));
  const sizeKb = Math.round(readFileSync(INDEX_PATH).length / 1024);
  console.log(`💾  Saved: data/vector-index.json (${results.length} chunks, ~${sizeKb} KB)`);
  console.log('\n🎉  Build complete!\n');
}

main().catch((err) => {
  console.error('\n❌  Build failed:', err.message);
  process.exit(1);
});

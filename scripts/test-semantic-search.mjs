/**
 * Quick semantic search verification test
 */
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load API key from .env
function getApiKey() {
  const env = readFileSync(path.join(ROOT, '.env'), 'utf-8');
  const line = env.split('\n').find((l) => l.startsWith('GEMINI_API_KEY'));
  if (!line) throw new Error('GEMINI_API_KEY not found in .env');
  return line.split('=')[1].trim();
}

const API_KEY = getApiKey();

// Inline cosine similarity (avoid import chain complexity in test)
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// Load vector index
const indexPath = path.join(ROOT, 'data', 'vector-index.json');
const chunks = JSON.parse(readFileSync(indexPath, 'utf-8'));

async function embed(text) {
  const model = 'gemini-embedding-001';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: `models/${model}`, content: { parts: [{ text }] } })
  });
  const data = await res.json();
  return data?.embedding?.values;
}

async function search(query, topK = 3, threshold = 0.5) {
  const qVec = await embed(query);
  return chunks
    .filter((c) => Array.isArray(c.embedding))
    .map((c) => ({ title: c.title, sourceUrl: c.sourceUrl, sim: Math.round(cosineSimilarity(qVec, c.embedding) * 1000) / 1000 }))
    .filter((r) => r.sim >= threshold)
    .sort((a, b) => b.sim - a.sim)
    .slice(0, topK);
}

const tests = [
  { q: 'What is Sri Anjaneya Youth?', expect: 'organization' },
  { q: 'Do you conduct programs where people can donate blood?', expect: 'blood donation' },
  { q: 'How can I become part of the team?', expect: 'join' },
  { q: 'How do I make a donation online?', expect: 'donate' },
  { q: 'Where can I see the upcoming events?', expect: '/events' },
  { q: 'What is Annadanam?', expect: 'Annadanam' },
  { q: 'What is the email address?', expect: 'contact' },
];

console.log('=== Semantic Search Test Suite ===\n');
let passed = 0;

for (const { q, expect } of tests) {
  const results = await search(q, 2, 0.5);
  const hit = results.some((r) => JSON.stringify(r).toLowerCase().includes(expect.toLowerCase()));
  const status = hit ? 'PASS' : 'WARN';
  if (hit) passed++;
  console.log(`[${status}] "${q}"`);
  results.forEach((r) => console.log(`       sim=${r.sim}  "${r.title}"  ${r.sourceUrl}`));
  console.log();
}

console.log(`Result: ${passed}/${tests.length} passed`);

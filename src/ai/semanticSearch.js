/* global process */

/**
 * semanticSearch.js
 * Finds the most relevant knowledge chunks for a user query using cosine similarity.
 * Falls back gracefully to an empty result set if the vector index is unavailable.
 */

import { generateEmbedding } from './embeddings.js';
import { getAllChunks } from './vectorStore.js';

const DEFAULT_TOP_K = 4;
const DEFAULT_THRESHOLD = 0.60; // cosine similarity threshold (0–1)

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 (opposite) and 1 (identical direction).
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Perform semantic search against the pre-built vector index.
 *
 * @param {string} query - The user's question
 * @param {string} apiKey - Gemini API key (server-side only)
 * @param {object} options
 * @param {number} [options.topK=4] - Max results to return
 * @param {number} [options.threshold=0.60] - Minimum similarity score
 * @returns {Promise<Array<{title, content, sourceUrl, category, similarity}>>}
 *          Returns empty array on any failure — caller must handle fallback.
 */
export async function semanticSearch(query, apiKey, options = {}) {
  const { topK = DEFAULT_TOP_K, threshold = DEFAULT_THRESHOLD } = options;

  if (!query || typeof query !== 'string') return [];

  // Load chunks from index
  const chunks = getAllChunks();
  if (!chunks || chunks.length === 0) {
    console.warn('[semanticSearch] Vector index unavailable — returning empty');
    return [];
  }

  // Generate query embedding
  let queryVector;
  try {
    queryVector = await generateEmbedding(query, apiKey);
  } catch (err) {
    console.warn('[semanticSearch] Embedding generation failed:', err.message);
    return [];
  }

  // Score all chunks
  const scored = chunks
    .filter((chunk) => Array.isArray(chunk.embedding) && chunk.embedding.length > 0)
    .map((chunk) => ({
      title: chunk.title,
      content: chunk.content,
      sourceUrl: chunk.sourceUrl,
      category: chunk.category,
      similarity: cosineSimilarity(queryVector, chunk.embedding)
    }));

  // Filter by threshold, sort descending, return top K
  return scored
    .filter((r) => r.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(({ title, content, sourceUrl, category, similarity }) => ({
      title,
      content,
      sourceUrl,
      category,
      similarity: Math.round(similarity * 1000) / 1000 // 3 decimal places
    }));
}

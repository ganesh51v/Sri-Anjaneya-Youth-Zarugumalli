/* global process */

/**
 * embeddings.js
 * Generates text embeddings using the Gemini text-embedding-004 model.
 * Server-side only — API key must never be exposed to the browser.
 */

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'gemini-embedding-001';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Sleep helper for retries.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate an embedding vector for a single text string.
 * Retries up to MAX_RETRIES times on transient errors.
 *
 * @param {string} text - Input text (will be truncated to 2048 chars for safety)
 * @param {string} apiKey - Gemini API key (required)
 * @returns {Promise<number[]>} Embedding vector (768 dimensions for text-embedding-004)
 */
export async function generateEmbedding(text, apiKey) {
  if (!text || typeof text !== 'string') {
    throw new Error('[embeddings] text must be a non-empty string');
  }
  if (!apiKey) {
    throw new Error('[embeddings] GEMINI_API_KEY is required');
  }

  const truncated = text.trim().slice(0, 2048);
  const url = `${GEMINI_API_BASE}/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`;

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text: truncated }] }
        })
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(
          `Gemini embedding API error ${res.status}: ${errorBody?.error?.message || 'unknown'}`
        );
      }

      const data = await res.json();
      const values = data?.embedding?.values;

      if (!Array.isArray(values) || values.length === 0) {
        throw new Error('[embeddings] Empty embedding returned from API');
      }

      return values;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        console.warn(`[embeddings] Attempt ${attempt} failed, retrying...`, err.message);
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError;
}

/**
 * Generate embeddings for multiple texts with a small delay between calls
 * to avoid hitting rate limits.
 *
 * @param {string[]} texts
 * @param {string} apiKey
 * @param {number} delayMs - ms between API calls (default 200)
 * @returns {Promise<number[][]>}
 */
export async function generateEmbeddings(texts, apiKey, delayMs = 200) {
  const results = [];
  for (const text of texts) {
    results.push(await generateEmbedding(text, apiKey));
    if (delayMs > 0) await sleep(delayMs);
  }
  return results;
}

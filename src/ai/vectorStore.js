/* global process, URL */

/**
 * vectorStore.js
 * Loads and caches the pre-built vector index (data/vector-index.json).
 * Read-only at runtime — the build script writes the file, the API reads it.
 * Abstraction layer: swap the backing store here without touching semanticSearch.js.
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Module-level cache: loaded once per cold start, reused across requests
let _cachedChunks = null;
let _loadAttempted = false;

/**
 * Load the vector index JSON from disk (once per process lifetime).
 * Returns null if the file is missing or corrupted — caller should fall back.
 *
 * @returns {Array<object>|null}
 */
export function loadVectorIndex() {
  if (_loadAttempted) return _cachedChunks;
  _loadAttempted = true;

  try {
    // Resolve path relative to project root (two levels up from src/ai/)
    const indexPath = path.resolve(__dirname, '../../data/vector-index.json');
    const require = createRequire(import.meta.url);
    const raw = require(indexPath);

    if (!Array.isArray(raw) || raw.length === 0) {
      console.warn('[vectorStore] vector-index.json is empty or invalid');
      return null;
    }

    _cachedChunks = raw;
    console.log(`[vectorStore] Loaded ${raw.length} chunks from vector index`);
    return _cachedChunks;
  } catch (err) {
    console.warn('[vectorStore] Could not load vector-index.json:', err.message);
    return null;
  }
}

/**
 * Returns all chunks from the vector index, or null if unavailable.
 * @returns {Array<object>|null}
 */
export function getAllChunks() {
  return loadVectorIndex();
}

/**
 * Reset the in-memory cache (useful for testing).
 */
export function _resetCache() {
  _cachedChunks = null;
  _loadAttempted = false;
}

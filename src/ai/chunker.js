/**
 * chunker.js
 * Splits a knowledge document's content into overlapping text chunks.
 * Pure function — no I/O, no side effects.
 */

const CHUNK_SIZE = 300;   // target characters per chunk (not tokens — rough approximation)
const CHUNK_OVERLAP = 50; // characters of overlap between consecutive chunks

/**
 * Split text into sentences (rough heuristic — good enough for this corpus size).
 */
function splitSentences(text) {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Chunk a single knowledge document into overlapping pieces.
 *
 * @param {object} doc - A knowledge document { id, title, content, sourceUrl, category, updatedAt }
 * @returns {Array<object>} Array of chunk objects ready for embedding
 */
export function chunkDocument(doc) {
  const { id, title, content, sourceUrl, category } = doc;
  const sentences = splitSentences(content);

  const chunks = [];
  let currentChunk = '';
  let chunkIndex = 0;

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length + 1 > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push({
        id: `${id}-chunk-${chunkIndex}`,
        documentId: id,
        title,
        content: currentChunk.trim(),
        sourceUrl,
        category,
        chunkIndex
      });

      // Overlap: keep the tail of the current chunk
      const overlapStart = Math.max(0, currentChunk.length - CHUNK_OVERLAP);
      currentChunk = currentChunk.slice(overlapStart) + ' ' + sentence;
      chunkIndex++;
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
    }
  }

  // Flush remaining content
  if (currentChunk.trim()) {
    chunks.push({
      id: `${id}-chunk-${chunkIndex}`,
      documentId: id,
      title,
      content: currentChunk.trim(),
      sourceUrl,
      category,
      chunkIndex
    });
  }

  return chunks;
}

/**
 * Chunk an array of documents.
 *
 * @param {Array<object>} docs
 * @returns {Array<object>}
 */
export function chunkDocuments(docs) {
  return docs.flatMap(chunkDocument);
}

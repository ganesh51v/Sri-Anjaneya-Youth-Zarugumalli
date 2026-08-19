/* global process */

/**
 * rag.js
 * RAG orchestrator: runs semantic search, assembles grounded context for Gemini.
 * Falls back to existing keyword search if semantic search fails or returns nothing.
 */

import { semanticSearch } from './semanticSearch.js';
import { searchKnowledgeBase } from './knowledgeBase.js';

/**
 * Lightweight question router.
 * Returns 'live' for questions about dynamic data (events, announcements, members, expenditure).
 * Returns 'static' for everything else.
 *
 * Deliberately minimal — just detects the most common live-data intents by keyword.
 * Semantic search handles nuance for static content.
 *
 * @param {string} query
 * @returns {'static'|'live'}
 */
function routeQuestion(query) {
  const q = query.toLowerCase();
  const livePatterns = [
    'next event', 'upcoming event', 'latest event', 'recent event',
    'latest announcement', 'recent announcement', 'new announcement',
    'current expenditure', 'latest expenditure', 'recent expense',
    'who are the members', 'list members', 'current members'
  ];
  const isLive = livePatterns.some((p) => q.includes(p));
  return isLive ? 'live' : 'static';
}

/**
 * Build context and sources for a user question.
 *
 * @param {string} query - Cleaned user question
 * @param {string} apiKey - Gemini API key (for embedding generation)
 * @returns {Promise<{ context: string, sources: Array<{title, url}>, usedSemantic: boolean }>}
 */
export async function buildRagContext(query, apiKey) {
  const intent = routeQuestion(query);

  // For live-data questions, return a minimal context that directs user to the right page.
  // Phase 1: no live Firebase queries — just navigation hints.
  if (intent === 'live') {
    const liveContext = buildLiveDataHint(query);
    return {
      context: liveContext,
      sources: [],
      usedSemantic: false
    };
  }

  // For static questions: try semantic search first
  const semanticResults = await semanticSearch(query, apiKey);

  if (semanticResults.length > 0) {
    const context = semanticResults
      .map((r) => `[${r.title}]\n${r.content}`)
      .join('\n\n---\n\n');

    const sources = semanticResults
      .map((r) => ({ title: r.title, url: r.sourceUrl }))
      .filter((s, i, arr) => arr.findIndex((x) => x.url === s.url) === i); // deduplicate by URL

    return { context, sources, usedSemantic: true };
  }

  // Fallback: existing keyword search
  console.log('[rag] Semantic search returned no results — falling back to keyword search');
  const keywordResults = searchKnowledgeBase(query);
  const context = keywordResults.map((r) => r.content).join('\n\n---\n\n');

  return { context, sources: [], usedSemantic: false };
}

/**
 * Build a navigation hint for live-data questions.
 * Directs the user to the correct page instead of guessing live data.
 *
 * @param {string} query
 * @returns {string}
 */
function buildLiveDataHint(query) {
  const q = query.toLowerCase();

  if (q.includes('event')) {
    return 'For the latest upcoming events and schedules, please visit the [Events](/events) page. Event details are updated in real time on that page.';
  }
  if (q.includes('announcement')) {
    return 'For the latest announcements, notices, and volunteer calls, please visit the [Announcements](/announcements) page.';
  }
  if (q.includes('expenditure') || q.includes('expense')) {
    return 'For current expenditure records and financial transparency, please visit the [Expenditure](/expenditure) page.';
  }
  if (q.includes('member')) {
    return 'For the current member directory, please visit the [Members](/members) page.';
  }

  return 'For the most up-to-date information, please browse the relevant page on the website.';
}

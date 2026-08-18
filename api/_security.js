const ALLOWED_ORIGINS = new Set([
  'https://sri-anjaneya-youth-zarugumalli.web.app',
  'https://sri-anjaneya-youth-zarugumalli.firebaseapp.com',
  'https://sri-anjaneya-youth-zarugumalli.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:5174'
]);

const rateLimitStore = new Map();

export function applyCors(req, res, methods = 'POST,OPTIONS') {
  const origin = req.headers?.origin || '';
  if (origin && !ALLOWED_ORIGINS.has(origin)) return false;

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '600');
  return true;
}

export function getClientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  return (forwarded ? String(forwarded).split(',')[0] : req.socket?.remoteAddress || 'unknown').trim();
}

export function checkRateLimit(req, identifier = '', { limit = 10, windowMs = 60_000 } = {}) {
  const key = `${getClientIp(req)}:${String(identifier).trim().toLowerCase()}`;
  const now = Date.now();
  const timestamps = (rateLimitStore.get(key) || []).filter((time) => now - time < windowMs);

  if (timestamps.length >= limit) {
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - timestamps[0])) / 1000));
    return { allowed: false, retryAfter };
  }

  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  return { allowed: true, retryAfter: 0 };
}

export function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

export function cleanText(value, maxLength = 500) {
  const withoutControlCharacters = Array.from(String(value || ''), (character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127 ? ' ' : character;
  }).join('');

  return withoutControlCharacters
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));
}

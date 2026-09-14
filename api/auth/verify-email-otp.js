import crypto from 'crypto';
import { applyCors, checkRateLimit, cleanText, parseBody } from '../_security.js';
import { readOtpToken, invalidateOtpToken } from './_otpStore.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return res.status(403).json({ success: false, error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  const { sessionId, otp } = parseBody(req);
  const cleanSessionId = cleanText(sessionId, 64);
  const cleanOtp = cleanText(otp, 6);
  const rate = checkRateLimit(req, cleanSessionId, { limit: 6, windowMs: 10 * 60_000 });
  if (!rate.allowed) return res.status(429).json({ success: false, error: 'Too many verification attempts.' });

  if (!/^\d{6}$/.test(cleanOtp) || !cleanSessionId) {
    return res.status(400).json({ success: false, error: 'A valid OTP and session are required.' });
  }

  const session = readOtpToken(cleanSessionId);
  if (!session) {
    return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
  }

  // Constant-time comparison to prevent timing attacks
  let matches = false;
  try {
    const expected = Buffer.from(session.code.padEnd(6), 'utf8');
    const provided = Buffer.from(cleanOtp.padEnd(6), 'utf8');
    matches = expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
  } catch { matches = false; }

  if (!matches) return res.status(400).json({ success: false, error: 'Incorrect OTP.' });

  // Invalidate token after successful use to prevent OTP reuse
  invalidateOtpToken(cleanSessionId);

  return res.status(200).json({ success: true, verified: true });
}

import { applyCors, checkRateLimit, cleanText, parseBody } from '../_security.js';
import { readOtpToken } from './_otpStore.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return res.status(403).json({ success: false, error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  const { sessionId, otp } = parseBody(req);
  const cleanSessionId = cleanText(sessionId, 64);
  const cleanOtp = cleanText(otp, 6);
  const rate = checkRateLimit(req, cleanSessionId, { limit: 6, windowMs: 10 * 60_000 });
  if (!rate.allowed) return res.status(429).json({ success: false, error: 'Too many verification attempts.' });

  const session = readOtpToken(cleanSessionId);
  if (!session) {
    return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
  }

  if (session.code !== cleanOtp) return res.status(400).json({ success: false, error: 'Incorrect OTP.' });

  return res.status(200).json({ success: true, verified: true });
}

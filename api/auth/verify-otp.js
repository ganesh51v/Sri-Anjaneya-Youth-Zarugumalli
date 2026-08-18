/* global process */

import { applyCors, checkRateLimit, cleanText, parseBody } from '../_security.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return res.status(403).json({ success: false, error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  const { otp, sessionId } = parseBody(req);
  const cleanOtp = cleanText(otp, 6);
  const cleanSessionId = cleanText(sessionId, 120);

  if (!/^\d{6}$/.test(cleanOtp) || !cleanSessionId) {
    return res.status(400).json({ success: false, error: 'A valid OTP and session are required.' });
  }

  const rate = checkRateLimit(req, cleanSessionId, { limit: 6, windowMs: 10 * 60_000 });
  if (!rate.allowed) {
    res.setHeader('Retry-After', rate.retryAfter);
    return res.status(429).json({ success: false, error: 'Too many verification attempts. Please request a new OTP.' });
  }

  const apiKey = process.env.TWO_FACTOR_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ success: false, error: 'SMS verification is temporarily unavailable.' });
  }

  try {
    const providerUrl = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/VERIFY/${encodeURIComponent(cleanSessionId)}/${cleanOtp}`;
    const providerResponse = await fetch(providerUrl);
    const providerData = await providerResponse.json().catch(() => ({}));

    if (providerData.Status === 'Success' && providerData.Details === 'OTP Matched') {
      return res.status(200).json({ success: true, verified: true, message: 'OTP verified successfully.' });
    }

    return res.status(400).json({ success: false, error: 'Incorrect or expired OTP.' });
  } catch {
    return res.status(502).json({ success: false, error: 'OTP provider is unavailable. Please try again.' });
  }
}

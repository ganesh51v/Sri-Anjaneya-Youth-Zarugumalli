/* global process */

import { applyCors, checkRateLimit, cleanText, parseBody } from '../_security.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return res.status(403).json({ success: false, error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  const { phone } = parseBody(req);
  const cleanDigits = String(phone || '').replace(/\D/g, '');
  const normalizedPhone = cleanDigits.startsWith('91') && cleanDigits.length === 12
    ? cleanDigits.slice(2)
    : cleanDigits.startsWith('0') && cleanDigits.length === 11
      ? cleanDigits.slice(1)
      : cleanDigits;

  if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit Indian mobile number.' });
  }

  const rate = checkRateLimit(req, normalizedPhone, { limit: 3, windowMs: 5 * 60_000 });
  if (!rate.allowed) {
    res.setHeader('Retry-After', rate.retryAfter);
    return res.status(429).json({ success: false, error: 'Too many OTP requests. Please try again later.' });
  }

  const apiKey = process.env.TWO_FACTOR_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ success: false, error: 'SMS verification is temporarily unavailable.' });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const providerUrl = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/${normalizedPhone}/${code}/OTP1`;
    const providerResponse = await fetch(providerUrl, { signal: controller.signal });
    const providerData = await providerResponse.json().catch(() => ({}));

    if (providerData.Status !== 'Success') {
      return res.status(502).json({ success: false, error: 'Unable to send OTP. Please try again.' });
    }

    return res.status(200).json({
      success: true,
      sessionId: cleanText(providerData.Details, 120),
      message: 'OTP sent successfully.'
    });
  } catch {
    return res.status(502).json({ success: false, error: 'SMS provider is unavailable. Please try again.' });
  } finally {
    clearTimeout(timeoutId);
  }
}

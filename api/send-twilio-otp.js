/* global process */

import twilio from 'twilio';
import { applyCors, checkRateLimit, parseBody } from './_security.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return res.status(403).json({ success: false, error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  const { phone, code } = parseBody(req);
  const normalizedPhone = String(phone || '').replace(/\D/g, '');
  if (!/^(?:91)?[6-9]\d{9}$/.test(normalizedPhone)) {
    return res.status(400).json({ success: false, error: 'A valid mobile number is required.' });
  }

  const rate = checkRateLimit(req, normalizedPhone, { limit: 3, windowMs: 5 * 60_000 });
  if (!rate.allowed) {
    res.setHeader('Retry-After', rate.retryAfter);
    return res.status(429).json({ success: false, error: 'Too many OTP requests. Please try again later.' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    return res.status(503).json({ success: false, error: 'SMS delivery is temporarily unavailable.' });
  }

  try {
    const client = apiKeySid ? twilio(apiKeySid, authToken, { accountSid }) : twilio(accountSid, authToken);
    const message = await client.messages.create({
      body: `${String(code || '').slice(0, 6)} is your verification code for Sri Anjaneya Youth. Do not share it.`,
      from: fromPhone,
      to: normalizedPhone.startsWith('91') ? `+${normalizedPhone}` : `+91${normalizedPhone}`
    });

    return res.status(200).json({ success: true, sid: message.sid });
  } catch {
    return res.status(502).json({ success: false, error: 'Unable to deliver SMS. Please try again.' });
  }
}

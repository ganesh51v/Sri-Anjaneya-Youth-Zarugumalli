/* global process Buffer */

import crypto from 'crypto';
import { applyCors, checkRateLimit, cleanText, parseBody } from '../_security.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return res.status(403).json({ success: false, error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  const { orderId, paymentId, signature } = parseBody(req);
  const cleanOrderId = cleanText(orderId, 80);
  const cleanPaymentId = cleanText(paymentId, 80);
  const cleanSignature = cleanText(signature, 128);
  const rate = checkRateLimit(req, cleanOrderId || 'payment-verify', { limit: 10, windowMs: 10 * 60_000 });

  if (!rate.allowed) {
    res.setHeader('Retry-After', rate.retryAfter);
    return res.status(429).json({ success: false, error: 'Too many verification attempts.' });
  }

  if (!cleanOrderId || !cleanPaymentId || !/^[a-f0-9]+$/i.test(cleanSignature)) {
    return res.status(400).json({ success: false, error: 'Incomplete payment verification data.' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return res.status(503).json({ success: false, error: 'Payment verification is temporarily unavailable.' });

  const expected = crypto.createHmac('sha256', keySecret).update(`${cleanOrderId}|${cleanPaymentId}`).digest('hex');
  const matches = expected.length === cleanSignature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(cleanSignature));
  if (!matches) return res.status(400).json({ success: false, error: 'Payment verification failed.' });

  return res.status(200).json({ success: true, verified: true });
}

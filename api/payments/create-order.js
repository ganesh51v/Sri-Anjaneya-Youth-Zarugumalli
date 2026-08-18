/* global process Buffer */

import { applyCors, checkRateLimit, parseBody } from '../_security.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return res.status(403).json({ success: false, error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  const rate = checkRateLimit(req, 'payment-order', { limit: 5, windowMs: 10 * 60_000 });
  if (!rate.allowed) {
    res.setHeader('Retry-After', rate.retryAfter);
    return res.status(429).json({ success: false, error: 'Too many payment attempts. Please try again later.' });
  }

  const { amount } = parseBody(req);
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount < 1 || numericAmount > 200000) {
    return res.status(400).json({ success: false, error: 'Donation amount must be between Rs. 1 and Rs. 2,00,000.' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return res.status(503).json({ success: false, error: 'Online donations are temporarily unavailable.' });
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: Math.round(numericAmount * 100), currency: 'INR', receipt: `seva_${Date.now()}` })
    });
    const order = await response.json().catch(() => ({}));

    if (!response.ok || !order.id) {
      return res.status(502).json({ success: false, error: 'Unable to create a secure payment order.' });
    }

    return res.status(200).json({ success: true, orderId: order.id, amount: order.amount, currency: order.currency, keyId });
  } catch {
    return res.status(502).json({ success: false, error: 'Payment provider is unavailable. Please try again.' });
  }
}

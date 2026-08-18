/* global process */

import crypto from 'crypto';
import { applyCors, checkRateLimit, parseBody } from './_security.js';

const MAX_IMAGE_CHARS = 7 * 1024 * 1024;

export default async function handler(req, res) {
  if (!applyCors(req, res)) return res.status(403).json({ success: false, error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  const rate = checkRateLimit(req, 'upload', { limit: 10, windowMs: 10 * 60_000 });
  if (!rate.allowed) {
    res.setHeader('Retry-After', rate.retryAfter);
    return res.status(429).json({ success: false, error: 'Upload limit reached. Please try again later.' });
  }

  const { file } = parseBody(req);
  if (typeof file !== 'string' || file.length > MAX_IMAGE_CHARS) {
    return res.status(400).json({ success: false, error: 'Image is missing or exceeds the 5 MB limit.' });
  }

  const imageMatch = file.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!imageMatch) {
    return res.status(400).json({ success: false, error: 'Only JPEG, PNG, and WebP images are supported.' });
  }

  let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  let apiKey = process.env.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (process.env.CLOUDINARY_URL && (!cloudName || !apiKey || !apiSecret)) {
    try {
      const parsedUrl = new URL(process.env.CLOUDINARY_URL);
      cloudName = parsedUrl.hostname;
      apiKey = parsedUrl.username;
      apiSecret = parsedUrl.password;
    } catch {
      return res.status(503).json({ success: false, error: 'Image storage is temporarily unavailable.' });
    }
  }

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(503).json({ success: false, error: 'Image storage is temporarily unavailable.' });
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = crypto.createHash('sha1').update(`timestamp=${timestamp}${apiSecret}`).digest('hex');
    const formData = new URLSearchParams({
      file,
      api_key: apiKey,
      timestamp: String(timestamp),
      signature
    });

    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.secure_url) {
      return res.status(502).json({ success: false, error: 'Image upload failed. Please try again.' });
    }

    return res.status(200).json({ success: true, secure_url: data.secure_url, public_id: data.public_id });
  } catch {
    return res.status(502).json({ success: false, error: 'Image upload failed. Please try again.' });
  }
}

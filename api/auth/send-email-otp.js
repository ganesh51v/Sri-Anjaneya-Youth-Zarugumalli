/* global process */

import nodemailer from 'nodemailer';
import { applyCors, checkRateLimit, cleanText, isValidEmail, parseBody } from '../_security.js';
import { createOtpToken } from './_otpStore.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return res.status(403).json({ success: false, error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  const email = cleanText(parseBody(req).email, 254).toLowerCase();
  if (!isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });

  const rate = checkRateLimit(req, email, { limit: 3, windowMs: 10 * 60_000 });
  if (!rate.allowed) {
    res.setHeader('Retry-After', rate.retryAfter);
    return res.status(429).json({ success: false, error: 'Too many OTP requests. Please try again later.' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) return res.status(503).json({ success: false, error: 'Email verification is temporarily unavailable.' });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const sessionId = createOtpToken(email, code, Date.now() + 10 * 60_000);
  if (!sessionId) return res.status(503).json({ success: false, error: 'Email verification is temporarily unavailable.' });

  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: gmailUser, pass: gmailPass } });
    await transporter.sendMail({
      from: `Sri Anjaneya Youth Association <${gmailUser}>`,
      to: email,
      subject: 'Verification code - Sri Anjaneya Youth Association',
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes. Do not share it.</p>`
    });
    return res.status(200).json({ success: true, sessionId });
  } catch {
    return res.status(502).json({ success: false, error: 'Unable to send verification email.' });
  }
}

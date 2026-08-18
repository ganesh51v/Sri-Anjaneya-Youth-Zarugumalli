/* global process Buffer */

import crypto from 'crypto';

const getKey = () => {
  const secret = process.env.OTP_SESSION_SECRET || process.env.GMAIL_APP_PASSWORD;
  return secret ? crypto.createHash('sha256').update(secret).digest() : null;
};

export function createOtpToken(email, code, expiresAt) {
  const key = getKey();
  if (!key) return null;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const payload = Buffer.from(JSON.stringify({ email, code, expiresAt }));
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((value) => value.toString('base64url')).join('.');
}

export function readOtpToken(token) {
  const key = getKey();
  if (!key || typeof token !== 'string') return null;

  try {
    const [ivValue, tagValue, encryptedValue] = token.split('.');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivValue, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, 'base64url')),
      decipher.final()
    ]);
    const session = JSON.parse(decrypted.toString('utf8'));
    return Date.now() <= session.expiresAt ? session : null;
  } catch {
    return null;
  }
}

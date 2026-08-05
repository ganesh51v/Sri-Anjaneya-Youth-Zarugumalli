import twilio from 'twilio';

export default async function handler(req, res) {
  const allowedOrigins = [
    'https://sri-anjaneya-youth-zarugumalli.web.app',
    'https://sri-anjaneya-youth-zarugumalli.firebaseapp.com',
    'https://sri-anjaneya-youth-zarugumalli.vercel.app',
    'http://localhost:5173',
    'http://localhost:4173'
  ];
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { phone, code } = req.body || {};

  if (!phone) {
    return res.status(400).json({ error: 'Recipient phone number is required.' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

  const otpCode = code || '123456';
  const bodyMessage = `Namaste! Your Sri Anjaneya Youth OTP code is: ${otpCode}. Do not share this code with anyone. Jai Hanuman!`;

  if (!accountSid || accountSid.startsWith('AC_your_')) {
    console.warn('[Twilio OTP] TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing or placeholder. Returning mocked SMS dispatch.');
    return res.status(200).json({
      success: true,
      mocked: true,
      code: otpCode,
      message: 'Twilio SMS mocked (add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env for live carrier delivery)'
    });
  }

  try {
    const client = twilio(apiKeySid || accountSid, authToken, { accountSid });
    const message = await client.messages.create({
      body: bodyMessage,
      from: fromPhone,
      to: phone
    });

    console.log('[Twilio SMS Success] Message SID:', message.sid);
    return res.status(200).json({ success: true, sid: message.sid });
  } catch (err) {
    console.error('[Twilio Error]', err);
    return res.status(500).json({ success: false, error: err.message || err });
  }
}

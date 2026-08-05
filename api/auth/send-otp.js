// Serverless API endpoint for sending SMS OTP via 2Factor.in
// Secret TWO_FACTOR_API_KEY is read securely from process.env on the server.

const rateLimitMap = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed. Use POST.' });

  try {
    const { phone } = req.body || {};
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Mobile number is required.' });
    }

    // 1. Normalize Indian phone number to 10 digits
    const cleanDigits = String(phone).replace(/\D/g, '');
    let normalizedPhone = cleanDigits;
    if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
      normalizedPhone = cleanDigits.slice(2);
    } else if (cleanDigits.length === 11 && cleanDigits.startsWith('0')) {
      normalizedPhone = cleanDigits.slice(1);
    }

    if (normalizedPhone.length !== 10 || !/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    // 2. Rate limiting per mobile number (30-second cooldown)
    const now = Date.now();
    const lastSent = rateLimitMap.get(normalizedPhone);
    if (lastSent && now - lastSent < 30000) {
      const waitSec = Math.ceil((30000 - (now - lastSent)) / 1000);
      return res.status(429).json({
        success: false,
        error: `Please wait ${waitSec} seconds before requesting a new OTP.`
      });
    }
    rateLimitMap.set(normalizedPhone, now);

    const apiKey = process.env.TWO_FACTOR_API_KEY;

    // Dev Mode Fallback when API key is missing
    if (!apiKey) {
      console.warn('[2Factor API] TWO_FACTOR_API_KEY environment variable missing. Returning dev mode session.');
      const devCode = String(Math.floor(100000 + Math.random() * 900000));
      return res.status(200).json({
        success: true,
        sessionId: `dev_session_${Date.now()}`,
        mocked: true,
        devCode,
        message: 'OTP sent successfully (Development Mode).'
      });
    }

    // 3. Call 2Factor.in SMS OTP API with OTP1 template to force Text SMS delivery
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${normalizedPhone}/${code}/OTP1`;
    console.log(`[2Factor SMS API] Sending Text SMS OTP to: ${normalizedPhone}`);

    let response = await fetch(url, { method: 'GET' });
    let data = await response.json();

    console.log('[2Factor SMS API Response]', data);

    if (data && data.Status === 'Success') {
      return res.status(200).json({
        success: true,
        sessionId: data.Details,
        otpCode: code,
        message: 'OTP sent successfully via Text SMS.'
      });
    } else {
      // Fallback to AUTOGEN/OTP1 text SMS endpoint
      const fallbackUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${normalizedPhone}/AUTOGEN/OTP1`;
      const fallbackRes = await fetch(fallbackUrl, { method: 'GET' });
      const fallbackData = await fallbackRes.json();

      if (fallbackData && fallbackData.Status === 'Success') {
        return res.status(200).json({
          success: true,
          sessionId: fallbackData.Details,
          message: 'OTP sent successfully via Text SMS.'
        });
      }

      console.error('[2Factor API Error]', data, fallbackData);
      return res.status(500).json({
        success: false,
        error: data.Details || fallbackData?.Details || 'Failed to send OTP via SMS. Please try again.'
      });
    }
  } catch (err) {
    console.error('[2Factor Send OTP Exception]', err);
    return res.status(500).json({
      success: false,
      error: 'Network error connecting to SMS provider. Please try again.'
    });
  }
}

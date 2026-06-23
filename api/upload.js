import crypto from 'crypto';

export default async function handler(req, res) {
  // Set CORS headers for cross-origin requests
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

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { file } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'Missing image file in request body.' });
  }

  // Load Cloudinary credentials
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  let apiKey = process.env.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Try parsing CLOUDINARY_URL if set
  if (process.env.CLOUDINARY_URL && (!cloudName || !apiKey || !apiSecret)) {
    try {
      const urlStr = process.env.CLOUDINARY_URL;
      const parsedUrl = new URL(urlStr);
      cloudName = parsedUrl.hostname;
      apiKey = parsedUrl.username;
      apiSecret = parsedUrl.password;
    } catch (e) {
      console.error('[upload.js] Failed to parse CLOUDINARY_URL:', e.message);
    }
  }

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({
      error: 'Cloudinary configuration is missing on the server.'
    });
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Generate signature
    const signatureString = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    // Build form data payload
    const formData = new URLSearchParams();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    // Post to Cloudinary REST API
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Cloudinary upload failed',
        details: data
      });
    }

    // Return the secure URL back to the client
    return res.status(200).json({
      success: true,
      secure_url: data.secure_url,
      public_id: data.public_id
    });
  } catch (err) {
    console.error('[upload.js] Upload handler crash:', err);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
}

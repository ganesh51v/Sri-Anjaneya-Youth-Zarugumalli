import { Resend } from 'resend';

// Helper to send a welcome email using Resend Node.js SDK
const sendWelcomeEmail = async (user) => {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn('[welcome.js] RESEND_API_KEY environment variable missing. Mocking welcome email.');
    return { success: true, mocked: true };
  }

  const resend = new Resend(resendApiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Sri Anjaneya Youth <onboarding@resend.dev>';

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [user.email],
    subject: '🙏 Welcome to Sri Anjaneya Youth Association, Zarugumalli!',
    idempotencyKey: `welcome-user/${user.id || user.email}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #faf7f0;">
        <!-- Header Ribbon -->
        <div style="height: 6px; background: linear-gradient(to right, #ff7700, #ffc107, #b71c1c); border-top-left-radius: 16px; border-top-right-radius: 16px; margin: -20px -20px 20px -20px;"></div>
        
        <!-- Welcome Title -->
        <h2 style="color: #ff7700; margin-top: 10px; text-align: center; font-size: 24px;">Namaste ${user.name}!</h2>
        <p style="font-size: 15px; color: #334155; line-height: 1.6; text-align: center; font-weight: 600;">
          Jai Anjaneya! We are absolutely thrilled to welcome you to the <strong>Sri Anjaneya Youth Association</strong> of Zarugumalli.
        </p>

        <!-- Message Body -->
        <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e7d7ad; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          <h3 style="color: #b71c1c; margin-top: 0; font-size: 16px; border-b: 1px solid #f1f5f9; padding-bottom: 8px;">Portal Features</h3>
          <ul style="padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.8;">
            <li><strong>Dashboard:</strong> Stay up-to-date with active stats, events, and announcements.</li>
            <li><strong>Members:</strong> View and connect with other association members.</li>
            <li><strong>Events:</strong> Keep track of upcoming seva activities, temple festivals, and youth programs.</li>
            <li><strong>Gallery:</strong> Share photos and browse visual archives of community celebrations.</li>
            <li><strong>Online Donations:</strong> Safely support local seva and temple renovation projects.</li>
          </ul>
        </div>

        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          Your registration has been completed successfully. If you wish to apply for committee membership, you can do so directly from your Profile settings in the portal.
        </p>
        
        <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-top: 24px;">
          Best Regards,<br />
          <strong>Sri Anjaneya Youth Association</strong><br />
          Zarugumalli, Andhra Pradesh, India
        </p>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0 15px 0;" />
        <p style="font-size: 10px; color: #94a3b8; text-align: center; margin: 0;">
          This is an automated welcome notification. Please do not reply directly to this email.
        </p>
      </div>
    `
  });

  if (error) {
    console.error('[welcome.js] Resend error:', error);
    throw new Error(error.message || 'Resend error sending welcome email');
  }

  return { success: true, data };
};

// Helper to send a welcome message (SMS) using process.env.SMS_API_KEY / MESSAGE_API_KEY
const sendWelcomeMessage = async (user) => {
  const apiKey = process.env.SMS_API_KEY || process.env.MESSAGE_API_KEY;
  const phone = user.phone;

  if (!phone || phone.trim() === '') {
    console.warn('[welcome.js] User has no registered phone number. Marking SMS as done to prevent future retries.');
    return { success: true, skipped: true, reason: 'No phone number' };
  }

  if (!apiKey) {
    console.warn('[welcome.js] SMS_API_KEY or MESSAGE_API_KEY is missing. Mocking welcome SMS.');
    return { success: true, mocked: true };
  }

  const message = `Namaste ${user.name}, welcome to Sri Anjaneya Youth Zarugumalli! Your registration is complete. Jai Hanuman!`;

  const url = `https://api.sms-gateway.com/send?apiKey=${apiKey}&to=${encodeURIComponent(phone)}&message=${encodeURIComponent(message)}`;
  
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`SMS Gateway HTTP error! status: ${res.status}`);
  }

  return { success: true };
};

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

  const user = req.body;

  if (!user || !user.email) {
    return res.status(400).json({ error: 'Invalid user payload. Missing email.' });
  }

  let emailSent = false;
  let messageSent = false;
  let errors = {};

  if (user.welcomeEmailSent) {
    console.log('[welcome.js] Welcome email already marked as sent in payload. Skipping email send.');
    emailSent = true;
  } else {
    try {
      const emailRes = await sendWelcomeEmail(user);
      emailSent = emailRes.success;
    } catch (emailErr) {
      console.error('[welcome.js] Error sending welcome email:', emailErr.message);
      errors.email = emailErr.message;
    }
  }

  if (user.welcomeMessageSent) {
    console.log('[welcome.js] Welcome SMS already marked as sent in payload. Skipping SMS send.');
    messageSent = true;
  } else {
    try {
      const smsRes = await sendWelcomeMessage(user);
      messageSent = smsRes.success;
    } catch (smsErr) {
      console.error('[welcome.js] Error sending welcome SMS:', smsErr.message);
      errors.sms = smsErr.message;
    }
  }

  return res.status(200).json({
    success: true,
    emailSent,
    messageSent,
    errors: Object.keys(errors).length > 0 ? errors : null
  });
}

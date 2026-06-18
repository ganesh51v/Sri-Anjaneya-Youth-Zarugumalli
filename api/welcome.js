import nodemailer from 'nodemailer';

// Helper to send a welcome email using SMTP
const sendWelcomeEmail = async (user) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('[welcome.js] EMAIL_USER or EMAIL_PASS environment variables are missing. Mocking welcome email.');
    return { success: true, mocked: true };
  }

  // Set up SMTP transport (e.g. Gmail or custom SMTP server)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for port 465
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: `"Sri Anjaneya Youth Zarugumalli" <${emailUser}>`,
    to: user.email,
    subject: '🙏 Welcome to Sri Anjaneya Youth Association, Zarugumalli!',
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
  };

  await transporter.sendMail(mailOptions);
  return { success: true };
};

// Helper to send a welcome message (SMS) using process.env.SMS_API_KEY / MESSAGE_API_KEY
const sendWelcomeMessage = async (user) => {
  const apiKey = process.env.SMS_API_KEY || process.env.MESSAGE_API_KEY;
  const phone = user.phone;

  if (!phone) {
    console.warn('[welcome.js] User does not have a registered phone number. Skipping welcome SMS.');
    return { success: false, reason: 'No phone number' };
  }

  if (!apiKey) {
    console.warn('[welcome.js] SMS_API_KEY or MESSAGE_API_KEY is missing. Mocking welcome SMS.');
    return { success: true, mocked: true };
  }

  const message = `Namaste ${user.name}, welcome to Sri Anjaneya Youth Zarugumalli! Your registration is complete. Jai Hanuman!`;

  // Example request to a generic SMS API gateway using built-in fetch
  const url = `https://api.sms-gateway.com/send?apiKey=${apiKey}&to=${encodeURIComponent(phone)}&message=${encodeURIComponent(message)}`;
  
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`SMS Gateway HTTP error! status: ${res.status}`);
  }

  return { success: true };
};

export default async function handler(req, res) {
  // Only allow POST requests
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

  // 1. Send Email if not already sent
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

  // 2. Send SMS if not already sent
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

  // Return status response
  return res.status(200).json({
    success: true,
    emailSent,
    messageSent,
    errors: Object.keys(errors).length > 0 ? errors : null
  });
}

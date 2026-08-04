import { Resend } from 'resend';

export default async function handler(req, res) {
  // CORS configuration for cross-origin requests
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

  const { type, to, subject, data: payload, idempotencyKey } = req.body || {};

  if (!to) {
    return res.status(400).json({ error: 'Recipient email address (to) is required.' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn('[send-email] RESEND_API_KEY environment variable missing. Returning mocked success.');
    return res.status(200).json({
      success: true,
      mocked: true,
      data: { id: `mock_${Date.now()}` }
    });
  }

  const resend = new Resend(resendApiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'Sri Anjaneya Youth <onboarding@resend.dev>';

  let emailSubject = subject;
  let htmlContent = '';

  switch (type) {
    case 'welcome': {
      const name = payload?.name || 'Member';
      emailSubject = emailSubject || '🙏 Welcome to Sri Anjaneya Youth Association, Zarugumalli!';
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fdfcf9;">
          <div style="height: 6px; background: linear-gradient(to right, #ff7700, #d4af37, #dc2626); border-top-left-radius: 16px; border-top-right-radius: 16px; margin: -24px -24px 20px -24px;"></div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="background-color: #fff9f2; color: #d96100; border: 1px solid #ffeacc; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
              JAI SRI RAM 🙏 JAI HANUMAN
            </span>
            <h1 style="color: #ff7700; margin-top: 12px; font-size: 24px; font-weight: 800;">Namaste ${name}!</h1>
          </div>

          <p style="font-size: 14px; color: #334155; line-height: 1.6; text-align: center;">
            Welcome to <strong>Sri Anjaneya Youth Association, Zarugumalli</strong>. We are delighted to have you as a registered member of our youth community!
          </p>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #f7f2e4; margin: 24px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
            <h3 style="color: #b71c1c; margin-top: 0; font-size: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Explore Member Features</h3>
            <ul style="padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.8;">
              <li><strong>Events & Seva:</strong> Participate in local temple festivals & community programs.</li>
              <li><strong>Announcements:</strong> Stay informed with real-time updates and notices.</li>
              <li><strong>Gallery:</strong> View photos from past celebrations and programs.</li>
              <li><strong>Donations:</strong> Contribute securely to local temple seva and welfare initiatives.</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #64748b; margin: 0;">
              <strong>Sri Anjaneya Youth Association</strong><br />
              Zarugumalli, Prakasam District, Andhra Pradesh
            </p>
          </div>
        </div>
      `;
      break;
    }

    case 'donation': {
      const donorName = payload?.donorName || 'Generous Donor';
      const amount = payload?.amount || '0';
      const paymentId = payload?.paymentId || 'N/A';
      const purpose = payload?.purpose || 'General Seva Fund';
      const date = payload?.date || new Date().toLocaleDateString('en-IN');

      emailSubject = emailSubject || `🙏 Donation Receipt: ₹${amount} - Sri Anjaneya Youth`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fdfcf9;">
          <div style="height: 6px; background: linear-gradient(to right, #ff7700, #d4af37, #dc2626); border-top-left-radius: 16px; border-top-right-radius: 16px; margin: -24px -24px 20px -24px;"></div>

          <div style="text-align: center; margin-bottom: 20px;">
            <span style="background-color: #fefdf3; color: #ad8b25; border: 1px solid #fbf8d4; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
              Official Donation Receipt
            </span>
            <h1 style="color: #ff7700; margin-top: 12px; font-size: 22px; font-weight: 800;">Thank You for Your Seva, ${donorName}!</h1>
          </div>

          <p style="font-size: 14px; color: #334155; line-height: 1.6; text-align: center;">
            Your contribution plays a vital role in enabling temple festivals, annadanam, and community development in Zarugumalli.
          </p>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #f7f2e4; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;">Donor Name</td>
                <td style="padding: 10px 0; font-weight: bold; text-align: right;">${donorName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;">Amount Paid</td>
                <td style="padding: 10px 0; font-weight: bold; color: #d96100; text-align: right; font-size: 16px;">₹${amount}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;">Purpose</td>
                <td style="padding: 10px 0; font-weight: bold; text-align: right;">${purpose}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;">Transaction ID</td>
                <td style="padding: 10px 0; font-family: monospace; text-align: right;">${paymentId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b;">Date</td>
                <td style="padding: 10px 0; font-weight: bold; text-align: right;">${date}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 12px; color: #475569; text-align: center; line-height: 1.5;">
            May Lord Anjaneya Swamy bless you and your family with health, happiness, and prosperity! 🙏
          </p>

          <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            Sri Anjaneya Youth Association • Zarugumalli
          </div>
        </div>
      `;
      break;
    }

    case 'announcement': {
      const annTitle = payload?.title || 'New Announcement';
      const annMessage = payload?.message || '';
      const dateStr = payload?.date || new Date().toLocaleDateString('en-IN');

      emailSubject = emailSubject || `📢 Announcement: ${annTitle}`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fdfcf9;">
          <div style="height: 6px; background: linear-gradient(to right, #ff7700, #d4af37, #dc2626); border-top-left-radius: 16px; border-top-right-radius: 16px; margin: -24px -24px 20px -24px;"></div>

          <div style="margin-bottom: 20px;">
            <span style="background-color: #fff5f5; color: #dc2626; border: 1px solid #ffe8e8; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
              Community Notice
            </span>
            <h2 style="color: #1e293b; margin-top: 12px; font-size: 20px; font-weight: 800;">${annTitle}</h2>
            <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">Posted on ${dateStr}</span>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #f7f2e4; color: #334155; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${annMessage}</div>

          <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            Sri Anjaneya Youth Association • Zarugumalli
          </div>
        </div>
      `;
      break;
    }

    case 'event': {
      const eventTitle = payload?.title || 'Upcoming Event';
      const eventDate = payload?.date || '';
      const eventTime = payload?.time || '';
      const location = payload?.location || 'Zarugumalli';
      const description = payload?.description || '';

      emailSubject = emailSubject || `📅 Event Notification: ${eventTitle}`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fdfcf9;">
          <div style="height: 6px; background: linear-gradient(to right, #ff7700, #d4af37, #dc2626); border-top-left-radius: 16px; border-top-right-radius: 16px; margin: -24px -24px 20px -24px;"></div>

          <div style="margin-bottom: 20px;">
            <span style="background-color: #fff9f2; color: #ff7700; border: 1px solid #ffeacc; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
              Association Event
            </span>
            <h2 style="color: #1e293b; margin-top: 12px; font-size: 20px; font-weight: 800;">${eventTitle}</h2>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #f7f2e4; margin-bottom: 20px;">
            <p style="font-size: 13px; color: #334155; margin: 6px 0;"><strong>📅 Date:</strong> ${eventDate}</p>
            <p style="font-size: 13px; color: #334155; margin: 6px 0;"><strong>⏰ Time:</strong> ${eventTime}</p>
            <p style="font-size: 13px; color: #334155; margin: 6px 0;"><strong>📍 Location:</strong> ${location}</p>
            ${description ? `<hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 12px 0;" /><p style="font-size: 13px; color: #475569; line-height: 1.6;">${description}</p>` : ''}
          </div>

          <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            Sri Anjaneya Youth Association • Zarugumalli
          </div>
        </div>
      `;
      break;
    }

    case 'otp':
    case 'password_reset': {
      const code = payload?.code || payload?.otp || '123456';
      emailSubject = emailSubject || `🔐 Verification Code: ${code} - Sri Anjaneya Youth`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fdfcf9;">
          <div style="height: 6px; background: linear-gradient(to right, #ff7700, #d4af37, #dc2626); border-top-left-radius: 16px; border-top-right-radius: 16px; margin: -24px -24px 20px -24px;"></div>

          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ff7700; margin-top: 12px; font-size: 20px; font-weight: 800;">Account Verification</h2>
            <p style="font-size: 13px; color: #475569;">Use the verification code below to complete your request:</p>
          </div>

          <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px dashed #d4af37; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #d96100; font-family: monospace;">${code}</span>
          </div>

          <p style="font-size: 12px; color: #64748b; text-align: center;">
            This code will expire in 10 minutes. If you did not request this code, please ignore this email.
          </p>

          <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            Sri Anjaneya Youth Association • Zarugumalli
          </div>
        </div>
      `;
      break;
    }

    default: {
      htmlContent = payload?.html || payload?.text || '<p>Notification from Sri Anjaneya Youth Zarugumalli</p>';
    }
  }

  const sendPayload = {
    from: fromAddress,
    to: Array.isArray(to) ? to : [to],
    subject: emailSubject,
    html: htmlContent || payload?.html || '<p>Notification from Sri Anjaneya Youth Zarugumalli</p>',
  };

  if (idempotencyKey) {
    sendPayload.idempotencyKey = idempotencyKey;
  }

  const { data, error } = await resend.emails.send(sendPayload);

  if (error) {
    console.error('[Resend Error]', error);
    return res.status(500).json({ success: false, error: error.message || error });
  }

  console.log('[Resend Success]', data);
  return res.status(200).json({ success: true, data });
}

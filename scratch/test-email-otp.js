import nodemailer from 'nodemailer';

async function testEmailOtp() {
  console.log('Sending live Email OTP to srianjaneyayouth9@gmail.com...');

  const gmailUser = 'srianjaneyayouth9@gmail.com';
  const gmailPass = 'fmvvbtvfmrvbauce';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  });

  const otpCode = String(Math.floor(100000 + Math.random() * 900000));

  try {
    const info = await transporter.sendMail({
      from: `"Sri Anjaneya Youth Zarugumalli" <${gmailUser}>`,
      to: 'srianjaneyayouth9@gmail.com',
      subject: '🔢 Account Verification Code - Sri Anjaneya Youth',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fdfcf9;">
          <div style="height: 6px; background: linear-gradient(to right, #ff7700, #d4af37, #dc2626); border-top-left-radius: 16px; border-top-right-radius: 16px; margin: -24px -24px 20px -24px;"></div>

          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ff7700; margin-top: 12px; font-size: 20px; font-weight: 800;">Account Verification Code</h2>
            <p style="font-size: 13px; color: #475569;">Use the verification code below to complete your sign-up:</p>
          </div>

          <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px dashed #d4af37; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #d96100; font-family: monospace;">${otpCode}</span>
          </div>

          <p style="font-size: 12px; color: #64748b; text-align: center;">
            This code will expire in 10 minutes. If you did not request this code, please ignore this email.
          </p>

          <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            Sri Anjaneya Youth Association • Zarugumalli
          </div>
        </div>
      `
    });

    console.log('LIVE EMAIL OTP SENT SUCCESS! Message ID:', info.messageId, '| Generated OTP Code:', otpCode);
  } catch (err) {
    console.error('LIVE EMAIL OTP FAILED:', err.message);
  }
}

testEmailOtp();

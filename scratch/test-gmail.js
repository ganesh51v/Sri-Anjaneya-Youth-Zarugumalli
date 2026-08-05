import nodemailer from 'nodemailer';

async function testGmail() {
  console.log('Testing Gmail App Password for srianjaneyayouth9@gmail.com...');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'srianjaneyayouth9@gmail.com',
      pass: 'fmvvbtvfmrvbauce'
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"Sri Anjaneya Youth Zarugumalli" <srianjaneyayouth9@gmail.com>',
      to: 'srianjaneyayouth9@gmail.com',
      subject: '🙏 Test OTP Email: 123456 - Sri Anjaneya Youth',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #ff7700; text-align: center;">Namaste!</h2>
          <p style="text-align: center; color: #475569;">Your test verification code is:</p>
          <div style="text-align: center; padding: 15px; background: #fefdf3; border: 1px dashed #d4af37; border-radius: 8px; font-size: 28px; font-weight: bold; color: #d96100; letter-spacing: 6px;">
            123456
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px;">Sri Anjaneya Youth Association • Zarugumalli</p>
        </div>
      `
    });
    console.log('Gmail Transporter SUCCESS! Message ID:', info.messageId);
  } catch (err) {
    console.error('Gmail Transporter ERROR:', err.message);
  }
}

testGmail();

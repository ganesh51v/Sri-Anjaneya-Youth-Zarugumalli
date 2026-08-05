import nodemailer from 'nodemailer';

async function testMailjet() {
  console.log('Testing Mailjet SMTP...');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'in-v3.mailjet.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER || 'mailjet._2c8de2a2',
      pass: process.env.EMAIL_PASS || '2c8de2a2b5225f81e151279ab375383c'
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"Sri Anjaneya Youth" <srianjaneyayouth9@gmail.com>',
      to: 'srianjaneyayouth9@gmail.com',
      subject: '🔢 Test OTP: 123456 - Sri Anjaneya Youth',
      html: '<div style="font-family:sans-serif;text-align:center;padding:40px"><h2 style="color:#ff7700">Test OTP Code</h2><p style="font-size:32px;font-weight:900;letter-spacing:8px;color:#d96100">123456</p></div>'
    });
    console.log('Mailjet Success! Message ID:', info.messageId);
  } catch (err) {
    console.error('Mailjet Error:', err.message);
  }
}

testMailjet();

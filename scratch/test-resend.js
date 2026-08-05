import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
console.log('Testing Resend with key:', resendApiKey ? `${resendApiKey.slice(0, 8)}...` : 'MISSING');

const resend = new Resend(resendApiKey);

async function testSend() {
  const { data, error } = await resend.emails.send({
    from: 'Sri Anjaneya Youth <onboarding@resend.dev>',
    to: ['delivered@resend.dev'],
    subject: '🙏 Test Email - Sri Anjaneya Youth Association',
    html: '<strong>Resend integration is working successfully!</strong>'
  });

  if (error) {
    console.error('Test Failed:', error);
  } else {
    console.log('Test Succeeded! Email ID:', data.id);
  }
}

testSend();

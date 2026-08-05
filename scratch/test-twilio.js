import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

console.log('--- Testing Updated Twilio SMS Template ---');

async function testTwilioSMS() {
  try {
    const client = apiKeySid 
      ? twilio(apiKeySid, authToken, { accountSid })
      : twilio(accountSid, authToken);

    const otpCode = '123456';
    const bodyMessage = `${otpCode} is your OTP to verify phone number at Sri Anjaneya Youth Zarugumalli. Please do not share OTP with anyone.\n\nthank you\nteam SAYZML`;

    const msg = await client.messages.create({
      body: bodyMessage,
      from: fromPhone,
      to: '+918179963437'
    });
    console.log('\n✅ LIVE Twilio SMS sent successfully!');
    console.log('Message SID:', msg.sid);
    console.log('Status:', msg.status);
  } catch (err) {
    console.error('\nResult:', err.message, '(Code:', err.code, ')');
  }
}

testTwilioSMS();

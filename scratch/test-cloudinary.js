import crypto from 'crypto';

// Test using the original Cloud Name but new API Key and Secret
const cloudName = 'diyuzk0u9';
const apiKey = '715723127867254';
const apiSecret = 'eMHEi8MRHiPKYmUDvyQL6RNVdfA';

const testUpload = async () => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Sort and generate signature string
  const signatureString = `timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureString).digest('hex');
  
  // A tiny 1x1 transparent pixel base64 image to test
  const dummyFile = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  const formData = new URLSearchParams();
  formData.append('file', dummyFile);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);

  console.log('Sending upload request to Cloudinary...');
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const data = await res.json();
    console.log('HTTP Status:', res.status);
    console.log('Response Payload:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error during request:', err);
  }
};

testUpload();

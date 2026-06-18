// Quick test: check if Firebase Auth REST API accepts the API key
// Run with: node scratch/test-auth-api.js

const API_KEY = 'AIzaSyDNbTAhOCXjZpnAFtTjF7pSBCBpvhC0RwE';

const testSignIn = async () => {
  console.log('\n🔑 Testing Firebase Auth REST API...\n');
  
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@srianjaneya.org',
          password: 'admin123',
          returnSecureToken: true
        })
      }
    );
    
    const data = await res.json();
    console.log(`HTTP Status: ${res.status}`);
    
    if (res.ok) {
      console.log('✅ SUCCESS! Firebase Auth is working correctly.');
      console.log(`   User: ${data.email}`);
      console.log(`   UID:  ${data.localId}`);
    } else {
      console.log('❌ FAILED. Firebase returned an error:');
      console.log(`   Code:    ${data.error?.code}`);
      console.log(`   Message: ${data.error?.message}`);
      console.log(`   Status:  ${data.error?.status}`);
      console.log('\n📋 Full error response:', JSON.stringify(data.error, null, 2));
      
      // Explain the error
      const msg = data.error?.message;
      if (msg === 'API_KEY_INVALID' || res.status === 401) {
        console.log('\n🔧 FIX NEEDED: Identity Toolkit API is disabled in Google Cloud Console.');
        console.log('   Go to: https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=sri-anjaneya-youth-zarugumalli');
        console.log('   Click the ENABLE button.');
      } else if (msg === 'INVALID_LOGIN_CREDENTIALS' || msg?.includes('EMAIL_NOT_FOUND')) {
        console.log('\n✅ Good news: API key works! The error is just wrong credentials.');
      } else if (msg === 'OPERATION_NOT_ALLOWED') {
        console.log('\n🔧 FIX NEEDED: Email/Password is disabled in Firebase Console.');
      }
    }
  } catch (err) {
    console.log('❌ Network error:', err.message);
  }
};

testSignIn();

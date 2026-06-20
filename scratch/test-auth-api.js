import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file without external dependencies
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
}

const API_KEY = process.env.VITE_FIREBASE_API_KEY || '';

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

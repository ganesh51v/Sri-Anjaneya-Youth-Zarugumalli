import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const createUser = async (email, password) => {
  try {
    console.log(`Creating Auth user: ${email}...`);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log(`Auth user created successfully! UID: ${cred.user.uid}`);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`User ${email} already exists in Firebase Auth.`);
    } else {
      console.error(`Error creating user ${email}:`, error.message);
    }
  }
};

const main = async () => {
  await createUser('admin@srianjaneya.org', 'admin123');
  await createUser('member@srianjaneya.org', 'member123');
  process.exit(0);
};

main();

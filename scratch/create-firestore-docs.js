import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
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
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const writeUserDoc = async (email, password, userData) => {
  try {
    console.log(`Authenticating as ${email}...`);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    console.log(`Successfully authenticated! UID: ${uid}`);

    console.log(`Writing Firestore doc for UID: ${uid}...`);
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...userData,
      uid,
      id: uid,
      createdAt: new Date().toISOString()
    });
    console.log(`Successfully wrote Firestore document for ${email}!`);
  } catch (error) {
    console.error(`Error with ${email}:`, error.message);
  }
};

const main = async () => {
  await writeUserDoc('admin@srianjaneya.org', 'admin123', {
    name: 'Ganesh Nalamalapu',
    email: 'admin@srianjaneya.org',
    role: 'admin',
    village: 'Zarugumalli'
  });

  await writeUserDoc('member@srianjaneya.org', 'member123', {
    name: 'Youth Member',
    email: 'member@srianjaneya.org',
    role: 'user',
    village: 'Zarugumalli'
  });

  process.exit(0);
};

main();

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updatePassword,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  getDoc,
  query,
  orderBy
} from 'firebase/firestore';

// Helper: detect common offline / network-failure error codes
const isOfflineError = (err) => {
  if (!err) return false;
  const code = err?.code || '';
  const msg  = err?.message || '';
  return (
    code === 'unavailable' ||
    code === 'failed-precondition' ||
    code === 'auth/network-request-failed' ||
    msg.includes('client is offline') ||
    msg.includes('Failed to get document because the client is offline') ||
    msg.includes('ERR_INTERNET_DISCONNECTED') ||
    msg.includes('network error')
  );
};

// Helper: safe JSON.parse — returns fallback if localStorage value is corrupted
const safeParseLS = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    console.warn(`[safeParseLS] Corrupt localStorage key "${key}" — resetting.`);
    localStorage.removeItem(key);
    return fallback;
  }
};

// Helper: wrap any Firestore async op with offline-aware error handling
const firestoreOp = async (op, offlineFallback = null, label = '') => {
  try {
    return await op();
  } catch (err) {
    if (isOfflineError(err)) {
      console.warn(`[Firestore] Offline${label ? ' (' + label + ')' : ''} — using fallback.`);
      if (offlineFallback !== null) return offlineFallback;
    }
    throw err;
  }
};

// Initial Mock Seed Data
const initialMembers = [
  { id: 'm1', name: 'Nalamalapu Ganesh', role: 'President / Founder', phone: '+91 94949 94949', area: 'Main Street, Zarugumalli', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'm2', name: 'Kalyan Kumar', role: 'Secretary', phone: '+91 83838 83838', area: 'Ramalayam Street, Zarugumalli', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: 'm3', name: 'Ravi Teja', role: 'Treasurer', phone: '+91 76767 76767', area: 'Ganesh Temple Street, Zarugumalli', photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
  { id: 'm4', name: 'Siva Prasad', role: 'Youth Coordinator', phone: '+91 91919 91919', area: 'Bypass Road, Zarugumalli', photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150' },
  { id: 'm5', name: 'Anil Kumar', role: 'Seva Representative', phone: '+91 95959 95959', area: 'Bazar Center, Zarugumalli', photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' }
];

const initialEvents = [
  { id: 'e1', title: 'Sri Hanuman Jayanthi Celebrations & Annadanam', date: '2026-06-25', time: '08:00 AM', location: 'Sri Anjaneya Swamy Temple, Zarugumalli', description: 'Grand Abhishekam, devotional bhajans, and massive Annadanam (free meals distribution) for all villagers.', status: 'upcoming' },
  { id: 'e2', title: 'Village Tree Plantation Drive (Green Zarugumalli)', date: '2026-06-20', time: '07:00 AM', location: 'ZP High School Ground & Lake Side Road', description: 'Aiming to plant 200+ saplings to create a greener environment for our village.', status: 'upcoming' },
  { id: 'e3', title: 'Sri Rama Navami Shobha Yatra & Panakam Distribution', date: '2026-04-18', time: '04:00 PM', location: 'Ramalayam Center, Zarugumalli', description: 'Celebrated Ram Navami with spiritual Shobha Yatra around the village and distributed cool Panakam/Vadapappu.', status: 'completed' },
  { id: 'e4', title: 'Free Medical Camp & Blood Donation Drive', date: '2026-03-12', time: '09:00 AM', location: 'Panchayat Office Hall, Zarugumalli', description: 'Collaborated with RIMS Hospital to organize a free check-up and blood donation, serving 150+ villagers.', status: 'completed' }
];

const initialAnnouncements = [
  { id: 'a1', title: 'Sri Hanuman Jayanthi Volunteer Signups Open', message: 'All youth members are requested to gather at the temple premises on Friday evening (6:00 PM) to plan the duties for Hanuman Jayanthi Annadanam.', createdAt: '2026-06-14T18:30:00.000Z' },
  { id: 'a2', title: 'General Body Meeting - Agenda: Seva Activities', message: 'We are organizing our monthly youth meet this Sunday morning at 10:00 AM in the Panchayat library hall. Attendance is mandatory for all registered members.', createdAt: '2026-06-10T12:00:00.000Z' },
  { id: 'a3', title: 'Heartfelt Thanks to All Blood Donors', message: 'The blood donation camp was a massive success! We collected 62 units of blood. Thank you to everyone who stepped forward to save lives.', createdAt: '2026-03-13T09:00:00.000Z' }
];

const initialGallery = [];

const initialUsers = [
  { id: 'u1', name: 'Ganesh Nalamalapu', email: 'admin@srianjaneya.org', phone: '+91 94949 94949', role: 'admin', village: 'Zarugumalli', password: 'admin123', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'u2', name: 'Youth Member', email: 'member@srianjaneya.org', phone: '+91 88888 88888', role: 'user', village: 'Zarugumalli', password: 'member123', createdAt: '2026-01-05T00:00:00.000Z' }
];

const initialDonations = [];

// Firebase Web Config from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId;

let app, auth, db;
if (isFirebaseConfigured) {
  try {
    const isNewApp = getApps().length === 0;
    app = isNewApp ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    // Enable Firestore offline persistence — but only on fresh init.
    // On HMR hot reloads, the app already exists so we use getFirestore()
    // to avoid "initializeFirestore() has already been called" errors.
    if (isNewApp) {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } else {
      // HMR hot-reload: Firestore already initialized, just retrieve existing instance
      db = getFirestore(app);
    }

    // Initialize App Check to satisfy Firebase enforcement
    // On localhost: use debug token so development works without reCAPTCHA
    // On production: use reCAPTCHA v3 Enterprise
    if (typeof window !== 'undefined') {
      const isDev = import.meta.env.DEV ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      if (isDev) {
        // Allow App Check debug mode on localhost
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        auth.settings.appVerificationDisabledForTesting = true;
        console.log('[Firebase] Phone auth test mode enabled (reCAPTCHA bypassed for localhost).');
      }

      // Firebase App Check is temporarily disabled to prevent reCAPTCHA token exchange errors
      // from blocking user authentication. If you wish to enforce App Check in the future,
      // uncomment this block and register your reCAPTCHA v3 key in the Firebase Console.
      /*
      const reCaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
      if (reCaptchaKey) {
        try {
          initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(reCaptchaKey),
            isTokenAutoRefreshEnabled: true
          });
          console.log('[Firebase] App Check initialized with reCAPTCHA v3.');
        } catch (appCheckErr) {
          // App Check may already be initialized on HMR reload — safe to ignore
          if (!appCheckErr.message?.includes('already')) {
            console.warn('[Firebase] App Check init warning:', appCheckErr.message);
          }
        }
      } else if (!isDev) {
        console.warn('[Firebase] VITE_RECAPTCHA_SITE_KEY not set — App Check disabled. Auth may fail if App Check is enforced.');
      }
      */
    }

    console.log('Firebase initialized successfully with offline persistence.');
  } catch (error) {
    console.error('Firebase initialization failed, falling back to Mock storage:', error);
    // Reset so downstream `isFirebaseConfigured && auth/db` guards work as true fallback
    app = auth = db = null;
  }
}

// -------------------------------------------------------------
// LOCALSTORAGE MOCK CONTROLLER (Used if Firebase is not connected)
// -------------------------------------------------------------
const initMockDB = () => {
  if (!localStorage.getItem('sa_members')) localStorage.setItem('sa_members', JSON.stringify(initialMembers));
  if (!localStorage.getItem('sa_events')) localStorage.setItem('sa_events', JSON.stringify(initialEvents));
  if (!localStorage.getItem('sa_announcements')) localStorage.setItem('sa_announcements', JSON.stringify(initialAnnouncements));
  const existingDonations = localStorage.getItem('sa_donations');
  if (existingDonations && (existingDonations.includes('pay_mock_123456789') || existingDonations.includes('"d1"'))) {
    localStorage.setItem('sa_donations', JSON.stringify([]));
  } else if (!existingDonations) {
    localStorage.setItem('sa_donations', JSON.stringify([]));
  }
  
  // Overwrite if it doesn't contain category attribute or contains default seeded items
  const existingGallery = localStorage.getItem('sa_gallery');
  if (existingGallery && (existingGallery.includes('"g1"') || existingGallery.includes('"g2"'))) {
    localStorage.setItem('sa_gallery', JSON.stringify(initialGallery));
  } else if (!existingGallery || !existingGallery.includes('"category"')) {
    localStorage.setItem('sa_gallery', JSON.stringify(initialGallery));
  }
  
  // Overwrite users if they don't contain password attribute
  const existingUsers = localStorage.getItem('sa_users');
  if (!existingUsers || !existingUsers.includes('"password"')) {
    localStorage.setItem('sa_users', JSON.stringify(initialUsers));
  }
};

initMockDB();

// Simulated Auth State Listeners
let authListeners = [];
let currentUserMock = (() => {
  try {
    const stored = localStorage.getItem('sa_current_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('sa_current_user');
    return null;
  }
})();

const triggerAuthChange = (user) => {
  currentUserMock = user;
  if (user) {
    localStorage.setItem('sa_current_user', JSON.stringify({
      ...user,
      sessionCreatedAt: Date.now()
    }));
  } else {
    localStorage.removeItem('sa_current_user');
  }
  authListeners.forEach(listener => listener(user));
};

// Simple helper to hash mock password using SHA-256 (Web Crypto API)
const hashPassword = async (password) => {
  if (!password) return '';
  try {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    return password;
  }
};

// Rate limiting helper for mock mode
const checkMockRateLimit = (email) => {
  const attempts = safeParseLS('sa_login_attempts', {});
  const record = attempts[email.toLowerCase()];
  if (record && record.lockUntil && Date.now() < record.lockUntil) {
    const remainingSec = Math.ceil((record.lockUntil - Date.now()) / 1000);
    throw new Error(`Too many failed login attempts. This account is temporarily locked. Please try again in ${remainingSec} seconds.`);
  }
};

const recordMockLoginAttempt = (email, success) => {
  const attempts = safeParseLS('sa_login_attempts', {});
  const key = email.toLowerCase();
  if (success) {
    delete attempts[key];
  } else {
    const record = attempts[key] || { count: 0, lockUntil: 0 };
    record.count += 1;
    if (record.count >= 5) {
      record.lockUntil = Date.now() + 5 * 60 * 1000; // Lock for 5 minutes
      record.count = 0; // Reset
    }
    attempts[key] = record;
  }
  localStorage.setItem('sa_login_attempts', JSON.stringify(attempts));
};

// Normalize user shape: always include both `id` and `uid` so Firebase + mock paths are consistent
const normalizeUser = (uid, extra = {}) => {
  // Capture emailVerified from Firebase if available
  const currentUser = auth?.currentUser;
  const emailVerified = (currentUser && currentUser.uid === uid) 
    ? currentUser.emailVerified 
    : (extra && extra.emailVerified !== undefined ? extra.emailVerified : false);

  return {
    id: uid,
    uid,
    phone: '',
    village: '',
    photoUrl: '',
    committeeStatus: 'none',
    welcomeEmailSent: false,
    welcomeMessageSent: false,
    emailVerified,
    ...extra,
  };
};

// Trigger welcome email/message API asynchronously on registration
const triggerWelcomeNotifications = async (userData) => {
  if (!isFirebaseConfigured || !db) {
    console.log('[Welcome API] Offline/Mock mode active. Skipping remote welcome notifications.');
    return;
  }

  // Bug 7 fix: guard against missing uid
  if (!userData || !userData.uid) {
    console.warn('[Welcome API] No uid in userData. Skipping.');
    return;
  }

  // Bug 1/2 fix: only fire for very recently created accounts (within 120 seconds)
  // This prevents onAuthStateChanged from re-triggering for existing users
  if (userData.createdAt) {
    const ageMs = Date.now() - new Date(userData.createdAt).getTime();
    if (ageMs > 120000) {
      console.log('[Welcome API] Account is older than 2 minutes — not a new registration. Skipping welcome dispatch.');
      return;
    }
  }

  try {
    // Bug 6 fix: Only do the Firestore read if flags are uncertain (e.g. from onAuthStateChanged path)
    // If called directly from signUp/signInWithGoogle, trust the fresh userData directly
    const userRef = doc(db, 'users', userData.uid);
    if (userData.welcomeEmailSent && userData.welcomeMessageSent) {
      console.log('[Welcome API] Both flags already true in userData. Skipping.');
      return;
    }

    // Check real-time Firestore state to prevent race conditions
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const dbData = userDoc.data();
      if (dbData.welcomeEmailSent && dbData.welcomeMessageSent) {
        console.log('[Welcome API] Welcome notifications already fully sent according to Firestore. Skipping.');
        return;
      }
    }

    const apiBase = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
      ? ''
      : 'https://sri-anjaneya-youth-zarugumalli.vercel.app';

    console.log('[Welcome API] Dispatching welcome notifications for:', userData.email);
    const res = await fetch(`${apiBase}/api/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (res.ok) {
      const result = await res.json();
      console.log('[Welcome API] Success response:', result);
      
      const updates = {};
      if (result.emailSent) updates.welcomeEmailSent = true;
      if (result.messageSent) updates.welcomeMessageSent = true;

      if (Object.keys(updates).length > 0) {
        await setDoc(userRef, updates, { merge: true });
        console.log('[Welcome API] Updated Firestore document with dispatch results:', updates);
      }
    } else {
      console.warn('[Welcome API] Service returned non-ok status:', res.status);
    }
  } catch (err) {
    console.error('[Welcome API] Error sending welcome notifications:', err.message);
  }
};

// -------------------------------------------------------------
// ADAPTER EXPORTS (AUTH & DB)
// -------------------------------------------------------------

export const authService = {
  get isMock() { return !(isFirebaseConfigured && db && auth); },

  signIn: async (email, password) => {
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        // Fetch user role from Firestore (may use cache if offline)
        try {
          const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
          if (userDoc.exists()) {
            return normalizeUser(cred.user.uid, userDoc.data());
          } else {
            const defaultData = normalizeUser(cred.user.uid, {
              email: cred.user.email || '',
              name: cred.user.displayName || cred.user.email || 'Bhaktha',
              phone: cred.user.phoneNumber || '',
              village: 'Zarugumalli',
              role: cred.user.email === 'admin@srianjaneya.org' ? 'admin' : 'user',
              committeeStatus: 'none',
              createdAt: new Date().toISOString()
            });
            try {
              await setDoc(doc(db, 'users', cred.user.uid), defaultData);
              console.log('[signIn] Created missing Firestore profile document for UID:', cred.user.uid);
            } catch (writeErr) {
              console.warn('[signIn] Failed to write missing profile document:', writeErr);
            }
            return defaultData;
          }
        } catch (firestoreErr) {
          console.warn('[Firestore] Failed to retrieve user role document:', firestoreErr);
        }
        return normalizeUser(cred.user.uid, { email: cred.user.email, role: cred.user.email === 'admin@srianjaneya.org' ? 'admin' : 'user' });
      } catch (authErr) {
        if (isOfflineError(authErr)) {
          throw new Error('No internet connection. Please check your network and try again.');
        }
        throw authErr;
      }
    } else {
      // Mock sign in
      checkMockRateLimit(email);
      const users = safeParseLS('sa_users');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        recordMockLoginAttempt(email, false);
        throw new Error('User not found in local mock database.');
      }
      
      const inputHash = await hashPassword(password);
      
      if (user.password) {
        // Support both legacy plain text and hashed passwords for mock mode
        const isMatch = (password === user.password) || (inputHash === user.password);
        if (!isMatch) {
          recordMockLoginAttempt(email, false);
          throw new Error('Invalid password credentials.');
        }
        
        // Auto-upgrade plain text to SHA-256 hash in storage
        if (password === user.password && password !== inputHash) {
          user.password = inputHash;
          localStorage.setItem('sa_users', JSON.stringify(users));
        }
      } else {
        const expectedPassword = user.email.split('@')[0] + '123';
        if (password !== expectedPassword && password !== 'admin123' && password !== 'member123') {
          recordMockLoginAttempt(email, false);
          throw new Error("Invalid credentials. For mock accounts, use: '" + user.email.split('@')[0] + "123' or 'admin123'/'member123'");
        }
        
        // Auto-initialize legacy accounts with hashed default password
        user.password = await hashPassword(password);
        localStorage.setItem('sa_users', JSON.stringify(users));
      }
      
      recordMockLoginAttempt(email, true);
      triggerAuthChange(user);
      return user;
    }
  },

  signUp: async (name, email, phone, village, password) => {
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        
        // Send email verification link
        try {
          await sendEmailVerification(cred.user);
          console.log('[signUp] Email verification link sent to:', email);
        } catch (verifyErr) {
          console.warn('[signUp] Failed to send email verification link:', verifyErr.message);
        }

        const userData = normalizeUser(cred.user.uid, {
          name, email, phone, village,
          role: 'user',
          photoUrl: '',
          committeeStatus: 'none',
          createdAt: new Date().toISOString()
        });
        try {
          await setDoc(doc(db, 'users', cred.user.uid), userData);
          triggerWelcomeNotifications(userData).catch(e => console.error('[Welcome API] Email Signup trigger failed:', e));
        } catch (fsErr) {
          if (!isOfflineError(fsErr)) throw fsErr;
          console.warn('[signUp] Offline — Firestore profile will sync when reconnected.');
        }
        return userData;
      } catch (err) {
        if (isOfflineError(err)) throw new Error('No internet connection. Sign up requires internet.');
        throw err;
      }
    } else {
      // Mock Sign Up
      const users = safeParseLS('sa_users');
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email address already registered.');
      }
      const hashedPassword = await hashPassword(password);
      const newUser = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        name, email, phone, village,
        role: 'user',
        photoUrl: '',
        committeeStatus: 'none',
        password: hashedPassword,
        emailVerified: true, // Auto-verified in mock mode
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('sa_users', JSON.stringify(users));
      triggerAuthChange(newUser);
      return newUser;
    }
  },

  signInWithGoogle: async () => {
    if (isFirebaseConfigured && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        
        // Check if user exists in Firestore
        const userRef = doc(db, 'users', cred.user.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            return { uid: cred.user.uid, ...userDoc.data() };
          } else {
            const userData = normalizeUser(cred.user.uid, {
              name: cred.user.displayName || 'Google User',
              email: cred.user.email,
              phone: cred.user.phoneNumber || '',
              village: 'Zarugumalli',
              role: 'user',
              createdAt: new Date().toISOString()
            });
            try { 
              await setDoc(userRef, userData); 
              triggerWelcomeNotifications(userData).catch(e => console.error('[Welcome API] Google Signup trigger failed:', e));
            } catch (e) {
              if (!isOfflineError(e)) throw e;
              console.warn('[Firestore] Offline — user profile not saved yet, will sync when back online.');
            }
            return userData;
          }
        } catch (firestoreErr) {
          if (isOfflineError(firestoreErr)) {
            console.warn('[Firestore] Offline — returning Google profile without Firestore lookup.');
            return normalizeUser(cred.user.uid, {
              name: cred.user.displayName || 'Google User',
              email: cred.user.email,
              role: 'user',
              _offlineMode: true
            });
          }
          throw firestoreErr;
        }
      } catch (authErr) {
        if (isOfflineError(authErr)) {
          throw new Error('No internet connection. Google Sign-In requires internet access.');
        }
        throw authErr;
      }
    } else {
      // Mock Google sign in
      const users = JSON.parse(localStorage.getItem('sa_users') || '[]');
      let googleUser = users.find(u => u.email === 'google_user@gmail.com');
      if (!googleUser) {
        googleUser = {
          id: 'u_google',
          name: 'Anjaneya Bhaktha (Google)',
          email: 'google_user@gmail.com',
          phone: '+91 90000 12345',
          village: 'Zarugumalli',
          role: 'user',
          createdAt: new Date().toISOString()
        };
        users.push(googleUser);
        localStorage.setItem('sa_users', JSON.stringify(users));
      }
      triggerAuthChange(googleUser);
      return googleUser;
    }
  },

  signOut: async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error('[signOut] Failed:', err.message);
        throw err;
      }
    } else {
      triggerAuthChange(null);
    }
  },

  resetPassword: async (email) => {
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (err) {
        if (err.code === 'auth/user-not-found') throw new Error('No account found with this email address.');
        if (isOfflineError(err)) throw new Error('No internet connection. Please try again when online.');
        throw err;
      }
    } else {
      const users = safeParseLS('sa_users');
      if (!users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('No user found with this email in local mock database.');
      }
      return true;
    }
  },

  changePassword: async (newPassword) => {
    if (isFirebaseConfigured && auth && auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPassword);
      } catch (err) {
        if (err.code === 'auth/requires-recent-login') {
          throw new Error('Please sign out and sign in again before changing your password.');
        }
        if (isOfflineError(err)) throw new Error('No internet connection. Please try again when online.');
        throw err;
      }
    } else {
      const current = safeParseLS('sa_current_user', null);
      if (!current) throw new Error('No active mock user session.');
      const users = safeParseLS('sa_users');
      const index = users.findIndex(u => u.id === current.id);
      if (index > -1) {
        users[index].password = newPassword;
        localStorage.setItem('sa_users', JSON.stringify(users));
        current.password = newPassword;
        localStorage.setItem('sa_current_user', JSON.stringify(current));
      } else {
        throw new Error('Mock account not found in list.');
      }
    }
  },

  sendVerificationEmail: async () => {
    if (isFirebaseConfigured && auth && auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        console.log('[sendVerificationEmail] Sent verification email link.');
      } catch (err) {
        if (isOfflineError(err)) throw new Error('No internet connection. Please try again when online.');
        throw err;
      }
    } else {
      console.log('[Mock Auth] Mock email verification link sent.');
      return true;
    }
  },

  onAuthStateChanged: (callback) => {
    if (isFirebaseConfigured && auth) {
      return firebaseOnAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              callback(normalizeUser(user.uid, userDoc.data()));
            } else {
              const defaultData = normalizeUser(user.uid, {
                email: user.email || '',
                name: user.displayName || user.email || 'Bhaktha',
                phone: user.phoneNumber || '',
                village: 'Zarugumalli',
                role: user.email === 'admin@srianjaneya.org' ? 'admin' : 'user',
                committeeStatus: 'none',
                createdAt: new Date().toISOString()
              });
              try {
                await setDoc(doc(db, 'users', user.uid), defaultData);
                console.log('[onAuthStateChanged] Created missing Firestore profile document for UID:', user.uid);
                // Bug 1/2 fix: Only trigger welcome for accounts created within the last 2 minutes
                // This prevents re-triggering on existing users whose Firestore doc was somehow missing
                const ageMs = Date.now() - new Date(defaultData.createdAt).getTime();
                if (ageMs < 120000) {
                  triggerWelcomeNotifications(defaultData).catch(e => console.error('[Welcome API] Auth State trigger failed:', e));
                } else {
                  console.log('[Welcome API] Existing account detected (>2 min old). Skipping welcome dispatch from onAuthStateChanged.');
                }
              } catch (writeErr) {
                console.warn('[onAuthStateChanged] Failed to write missing profile document:', writeErr);
              }
              callback(defaultData);
            }
          } catch (err) {
            if (isOfflineError(err)) {
              console.warn('[Firestore] Offline — using basic auth profile from token cache.');
              callback(normalizeUser(user.uid, {
                email: user.email,
                name: user.displayName || user.email,
                role: user.email === 'admin@srianjaneya.org' ? 'admin' : 'user',
                _offlineMode: true
              }));
            } else {
              console.error('[onAuthStateChanged] Firestore error:', err);
              callback(normalizeUser(user.uid, { email: user.email, role: user.email === 'admin@srianjaneya.org' ? 'admin' : 'user' }));
            }
          }
        } else {
          callback(null);
        }
      });
    } else {
      // For mock mode: check session expiry (e.g. 1 hour = 3600000 ms)
      const current = safeParseLS('sa_current_user', null);
      if (current && current.sessionCreatedAt) {
        const sessionAge = Date.now() - current.sessionCreatedAt;
        if (sessionAge > 3600000) {
          console.warn('[Mock Auth] Session expired after 1 hour.');
          localStorage.removeItem('sa_current_user');
          currentUserMock = null;
        }
      }
      authListeners.push(callback);
      callback(currentUserMock);
      return () => {
        authListeners = authListeners.filter(listener => listener !== callback);
      };
    }
  },

  getCurrentUser: () => {
    if (isFirebaseConfigured && auth) {
      return auth.currentUser;
    }
    return currentUserMock;
  },

  setupRecaptcha: (containerId) => {
    if (isFirebaseConfigured && auth) {
      // In test mode (localhost), appVerificationDisabledForTesting is already set,
      // so we still create a RecaptchaVerifier but it auto-resolves without network.
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          // Ignore clear errors
        }
        window.recaptchaVerifier = null;
      }
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {}
        });
      } catch (e) {
        console.warn('[reCAPTCHA] Could not initialize verifier:', e.message);
      }
      return window.recaptchaVerifier;
    }
    return null;
  },

  sendOtp: async (phoneNumber, appVerifier) => {
    if (isFirebaseConfigured && auth) {
      try {
        // When appVerificationDisabledForTesting=true the SDK accepts a null verifier
        const verifier = appVerifier || window.recaptchaVerifier || null;
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
        window.confirmationResult = confirmationResult;
        return confirmationResult;
      } catch (err) {
        // If reCAPTCHA fails (e.g. offline), surface a clear message
        if (err.code === 'auth/network-request-failed') {
          throw new Error('No internet connection. Please connect to the internet and try again.');
        }
        throw err;
      }
    } else {
      console.log(`[Mock Send OTP] Sending code 123456 to ${phoneNumber}`);
      return {
        confirm: async (otp) => {
          if (otp === '123456') {
            const mockUser = {
              id: 'u_phone_mock',
              name: 'Bhaktha (' + phoneNumber + ')',
              email: phoneNumber.replace(/[^0-9]/g, '') + '@phone.com',
              phone: phoneNumber,
              role: 'user',
              createdAt: new Date().toISOString()
            };
            
            // Register user in mock users list if not already there
            const users = JSON.parse(localStorage.getItem('sa_users') || '[]');
            let existingUser = users.find(u => u.phone === phoneNumber);
            if (!existingUser) {
              existingUser = mockUser;
              users.push(mockUser);
              localStorage.setItem('sa_users', JSON.stringify(users));
            }
            
            triggerAuthChange(existingUser);
            return { user: existingUser };
          } else {
            throw new Error('Invalid OTP code. For mock testing, use: 123456');
          }
        }
      };
    }
  }
};

export const dbService = {
  // ---------------- MEMBERS COLLECTION ----------------
  members: {
    getAll: async () => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(
          () => getDocs(collection(db, 'members')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
          safeParseLS('sa_members'), 'members.getAll'
        );
      }
      return safeParseLS('sa_members');
    },
    add: async (memberData) => {
      const { id: _drop, ...cleanData } = memberData; // strip caller-supplied id
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          const docRef = await addDoc(collection(db, 'members'), cleanData);
          return { id: docRef.id, ...cleanData };
        }, null, 'members.add');
      }
      const members = safeParseLS('sa_members');
      const newMember = { id: 'm_' + Math.random().toString(36).substr(2, 9), ...cleanData };
      members.push(newMember);
      localStorage.setItem('sa_members', JSON.stringify(members));
      return newMember;
    },
    update: async (id, memberData) => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          await updateDoc(doc(db, 'members', id), memberData);
          return { id, ...memberData };
        }, null, 'members.update');
      }
      const members = safeParseLS('sa_members');
      const index = members.findIndex(m => m.id === id);
      if (index > -1) {
        members[index] = { ...members[index], ...memberData };
        localStorage.setItem('sa_members', JSON.stringify(members));
        return members[index];
      }
      throw new Error('Member not found');
    },
    delete: async (id) => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(() => deleteDoc(doc(db, 'members', id)).then(() => id), null, 'members.delete');
      }
      let members = safeParseLS('sa_members');
      members = members.filter(m => m.id !== id);
      localStorage.setItem('sa_members', JSON.stringify(members));
      return id;
    }
  },

  // ---------------- EVENTS COLLECTION ----------------
  events: {
    getAll: async () => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(
          () => getDocs(collection(db, 'events')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
          safeParseLS('sa_events', []), 'events.getAll'
        );
      }
      return safeParseLS('sa_events', []);
    },
    add: async (eventData) => {
      const { id: _drop, ...cleanData } = eventData;
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          const docRef = await addDoc(collection(db, 'events'), cleanData);
          return { id: docRef.id, ...cleanData };
        }, null, 'events.add');
      }
      const events = safeParseLS('sa_events', []);
      const newEvent = { id: 'e_' + Math.random().toString(36).substr(2, 9), ...cleanData };
      events.push(newEvent);
      localStorage.setItem('sa_events', JSON.stringify(events));
      return newEvent;
    },
    update: async (id, eventData) => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          await updateDoc(doc(db, 'events', id), eventData);
          return { id, ...eventData };
        }, null, 'events.update');
      }
      const events = safeParseLS('sa_events', []);
      const index = events.findIndex(e => e.id === id);
      if (index > -1) {
        events[index] = { ...events[index], ...eventData };
        localStorage.setItem('sa_events', JSON.stringify(events));
        return events[index];
      }
      throw new Error('Event not found');
    },
    delete: async (id) => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(() => deleteDoc(doc(db, 'events', id)).then(() => id), null, 'events.delete');
      }
      let events = safeParseLS('sa_events', []);
      events = events.filter(e => e.id !== id);
      localStorage.setItem('sa_events', JSON.stringify(events));
      return id;
    }
  },

  // ---------------- ANNOUNCEMENTS COLLECTION ----------------
  announcements: {
    getAll: async () => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
          const s = await getDocs(q);
          return s.docs.map(d => ({ id: d.id, ...d.data() }));
        }, safeParseLS('sa_announcements', []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        'announcements.getAll');
      }
      const announcements = safeParseLS('sa_announcements', []);
      return announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    add: async (announcementData) => {
      const { id: _drop, ...rest } = announcementData;
      const data = { ...rest, createdAt: new Date().toISOString() };
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          const docRef = await addDoc(collection(db, 'announcements'), data);
          return { id: docRef.id, ...data };
        }, null, 'announcements.add');
      }
      const announcements = safeParseLS('sa_announcements', []);
      const newAnnouncement = { id: 'a_' + Math.random().toString(36).substr(2, 9), ...data };
      announcements.push(newAnnouncement);
      localStorage.setItem('sa_announcements', JSON.stringify(announcements));
      return newAnnouncement;
    },
    delete: async (id) => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(() => deleteDoc(doc(db, 'announcements', id)).then(() => id), null, 'announcements.delete');
      }
      let announcements = safeParseLS('sa_announcements', []);
      announcements = announcements.filter(a => a.id !== id);
      localStorage.setItem('sa_announcements', JSON.stringify(announcements));
      return id;
    }
  },

  // ---------------- GALLERY COLLECTION ----------------
  gallery: {
    getAll: async () => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          const q = query(collection(db, 'gallery'), orderBy('uploadedAt', 'desc'));
          const s = await getDocs(q);
          return s.docs.map(d => ({ id: d.id, ...d.data() }));
        }, safeParseLS('sa_gallery', []).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)),
        'gallery.getAll');
      }
      const gallery = safeParseLS('sa_gallery', []);
      return gallery.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    },
    add: async (galleryData) => {
      const { id: _drop, ...rest } = galleryData;
      const data = { ...rest, uploadedAt: new Date().toISOString() };
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          const docRef = await addDoc(collection(db, 'gallery'), data);
          return { id: docRef.id, ...data };
        }, null, 'gallery.add');
      }
      const gallery = safeParseLS('sa_gallery', []);
      const newGalleryItem = { id: 'g_' + Math.random().toString(36).substr(2, 9), ...data };
      gallery.push(newGalleryItem);
      localStorage.setItem('sa_gallery', JSON.stringify(gallery));
      return newGalleryItem;
    },
    delete: async (id) => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(() => deleteDoc(doc(db, 'gallery', id)).then(() => id), null, 'gallery.delete');
      }
      let gallery = safeParseLS('sa_gallery', []);
      gallery = gallery.filter(g => g.id !== id);
      localStorage.setItem('sa_gallery', JSON.stringify(gallery));
      return id;
    }
  },

  // ---------------- REGISTRATION USERS LIST (Admin View) ----------------
  users: {
    getAll: async () => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(
          () => getDocs(collection(db, 'users')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
          safeParseLS('sa_users', []), 'users.getAll'
        );
      }
      return safeParseLS('sa_users', []);
    },
    updateRole: async (id, newRole) => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          await setDoc(doc(db, 'users', id), { role: newRole }, { merge: true });
          return { id, role: newRole };
        }, null, 'users.updateRole');
      }
      const users = safeParseLS('sa_users', []);
      const index = users.findIndex(u => u.id === id);
      if (index > -1) {
        users[index].role = newRole;
        localStorage.setItem('sa_users', JSON.stringify(users));
        const current = safeParseLS('sa_current_user', null);
        if (current && current.id === id) {
          current.role = newRole;
          localStorage.setItem('sa_current_user', JSON.stringify(current));
          triggerAuthChange(current);
        }
        return users[index];
      }
      throw new Error('User not found');
    },
    updateDetails: async (id, details) => {
      const { name, phone, village, photoUrl } = details;
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          await setDoc(doc(db, 'users', id), { name, phone, village, photoUrl: photoUrl || '' }, { merge: true });
          return { id, name, phone, village, photoUrl };
        }, null, 'users.updateDetails');
      }
      const users = safeParseLS('sa_users', []);
      const index = users.findIndex(u => u.id === id);
      if (index > -1) {
        users[index] = { ...users[index], name, phone, village, photoUrl };
        localStorage.setItem('sa_users', JSON.stringify(users));
        const current = safeParseLS('sa_current_user', null);
        if (current && current.id === id) {
          const updatedCurrent = { ...current, name, phone, village, photoUrl };
          localStorage.setItem('sa_current_user', JSON.stringify(updatedCurrent));
          triggerAuthChange(updatedCurrent);
        }
        return users[index];
      }
      throw new Error('User not found');
    },
    updateCommitteeStatus: async (id, status) => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          await setDoc(doc(db, 'users', id), { committeeStatus: status }, { merge: true });
          return { id, committeeStatus: status };
        }, null, 'users.updateCommitteeStatus');
      }
      const users = safeParseLS('sa_users', []);
      const index = users.findIndex(u => u.id === id);
      if (index > -1) {
        users[index].committeeStatus = status;
        localStorage.setItem('sa_users', JSON.stringify(users));
        const current = safeParseLS('sa_current_user', null);
        if (current && current.id === id) {
          current.committeeStatus = status;
          localStorage.setItem('sa_current_user', JSON.stringify(current));
          triggerAuthChange(current);
        }
        return users[index];
      }
      throw new Error('User not found');
    },
    delete: async (id) => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(() => deleteDoc(doc(db, 'users', id)).then(() => id), null, 'users.delete');
      }
      let users = safeParseLS('sa_users', []);
      users = users.filter(u => u.id !== id);
      localStorage.setItem('sa_users', JSON.stringify(users));
      return id;
    }
  },

  // ---------------- DONATIONS COLLECTION ----------------
  donations: {
    getAll: async () => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(
          () => getDocs(collection(db, 'donations')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
          safeParseLS('sa_donations', []), 'donations.getAll'
        );
      }
      return safeParseLS('sa_donations', []);
    },
    add: async (donationData) => {
      const { id: _drop, ...rest } = donationData;
      const data = { ...rest, createdAt: donationData.createdAt || new Date().toISOString() };
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          const docRef = await addDoc(collection(db, 'donations'), data);
          return { id: docRef.id, ...data };
        }, null, 'donations.add');
      }
      const donations = safeParseLS('sa_donations', []);
      const newDonation = { id: 'd_' + Math.random().toString(36).substr(2, 9), ...data };
      donations.push(newDonation);
      localStorage.setItem('sa_donations', JSON.stringify(donations));
      return newDonation;
    }
  },

  // ---------------- EXPENDITURES COLLECTION ----------------
  expenditures: {
    getAll: async () => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          // No orderBy here — avoids needing a Firestore composite index.
          // Client-side sort by date descending is applied below.
          const s = await getDocs(collection(db, 'expenditures'));
          const docs = s.docs.map(d => ({ id: d.id, ...d.data() }));
          return docs.sort((a, b) => new Date(b.date) - new Date(a.date));
        }, safeParseLS('sa_expenditures', []).sort((a, b) => new Date(b.date) - new Date(a.date)),
        'expenditures.getAll');
      }
      const exp = safeParseLS('sa_expenditures', []);
      return exp.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    add: async (expenditureData) => {
      const { id: _drop, ...rest } = expenditureData;
      const data = { ...rest, createdAt: new Date().toISOString() };
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          const docRef = await addDoc(collection(db, 'expenditures'), data);
          return { id: docRef.id, ...data };
        }, null, 'expenditures.add');
      }
      const expenditures = safeParseLS('sa_expenditures', []);
      const newExpenditure = { id: 'ex_' + Math.random().toString(36).substr(2, 9), ...data };
      expenditures.push(newExpenditure);
      localStorage.setItem('sa_expenditures', JSON.stringify(expenditures));
      return newExpenditure;
    },
    update: async (id, expenditureData) => {
      const { id: _drop, ...rest } = expenditureData;
      if (isFirebaseConfigured && db) {
        return firestoreOp(async () => {
          await updateDoc(doc(db, 'expenditures', id), rest);
          return { id, ...rest };
        }, null, 'expenditures.update');
      }
      const expenditures = safeParseLS('sa_expenditures', []);
      const index = expenditures.findIndex(e => e.id === id);
      if (index > -1) {
        expenditures[index] = { ...expenditures[index], ...rest };
        localStorage.setItem('sa_expenditures', JSON.stringify(expenditures));
        return expenditures[index];
      }
      throw new Error('Expenditure not found');
    },
    delete: async (id) => {
      if (isFirebaseConfigured && db) {
        return firestoreOp(() => deleteDoc(doc(db, 'expenditures', id)).then(() => id), null, 'expenditures.delete');
      }
      let expenditures = safeParseLS('sa_expenditures', []);
      expenditures = expenditures.filter(e => e.id !== id);
      localStorage.setItem('sa_expenditures', JSON.stringify(expenditures));
      return id;
    }
  }
};

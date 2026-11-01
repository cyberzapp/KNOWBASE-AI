import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your-api-key'
);

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let functions: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);

    // Support optional local emulators in development
    if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      const host = import.meta.env.VITE_EMULATOR_HOST || 'localhost';
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
      connectFirestoreEmulator(db, host, 8080);
      connectStorageEmulator(storage, host, 9199);
      connectFunctionsEmulator(functions, host, 5001);
      console.log('Connected to Firebase Emulators on host:', host);
    }
  } catch (err) {
    console.warn('Firebase initialization warning:', err);
  }
}

export { app, auth, db, storage, functions, firebaseConfig };


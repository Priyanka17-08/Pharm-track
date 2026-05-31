import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import fallbackConfig from '../firebase-applet-config.json';

const isCustomProject = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
};

const databaseId = isCustomProject 
  ? (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)')
  : (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (fallbackConfig as any).firestoreDatabaseId);

const app = initializeApp(firebaseConfig);
export const dbFirebase = getFirestore(app, databaseId);
export const auth = getAuth();

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDOV2zFeLGtPsE_O2b-gR3NHZygPspiSws",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "med-peptides-app-27a3a.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "med-peptides-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "med-peptides-app.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "514143707883",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:514143707883:web:6c12470433ef6c992714ae"
};

let app;
let firestoreDb;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  firestoreDb = getFirestore(app);
} else {
  app = getApp();
  firestoreDb = getFirestore(app);
}

export const auth = getAuth(app);
export const db = firestoreDb;
export const functions = getFunctions(app, 'europe-west3');
export const storage = getStorage(app);

// Mock analytics for server-side
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { ref, uploadBytes, getDownloadURL };
export default app;

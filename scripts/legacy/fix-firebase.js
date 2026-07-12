import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, signOut, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDOV2zFeLGtPsE_O2b-gR3NHZygPspiSws",
  authDomain: "med-peptides-app-27a3a.firebaseapp.com",
  projectId: "med-peptides-app",
  storageBucket: "med-peptides-app.firebasestorage.app",
  messagingSenderId: "514143707883",
  appId: "1:514143707883:web:6c12470433ef6c992714ae",
  measurementId: "G-LYMXGY71FJ"
};

// Next.js: Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Exports - we initialize them only if we are in the browser!
// On the server, we export null/dummy objects to avoid Firebase errors.
const isBrowser = typeof window !== 'undefined';

const auth = isBrowser ? getAuth(app) : null;
const db = isBrowser ? initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
}) : null;
const storage = isBrowser ? getStorage(app) : null;
const functions = isBrowser ? getFunctions(app, "us-central1") : null;
const analytics = isBrowser ? getAnalytics(app) : null;

if (isBrowser) {
  setPersistence(auth, browserLocalPersistence).catch(console.warn);
}

export { app, auth, db, storage, functions, analytics, ref, uploadBytes, getDownloadURL };
export default app;

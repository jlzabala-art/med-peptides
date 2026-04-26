import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// PROYECTO FIREBASE OFICIAL: med-peptides-app  (med-peptides.com)
// ─────────────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: "AIzaSyDOV2zFeLGtPsE_O2b-gR3NHZygPspiSws",
  authDomain: "med-peptides-app-27a3a.firebaseapp.com",
  projectId: "med-peptides-app",
  storageBucket: "med-peptides-app.firebasestorage.app",
  messagingSenderId: "514143707883",
  appId: "1:514143707883:web:6c12470433ef6c992714ae",
  measurementId: "G-LYMXGY71FJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// persistentLocalCache: modern offline persistence (replaces deprecated experimentalForceLongPolling).
// persistentMultipleTabManager: allows multiple tabs to share the same Firestore connection.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
export default app;

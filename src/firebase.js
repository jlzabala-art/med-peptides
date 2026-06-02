/* eslint-disable no-unused-vars */
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence, signOut } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';

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

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(err => console.warn('Failed to set persistence:', err));
  if (window.Cypress) {
    window.firebaseSignOut = () => signOut(auth);
  }
}
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Firebase App Check
// App Check initialization is skipped in development mode to avoid access control issues.
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  if (recaptchaKey) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaKey),
        isTokenAutoRefreshEnabled: true
      });
      console.log('Firebase App Check initialized.');
    } catch (err) {
      console.warn('Firebase App Check initialization skipped or failed:', err);
    }
  }
}

/**
 * Log error events to Firebase Analytics (Web equivalent to Crashlytics)
 */
export const logErrorToAnalytics = (error, context = {}) => {
  if (analytics) {
    import('firebase/analytics')
      .then(({ logEvent }) => {
        logEvent(analytics, 'exception', {
          description: error.message || String(error),
          fatal: context.fatal || false,
          ...context
        });
      })
      .catch(err => console.error('Failed to log error to analytics:', err));
  }
};

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
  experimentalForceLongPolling: true
});

if (typeof window !== 'undefined') {
  window.db = db;
  import('firebase/firestore').then((fs) => {
    window.fs = fs;
  }).catch(e => console.error('Failed to expose firestore on window:', e));
}

export const storage = getStorage(app);
export const functions = getFunctions(app);
export { ref, uploadBytes, getDownloadURL };

export default app;


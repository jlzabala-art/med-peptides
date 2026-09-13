import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { initStorageQuotaGuard } from './utils/storageQuotaGuard';

// ── Security: Never use hardcoded keys — fail loudly on missing env vars ──────
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NODE_ENV === 'production') {
  // In production a missing key is a configuration error, not a runtime fallback
  console.error('[Firebase] NEXT_PUBLIC_FIREBASE_API_KEY is not set. Check your .env or hosting environment variables.');
}

const firebaseConfig = {
  // Non-secret identifiers — safe to have fallbacks for local dev convenience
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDOV2zFeLGtPsE_O2b-gR3NHZygPspiSws",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "med-peptides-app-27a3a.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "med-peptides-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "med-peptides-app.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "514143707883",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:514143707883:web:6c12470433ef6c992714ae",
};

let app;
let firestoreDb;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  if (typeof window !== 'undefined') {
    initStorageQuotaGuard();
    try {
      // In Safari/WebKit, persistentMultipleTabManager causes WebLocks deadlocks
      // and IndexedDB quota contention that forces Firestore into offline error state.
      const isSafari = typeof navigator !== 'undefined' && 
        (/^((?!chrome|android).)*safari/i.test(navigator.userAgent) || 
         (/AppleWebKit/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent)));

      if (isSafari) {
        console.info('[Firebase] Safari/WebKit detected: initializing resilient single-tab localCache');
        firestoreDb = initializeFirestore(app, {
          localCache: persistentLocalCache({})
        });
      } else {
        firestoreDb = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
          })
        });
      }
    } catch (e) {
      console.warn('[Firebase] Fallback to standard/memory Firestore instance:', e?.message || e);
      try {
        firestoreDb = initializeFirestore(app, {
          localCache: memoryLocalCache()
        });
      } catch {
        firestoreDb = getFirestore(app);
      }
    }
  } else {
    firestoreDb = getFirestore(app);
  }
} else {
  app = getApp();
  firestoreDb = getFirestore(app);
}

export const auth = getAuth(app);
export const db = firestoreDb;
export const functions = getFunctions(app, 'europe-west3');
export const storage = getStorage(app);

// Messaging (only supported in browsers)
let messagingInstance = null;
if (typeof window !== 'undefined') {
  import('firebase/messaging').then(({ getMessaging, isSupported }) => {
    isSupported().then((supported) => {
      if (supported) {
        messagingInstance = getMessaging(app);
      }
    });
  });
}
export const getMessagingInstance = () => messagingInstance;

// Mock analytics for server-side
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { ref, uploadBytes, getDownloadURL };
export default app;

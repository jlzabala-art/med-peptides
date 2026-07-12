import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

  // Use service account from env vars (local dev + production)
  if (privateKey && clientEmail && projectId) {
    try {
      return initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } catch (err) {
      console.error('Firebase Admin: service account init failed:', err.message);
    }
  }

  // Fallback: Application Default Credentials (Cloud Run / GCP environments)
  try {
    return initializeApp({
      credential: applicationDefault(),
      projectId,
    });
  } catch (err) {
    console.warn('⚠️ Firebase Admin: ADC also failed. Admin SDK disabled.', err.message);
    return null;
  }
}

const adminApp = initializeFirebaseAdmin();
const dbAdmin = adminApp ? getFirestore(adminApp) : null;

export { admin, dbAdmin, dbAdmin as adminDb };


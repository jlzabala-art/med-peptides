import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function run() {
  const doc = await db.collection('protocols').doc('wm_005').get();
  if (doc.exists) {
    const data = doc.data();
    console.log('active:', data.active);
  } else {
    console.log('wm_005 does not exist!');
  }
}

run().catch(console.error);

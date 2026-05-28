import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function run() {
  const doc = await db.collection('protocols').doc('cog_001').get();
  if (doc.exists) {
    const data = doc.data();
    console.log('clinical_timeline:', JSON.stringify(data.clinical_timeline, null, 2));
    console.log('phases:', JSON.stringify(data.phases, null, 2));
  } else {
    console.log('cog_001 does not exist!');
  }
}

run().catch(console.error);

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function run() {
  const doc = await db.collection('protocols').doc('wm_003').get();
  if (doc.exists) {
    const data = doc.data();
    console.log('Doc ID: wm_003');
    console.log('active:', data.active);
    console.log('protocol_title:', data.protocol_title);
    console.log('primary_goal:', data.primary_goal);
    console.log('metadata.primary_goal:', data.metadata?.primary_goal);
    console.log('overview_summary:', data.overview_summary);
  } else {
    console.log('wm_003 does not exist!');
  }
}

run().catch(console.error);

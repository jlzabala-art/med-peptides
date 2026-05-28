import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function run() {
  console.log('Fetching all protocols...');
  const snap = await db.collection('protocols').get();
  snap.forEach(d => {
    const data = d.data();
    console.log(`Doc: ${d.id} | primary_goal: ${data.primary_goal} | meta_goal: ${data.metadata?.primary_goal}`);
  });
}

run().catch(console.error);

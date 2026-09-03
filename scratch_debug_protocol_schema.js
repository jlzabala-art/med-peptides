import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf-8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function check() {
  const q = await db.collection('protocols').limit(1).get();
  if (!q.empty) {
    const data = q.docs[0].data();
    console.log("Protocol Phases:", JSON.stringify(data.phases, null, 2));
  }
}
check();

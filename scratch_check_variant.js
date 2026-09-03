import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const adminDb = getFirestore();

async function run() {
  const snap = await adminDb.collectionGroup('variants').limit(5).get();
  snap.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}
run();

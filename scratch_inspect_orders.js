import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function inspect() {
  const oSnap = await db.collection('orders').limit(1).get();
  if (!oSnap.empty) {
    console.log('Order:', JSON.stringify(oSnap.docs[0].data(), null, 2));
  }
  
  const pSnap = await db.collection('prescriptions').limit(1).get();
  if (!pSnap.empty) {
    console.log('Prescription:', JSON.stringify(pSnap.docs[0].data(), null, 2));
  }
}
inspect().catch(console.error);

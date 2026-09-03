import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf-8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function check() {
  const q = await db.collection('products').where('name', '==', 'AOD-9604').get();
  const canon = q.docs[0];
  const vQ = await db.collection('products').doc(canon.id).collection('variants').get();
  vQ.docs.forEach(d => console.log('Variant:', d.id, 'isActive:', d.data().isActive, 'dosage:', d.data().dosage));
}
check();

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf-8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function check() {
  const q = await db.collection('products').where('name', '==', 'AOD-9604').get();
  const canonId = q.docs[0].id;
  
  const vQ = await db.collection('products').doc(canonId).collection('variants').get();
  console.log("Unordered variants length:", vQ.docs.length);
}
check();

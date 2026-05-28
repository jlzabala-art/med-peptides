import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const pSnap = await db.collection('products').where('isActive', '==', true).get();
  
  const suppliers = {};
  pSnap.forEach(doc => {
    const data = doc.data();
    const sup = data.supplier || 'unknown';
    suppliers[sup] = (suppliers[sup] || 0) + 1;
  });
  
  console.log('Active products by supplier:', suppliers);
}

run().then(() => process.exit(0));

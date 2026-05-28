import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const activeNplab = await db.collection('products').where('supplier', '==', 'NPLAB').where('isActive', '==', true).get();
  console.log(`Active NPLAB products: ${activeNplab.size}`);
  
  const allNplab = await db.collection('products').where('supplier', '==', 'NPLAB').get();
  console.log(`All NPLAB products: ${allNplab.size}`);
  
  if (activeNplab.size > 0) {
    activeNplab.forEach(d => {
      console.log(`- ${d.id}: ${d.data().name}`);
    });
  }
}

run().then(() => process.exit(0));

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const pSnap = await db.collection('products').get();
  pSnap.forEach(doc => {
    const data = doc.data();
    const name = (data.name || '').toLowerCase();
    const id = doc.id.toLowerCase();
    if (name.includes('bpc') || name.includes('tb-500') || id.includes('bpc') || id.includes('tb-500')) {
      console.log(`Product ID: ${doc.id} | Name: ${data.name} | Supplier: ${data.supplier} | isActive: ${data.isActive}`);
    }
  });
}

run().then(() => process.exit(0));

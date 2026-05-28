import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Mock getCatalog behavior or run it
const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function checkCatalog() {
  const pSnap = await db.collection('products').get();
  console.log(`Found ${pSnap.size} products in Firestore.`);
  
  let totalWithSubVariants = 0;
  let totalWithoutSubVariants = 0;
  
  for (const doc of pSnap.docs) {
    const data = doc.data();
    const vSnap = await doc.ref.collection('variants').get();
    if (vSnap.size > 0) {
      totalWithSubVariants++;
    } else {
      totalWithoutSubVariants++;
      console.log(`Product ${doc.id} (${data.name}) has 0 subcollection variants. Has flat variants?`, !!data.variants, 'Supplier:', data.supplier);
    }
  }
  
  console.log(`\nSummary:\nWith subcollection variants: ${totalWithSubVariants}\nWithout subcollection variants: ${totalWithoutSubVariants}`);
}

checkCatalog().then(() => process.exit(0));

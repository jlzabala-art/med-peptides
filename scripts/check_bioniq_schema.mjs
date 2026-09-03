import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
});

const app = initializeApp({ credential });
const db = getFirestore(app);

async function check() {
  // Get one Lotusland product to see schema
  const snap = await db.collection('products')
    .where('supplierId', '==', 'OLlBbQjgrj6tY7GmM2Jo')
    .limit(1)
    .get();

  if (!snap.empty) {
    console.log('=== LOTUSLAND PRODUCT SCHEMA ===');
    console.log(JSON.stringify(snap.docs[0].data(), null, 2));
  } else {
    // Fallback: just get any product
    const anySnap = await db.collection('products').limit(1).get();
    if (!anySnap.empty) {
      console.log('=== SAMPLE PRODUCT SCHEMA ===');
      console.log(JSON.stringify(anySnap.docs[0].data(), null, 2));
    }
  }

  // Get all suppliers
  console.log('\n=== ALL SUPPLIERS ===');
  const suppSnap = await db.collection('suppliers').get();
  suppSnap.forEach(d => {
    const data = d.data();
    console.log(`${d.id}: ${data.name} (${data.status || 'no-status'})`);
  });

  // Check if Bioniq supplier already exists
  const bioniqSnap = await db.collection('suppliers')
    .where('name', '==', 'Bioniq')
    .get();
  console.log('\n=== BIONIQ SUPPLIER EXISTS? ===', !bioniqSnap.empty);
  if (!bioniqSnap.empty) {
    console.log(bioniqSnap.docs[0].id, bioniqSnap.docs[0].data());
  }
}

check().catch(console.error);

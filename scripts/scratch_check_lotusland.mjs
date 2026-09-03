import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

let credential;
credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
});

if (!initializeApp.apps?.length) {
  initializeApp({ credential });
}

const db = getFirestore();

async function run() {
  const snap = await db.collection('products').get();
  
  let lotusLandCount = 0;
  snap.forEach(doc => {
    const data = doc.data();
    if (data.supplier === 'LotusLand' || data.brand === 'Lotusland' || data.brand === 'LotusLand') {
      lotusLandCount++;
      console.log(doc.id, data.name, data.supplier, data.brand);
    }
  });
  console.log("Total LotusLand products:", lotusLandCount);
}

run().catch(console.error);

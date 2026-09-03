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
  const snap = await db.collection('products')
    .where('supplier', '==', 'LotusLand')
    .get();
  
  if (snap.empty) {
    const snap2 = await db.collection('products')
      .where('brand', '==', 'Lotusland')
      .get();
    console.log("Found by brand:", snap2.size);
    snap2.docs.slice(0, 5).forEach(doc => {
      console.log(doc.id, doc.data().name);
    });
  } else {
    console.log("Found by supplier:", snap.size);
    snap.docs.slice(0, 5).forEach(doc => {
      console.log(doc.id, doc.data().name);
    });
  }
}

run().catch(console.error);

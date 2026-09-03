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
  
  const suppliers = new Set();
  const brands = new Set();
  snap.forEach(doc => {
    const data = doc.data();
    if (data.supplier) suppliers.add(data.supplier);
    if (data.brand) brands.add(data.brand);
  });
  console.log("Suppliers:", Array.from(suppliers));
  console.log("Brands:", Array.from(brands));
}

run().catch(console.error);

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

if (!initializeApp.apps?.length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}
const db = getFirestore();

async function run() {
  const productsSnap = await db.collection('products').get();
  const categories = new Set();
  productsSnap.forEach(doc => {
    const data = doc.data();
    if (data.category) categories.add(data.category);
  });
  console.log("Categories:", Array.from(categories));
}
run().catch(console.error);

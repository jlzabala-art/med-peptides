import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function explore() {
  const products = await db.collection('products').limit(1).get();
  console.log("Product:", products.docs[0]?.data());
  
  const suppliers = await db.collection('suppliers').limit(1).get();
  console.log("Supplier:", suppliers.docs[0]?.data());
}

explore().catch(console.error);

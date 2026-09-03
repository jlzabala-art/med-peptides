import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
try {
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {}
const adminDb = getFirestore();

async function run() {
  const products = await adminDb.collection('products').limit(1).get();
  products.forEach(doc => {
    console.log('--- PRODUCT ---');
    console.log(doc.id, doc.data());
  });

  const variants = await adminDb.collectionGroup('variants').limit(1).get();
  variants.forEach(doc => {
    console.log('--- VARIANT ---');
    console.log(doc.ref.parent.parent.id, '->', doc.id, doc.data());
  });
}
run();

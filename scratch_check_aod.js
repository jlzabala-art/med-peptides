import { adminDb } from './src/lib/firebaseAdmin.js';

async function check() {
  const doc = await adminDb.collection('products').doc('aod-9604').get();
  console.log(JSON.stringify(doc.data(), null, 2));
}

check().catch(console.error);

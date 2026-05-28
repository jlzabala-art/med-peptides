import { db } from '../scripts/lib/firebase-admin.mjs';

async function check() {
  const doc = await db.collection('products').doc('ashwagandha').get();
  if (!doc.exists) {
    console.log('Document not found in products collection');
    return;
  }
  console.log(JSON.stringify(doc.data(), null, 2));
}

check().catch(console.error);

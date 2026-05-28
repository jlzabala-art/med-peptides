import { db } from '../scripts/lib/firebase-admin.mjs';

async function check() {
  const doc = await db.collection('supplements').doc('ashwagandha').get();
  if (!doc.exists) {
    console.log('Document not found');
    return;
  }
  console.log(JSON.stringify(doc.data(), null, 2));
}

check().catch(console.error);

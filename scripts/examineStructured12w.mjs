import { db } from './lib/firebase-admin.mjs';

async function examineDoc() {
  const docRef = db.collection('protocols').doc('weight-management-structured-12w');
  const snap = await docRef.get();
  if (snap.exists) {
    console.log('=== weight-management-structured-12w details ===');
    console.log(`Title: ${snap.data().protocol_title}`);
    console.log(`Slug field: "${snap.data().protocol_slug}"`);
    console.log(`ID field: "${snap.data().protocol_id}"`);
  } else {
    console.log('weight-management-structured-12w NOT found.');
  }
}

examineDoc().catch(console.error);

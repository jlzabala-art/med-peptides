import { adminDb } from '../src/lib/firebaseAdmin.js';

async function check() {
  const q = await adminDb.collection('protocols').where('protocol_name', '==', 'BPC-157 & TB-500 Ultimate Tissue Recovery').get();
  if (q.empty) {
    console.log('Not found by exact name, getting first protocol...');
    const snapshot = await adminDb.collection('protocols').limit(1).get();
    const doc = snapshot.docs[0].data();
    console.log(JSON.stringify(doc, null, 2));
  } else {
    console.log(JSON.stringify(q.docs[0].data(), null, 2));
  }
}
check();

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccount-target.json');

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  const q = await db.collection('protocols').where('protocol_name', '==', 'BPC-157 & TB-500 Ultimate Tissue Recovery').get();
  if (q.empty) { console.log('Not found'); return; }
  const p = q.docs[0].data();
  console.log(JSON.stringify(p.phases, null, 2));
}
run();

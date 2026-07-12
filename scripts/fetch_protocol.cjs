const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccount-target.json');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

async function run() {
  const snapshot = await db.collection('protocols').where('protocol_name', '==', 'BPC-157 & TB-500 Ultimate Tissue Recovery').get();
  
  if (snapshot.empty) {
    console.log('Protocol not found.');
    return;
  }
  
  const doc = snapshot.docs[0];
  console.log('ID:', doc.id);
  console.log('Current Data:', JSON.stringify(doc.data(), null, 2));
}

run();

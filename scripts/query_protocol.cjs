const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccount-target.json');

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('protocols').where('protocol_name', '>=', 'Tirze').limit(1).get();
  if (!snapshot.empty) {
    console.log(JSON.stringify(snapshot.docs[0].data(), null, 2));
  } else {
    console.log("No Tirzepatide protocol found.");
  }
  process.exit(0);
}
run();

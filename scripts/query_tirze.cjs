const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccount-target.json');

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('protocols').get();
  const tirze = snapshot.docs.find(d => d.data().protocol_name && d.data().protocol_name.toLowerCase().includes('tirze'));
  if (tirze) {
    console.log(JSON.stringify(tirze.data().phases, null, 2));
  } else {
    console.log("No Tirzepatide protocol found.");
  }
  process.exit(0);
}
run();

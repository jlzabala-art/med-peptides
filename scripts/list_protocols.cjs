const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccount-target.json');

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('protocols').get();
  snapshot.docs.forEach(d => {
    if (d.data().protocol_name) console.log(d.data().protocol_name);
  });
  process.exit(0);
}
run();

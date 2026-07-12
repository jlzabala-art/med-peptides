const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccount-target.json');
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
async function run() {
  const snaps = await db.collection('protocols').get();
  const counts = {};
  snaps.forEach(doc => {
    const s = doc.data().status || 'undefined';
    counts[s] = (counts[s] || 0) + 1;
  });
  console.log('Statuses:', counts);
}
run();

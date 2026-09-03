const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check() {
  const queryRoles = ['fagron_doctor', 'fagron_genomics_doctor', 'medical_director'];
  for (let r of queryRoles) {
    const snap = await db.collection('users').where('role', '==', r).get();
    console.log(`Role ${r}: ${snap.size} users`);
    if(snap.size > 0) {
      console.log(snap.docs[0].data());
    }
  }
}
check();

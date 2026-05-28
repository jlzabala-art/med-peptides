const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert('./serviceAccountKey.json'),
  });
}
const db = admin.firestore();

async function run() {
  const doc = await db.collection('prescriptions').doc('U4bJuAcvGuD7fMgpLAqt').get();
  console.log(JSON.stringify(doc.data(), null, 2));
}
run().catch(console.error);

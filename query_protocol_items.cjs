const { adminDb } = require('./src/lib/firebaseAdmin.js');
async function run() {
  const snap = await adminDb.collection('protocols').limit(1).get();
  if (!snap.empty) {
    const doc = snap.docs[0].data();
    console.log(JSON.stringify(doc.phases[0].items || doc.phases[0].medications, null, 2));
  }
}
run();

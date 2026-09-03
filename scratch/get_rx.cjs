const { db } = require('../src/firebase-admin-setup.cjs');
async function run() {
  const snap = await db.collection('prescriptions').limit(5).get();
  snap.forEach(d => console.log(d.id, JSON.stringify(d.data(), null, 2)));
}
run();

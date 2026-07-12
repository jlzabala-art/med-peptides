const { adminDb } = require('./src/lib/firebaseAdmin.js');
async function run() {
  const snap = await adminDb.collection('protocols').get();
  console.log(`Found ${snap.size} protocols`);
  snap.docs.forEach(doc => {
    const data = doc.data();
    const phase0 = data.phases && data.phases[0];
    if (phase0) {
      console.log(`Protocol ${doc.id}:`);
      console.log(JSON.stringify(phase0.items || phase0.medications, null, 2));
    }
  });
}
run();

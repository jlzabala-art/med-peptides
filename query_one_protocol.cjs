const { adminDb } = require('./src/lib/firebaseAdmin.js');
async function run() {
  const snap = await adminDb.collection('protocols').where('phases', '!=', null).limit(10).get();
  snap.docs.forEach(doc => {
    const data = doc.data();
    if (data.phases[0] && data.phases[0].items && data.phases[0].items.length > 0 && data.phases[0].items[0].name === "Unknown Product") {
       console.log(JSON.stringify(data, null, 2));
    }
  });
}
run();

const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert('./serviceAccountKey.json'),
  });
}
const db = admin.firestore();

async function run() {
  const snap = await db.collection('products').get();
  console.log(`Total products: ${snap.size}`);
  snap.forEach(doc => {
    const data = doc.data();
    if ((data.name || data.displayName || '').toLowerCase().includes('bpc')) {
      console.log(`Match: id=${doc.id}, name=${data.name}, displayName=${data.displayName}`);
    }
  });
}
run().catch(console.error);

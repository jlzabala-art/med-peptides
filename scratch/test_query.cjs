const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert('./serviceAccountKey.json'),
  });
}
const db = admin.firestore();

async function run() {
  console.log('Testing query on products with orderBy(name)...');
  try {
    const snap = await db.collection('products').orderBy('name').limit(12).get();
    console.log(`Success! Found ${snap.size} products.`);
  } catch (err) {
    console.error('Error on products query:', err.message);
  }

  console.log('Testing query on protocols with orderBy(name)...');
  try {
    const snap = await db.collection('protocols').orderBy('name').limit(8).get();
    console.log(`Success! Found ${snap.size} protocols.`);
  } catch (err) {
    console.error('Error on protocols query:', err.message);
  }
}
run().catch(console.error);

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount-target.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const ret = await db.collection('product_variants').where('parentProductId', '==', 'retatrutide').get();
  console.log('--- Retatrutide Variants by Parent ---');
  ret.forEach(doc => console.log(doc.id, doc.data()));
  
  const bac = await db.collection('product_variants').where('parentProductId', '==', 'bacteriostatic-water').get();
  console.log('--- Bac Water Variants by Parent ---');
  bac.forEach(doc => console.log(doc.id, doc.data()));
}

run().catch(console.error).finally(() => process.exit(0));

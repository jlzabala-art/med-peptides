const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount-target.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const variants = await db.collection('product_variants').where('productId', '==', 'retatrutide').get();
  console.log('--- Retatrutide Variants ---');
  variants.forEach(doc => console.log(doc.id, doc.data()));
  
  const bacWater = await db.collection('products').where('name', '>=', 'Bacteriostatic').limit(5).get();
  console.log('--- Bac Water Products ---');
  bacWater.forEach(doc => console.log(doc.id, doc.data().name));
}

run().catch(console.error).finally(() => process.exit(0));

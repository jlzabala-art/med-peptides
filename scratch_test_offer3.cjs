require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();

async function test() {
  const snap = await db.collection('products')
    .where('name', '==', '5-Amino-1MQ')
    .limit(1)
    .get();
  
  if (snap.empty) {
    console.log('No 5-Amino-1MQ found in products');
    process.exit(0);
  }
  
  const product = snap.docs[0].data();
  console.log('--- PRODUCT DATA ---');
  console.log({
     id: snap.docs[0].id,
     name: product.name,
     supplierUnitCostUSD: product.supplierUnitCostUSD,
     pricing: product.pricing,
     variants: product.variants
  });
}

test().catch(console.error);

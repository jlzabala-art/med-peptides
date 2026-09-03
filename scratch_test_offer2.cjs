require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();

async function test() {
  const snap = await db.collection('products')
    .where('supplierId', '==', 'OLlBbQjgrj6tY7GmM2Jo')
    .limit(1)
    .get();
  
  if (snap.empty) {
    console.log('No products found');
    process.exit(0);
  }
  
  const product = snap.docs[0].data();
  console.log('--- PRODUCT DATA ---');
  console.log({
     id: snap.docs[0].id,
     name: product.name,
     variants: product.variants,
     supplierUnitCostUSD: product.supplierUnitCostUSD
  });
}

test().catch(console.error);

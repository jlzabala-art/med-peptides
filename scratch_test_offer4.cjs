require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function test() {
  const snap = await db.collection('supplierOffers').where('name', '==', '5-Amino-1MQ').get();
  console.log('supplierOffers count:', snap.docs.length);
  snap.docs.forEach(d => console.log('supplierOffer:', d.id, d.data().dosage, d.data().supplierUnitCostUSD));

  const pSnap = await db.collection('products').where('name', '==', '5-Amino-1MQ').get();
  console.log('products count:', pSnap.docs.length);
  pSnap.docs.forEach(d => console.log('product:', d.id, d.data().dosage, d.data().supplierUnitCostUSD));
}

test().catch(console.error);

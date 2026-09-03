require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function test() {
  const pSnap = await db.collection('products').where('name', '==', '5-Amino-1MQ').get();
  pSnap.docs.forEach(d => console.log('product:', d.id, d.data().name, d.data().dosage, 'isActive:', d.data().isActive, 'status:', d.data().status, 'supplier:', d.data().supplierName));
}

test().catch(console.error);

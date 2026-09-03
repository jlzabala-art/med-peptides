require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function check() {
  const snap = await db.collection('products')
    .where('supplierId', '==', 'OLlBbQjgrj6tY7GmM2Jo')
    .where('isActive', '==', true)
    .limit(1)
    .get();
    
  snap.docs.forEach(doc => {
    console.log(JSON.stringify(doc.data(), null, 2));
  });
}
check().catch(console.error);

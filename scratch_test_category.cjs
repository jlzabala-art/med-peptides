require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function check() {
  const snap = await db.collection('products')
    .where('supplierId', '==', 'OLlBbQjgrj6tY7GmM2Jo')
    .limit(5)
    .get();
    
  snap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`\nProduct: ${data.name}`);
    console.log(`Category: ${data.category}`);
    console.log(`Status: ${data.status}`);
    console.log(`isActive: ${data.isActive}`);
  });
}
check().catch(console.error);

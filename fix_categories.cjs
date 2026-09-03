require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function fixCategories() {
  const SUPPLIER_ID = 'OLlBbQjgrj6tY7GmM2Jo';
  
  const snap = await db.collection('products')
    .where('supplierId', '==', SUPPLIER_ID)
    .where('isActive', '==', true)
    .get();
    
  let count = 0;
  const batch = db.batch();
  
  snap.docs.forEach(doc => {
    const data = doc.data();
    if (!data.category) {
      batch.update(doc.ref, { category: 'Peptides' });
      count++;
    }
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`Updated ${count} products with category: 'Peptides'`);
  } else {
    console.log('No products needed category update.');
  }
}
fixCategories().catch(console.error);

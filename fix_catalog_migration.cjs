require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();

async function fix() {
  const SUPPLIER_ID = 'OLlBbQjgrj6tY7GmM2Jo';
  
  // 1. Fully deactivate old Lotusland products that were marked as 'needs_review'
  const oldSnap = await db.collection('products')
    .where('supplierId', '==', SUPPLIER_ID)
    .where('catalogStatus', '==', 'needs_review')
    .get();
    
  console.log(`Found ${oldSnap.size} old products to archive...`);
  const batch1 = db.batch();
  oldSnap.docs.forEach(doc => {
    batch1.update(doc.ref, { 
      isActive: false, 
      status: 'archived',
      'pricing.retail': null,
      'pricing.wholesale': null
    });
  });
  await batch1.commit();
  console.log('Archived old products.');

  // 2. Copy the new supplierOffers into products if they aren't there
  const offersSnap = await db.collection('supplierOffers')
    .where('supplierId', '==', SUPPLIER_ID)
    .get();
    
  console.log(`Found ${offersSnap.size} supplierOffers to migrate...`);
  
  for (const doc of offersSnap.docs) {
    const data = doc.data();
    
    // check if it already exists in products
    const pSnap = await db.collection('products')
      .where('supplierId', '==', SUPPLIER_ID)
      .where('name', '==', data.name)
      .where('dosage', '==', data.dosage)
      .get();
      
    if (pSnap.empty) {
      await db.collection('products').add({
        ...data,
        status: 'published',
        isActive: true,
        catalogStatus: 'active'
      });
      console.log(`Created product: ${data.name} ${data.dosage}`);
    } else {
      await pSnap.docs[0].ref.update({
        ...data,
        status: 'published',
        isActive: true,
        catalogStatus: 'active'
      });
      console.log(`Updated product: ${data.name} ${data.dosage}`);
    }
  }
  
  console.log('Migration complete.');
}

fix().catch(console.error);

const { adminDb } = require('../src/lib/firebaseAdmin');

async function run() {
  const allProdsSnap = await adminDb.collection('products').get();
  const allProds = allProdsSnap.docs;
  
  const toUpdate = [];
  
  allProds.forEach(doc => {
    const data = doc.data();
    const supp = (data.supplier || data.supplierName || '').toLowerCase();
    
    // Si es de Fagron Genomics exclusivamente
    if (supp === 'fagron genomics') {
      toUpdate.push(doc);
    }
  });

  console.log(`Found ${toUpdate.length} Fagron Genomics products to update to Saliva.`);
  
  if (toUpdate.length === 0) return;

  const batch = adminDb.batch();
  toUpdate.forEach(doc => {
    batch.update(doc.ref, { sampleType: 'Saliva' });
  });

  await batch.commit();
  console.log('Update complete.');
}

run().catch(console.error);

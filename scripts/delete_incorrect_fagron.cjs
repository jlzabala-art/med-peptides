const { adminDb } = require('../src/lib/firebaseAdmin');

async function run() {
  const allProdsSnap = await adminDb.collection('products').get();
  const allProds = allProdsSnap.docs;
  
  const toDelete = [];
  
  const allowedNames = [
    'fagron nutrigen™',
    'fagron sportgen™',
    'fagron trichotest™',
    'fagron acnetest™',
    'eterna® epigenetic age test',
    'progen longevity dna test',
    'testagen'
  ];

  allProds.forEach(doc => {
    const data = doc.data();
    const supp = (data.supplier || data.supplierName || '').toLowerCase();
    const nameLower = (data.name || '').toLowerCase();
    
    // Si es de Fagron Genomics exclusivamente y el nombre NO está en la lista permitida
    if (supp === 'fagron genomics') {
      if (!allowedNames.includes(nameLower)) {
        toDelete.push(doc);
      }
    }
  });

  console.log(`Found ${toDelete.length} incorrect Fagron Genomics products to DELETE.`);
  toDelete.forEach(doc => console.log('Deleting:', doc.data().name));
  
  if (toDelete.length === 0) return;

  const batch = adminDb.batch();
  toDelete.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log('Delete complete.');
}

run().catch(console.error);

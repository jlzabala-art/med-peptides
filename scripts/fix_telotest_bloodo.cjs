const { adminDb } = require('../src/lib/firebaseAdmin');

async function run() {
  const batch = adminDb.batch();
  let count = 0;

  // 1. Fix Telotest
  const allProds = await adminDb.collection('products').get();

  allProds.forEach(doc => {
    const data = doc.data();
    const currentName = (data.name || '').toLowerCase();
    
    // Fix TeloTest
    if (currentName.includes('telotest')) {
      console.log(`Fixing TeloTest: ${data.name}`);
      batch.update(doc.ref, {
        name: 'Fagron TeloTest™',
        canonicalName: 'Fagron TeloTest™',
        category: 'DNA Test'
      });
      count++;
    }

    // Fix Bloodo products
    if (currentName.includes('bloodo')) {
      console.log(`Fixing Bloodo product: ${data.name}`);
      batch.update(doc.ref, {
        supplier: 'JLo4rkdC0GrRXhinxX6S', // Use the ID found in the last script run
        category: 'Biomarker Test'
      });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Committed ${count} updates.`);
  }
}

run().catch(console.error);

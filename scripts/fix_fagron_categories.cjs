const { adminDb } = require('../src/lib/firebaseAdmin');

async function run() {
  const snapshotFagron = await adminDb.collection('products')
    .where('supplier', 'in', ['Fagron Genomics', 'Fagron', 'fagron genomics'])
    .get();

  const batch = adminDb.batch();
  let count = 0;

  snapshotFagron.forEach(doc => {
    const data = doc.data();
    if (data.category !== 'DNA Test') {
      console.log(`Updating category for ${doc.id}: ${data.category} -> DNA Test`);
      batch.update(doc.ref, { category: 'DNA Test' });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Updated ${count} categories to DNA Test.`);
  } else {
    console.log('No categories needed updating.');
  }
}

run().catch(console.error);

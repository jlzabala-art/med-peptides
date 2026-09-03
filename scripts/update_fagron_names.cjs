const { adminDb } = require('../src/lib/firebaseAdmin');

async function run() {
  const snapshot = await adminDb.collection('products')
    .where('supplier', 'in', ['Fagron Genomics', 'Fagron', 'fagron genomics'])
    .get();

  const batch = adminDb.batch();
  let count = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    const currentName = data.name || '';
    const currentCanonical = data.canonicalName || '';
    
    let newName = null;

    if (currentName.toLowerCase().includes('nutrigen')) {
      newName = 'NutriGen™';
    } else if (currentName.toLowerCase().includes('telotest')) {
      newName = 'TeloTest™';
    } else if (currentName.toLowerCase().includes('trichotest')) {
      newName = 'TrichoTest™';
    } else if (currentName.toLowerCase().includes('sport test') || currentName.toLowerCase().includes('sportgen')) {
      newName = 'SportGen™';
    } else if (currentName.toLowerCase().includes('acnetest')) {
      newName = 'AcneTest™';
    }

    if (newName && (currentName !== newName || currentCanonical !== newName)) {
      console.log(`Updating ${doc.id}: ${currentName} -> ${newName}`);
      batch.update(doc.ref, {
        name: newName,
        canonicalName: newName
      });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Updated ${count} products.`);
  } else {
    console.log('No products needed updating.');
  }
}

run().catch(console.error);

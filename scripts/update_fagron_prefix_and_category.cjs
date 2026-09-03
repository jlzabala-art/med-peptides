const { adminDb } = require('../src/lib/firebaseAdmin');

async function run() {
  // Update Fagron product names
  const snapshotFagron = await adminDb.collection('products')
    .where('supplier', 'in', ['Fagron Genomics', 'Fagron', 'fagron genomics'])
    .get();

  const batch = adminDb.batch();
  let nameCount = 0;

  snapshotFagron.forEach(doc => {
    const data = doc.data();
    const currentName = data.name || '';
    
    let newName = null;
    if (currentName === 'NutriGen™') newName = 'Fagron NutriGen™';
    else if (currentName === 'TeloTest™') newName = 'Fagron TeloTest™';
    else if (currentName === 'TrichoTest™') newName = 'Fagron TrichoTest™';
    else if (currentName === 'SportGen™') newName = 'Fagron SportGen™';
    else if (currentName === 'AcneTest™') newName = 'Fagron AcneTest™';

    if (newName) {
      console.log(`Updating name for ${doc.id}: ${currentName} -> ${newName}`);
      batch.update(doc.ref, {
        name: newName,
        canonicalName: newName
      });
      nameCount++;
    }
  });

  // Update "Genetic Tests" category to "DNA Test"
  // We need to fetch all products to check category, since category might be a string starting with "Genetic"
  const allProducts = await adminDb.collection('products').get();
  let catCount = 0;

  allProducts.forEach(doc => {
    const data = doc.data();
    if (data.category && typeof data.category === 'string') {
      const lowerCat = data.category.toLowerCase();
      // If it contains 'genetic test', 'genetics testing', 'testing' etc, 
      // Actually the user said "A nivel de categoria a todos DNA Test, que subitituye a Genetic Test en todos los casos"
      if (lowerCat.includes('genetic') || lowerCat.includes('testing') || data.category === 'Testing') {
        // Just to be safe, only replace if it's related to Genetics/Testing
        console.log(`Updating category for ${doc.id}: ${data.category} -> DNA Test`);
        // We shouldn't accidentally overwrite completely unrelated categories if they have 'testing' (e.g. Lab Testing),
        // but since this is what was requested specifically for the genetic tests:
        if (
          lowerCat.includes('genetic') || 
          data.category === 'Testing' || 
          lowerCat === 'diagnostic services' // As seen in screenshot
        ) {
          batch.update(doc.ref, { category: 'DNA Test' });
          catCount++;
        }
      }
    }
  });

  if (nameCount > 0 || catCount > 0) {
    await batch.commit();
    console.log(`Updated ${nameCount} product names and ${catCount} categories.`);
  } else {
    console.log('No products needed updating.');
  }
}

run().catch(console.error);

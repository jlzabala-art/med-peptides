const { adminDb } = require('../src/lib/firebaseAdmin');

async function run() {
  const productsToCreate = [
    { name: 'Testosterone+ Test', product_type: 'biomarker_testing_kit', supplier: 'Bloodo', category: 'Biomarker Test', sampleType: 'Blood', isActive: true },
    { name: 'NAD Level Test', product_type: 'biomarker_testing_kit', supplier: 'Bloodo', category: 'Biomarker Test', sampleType: 'Blood', isActive: true },
    { name: 'Vitamin D Test', product_type: 'biomarker_testing_kit', supplier: 'Bloodo', category: 'Biomarker Test', sampleType: 'Blood', isActive: true },
    { name: 'Omega Ratio Test', product_type: 'biomarker_testing_kit', supplier: 'Bloodo', category: 'Biomarker Test', sampleType: 'Blood', isActive: true },
    { name: 'Hemoglobin A1c (HbA1c) Test', product_type: 'biomarker_testing_kit', supplier: 'Bloodo', category: 'Biomarker Test', sampleType: 'Blood', isActive: true },
    { name: 'Cortisol Test', product_type: 'biomarker_testing_kit', supplier: 'Bloodo', category: 'Biomarker Test', sampleType: 'Blood', isActive: true },
  ];

  const batch = adminDb.batch();
  
  productsToCreate.forEach(prod => {
    const docRef = adminDb.collection('products').doc();
    batch.set(docRef, prod);
  });

  await batch.commit();
  console.log(`Successfully created ${productsToCreate.length} Bloodo products.`);
}

run().catch(console.error);

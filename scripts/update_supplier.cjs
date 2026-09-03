const { adminDb } = require('../src/lib/firebaseAdmin');

async function run() {
  const snapshot = await adminDb.collection('suppliers').get();
  
  let targetId = null;
  snapshot.forEach(doc => {
    const data = doc.data();
    const name = (data.name || data.companyName || '').toLowerCase();
    if (name.includes('fagron')) {
      targetId = doc.id;
    }
  });

  if (!targetId) {
    console.log('Supplier with name fagron not found.');
    return;
  }

  const supplierRef = adminDb.collection('suppliers').doc(targetId);

  const updateData = {
    description: "Fagron Genomics is a global biotechnology company specializing in medical genetic algorithms and personalized medicine. They provide clinical genetic interpretation for Aesthetics, Dermatology, Trichology, and Nutrition, integrating genetic analysis with compounding.",
    website: "https://fagrongenomics.com",
    email: "info@fagrongenomics.com",
    phone: "+34 937 31 07 22",
    country: "Spain",
    city: "Terrassa (Barcelona)",
    address: "C/ De les Cosidores 150, 08226",
    status: "active"
  };

  await supplierRef.update(updateData);
  console.log(`Supplier ${targetId} updated successfully with web data.`);
}

run().catch(console.error);

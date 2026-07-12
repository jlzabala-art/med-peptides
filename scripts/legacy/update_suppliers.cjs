const admin = require('firebase-admin');
const fs = require('fs');

if (fs.existsSync('./firebase-adminsdk.json')) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./firebase-adminsdk.json')),
    projectId: "med-peptides-app"
  });
} else {
  admin.initializeApp({
    projectId: "med-peptides-app"
  });
}

async function updateSuppliers() {
  const db = admin.firestore();
  const snapshot = await db.collection('products').get();
  
  let lotusCount = 0;
  let nplabCount = 0;
  let updatedCount = 0;
  
  const batch = db.batch();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    let supplier = '';
    
    // Determine supplier based on type or name
    // Assuming type: 'supplement' is for supplements
    if (data.type === 'supplement' || data.name.includes('Capsules') || data.category?.includes('Vitamins') || data.category?.includes('Minerals')) {
      supplier = 'NPLAB';
      nplabCount++;
    } else {
      supplier = 'Lotusland';
      lotusCount++;
    }
    
    const docRef = db.collection('products').doc(doc.id);
    batch.update(docRef, { supplier });
    updatedCount++;
  });

  await batch.commit();
  console.log(`Successfully updated ${updatedCount} products.`);
  console.log(`- Lotusland (Peptides): ${lotusCount}`);
  console.log(`- NPLAB (Supplements): ${nplabCount}`);
}

updateSuppliers().catch(console.error);

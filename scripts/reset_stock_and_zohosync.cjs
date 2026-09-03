const { adminDb } = require('../src/lib/firebaseAdmin');
const { FieldValue } = require('firebase-admin/firestore');

async function run() {
  const allProdsSnap = await adminDb.collection('products').get();
  
  const allProds = allProdsSnap.docs;
  console.log(`Found ${allProds.length} products to update.`);
  
  const chunks = [];
  for (let i = 0; i < allProds.length; i += 400) {
    chunks.push(allProds.slice(i, i + 400));
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const batch = adminDb.batch();
    
    chunk.forEach(doc => {
      batch.update(doc.ref, { 
        stock: FieldValue.delete(),
        zohoSync: false 
      });
    });

    await batch.commit();
    console.log(`Committed chunk ${i + 1} of ${chunks.length}`);
  }

  console.log('All updates complete.');
}

run().catch(console.error);

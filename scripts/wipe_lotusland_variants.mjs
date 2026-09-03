import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function run() {
  const prodsSnap = await db.collection('products').get();
  
  let batch = db.batch();
  let count = 0;
  
  const flush = async () => {
    if (count > 0) {
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  };

  let arrayWipedCount = 0;
  let subColWipedCount = 0;

  for (const doc of prodsSnap.docs) {
    const data = doc.data();
    
    // Check array
    if (data.variants && Array.isArray(data.variants)) {
      const originalLen = data.variants.length;
      const filtered = data.variants.filter(v => v.supplierId !== 'supplier-lotusland');
      if (filtered.length !== originalLen) {
        batch.update(doc.ref, { variants: filtered });
        count++;
        arrayWipedCount++;
        if (count >= 400) await flush();
      }
    }
    
    // Check subcollection
    const varsSnap = await doc.ref.collection('variants').where('supplierId', '==', 'supplier-lotusland').get();
    for (const vDoc of varsSnap.docs) {
      batch.delete(vDoc.ref);
      count++;
      subColWipedCount++;
      if (count >= 400) await flush();
    }
  }
  
  await flush();
  
  console.log(`Wiped supplier-lotusland variants from ${arrayWipedCount} product arrays.`);
  console.log(`Deleted ${subColWipedCount} variants from supplier-lotusland from subcollections.`);
}

run().catch(console.error);

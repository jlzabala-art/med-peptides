import { db } from './lib/firebase-admin.mjs';

async function cleanup() {
  const products = await db.collection('products').get();
  
  let deletedCount = 0;
  let batch = db.batch();
  let batchCount = 0;
  
  for (const product of products.docs) {
    const variantsSnap = await product.ref.collection('variants').get();
    
    for (const doc of variantsSnap.docs) {
      const data = doc.data();
      
      // Identify "ghost" variants:
      // 1. Must belong to supplier-nplabs
      // 2. Must NOT be one of the newly created perfectly structured IDs (which contain '-np-labs-')
      // 3. Must be missing both `dose` and `dosage`
      if (data.supplierId === 'supplier-nplabs' && !doc.id.includes('-np-labs-')) {
        if (!data.dose && !data.dosage) {
          console.log(`Deleting ghost variant: ${product.id} -> ${doc.id}`);
          batch.delete(doc.ref);
          deletedCount++;
          batchCount++;
          
          if (batchCount === 500) {
            await batch.commit();
            batch = db.batch();
            batchCount = 0;
          }
        }
      }
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
  }
  
  console.log(`\nCleanup complete! Deleted ${deletedCount} ghost variants from NP Labs.`);
}

cleanup().catch(console.error);

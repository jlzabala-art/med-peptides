import { db } from './lib/firebase-admin.mjs';

async function run() {
  console.log('🔍 Listing all supplements...');
  const supplementsSnap = await db.collection('supplements').get();
  
  let deletedCount = 0;
  
  for (const supplementDoc of supplementsSnap.docs) {
    const supplementSlug = supplementDoc.id;
    console.log(`Checking variants for supplement: ${supplementSlug}...`);
    
    const variantsCol = db.collection('supplements').doc(supplementSlug).collection('variants');
    const variantsSnap = await variantsCol.get();
    
    const batch = db.batch();
    let batchSize = 0;
    
    for (const variantDoc of variantsSnap.docs) {
      const variantId = variantDoc.id;
      // Check if variant ID ends with a hyphen and digits (the legacy index suffix)
      if (/-\d+$/.test(variantId)) {
        console.log(`  🗑️ Deleting stale variant: ${variantId}`);
        batch.delete(variantDoc.ref);
        batchSize++;
        deletedCount++;
      }
    }
    
    if (batchSize > 0) {
      await batch.commit();
      console.log(`  ✅ Deleted ${batchSize} stale variants in batch.`);
    }
  }
  
  console.log(`🎉 Done! Deleted a total of ${deletedCount} stale variant documents.`);
}

run().catch(err => {
  console.error('❌ Error:', err);
});

import { adminDb } from '../lib/firebaseAdmin.js';

async function purgeUnpricedDuplicateVariants() {
  console.log('🚀 Starting purge of unpriced duplicate template variants...');
  
  const allVariantsSnapshot = await adminDb.collectionGroup('variants').get();
  console.log(`Found ${allVariantsSnapshot.size} total variants across Firestore.`);

  const byProduct = {};
  allVariantsSnapshot.docs.forEach(doc => {
    const v = doc.data();
    const pId = v.productId || doc.ref.parent?.parent?.id;
    if (!byProduct[pId]) byProduct[pId] = [];

    const cost = Number(
      v.unit_price || 
      v.cost_price || 
      v.costPrice || 
      v.unit_cost || 
      v.price || 
      v.cost_tiers?.cost_1 || 
      v.pricing?.master?.perUnit || 
      v.pricing?.acquisition?.tiers?.[0]?.price || 
      0
    );
    const retail = Number(
      v.retailPrice || 
      v.retail_price || 
      v.pricing?.retail?.perUnit || 
      v.pricing?.retailPrice?.base || 
      0
    );
    const wholesale = Number(
      v.wholesalePrice || 
      v.wholesale_price || 
      v.pricing?.wholesale?.perUnit || 
      0
    );
    const hasPrice = (cost > 0 || retail > 0 || wholesale > 0);

    byProduct[pId].push({
      ref: doc.ref,
      refPath: doc.ref.path,
      id: doc.id,
      name: v.name || v.sku || 'Unnamed',
      dosage: v.dosage || 'N/A',
      hasPrice,
      supplierId: v.supplierId
    });
  });

  const duplicateUnpriced = [];
  Object.entries(byProduct).forEach(([pId, vars]) => {
    const pricedVars = vars.filter(v => v.hasPrice);
    const unpricedVars = vars.filter(v => !v.hasPrice);

    // If product has valid priced variants AND unpriced dummy variants, the unpriced ones are useless duplicates
    if (pricedVars.length > 0 && unpricedVars.length > 0) {
      unpricedVars.forEach(uv => duplicateUnpriced.push(uv));
    }
  });

  console.log(`Identified ${duplicateUnpriced.length} unpriced dummy template variants to delete.`);

  // Batch delete in chunks of 400
  const CHUNK_SIZE = 400;
  for (let i = 0; i < duplicateUnpriced.length; i += CHUNK_SIZE) {
    const chunk = duplicateUnpriced.slice(i, i + CHUNK_SIZE);
    const batch = adminDb.batch();
    chunk.forEach(item => {
      batch.delete(item.ref);
    });
    await batch.commit();
    console.log(`Deleted batch ${i + 1} to ${Math.min(i + CHUNK_SIZE, duplicateUnpriced.length)}...`);
  }

  // Update facet meta
  const remainingVariants = await adminDb.collectionGroup('variants').get();
  await adminDb.collection('_meta').doc('catalog_facets').set({
    totalVariantsCount: remainingVariants.size,
    lastSyncedAt: new Date().toISOString()
  }, { merge: true });

  console.log(`✅ Purge complete! Deleted ${duplicateUnpriced.length} unpriced dummy variants.`);
  console.log(`Remaining clean variants in Firestore: ${remainingVariants.size}`);
}

purgeUnpricedDuplicateVariants().then(() => process.exit(0)).catch(err => {
  console.error('Error during purge:', err);
  process.exit(1);
});

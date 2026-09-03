import { adminDb } from '../lib/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

async function migrateEmbeddedVariants() {
  console.log('🚀 Starting 100% Subcollection Variant Migration...');
  const t0 = Date.now();

  const prodsSnap = await adminDb.collection('products').get();
  console.log(`Found ${prodsSnap.size} total products in Firestore.`);

  let productsMigrated = 0;
  let variantsCreated = 0;
  let productsCleaned = 0;

  // Process in batches of 20 products
  const CHUNK_SIZE = 20;
  for (let i = 0; i < prodsSnap.docs.length; i += CHUNK_SIZE) {
    const chunk = prodsSnap.docs.slice(i, i + CHUNK_SIZE);
    
    await Promise.all(chunk.map(async (doc) => {
      const pData = doc.data();
      const pId = doc.id;
      const variantsSubcoll = doc.ref.collection('variants');
      const existingSubSnap = await variantsSubcoll.get();
      const existingVariantIds = new Set(existingSubSnap.docs.map(d => d.id));

      let hasEmbedded = Array.isArray(pData.variants) && pData.variants.length > 0;

      if (hasEmbedded) {
        const batch = adminDb.batch();
        let newVariantsInBatch = 0;

        pData.variants.forEach((v, idx) => {
          const vId = v.id || `v_${idx + 1}_${Date.now().toString(36)}`;
          const varRef = variantsSubcoll.doc(vId);

          const variantPayload = {
            id: vId,
            productId: pId,
            canonicalId: pData.canonicalId || pId,
            name: v.name || pData.canonicalName || pData.name || 'Standard Variant',
            dosage: v.dosage || v.dose || pData.dosage || 'Standard',
            presentation: v.presentation || v.format || pData.format || 'vial',
            format: v.format || v.presentation || pData.format || 'vial',
            supplierId: v.supplierId || v.supplier || pData.supplierId || pData.supplier || null,
            supplierName: v.supplierName || v.supplier || pData.supplierName || pData.supplier || null,
            costPrice: Number(v.costPrice || v.cost_price || v.unit_cost || 0),
            wholesalePrice: Number(v.wholesalePrice || v.wholesale_price || v.trade_price || 0),
            clinicPrice: Number(v.clinicPrice || v.clinic_price || 0),
            retailPrice: Number(v.retailPrice || v.retail_price || v.price || pData.price || 0),
            stock: typeof v.stock === 'number' ? v.stock : (parseInt(v.stock, 10) || 0),
            isActive: v.isActive !== false,
            status: v.status || (v.isActive === false ? 'inactive' : 'active'),
            updatedAt: new Date().toISOString(),
            ...v, // preserve any other custom attributes
          };

          batch.set(varRef, variantPayload, { merge: true });
          existingVariantIds.add(vId);
          newVariantsInBatch++;
        });

        // Update parent document: delete embedded variants array and set accurate variantsCount
        const totalCount = existingVariantIds.size;
        batch.update(doc.ref, {
          variants: FieldValue.delete(),
          variantsCount: totalCount,
          updatedAt: new Date().toISOString()
        });

        await batch.commit();
        productsMigrated++;
        variantsCreated += newVariantsInBatch;
      } else {
        // Ensure parent document has accurate variantsCount even if no embedded array
        const actualCount = existingSubSnap.size;
        if (pData.variantsCount !== actualCount) {
          await doc.ref.update({
            variantsCount: actualCount,
            updatedAt: new Date().toISOString()
          });
          productsCleaned++;
        }
      }
    }));

    console.log(`Processed ${Math.min(i + CHUNK_SIZE, prodsSnap.docs.length)} / ${prodsSnap.docs.length} products...`);
  }

  const t1 = Date.now();
  console.log('\n=== MIGRATION COMPLETE ===');
  console.log(`Products with embedded variants migrated: ${productsMigrated}`);
  console.log(`Total variants saved into subcollections: ${variantsCreated}`);
  console.log(`Products with synced variantsCount: ${productsCleaned}`);
  console.log(`Elapsed time: ${((t1 - t0) / 1000).toFixed(2)}s`);

  // Final verification
  const finalProdsSnap = await adminDb.collection('products').get();
  let remainingEmbedded = 0;
  finalProdsSnap.docs.forEach(d => {
    if (Array.isArray(d.data().variants) && d.data().variants.length > 0) remainingEmbedded++;
  });

  const finalVarsSnap = await adminDb.collectionGroup('variants').get();
  console.log('\n=== FINAL VERIFICATION ===');
  console.log(`Remaining products with embedded variants array: ${remainingEmbedded} (Must be 0)`);
  console.log(`Total variants in collectionGroup('variants'): ${finalVarsSnap.size}`);
}

migrateEmbeddedVariants().catch(console.error);

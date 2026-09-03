import { adminDb } from '../lib/firebaseAdmin.js';
import { normalizePresentation, PRESENTATION_LABELS, VALID_PRESENTATIONS } from '../constants/presentationTypes.js';

async function migratePresentationIds() {
  if (!adminDb) {
    console.error('Firebase Admin not initialized');
    process.exit(1);
  }

  console.log('Starting migration of variant presentations to canonical IDs in Firestore...');

  const snap = await adminDb.collectionGroup('variants').get();
  console.log(`Found ${snap.size} total variant documents across products.`);

  const batchSize = 400;
  let batch = adminDb.batch();
  let countInBatch = 0;
  let updatedCount = 0;
  const stats = new Map();

  for (const doc of snap.docs) {
    const data = doc.data();
    const rawPres = data.presentation || data.format || data.dosage_form || '';
    
    // Normalize to canonical ID (e.g. 'Pre-filled Pen' -> 'pen', 'Vial' -> 'vial')
    const canonicalId = normalizePresentation(rawPres) || (rawPres ? rawPres.toLowerCase().replace(/[\s-]+/g, '_') : 'vial');
    const label = PRESENTATION_LABELS[canonicalId] || 'Vial';

    stats.set(canonicalId, (stats.get(canonicalId) || 0) + 1);

    if (data.presentation !== canonicalId || data.format !== canonicalId) {
      batch.update(doc.ref, {
        presentation: canonicalId,
        format: canonicalId,
        presentationName: label,
      });

      countInBatch++;
      updatedCount++;

      if (countInBatch >= batchSize) {
        await batch.commit();
        console.log(`Committed batch of ${countInBatch} variants...`);
        batch = adminDb.batch();
        countInBatch = 0;
      }
    }
  }

  if (countInBatch > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${countInBatch} variants.`);
  }

  console.log(`\n Successfully updated ${updatedCount} of ${snap.size} variants to canonical IDs!`);
  console.log('Canonical IDs breakdown in database:');
  for (const [id, count] of stats.entries()) {
    console.log(`  - '${id}' (${PRESENTATION_LABELS[id] || id}): ${count}`);
  }

  // Recalculate _meta/catalog_facets
  console.log('\nRecalculating _meta/catalog_facets with canonical IDs...');
  const productsSnap = await adminDb.collection('products').where('isActive', '!=', false).get();
  const goalsMap = new Map();
  const categoriesMap = new Map();
  const formatsMap = new Map();
  const suppliersMap = new Map();

  let activeProductsCount = 0;
  let variantsCount = 0;

  for (const pdoc of productsSnap.docs) {
    const pdata = pdoc.data();
    if (['inactive', 'archived', 'draft'].includes(pdata.status)) continue;
    activeProductsCount++;
    if (pdata.category) categoriesMap.set(pdata.category, (categoriesMap.get(pdata.category) || 0) + 1);

    const goalIds = Array.isArray(pdata.goalIds) ? pdata.goalIds : [];
    for (const g of goalIds) goalsMap.set(g, (goalsMap.get(g) || 0) + 1);

    const vSnap = await adminDb.collection('products').doc(pdoc.id).collection('variants').get();
    for (const vdoc of vSnap.docs) {
      const v = vdoc.data();
      if (v.isActive === false || ['inactive', 'archived', 'draft'].includes(v.status)) continue;
      variantsCount++;
      const pres = v.presentation || 'vial';
      formatsMap.set(pres, (formatsMap.get(pres) || 0) + 1);
      const sId = v.supplierId || v.supplier;
      if (sId) suppliersMap.set(sId, v.supplierName || sId);
    }
  }

  const metaFacets = {
    totals: { activeProducts: activeProductsCount, variants: variantsCount },
    goals: Array.from(goalsMap.entries()).map(([value, count]) => ({ value, count })),
    categories: Array.from(categoriesMap.entries()).map(([value, count]) => ({ value, count })),
    formats: Array.from(formatsMap.entries()).map(([value, count]) => ({ value, count })),
    suppliers: Array.from(suppliersMap.entries()).map(([id, name]) => ({ id, name })),
    lastUpdated: new Date().toISOString()
  };

  await adminDb.collection('_meta').doc('catalog_facets').set(metaFacets);
  console.log('_meta/catalog_facets updated successfully with canonical format IDs!');

  process.exit(0);
}

migratePresentationIds().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

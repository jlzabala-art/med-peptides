import { adminDb } from '../lib/firebaseAdmin.js';

function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Canonical category mapping
const CATEGORY_MAP = {
  'peptides': 'peptide',
  'peptides ': 'peptide',
  'Peptides': 'peptide',
  'peptide_combinations': 'peptide',
  'api': 'raw_material',
  'raw_materials': 'raw_material',
  'raw_material_powder': 'raw_material',
  'supplements': 'supplement',
  'Supplements': 'supplement',
  'diagnostic': 'diagnostic_test',
  'diagnostic_tests': 'diagnostic_test',
  'blood_test': 'diagnostic_test',
  'consumables': 'consumable',
  'services': 'service',
  'hormones': 'hormone',
  'skincares': 'skincare'
};

async function executePhase1_PurgeOrphans() {
  console.log('\n==================================================');
  console.log('🔹 PHASE 1: Purging Orphaned Variants');
  console.log('==================================================');

  const [productsSnap, variantsSnap] = await Promise.all([
    adminDb.collection('products').get(),
    adminDb.collectionGroup('variants').get()
  ]);

  const productIds = new Set(productsSnap.docs.map(d => d.id));
  const orphanedDocs = [];

  variantsSnap.docs.forEach(doc => {
    const v = doc.data();
    const pId = v.productId || doc.ref.parent?.parent?.id;
    if (!pId || !productIds.has(pId)) {
      orphanedDocs.push({ ref: doc.ref, path: doc.ref.path, id: doc.id, pId });
    }
  });

  console.log(`Found ${orphanedDocs.length} orphaned variants.`);

  if (orphanedDocs.length > 0) {
    const batch = adminDb.batch();
    orphanedDocs.forEach(item => {
      batch.delete(item.ref);
    });
    await batch.commit();
    console.log(`✅ Deleted ${orphanedDocs.length} orphaned variant documents.`);
  } else {
    console.log('✅ No orphaned variants detected.');
  }
}

async function executePhase2_HarmonizeCategories() {
  console.log('\n==================================================');
  console.log('🔹 PHASE 2: Harmonizing Category Taxonomy');
  console.log('==================================================');

  const productsSnap = await adminDb.collection('products').get();
  const variantsSnap = await adminDb.collectionGroup('variants').get();

  let pUpdated = 0;
  let vUpdated = 0;

  const pBatch = adminDb.batch();
  productsSnap.docs.forEach(doc => {
    const data = doc.data();
    const currentCat = data.category || data.categoryId;
    if (currentCat && CATEGORY_MAP[currentCat]) {
      const canonicalCat = CATEGORY_MAP[currentCat];
      pBatch.update(doc.ref, {
        category: canonicalCat,
        categoryId: canonicalCat,
        updatedAt: new Date().toISOString()
      });
      pUpdated++;
    }
  });
  if (pUpdated > 0) await pBatch.commit();
  console.log(`✅ Updated ${pUpdated} products to canonical categories.`);

  // Update variants in chunks
  const CHUNK_SIZE = 400;
  const variantUpdates = [];
  variantsSnap.docs.forEach(doc => {
    const data = doc.data();
    const currentCat = data.category || data.categoryId;
    if (currentCat && CATEGORY_MAP[currentCat]) {
      variantUpdates.push({
        ref: doc.ref,
        canonicalCat: CATEGORY_MAP[currentCat]
      });
    }
  });

  for (let i = 0; i < variantUpdates.length; i += CHUNK_SIZE) {
    const chunk = variantUpdates.slice(i, i + CHUNK_SIZE);
    const batch = adminDb.batch();
    chunk.forEach(item => {
      batch.update(item.ref, {
        category: item.canonicalCat,
        categoryId: item.canonicalCat,
        updatedAt: new Date().toISOString()
      });
      vUpdated++;
    });
    await batch.commit();
  }
  console.log(`✅ Updated ${vUpdated} variants to canonical categories.`);
}

async function executePhase3_ConsolidateDuplicateProducts() {
  console.log('\n==================================================');
  console.log('🔹 PHASE 3: Consolidating Redundant Duplicate Products');
  console.log('==================================================');

  const DUPLICATE_CONSOLIDATIONS = [
    { canonical: 'follistatin-344', redundant: 'follistatin-344-1mg-vial' },
    { canonical: 'ghrp-6', redundant: 'ghrp-6-5mg' },
    { canonical: 'cafeisome', redundant: 'cafeisome-tm' },
    { canonical: 'igrantine-f1', redundant: 'igrantine-f1-tm' },
    { canonical: 'cystine', redundant: 'l-cystine' },
    { canonical: 'methionine', redundant: 'l-methionine' }
  ];

  for (const pair of DUPLICATE_CONSOLIDATIONS) {
    const canDocRef = adminDb.collection('products').doc(pair.canonical);
    const redDocRef = adminDb.collection('products').doc(pair.redundant);

    const [canSnap, redSnap] = await Promise.all([canDocRef.get(), redDocRef.get()]);

    if (redSnap.exists) {
      console.log(`Processing consolidation for "${pair.redundant}" into "${pair.canonical}"...`);
      
      // Move any variants from redundant to canonical
      const redVarsSnap = await redDocRef.collection('variants').get();
      if (!redVarsSnap.empty) {
        const batch = adminDb.batch();
        for (const vDoc of redVarsSnap.docs) {
          const vData = vDoc.data();
          const targetVarRef = canDocRef.collection('variants').doc(vDoc.id);
          batch.set(targetVarRef, {
            ...vData,
            productId: pair.canonical,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          batch.delete(vDoc.ref);
        }
        await batch.commit();
        console.log(`  - Migrated ${redVarsSnap.size} variants.`);
      }

      // Delete the redundant product doc
      await redDocRef.delete();
      console.log(`  - Deleted redundant product document "${pair.redundant}".`);
    }
  }

  console.log('✅ Product consolidation complete.');
}

async function executePhase4_NormalizePricingSchema() {
  console.log('\n==================================================');
  console.log('🔹 PHASE 4: Normalizing Pricing Schema (Engine v2)');
  console.log('==================================================');

  const variantsSnap = await adminDb.collectionGroup('variants').get();
  console.log(`Evaluating pricing structures across ${variantsSnap.size} variants...`);

  const CHUNK_SIZE = 400;
  const updates = [];

  variantsSnap.docs.forEach(doc => {
    const v = doc.data();
    const currency = v.currency || v.pricing?.retail?.currency || 'USD';

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

    const rawWholesale = Number(
      v.wholesalePrice || 
      v.wholesale_price || 
      v.pricing?.wholesale?.perUnit || 
      (cost > 0 ? cost * 1.2 : 0)
    );

    const rawClinic = Number(
      v.clinicPrice || 
      v.clinic_price || 
      v.pricing?.clinic?.perUnit || 
      (cost > 0 ? cost * 1.35 : (rawWholesale > 0 ? rawWholesale * 1.15 : 0))
    );

    const rawRetail = Number(
      v.retailPrice || 
      v.retail_price || 
      v.pricing?.retail?.perUnit || 
      v.pricing?.retailPrice?.base || 
      (cost > 0 ? cost * 1.5 : (rawWholesale > 0 ? rawWholesale * 1.3 : 0))
    );

    const kitPrice = Number(
      v.cost_tiers?.cost_10 || 
      v.pricing?.wholesale?.kit || 
      (rawWholesale > 0 ? rawWholesale * 10 * 0.9 : 0)
    );

    const canonicalPricing = {
      master: {
        perUnit: cost > 0 ? Number(cost.toFixed(2)) : null,
        currency,
        kit: kitPrice > 0 ? Number(kitPrice.toFixed(2)) : null
      },
      wholesale: {
        perUnit: rawWholesale > 0 ? Number(rawWholesale.toFixed(2)) : null,
        currency,
        kit: kitPrice > 0 ? Number(kitPrice.toFixed(2)) : null
      },
      clinic: {
        perUnit: rawClinic > 0 ? Number(rawClinic.toFixed(2)) : null,
        currency,
        kit: kitPrice > 0 ? Number((kitPrice * 1.15).toFixed(2)) : null
      },
      retail: {
        perUnit: rawRetail > 0 ? Number(rawRetail.toFixed(2)) : null,
        currency,
        kit: kitPrice > 0 ? Number((kitPrice * 1.3).toFixed(2)) : null
      }
    };

    updates.push({
      ref: doc.ref,
      data: {
        pricing: canonicalPricing,
        unit_price: cost > 0 ? Number(cost.toFixed(2)) : (rawWholesale > 0 ? Number(rawWholesale.toFixed(2)) : 0),
        wholesalePrice: rawWholesale > 0 ? Number(rawWholesale.toFixed(2)) : 0,
        retailPrice: rawRetail > 0 ? Number(rawRetail.toFixed(2)) : 0,
        clinicPrice: rawClinic > 0 ? Number(rawClinic.toFixed(2)) : 0,
        cost_tiers: {
          cost_1: cost > 0 ? Number(cost.toFixed(2)) : 0,
          cost_10: kitPrice > 0 ? Number(kitPrice.toFixed(2)) : 0
        },
        currency,
        updatedAt: new Date().toISOString()
      }
    });
  });

  for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
    const chunk = updates.slice(i, i + CHUNK_SIZE);
    const batch = adminDb.batch();
    chunk.forEach(item => {
      batch.update(item.ref, item.data);
    });
    await batch.commit();
    console.log(`Updated pricing batch ${i + 1} to ${Math.min(i + CHUNK_SIZE, updates.length)}...`);
  }

  console.log(`✅ Standardized pricing schema across ${updates.length} variants.`);
}

async function executePhase5_CanonicalSKUAndFacetsSync() {
  console.log('\n==================================================');
  console.log('🔹 PHASE 5: Generating Canonical SKUs & Facets Sync');
  console.log('==================================================');

  const [productsSnap, variantsSnap] = await Promise.all([
    adminDb.collection('products').get(),
    adminDb.collectionGroup('variants').get()
  ]);

  const productMap = new Map();
  productsSnap.docs.forEach(doc => {
    productMap.set(doc.id, doc.data());
  });

  const CHUNK_SIZE = 400;
  const skuUpdates = [];

  variantsSnap.docs.forEach(doc => {
    const v = doc.data();
    const pId = v.productId || doc.ref.parent?.parent?.id;
    const p = productMap.get(pId) || {};

    const suppSlug = slugify(v.supplierId || v.supplier || p.supplierId || p.supplier || 'GEN').toUpperCase();
    const prodSlug = slugify(p.canonicalName || p.name || 'PROD').toUpperCase();
    const doseSlug = slugify(v.dosage || v.concentration || v.name || 'STD').toUpperCase();
    const formatSlug = slugify(v.presentation || v.format || 'VIAL').toUpperCase();

    const canonicalSku = `SKU-${suppSlug.replace(/^SUPPLIER-/, '')}-${prodSlug.slice(0, 16)}-${doseSlug.slice(0, 10)}-${formatSlug.slice(0, 6)}`.replace(/-+/g, '-');

    if (!v.sku || v.sku.startsWith('SKU-PRD') || v.sku.length < 5) {
      skuUpdates.push({
        ref: doc.ref,
        sku: canonicalSku
      });
    }
  });

  for (let i = 0; i < skuUpdates.length; i += CHUNK_SIZE) {
    const chunk = skuUpdates.slice(i, i + CHUNK_SIZE);
    const batch = adminDb.batch();
    chunk.forEach(item => {
      batch.update(item.ref, { sku: item.sku, updatedAt: new Date().toISOString() });
    });
    await batch.commit();
  }
  console.log(`✅ Assigned canonical SKUs to ${skuUpdates.length} variants.`);

  // Sync _meta/catalog_facets
  const finalVariantsSnap = await adminDb.collectionGroup('variants').get();
  const finalProductsSnap = await adminDb.collection('products').get();

  const categoriesCount = {};
  const suppliersCount = {};
  const formatsCount = {};

  finalVariantsSnap.docs.forEach(doc => {
    const v = doc.data();
    const cat = v.category || 'other';
    const supp = v.supplierId || 'unassigned';
    const fmt = v.presentation || v.format || 'vial';

    categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
    suppliersCount[supp] = (suppliersCount[supp] || 0) + 1;
    formatsCount[fmt] = (formatsCount[fmt] || 0) + 1;
  });

  await adminDb.collection('_meta').doc('catalog_facets').set({
    totals: {
      products: finalProductsSnap.size,
      variants: finalVariantsSnap.size,
      activeProducts: finalProductsSnap.docs.filter(d => d.data().status === 'active' || !d.data().status).length
    },
    categories: Object.entries(categoriesCount).map(([value, count]) => ({ value, label: value, count })),
    suppliers: Object.entries(suppliersCount).map(([id, count]) => ({ id, name: id.replace(/^supplier-/, '').replace(/-/g, ' ').toUpperCase(), count })),
    formats: Object.entries(formatsCount).map(([value, count]) => ({ value, label: value, count })),
    lastPurifiedAt: new Date().toISOString()
  }, { merge: true });

  console.log('✅ Synchronized catalog_facets metadata.');
  console.log(`\n🎉 ALL 5 PURIFICATION PHASES COMPLETED!`);
  console.log(`Final Database State: ${finalProductsSnap.size} Products · ${finalVariantsSnap.size} Variants.`);
}

async function runAll() {
  await executePhase1_PurgeOrphans();
  await executePhase2_HarmonizeCategories();
  await executePhase3_ConsolidateDuplicateProducts();
  await executePhase4_NormalizePricingSchema();
  await executePhase5_CanonicalSKUAndFacetsSync();
}

runAll().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error during purification:', err);
  process.exit(1);
});

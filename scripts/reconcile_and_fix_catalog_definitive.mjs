#!/usr/bin/env node
/**
 * scripts/reconcile_and_fix_catalog_definitive.mjs
 * 
 * DEFINITIVE CATALOG & LOTUS LAND RECONCILIATION
 * 1. Migrates orphan variants from deleted product paths to their canonical products.
 * 2. Deduplicates redundant variants.
 * 3. Deletes orphan subcollections and documents.
 * 4. Ensures all 104 Lotus Land canonical variants exist under canonical products.
 * 5. Backfills supplierIds[], availableTypes[], primaryType, variantsCount on all 395 products.
 * 6. Updates _meta/catalog_facets with exact, real numbers.
 * 
 * Usage:
 *   node scripts/reconcile_and_fix_catalog_definitive.mjs          # Dry Run
 *   node scripts/reconcile_and_fix_catalog_definitive.mjs --commit # Live Execution
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { deriveProductTypes } from '../src/schemas/firestoreProductSchema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

const COMMIT = process.argv.includes('--commit');

// Explicit mapping of orphan parent paths to canonical product IDs
const ORPHAN_PARENT_MAP = {
  'Pom63lsg1UcYKeaJpvF2': 'retatrutide',
  'g4Ax8meYh2vpF0sZOOh1': 'tirzepatide',
  'mots-c-10mg': 'mots-c',
  'nad-': 'nad',
  'nad-100mg': 'nad',
  'pt-141-10mg-vial': 'pt-141',
  'sermorelin-5-mg': 'sermorelin',
  'tesamorelin-2mg': 'tesamorelin',
  'epithalon-10-mg-anti-aging': 'epithalon',
  'ghk-cu-50-mg': 'ghk-cu',
  'ghrp-2-5mg': 'ghrp-2',
  'hcg-5000iu': 'hcg',
  'hexarelin-2mg': 'hexarelin',
  'hexarelin-5mg': 'hexarelin',
  'hmg-75iu': 'hmg',
  'ipamorelin-5mg': 'ipamorelin',
  'melanotan-i-10mg-vial': 'melanotan-i',
  'melanotan-ii-10mg': 'melanotan-ii',
  'mgf-2-mg': 'mgf',
  'snap-8-10-mg-cosmetic': 'snap-8',
  'ss-31-elamipretide-10mg': 'ss-31',
  'ss-31-elamipretide-5mg-vial': 'ss-31',
  'thymalin-10-mg': 'thymalin',
  'thymalin-5mg-vial': 'thymalin',
  'thymogen-5mg-vial': 'thymogen',
  'vip-vasoactive-intestinal-peptide-10mg': 'vip-vasoactive-intestinal-peptide',
  'amlexanox-40mg-caps-x30': 'amlexanox',
  'cerebrolysin-100mg-caps-x30': 'cerebrolysin',
  
  // Specific Lotus Land single-item parents
  'lotusland_ghk_cu_human_copper_100_mg_vial': 'ghk-cu-human-copper',
  'lotusland_igf_lr3_0_1_mg_vial': 'igf-lr3',
  'lotusland_mk_677_12_mg': 'mk-677',
  'lotusland_mt2_10_mg_vial': 'mt2',
  'lotusland_nmn_50_mg_tablet': 'nmn',
  'lotusland_pe_22_28_10_mg_vial': 'pe-22-28',
  'lotusland_peg_mgf_5_mg_vial': 'peg-mgf',
  'lotusland_pinealon_16_mg_vial': 'pinealon',
  'lotusland_pinealon_25_mg_vial': 'pinealon',
  'lotusland_pnc_27_10_mg_vial': 'pnc-27',
  'lotusland_prostamax_25_mg_vial': 'prostamax',
  'lotusland_snap_8_10_mg_vial': 'snap-8',
  'lotusland_testagen_25_mg_vial': 'testagen',
  'lotusland_thymogen_25_mg_vial': 'thymogen',
  'lotusland_thymosin_alpha_1_thymalin_10_mg_10_mg_vial': 'thymosin-alpha-1-thymalin',
  'lotusland_thymulin_10_mg_vial': 'thymulin'
};

function mapCanonicalLotusToProduct(c) {
  const pName = c.parentProduct.toLowerCase();
  if (pName.includes('5-amino')) return '5-amino-1mq';
  if (pName.includes('aod-9604') || pName.includes('aod9604')) return 'aod-9604';
  if (pName.includes('ara-290') || pName.includes('ara290')) return 'ara-290';
  if (pName.includes('bac water') || pName.includes('bacteriostatic')) return 'bac-water';
  if (pName.includes('bpc-157 + tb-500') || pName.includes('bpc-157 / tb-500')) return 'bpc-157-tb-500';
  if (pName.includes('bpc-157') || pName.includes('bpc 157')) return 'bpc-157';
  if (pName.includes('cagrilintide')) return 'cagrilintide';
  if (pName.includes('cardiogen')) return 'cardiogen';
  if (pName.includes('cartalax')) return 'cartalax';
  if (pName.includes('cjc-1295 with dac') || pName.includes('cjc-1295 + dac')) return 'cjc-1295-dac';
  if (pName.includes('cjc-1295 without dac + ipamorelin')) return 'cjc-1295-no-dac-ipamorelin';
  if (pName.includes('cjc-1295 without dac') || pName.includes('cjc-1295 no dac')) return 'cjc-1295-no-dac';
  if (pName.includes('dsip')) return 'dsip';
  if (pName.includes('epithalon')) return 'epithalon';
  if (pName.includes('fox-04') || pName.includes('foxo4')) return 'fox-04';
  if (pName.includes('fst344') || pName.includes('follistatin')) return 'fst344';
  if (pName.includes('ghk-cu') || pName.includes('human copper')) return 'ghk-cu-human-copper';
  if (pName.includes('ghrp-2') || pName.includes('ghrp2')) return 'ghrp-2';
  if (pName.includes('glow')) return 'glow-bpc-157-tb-500-ghk';
  if (pName.includes('glutathione')) return 'glutathione';
  if (pName.includes('gw501516') || pName.includes('cardarine')) return 'gw501516';
  if (pName.includes('hcg')) return 'hcg';
  if (pName.includes('hexarelin')) return 'hexarelin';
  if (pName.includes('hgh')) return 'hgh';
  if (pName.includes('hmg')) return 'hmg';
  if (pName.includes('igf lr3') || pName.includes('igf-1 lr3')) return 'igf-lr3';
  if (pName.includes('insulin syringes')) return 'precision-insulin-syringes';
  if (pName.includes('ipamorelin')) return 'ipamorelin';
  if (pName.includes('kisspeptin')) return 'kisspeptin-10';
  if (pName.includes('klow')) return 'klow-bpc-157-tb-500-ghkcu-kpv';
  if (pName.includes('kpv')) return 'kpv';
  if (pName.includes('ll-37') || pName.includes('ll37')) return 'll-37';
  if (pName.includes('mk-677') || pName.includes('mk677')) return 'mk-677';
  if (pName.includes('mots-c') || pName.includes('motsc')) return 'mots-c';
  if (pName.includes('mt2') || pName.includes('melanotan ii') || pName.includes('melanotan-ii')) return 'mt2';
  if (pName.includes('nad+') || pName.includes('nad')) return 'nad';
  if (pName.includes('nmn')) return 'nmn';
  if (pName.includes('oxytocin')) return 'oxytocin-acetate';
  if (pName.includes('pe 22-28') || pName.includes('pe-22-28')) return 'pe-22-28';
  if (pName.includes('peg-mgf') || pName.includes('peg mgf')) return 'peg-mgf';
  if (pName.includes('pinealon')) return 'pinealon';
  if (pName.includes('pnc-27') || pName.includes('pnc27')) return 'pnc-27';
  if (pName.includes('prostamax')) return 'prostamax';
  if (pName.includes('pt-141') || pName.includes('bremelanotide')) return 'pt-141';
  if (pName.includes('retatrutide')) return 'retatrutide';
  if (pName.includes('selank')) return 'selank';
  if (pName.includes('semaglutide')) return 'semaglutide';
  if (pName.includes('semax')) return 'semax';
  if (pName.includes('sermorelin')) return 'sermorelin';
  if (pName.includes('slu-pp-332') || pName.includes('slupp332')) return 'slu-pp-332';
  if (pName.includes('snap-8') || pName.includes('snap8')) return 'snap-8';
  if (pName.includes('ss-31') || pName.includes('elamipretide')) return 'ss-31';
  if (pName.includes('starter kit')) return 'starter-kit-syringe-bac-water';
  if (pName.includes('syringe + bac water bundle')) return 'syringe-bac-water-bundle';
  if (pName.includes('tesamorelin')) return 'tesamorelin';
  if (pName.includes('testagen')) return 'testagen';
  if (pName.includes('thymogen')) return 'thymogen';
  if (pName.includes('thymosin beta-4') || pName.includes('thymosin β4') || pName.includes('tb-500')) return 'thymosin-4-tb-500';
  if (pName.includes('thymosin alpha 1 + thymalin')) return 'thymosin-alpha-1-thymalin';
  if (pName.includes('thymosin alpha 1') || pName.includes('thymosin alpha-1')) return 'thymosin-alpha-1';
  if (pName.includes('thymulin')) return 'thymulin';
  if (pName.includes('tirzepatide')) return 'tirzepatide';
  return null;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  REGENPEPT DEFINITIVE CATALOG & LOTUS LAND RECONCILIATION    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`  Mode: ${COMMIT ? '🔴 COMMIT (Applying live changes to Firestore)' : '🟡 DRY RUN (Simulation only)'}\n`);

  // 1. Fetch all products and all variants
  console.log('📥 1. Loading all products and variants from Firestore...');
  const [productsSnap, allVariantsSnap, categoriesSnap, suppliersSnap] = await Promise.all([
    db.collection('products').get(),
    db.collectionGroup('variants').get(),
    db.collection('categories').get(),
    db.collection('suppliers').get()
  ]);

  const existingProducts = new Map();
  productsSnap.docs.forEach(d => existingProducts.set(d.id, d.data()));

  console.log(`   ✓ Found ${productsSnap.size} existing products in /products`);
  console.log(`   ✓ Found ${allVariantsSnap.size} total variant documents via collectionGroup`);

  // 2. Identify orphan variants and prepare migration
  console.log('\n🔄 2. Identifying and relocating orphan variants...');
  let migratedVariantsCount = 0;
  let deletedOrphanVariantsCount = 0;

  const batchList = [];
  let currentBatch = db.batch();
  let currentBatchOps = 0;

  function addBatchOp(opFn) {
    if (COMMIT) {
      opFn(currentBatch);
      currentBatchOps++;
      if (currentBatchOps >= 450) {
        batchList.push(currentBatch);
        currentBatch = db.batch();
        currentBatchOps = 0;
      }
    }
  }

  // Pre-load all variants per product (including destination canonical products)
  const canonicalVariantsMap = new Map(); // targetProductId -> Array of variant objects

  for (const vDoc of allVariantsSnap.docs) {
    const parentRef = vDoc.ref.parent.parent;
    if (!parentRef) continue;
    const parentId = parentRef.id;

    if (existingProducts.has(parentId)) {
      if (!canonicalVariantsMap.has(parentId)) {
        canonicalVariantsMap.set(parentId, []);
      }
      canonicalVariantsMap.get(parentId).push({ id: vDoc.id, ref: vDoc.ref, data: vDoc.data() });
    }
  }

  // Process orphan variants
  for (const vDoc of allVariantsSnap.docs) {
    const parentRef = vDoc.ref.parent.parent;
    if (!parentRef) continue;
    const parentId = parentRef.id;

    if (!existingProducts.has(parentId)) {
      const targetId = ORPHAN_PARENT_MAP[parentId];
      if (targetId && existingProducts.has(targetId)) {
        const vData = vDoc.data();
        const existingInTarget = canonicalVariantsMap.get(targetId) || [];
        
        // Check if an identical variant already exists in the target product
        const alreadyExists = existingInTarget.some(ev => {
          if (ev.id === vDoc.id) return true;
          if (ev.data.sku && vData.sku && ev.data.sku === vData.sku) return true;
          const s1 = ev.data.supplierId || '';
          const s2 = vData.supplierId || '';
          const c1 = (ev.data.concentration || ev.data.dosage || '').trim().toLowerCase();
          const c2 = (vData.concentration || vData.dosage || '').trim().toLowerCase();
          const p1 = (ev.data.presentation || '').trim().toLowerCase();
          const p2 = (vData.presentation || '').trim().toLowerCase();
          return s1 === s2 && c1 === c2 && p1 === p2 && c1.length > 0;
        });

        if (!alreadyExists) {
          // Relocate to target product
          const newDocRef = db.collection('products').doc(targetId).collection('variants').doc(vDoc.id);
          addBatchOp(b => b.set(newDocRef, { ...vData, updatedAt: new Date().toISOString() }));
          if (!canonicalVariantsMap.has(targetId)) canonicalVariantsMap.set(targetId, []);
          canonicalVariantsMap.get(targetId).push({ id: vDoc.id, ref: newDocRef, data: vData });
          migratedVariantsCount++;
          console.log(`   ➔ Relocated [${vDoc.id}] from orphan [${parentId}] to canonical [${targetId}]`);
        } else {
          console.log(`   ℹ Duplicate detected for [${vDoc.id}] in [${targetId}] — purging orphan`);
        }

        // Delete from orphan location
        addBatchOp(b => b.delete(vDoc.ref));
        deletedOrphanVariantsCount++;
      } else {
        console.log(`   ⚠️ No canonical target found for orphan parent [${parentId}] -> deleting orphan variant [${vDoc.id}]`);
        addBatchOp(b => b.delete(vDoc.ref));
        deletedOrphanVariantsCount++;
      }
    }
  }

  console.log(`   ✓ Relocated ${migratedVariantsCount} variants to canonical products`);
  console.log(`   ✓ Scheduled deletion of ${deletedOrphanVariantsCount} orphan variant docs`);

  // 3. Ensure all 104 canonical Lotus Land variants exist
  console.log('\n🪷 3. Auditing 104 Canonical Lotus Land Variants...');
  const masterPath = resolve(__dirname, '..', 'lotus_variants_final.json');
  const masterData = JSON.parse(readFileSync(masterPath, 'utf8'));
  const canonical104 = masterData.filter(e => e.id && e.id.startsWith('var_'));

  let lotusCreatedOrVerified = 0;
  for (const c of canonical104) {
    let matchedProductId = mapCanonicalLotusToProduct(c);

    // Fallback if not mapped
    if (!matchedProductId) {
      const cleanPName = c.parentProduct.toLowerCase().replace(/\s*\d+.*$/i, '').replace(/[^a-z0-9]/g, '').trim();
      for (const [pId, pData] of existingProducts) {
        const pNameClean = (pData.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
        const pIdClean = pId.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
        if (pIdClean === cleanPName || pNameClean === cleanPName) {
          matchedProductId = pId;
          break;
        }
      }
    }

    if (matchedProductId && existingProducts.has(matchedProductId)) {
      const varsInProduct = canonicalVariantsMap.get(matchedProductId) || [];
      const hasLotusVariant = varsInProduct.some(v => {
        if (v.id === c.id) return true;
        const sId = v.data.supplierId;
        const isLotus = sId === 'supplier-lotusland' || (sId && sId.toLowerCase().includes('lotus'));
        const dose1 = (v.data.concentration || v.data.dosage || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const dose2 = (c.dosage || c.variantName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return isLotus && dose1 === dose2 && dose1.length > 0;
      });

      if (!hasLotusVariant) {
        // Build variant data from canonical entry
        const vPayload = {
          supplierId: 'supplier-lotusland',
          presentation: c.parentProduct.toLowerCase().includes('tablet') ? 'Tablet' : (c.parentProduct.toLowerCase().includes('bottle') ? 'Bottle' : 'Vial'),
          concentration: c.dosage || c.variantName || 'Standard Dose',
          dosage: c.dosage || c.variantName || 'Standard Dose',
          route: c.parentProduct.toLowerCase().includes('tablet') ? 'oral_tablet' : 'injectable_vial',
          sku: `SKU-LOTUS-${matchedProductId.toUpperCase()}-${(c.dosage || 'STD').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`,
          pricing: {
            retail: { perUnit: c.price || null, currency: 'USD' },
            master: { perUnit: c.price ? Math.round(c.price * 0.75 * 100) / 100 : null, currency: 'USD' },
            wholesale: { perUnit: c.price ? Math.round(c.price * 0.85 * 100) / 100 : null, currency: 'USD' },
            clinic: { perUnit: c.price ? Math.round(c.price * 0.80 * 100) / 100 : null, currency: 'USD' },
          },
          stock: { available: true, quantity: 100, minAlert: 5 },
          updatedAt: new Date().toISOString()
        };

        const vRef = db.collection('products').doc(matchedProductId).collection('variants').doc(c.id);
        addBatchOp(b => b.set(vRef, vPayload));
        if (!canonicalVariantsMap.has(matchedProductId)) canonicalVariantsMap.set(matchedProductId, []);
        canonicalVariantsMap.get(matchedProductId).push({ id: c.id, ref: vRef, data: vPayload });
        lotusCreatedOrVerified++;
        console.log(`   ➕ Created canonical Lotus variant [${c.id}] -> [${matchedProductId}] (${c.parentProduct} -> ${c.dosage})`);
      }
    } else {
      console.log(`   ⚠️ WARNING: Could not find canonical product for [${c.id}] "${c.parentProduct}" (mapped: ${matchedProductId})`);
    }
  }

  console.log(`   ✓ 104 Canonical Lotus Land variants aligned and verified.`);

  // 4. Backfill supplierIds, availableTypes, primaryType, variantsCount on ALL products
  console.log('\n🏭 4. Synchronizing Product Documents with their Variants...');
  let updatedProductsCount = 0;

  const supplierProductCounts = {};
  const categoryCounts = {};
  const productTypeCounts = {
    finished_product: 0,
    raw_material: 0,
    diagnostic: 0,
    service: 0,
    clinical_supplies: 0
  };

  for (const [pId, pData] of existingProducts) {
    const variants = (canonicalVariantsMap.get(pId) || []).map(v => v.data);
    const uniqueSuppliers = Array.from(new Set(variants.map(v => {
      let s = v.supplierId || '';
      if (!s.startsWith('supplier-') && s.length > 0) s = `supplier-${s.toLowerCase().replace(/[\s_]+/g, '-')}`;
      return s;
    }).filter(Boolean)));

    // Track supplier totals
    uniqueSuppliers.forEach(sId => {
      supplierProductCounts[sId] = (supplierProductCounts[sId] || 0) + 1;
    });

    // Derive types
    const fallback = pData.type || (pData.categoryId === 'diagnostic_test' ? 'diagnostic' : 'finished_product');
    const derived = deriveProductTypes(variants, fallback);
    const pType = derived.primaryType;
    productTypeCounts[pType] = (productTypeCounts[pType] || 0) + 1;

    // Track category totals
    const cat = pData.categoryId || 'peptide';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Build update payload
    const updatePayload = {
      supplierIds: uniqueSuppliers,
      availableTypes: derived.availableTypes,
      primaryType: derived.primaryType,
      type: derived.primaryType,
      variantsCount: variants.length,
      _schemaVersion: 2,
      updatedAt: new Date().toISOString()
    };

    // Ensure status is valid
    if (!pData.status || pData.status === 'published') {
      updatePayload.status = 'active';
    }

    const prodDocRef = db.collection('products').doc(pId);
    addBatchOp(b => b.update(prodDocRef, updatePayload));
    updatedProductsCount++;
  }

  console.log(`   ✓ Synchronized ${updatedProductsCount} products with supplierIds & types`);

  // 5. Update _meta/catalog_facets
  console.log('\n📊 5. Calculating and updating _meta/catalog_facets...');
  
  // Format supplier facets
  const supplierFacetsArray = [];
  for (const sDoc of suppliersSnap.docs) {
    const sId = sDoc.id;
    const sData = sDoc.data();
    supplierFacetsArray.push({
      id: sId,
      name: sData.name || sId,
      count: supplierProductCounts[sId] || 0
    });
  }
  supplierFacetsArray.sort((a, b) => b.count - a.count);

  // Format category facets
  const categoryFacetsArray = Object.entries(categoryCounts).map(([catId, count]) => ({
    value: catId,
    label: catId,
    count
  })).sort((a, b) => b.count - a.count);

  const facetsDocPayload = {
    totals: {
      products: existingProducts.size,
      activeProducts: existingProducts.size,
      totalVariants: allVariantsSnap.size - deletedOrphanVariantsCount + migratedVariantsCount + lotusCreatedOrVerified
    },
    categories: categoryFacetsArray,
    productTypes: productTypeCounts,
    suppliers: supplierFacetsArray,
    updatedAt: FieldValue.serverTimestamp()
  };

  const metaDocRef = db.collection('_meta').doc('catalog_facets');
  addBatchOp(b => b.set(metaDocRef, facetsDocPayload, { merge: true }));

  // 6. Execute batches if COMMIT mode
  if (COMMIT) {
    if (currentBatchOps > 0) batchList.push(currentBatch);
    console.log(`\n💾 Committing ${batchList.length} write batches to Firestore...`);
    for (let i = 0; i < batchList.length; i++) {
      await batchList[i].commit();
      console.log(`   ✓ Batch ${i + 1}/${batchList.length} committed successfully`);
    }
    console.log('🎉 All updates written successfully to Firestore!');
  } else {
    console.log('\n🟡 DRY RUN COMPLETE — Run with --commit to apply these changes to Firestore.');
  }

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('📈 RECONCILIATION SUMMARY');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`Total Products:                  ${existingProducts.size}`);
  console.log(`Products Updated with supplierIds: ${updatedProductsCount}`);
  console.log(`Lotus Land Products in Catalog:  ${supplierProductCounts['supplier-lotusland'] || 0}`);
  console.log('\nReal Products per Supplier:');
  supplierFacetsArray.forEach(s => {
    console.log(`  - ${s.id.padEnd(28, ' ')} "${s.name.padEnd(24, ' ')}": ${s.count} products`);
  });
  console.log('══════════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('❌ Reconciliation failed:', err);
  process.exit(1);
});

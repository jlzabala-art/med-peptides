#!/usr/bin/env node
/**
 * phase4_unified_migration.mjs
 *
 * Phase 4 — Unified Legacy Cleanup + Architectural Improvements + Supplements Merger
 * ══════════════════════════════════════════════════════════════════════════════════════
 *
 * Covers three blocks in a single script:
 *
 *   BLOQUE C — Supplements → Products Merger
 *     C1. Enrich 53 existing products with supplement metadata (fill-don't-overwrite)
 *     C2. Create 4 LDN dosage variants under products/ldn
 *     C3. Create 1 Vit D3 variant under products/vit-d3
 *     C4. Create 2 new products (lion-s-mane-mushroom, serrapeptase-300-000spu)
 *
 *   BLOQUE B — Architectural Improvements
 *     B1. Normalize variant pricing to standard schema
 *     B2. Denormalize supplierIds[] into product parent docs
 *     B3. Denormalize variantCount into product parent docs
 *     B4. Denormalize skus[] into product parent docs
 *
 *   BLOQUE A — Legacy Cleanup
 *     A5. Remove embedded variants[] arrays from product parent docs
 *     A6. Delete legacy collections (masterProducts, supplierOffers, supplierProducts, productVariants)
 *     C6. Delete supplements collection
 *
 * Usage:
 *   node scripts/phase4_unified_migration.mjs --dry-run          # Preview only
 *   node scripts/phase4_unified_migration.mjs --block=C          # Run only Bloque C
 *   node scripts/phase4_unified_migration.mjs --block=B          # Run only Bloque B
 *   node scripts/phase4_unified_migration.mjs --block=A          # Run only Bloque A
 *   node scripts/phase4_unified_migration.mjs                    # Run ALL blocks (LIVE)
 *
 * ══════════════════════════════════════════════════════════════════════════════════════
 */

import { db } from './lib/firebase-admin.mjs';
import admin from 'firebase-admin';

const DRY_RUN = process.argv.includes('--dry-run');
const BLOCK_FILTER = (() => {
  const arg = process.argv.find(a => a.startsWith('--block='));
  return arg ? arg.split('=')[1].toUpperCase() : null;
})();
const BATCH_SIZE = 400;

const FieldValue = admin.firestore.FieldValue;

// ── Utility: batched write helper ─────────────────────────────────────────────
async function commitBatches(operations) {
  const batches = [];
  let batch = db.batch();
  let count = 0;

  for (const op of operations) {
    op(batch);
    count++;
    if (count >= BATCH_SIZE) {
      batches.push(batch);
      batch = db.batch();
      count = 0;
    }
  }
  if (count > 0) batches.push(batch);

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would commit ${operations.length} operations in ${batches.length} batches`);
    return;
  }

  for (let i = 0; i < batches.length; i++) {
    await batches[i].commit();
    console.log(`  ✅ Batch ${i + 1}/${batches.length} committed`);
  }
}

// ── Utility: safe merge (fill, don't overwrite) ──────────────────────────────
function fillMerge(existing, source, fields) {
  const updates = {};
  for (const field of fields) {
    const srcVal = source[field];
    const dstVal = existing[field];

    if (srcVal === undefined || srcVal === null) continue;

    if (Array.isArray(srcVal)) {
      if (!Array.isArray(dstVal) || dstVal.length === 0) {
        updates[field] = srcVal;
      } else {
        // Merge arrays, deduplicate
        const merged = [...new Set([...dstVal, ...srcVal])];
        if (merged.length > dstVal.length) {
          updates[field] = merged;
        }
      }
    } else if (typeof srcVal === 'object') {
      if (!dstVal || typeof dstVal !== 'object' || Object.keys(dstVal).length === 0) {
        updates[field] = srcVal;
      }
      // If destination already has the object, don't overwrite
    } else {
      // Scalar: only fill if missing
      if (dstVal === undefined || dstVal === null || dstVal === '') {
        updates[field] = srcVal;
      }
    }
  }
  return updates;
}


// ══════════════════════════════════════════════════════════════════════════════
// BLOQUE C — Supplements → Products Merger
// ══════════════════════════════════════════════════════════════════════════════

const SUPPLEMENT_MERGE_FIELDS = [
  'typeData', 'clinical_benefits', 'mechanisms', 'goals', 'canonicalGoals',
  'protocols', 'semanticKeywords', 'commonly_combined_with', 'objective',
  'tags', 'synonyms', 'dosage',
];

// Supplements that should become VARIANTS of existing products (not standalone products)
const VARIANT_MAPPINGS = {
  'ldn-0-5mg': { parent: 'ldn', dosage: '0.5mg', name: 'LDN 0.5mg' },
  'ldn-1-5mg': { parent: 'ldn', dosage: '1.5mg', name: 'LDN 1.5mg' },
  'ldn-2-5mg': { parent: 'ldn', dosage: '2.5mg', name: 'LDN 2.5mg' },
  'ldn-4-5mg': { parent: 'ldn', dosage: '4.5mg', name: 'LDN 4.5mg' },
  'vit-d3-10-000iu-k2': { parent: 'vit-d3', dosage: '10,000 IU + K2', name: 'Vitamin D3 10,000 IU + K2' },
};

// Supplements that need to be created as NEW products
const NEW_PRODUCT_SLUGS = ['lion-s-mane-mushroom', 'serrapeptase-300-000spu'];

async function runBloqueC() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  BLOQUE C — Supplements → Products Merger                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // 1. Load all supplements
  const suppSnap = await db.collection('supplements').get();
  const supplements = {};
  suppSnap.docs.forEach(d => { supplements[d.id] = { id: d.id, ...d.data() }; });
  console.log(`📦 Loaded ${Object.keys(supplements).length} supplements from Firestore\n`);

  // 2. Load all products (just ids + keys for matching)
  const prodSnap = await db.collection('products').get();
  const products = {};
  prodSnap.docs.forEach(d => { products[d.id] = { id: d.id, ...d.data() }; });
  console.log(`📦 Loaded ${Object.keys(products).length} products from Firestore\n`);

  // ── C1: Enrich existing products with supplement metadata ──────────────────
  console.log('── C1: Enriching existing products with supplement metadata ──');
  const enrichOps = [];
  let enrichCount = 0;

  for (const [slug, supp] of Object.entries(supplements)) {
    if (VARIANT_MAPPINGS[slug] || NEW_PRODUCT_SLUGS.includes(slug)) continue;
    
    const product = products[slug];
    if (!product) {
      console.log(`  ⚠️  Supplement "${slug}" has no matching product — skipping`);
      continue;
    }

    const updates = fillMerge(product, supp, SUPPLEMENT_MERGE_FIELDS);
    
    // Always add supplementData traceability + type tag
    updates['supplementData'] = {
      migrated: true,
      originalSupplementId: slug,
      migratedAt: new Date().toISOString(),
    };
    
    // Ensure type: 'supplement' if not already set to something more specific
    if (!product.type || product.type === 'unknown') {
      updates['type'] = 'supplement';
    }

    if (Object.keys(updates).length > 0) {
      enrichOps.push((batch) => {
        batch.update(db.collection('products').doc(slug), updates);
      });
      enrichCount++;
      
      const fieldNames = Object.keys(updates).filter(k => k !== 'supplementData').join(', ');
      if (fieldNames) {
        console.log(`  ✏️  ${slug}: merging [${fieldNames}]`);
      }
    }
  }

  console.log(`\n  📊 Total products to enrich: ${enrichCount}`);
  await commitBatches(enrichOps);

  // ── C2 + C3: Create variant documents for LDN dosages + VitD3 ────────────
  console.log('\n── C2/C3: Creating dosage variants ──');
  const variantOps = [];

  for (const [slug, mapping] of Object.entries(VARIANT_MAPPINGS)) {
    const supp = supplements[slug];
    if (!supp) {
      console.log(`  ⚠️  Supplement "${slug}" not found — skipping variant creation`);
      continue;
    }

    const parentDoc = products[mapping.parent];
    if (!parentDoc) {
      console.log(`  ⚠️  Parent product "${mapping.parent}" not found — skipping variant for ${slug}`);
      continue;
    }

    const variantData = {
      name: mapping.name,
      dosage: mapping.dosage,
      slug: slug,
      status: 'active',
      source: 'supplement_migration',
      quantity: supp.quantity || null,
      desc: supp.desc || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Copy pricing if supplement has it
    if (supp.price) variantData.price = supp.price;
    if (supp.typeData?.dosageRange) variantData.dosageRange = supp.typeData.dosageRange;

    const variantRef = db.collection('products').doc(mapping.parent)
      .collection('variants').doc(slug);
    
    variantOps.push((batch) => {
      batch.set(variantRef, variantData);
    });

    console.log(`  ➕ ${mapping.parent}/variants/${slug} → ${mapping.name}`);
  }

  console.log(`\n  📊 Total variants to create: ${variantOps.length}`);
  await commitBatches(variantOps);

  // ── C4: Create 2 new products ──────────────────────────────────────────────
  console.log('\n── C4: Creating new products ──');
  const newProductOps = [];

  for (const slug of NEW_PRODUCT_SLUGS) {
    const supp = supplements[slug];
    if (!supp) {
      console.log(`  ⚠️  Supplement "${slug}" not found — skipping`);
      continue;
    }

    // Build canonical product from supplement data
    const productData = {
      name: supp.name,
      slug: slug,
      desc: supp.desc || '',
      status: 'draft',  // New products start as draft for human review
      type: 'supplement',
      category: supp.original_category || supp.category || 'Other',
      image: supp.image || '/assets/vials/generic-supplement.png',
      dosage: supp.dosage || null,
      quantity: supp.quantity || null,
      tags: supp.tags || [],
      goals: supp.goals || [],
      canonicalGoals: supp.canonicalGoals || [],
      mechanisms: supp.mechanisms || [],
      clinical_benefits: supp.clinical_benefits || [],
      protocols: supp.protocols || [],
      semanticKeywords: supp.semanticKeywords || [],
      commonly_combined_with: supp.commonly_combined_with || [],
      synonyms: supp.synonyms || [],
      objective: supp.objective || '',
      typeData: supp.typeData || {},
      supplementData: {
        migrated: true,
        originalSupplementId: slug,
        migratedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    newProductOps.push((batch) => {
      batch.set(db.collection('products').doc(slug), productData);
    });

    console.log(`  ➕ products/${slug} → "${supp.name}" (status: draft)`);
  }

  console.log(`\n  📊 Total new products: ${newProductOps.length}`);
  await commitBatches(newProductOps);
}


// ══════════════════════════════════════════════════════════════════════════════
// BLOQUE B — Architectural Improvements
// ══════════════════════════════════════════════════════════════════════════════

async function runBloqueB() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  BLOQUE B — Architectural Improvements                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const prodSnap = await db.collection('products').get();
  const products = prodSnap.docs.map(d => ({ ref: d.ref, id: d.id, ...d.data() }));
  console.log(`📦 Loaded ${products.length} products\n`);

  // ── B1: Normalize variant pricing ──────────────────────────────────────────
  console.log('── B1: Normalizing variant pricing ──');
  let pricingOps = [];
  let pricingNormCount = 0;
  let pricingSkipCount = 0;

  for (const product of products) {
    const variantsSnap = await product.ref.collection('variants').get();
    if (variantsSnap.empty) continue;

    for (const vDoc of variantsSnap.docs) {
      const v = vDoc.data();
      
      // Skip if already has normalized pricing
      if (v.pricing?.tiers && Array.isArray(v.pricing.tiers) && v.pricing.tiers.length > 0) {
        pricingSkipCount++;
        continue;
      }

      const normalizedPricing = normalizePricing(v);
      if (!normalizedPricing) {
        continue; // No pricing data at all
      }

      pricingOps.push((batch) => {
        batch.update(vDoc.ref, { pricing: normalizedPricing });
      });
      pricingNormCount++;
    }
  }

  console.log(`  📊 Variants with normalized pricing: ${pricingNormCount}`);
  console.log(`  📊 Variants already normalized (skipped): ${pricingSkipCount}`);
  await commitBatches(pricingOps);

  // ── B2 + B3 + B4: Denormalize supplierIds, variantCount, skus ─────────────
  console.log('\n── B2/B3/B4: Denormalizing supplierIds, variantCount, skus ──');
  const denormOps = [];
  let denormCount = 0;

  for (const product of products) {
    const variantsSnap = await product.ref.collection('variants').get();
    const supplierIds = new Set();
    const skus = new Set();

    for (const vDoc of variantsSnap.docs) {
      const v = vDoc.data();
      if (v.supplierId) supplierIds.add(v.supplierId);
      if (v.supplierName) supplierIds.add(v.supplierName); // Some use supplierName
      if (v.sku) skus.add(v.sku);
      if (v.supplier_sku) skus.add(v.supplier_sku);
    }

    const updates = {
      variantCount: variantsSnap.size,
      supplierIds: [...supplierIds].filter(Boolean),
      skus: [...skus].filter(Boolean),
      _denormalizedAt: new Date().toISOString(),
    };

    denormOps.push((batch) => {
      batch.update(product.ref, updates);
    });
    denormCount++;

    if (supplierIds.size > 0 || skus.size > 0) {
      console.log(`  📋 ${product.id}: ${variantsSnap.size} variants, ${supplierIds.size} suppliers, ${skus.size} SKUs`);
    }
  }

  console.log(`\n  📊 Total products denormalized: ${denormCount}`);
  await commitBatches(denormOps);
}

/**
 * Normalize pricing from various legacy formats into the canonical schema:
 * { currency, tiers: [{ minQty, maxQty, unitPrice }], acquisitionCost, retailPrice, lastUpdated }
 */
function normalizePricing(variant) {
  const pricing = {
    currency: 'EUR',
    tiers: [],
    lastUpdated: new Date().toISOString(),
  };

  let hasAnyPricing = false;

  // Format 1: pricing_tiers array (NP Labs style)
  if (Array.isArray(variant.pricing_tiers) && variant.pricing_tiers.length > 0) {
    pricing.tiers = variant.pricing_tiers.map((t, idx, arr) => ({
      minQty: t.min_qty || t.minQty || 1,
      maxQty: t.max_qty || t.maxQty || (idx < arr.length - 1 ? (arr[idx + 1].min_qty || arr[idx + 1].minQty) - 1 : null),
      unitPrice: parseFloat(t.price || t.unit_price || t.unitPrice || 0),
    })).filter(t => t.unitPrice > 0);
    hasAnyPricing = pricing.tiers.length > 0;
  }

  // Format 2: cost_tiers object (Lotusland style: { cost_10: 150, cost_25: 130 })
  if (!hasAnyPricing && variant.cost_tiers && typeof variant.cost_tiers === 'object') {
    const entries = Object.entries(variant.cost_tiers)
      .map(([key, val]) => {
        const qty = parseInt(key.replace(/\D/g, '')) || 1;
        return { minQty: qty, unitPrice: parseFloat(val) };
      })
      .filter(e => e.unitPrice > 0)
      .sort((a, b) => a.minQty - b.minQty);

    pricing.tiers = entries.map((e, idx, arr) => ({
      ...e,
      maxQty: idx < arr.length - 1 ? arr[idx + 1].minQty - 1 : null,
    }));
    hasAnyPricing = pricing.tiers.length > 0;
  }

  // Format 3: Simple unit_price or price field
  if (!hasAnyPricing) {
    const unitPrice = parseFloat(variant.unit_price || variant.price || variant.unitPrice || 0);
    if (unitPrice > 0) {
      pricing.tiers = [{ minQty: 1, maxQty: null, unitPrice }];
      hasAnyPricing = true;
    }
  }

  // Format 4: nested pricing object with price field
  if (!hasAnyPricing && variant.pricing && typeof variant.pricing === 'object') {
    const p = variant.pricing;
    const unitPrice = parseFloat(p.unit_price || p.price || p.unitPrice || 0);
    if (unitPrice > 0) {
      pricing.tiers = [{ minQty: 1, maxQty: null, unitPrice }];
      hasAnyPricing = true;
    }
    if (p.currency) pricing.currency = p.currency;
  }

  if (!hasAnyPricing) return null;

  // Extract acquisition cost if available
  const acqCost = parseFloat(
    variant.acquisition_cost || variant.acquisitionCost || variant.cost || 0
  );
  if (acqCost > 0) pricing.acquisitionCost = acqCost;

  // Extract retail price if available
  const retailPrice = parseFloat(
    variant.retail_price || variant.retailPrice || variant.pvp || 0
  );
  if (retailPrice > 0) pricing.retailPrice = retailPrice;

  return pricing;
}


// ══════════════════════════════════════════════════════════════════════════════
// BLOQUE A — Legacy Cleanup
// ══════════════════════════════════════════════════════════════════════════════

async function runBloqueA() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  BLOQUE A — Legacy Cleanup                                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ── A5: Remove embedded variants[] arrays ──────────────────────────────────
  console.log('── A5: Removing embedded variants[] arrays from product docs ──');
  const prodSnap = await db.collection('products').get();
  const removeVariantsOps = [];
  let variantsArrayCount = 0;

  for (const d of prodSnap.docs) {
    const data = d.data();
    if (Array.isArray(data.variants) && data.variants.length > 0) {
      removeVariantsOps.push((batch) => {
        batch.update(d.ref, { variants: FieldValue.delete() });
      });
      variantsArrayCount++;
    }
  }

  console.log(`  📊 Products with embedded variants[]: ${variantsArrayCount}`);
  await commitBatches(removeVariantsOps);

  // ── A6 + C6: Delete legacy collections ─────────────────────────────────────
  const LEGACY_COLLECTIONS = [
    'masterProducts',
    'supplierOffers',
    'supplierProducts',
    'productVariants',
    'supplements',
  ];

  for (const collName of LEGACY_COLLECTIONS) {
    console.log(`\n── Deleting collection: ${collName} ──`);
    await deleteCollection(collName);
  }
}

async function deleteCollection(collectionName) {
  const snap = await db.collection(collectionName).get();
  
  if (snap.empty) {
    console.log(`  ℹ️  ${collectionName}: already empty (0 docs)`);
    return;
  }

  console.log(`  📊 ${collectionName}: ${snap.size} documents to delete`);

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would delete ${snap.size} documents from ${collectionName}`);
    return;
  }

  // Also delete subcollections for supplements (they have variants/)
  if (collectionName === 'supplements') {
    for (const d of snap.docs) {
      const subSnap = await d.ref.collection('variants').get();
      if (!subSnap.empty) {
        const subOps = subSnap.docs.map(sd => (batch) => batch.delete(sd.ref));
        await commitBatches(subOps);
        console.log(`  🗑️  Deleted ${subSnap.size} variants from supplements/${d.id}`);
      }
    }
  }

  const deleteOps = snap.docs.map(d => (batch) => batch.delete(d.ref));
  await commitBatches(deleteOps);
  console.log(`  ✅ Deleted ${snap.size} documents from ${collectionName}`);
}


// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 4 — Unified Legacy Cleanup + Supplements Merger');
  console.log(`  Mode: ${DRY_RUN ? '🔍 DRY RUN (no writes)' : '🔥 LIVE (writing to Firestore)'}`);
  if (BLOCK_FILTER) console.log(`  Block filter: ${BLOCK_FILTER}`);
  console.log('═══════════════════════════════════════════════════════════════');

  const shouldRun = (block) => !BLOCK_FILTER || BLOCK_FILTER === block;

  if (shouldRun('C')) await runBloqueC();
  if (shouldRun('B')) await runBloqueB();
  if (shouldRun('A')) await runBloqueA();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  ✅ Phase 4 migration complete!');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

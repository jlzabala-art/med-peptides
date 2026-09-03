/**
 * migrate-variants-to-subcollections.mjs
 * 
 * Migrates embedded `variants` arrays from product documents into proper
 * Firestore subcollections: products/{productId}/variants/{variantId}
 * 
 * IDEMPOTENT: Safe to re-run. Uses deterministic IDs and merge writes.
 * 
 * Supports ALL product types:
 *   - peptide (dosage, presentation, route)
 *   - testing / dna_test (sampleType, analysisType)
 *   - subscription (billingType, billingCycle)
 *   - blood_analysis (sampleType)
 *   - proteomics (sampleType)
 *   - supplement, compounded, device, cosmetic
 * 
 * Usage:
 *   node scripts/migrate-variants-to-subcollections.mjs [--dry-run]
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');

// ─── Firebase Init ────────────────────────────────────────────────────
function initFirebase() {
  const saPath = resolve(__dirname, '..', 'serviceAccountKey.json');
  if (existsSync(saPath)) {
    const sa = JSON.parse(readFileSync(saPath, 'utf8'));
    initializeApp({ credential: cert(sa) });
  } else {
    // Falls back to GOOGLE_APPLICATION_CREDENTIALS or gcloud auth
    initializeApp({ projectId: 'med-peptides-app' });
  }
  return getFirestore();
}

// ─── Helpers ──────────────────────────────────────────────────────────
function slugify(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateVariantId(productId, variant, productData) {
  // If the variant already has a deterministic ID, use it
  if (variant.variantId && !variant.variantId.includes(' ')) {
    return variant.variantId;
  }
  if (variant.id && !variant.id.includes(' ')) {
    return variant.id;
  }

  // Generate deterministic ID based on product type
  const category = productData.category || productData.productType || '';
  const supplierId = (variant.supplierId || productData.supplierId || 'unknown')
    .replace('supplier-', '');

  if (category === 'subscription') {
    const cycle = variant.pricing?.billingCycle || 'default';
    return `${productId}-${cycle}`;
  }

  if (['dna_test', 'blood_analysis', 'proteomics'].includes(category)) {
    const label = slugify(variant.label || 'default');
    return `${productId}-${label}`;
  }

  // Peptides and physical products
  const dosage = slugify(variant.dosage || productData.dose || '');
  const presentation = slugify(variant.presentation || productData.formatId || 'default');
  
  if (dosage) {
    return `${productId}-${dosage}-${presentation}-${supplierId}`;
  }
  
  return `${productId}-${supplierId}-default`;
}

function buildVariantDoc(variant, productData, productId, variantId) {
  const now = new Date().toISOString();
  const category = productData.category || productData.productType || 'peptide';
  
  const doc = {
    variantId,
    label: variant.label || variant.name || productData.canonicalName || productData.name || '',
    isDefault: variant.isDefault === true,
    
    // Supplier info
    supplierId: variant.supplierId || productData.supplierId || productData.supplier_id || null,
    supplierName: variant.supplierName || productData.supplierName || productData.supplier || null,
    
    // Status
    status: variant.status || productData.status || 'published',
    isActive: (variant.status || productData.status || 'published') !== 'archived',
    
    // Presentation (universal)
    presentation: variant.presentation || productData.presentation || productData.dosage_form || null,
    
    // Pricing
    unit_price: variant.unit_price || null,
    pricing_tiers: variant.pricing_tiers || [],
    
    // Source tracking
    source: 'migration_v2_embedded_to_subcollection',
    migratedAt: now,
    createdAt: variant.createdAt || productData.createdAt || now,
    updatedAt: now,
    sortOrder: variant.sortOrder || 0,
  };

  // ── Type-specific fields ────────────────────────────────────────────
  
  // Peptides / physical products
  if (['peptide', 'supplement', 'compounded', 'cosmetic', 'device'].includes(category)) {
    doc.dosage = variant.dosage || productData.dose || null;
    doc.dosageUnit = variant.dosageUnit || null;
    doc.dosageNumeric = variant.dosageNumeric || null;
    doc.dosageForm = variant.dosageForm || productData.dosage_form || null;
    doc.route = variant.route || null;
    doc.sku = variant.sku || null;
    doc.brand = variant.brand || null;
  }

  // DNA tests / testing
  if (['dna_test', 'testing', 'blood_analysis', 'proteomics'].includes(category)) {
    doc.sampleType = variant.sampleType || 
      (category === 'dna_test' ? 'saliva' : 
       category === 'blood_analysis' ? 'blood' : 
       category === 'proteomics' ? 'blood' : null);
    doc.analysisType = variant.analysisType || null;
    doc.turnaroundDays = variant.turnaroundDays || null;
    if (variant.minQty) doc.minQty = variant.minQty;
  }

  // Subscriptions
  if (category === 'subscription') {
    doc.billingType = 'recurring';
    doc.billingCycle = variant.pricing?.billingCycle || 
                       productData.pricing?.billingCycle || 'monthly';
    doc.renewalPrice = variant.pricing?.msrp || variant.pricing?.basePrice || null;
    doc.sku = variant.sku || null;
    // Override pricing for subscriptions
    if (variant.pricing) {
      doc.subscriptionPricing = {
        basePrice: variant.pricing.basePrice || null,
        msrp: variant.pricing.msrp || null,
        currency: variant.pricing.currency || 'EUR',
        billingCycle: variant.pricing.billingCycle || 'monthly',
      };
    }
  }

  // Additional fields from variant
  if (variant.notes) doc.notes = variant.notes;

  // Clean nulls for Firestore
  Object.keys(doc).forEach(key => {
    if (doc[key] === null || doc[key] === undefined) {
      delete doc[key];
    }
  });

  return doc;
}

// ─── Main Migration ───────────────────────────────────────────────────
async function migrateVariants(db) {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  
  const stats = {
    totalProducts: 0,
    productsWithEmbeddedVariants: 0,
    productsWithExistingSubcollection: 0,
    productsWithoutVariants: 0,
    variantsCreated: 0,
    variantsSkipped: 0,
    defaultVariantsCreated: 0,
    errors: [],
    byCategory: {},
  };

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  VARIANT MIGRATION: Embedded Arrays → Subcollections`);
  console.log(`  Mode: ${DRY_RUN ? '🧪 DRY RUN' : '🔥 LIVE'}`);
  console.log(`  Products found: ${snapshot.size}`);
  console.log(`${'═'.repeat(60)}\n`);

  let batch = db.batch();
  let batchCount = 0;
  let totalBatches = 0;
  const BATCH_LIMIT = 450; // Stay under 500

  async function commitBatch() {
    if (batchCount > 0) {
      await batch.commit();
      totalBatches++;
      console.log(`   ⚡ Batch #${totalBatches} committed (${batchCount} writes)`);
      batch = db.batch(); // Create fresh batch
      batchCount = 0;
    }
  }

  for (const doc of snapshot.docs) {
    stats.totalProducts++;
    const productId = doc.id;
    const data = doc.data();
    const category = data.category || data.productType || 'unknown';

    // Track by category
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

    // Check if variants subcollection already exists
    const existingVariants = await doc.ref.collection('variants').limit(1).get();
    const hasSubcollection = !existingVariants.empty;

    // Check if embedded variants array exists
    const embeddedVariants = Array.isArray(data.variants) ? data.variants : [];

    if (hasSubcollection && embeddedVariants.length === 0) {
      // Already migrated, skip
      stats.productsWithExistingSubcollection++;
      continue;
    }

    if (embeddedVariants.length > 0) {
      stats.productsWithEmbeddedVariants++;
      console.log(`📦 ${productId} (${category}) — ${embeddedVariants.length} embedded variant(s)`);

      for (const variant of embeddedVariants) {
        const variantId = generateVariantId(productId, variant, data);
        const variantDoc = buildVariantDoc(variant, data, productId, variantId);

        if (DRY_RUN) {
          console.log(`   ├─ [DRY] Would create: variants/${variantId}`);
          console.log(`   │  label: "${variantDoc.label}", price: ${variantDoc.unit_price || 'N/A'}`);
          stats.variantsCreated++;
        } else {
          const variantRef = doc.ref.collection('variants').doc(variantId);
          batch.set(variantRef, variantDoc, { merge: true });
          batchCount++;
          stats.variantsCreated++;
          console.log(`   ├─ ✅ variants/${variantId}`);

          if (batchCount >= BATCH_LIMIT) {
            await commitBatch();
          }
        }
      }
    } else if (!hasSubcollection) {
      // No variants at all — create default variant
      stats.productsWithoutVariants++;
      const variantId = `${productId}-default`;
      
      const defaultVariant = buildVariantDoc(
        {
          label: data.canonicalName || data.name || data.displayName || productId,
          isDefault: true,
          unit_price: data.pricing?.retail?.perUnit || data.pricing?.msrp || null,
          pricing_tiers: data.pricing?.retail?.perUnit 
            ? [{ min_qty: 1, max_qty: null, price: data.pricing.retail.perUnit, currency: data.pricing?.retail?.currency || 'EUR' }]
            : [],
        },
        data,
        productId,
        variantId
      );

      if (DRY_RUN) {
        console.log(`📦 ${productId} (${category}) — creating DEFAULT variant`);
        console.log(`   └─ [DRY] Would create: variants/${variantId}`);
        stats.defaultVariantsCreated++;
      } else {
        const variantRef = doc.ref.collection('variants').doc(variantId);
        batch.set(variantRef, defaultVariant, { merge: true });
        batchCount++;
        stats.defaultVariantsCreated++;
        console.log(`📦 ${productId} (${category}) — ✅ DEFAULT variant created`);

        if (batchCount >= BATCH_LIMIT) {
          await commitBatch();
        }
      }
    }
  }

  // Commit remaining writes
  if (!DRY_RUN) {
    await commitBatch();
  }

  return stats;
}

// ─── Supplier Analytics Update ────────────────────────────────────────
async function updateSupplierAnalytics(db) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  UPDATING SUPPLIER ANALYTICS`);
  console.log(`${'─'.repeat(60)}\n`);

  const suppliersSnap = await db.collection('suppliers').get();
  const variantsSnap = await db.collectionGroup('variants').get();

  // Build supplier → variants map
  const supplierMap = {};
  const supplierProducts = {}; // supplierId → Set of productIds

  for (const varDoc of variantsSnap.docs) {
    const data = varDoc.data();
    const suppId = data.supplierId;
    if (!suppId) continue;

    if (!supplierMap[suppId]) {
      supplierMap[suppId] = { count: 0, categories: new Set() };
      supplierProducts[suppId] = new Set();
    }
    supplierMap[suppId].count++;
    
    // Extract product ID from path: products/{productId}/variants/{variantId}
    const pathParts = varDoc.ref.path.split('/');
    const productId = pathParts[1]; // products/{productId}
    supplierProducts[suppId].add(productId);

    // Get category from parent product
    const productRef = varDoc.ref.parent.parent;
    if (productRef) {
      const productSnap = await productRef.get();
      if (productSnap.exists) {
        const cat = productSnap.data().category || productSnap.data().productType;
        if (cat) supplierMap[suppId].categories.add(cat);
      }
    }
  }

  const batch = db.batch();
  let updated = 0;

  for (const supDoc of suppliersSnap.docs) {
    const suppId = supDoc.id;
    const info = supplierMap[suppId] || { count: 0, categories: new Set() };
    const productCount = (supplierProducts[suppId] || new Set()).size;

    const analyticsUpdate = {
      'analytics.variantsSupplied': info.count,
      'analytics.productsSupplied': productCount,
      'analytics.productCategories': [...info.categories],
      'analytics.lastCalculatedAt': new Date().toISOString(),
      variantsSupplied: info.count,
      productsSupplied: productCount,
      productCategories: [...info.categories],
      updatedAt: new Date().toISOString(),
    };

    if (DRY_RUN) {
      console.log(`📊 ${suppId}: ${productCount} products, ${info.count} variants, categories: [${[...info.categories].join(', ')}]`);
    } else {
      batch.update(supDoc.ref, analyticsUpdate);
      console.log(`✅ ${suppId}: ${productCount} products, ${info.count} variants`);
    }
    updated++;
  }

  if (!DRY_RUN) {
    await batch.commit();
  }

  return updated;
}

// ─── Run ──────────────────────────────────────────────────────────────
async function main() {
  const db = initFirebase();

  try {
    // Phase 1: Migrate variants
    const stats = await migrateVariants(db);

    // Phase 2: Update supplier analytics
    const suppliersUpdated = await updateSupplierAnalytics(db);

    // ── Report ──────────────────────────────────────────────────────
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  MIGRATION COMPLETE ${DRY_RUN ? '(DRY RUN)' : ''}`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`  Total products scanned:       ${stats.totalProducts}`);
    console.log(`  With embedded variants:        ${stats.productsWithEmbeddedVariants}`);
    console.log(`  Already had subcollection:     ${stats.productsWithExistingSubcollection}`);
    console.log(`  Without any variants:          ${stats.productsWithoutVariants}`);
    console.log(`  ──────────────────────────────`);
    console.log(`  Variants created from arrays:  ${stats.variantsCreated}`);
    console.log(`  Default variants created:      ${stats.defaultVariantsCreated}`);
    console.log(`  Suppliers updated:             ${suppliersUpdated}`);
    console.log(`  ──────────────────────────────`);
    console.log(`  By category:`);
    Object.entries(stats.byCategory).sort().forEach(([cat, count]) => {
      console.log(`    ${cat}: ${count}`);
    });
    if (stats.errors.length > 0) {
      console.log(`\n  ⚠️ ERRORS (${stats.errors.length}):`);
      stats.errors.forEach(e => console.log(`    ${e}`));
    }
    console.log(`${'═'.repeat(60)}\n`);

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

main();

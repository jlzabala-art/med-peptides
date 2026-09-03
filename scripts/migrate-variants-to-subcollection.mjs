/**
 * migrate-variants-to-subcollection.mjs
 *
 * Migrates embedded variant data into Firestore subcollections:
 *   products/{productId}/variants/{variantId}
 *
 * This is required because the catalog API (/api/catalog/summary) only reads
 * from `collectionGroup('variants')` — products without subcollection docs
 * are invisible.
 *
 * Strategy:
 *   1. Products with embedded `variants[]` → migrate each embedded variant
 *   2. Products without embedded variants → create a "default" self-variant
 *      using the product's own metadata (name, price, category, supplier)
 *
 * Safety:
 *   - Uses DRY_RUN=true by default — prints what would be written
 *   - Skips products that already have subcollection variants
 *   - Uses Firestore batch writes (max 500 per batch)
 *
 * Usage:
 *   DRY_RUN=true  node scripts/migrate-variants-to-subcollection.mjs
 *   DRY_RUN=false node scripts/migrate-variants-to-subcollection.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[match[1].trim()] = val;
  }
}

const projectId = envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID || envVars.FIREBASE_PROJECT_ID;
const clientEmail = envVars.FIREBASE_CLIENT_EMAIL;
let privateKey = envVars.FIREBASE_PRIVATE_KEY || '';
privateKey = privateKey.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase credentials in .env.local');
  process.exit(1);
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
const db = getFirestore(app);

const DRY_RUN = process.env.DRY_RUN !== 'false';
const SCAN_BATCH = 30;
const WRITE_BATCH_LIMIT = 450; // Firestore limit is 500, leave margin

// ── Supplier ID normalization map ────────────────────────────────────────────
// Maps orphaned/legacy IDs → canonical supplier IDs
const SUPPLIER_ID_FIXES = {
  'lw90ZNykQHeBcUgFLnDs': 'supplier-fagron-genomics',   // Fagron imported with raw UID
  'OLlBbQjgrj6tY7GmM2Jo': 'supplier-fagron-genomics',   // 1 orphaned product
  'pod-poland':            'supplier-pod-poland',          // Missing "supplier-" prefix
};

const SUPPLIER_NAME_MAP = {
  'supplier-fagron-genomics': 'Fagron Genomics',
  'supplier-pod-poland':      'POD Poland',
  'supplier-24genetics':      '24Genetics',
  'supplier-bioniq':          'Bioniq',
  'supplier-eternadx':        'Eterna DX',
  'supplier-europeptides':    'Europeptides',
  'supplier-fusion':          'Fusion',
  'supplier-lotusland':       'Lotusland Limited',
  'supplier-magenta':         'Magenta',
  'supplier-nplabs':          'NP Labs',
  'supplier-vallida':         'Vallida',
};

function normalizeSupplierId(rawId) {
  return SUPPLIER_ID_FIXES[rawId] || rawId;
}

function resolveSupplierName(normalizedId) {
  return SUPPLIER_NAME_MAP[normalizedId] || normalizedId.replace('supplier-', '').replace(/-/g, ' ');
}

// ── Helper: build variant doc from embedded variant object ───────────────────
function buildFromEmbedded(productData, embeddedVariant, index) {
  const rawSupplierId = embeddedVariant.supplierId || embeddedVariant.supplier
                      || productData.supplierId || productData.supplier || null;
  const supplierId = rawSupplierId ? normalizeSupplierId(rawSupplierId) : null;
  const supplierName = embeddedVariant.supplierName || embeddedVariant.supplier_name
                     || productData.supplierName || (supplierId ? resolveSupplierName(supplierId) : '');

  // Determine a meaningful label
  const label = embeddedVariant.label || embeddedVariant.name
              || embeddedVariant.presentation || `Variant ${index + 1}`;

  // Build pricing tiers from embedded data if available
  const pricingTiers = embeddedVariant.pricing_tiers || embeddedVariant.pricingTiers || [];

  return {
    // Identity
    supplierId: supplierId || 'unknown',
    supplierName: supplierName || (supplierId ? resolveSupplierName(supplierId) : 'Unknown'),
    isActive: embeddedVariant.isActive !== false,
    status: embeddedVariant.status || productData.status || 'active',

    // Migration metadata
    migratedAt: new Date().toISOString(),
    migratedFrom: 'embedded_array',

    // Variant details
    label,
    name: embeddedVariant.name || productData.canonicalName || productData.name || '',
    presentation: embeddedVariant.presentation || embeddedVariant.format || embeddedVariant.formatId || productData.formatId || '',
    formatId: embeddedVariant.formatId || embeddedVariant.format || productData.formatId || '',
    dosage: embeddedVariant.dosage || embeddedVariant.dose || productData.dosage || '',
    doseMg: embeddedVariant.doseMg || embeddedVariant.dose_mg || null,

    // Pricing
    unit_price: embeddedVariant.unit_price ?? embeddedVariant.price ?? embeddedVariant.unitPrice ?? null,
    pricing_tiers: pricingTiers,

    // Cost tiers
    ...(embeddedVariant.cost_tiers ? { cost_tiers: embeddedVariant.cost_tiers } : {}),

    // Stock
    ...(embeddedVariant.stock != null ? { totalStock: embeddedVariant.stock } : {}),
    ...(embeddedVariant.totalStock != null ? { totalStock: embeddedVariant.totalStock } : {}),

    // Category context from parent
    category: productData.category || '',
  };
}

// ── Helper: build a default self-variant from product-level data ─────────────
function buildSelfVariant(productData, productId) {
  const rawSupplierId = productData.supplierId || productData.supplier || null;
  const supplierId = rawSupplierId ? normalizeSupplierId(rawSupplierId) : null;
  const supplierNames = productData.availableSuppliers || [];
  const supplierName = productData.supplierName || productData.supplier_name
                     || (supplierId ? resolveSupplierName(supplierId) : '');

  // Try to extract price from various fields
  const price = productData.unit_price ?? productData.price ?? productData.retailPrice
              ?? (productData.pricing?.retail?.perUnit) ?? (productData.pricing?.clinic?.perUnit) ?? null;

  return {
    supplierId: supplierId || (supplierNames.length > 0 ? supplierNames[0] : 'unknown'),
    supplierName: supplierName || (supplierId ? resolveSupplierName(supplierId) : 'Unknown'),
    isActive: productData.isActive !== false && !['inactive', 'archived'].includes(productData.status),
    isDefault: true,
    status: productData.status || 'active',

    migratedAt: new Date().toISOString(),
    migratedFrom: 'self_variant_autogenerated',

    label: productData.canonicalName || productData.name || productId,
    name: productData.canonicalName || productData.name || productId,
    presentation: productData.formatId || productData.format || '',
    formatId: productData.formatId || productData.format || '',
    dosage: productData.dosage || productData.dose || '',
    doseMg: productData.doseMg || null,

    unit_price: price,
    pricing_tiers: [],

    ...(productData.cost_tiers ? { cost_tiers: productData.cost_tiers } : {}),
    ...(productData.totalStock != null ? { totalStock: productData.totalStock } : {}),

    category: productData.category || '',

    // Preserve kit info if present
    ...(productData.kit ? { kit: productData.kit } : {}),
    ...(productData.productType ? { productType: productData.productType } : {}),
    ...(productData.billingType ? { billingType: productData.billingType } : {}),
    ...(productData.billingInterval ? { billingInterval: productData.billingInterval } : {}),
  };
}

// ── Main migration ───────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔄 Variant Subcollection Migration — ${DRY_RUN ? 'DRY RUN' : '🔴 LIVE WRITE'}\n`);

  const productsSnap = await db.collection('products').get();
  console.log(`Total products in collection: ${productsSnap.size}\n`);

  const docs = productsSnap.docs;
  const toMigrate = []; // { productId, productData, variantDocs: [{ id, data }] }

  // Phase 1: Scan all products and determine which need migration
  console.log('Phase 1: Scanning for products missing variants subcollection...');
  for (let i = 0; i < docs.length; i += SCAN_BATCH) {
    const batch = docs.slice(i, i + SCAN_BATCH);
    await Promise.all(batch.map(async (productDoc) => {
      const variantsSnap = await productDoc.ref.collection('variants').limit(1).get();
      if (!variantsSnap.empty) return; // Already has subcollection — skip

      const data = productDoc.data();
      const productId = productDoc.id;
      const embeddedVariants = Array.isArray(data.variants) ? data.variants : [];
      const variantDocs = [];

      if (embeddedVariants.length > 0) {
        // Has embedded variants — migrate each
        embeddedVariants.forEach((ev, idx) => {
          const variantId = ev.id || ev.variantId || `${productId}-embedded-${idx}`;
          const variantData = buildFromEmbedded(data, ev, idx);
          variantData.variantId = variantId;
          variantDocs.push({ id: variantId, data: variantData });
        });
      } else {
        // No embedded variants — create a self-variant
        const variantId = `${productId}-default`;
        const variantData = buildSelfVariant(data, productId);
        variantData.variantId = variantId;
        variantDocs.push({ id: variantId, data: variantData });
      }

      toMigrate.push({ productId, productData: data, variantDocs });
    }));
  }

  console.log(`\n📊 Products to migrate: ${toMigrate.length}`);
  const totalVariantDocs = toMigrate.reduce((sum, p) => sum + p.variantDocs.length, 0);
  console.log(`📊 Total variant docs to create: ${totalVariantDocs}\n`);

  // Supplier breakdown
  const supplierBreakdown = {};
  for (const p of toMigrate) {
    for (const v of p.variantDocs) {
      const sid = v.data.supplierId || 'unknown';
      if (!supplierBreakdown[sid]) supplierBreakdown[sid] = { products: new Set(), variants: 0 };
      supplierBreakdown[sid].products.add(p.productId);
      supplierBreakdown[sid].variants++;
    }
  }
  console.log('Supplier breakdown:');
  for (const [sid, stats] of Object.entries(supplierBreakdown).sort()) {
    console.log(`  ${sid}: ${stats.products.size} products, ${stats.variants} variants`);
  }
  console.log();

  if (DRY_RUN) {
    console.log('--- DRY RUN — showing first 10 migrations ---\n');
    for (const p of toMigrate.slice(0, 10)) {
      console.log(`  Product: ${p.productId}`);
      for (const v of p.variantDocs) {
        console.log(`    → variants/${v.id}: supplier=${v.data.supplierId}, price=${v.data.unit_price}, from=${v.data.migratedFrom}`);
      }
    }
    console.log(`\n✅ DRY RUN complete. Set DRY_RUN=false to execute the migration.`);
    process.exit(0);
  }

  // Phase 2: Write subcollection documents in batches
  console.log('Phase 2: Writing variant subcollection documents...\n');

  let writtenCount = 0;
  let batchCount = 0;
  let batch = db.batch();
  let batchSize = 0;

  for (const p of toMigrate) {
    for (const v of p.variantDocs) {
      const variantRef = db.collection('products').doc(p.productId).collection('variants').doc(v.id);
      batch.set(variantRef, v.data, { merge: true });
      batchSize++;
      writtenCount++;

      if (batchSize >= WRITE_BATCH_LIMIT) {
        await batch.commit();
        batchCount++;
        console.log(`  Batch ${batchCount} committed (${WRITE_BATCH_LIMIT} writes, total: ${writtenCount})`);
        batch = db.batch();
        batchSize = 0;
      }
    }
  }

  // Commit remaining
  if (batchSize > 0) {
    await batch.commit();
    batchCount++;
    console.log(`  Batch ${batchCount} committed (${batchSize} writes, total: ${writtenCount})`);
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Products migrated: ${toMigrate.length}`);
  console.log(`   Variant docs created: ${writtenCount}`);
  console.log(`   Batches used: ${batchCount}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

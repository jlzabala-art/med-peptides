/**
 * normalize_all_variants.mjs
 * ──────────────────────────────────────────────────────────────────
 * GOLDEN RULE MIGRATION: supplier data belongs ONLY in variants subcollection.
 *
 * Usage:
 *   node scripts/normalize_all_variants.mjs --dry-run   (audit only)
 *   node scripts/normalize_all_variants.mjs             (live migration)
 *
 * After running: node scripts/enrich_supplier_calculations.mjs
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const DRY_RUN = process.argv.includes('--dry-run');

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore(app);

// Fields that belong ONLY in the variant, never at root product level
const FIELDS_TO_MOVE_TO_VARIANT = [
  'supplierId', 'supplier_id', 'supplier', 'supplierName',
  'unit_price', 'price', 'cost_tiers', 'price_per_kit_10',
  'kit_price', 'kit_price_eur', 'price_eur', 'price_usd',
  'currency', 'stock', 'lead_time', 'minimum_order',
  'variantId', 'formatId', 'format', 'presentation',
  'dosage', 'dose', 'strength', 'sku'
];

function buildVariantFromRoot(productId, rootData) {
  const supplierId = rootData.supplierId || rootData.supplier_id || null;
  const supplierName = rootData.supplierName || rootData.supplier || null;

  if (!supplierId) return null;

  const variant = {
    supplierId,
    supplierName: supplierName || supplierId,
    isActive: rootData.isActive !== false,
    status: rootData.status === 'published' ? 'active' : (rootData.status || 'active'),
    source: rootData.source || 'root_migration',
    migratedAt: new Date().toISOString(),
    migratedFrom: 'root_product'
  };

  if (rootData.unit_price != null) variant.unit_price = rootData.unit_price;
  if (rootData.price != null && rootData.unit_price == null) variant.unit_price = rootData.price;
  if (rootData.price_eur != null) variant.price_eur = rootData.price_eur;
  if (rootData.price_usd != null) variant.price_usd = rootData.price_usd;
  if (rootData.currency != null) variant.currency = rootData.currency;
  if (rootData.cost_tiers != null) variant.cost_tiers = rootData.cost_tiers;
  if (rootData.price_per_kit_10 != null) variant.price_per_kit_10 = rootData.price_per_kit_10;
  if (rootData.kit_price != null) variant.kit_price = rootData.kit_price;
  if (rootData.kit_price_eur != null) variant.kit_price_eur = rootData.kit_price_eur;
  if (rootData.dosage != null) variant.dosage = rootData.dosage;
  if (rootData.dose != null && !rootData.dosage) variant.dosage = rootData.dose;
  if (rootData.strength != null) variant.strength = rootData.strength;
  if (rootData.presentation != null) variant.presentation = rootData.presentation;
  if (rootData.formatId != null) variant.formatId = rootData.formatId;
  if (rootData.format != null && !rootData.formatId) variant.formatId = rootData.format;
  if (rootData.stock != null) variant.stock = rootData.stock;
  if (rootData.sku != null) variant.sku = rootData.sku;

  const safeProductId = productId.replace(/[^a-z0-9-]/gi, '_');
  const safeSupplierId = supplierId.replace(/[^a-z0-9-]/gi, '_');
  variant.variantId = `${safeSupplierId}_${safeProductId}`;

  return variant;
}

async function run() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(` VARIANT NORMALIZATION MIGRATION ${DRY_RUN ? '[DRY RUN]' : '[LIVE]'}`);
  console.log(`${'='.repeat(60)}\n`);

  const allProducts = await db.collection('products').get();
  console.log(`Total products to check: ${allProducts.size}\n`);

  const supplierReport = {};
  const toMigrate = [];
  const alreadyCorrect = [];
  const noSupplierAnywhere = [];

  let checked = 0;
  process.stdout.write('Scanning .');

  for (const doc of allProducts.docs) {
    const d = doc.data();
    const productId = doc.id;

    const subSnap = await doc.ref.collection('variants').get();
    const subcollectionVariants = subSnap.docs.map(vd => ({ id: vd.id, ...vd.data() }));
    const embeddedVariants = Array.isArray(d.variants) ? d.variants : [];

    const rootHasSupplier = !!(d.supplierId || d.supplier_id || d.supplier || d.supplierName);
    const subcollectionHasSupplier = subcollectionVariants.some(v => v.supplierId);

    const sId = d.supplierId || d.supplier_id ||
      (subcollectionVariants.find(v => v.supplierId)?.supplierId) ||
      'unknown';

    if (!supplierReport[sId]) {
      supplierReport[sId] = { total: 0, needsMigration: 0, alreadyOk: 0, embeddedArray: 0 };
    }
    supplierReport[sId].total++;

    if (rootHasSupplier && !subcollectionHasSupplier) {
      toMigrate.push({ productId, name: d.canonicalName || d.name, supplierId: d.supplierId || d.supplier_id, supplierName: d.supplierName || d.supplier, status: d.status, rootData: d, embeddedVariants, existingSubcollectionCount: subcollectionVariants.length });
      supplierReport[sId].needsMigration++;
      if (embeddedVariants.length > 0) supplierReport[sId].embeddedArray++;
    } else if (subcollectionHasSupplier) {
      alreadyCorrect.push({ productId, rootHasSupplier });
      supplierReport[sId].alreadyOk++;
    } else {
      noSupplierAnywhere.push({ productId, name: d.canonicalName || d.name, status: d.status });
    }

    checked++;
    if (checked % 50 === 0) process.stdout.write('.');
  }

  console.log('\n');

  // ── REPORT ──────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(70)}`);
  console.log(' AUDIT BY SUPPLIER');
  console.log(`${'─'.repeat(70)}`);
  const sorted = Object.entries(supplierReport).sort((a, b) => b[1].needsMigration - a[1].needsMigration);
  for (const [suppId, stats] of sorted) {
    if (suppId === 'unknown' && stats.needsMigration === 0) continue;
    const flag = stats.needsMigration > 0 ? '❌' : '✅';
    console.log(
      `${flag} ${suppId.padEnd(35)} ` +
      `total:${stats.total.toString().padStart(4)} | ` +
      `needs_fix:${stats.needsMigration.toString().padStart(4)} | ` +
      `ok:${stats.alreadyOk.toString().padStart(4)} | ` +
      `embedded_arr:${stats.embeddedArray.toString().padStart(4)}`
    );
  }

  console.log(`\n${'─'.repeat(70)}`);
  console.log(` SUMMARY`);
  console.log(`${'─'.repeat(70)}`);
  console.log(`✅ Already correct (subcollection + supplierId):    ${alreadyCorrect.length}`);
  console.log(`❌ Need migration (supplier at root, no subcooll.): ${toMigrate.length}`);
  console.log(`⚪ No supplier anywhere (canonical-only):           ${noSupplierAnywhere.length}`);

  if (toMigrate.length === 0) {
    console.log('\n🎉 All products are correctly structured!');
    process.exit(0);
  }

  if (DRY_RUN) {
    console.log(`\n[DRY RUN] First 25 products that would be migrated:`);
    toMigrate.slice(0, 25).forEach(p => {
      console.log(`  ${p.productId} | "${p.name}" | supplier: ${p.supplierId} | status: ${p.status} | embedded: ${p.embeddedVariants.length}`);
    });
    console.log('\nRun without --dry-run to apply.');
    process.exit(0);
  }

  // ── LIVE MIGRATION ───────────────────────────────────────────────
  console.log(`\n🚀 Live migration of ${toMigrate.length} products...\n`);

  let migrated = 0;
  let errors = 0;

  for (const p of toMigrate) {
    try {
      const productRef = db.collection('products').doc(p.productId);
      const batch = db.batch();

      if (p.embeddedVariants.length > 0) {
        // Migrate all embedded variants to subcollection
        for (const ev of p.embeddedVariants) {
          const evSupplierId = ev.supplierId || ev.supplier_id || p.supplierId;
          if (!evSupplierId) continue;

          const variantDoc = {
            supplierId: evSupplierId,
            supplierName: ev.supplierName || ev.supplier || p.supplierName || evSupplierId,
            isActive: ev.isActive !== false,
            status: ev.status || 'active',
            migratedAt: new Date().toISOString(),
            migratedFrom: 'embedded_array'
          };

          // Copy all variant-specific fields
          const skipKeys = new Set(['supplierId', 'supplier_id', 'supplier', 'supplierName']);
          for (const [k, v] of Object.entries(ev)) {
            if (!skipKeys.has(k) && v !== undefined) variantDoc[k] = v;
          }

          const variantId = ev.variantId ||
            `${evSupplierId.replace(/[^a-z0-9-]/gi, '_')}_${p.productId.replace(/[^a-z0-9-]/gi, '_')}`;
          batch.set(productRef.collection('variants').doc(variantId), variantDoc);
        }
      } else {
        // Create single variant from root data
        const variant = buildVariantFromRoot(p.productId, p.rootData);
        if (!variant) {
          console.log(`  ⚠️  Skipping ${p.productId} — cannot determine supplierId`);
          continue;
        }
        batch.set(productRef.collection('variants').doc(variant.variantId), variant);
      }

      // Clean root-level supplier fields
      const deleteFields = { updatedAt: new Date().toISOString(), _normalized: true };
      FIELDS_TO_MOVE_TO_VARIANT.forEach(f => {
        if (p.rootData[f] !== undefined) deleteFields[f] = FieldValue.delete();
      });
      if (Array.isArray(p.rootData.variants)) deleteFields.variants = FieldValue.delete();

      batch.update(productRef, deleteFields);
      await batch.commit();

      migrated++;
      if (migrated % 10 === 0) console.log(`  ✅ ${migrated}/${toMigrate.length} migrated...`);

    } catch (err) {
      errors++;
      console.error(`  ❌ Error on ${p.productId}: ${err.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(` DONE — migrated: ${migrated} | errors: ${errors}`);
  console.log(`${'='.repeat(60)}`);
  console.log('\nNext: node scripts/enrich_supplier_calculations.mjs');

  process.exit(errors > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });

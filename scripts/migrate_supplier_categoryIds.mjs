/**
 * migrate_supplier_categoryIds.mjs
 * ──────────────────────────────────────────────────
 * Migrates supplier documents from:
 *   categoryId: "peptide"  (single string)
 * To:
 *   categoryIds: ["peptide", "nutricosmetics", ...]  (array, derived from products)
 *
 * How it works:
 *   1. Scans ALL products → collects categoryId per product
 *   2. Scans ALL variants → maps supplierId → set of categoryIds
 *   3. Also uses product-level supplierIds[] as fallback
 *   4. Updates each supplier document:
 *      - Adds `categoryIds` (array of unique category IDs)
 *      - Removes legacy `categoryId` field
 *
 * Usage:
 *   node scripts/migrate_supplier_categoryIds.mjs              # dry-run
 *   node scripts/migrate_supplier_categoryIds.mjs --commit     # write to Firestore
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// ── Init ─────────────────────────────────────────────────────────────────────
const raw = readFileSync(new URL('./serviceAccountKey.json', import.meta.url), 'utf8');
initializeApp({ credential: cert(JSON.parse(raw)) });
const db = getFirestore();

const COMMIT = process.argv.includes('--commit');

async function run() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  SUPPLIER categoryId → categoryIds[] MIGRATION`);
  console.log(`  Mode: ${COMMIT ? '🔴 COMMIT (writing to Firestore)' : '🟢 DRY-RUN (no writes)'}`);
  console.log(`${'═'.repeat(60)}\n`);

  // ─── Step 1: Load all suppliers ────────────────────────────────────────────
  const suppSnap = await db.collection('suppliers').get();
  const suppliers = {};
  suppSnap.forEach(doc => {
    suppliers[doc.id] = { ...doc.data(), _ref: doc.ref };
  });
  console.log(`Suppliers loaded: ${Object.keys(suppliers).length}`);

  // Show current state
  console.log('\n── Current Supplier State ──');
  for (const [id, data] of Object.entries(suppliers)) {
    const current = data.categoryId || data.categoryIds || '(none)';
    console.log(`  ${id}: categoryId=${JSON.stringify(current)}`);
  }

  // ─── Step 2: Scan all products + variants to build supplier→categories map ─
  console.log('\n── Scanning products & variants... ──');
  const supplierCategoryMap = {}; // supplierId → Set<categoryId>

  const prodSnap = await db.collection('products').get();
  let scannedProducts = 0;
  let scannedVariants = 0;

  for (const doc of prodSnap.docs) {
    const data = doc.data();
    const productCategoryId = data.categoryId;
    scannedProducts++;

    // Method 1: Product-level supplierIds[]
    if (productCategoryId && Array.isArray(data.supplierIds)) {
      for (const sid of data.supplierIds) {
        if (!supplierCategoryMap[sid]) supplierCategoryMap[sid] = new Set();
        supplierCategoryMap[sid].add(productCategoryId);
      }
    }

    // Method 2: Variant-level supplierId
    const varSnap = await db.collection('products').doc(doc.id).collection('variants').get();
    for (const vDoc of varSnap.docs) {
      const vData = vDoc.data();
      scannedVariants++;
      if (vData.supplierId && productCategoryId) {
        if (!supplierCategoryMap[vData.supplierId]) supplierCategoryMap[vData.supplierId] = new Set();
        supplierCategoryMap[vData.supplierId].add(productCategoryId);
      }
    }
  }

  console.log(`Scanned: ${scannedProducts} products, ${scannedVariants} variants`);

  // ─── Step 3: Show computed categoryIds per supplier ────────────────────────
  console.log('\n── Computed categoryIds per Supplier ──');
  for (const [supplierId, categorySet] of Object.entries(supplierCategoryMap)) {
    const arr = [...categorySet].sort();
    const supplierName = suppliers[supplierId]?.name || '(unknown)';
    console.log(`  ${supplierId} (${supplierName}):`);
    console.log(`    → [${arr.join(', ')}]`);
  }

  // Check for suppliers with no products
  const suppliersWithNoProducts = Object.keys(suppliers).filter(id => !supplierCategoryMap[id]);
  if (suppliersWithNoProducts.length > 0) {
    console.log('\n⚠️  Suppliers with NO products found:');
    suppliersWithNoProducts.forEach(id => {
      const oldCat = suppliers[id].categoryId;
      console.log(`  ${id}: will keep old categoryId "${oldCat}" as fallback`);
    });
  }

  // ─── Step 4: Migrate ──────────────────────────────────────────────────────
  console.log(`\n── ${COMMIT ? 'WRITING' : 'DRY-RUN'} Migration ──`);
  let updated = 0;

  for (const [supplierId, supplierData] of Object.entries(suppliers)) {
    const ref = supplierData._ref;
    let newCategoryIds;

    if (supplierCategoryMap[supplierId]) {
      newCategoryIds = [...supplierCategoryMap[supplierId]].sort();
    } else {
      // Fallback: use existing categoryId if no products found
      newCategoryIds = supplierData.categoryId ? [supplierData.categoryId] : [];
    }

    const oldValue = supplierData.categoryId || supplierData.categoryIds || '(none)';

    console.log(`  ${supplierId}:`);
    console.log(`    OLD: categoryId = ${JSON.stringify(oldValue)}`);
    console.log(`    NEW: categoryIds = ${JSON.stringify(newCategoryIds)}`);

    if (COMMIT) {
      await ref.update({
        categoryIds: newCategoryIds,
        categoryId: FieldValue.delete(),  // Remove legacy field
      });
      console.log(`    ✅ Written`);
    } else {
      console.log(`    ⏳ Skipped (dry-run)`);
    }
    updated++;
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  SUMMARY`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Suppliers processed: ${updated}`);
  console.log(`  Mode: ${COMMIT ? '🔴 COMMITTED' : '🟢 DRY-RUN'}`);
  if (!COMMIT) {
    console.log(`\n  To apply changes, run:`);
    console.log(`  node scripts/migrate_supplier_categoryIds.mjs --commit`);
  }
  console.log('');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

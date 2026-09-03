/**
 * audit_missing_suppliers.mjs
 * ──────────────────────────────────────────────────
 * Audits products & variants that lack a supplier.
 * Uses batched parallel reads for speed (50 concurrent).
 * 
 * Reports:
 *   1. Products with zero variants
 *   2. Variants with missing/empty supplierId
 *   3. Products whose supplierIds[] is empty
 * 
 * Usage:  node scripts/audit_missing_suppliers.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// ── Init Firebase Admin ─────────────────────────────────────────────────────
const raw = readFileSync(new URL('./serviceAccountKey.json', import.meta.url), 'utf8');
const serviceAccount = JSON.parse(raw);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const BATCH_SIZE = 50; // concurrent Firestore reads

async function processBatch(batch) {
  return Promise.all(
    batch.map(async (pDoc) => {
      const pData = pDoc.data();
      const pName = pData.name || pData.title || pDoc.id;
      const pCategoryId = pData.categoryId || '(none)';
      const supplierIds = pData.supplierIds || [];

      const variantsSnap = await db
        .collection('products')
        .doc(pDoc.id)
        .collection('variants')
        .get();

      const variantsNoSupplier = [];
      for (const vDoc of variantsSnap.docs) {
        const vData = vDoc.data();
        const sid = vData.supplierId || '';
        if (!sid || sid === 'Unassigned' || sid === 'unknown') {
          variantsNoSupplier.push({
            productId: pDoc.id,
            productName: pName,
            variantId: vDoc.id,
            presentation: vData.presentation || vData.sku || '(no presentation)',
            categoryId: pCategoryId,
            supplierId: sid || '(empty)',
          });
        }
      }

      return {
        id: pDoc.id,
        name: pName,
        categoryId: pCategoryId,
        supplierIds,
        variantCount: variantsSnap.size,
        variantsNoSupplier,
      };
    })
  );
}

async function audit() {
  console.log('🔍 Auditing products & variants for missing suppliers...\n');

  const productsSnap = await db.collection('products').get();
  const totalProducts = productsSnap.size;
  console.log(`Total products: ${totalProducts}\n`);

  const docs = productsSnap.docs;
  const allResults = [];
  let processed = 0;

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    const results = await processBatch(batch);
    allResults.push(...results);
    processed += batch.length;
    process.stdout.write(`  Progress: ${processed}/${totalProducts}\r`);
  }

  console.log(`\n`);

  // Aggregate results
  const noVariants = allResults.filter(r => r.variantCount === 0);
  const variantsNoSupplier = allResults.flatMap(r => r.variantsNoSupplier);
  const productsNoSupplierIds = allResults.filter(r => r.supplierIds.length === 0);
  const totalVariants = allResults.reduce((sum, r) => sum + r.variantCount, 0);

  // ── Report ────────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📊 SUMMARY`);
  console.log(`   Products: ${totalProducts}`);
  console.log(`   Variants: ${totalVariants}`);
  console.log(`   Products with 0 variants: ${noVariants.length}`);
  console.log(`   Variants without supplier: ${variantsNoSupplier.length}`);
  console.log(`   Products with empty supplierIds[]: ${productsNoSupplierIds.length}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (noVariants.length > 0) {
    console.log(`\n🚨 PRODUCTS WITH ZERO VARIANTS (${noVariants.length}):`);
    console.log('─'.repeat(80));
    const grouped = {};
    for (const p of noVariants) {
      if (!grouped[p.categoryId]) grouped[p.categoryId] = [];
      grouped[p.categoryId].push(p);
    }
    for (const [cat, items] of Object.entries(grouped).sort()) {
      console.log(`\n  📁 ${cat} (${items.length}):`);
      for (const p of items.sort((a, b) => a.name.localeCompare(b.name))) {
        console.log(`     • ${p.name}  [${p.id}]`);
      }
    }
  }

  if (variantsNoSupplier.length > 0) {
    console.log(`\n\n⚠️  VARIANTS WITHOUT SUPPLIER (${variantsNoSupplier.length}):`);
    console.log('─'.repeat(80));
    const grouped = {};
    for (const v of variantsNoSupplier) {
      const key = `${v.productName} [${v.productId}]`;
      if (!grouped[key]) grouped[key] = { categoryId: v.categoryId, variants: [] };
      grouped[key].variants.push(v);
    }
    for (const [product, info] of Object.entries(grouped).sort()) {
      console.log(`\n  📦 ${product}  (${info.categoryId})`);
      for (const v of info.variants) {
        console.log(`     • variant: ${v.variantId} | presentation: ${v.presentation} | supplierId: ${v.supplierId}`);
      }
    }
  }

  if (productsNoSupplierIds.length > 0) {
    console.log(`\n\n📋 PRODUCTS WITH EMPTY supplierIds[] (${productsNoSupplierIds.length}):`);
    console.log('─'.repeat(80));
    const grouped = {};
    for (const p of productsNoSupplierIds) {
      if (!grouped[p.categoryId]) grouped[p.categoryId] = [];
      grouped[p.categoryId].push(p);
    }
    for (const [cat, items] of Object.entries(grouped).sort()) {
      console.log(`\n  📁 ${cat} (${items.length}):`);
      for (const p of items.sort((a, b) => a.name.localeCompare(b.name))) {
        console.log(`     • ${p.name}  [${p.id}]`);
      }
    }
  }

  console.log('\n✅ Audit complete.');
  process.exit(0);
}

audit().catch((err) => {
  console.error('❌ Audit failed:', err);
  process.exit(1);
});

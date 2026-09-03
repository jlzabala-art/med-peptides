/**
 * fix_missing_suppliers.mjs
 * ──────────────────────────────────────────────────
 * Assigns supplierId to orphan variants and recalculates
 * product-level supplierIds[] arrays.
 *
 * Rules:
 *  1. Product ID starts with "lotusland_"           → supplier-lotusland
 *  2. Product ID/name contains "24genetics"          → supplier-24genetics
 *  3. Product name = "EternaRx Longevity Blood Panel"→ supplier-eternadx
 *  4. categoryId = nutricosmetics (no supplier)      → supplier-nplabs
 *  5. categoryId = excipient (no supplier)           → supplier-nplabs
 *  6. categoryId = capsules_and_consumables          → supplier-nplabs
 *  7. categoryId = api_raw_material                  → supplier-nplabs
 *  8. categoryId = compounding_material              → supplier-nplabs
 *  9. categoryId = equipment                         → supplier-nplabs
 * 10. categoryId = peptide (no lotusland_ prefix)    → supplier-nplabs
 * 11. Everything else unresolved                     → flagged for manual
 *
 * Usage:
 *   node scripts/fix_missing_suppliers.mjs              # dry-run
 *   node scripts/fix_missing_suppliers.mjs --commit     # write to Firestore
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// ── Init ────────────────────────────────────────────────────────────────────
const raw = readFileSync(new URL('./serviceAccountKey.json', import.meta.url), 'utf8');
initializeApp({ credential: cert(JSON.parse(raw)) });
const db = getFirestore();

const COMMIT = process.argv.includes('--commit');
const BATCH_SIZE = 50;

// ── Supplier Resolution Rules ───────────────────────────────────────────────
const NPLABS_CATEGORIES = new Set([
  'nutricosmetics',
  'excipient',
  'capsules_and_consumables',
  'api_raw_material',
  'compounding_material',
  'equipment',
  'supplement',
]);

function resolveSupplier(productId, productName, categoryId) {
  const idLower = productId.toLowerCase();
  const nameLower = (productName || '').toLowerCase();

  // Rule 1: Lotusland prefix
  if (idLower.startsWith('lotusland_')) return 'supplier-lotusland';

  // Rule 2: 24Genetics
  if (idLower.includes('24genetics') || nameLower.includes('24genetics'))
    return 'supplier-24genetics';

  // Rule 3: EternaRx / Eterna / ProGen → EternaDX
  if (
    nameLower.includes('eternarx') ||
    nameLower.includes('eterna®') ||
    nameLower.includes('eterna ') ||
    nameLower.includes('progen')
  )
    return 'supplier-eternadx';

  // Rule 4: Fagron branded genetic tests
  if (
    nameLower.includes('fagron') ||
    nameLower.includes('trichotest') ||
    nameLower.includes('telotest') ||
    nameLower.includes('acnetest') ||
    nameLower.includes('nutrigen')
  )
    return 'supplier-fagron-genomics';

  // Rule 5: Biomarker tests → Bloodo
  if (categoryId === 'biomarker_test') return 'supplier-bloodo';

  // Rule 6: Generic genetic tests (DNA tests without brand) → 24Genetics
  if (categoryId === 'genetic_test') return 'supplier-24genetics';

  // Rule 7: NP Labs categories
  if (NPLABS_CATEGORIES.has(categoryId)) return 'supplier-nplabs';

  // Rule 8: Peptide without lotusland prefix → NP Labs (magistral)
  if (categoryId === 'peptide') return 'supplier-nplabs';

  // Unresolved
  return null;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function fix() {
  console.log(`\n🔧 Fix Missing Suppliers — ${COMMIT ? '🔴 COMMIT MODE' : '🟡 DRY-RUN MODE'}\n`);

  const productsSnap = await db.collection('products').get();
  console.log(`Total products: ${productsSnap.size}\n`);

  const stats = {
    variantsFixed: 0,
    productsFixed: 0,
    unresolved: [],
    bySupplier: {},
  };

  const docs = productsSnap.docs;
  let processed = 0;

  // Collect all writes
  const writes = []; // { ref, data }

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (pDoc) => {
        const pData = pDoc.data();
        const pName = pData.name || pData.title || pDoc.id;
        const categoryId = pData.categoryId || '(none)';
        const existingSupplierIds = pData.supplierIds || [];

        const variantsSnap = await db
          .collection('products')
          .doc(pDoc.id)
          .collection('variants')
          .get();

        if (variantsSnap.empty) return;

        const variantSupplierIds = new Set(existingSupplierIds);
        let productNeedsFix = false;

        for (const vDoc of variantsSnap.docs) {
          const vData = vDoc.data();
          const sid = vData.supplierId || '';

          if (sid && sid !== 'Unassigned' && sid !== 'unknown') {
            // Already has supplier — just track it
            variantSupplierIds.add(sid);
            continue;
          }

          // Needs assignment
          const resolved = resolveSupplier(pDoc.id, pName, categoryId);
          if (!resolved) {
            stats.unresolved.push({
              productId: pDoc.id,
              productName: pName,
              variantId: vDoc.id,
              categoryId,
            });
            continue;
          }

          // Track
          stats.variantsFixed++;
          stats.bySupplier[resolved] = (stats.bySupplier[resolved] || 0) + 1;
          variantSupplierIds.add(resolved);
          productNeedsFix = true;

          // Queue variant write
          writes.push({
            ref: db.collection('products').doc(pDoc.id).collection('variants').doc(vDoc.id),
            data: { supplierId: resolved },
            desc: `variant ${vDoc.id} → ${resolved}`,
          });
        }

        // Update product-level supplierIds[] if changed
        const newSupplierIds = [...variantSupplierIds].filter(Boolean);
        const changed =
          productNeedsFix ||
          newSupplierIds.length !== existingSupplierIds.length ||
          newSupplierIds.some((id) => !existingSupplierIds.includes(id));

        if (changed && newSupplierIds.length > 0) {
          stats.productsFixed++;
          writes.push({
            ref: db.collection('products').doc(pDoc.id),
            data: { supplierIds: newSupplierIds },
            desc: `product ${pDoc.id} supplierIds → [${newSupplierIds.join(', ')}]`,
          });
        }
      })
    );

    processed += batch.length;
    process.stdout.write(`  Progress: ${processed}/${docs.length}\r`);
  }

  console.log(`\n`);

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 FIX SUMMARY');
  console.log(`   Variants to fix: ${stats.variantsFixed}`);
  console.log(`   Products to update supplierIds[]: ${stats.productsFixed}`);
  console.log(`   Total writes queued: ${writes.length}`);
  console.log(`   Unresolved: ${stats.unresolved.length}`);
  console.log('');
  console.log('   By supplier:');
  for (const [sid, count] of Object.entries(stats.bySupplier).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`     ${sid}: ${count} variants`);
  }
  console.log('═══════════════════════════════════════════════════════════\n');

  if (stats.unresolved.length > 0) {
    console.log(`\n⚠️  UNRESOLVED (${stats.unresolved.length}):`);
    for (const u of stats.unresolved) {
      console.log(
        `   • ${u.productName} [${u.productId}] variant: ${u.variantId} (${u.categoryId})`
      );
    }
    console.log('');
  }

  // ── Execute writes ────────────────────────────────────────────────────
  if (COMMIT && writes.length > 0) {
    console.log(`\n🔴 Committing ${writes.length} writes to Firestore...\n`);

    // Firestore batches limited to 500 operations
    const FS_BATCH_LIMIT = 450;
    let batchCount = 0;

    for (let i = 0; i < writes.length; i += FS_BATCH_LIMIT) {
      const chunk = writes.slice(i, i + FS_BATCH_LIMIT);
      const batch = db.batch();
      for (const w of chunk) {
        batch.update(w.ref, w.data);
      }
      await batch.commit();
      batchCount++;
      console.log(`   Batch ${batchCount}: ${chunk.length} writes committed`);
    }

    console.log(`\n✅ All ${writes.length} writes committed successfully!`);
  } else if (!COMMIT) {
    console.log(
      '🟡 DRY-RUN complete. Run with --commit to write to Firestore.\n'
    );
  }

  process.exit(0);
}

fix().catch((err) => {
  console.error('❌ Fix failed:', err);
  process.exit(1);
});

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  migrate_embedded_variants.cjs
 *  Fase 1: Migrar variantes embebidas (array en doc padre) → subcollección
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  Busca todos los productos que tienen un campo `variants[]` embebido en su
 *  documento y los migra a la subcollección `products/{id}/variants/{variantId}`.
 *  Después elimina el campo `variants[]` del documento padre y actualiza los
 *  campos denormalizados (variantsCount, supplierIds, minPrice, maxPrice, presentations).
 *
 *  Características de seguridad:
 *    • DRY_RUN=true  → solo muestra qué haría, no escribe nada (por defecto)
 *    • Idempotente   → si la variante ya existe en subcollección, la omite
 *    • PRODUCT_ID    → solo migra un producto específico (para pruebas)
 *    • Verifica antes de eliminar el array embebido
 *
 *  Uso:
 *    node migrate_embedded_variants.cjs              # dry run (seguro)
 *    DRY_RUN=false node migrate_embedded_variants.cjs # live write
 *    DRY_RUN=false PRODUCT_ID=xxx node migrate_embedded_variants.cjs
 * ════════════════════════════════════════════════════════════════════════════
 */

const admin  = require('firebase-admin');
const dotenv = require('dotenv');
const path   = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

const DRY_RUN    = process.env.DRY_RUN !== 'false';
const PRODUCT_ID = process.env.PRODUCT_ID || null;

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m',
  cyan: '\x1b[36m', red: '\x1b[31m', magenta: '\x1b[35m',
};

// ── Recalculate all denormalized fields from the subcollection ──────────────
async function calcDenormedFields(productId) {
  const snap = await db.collection('products').doc(productId)
    .collection('variants').get();

  const activeVariants = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(v => v.isActive !== false && !['inactive', 'archived', 'draft'].includes(v.status));

  const supplierIds   = [...new Set(activeVariants.map(v => v.supplierId || v.supplier).filter(Boolean))];
  const presentations = [...new Set(activeVariants.map(v => v.presentation || v.format).filter(Boolean))];

  const prices = activeVariants
    .map(v => typeof v.unit_price === 'number' ? v.unit_price : (typeof v.price === 'number' ? v.price : parseFloat(v.price)))
    .filter(p => !isNaN(p) && p > 0);

  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  const defaultVar = activeVariants.find(v => v.isDefault) || activeVariants[0] || null;

  return {
    variantsCount:    snap.size,
    supplierIds,
    supplierId:       supplierIds[0] || null,
    presentations,
    minPrice,
    maxPrice,
    defaultVariantId: defaultVar?.id || null,
  };
}

async function main() {
  console.log('\n' + c.bold + c.cyan +
    '════════════════════════════════════════════════════════\n' +
    '  🚚  Migrate Embedded Variants → Subcollection\n' +
    '════════════════════════════════════════════════════════' +
    c.reset);

  console.log(`\n  Mode:       ${DRY_RUN ? c.yellow + 'DRY RUN (no writes)' : c.green + 'LIVE WRITE'}${c.reset}`);
  console.log(`  Product ID: ${PRODUCT_ID ? c.blue + PRODUCT_ID : c.dim + 'ALL products'}${c.reset}\n`);

  if (DRY_RUN) {
    console.log(c.yellow + '  ⚠️  DRY RUN — set DRY_RUN=false to write.\n' + c.reset);
  }

  // 1. Fetch products
  let productsSnap;
  if (PRODUCT_ID) {
    const doc = await db.collection('products').doc(PRODUCT_ID).get();
    productsSnap = { docs: doc.exists ? [doc] : [] };
  } else {
    productsSnap = await db.collection('products').limit(2000).get();
  }

  const docs  = productsSnap.docs;
  const total = docs.length;
  console.log(`  Found ${c.bold}${total}${c.reset} product documents.\n`);

  const counters = {
    withEmbedded:    0,
    variantsMigrated:0,
    variantsSkipped: 0,
    denormUpdated:   0,
    alreadyClean:    0,
    errors:          0,
  };

  for (let i = 0; i < docs.length; i++) {
    const docSnap = docs[i];
    const data    = docSnap.data();
    const label   = `${String(i + 1).padStart(4)}/${total}  ${(data.canonicalName || data.name || docSnap.id).slice(0, 42).padEnd(42)}`;

    // Skip products that have no embedded variants array
    const embeddedVariants = Array.isArray(data.variants) ? data.variants : [];
    if (embeddedVariants.length === 0) {
      counters.alreadyClean++;
      process.stdout.write(`  ${c.dim}${label}  ✓ clean (no embedded)${c.reset}\n`);
      continue;
    }

    counters.withEmbedded++;
    console.log(`\n  ${c.magenta}${label}  ← ${embeddedVariants.length} embedded variants to migrate${c.reset}`);

    try {
      // 2. Load existing subcollection variants (to avoid duplicates)
      const existingSubSnap = await docSnap.ref.collection('variants').get();
      const existingIds = new Set(existingSubSnap.docs.map(d => d.id));
      const existingSkus = new Set(
        existingSubSnap.docs.map(d => d.data().sku).filter(Boolean)
      );

      let migratedCount = 0;
      let skippedCount  = 0;

      if (!DRY_RUN) {
        const batch = db.batch();

        for (const v of embeddedVariants) {
          // Generate a stable ID from the variant's own id or sku
          const vId = v.id || v.sku || `var_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

          // Skip if already exists in subcollection (by id or sku)
          if (existingIds.has(vId) || (v.sku && existingSkus.has(v.sku))) {
            skippedCount++;
            console.log(`    ${c.dim}  ⟳ ${vId} — already in subcollection, skipping${c.reset}`);
            continue;
          }

          const vData = {
            ...v,
            productId:  docSnap.id,
            migratedAt: new Date().toISOString(),
          };
          // Remove circular id field if present (Firestore stores it as doc ID)
          delete vData.id;

          const vRef = docSnap.ref.collection('variants').doc(vId);
          batch.set(vRef, vData, { merge: false });
          migratedCount++;
          console.log(`    ${c.green}  ✓ ${vId} (${v.dosage || v.sku || 'no sku'}) → subcollection${c.reset}`);
        }

        await batch.commit();

        // 3. Recalculate denormalized fields
        const denormed = await calcDenormedFields(docSnap.id);

        // 4. Remove embedded variants array + update denormalized fields on parent
        await docSnap.ref.set({
          ...denormed,
          variants:  admin.firestore.FieldValue.delete(), // remove embedded array
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        counters.denormUpdated++;

      } else {
        // Dry run: just count what would be migrated
        for (const v of embeddedVariants) {
          const vId = v.id || v.sku || 'auto-id';
          if (existingIds.has(vId) || (v.sku && existingSkus.has(v.sku))) {
            skippedCount++;
            console.log(`    ${c.dim}  ⟳ ${vId} — already in subcollection (would skip)${c.reset}`);
          } else {
            migratedCount++;
            console.log(`    ${c.yellow}  → ${vId} (${v.dosage || v.sku || 'no sku'}) — would migrate${c.reset}`);
          }
        }
        console.log(`    ${c.yellow}  [DRY RUN] Would remove variants[] from parent doc + update denorm fields${c.reset}`);
      }

      counters.variantsMigrated += migratedCount;
      counters.variantsSkipped  += skippedCount;

    } catch (err) {
      counters.errors++;
      console.log(`  ${c.red}  ERROR: ${err.message}${c.reset}`);
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n' + c.bold + c.cyan +
    '════════════════════════════════════════════════════════\n' +
    '  📊  Migration Summary\n' +
    '════════════════════════════════════════════════════════' + c.reset);

  console.log(`\n  Total products:       ${c.bold}${total}${c.reset}`);
  console.log(`  With embedded arrays: ${c.magenta + c.bold}${counters.withEmbedded}${c.reset}`);
  console.log(`  Variants migrated:    ${c.green + c.bold}${counters.variantsMigrated}${c.reset}`);
  console.log(`  Variants skipped:     ${c.dim}${counters.variantsSkipped}${c.reset}`);
  console.log(`  Parent docs updated:  ${c.blue}${counters.denormUpdated}${c.reset}`);
  console.log(`  Already clean:        ${c.dim}${counters.alreadyClean}${c.reset}`);
  console.log(`  Errors:               ${c.red}${counters.errors}${c.reset}\n`);

  if (DRY_RUN) {
    console.log(c.yellow + c.bold +
      '  ⚠️  DRY RUN — no changes made. Run with DRY_RUN=false to apply.\n' +
      c.reset);
  } else {
    console.log(c.green + c.bold +
      `  ✅  Migration complete. ${counters.variantsMigrated} variants moved to subcollections.\n` +
      c.reset);
  }
}

main().catch(err => {
  console.error('\n' + c.red + 'Fatal error:' + c.reset, err);
  process.exit(1);
});

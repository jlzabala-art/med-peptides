/**
 * PHASE 4 — Reconcile Lotusland Variants Against Master Price List
 *
 * Source of truth: "AI Prompts/LotusLand Master Price List.json" (104 SKUs)
 *
 * Strategy:
 *   1. Load all 217 current Lotusland variants from Firestore
 *   2. For each, find the matching master SKU by canonical product name + dosage
 *   3. If a match is found:
 *      - UPDATE the variant with the correct pricing from master (perVialPriceUSD, perKitPriceUSD, dosage, presentation)
 *      - KEEP IT
 *   4. If NO match → DELETE the variant (it's an orphan not in the master list)
 *   5. After reconcile, check if any master SKUs are MISSING from Firestore → CREATE them
 *
 * Run: node scripts/migration/04_reconcile_lotusland.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';
import { readFileSync, writeFileSync }   from 'fs';
import { join, dirname }                 from 'path';
import { fileURLToPath }                 from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(join(__dirname, '../serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

const SUPPLIER_ID = 'supplier-lotusland';

// ── Load master ────────────────────────────────────────────────────────────────
const masterPath = join(__dirname, '../../AI Prompts/LotusLand Master Price List.json');
const master = JSON.parse(readFileSync(masterPath, 'utf8'));
console.log(`📋  Master: ${master.length} SKUs, ${new Set(master.map(r => r.product)).size} unique products`);

// ── Normalise helpers ──────────────────────────────────────────────────────────
function normaliseName(s) {
  return (s || '').toLowerCase()
    .replace(/[βb]/g, 'b')          // β4 → b4
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normaliseDosage(s) {
  return (s || '').toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*\/\s*/g, '/')
    .trim();
}

// Build normalised lookup from master: normName+normDosage → master entry
const masterMap = new Map();
for (const row of master) {
  const key = `${normaliseName(row.product)}|${normaliseDosage(row.dosage)}`;
  masterMap.set(key, row);
}

// Build normalised product name lookup for canonical product docs
const productNameMap = new Map(); // normName → { id, ref, canonicalName }
const prodSnap = await db.collection('products').get();
prodSnap.forEach(doc => {
  const name = doc.data().canonicalName || doc.data().name || '';
  productNameMap.set(normaliseName(name), { id: doc.id, ref: doc.ref, canonicalName: name });
});
console.log(`📦  Products in DB: ${productNameMap.size}`);

// ── Load all current Lotusland variants ───────────────────────────────────────
// Note: collectionGroup+where requires an index — load all and filter in memory instead
console.log('\n🔍  Loading all variants and filtering Lotusland in memory…');
const varSnap = await db.collectionGroup('variants').get();
const lotuslandDocs = varSnap.docs.filter(v => (v.data().supplierId || v.data().supplier) === SUPPLIER_ID);
console.log(`    Found ${lotuslandDocs.length} Lotusland variants (total variants scanned: ${varSnap.size})`);

// Index by variant document ref
const existingVariants = lotuslandDocs.map(v => ({
  ref:       v.ref,
  id:        v.id,
  productId: v.ref.parent.parent.id,
  data:      v.data(),
}));

// ── Reconcile ─────────────────────────────────────────────────────────────────
const matched   = new Set(); // master keys that have been matched
const toDelete  = [];
const toUpdate  = [];
const toCreate  = []; // master SKUs with no variant in DB

for (const variant of existingVariants) {
  const productId = variant.productId;
  // Find the product's canonicalName
  const productDoc = prodSnap.docs.find(d => d.id === productId);
  const productName = productDoc?.data().canonicalName || productDoc?.data().name || productId;

  // Try matching by normalised product name + dosage
  const varDosage = variant.data.dosage || variant.data.label || '';
  const lookupKey = `${normaliseName(productName)}|${normaliseDosage(varDosage)}`;
  const masterRow = masterMap.get(lookupKey);

  if (masterRow) {
    // Matched — update with master pricing
    matched.add(lookupKey);
    toUpdate.push({ variant, masterRow, productName, lookupKey });
  } else {
    // No match — orphan, delete
    toDelete.push({ variant, productName, varDosage, lookupKey });
  }
}

// Find master SKUs with no matching variant → need to be created
for (const [key, row] of masterMap.entries()) {
  if (!matched.has(key)) {
    // Find or create the product doc
    const productEntry = productNameMap.get(normaliseName(row.product));
    toCreate.push({ key, row, productEntry });
  }
}

// ── Dry run report ────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════');
console.log('  DRY RUN REPORT');
console.log('══════════════════════════════════════════════════');
console.log(`  Existing Lotusland variants : ${existingVariants.length}`);
console.log(`  ✅ Matched (will UPDATE)    : ${toUpdate.length}`);
console.log(`  🗑  Orphaned (will DELETE)  : ${toDelete.length}`);
console.log(`  ➕ Missing (will CREATE)    : ${toCreate.length}`);
console.log(`  Expected after reconcile    : ${toUpdate.length + toCreate.length} (target: 104)`);

if (toDelete.length > 0) {
  console.log('\nOrphans to delete:');
  toDelete.slice(0, 20).forEach(o =>
    console.log(`  🗑  [${o.variant.productId}] variant: ${o.variant.id} | product: "${o.productName}" | dosage: "${o.varDosage}" | key: ${o.lookupKey}`)
  );
  if (toDelete.length > 20) console.log(`  ... and ${toDelete.length - 20} more`);
}

if (toCreate.length > 0) {
  console.log('\nMissing SKUs to create:');
  toCreate.forEach(c =>
    console.log(`  ➕ "${c.row.product}" | ${c.row.dosage} | product found: ${c.productEntry ? c.productEntry.id : '❌ MISSING PRODUCT'}`)
  );
}

// ── Write log and wait for approval ──────────────────────────────────────────
const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outFile = join(__dirname, `lotusland_reconcile_plan_${ts}.json`);
writeFileSync(outFile, JSON.stringify({
  summary: { existing: existingVariants.length, toUpdate: toUpdate.length, toDelete: toDelete.length, toCreate: toCreate.length },
  toDelete: toDelete.map(o => ({ variantId: o.variant.id, productId: o.variant.productId, productName: o.productName, dosage: o.varDosage, lookupKey: o.lookupKey })),
  toCreate: toCreate.map(c => ({ product: c.row.product, dosage: c.row.dosage, productDocId: c.productEntry?.id || null })),
  toUpdate: toUpdate.map(u => ({ variantId: u.variant.id, productId: u.variant.productId, productName: u.productName, dosage: u.varDosage })),
}, null, 2));
console.log(`\n📄  Plan written → ${outFile}`);
console.log('\nRun with --execute to apply changes.');

// ── Execute if flag passed ─────────────────────────────────────────────────────
const EXECUTE = process.argv.includes('--execute');
if (!EXECUTE) {
  console.log('\n⚠️  DRY RUN only — pass --execute to apply.');
  process.exit(0);
}

console.log('\n🚀  EXECUTING…');
let deleted = 0, updated = 0, created = 0, errors = [];

// DELETE orphans
for (const o of toDelete) {
  try {
    await o.variant.ref.delete();
    deleted++;
    console.log(`  🗑  deleted ${o.variant.id} from ${o.variant.productId}`);
  } catch (e) { errors.push({ op: 'delete', id: o.variant.id, err: e.message }); }
}

// UPDATE matched variants with master pricing
for (const { variant, masterRow } of toUpdate) {
  try {
    await variant.ref.update({
      dosage:          masterRow.dosage,
      presentation:    masterRow.presentation || 'vial',
      unit_price:      masterRow.perVialPriceUSD,
      cost_10:         masterRow.perKitPriceUSD,
      quantity:        masterRow.quantity,
      supplierId:      SUPPLIER_ID,
      supplierName:    'Lotusland',
      label:           masterRow.dosage,
      updatedAt:       new Date(),
      _reconciledAt:   new Date(),
    });
    updated++;
  } catch (e) { errors.push({ op: 'update', id: variant.id, err: e.message }); }
}

// CREATE missing variants
for (const { row, productEntry } of toCreate) {
  if (!productEntry) {
    errors.push({ op: 'create', product: row.product, dosage: row.dosage, err: 'Product not found in DB' });
    continue;
  }
  try {
    const varId = `lotusland_${normaliseName(row.product).replace(/\s+/g, '_')}_${normaliseDosage(row.dosage).replace(/[^a-z0-9]+/g, '_')}`;
    await productEntry.ref.collection('variants').doc(varId).set({
      id:           varId,
      supplierId:   SUPPLIER_ID,
      supplierName: 'Lotusland',
      label:        row.dosage,
      dosage:       row.dosage,
      presentation: row.presentation || 'vial',
      unit_price:   row.perVialPriceUSD,
      cost_10:      row.perKitPriceUSD,
      quantity:     row.quantity,
      isActive:     true,
      status:       'active',
      createdAt:    new Date(),
      updatedAt:    new Date(),
      _reconciledAt: new Date(),
    });
    created++;
    console.log(`  ➕ created ${varId} in ${productEntry.id}`);
  } catch (e) { errors.push({ op: 'create', product: row.product, dosage: row.dosage, err: e.message }); }
}

console.log('\n══════════════════════════════════════════════════');
console.log('  RECONCILE COMPLETE');
console.log('══════════════════════════════════════════════════');
console.log(`  Deleted  : ${deleted}`);
console.log(`  Updated  : ${updated}`);
console.log(`  Created  : ${created}`);
console.log(`  Errors   : ${errors.length}`);
if (errors.length) console.log('  Errors:', JSON.stringify(errors, null, 2));

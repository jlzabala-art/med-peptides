/**
 * PHASE 5 — Normalise `dosage` field on non-Lotusland peptide supplier variants
 *
 * Many NP Labs / Bioniq / Europeptides / POD / Magenta / Fusion / Vallida variants
 * have label = "Default Variant" and dosage = undefined.
 * Their dosage info is buried in the PRODUCT canonicalName (e.g. "BPC-157 5mg").
 *
 * Strategy:
 *   1. For each variant with supplierId in TARGET_SUPPLIERS and dosage = undefined/null
 *   2. Look up its parent product canonicalName
 *   3. Extract a dosage string via regex (e.g. "5mg", "10 mg", "2000 mcg", "5000 IU")
 *   4. Also extract presentation (vial, pen, spray, capsule, tablet) from the name/label
 *   5. Write `dosage` and `presentation` to the variant doc
 *
 * Run (dry-run):  node scripts/migration/05_normalise_dosage.mjs
 * Run (execute):  node scripts/migration/05_normalise_dosage.mjs --execute
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

// Suppliers that need dosage extraction (all peptide suppliers except Lotusland which is already done)
// DNA tests, diagnostics, lab tests are excluded (dosage N/A)
const TARGET_SUPPLIERS = new Set([
  'supplier-nplabs',
  'supplier-europeptides',
  'supplier-bioniq',
  'supplier-pod-poland',
  'supplier-magenta',
  'supplier-fusion',
  'supplier-vallida',
]);

// Regex to extract dosage string from product names or variant labels
// Matches: "5mg", "10 mg", "2000 mcg", "5000 IU", "500mg/ml", "250 mcg/tablet"
const DOSAGE_RE = /\b(\d+(?:\.\d+)?)\s*(mg|mcg|µg|iu|ml|g)\b(?:\s*\/\s*(ml|vial|tablet|cap|pen|spray))?/i;

// Presentation keywords
const PRES_MAP = [
  { re: /nasal\s*spray|spray/i,       val: 'spray' },
  { re: /pre[-\s]?fill|prefill|pen/i, val: 'pen' },
  { re: /capsule|cap\b/i,             val: 'capsule' },
  { re: /tablet|tab\b/i,              val: 'tablet' },
  { re: /cream|gel|topical/i,         val: 'cream' },
  { re: /kit\b/i,                     val: 'kit' },
  { re: /vial/i,                      val: 'vial' },
];

function extractDosage(text) {
  const m = (text || '').match(DOSAGE_RE);
  if (!m) return null;
  const amount = m[1];
  const unit   = m[2].toLowerCase().replace('µg', 'mcg');
  return `${amount} ${unit}`;
}

function extractPresentation(text) {
  for (const { re, val } of PRES_MAP) {
    if (re.test(text || '')) return val;
  }
  return null;
}

// ── Load all products for name lookup ─────────────────────────────────────────
console.log('📦  Loading product docs…');
const prodSnap = await db.collection('products').get();
const productNames = {};
prodSnap.forEach(d => { productNames[d.id] = d.data().canonicalName || d.data().name || d.id; });
console.log(`    Loaded ${prodSnap.size} products`);

// ── Load all variants ──────────────────────────────────────────────────────────
console.log('🔍  Loading all variants…');
const varSnap = await db.collectionGroup('variants').get();
console.log(`    Loaded ${varSnap.size} variants`);

// ── Filter targets: supplierId in TARGET_SUPPLIERS and dosage empty ────────────
const targets = varSnap.docs.filter(doc => {
  const d = doc.data();
  const sid = d.supplierId || d.supplier;
  if (!TARGET_SUPPLIERS.has(sid)) return false;
  if (d.dosage && d.dosage !== 'undefined' && d.dosage !== '') return false; // already has dosage
  return true;
});

console.log(`\n🎯  Variants needing dosage: ${targets.length}`);

// ── Build update list ──────────────────────────────────────────────────────────
const updates = [];
const skipped = [];

for (const doc of targets) {
  const d        = doc.data();
  const productId = doc.ref.parent.parent.id;
  const productName = productNames[productId] || '';
  const label    = d.label || '';

  // Try extracting from label first, then product name
  const dosage       = extractDosage(label) || extractDosage(productName);
  const presentation = extractPresentation(label) || extractPresentation(productName) || d.presentation || 'vial';

  if (dosage) {
    updates.push({
      ref: doc.ref,
      id:  doc.id,
      productId,
      productName,
      label,
      currentDosage: d.dosage,
      newDosage: dosage,
      presentation,
    });
  } else {
    skipped.push({ id: doc.id, productId, productName, label, supplierId: d.supplierId || d.supplier });
  }
}

// ── Dry-run report ─────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════');
console.log('  DRY RUN REPORT');
console.log('══════════════════════════════════════════════════');
console.log(`  Will update (dosage extracted)  : ${updates.length}`);
console.log(`  Cannot extract dosage (skipped) : ${skipped.length}`);

console.log('\nSample updates:');
updates.slice(0, 15).forEach(u =>
  console.log(`  [${u.productId}] "${u.productName}" → dosage: "${u.newDosage}", pres: "${u.presentation}"`)
);

if (skipped.length) {
  console.log('\nSkipped (no dosage in name/label):');
  skipped.slice(0, 10).forEach(s =>
    console.log(`  [${s.supplierId}] ${s.productId} | label: "${s.label}"`)
  );
  if (skipped.length > 10) console.log(`  ...and ${skipped.length - 10} more`);
}

// ── Write plan log ─────────────────────────────────────────────────────────────
const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const logPath = join(__dirname, `dosage_normalise_plan_${ts}.json`);
writeFileSync(logPath, JSON.stringify({ updates: updates.map(u => ({ ...u, ref: undefined })), skipped }, null, 2));
console.log(`\n📄  Plan → ${logPath}`);

// ── Execute ────────────────────────────────────────────────────────────────────
const EXECUTE = process.argv.includes('--execute');
if (!EXECUTE) {
  console.log('\n⚠️  DRY RUN — pass --execute to apply.');
  process.exit(0);
}

console.log('\n🚀  Applying updates…');
let done = 0, errors = [];

// Batch writes (500 per batch)
const BATCH_SIZE = 400;
for (let i = 0; i < updates.length; i += BATCH_SIZE) {
  const batch = db.batch();
  const chunk = updates.slice(i, i + BATCH_SIZE);
  for (const u of chunk) {
    batch.update(u.ref, {
      dosage:       u.newDosage,
      presentation: u.presentation,
      updatedAt:    new Date(),
    });
  }
  try {
    await batch.commit();
    done += chunk.length;
    console.log(`  ✅  batch ${Math.floor(i / BATCH_SIZE) + 1}: wrote ${chunk.length} variants`);
  } catch (e) {
    errors.push(e.message);
    console.error('  ❌  batch error:', e.message);
  }
}

console.log('\n══════════════════════════════════════════════════');
console.log('  NORMALISE COMPLETE');
console.log('══════════════════════════════════════════════════');
console.log(`  Updated : ${done}`);
console.log(`  Skipped : ${skipped.length}`);
console.log(`  Errors  : ${errors.length}`);

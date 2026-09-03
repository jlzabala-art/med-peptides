/**
 * PHASE 3b — Clean Canonical Names + Deduplicate Variants
 *
 * Problems this fixes:
 *   1. Product canonicalName contains dosage/presentation (e.g. "BPC-157 5mg vial" → "BPC-157")
 *   2. Lotusland has 255 variants in DB but only ~104 are canonical
 *      — duplicates from lotusland_* import docs (no price) vs canonical docs (with price)
 *
 * Strategy:
 *   a. Strip dosage/presentation from ALL product canonicalNames
 *   b. Set single clean `id` field on product (= doc.id); remove canonicalId
 *   c. Deduplicate variants per product by supplierId+label: keep priced, delete unpriced
 *   d. Ensure variant `id` field = v.id; remove variantId
 *
 * Run AFTER 03_merge.mjs
 * Run: node scripts/migration/03b_clean_names_dedup_variants.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue }      from 'firebase-admin/firestore';
import { readFileSync, writeFileSync }   from 'fs';
import { join, dirname }                 from 'path';
import { fileURLToPath }                 from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(join(__dirname, '../serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

// ── Fields to DELETE from canonical product docs ──────────────────────────────
const STRIP_FROM_PRODUCT = [
  // Commercial → variant only
  'dosage', 'dose', 'dosage_form', 'strength', 'total_mg',
  'presentation', 'formatId',
  'supplierId', 'supplierName', 'supplier', 'availableSuppliers', 'supplierIds',
  'unit_price', 'price', 'pricing', 'pricing_normalized', 'pricing_tiers',
  'price_per_mg_usd', 'currency', 'pricePerMg',
  'skus', 'stock', 'singleSourceRisk',
  // Import artifacts
  'source', 'source_file', 'source_label',
  '_normalized', '_denormalizedAt', '_isCanonical',
  'commercialStatus', 'zohoSync', 'peptideId', 'peptideIds',
  // Redundant IDs — only keep `id` (= doc.id)
  'canonicalId', 'variantId',
];

// ── Dosage/presentation patterns to strip from the END of a product name ──────
const STRIP_PATTERNS = [
  // Combined: "5 mg | 5 mg / vial"
  /\s*\d+[\d.,]*\s*(mg|mcg|iu|ml|g)\s*[|+×x]\s*\d+[\d.,]*\s*(mg|mcg|iu|ml|g)\s*(\/\s*(vial|bottle|pen|spray|tab|caps?|capsule))?\s*$/i,
  // Standard: "5 mg / vial", "10mg/vial", "2 mg"
  /\s*\d+[\d.,]*\s*(mg|mcg|iu|ml|g)\s*(\/\s*(vial|bottle|pen|spray|tab|caps?|capsule|tablet))?\s*$/i,
  // Format only: "... vial", "... caps x30"
  /\s+(vial|bottle|pen|nasal spray|spray|capsule|caps|tab|tablet)(\s+x\d+)?\s*$/i,
  /\s+x\s*\d+\s*$/i,
];

function cleanProductName(name) {
  if (!name) return name;
  let clean = name.trim();
  for (const pattern of STRIP_PATTERNS) {
    clean = clean.replace(pattern, '').trim();
  }
  clean = clean.replace(/[\s\-/|]+$/, '').trim();
  return clean || name.trim();
}

/** True if a variant has real pricing data */
function hasPricing(d) {
  if (d.unit_price && Number(d.unit_price) > 0) return true;
  if (Array.isArray(d.pricing_tiers) && d.pricing_tiers.some(t => Number(t.price) > 0)) return true;
  return false;
}

/** Deduplication key: supplierId + normalised label */
function variantDedupeKey(d) {
  const supplierId = d.supplierId || '';
  const label = (d.label || d.dosage || d.presentation || '').trim().toLowerCase();
  return `${supplierId}::${label}`;
}

// ─────────────────────────────────────────────────────────────────────────────

async function cleanAndDedup() {
  console.log('🔍  Loading all products…');
  const productsSnap = await db.collection('products').get();
  console.log(`    ${productsSnap.size} product docs`);

  let namesFixed = 0, variantsDeleted = 0, variantsFixed = 0;
  const log = [];

  for (const doc of productsSnap.docs) {
    const data = doc.data();

    // ── 1. Clean canonical product doc ────────────────────────────────────────
    const originalName = data.canonicalName || data.name || '';
    const cleanName    = cleanProductName(originalName);
    const productUpdate = { updatedAt: new Date(), id: doc.id };  // ensure id = doc.id

    // Delete commercial + redundant fields
    STRIP_FROM_PRODUCT.forEach(f => { if (f in data) productUpdate[f] = FieldValue.delete(); });

    if (cleanName !== originalName) {
      productUpdate.canonicalName = cleanName;
      productUpdate.name          = cleanName;
      namesFixed++;
      console.log(`  ✏️  "${originalName}" → "${cleanName}"`);
      log.push({ type: 'name_fix', docId: doc.id, from: originalName, to: cleanName });
    }

    await doc.ref.update(productUpdate);

    // ── 2. Clean variants: set id field, remove variantId, deduplicate ────────
    const varSnap = await doc.ref.collection('variants').get();
    if (varSnap.size === 0) continue;

    // Fix each variant's id field
    for (const v of varSnap.docs) {
      const vd = v.data();
      const variantUpdate = {};
      if (vd.id !== v.id) { variantUpdate.id = v.id; variantsFixed++; }
      if ('variantId' in vd) variantUpdate.variantId = FieldValue.delete();
      if ('canonicalId' in vd) variantUpdate.canonicalId = FieldValue.delete();
      if (Object.keys(variantUpdate).length > 0) await v.ref.update(variantUpdate);
    }

    // Deduplicate by supplierId+label
    if (varSnap.size <= 1) continue;
    const byKey = {};
    varSnap.forEach(v => {
      const key = variantDedupeKey(v.data());
      if (!byKey[key]) byKey[key] = [];
      byKey[key].push({ ref: v.ref, id: v.id, data: v.data() });
    });

    for (const [key, variants] of Object.entries(byKey)) {
      if (variants.length <= 1) continue;
      // Sort: priced variants first
      variants.sort((a, b) => (hasPricing(b.data) ? 1 : 0) - (hasPricing(a.data) ? 1 : 0));
      const keeper   = variants[0];
      const toDelete = variants.slice(1);
      for (const dup of toDelete) {
        await dup.ref.delete();
        variantsDeleted++;
        console.log(`  🗑  Dup variant ${dup.id} (kept: ${keeper.id}) key: ${key}`);
        log.push({ type: 'variant_dedup', docId: doc.id, deleted: dup.id, kept: keeper.id, key });
      }
    }
  }

  // Final counts
  const afterVarSnap = await db.collectionGroup('variants').get();
  const lotusAfter   = afterVarSnap.docs.filter(v => v.data().supplierId === 'supplier-lotusland').length;

  const ts      = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outFile = join(__dirname, `clean_log_${ts}.json`);
  writeFileSync(outFile, JSON.stringify({ namesFixed, variantsDeleted, variantsFixed, actions: log }, null, 2));

  console.log('\n══════════════════════════════════════════════════');
  console.log('  CLEAN + DEDUP COMPLETE');
  console.log('══════════════════════════════════════════════════');
  console.log(`  Names cleaned        : ${namesFixed}`);
  console.log(`  Dup variants deleted : ${variantsDeleted}`);
  console.log(`  Variants id-fixed    : ${variantsFixed}`);
  console.log(`  Total variants now   : ${afterVarSnap.size}`);
  console.log(`  Lotusland variants   : ${lotusAfter}  (target: ~104)`);
  console.log(`  Log → ${outFile}`);
}

cleanAndDedup().catch(err => { console.error('❌ Failed:', err); process.exit(1); });

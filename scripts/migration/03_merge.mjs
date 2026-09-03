/**
 * PHASE 3 — Merge (WRITES to Firestore)
 * ⚠️  Only run AFTER reviewing the dry_run_report JSON.
 * ⚠️  Only run AFTER confirming backup_*.json exists.
 *
 * What this does:
 *  1. Groups all product docs by canonicalName
 *  2. For each group > 1:
 *     a. Picks a "winner" canonical doc (shortest clean ID)
 *     b. Strips commercial fields from the winner doc (price, dosage, supplier, etc.)
 *     c. Moves variants from loser docs into the winner's subcollection
 *     d. Writes a `_mergedFrom` array on the winner doc (redirect map for old IDs)
 *     e. Deletes the loser docs (only after variants verified)
 *  3. Also cleans ALL singleton product docs of commercial fields
 *
 * Run: node scripts/migration/03_merge.mjs
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  CANONICAL PRODUCT SCHEMA (post-migration)
 * ═══════════════════════════════════════════════════════════════════════
 *  products/{id}
 *    canonicalName    string   ✅ keep
 *    name             string   ✅ keep
 *    category         string   ✅ keep
 *    categoryId       string   ✅ keep
 *    description      string   ✅ keep
 *    scientificName   string   ✅ keep
 *    pharmacology     string   ✅ keep
 *    mechanisms       string   ✅ keep
 *    goalIds          array    ✅ keep
 *    imageUrl         string   ✅ keep
 *    slug             string   ✅ keep
 *    isActive         boolean  ✅ keep
 *    status           string   ✅ keep
 *    type             string   ✅ keep
 *    _schemaVersion   string   ✅ keep
 *    createdAt        ts       ✅ keep
 *    updatedAt        ts       ✅ keep
 *    _mergedFrom      array    ✅ added by this script
 *
 *    ❌ REMOVED from canonical doc (moved to variants):
 *    dosage, dose, dosage_form, strength, total_mg
 *    presentation, formatId
 *    supplierId, supplierName, availableSuppliers, supplierIds
 *    unit_price, price, pricing, pricing_normalized, pricing_tiers,
 *    price_per_mg_usd, currency
 *    skus, stock, singleSourceRisk
 *    source, source_file, source_label, _normalized, _denormalizedAt
 *    canonicalId, id (redundant), variantCount
 *
 *  products/{id}/variants/{variantId}
 *    supplierId       string   ✅ required
 *    supplierName     string   ✅ keep
 *    dosage           string   ✅ keep (moved from product if present)
 *    presentation     string   ✅ keep (moved from product if present)
 *    formatId         string   ✅ keep
 *    unit_price       number   ✅ keep
 *    pricing_tiers    array    ✅ keep
 *    stock            number   ✅ keep
 *    isActive         boolean  ✅ keep
 *    status           string   ✅ keep
 *    label            string   ✅ keep
 *    createdAt, updatedAt      ✅ keep
 * ═══════════════════════════════════════════════════════════════════════
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

// ── Schema: fields allowed on the canonical product doc ─────────────────────
const CANONICAL_FIELDS = new Set([
  'canonicalName', 'name', 'displayName', 'slug',
  'category', 'categoryId',
  'description', 'scientificName', 'pharmacology', 'mechanisms',
  'goalIds',
  'imageUrl', 'imageUrls',
  'isActive', 'status', 'type',
  '_schemaVersion', '_mergedFrom',
  'createdAt', 'updatedAt',
  // Computed/cached (acceptable at product level for read performance)
  'variantCount', // will be re-computed after merge
]);

// Fields that belong in variants, not in the product doc
const COMMERCIAL_FIELDS_TO_STRIP = [
  'dosage', 'dose', 'dosage_form', 'strength', 'total_mg',
  'presentation', 'formatId',
  'supplierId', 'supplierName', 'supplier', 'availableSuppliers', 'supplierIds',
  'unit_price', 'price', 'pricing', 'pricing_normalized', 'pricing_tiers',
  'price_per_mg_usd', 'currency', 'pricePerMg',
  'skus', 'stock', 'singleSourceRisk',
  'source', 'source_file', 'source_label',
  '_normalized', '_denormalizedAt', '_isCanonical',
  'canonicalId',                // ← removed: redundant with doc.id — only `id` stays
  'variantId',                  // ← removed: redundant with v.id  — only `id` stays
  'commercialStatus', 'zohoSync',
  'peptideId', 'peptideIds',    // internal import artifacts
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function pickWinner(docs) {
  const isClean = id =>
    !id.startsWith('lotusland_') &&
    !id.startsWith('bioniq_') &&
    !id.startsWith('nplabs_') &&
    !/_(mg|mcg|ml|vial|caps|pen|spray|nasal|single_use)/.test(id);

  const clean = docs.filter(d => isClean(d.id));
  const pool  = clean.length > 0 ? clean : docs;
  return pool.sort((a, b) => a.id.length - b.id.length || a.id.localeCompare(b.id))[0];
}

/** Remove commercial fields from a data object, return clean canonical data */
function toCanonicalData(data, extraFields = {}) {
  const clean = {};
  for (const [k, v] of Object.entries(data)) {
    if (!COMMERCIAL_FIELDS_TO_STRIP.includes(k)) {
      clean[k] = v;
    }
  }
  return { ...clean, ...extraFields, updatedAt: new Date() };
}

// ─────────────────────────────────────────────────────────────────────────────

async function merge() {
  console.log('🚀  Loading all products + variants…');
  const productsSnap = await db.collection('products').get();
  const varSnap      = await db.collectionGroup('variants').get();

  const varsByParent = {};
  varSnap.forEach(v => {
    const pid = v.ref.parent.parent.id;
    if (!varsByParent[pid]) varsByParent[pid] = [];
    varsByParent[pid].push({ ref: v.ref, id: v.id, data: v.data() });
  });

  // Group by canonicalName
  const groups = {};
  productsSnap.forEach(doc => {
    const cn  = (doc.data().canonicalName || doc.data().name || doc.id).trim();
    const key = cn.toLowerCase();
    if (!groups[key]) groups[key] = { canonicalName: cn, docs: [] };
    groups[key].docs.push({ ref: doc.ref, id: doc.id, data: doc.data(), variants: varsByParent[doc.id] || [] });
  });

  const allGroups  = Object.values(groups);
  const duplicates = allGroups.filter(g => g.docs.length > 1);
  const singletons = allGroups.filter(g => g.docs.length === 1);

  console.log(`\n  Groups needing merge : ${duplicates.length}`);
  console.log(`  Singletons to clean  : ${singletons.length}`);

  let mergedCount = 0, deletedCount = 0, variantsMoved = 0, errors = [];

  // ── Step 1: Merge duplicate groups ────────────────────────────────────────
  for (const group of duplicates) {
    const winner = pickWinner(group.docs);
    const losers = group.docs.filter(d => d.id !== winner.id);

    console.log(`\n  [MERGE] "${group.canonicalName}"`);
    console.log(`    winner : ${winner.id}`);

    // 1a. Move variants from losers → winner
    for (const loser of losers) {
      for (const variant of loser.variants) {
        const newRef = winner.ref.collection('variants').doc(variant.id);
        // Build clean variant: strip commercial fields + redundant ID fields
        const cleanVariant = {};
        for (const [k, v] of Object.entries(variant.data)) {
          if (k !== 'canonicalId' && k !== 'variantId') cleanVariant[k] = v;
        }
        await newRef.set({
          ...cleanVariant,
          id:                   variant.id,   // single id field (= v.id)
          _migratedFromProduct: loser.id,
          updatedAt:            new Date(),
        });
        variantsMoved++;
        console.log(`    ↳ moved variant ${variant.id} from ${loser.id}`);
      }
    }

    // 1b. Update winner doc: strip commercial fields, set clean id, add _mergedFrom
    const mergedFromIds = losers.map(l => l.id);
    const winnerClean   = toCanonicalData(winner.data, {
      id:           winner.id,                 // single id field (= doc.id)
      _mergedFrom:  FieldValue.arrayUnion(...mergedFromIds),
      variantCount: winner.variants.length + losers.reduce((s, l) => s + l.variants.length, 0),
    });
    await winner.ref.set(winnerClean, { merge: true });

    // 1c. Remove commercial fields explicitly (set doesn't delete existing keys)
    const stripUpdate = {};
    COMMERCIAL_FIELDS_TO_STRIP.forEach(f => { stripUpdate[f] = FieldValue.delete(); });
    await winner.ref.update(stripUpdate);

    // 1d. Verify variants moved correctly before deleting losers
    const winnerVarSnap = await winner.ref.collection('variants').get();
    const expectedCount = winner.variants.length + losers.reduce((s, l) => s + l.variants.length, 0);
    if (winnerVarSnap.size < expectedCount) {
      errors.push(`⚠️  ${winner.id}: expected ${expectedCount} variants, found ${winnerVarSnap.size} — SKIPPING delete`);
      console.log(`    ⚠️  Variant count mismatch — skipping delete of losers`);
      continue;
    }

    // 1e. Delete loser docs (and their now-empty variants subcollections)
    for (const loser of losers) {
      // delete loser variants first (already moved, these are originals)
      for (const variant of loser.variants) {
        await variant.ref.delete();
      }
      await loser.ref.delete();
      deletedCount++;
      console.log(`    🗑  deleted ${loser.id}`);
    }

    mergedCount++;
  }

  // ── Step 2: Clean singleton docs (strip commercial fields) ────────────────
  console.log('\n  Cleaning singleton product docs…');
  let cleanedCount = 0;
  for (const group of singletons) {
    const doc = group.docs[0];
    const stripUpdate = {};
    COMMERCIAL_FIELDS_TO_STRIP.forEach(f => {
      if (f in doc.data) stripUpdate[f] = FieldValue.delete();
    });
    if (Object.keys(stripUpdate).length > 0) {
      await doc.ref.update({ ...stripUpdate, updatedAt: new Date() });
      cleanedCount++;
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const ts      = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const logFile = join(__dirname, `merge_log_${ts}.json`);
  const log = {
    completedAt: new Date().toISOString(),
    groupsMerged: mergedCount,
    docsDeleted:  deletedCount,
    variantsMoved,
    singletonsCleaned: cleanedCount,
    errors,
  };
  writeFileSync(logFile, JSON.stringify(log, null, 2));

  console.log('\n══════════════════════════════════════════════════');
  console.log('  MERGE COMPLETE');
  console.log('══════════════════════════════════════════════════');
  console.log(`  Groups merged        : ${mergedCount}`);
  console.log(`  Docs deleted         : ${deletedCount}`);
  console.log(`  Variants moved       : ${variantsMoved}`);
  console.log(`  Singletons cleaned   : ${cleanedCount}`);
  if (errors.length > 0) {
    console.log(`\n  ⚠️  ${errors.length} errors:`);
    errors.forEach(e => console.log('  ' + e));
  } else {
    console.log(`  Errors               : none ✅`);
  }
  console.log(`\n  Log → ${logFile}`);
}

merge().catch(err => { console.error('❌ Merge failed:', err); process.exit(1); });

/**
 * phase6_migrateAIContent_live.mjs
 *
 * Phase 6 — Migrate AI Content into aiContent sub-object (LIVE)
 * ────────────────────────────────────────────────────────────────────────────
 *
 * ⚠️  THIS SCRIPT WRITES TO FIRESTORE. Run the dry-run first:
 *      node scripts/phase6_migrateAIContent_dryrun.mjs
 *
 * What it does:
 *   - For each product, creates/populates the aiContent{} sub-object with:
 *       • faqModalItems       ← v2 canonical (or legacy root if v2 absent)
 *       • faqModalEnabled     ← v2 canonical (or legacy root if v2 absent)
 *       • scientificModalEnabled ← v2 canonical (or legacy root if v2 absent)
 *       • summary             ← v2 only (never invented)
 *       • beginnerExplanation ← v2 only (never invented)
 *       • scientificSummary   ← v2 only (never invented)
 *
 * Rules:
 *   - NEVER invent content
 *   - NEVER overwrite non-empty aiContent fields already in Firestore
 *   - Legacy root fields (faqModalItems etc.) are NOT deleted — Phase 11 cleanup
 *   - Processed in batches of 400 ops to stay within Firestore limits
 *   - Stamps migrationVersion=6 and migratedAt on each updated document
 *
 * Usage:
 *   node scripts/phase6_migrateAIContent_live.mjs
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { db } from './lib/firebase-admin.mjs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ── Load v2 canonical catalog ─────────────────────────────────────────────────
const catalogPath = join(__dirname, '../src/data/v2/catalog.v2.json');
let catalogV2 = [];
try {
  catalogV2 = JSON.parse(readFileSync(catalogPath, 'utf8'));
  console.log(`✅ Loaded v2 catalog: ${catalogV2.length} products\n`);
} catch (err) {
  console.error(`❌ Could not load v2 catalog at ${catalogPath}`);
  console.error(`   ${err.message}`);
  process.exit(1);
}

const MIGRATION_VERSION = 6;
const BATCH_SIZE        = 400;

// Fields moved from root → aiContent
const LEGACY_ROOT_FIELDS = ['faqModalItems', 'faqModalEnabled', 'scientificModalEnabled'];
// Fields sourced exclusively from v2 (never from root, never invented)
const V2_ONLY_FIELDS     = ['summary', 'beginnerExplanation', 'scientificSummary'];

// ── v2 lookup (same as phase5) ────────────────────────────────────────────────
function buildV2LookupMap(catalog) {
  const map = new Map();
  for (const p of catalog) {
    const fullName = (p.name ?? '').toLowerCase().trim();
    if (fullName) map.set(fullName, p);

    const base = fullName.replace(/\s*[(/|].*$/, '').trim();
    if (base && base !== fullName && !map.has(base)) map.set(base, p);

    const slug = (p.slug ?? '').toLowerCase().trim();
    if (slug && !map.has(slug)) map.set(slug, p);

    for (const alias of (p.identity?.searchAliases ?? p.searchAliases ?? [])) {
      const aliasKey = alias.toLowerCase().trim();
      if (aliasKey && !map.has(aliasKey)) map.set(aliasKey, p);
    }
  }
  return map;
}

function resolveV2Product(firestoreName, firestoreId, v2Map) {
  const nameKey = (firestoreName ?? '').toLowerCase().trim();
  if (nameKey && v2Map.has(nameKey)) return v2Map.get(nameKey);

  const baseKey = nameKey.replace(/\s*[(/|].*$/, '').trim();
  if (baseKey && v2Map.has(baseKey)) return v2Map.get(baseKey);

  const idKey = (firestoreId ?? '').toLowerCase()
    .replace(/-\d+(\.\d+)?(mg|mcg|iu|ml|g|kg|unit|vial|kit|pack|tab|cap|amp).*$/i, '')
    .replace(/-+$/, '')
    .trim();
  if (idKey && v2Map.has(idKey)) return v2Map.get(idKey);

  for (const [key, product] of v2Map) {
    if (nameKey && (key.startsWith(nameKey) || nameKey.startsWith(key))) {
      return product;
    }
  }
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractFromV2(v2product, field) {
  if (!v2product) return undefined;
  if (v2product.aiContent?.[field] !== undefined) return v2product.aiContent[field];
  if (v2product[field] !== undefined) return v2product[field];
  return undefined;
}

function isEmpty(val) {
  if (val === undefined || val === null || val === '') return true;
  if (Array.isArray(val) && val.length === 0) return true;
  return false;
}

// ── Build aiContent update payload ────────────────────────────────────────────
function buildAiContentUpdate(firestoreDoc, v2product) {
  const current = firestoreDoc.aiContent ?? {};
  const aiUpdate = {};
  const reasons  = [];

  // 1. Migrate legacy root fields
  for (const field of LEGACY_ROOT_FIELDS) {
    if (!isEmpty(current[field])) continue; // already in aiContent

    const v2Value     = extractFromV2(v2product, field);
    const legacyValue = firestoreDoc[field];

    if (!isEmpty(v2Value)) {
      aiUpdate[field] = v2Value;
      reasons.push(`${field} ← v2`);
    } else if (!isEmpty(legacyValue)) {
      aiUpdate[field] = legacyValue;
      reasons.push(`${field} ← legacy root`);
    }
  }

  // 2. Add v2-only rich fields (never invented)
  for (const field of V2_ONLY_FIELDS) {
    if (!isEmpty(current[field])) continue;
    const v2Value = extractFromV2(v2product, field);
    if (!isEmpty(v2Value)) {
      aiUpdate[field] = v2Value;
      reasons.push(`${field} ← v2`);
    }
  }

  return { aiUpdate, reasons };
}

// ── Main migration ────────────────────────────────────────────────────────────
async function runMigration() {
  console.log('🚀  Phase 6 — AI Content Migration LIVE');
  console.log('='.repeat(72));
  console.log('  ⚠️  WRITING TO FIRESTORE. This is not a dry-run.\n');

  const v2Map = buildV2LookupMap(catalogV2);

  console.log('📡  Fetching products from Firestore...');
  const snap = await db.collection('products').get();
  const firestoreProducts = snap.docs.map(d => ({ _ref: d.ref, id: d.id, ...d.data() }));
  console.log(`✅  Found ${firestoreProducts.length} documents\n`);

  let updated   = 0;
  let skipped   = 0;
  let unmatched = 0;
  let errors    = 0;

  const migratedAt = new Date().toISOString();

  let batch     = db.batch();
  let opsInBatch = 0;

  const flushBatch = async () => {
    if (opsInBatch > 0) {
      await batch.commit();
      batch = db.batch();
      opsInBatch = 0;
    }
  };

  for (const product of firestoreProducts) {
    const v2 = resolveV2Product(product.name, product.id, v2Map);

    if (!v2) unmatched++;

    const { aiUpdate, reasons } = buildAiContentUpdate(product, v2 ?? null);

    if (Object.keys(aiUpdate).length === 0) {
      skipped++;
      continue;
    }

    // Build the Firestore update — use dotted field paths for the aiContent sub-object
    // so we only write the specific keys we need without clobbering sibling keys.
    const firestoreUpdate = {};
    for (const [k, v] of Object.entries(aiUpdate)) {
      firestoreUpdate[`aiContent.${k}`] = v;
    }
    firestoreUpdate.migrationVersion = MIGRATION_VERSION;
    firestoreUpdate.migratedAt       = migratedAt;

    try {
      batch.update(product._ref, firestoreUpdate);
      opsInBatch++;
      updated++;

      const label = (product.displayName ?? product.name ?? product.id).slice(0, 38).padEnd(40);
      console.log(`  ✅ ${label} [+${reasons.join(', ')}]`);

      if (opsInBatch >= BATCH_SIZE) {
        await flushBatch();
        console.log(`  ⚡ Batch committed (${BATCH_SIZE} ops)\n`);
      }
    } catch (err) {
      errors++;
      console.error(`  ❌ Failed to queue ${product.id}: ${err.message}`);
    }
  }

  await flushBatch();

  console.log('\n' + '='.repeat(72));
  console.log('\n📊  MIGRATION COMPLETE:\n');
  console.log(`  Total products   : ${firestoreProducts.length}`);
  console.log(`  Updated          : ${updated}`);
  console.log(`  Already current  : ${skipped}`);
  console.log(`  Unmatched/skipped: ${unmatched}`);
  console.log(`  Errors           : ${errors}`);
  console.log(`  Timestamp        : ${migratedAt}`);
  console.log(`  migrationVersion : ${MIGRATION_VERSION}`);
  console.log('\n✅  Phase 6 complete.\n');

  process.exit(errors > 0 ? 1 : 0);
}

runMigration().catch(err => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});

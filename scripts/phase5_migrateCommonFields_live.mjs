/**
 * phase5_migrateCommonFields_live.mjs
 *
 * Phase 5 — Migrate Common Fields to Product Root (LIVE)
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * ⚠️  THIS SCRIPT WRITES TO FIRESTORE. Run the dry-run first:
 *      node scripts/phase5_migrateCommonFields_dryrun.mjs
 *
 * What it does:
 *   - Reads each product doc from Firestore
 *   - Matches it to its v2 canonical entry
 *   - Merges the 7 common metadata fields WITHOUT overwriting existing values
 *   - Stamps each updated document with migrationVersion=5 and migratedAt
 *   - Processes in batches of 400 to stay within Firestore limits
 *
 * Fields migrated:
 *   goals, secondaryFactors, tags, mechanisms,
 *   semanticKeywords, synonyms, safetyNote
 *
 * Rules:
 *   - NEVER delete existing data
 *   - NEVER overwrite non-empty canonical fields already in Firestore
 *   - Arrays are merged: existing values + new items from v2 (deduped)
 *   - safetyNote: only written if the field is currently absent/empty
 *   - migrationVersion / migratedAt added to track progress
 *
 * Usage:
 *   node scripts/phase5_migrateCommonFields_live.mjs
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

// ── Fields to migrate ─────────────────────────────────────────────────────────
const COMMON_FIELDS = [
  'goals',
  'secondaryFactors',
  'tags',
  'mechanisms',
  'semanticKeywords',
  'synonyms',
  'safetyNote',
];

const MIGRATION_VERSION = 5;
const BATCH_SIZE        = 400; // Firestore max is 500 ops per batch

// ── Helpers (same logic as dry-run) ──────────────────────────────────────────

function extractV2Field(v2product, field) {
  if (field === 'safetyNote') {
    return v2product.safetyNote ?? v2product.safety?.note ?? null;
  }
  const fromClassification = v2product.classification?.[field];
  if (fromClassification !== undefined) return fromClassification;
  return v2product[field] ?? null;
}

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

function normalizeArray(arr) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.map((s) => String(s).trim()).filter(Boolean))];
}

function mergeArrays(firestoreArr, v2Arr) {
  const base = normalizeArray(firestoreArr);
  const additions = normalizeArray(v2Arr).filter(
    (item) => !base.map((b) => b.toLowerCase()).includes(item.toLowerCase())
  );
  return [...base, ...additions];
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

// ── Main migration ────────────────────────────────────────────────────────────
async function runMigration() {
  console.log('🚀  Phase 5 — Common Fields Migration LIVE');
  console.log('='.repeat(72));
  console.log('  ⚠️  WRITING TO FIRESTORE. This is not a dry-run.\n');

  const v2Map = buildV2LookupMap(catalogV2);

  // Fetch all Firestore products
  console.log('📡  Fetching products from Firestore...');
  const snap = await db.collection('products').get();
  const firestoreProducts = snap.docs.map((d) => ({ _ref: d.ref, id: d.id, ...d.data() }));
  console.log(`✅  Found ${firestoreProducts.length} documents\n`);

  let updated   = 0;
  let skipped   = 0;
  let unmatched = 0;
  let errors    = 0;

  const migratedAt = new Date().toISOString();

  // Process in batches
  let batch = db.batch();
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

    if (!v2) {
      unmatched++;
      console.warn(`  ⚠️  No v2 match: ${product.name ?? product.id}  [id: ${product.id}]`);
      continue;
    }

    // Build the update payload
    const update = {};

    for (const field of COMMON_FIELDS) {
      const v2Value      = extractV2Field(v2, field);
      const currentValue = product[field];

      if (field === 'safetyNote') {
        const v2str  = typeof v2Value === 'string' ? v2Value.trim() : null;
        const curStr = typeof currentValue === 'string' && currentValue.trim() ? currentValue.trim() : null;
        if (!curStr && v2str) {
          update[field] = v2str;
        }
      } else {
        const merged = mergeArrays(currentValue, v2Value);
        const before = normalizeArray(currentValue);
        const hasNew = merged.some(
          (item) => !before.map((b) => b.toLowerCase()).includes(item.toLowerCase())
        );
        if (hasNew) {
          update[field] = merged;
        }
      }
    }

    if (Object.keys(update).length === 0) {
      skipped++;
      continue;
    }

    // Stamp migration metadata
    update.migrationVersion = MIGRATION_VERSION;
    update.migratedAt       = migratedAt;

    try {
      batch.update(product._ref, update);
      opsInBatch++;
      updated++;

      console.log(`  ✅ ${(product.displayName ?? product.name ?? product.id).padEnd(40)} [+${Object.keys(update).filter(f => !['migrationVersion','migratedAt'].includes(f)).join(', ')}]`);

      // Flush batch when approaching limit
      if (opsInBatch >= BATCH_SIZE) {
        await flushBatch();
        console.log(`  ⚡ Batch committed (${BATCH_SIZE} ops)\n`);
      }
    } catch (err) {
      errors++;
      console.error(`  ❌ Failed to queue ${product.id}: ${err.message}`);
    }
  }

  // Final flush
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
  console.log('\n✅  Phase 5 complete.\n');

  process.exit(errors > 0 ? 1 : 0);
}

runMigration().catch((err) => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});

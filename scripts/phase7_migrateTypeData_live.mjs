/**
 * phase7_migrateTypeData_live.mjs
 *
 * Phase 7 — Migrate productType + typeData sub-object (LIVE)
 * ────────────────────────────────────────────────────────────────────────────
 *
 * ⚠️  WRITES TO FIRESTORE. Run the dry-run first:
 *      node scripts/phase7_migrateTypeData_dryrun.mjs
 *
 * Writes (via dotted field paths — never clobbers sibling keys):
 *   productType                    from v2
 *   typeData.peptide.{field}       from v2 typeData.peptide
 *   typeData.supplement.{field}    from v2 typeData.supplement
 *
 * Rules:
 *   - NEVER invent content
 *   - NEVER overwrite non-empty existing fields
 *   - Batches of 400 ops to stay within Firestore limits
 *   - Stamps migrationVersion=7 and migratedAt
 *
 * Usage:
 *   node scripts/phase7_migrateTypeData_live.mjs
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { db } from './lib/firebase-admin.mjs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const catalogPath = join(__dirname, '../src/data/v2/catalog.v2.json');
let catalogV2 = [];
try {
  catalogV2 = JSON.parse(readFileSync(catalogPath, 'utf8'));
  console.log(`✅ Loaded v2 catalog: ${catalogV2.length} products\n`);
} catch (err) {
  console.error(`❌ Could not load v2 catalog: ${err.message}`);
  process.exit(1);
}

const MIGRATION_VERSION = 7;
const BATCH_SIZE        = 400;

// ── Type-specific field definitions ──────────────────────────────────────────
const TYPE_FIELDS = {
  peptide:              ['mechanismOfAction', 'administrationRoutes', 'reconstitutionRelevant', 'protocolRoles', 'typicalResearchUse'],
  supplement:           ['category', 'dosageForm', 'typicalObjective'],
  genetic_test:         ['sampleType', 'reportSections', 'turnaroundTime', 'clinicalArea'],
  professional_material:['requiresVerification', 'bulkAvailable', 'documentationRequired'],
};

// ── v2 lookup ─────────────────────────────────────────────────────────────────
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
      const k = alias.toLowerCase().trim();
      if (k && !map.has(k)) map.set(k, p);
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
    .replace(/-+$/, '').trim();
  if (idKey && v2Map.has(idKey)) return v2Map.get(idKey);
  for (const [key, product] of v2Map) {
    if (nameKey && (key.startsWith(nameKey) || nameKey.startsWith(key))) return product;
  }
  return null;
}

function isEmpty(val) {
  if (val === undefined || val === null || val === '') return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return true;
  return false;
}

// ── Build update for one product ──────────────────────────────────────────────
function buildTypeDataUpdate(firestoreDoc, v2product) {
  const firestoreUpdate = {};
  const reasons         = [];

  if (!v2product) return { firestoreUpdate, reasons };

  const productType = v2product.productType;
  if (!productType) return { firestoreUpdate, reasons };

  // 1. productType at root
  if (isEmpty(firestoreDoc.productType)) {
    firestoreUpdate.productType = productType;
    reasons.push(`productType="${productType}"`);
  }

  // 2. typeData sub-object fields (dotted paths)
  const fields = TYPE_FIELDS[productType];
  if (!fields) return { firestoreUpdate, reasons };

  const v2TypeBlock       = v2product.typeData?.[productType];
  if (!v2TypeBlock) return { firestoreUpdate, reasons };

  const existingTypeBlock = firestoreDoc.typeData?.[productType] ?? {};

  for (const field of fields) {
    if (!isEmpty(existingTypeBlock[field])) continue; // already present
    const v2val = v2TypeBlock[field];
    if (!isEmpty(v2val)) {
      firestoreUpdate[`typeData.${productType}.${field}`] = v2val;
      reasons.push(`typeData.${productType}.${field}`);
    }
  }

  return { firestoreUpdate, reasons };
}

// ── Main migration ────────────────────────────────────────────────────────────
async function runMigration() {
  console.log('🚀  Phase 7 — Type-Specific Data Migration LIVE');
  console.log('='.repeat(72));
  console.log('  ⚠️  WRITING TO FIRESTORE.\n');

  const v2Map = buildV2LookupMap(catalogV2);

  console.log('📡  Fetching products from Firestore...');
  const snap = await db.collection('products').get();
  const products = snap.docs.map(d => ({ _ref: d.ref, id: d.id, ...d.data() }));
  console.log(`✅  Found ${products.length} documents\n`);

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
      batch      = db.batch();
      opsInBatch = 0;
    }
  };

  for (const product of products) {
    const v2 = resolveV2Product(product.name, product.id, v2Map);

    if (!v2) {
      unmatched++;
      continue;
    }

    const { firestoreUpdate, reasons } = buildTypeDataUpdate(product, v2);

    if (Object.keys(firestoreUpdate).length === 0) {
      skipped++;
      continue;
    }

    firestoreUpdate.migrationVersion = MIGRATION_VERSION;
    firestoreUpdate.migratedAt       = migratedAt;

    try {
      batch.update(product._ref, firestoreUpdate);
      opsInBatch++;
      updated++;

      const label = (product.displayName ?? product.name ?? product.id).slice(0, 38).padEnd(40);
      console.log(`  ✅ ${label} [${reasons.join(', ')}]`);

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
  console.log(`  Total products   : ${products.length}`);
  console.log(`  Updated          : ${updated}`);
  console.log(`  Already current  : ${skipped}`);
  console.log(`  Unmatched        : ${unmatched}`);
  console.log(`  Errors           : ${errors}`);
  console.log(`  Timestamp        : ${migratedAt}`);
  console.log(`  migrationVersion : ${MIGRATION_VERSION}`);
  console.log('\n✅  Phase 7 complete.\n');

  process.exit(errors > 0 ? 1 : 0);
}

runMigration().catch(err => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});

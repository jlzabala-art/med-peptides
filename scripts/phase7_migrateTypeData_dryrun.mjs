/**
 * phase7_migrateTypeData_dryrun.mjs
 *
 * Phase 7 — Migrate productType + typeData sub-object (DRY-RUN)
 * ────────────────────────────────────────────────────────────────────────────
 *
 * What it does (preview only, NO writes):
 *   - Sets productType from v2 canonical catalog
 *   - Creates typeData{} sub-object:
 *       For peptides    : typeData.peptide.{ mechanismOfAction, administrationRoutes,
 *                                            reconstitutionRelevant, protocolRoles,
 *                                            typicalResearchUse }
 *       For supplements : typeData.supplement.{ category, dosageForm, typicalObjective }
 *   - NEVER invents content
 *   - NEVER overwrites non-empty existing Firestore fields
 *
 * Usage:
 *   node scripts/phase7_migrateTypeData_dryrun.mjs
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

// ── v2 lookup (shared approach) ───────────────────────────────────────────────
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
  if (typeof val === 'object' && Object.keys(val).length === 0) return true;
  return false;
}

// ── Type-specific field definitions ──────────────────────────────────────────
const TYPE_FIELDS = {
  peptide:    ['mechanismOfAction', 'administrationRoutes', 'reconstitutionRelevant', 'protocolRoles', 'typicalResearchUse'],
  supplement: ['category', 'dosageForm', 'typicalObjective'],
  genetic_test:          ['sampleType', 'reportSections', 'turnaroundTime', 'clinicalArea'],
  professional_material: ['requiresVerification', 'bulkAvailable', 'documentationRequired'],
};

// ── Build update for one product ──────────────────────────────────────────────
function buildTypeDataUpdate(firestoreDoc, v2product) {
  const updates = {};
  const reasons = [];

  if (!v2product) return { updates, reasons };

  const productType = v2product.productType;
  if (!productType) return { updates, reasons };

  // 1. productType
  if (isEmpty(firestoreDoc.productType)) {
    updates.productType = productType;
    reasons.push(`productType = "${productType}"`);
  }

  // 2. typeData sub-object
  const fields = TYPE_FIELDS[productType];
  if (!fields) return { updates, reasons };

  const v2TypeBlock = v2product.typeData?.[productType];
  if (!v2TypeBlock) return { updates, reasons };

  const existingTypeBlock = firestoreDoc.typeData?.[productType] ?? {};

  for (const field of fields) {
    if (!isEmpty(existingTypeBlock[field])) continue; // already migrated
    const v2val = v2TypeBlock[field];
    if (!isEmpty(v2val)) {
      updates[`typeData.${productType}.${field}`] = v2val;
      reasons.push(`typeData.${productType}.${field} ← v2`);
    }
  }

  return { updates, reasons };
}

// ── Main dry-run ──────────────────────────────────────────────────────────────
async function runDryRun() {
  console.log('🔍  Phase 7 — Type-Specific Data Migration DRY-RUN');
  console.log('='.repeat(72));
  console.log('  No writes to Firestore.\n');

  const v2Map = buildV2LookupMap(catalogV2);

  console.log('📡  Fetching products from Firestore...');
  const snap = await db.collection('products').get();
  const products = snap.docs.map(d => ({ _ref: d.ref, id: d.id, ...d.data() }));
  console.log(`✅  Found ${products.length} documents\n`);

  let wouldUpdate = 0;
  let noChange    = 0;
  let unmatched   = 0;

  const previews    = [];
  const fieldCounts = {};

  for (const product of products) {
    const v2 = resolveV2Product(product.name, product.id, v2Map);

    if (!v2) {
      unmatched++;
      continue;
    }

    const { updates, reasons } = buildTypeDataUpdate(product, v2);

    if (Object.keys(updates).length === 0) {
      noChange++;
      continue;
    }

    wouldUpdate++;
    previews.push({ name: product.displayName ?? product.name ?? product.id, id: product.id, updates, reasons, type: v2.productType });

    for (const k of Object.keys(updates)) {
      fieldCounts[k] = (fieldCounts[k] || 0) + 1;
    }
  }

  // Print previews (cap at 30)
  const LIMIT = 30;
  console.log(`\n${'─'.repeat(72)}`);
  console.log(`📋  Preview (showing first ${Math.min(LIMIT, previews.length)} of ${previews.length}):\n`);

  // Group by productType for readability
  const grouped = {};
  for (const p of previews) {
    (grouped[p.type] = grouped[p.type] || []).push(p);
  }

  for (const [type, group] of Object.entries(grouped)) {
    console.log(`\n  ── ${type.toUpperCase()} (${group.length} products) ──`);
    for (const p of group.slice(0, 20)) {
      const label = (p.name || p.id).slice(0, 35).padEnd(37);
      console.log(`  📦 ${label} → ${p.reasons.slice(0, 3).join(', ')}${p.reasons.length > 3 ? ' …' : ''}`);
    }
    if (group.length > 20) console.log(`     … and ${group.length - 20} more`);
  }

  console.log(`\n${'='.repeat(72)}`);
  console.log('\n📊  DRY-RUN SUMMARY:\n');
  console.log(`  Total products     : ${products.length}`);
  console.log(`  Would update       : ${wouldUpdate}`);
  console.log(`  No change          : ${noChange}`);
  console.log(`  Unmatched (no v2)  : ${unmatched}`);

  console.log(`\n  Fields that would be written`);
  console.log(`  ────────────────────────────`);
  for (const [k, n] of Object.entries(fieldCounts).sort((a, b) => b[1] - a[1])) {
    const short = k.replace('typeData.', 'typeData.');
    console.log(`    ${short.padEnd(40)}: ${n}`);
  }

  console.log('\n  migrationVersion would be set to:', MIGRATION_VERSION);
  console.log('\n✅  Dry-run complete. No data was written.\n');

  process.exit(0);
}

runDryRun().catch(err => {
  console.error('❌  Dry-run failed:', err.message);
  process.exit(1);
});

/**
 * phase5_migrateCommonFields_dryrun.mjs
 *
 * Phase 5 — Migrate Common Fields to Product Root (DRY-RUN)
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * Goal:
 *   Preview the migration of universal metadata to the product root level
 *   in Firestore WITHOUT writing anything to the database.
 *
 * Fields migrated (from v2 catalog → Firestore product root):
 *   - goals
 *   - secondaryFactors
 *   - tags
 *   - mechanisms
 *   - semanticKeywords
 *   - synonyms
 *   - safetyNote
 *
 * Rules:
 *   - NEVER overwrite non-empty canonical fields already present in Firestore
 *   - Keep arrays normalized (trim, deduplicate, lowercase-stable)
 *   - Remove duplicates across merged arrays
 *   - Source of truth: v2 JSON catalog (src/data/v2/*.json)
 *   - Log a clear before/after diff for every product that would change
 *
 * Usage:
 *   node scripts/phase5_migrateCommonFields_dryrun.mjs
 *
 * After reviewing the dry-run output, run the live migration with:
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

// ── Fields we will migrate ────────────────────────────────────────────────────
const COMMON_FIELDS = [
  'goals',
  'secondaryFactors',
  'tags',
  'mechanisms',
  'semanticKeywords',
  'synonyms',
  'safetyNote',
];

// ── Helper: extract a common field value from a v2 product ────────────────────
// v2 stores goals/tags/mechanisms in classification.*; the rest are at root.
function extractV2Field(v2product, field) {
  if (field === 'safetyNote') {
    return v2product.safetyNote ?? v2product.safety?.note ?? null;
  }

  // Check classification namespace first (v2 canonical location)
  const fromClassification = v2product.classification?.[field];
  if (fromClassification !== undefined) return fromClassification;

  // Fall back to root-level (supplements may store them flat)
  return v2product[field] ?? null;
}

// ── Helper: build a name-lookup map for v2 catalog ───────────────────────────
// Multi-key: full name, base slug (before parenthetical), and slug field.
function buildV2LookupMap(catalog) {
  const map = new Map();

  for (const p of catalog) {
    const fullName = (p.name ?? '').toLowerCase().trim();
    if (fullName) map.set(fullName, p);

    // Base slug: strip everything from first '(' or '/'
    const base = fullName.replace(/\s*[(/|].*$/, '').trim();
    if (base && base !== fullName && !map.has(base)) map.set(base, p);

    // Slug field
    const slug = (p.slug ?? '').toLowerCase().trim();
    if (slug && !map.has(slug)) map.set(slug, p);

    // Search aliases
    for (const alias of (p.identity?.searchAliases ?? p.searchAliases ?? [])) {
      const aliasKey = alias.toLowerCase().trim();
      if (aliasKey && !map.has(aliasKey)) map.set(aliasKey, p);
    }
  }

  return map;
}

// ── Helper: normalize arrays (trim, unique, filter empty) ─────────────────────
function normalizeArray(arr) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.map((s) => String(s).trim()).filter(Boolean))];
}

// ── Helper: merge arrays without losing either side ──────────────────────────
// Firestore values are preserved; v2 values are added only if missing.
function mergeArrays(firestoreArr, v2Arr) {
  const base = normalizeArray(firestoreArr);
  const additions = normalizeArray(v2Arr).filter(
    (item) => !base.map((b) => b.toLowerCase()).includes(item.toLowerCase())
  );
  return [...base, ...additions];
}

// ── Helper: find v2 entry for a Firestore product ────────────────────────────
function resolveV2Product(firestoreName, firestoreId, v2Map) {
  const nameKey = (firestoreName ?? '').toLowerCase().trim();
  if (nameKey && v2Map.has(nameKey)) return v2Map.get(nameKey);

  const baseKey = nameKey.replace(/\s*[(/|].*$/, '').trim();
  if (baseKey && v2Map.has(baseKey)) return v2Map.get(baseKey);

  // Try doc ID: strip dosage suffix (e.g. "bpc-157-5mg" → "bpc-157")
  const idKey = (firestoreId ?? '').toLowerCase()
    .replace(/-\d+(\.\d+)?(mg|mcg|iu|ml|g|kg|unit|vial|kit|pack|tab|cap|amp).*$/i, '')
    .replace(/-+$/, '')
    .trim();
  if (idKey && v2Map.has(idKey)) return v2Map.get(idKey);

  // Partial prefix match
  for (const [key, product] of v2Map) {
    if (nameKey && (key.startsWith(nameKey) || nameKey.startsWith(key))) {
      return product;
    }
  }

  return null;
}

// ── Main dry-run ──────────────────────────────────────────────────────────────
async function runDryRun() {
  console.log('🔍  Phase 5 — Common Fields Migration DRY-RUN');
  console.log('='.repeat(72));
  console.log('  Mode: READ-ONLY. No writes will be made to Firestore.\n');

  // Build v2 lookup
  const v2Map = buildV2LookupMap(catalogV2);

  // Fetch all Firestore products
  console.log('📡  Fetching products from Firestore...');
  const snap = await db.collection('products').get();
  const firestoreProducts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log(`✅  Found ${firestoreProducts.length} documents in Firestore\n`);
  console.log('='.repeat(72));

  // Counters
  let matched    = 0;
  let unmatched  = 0;
  let willChange = 0;
  let noChange   = 0;

  const unmatchedList  = [];
  const changePreview  = [];
  const noChangeList   = [];

  for (const product of firestoreProducts) {
    const v2 = resolveV2Product(product.name, product.id, v2Map);

    if (!v2) {
      unmatched++;
      unmatchedList.push({ id: product.id, name: product.name ?? '(no name)' });
      continue;
    }

    matched++;

    // Compute what we would write
    const diffs = {};

    for (const field of COMMON_FIELDS) {
      const v2Value       = extractV2Field(v2, field);
      const currentValue  = product[field];

      if (field === 'safetyNote') {
        // String field — only write if Firestore is missing it
        const v2str  = (typeof v2Value === 'string' ? v2Value : null);
        const curStr = (typeof currentValue === 'string' && currentValue.trim()) ? currentValue.trim() : null;

        if (!curStr && v2str) {
          diffs[field] = { before: curStr, after: v2str };
        }
      } else {
        // Array field — merge: never overwrite existing values
        const merged = mergeArrays(currentValue, v2Value);

        const beforeNorm = normalizeArray(currentValue);
        const afterNorm  = normalizeArray(merged);

        // Only record if there's actually something new to add
        const newItems = afterNorm.filter(
          (item) => !beforeNorm.map((b) => b.toLowerCase()).includes(item.toLowerCase())
        );

        if (newItems.length > 0) {
          diffs[field] = {
            before:   beforeNorm,
            after:    afterNorm,
            added:    newItems,
          };
        }
      }
    }

    const productLabel = product.displayName ?? product.name ?? product.id;

    if (Object.keys(diffs).length === 0) {
      noChange++;
      noChangeList.push(productLabel);
      continue;
    }

    willChange++;
    changePreview.push({ id: product.id, name: productLabel, v2Name: v2.name, diffs });
  }

  // ── PRINT REPORT ──────────────────────────────────────────────────────────

  console.log('\n📋  PRODUCTS THAT WOULD CHANGE:\n');
  if (changePreview.length === 0) {
    console.log('  (none — all matched products are already up to date)');
  } else {
    for (const { id, name, v2Name, diffs } of changePreview) {
      console.log(`\n  ┌─ ${name}  [id: ${id}]`);
      if (v2Name !== name) {
        console.log(`  │  (matched v2: "${v2Name}")`);
      }
      for (const [field, diff] of Object.entries(diffs)) {
        if (field === 'safetyNote') {
          console.log(`  │  ${field}:`);
          console.log(`  │    BEFORE: ${diff.before ?? '(empty)'}`);
          console.log(`  │    AFTER : ${diff.after}`);
        } else {
          console.log(`  │  ${field}:`);
          console.log(`  │    BEFORE: [${diff.before.join(', ') || '(empty)'}]`);
          console.log(`  │    AFTER : [${diff.after.join(', ')}]`);
          console.log(`  │    +NEW  : [${diff.added.join(', ')}]`);
        }
      }
      console.log('  └─');
    }
  }

  console.log('\n' + '='.repeat(72));
  console.log('\n⚠️   UNMATCHED PRODUCTS (no v2 entry found — will be SKIPPED):\n');
  if (unmatchedList.length === 0) {
    console.log('  (none — all Firestore products matched a v2 entry)');
  } else {
    for (const { id, name } of unmatchedList) {
      console.log(`  • ${name.padEnd(40)} [id: ${id}]`);
    }
    console.log(
      `\n  ℹ️  To fix: add entries to src/data/v2/catalog.v2.json or add searchAliases.`
    );
  }

  console.log('\n' + '='.repeat(72));
  console.log('\n📊  DRY-RUN SUMMARY:\n');
  console.log(`  Total Firestore products : ${firestoreProducts.length}`);
  console.log(`  Matched to v2 catalog   : ${matched}`);
  console.log(`  Unmatched (skipped)     : ${unmatched}`);
  console.log(`  Would receive changes   : ${willChange}`);
  console.log(`  Already up to date      : ${noChange}`);
  console.log(`\n  Fields checked: ${COMMON_FIELDS.join(', ')}`);

  console.log('\n' + '='.repeat(72));
  console.log('\n✅  DRY-RUN COMPLETE — No changes were made to Firestore.');
  console.log(
    `\n  When ready to apply, run:\n    node scripts/phase5_migrateCommonFields_live.mjs\n`
  );

  process.exit(0);
}

runDryRun().catch((err) => {
  console.error('❌  Dry-run failed:', err.message);
  process.exit(1);
});

/**
 * phase6_migrateAIContent_dryrun.mjs
 *
 * Phase 6 — Migrate AI Content into aiContent sub-object (DRY-RUN)
 * ────────────────────────────────────────────────────────────────────────────
 *
 * What it checks:
 *   For each Firestore product:
 *     1. If faqModalItems / faqModalEnabled / scientificModalEnabled exist at
 *        product root → they belong inside aiContent{}
 *     2. If the v2 catalog has summary / beginnerExplanation / scientificSummary
 *        on the matching product → those can be added to aiContent{}
 *     3. The v2 catalog's faqModalItems take precedence over legacy root items
 *        (v2 content is canonical; legacy root content is the source of truth
 *        only when v2 has nothing)
 *
 * Rules (same as all phases):
 *   - NEVER invent content
 *   - NEVER overwrite non-empty aiContent fields
 *   - Print a before/after preview for every product that would change
 *
 * Usage:
 *   node scripts/phase6_migrateAIContent_dryrun.mjs
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

// ── AI Content fields inside aiContent{} sub-object ──────────────────────────
// Fields moved from legacy root → aiContent
const LEGACY_ROOT_FIELDS = ['faqModalItems', 'faqModalEnabled', 'scientificModalEnabled'];
// Fields that may be sourced from v2 catalog aiContent or root
const V2_AI_FIELDS       = ['summary', 'beginnerExplanation', 'scientificSummary'];

// ── Build v2 lookup map (same logic as phase5) ────────────────────────────────
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

// ── Field extraction helpers ──────────────────────────────────────────────────

/**
 * Extract a field from inside v2.aiContent or v2 root.
 */
function extractFromV2(v2product, field) {
  if (!v2product) return undefined;
  // Prefer aiContent sub-object
  if (v2product.aiContent?.[field] !== undefined) return v2product.aiContent[field];
  // Fall back to root for legacy scalar fields
  if (v2product[field] !== undefined) return v2product[field];
  return undefined;
}

function isEmpty(val) {
  if (val === undefined || val === null || val === '') return true;
  if (Array.isArray(val) && val.length === 0) return true;
  return false;
}

// ── Build the aiContent update payload for one product ────────────────────────
function buildAiContentUpdate(firestoreDoc, v2product) {
  const current = firestoreDoc.aiContent ?? {};   // existing aiContent (or {})
  const update  = {};                             // fields to add/set
  const reasons = [];                             // human-readable change log

  // 1. Move legacy root fields into aiContent
  for (const field of LEGACY_ROOT_FIELDS) {
    const legacyValue = firestoreDoc[field];
    const existingInAi = current[field];

    if (!isEmpty(existingInAi)) {
      // Already migrated — skip
      continue;
    }

    // Check if v2 has a canonical value — prefer it
    const v2Value = extractFromV2(v2product, field);

    if (!isEmpty(v2Value)) {
      update[field] = v2Value;
      reasons.push(`aiContent.${field} ← v2 canonical`);
    } else if (!isEmpty(legacyValue)) {
      update[field] = legacyValue;
      reasons.push(`aiContent.${field} ← legacy root`);
    }
  }

  // 2. Add optional rich AI fields if v2 has them (NEVER invent)
  for (const field of V2_AI_FIELDS) {
    const existingInAi = current[field];
    if (!isEmpty(existingInAi)) continue; // already there

    const v2Value = extractFromV2(v2product, field);
    if (!isEmpty(v2Value)) {
      update[field] = v2Value;
      reasons.push(`aiContent.${field} ← v2`);
    }
  }

  return { update, reasons };
}

// ── Main dry-run ──────────────────────────────────────────────────────────────
async function runDryRun() {
  console.log('🔍  Phase 6 — AI Content Migration DRY-RUN');
  console.log('='.repeat(72));
  console.log('  No writes to Firestore.\n');

  const v2Map = buildV2LookupMap(catalogV2);

  console.log('📡  Fetching products from Firestore...');
  const snap = await db.collection('products').get();
  const firestoreProducts = snap.docs.map(d => ({ _ref: d.ref, id: d.id, ...d.data() }));
  console.log(`✅  Found ${firestoreProducts.length} documents\n`);

  let wouldUpdate = 0;
  let alreadyCurrent = 0;
  let unmatched = 0;
  const previews = [];

  for (const product of firestoreProducts) {
    const v2 = resolveV2Product(product.name, product.id, v2Map);

    if (!v2) {
      unmatched++;
      // Still check if we have legacy root data to migrate even without v2 match
    }

    const { update, reasons } = buildAiContentUpdate(product, v2 ?? null);

    if (Object.keys(update).length === 0) {
      alreadyCurrent++;
      continue;
    }

    wouldUpdate++;
    previews.push({ name: product.displayName ?? product.name ?? product.id, id: product.id, update, reasons, v2Matched: !!v2 });
  }

  // Print previews (show first 30 to avoid flooding)
  const SHOW_LIMIT = 30;
  console.log(`\n${'─'.repeat(72)}`);
  console.log(`📋  Preview (showing first ${Math.min(SHOW_LIMIT, previews.length)} of ${previews.length}):\n`);

  for (const p of previews.slice(0, SHOW_LIMIT)) {
    console.log(`  📦 ${p.name}  [id: ${p.id}]  ${p.v2Matched ? '✅ v2' : '⚠️  no v2'}`);
    for (const r of p.reasons) {
      console.log(`     + ${r}`);
    }
    const currentAI = p.update;
    if (currentAI.faqModalItems) {
      console.log(`     • faqModalItems: [${currentAI.faqModalItems.length} items]`);
    }
  }

  // Summary
  console.log(`\n${'='.repeat(72)}`);
  console.log('\n📊  DRY-RUN SUMMARY:\n');
  console.log(`  Total Firestore products    : ${firestoreProducts.length}`);
  console.log(`  Would receive aiContent     : ${wouldUpdate}`);
  console.log(`  Already current / no change : ${alreadyCurrent}`);
  console.log(`  No v2 match (some may still update from legacy): ${unmatched}`);
  console.log(`\n  Fields that would appear in aiContent{}`);
  console.log(`  ─────────────────────────────────────────`);

  const fieldCount = {};
  for (const p of previews) {
    for (const k of Object.keys(p.update)) {
      fieldCount[k] = (fieldCount[k] || 0) + 1;
    }
  }
  for (const [k, n] of Object.entries(fieldCount).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${k.padEnd(26)}: ${n} products`);
  }

  console.log('\n  migrationVersion would be set to:', MIGRATION_VERSION);
  console.log('\n✅  Dry-run complete. No data was written.\n');

  process.exit(0);
}

runDryRun().catch(err => {
  console.error('❌  Dry-run failed:', err.message);
  process.exit(1);
});

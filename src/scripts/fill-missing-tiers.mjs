/**
 * fill-missing-tiers.mjs — Phase 9: Auto-fill missing pricing tiers
 * ─────────────────────────────────────────────────────────────────────────────
 * Run:
 *   node src/scripts/fill-missing-tiers.mjs           ← dry run (preview)
 *   node src/scripts/fill-missing-tiers.mjs --write   ← apply to Firestore
 *
 * Strategy:
 *   For each product variant that has a retail price but is missing
 *   clinic / wholesale / master tiers, compute the missing tiers using
 *   the canonical multipliers derived from existing peptide data:
 *
 *     clinic    = retail × 0.8667  (round to 2dp)
 *     wholesale = retail × 0.8000  (round to 2dp)
 *     master    = retail × 0.6667  (round to 2dp)
 *
 * Safety rules:
 *   - NEVER overwrite an existing tier value
 *   - Only fills tiers when retail price exists as the source
 *   - Round to sensible values (2 decimal places)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';

// ── CLI args ────────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const DRY_RUN = !args.includes('--write');
const PRODUCT_FILTER = args.find(a => a.startsWith('--product='))?.split('=')[1] ?? null;

// ── Tier multipliers (confirmed from existing canonical data) ───────────────────
const MULTIPLIERS = {
  clinic:    0.8667,
  wholesale: 0.8000,
  master:    0.6667,
};

// ── Init Firebase Admin ─────────────────────────────────────────────────────────
const SA_PATHS = [
  './serviceAccountKey.json',
  './med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json',
  './serviceAccount.json',
];
let initialized = false;
for (const p of SA_PATHS) {
  if (existsSync(p)) {
    initializeApp({ credential: cert(JSON.parse(readFileSync(p, 'utf-8'))) });
    initialized = true;
    console.log(`✅ Firebase initialized: ${p}`);
    break;
  }
}
if (!initialized) { console.error('❌ No service account found.'); process.exit(1); }

const db = getFirestore();

// ── Helpers ─────────────────────────────────────────────────────────────────────

function round2(n) { return Math.round(n * 100) / 100; }

/**
 * Extract amount from a tier entry.
 * Supports { perUnit }, { unit }, { base } schemas.
 */
function extractAmount(entry) {
  if (!entry) return null;
  return entry.perUnit ?? entry.unit ?? entry.base ?? null;
}

/**
 * Detect which field name the tier uses for its amount.
 * Returns the first found field name, or defaults to 'perUnit'.
 */
function detectAmountField(entry) {
  if (!entry) return 'perUnit';
  if (entry.perUnit !== undefined) return 'perUnit';
  if (entry.unit    !== undefined) return 'unit';
  if (entry.base    !== undefined) return 'base';
  return 'perUnit';
}

/**
 * Given a variant's pricing object, compute the Firestore update paths
 * needed to fill missing tiers. Returns {} if nothing to fill.
 *
 * @param {object} pricing  - variant.pricing
 * @param {string} prefix   - Firestore dot-path prefix, e.g. "variants.0.pricing"
 */
function computeTierFills(pricing, prefix) {
  const updates = {};

  // Get retail entry
  const retailEntry = pricing?.retail ?? pricing?.retailPrice;
  const retailAmt   = extractAmount(retailEntry);
  if (retailAmt == null || typeof retailAmt !== 'number' || retailAmt <= 0) return updates;

  // Detect what currency & billingUnit the retail tier uses
  const currency    = retailEntry?.currency ?? 'USD';
  const billingUnit = retailEntry?.billingUnit ?? retailEntry?.unit_label ?? 'vial';
  const amtField    = detectAmountField(retailEntry);

  for (const [tier, multiplier] of Object.entries(MULTIPLIERS)) {
    const existingEntry = pricing?.[tier] ?? pricing?.[`${tier}Price`];
    const existingAmt   = extractAmount(existingEntry);

    if (existingAmt != null) continue; // already has a value — skip

    const computed = round2(retailAmt * multiplier);
    const path     = `${prefix}.${tier}`;

    updates[`${path}.${amtField}`]   = computed;
    updates[`${path}.currency`]      = currency;
    updates[`${path}.billingUnit`]   = billingUnit;
  }

  return updates;
}

// ── Main ─────────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\nMode: ${DRY_RUN ? '🔍 DRY RUN — preview only (use --write to apply)' : '✍️  WRITE MODE'}`);
  if (PRODUCT_FILTER) console.log(`Filter: ${PRODUCT_FILTER}`);
  console.log('');

  let query = db.collection('products');
  // No server-side filter — we evaluate per-document
  const snapshot = await query.get();
  console.log(`📦 Products found: ${snapshot.size}\n`);

  let filled = 0, clean = 0, noRetail = 0, errors = 0;

  let batch      = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 400;

  for (const doc of snapshot.docs) {
    if (PRODUCT_FILTER && doc.id !== PRODUCT_FILTER) continue;

    const data = doc.data();
    const name = data.name ?? data.productName ?? doc.id;

    try {
      const updates = {};

      const variants = Array.isArray(data.variants) && data.variants.length > 0
        ? data.variants
        : (data.pricing ? [{ pricing: data.pricing, _rootLevel: true }] : []);

      if (variants.length === 0) { noRetail++; continue; }

      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const pricing = v.pricing;
        if (!pricing) continue;

        // Build the Firestore prefix for this variant's pricing
        const prefix = v._rootLevel
          ? 'pricing'
          : `variants.${i}.pricing`;

        const tierUpdates = computeTierFills(pricing, prefix);
        Object.assign(updates, tierUpdates);
      }

      if (Object.keys(updates).length === 0) {
        clean++;
        continue;
      }

      // Show preview
      console.log(`  ✏️  [${doc.id}] ${name}`);
      for (const [path, val] of Object.entries(updates)) {
        console.log(`       ${path} = ${val}`);
      }

      if (!DRY_RUN) {
        batch.update(doc.ref, updates);
        batchCount++;

        if (batchCount >= BATCH_SIZE) {
          await batch.commit();
          batch = db.batch();
          batchCount = 0;
          console.log('\n  💾 Batch committed\n');
        }
      }

      filled++;
    } catch (err) {
      console.error(`  ❌ [${doc.id}] Error: ${err.message}`);
      errors++;
    }
  }

  // Commit remaining
  if (!DRY_RUN && batchCount > 0) {
    await batch.commit();
    console.log('\n  💾 Final batch committed');
  }

  console.log('\n════════════════════════════════════════════════');
  console.log('  FILL MISSING TIERS — SUMMARY');
  console.log('────────────────────────────────────────────────');
  console.log(`  Scanned     : ${snapshot.size}`);
  console.log(`  Filled      : ${filled}`);
  console.log(`  Already full: ${clean}`);
  console.log(`  No retail   : ${noRetail}`);
  console.log(`  Errors      : ${errors}`);
  if (DRY_RUN) {
    console.log('\n  ⚠️  DRY RUN — nothing written');
    console.log('  Apply with:');
    console.log('  node src/scripts/fill-missing-tiers.mjs --write');
  } else {
    console.log(`\n  ✅ ${filled} products updated in Firestore`);
  }
  console.log('════════════════════════════════════════════════\n');
}

run().catch(err => {
  console.error('❌ Script failed:', err.message);
  process.exit(2);
});

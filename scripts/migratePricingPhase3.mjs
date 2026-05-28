/**
 * migratePricingPhase3.mjs
 *
 * Phase 3 — Promote canonical pricing to root product documents.
 *
 * Two-pass migration (both idempotent):
 *
 *  Pass A — VARIANT_ONLY:
 *    Products whose variants sub-collection (or inline variants[]) already
 *    contain canonical pricing (pricing.retail.perUnit etc.) but whose root
 *    doc is missing a canonical pricing blob.
 *    Action: read the first "default" (or first available) variant, copy its
 *    pricing object to the root doc at doc.pricing, and set
 *    migrationVersion = 3.
 *
 *  Pass B — LEGACY_FLAT:
 *    Products still storing prices in flat fields
 *    (guestVialPrice / priceUSD / perVialPriceUSD / retailPrice / wholesalePrice).
 *    Action: construct a canonical pricing.retail blob from the flat fields
 *    (and pricing.wholesale / pricing.clinic if present), write it to
 *    doc.pricing, and set migrationVersion = 3.
 *
 * Safety:
 *  - Products already at migrationVersion >= 3 with canonical root pricing
 *    are SKIPPED (idempotent).
 *  - Flat / legacy fields are PRESERVED (not deleted) — Phase 8 will remove them.
 *  - Operates in DRY-RUN mode by default; pass --live to write to Firestore.
 *
 * Usage:
 *   node scripts/migratePricingPhase3.mjs            # dry-run
 *   node scripts/migratePricingPhase3.mjs --live     # real writes
 */

import { initializeFirebaseAdmin, db } from './lib/firebase-admin.mjs';
import { FieldValue } from 'firebase-admin/firestore';

initializeFirebaseAdmin();

// ── CLI ────────────────────────────────────────────────────────────────────────

const IS_LIVE = process.argv.includes('--live');

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Canonical tier keys */
const CANONICAL_TIERS = ['retail', 'wholesale', 'clinic', 'master'];

/**
 * Returns true if the pricing blob already has at least one canonical tier
 * with a perUnit or kit value.
 */
function hasCanonicalPricing(pricing) {
  if (!pricing || typeof pricing !== 'object') return false;
  for (const tier of CANONICAL_TIERS) {
    const t = pricing[tier];
    if (t && (t.perUnit != null || t.kit != null)) return true;
  }
  return false;
}

/**
 * Returns true if the doc data has legacy flat price fields.
 */
function hasLegacyFlat(data) {
  return !!(
    data.guestVialPrice     != null ||
    data.priceUSD           != null ||
    data.perVialPriceUSD    != null ||
    data.retailPrice        != null ||
    data.wholesalePrice     != null ||
    data.pricing?.retailPrice != null ||
    data.pricing?.base        != null
  );
}

/**
 * Normalise a single tier blob that may use legacy `base` instead of `perUnit`.
 */
function normaliseTier(tier) {
  if (!tier || typeof tier !== 'object') return null;
  const out = { ...tier };
  if (out.perUnit == null && out.base != null) {
    out.perUnit = out.base;
  }
  return out;
}

/**
 * Build a canonical pricing object from legacy flat fields found in `data`.
 *
 * Mapping:
 *   guestVialPrice | priceUSD | perVialPriceUSD | retailPrice → retail.perUnit
 *   pricing.base                                              → retail.perUnit (fallback)
 *   wholesalePrice | pricing.wholesalePrice                  → wholesale.perUnit
 *   pricing.clinicPrice                                      → clinic.perUnit
 */
function buildCanonicalFromLegacy(data) {
  const p = data.pricing ?? {};

  // ── retail ──
  const retailPerUnit =
    data.guestVialPrice     ??
    data.priceUSD           ??
    data.perVialPriceUSD    ??
    data.retailPrice        ??
    p.retailPrice           ??
    (p.base != null ? p.base : undefined)   ??
    null;

  const kitPrice =
    data.kitPriceUSD ??
    p.kit            ??
    null;

  // ── wholesale ──
  const wholesalePerUnit =
    data.wholesalePrice     ??
    p.wholesalePrice        ??
    p.wholesale?.perUnit    ??
    null;

  // ── clinic ──
  const clinicPerUnit =
    data.clinicPrice       ??
    p.clinicPrice          ??
    p.clinic?.perUnit      ??
    null;

  // Assemble — only include tiers with actual data
  const canonical = {};

  if (retailPerUnit != null || kitPrice != null) {
    canonical.retail = {};
    if (retailPerUnit != null) canonical.retail.perUnit = retailPerUnit;
    if (kitPrice      != null) canonical.retail.kit     = kitPrice;
    canonical.retail.currency = data.currency ?? p.currency ?? 'USD';
  }

  if (wholesalePerUnit != null) {
    canonical.wholesale = {
      perUnit: wholesalePerUnit,
      currency: data.currency ?? p.currency ?? 'USD',
    };
  }

  if (clinicPerUnit != null) {
    canonical.clinic = {
      perUnit: clinicPerUnit,
      currency: data.currency ?? p.currency ?? 'USD',
    };
  }

  return Object.keys(canonical).length > 0 ? canonical : null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Phase 3 — Pricing Promotion Migration  [${IS_LIVE ? '⚡ LIVE' : '🔍 DRY-RUN'}]`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (!IS_LIVE) {
    console.log('  ℹ️  Pass --live to perform real Firestore writes.\n');
  }

  const snap = await db.collection('products').get();

  const counters = {
    skipped:       0,
    variantPromo:  0,
    legacyPromo:   0,
    noData:        0,
    errors:        0,
  };

  const details = {
    variantPromo: [],
    legacyPromo:  [],
    skipped:      [],
    noData:       [],
    errors:       [],
  };

  // ── Batch writer ────────────────────────────────────────────────────────────
  // Firestore batch limit = 500 ops. We'll auto-flush.
  let batch   = db.batch();
  let batchOps = 0;
  const MAX_BATCH = 450;

  async function flushBatch() {
    if (batchOps === 0) return;
    if (IS_LIVE) await batch.commit();
    batch    = db.batch();
    batchOps = 0;
  }

  // ── Process each product ────────────────────────────────────────────────────

  for (const doc of snap.docs) {
    const data = doc.data();
    const ref  = doc.ref;

    try {
      // ── Skip: already canonical at root ──
      if (hasCanonicalPricing(data.pricing)) {
        counters.skipped++;
        details.skipped.push(doc.id);
        continue;
      }

      // ── Pass A: Variant-only promotion ──────────────────────────────────────
      let promotedPricing = null;

      // Check variants sub-collection first
      const varSnap = await db
        .collection('products')
        .doc(doc.id)
        .collection('variants')
        .where('isDefault', '==', true)
        .limit(1)
        .get();

      if (!varSnap.empty) {
        const vData = varSnap.docs[0].data();
        if (hasCanonicalPricing(vData.pricing)) {
          promotedPricing = vData.pricing;
        }
      }

      // Fallback: check first variant in inline array
      if (!promotedPricing && Array.isArray(data.variants)) {
        for (const v of data.variants) {
          if (hasCanonicalPricing(v.pricing)) {
            promotedPricing = v.pricing;
            break;
          }
        }
      }

      // Fallback: check ANY variant (not just isDefault=true)
      if (!promotedPricing && varSnap.empty) {
        const allVariantsSnap = await db
          .collection('products')
          .doc(doc.id)
          .collection('variants')
          .limit(5)
          .get();

        for (const vDoc of allVariantsSnap.docs) {
          const vData = vDoc.data();
          if (hasCanonicalPricing(vData.pricing)) {
            promotedPricing = vData.pricing;
            break;
          }
        }
      }

      if (promotedPricing) {
        // Normalise tier entries (base → perUnit)
        const normalisedPricing = {};
        for (const tier of CANONICAL_TIERS) {
          const t = normaliseTier(promotedPricing[tier]);
          if (t) normalisedPricing[tier] = t;
        }

        const update = {
          pricing:          normalisedPricing,
          migrationVersion: 3,
          migratedAt:       IS_LIVE ? FieldValue.serverTimestamp() : new Date().toISOString(),
          migratedBy:       'migratePricingPhase3/variantPromo',
        };

        if (IS_LIVE) {
          batch.set(ref, update, { merge: true });
          batchOps++;
        }

        counters.variantPromo++;
        details.variantPromo.push({ id: doc.id, tiers: Object.keys(normalisedPricing) });

        if (batchOps >= MAX_BATCH) await flushBatch();
        continue;
      }

      // ── Pass B: Legacy flat promotion ───────────────────────────────────────
      if (hasLegacyFlat(data)) {
        const canonicalPricing = buildCanonicalFromLegacy(data);

        if (canonicalPricing) {
          const update = {
            pricing:          canonicalPricing,
            migrationVersion: 3,
            migratedAt:       IS_LIVE ? FieldValue.serverTimestamp() : new Date().toISOString(),
            migratedBy:       'migratePricingPhase3/legacyFlat',
          };

          if (IS_LIVE) {
            batch.set(ref, update, { merge: true });
            batchOps++;
          }

          counters.legacyPromo++;
          details.legacyPromo.push({ id: doc.id, tiers: Object.keys(canonicalPricing) });

          if (batchOps >= MAX_BATCH) await flushBatch();
          continue;
        }
      }

      // ── No data to promote ──────────────────────────────────────────────────
      counters.noData++;
      details.noData.push(doc.id);

    } catch (err) {
      counters.errors++;
      details.errors.push({ id: doc.id, error: err.message });
      console.error(`  ❌ Error processing ${doc.id}: ${err.message}`);
    }
  }

  // Final flush
  await flushBatch();

  // ── Report ──────────────────────────────────────────────────────────────────

  console.log('\n─── Results ────────────────────────────────────────────────\n');

  if (details.variantPromo.length) {
    console.log(`⬆️  VARIANT → ROOT  (${details.variantPromo.length}):`);
    for (const r of details.variantPromo) {
      console.log(`   ${r.id}  →  tiers: [${r.tiers.join(', ')}]`);
    }
    console.log('');
  }

  if (details.legacyPromo.length) {
    console.log(`⚠️  LEGACY → ROOT   (${details.legacyPromo.length}):`);
    for (const r of details.legacyPromo) {
      console.log(`   ${r.id}  →  tiers: [${r.tiers.join(', ')}]`);
    }
    console.log('');
  }

  if (details.noData.length) {
    console.log(`❌ NO DATA          (${details.noData.length}):`);
    for (const id of details.noData) console.log(`   ${id}`);
    console.log('');
  }

  if (details.errors.length) {
    console.log(`🔥 ERRORS           (${details.errors.length}):`);
    for (const r of details.errors) console.log(`   ${r.id}: ${r.error}`);
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Total products       : ${snap.size}`);
  console.log(`  ✅ Already canonical : ${counters.skipped}`);
  console.log(`  ⬆️  Variant-promoted : ${counters.variantPromo}`);
  console.log(`  ⚠️  Legacy-promoted  : ${counters.legacyPromo}`);
  console.log(`  ❌ No data           : ${counters.noData}`);
  console.log(`  🔥 Errors            : ${counters.errors}`);
  console.log(`  Mode                 : ${IS_LIVE ? '⚡ LIVE — writes committed' : '🔍 DRY-RUN — no writes'}`);
  console.log('');

  if (!IS_LIVE && (counters.variantPromo + counters.legacyPromo > 0)) {
    console.log('  ▶ To apply changes, run:');
    console.log('    node scripts/migratePricingPhase3.mjs --live\n');
  }

  if (IS_LIVE && counters.errors === 0) {
    console.log('  🎉 Migration complete — run the audit script to verify.');
    console.log('    node scripts/auditPricingMigrationStatus.mjs\n');
  }
}

main().catch(e => { console.error(e); process.exit(1); });

/**
 * auditPricingMigrationStatus.mjs
 *
 * Phase 3 — DRY-RUN audit of every product doc in Firestore.
 *
 * Classifies each product as one of:
 *   ✅ CANONICAL_ROOT   — root doc already has pricing.retail.perUnit
 *   ⬆️  VARIANT_ONLY    — canonical pricing lives in variants/ sub-collection only (needs promotion)
 *   ⚠️  LEGACY_FLAT     — pricing still in flat fields (guestVialPrice / priceUSD / etc.)
 *   ❌ NO_PRICING       — no pricing data found anywhere
 *
 * NO writes are performed.
 *
 * Usage:
 *   node scripts/auditPricingMigrationStatus.mjs
 */

import { initializeFirebaseAdmin, db } from './lib/firebase-admin.mjs';

// Ensure admin is ready (side-effect import)
initializeFirebaseAdmin();

// ── Helpers ────────────────────────────────────────────────────────────────────

function hasCanonicalPricing(pricing) {
  if (!pricing || typeof pricing !== 'object') return false;
  for (const tier of ['retail', 'wholesale', 'clinic', 'master']) {
    const t = pricing[tier];
    if (t && (t.perUnit != null || t.kit != null)) return true;
  }
  return false;
}

function hasLegacyPricing(data) {
  return !!(
    data.guestVialPrice     != null ||
    data.priceUSD           != null ||
    data.perVialPriceUSD    != null ||
    data.retailPrice        != null ||
    data.wholesalePrice     != null ||
    data.pricing?.retailPrice != null ||
    data.pricing?.base      != null
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const snap = await db.collection('products').get();
  const rows = [];

  let canonicalRoot = 0;
  let variantOnly   = 0;
  let legacyFlat    = 0;
  let noPricing     = 0;

  for (const doc of snap.docs) {
    const data = doc.data();

    // 1. Check root-doc pricing blob
    const rootIsCanonical = hasCanonicalPricing(data.pricing);

    // 2. Check variants sub-collection (first 'default' variant)
    let variantIsCanonical = false;
    let variantPricingSample = null;
    const varSnap = await db
      .collection('products')
      .doc(doc.id)
      .collection('variants')
      .where('isDefault', '==', true)
      .limit(1)
      .get();

    if (!varSnap.empty) {
      const vData = varSnap.docs[0].data();
      variantIsCanonical  = hasCanonicalPricing(vData.pricing);
      variantPricingSample = vData.pricing ?? null;
    }

    // Also check inline variants array
    if (!variantIsCanonical && Array.isArray(data.variants)) {
      for (const v of data.variants) {
        if (hasCanonicalPricing(v.pricing)) {
          variantIsCanonical  = true;
          variantPricingSample = v.pricing;
          break;
        }
      }
    }

    // Classify
    let status;
    if (rootIsCanonical) {
      status = 'CANONICAL_ROOT';
      canonicalRoot++;
    } else if (variantIsCanonical) {
      status = 'VARIANT_ONLY';
      variantOnly++;
    } else if (hasLegacyPricing(data)) {
      status = 'LEGACY_FLAT';
      legacyFlat++;
    } else {
      status = 'NO_PRICING';
      noPricing++;
    }

    rows.push({
      id:      doc.id,
      name:    data.name ?? data.title ?? doc.id,
      status,
      rootPricingKeys:     data.pricing ? Object.keys(data.pricing) : [],
      variantPricingTiers: variantPricingSample ? Object.keys(variantPricingSample) : [],
      migrationVersion:    data.migrationVersion ?? null,
    });
  }

  // ── Report ──────────────────────────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Phase 3 — Pricing Migration Status Audit');
  console.log('═══════════════════════════════════════════════════════════\n');

  const groups = {
    CANONICAL_ROOT: '✅ CANONICAL_ROOT (already migrated)',
    VARIANT_ONLY:   '⬆️  VARIANT_ONLY   (canonical in sub-col, needs promotion)',
    LEGACY_FLAT:    '⚠️  LEGACY_FLAT    (flat fields, needs migration)',
    NO_PRICING:     '❌ NO_PRICING      (no pricing data found)',
  };

  for (const [key, label] of Object.entries(groups)) {
    const filtered = rows.filter(r => r.status === key);
    if (!filtered.length) continue;
    console.log(`\n${label}  (${filtered.length})\n${'─'.repeat(60)}`);
    for (const r of filtered) {
      const tierList = r.variantPricingTiers.length
        ? `variant-tiers: [${r.variantPricingTiers.join(', ')}]`
        : `root-keys: [${r.rootPricingKeys.join(', ')}]`;
      const mv = r.migrationVersion != null ? `  v${r.migrationVersion}` : '';
      console.log(`  ${r.id}${mv}`);
      console.log(`    ${tierList}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Total products : ${rows.length}`);
  console.log(`  ✅ Canonical root  : ${canonicalRoot}`);
  console.log(`  ⬆️  Variant-only   : ${variantOnly}  ← needs Phase 3 promotion`);
  console.log(`  ⚠️  Legacy flat    : ${legacyFlat}  ← needs Phase 3 migration`);
  console.log(`  ❌ No pricing     : ${noPricing}`);
  console.log('');

  if (variantOnly + legacyFlat > 0) {
    console.log('  ▶ Run  node scripts/migratePricingPhase3.mjs  to promote.');
  } else {
    console.log('  🎉 All products already have canonical root pricing!');
  }
  console.log('');
}

main().catch(e => { console.error(e); process.exit(1); });

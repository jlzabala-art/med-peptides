/**
 * phase3_derivedTierPrices.mjs
 *
 * Pricing rule (applied to master prices):
 *   retail    = master × 1.50  (+50% margin)
 *   wholesale = master × 1.20  (+20% margin)
 *   clinic    = master × 1.30  (+30% margin)
 *
 * Applied to both perUnit and kit values.
 * Rounds to 2 decimal places.
 *
 * Run: node scripts/phase3_derivedTierPrices.mjs
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const sa      = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}

const db = admin.firestore();

// ── Margin multipliers ──────────────────────────────────────────────────────
const MARGINS = {
  retail:    1.50,
  wholesale: 1.20,
  clinic:    1.30,
};

function applyMargin(masterValue, multiplier) {
  if (masterValue == null) return null;
  return Math.round(masterValue * multiplier * 100) / 100;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function run() {
  const productsSnap = await db.collection('products').get();
  console.log(`Processing ${productsSnap.size} products…`);

  let updatedVariants = 0;
  let skippedVariants = 0;
  const batch = db.batch();
  let batchCount = 0;

  for (const productDoc of productsSnap.docs) {
    const variantsSnap = await db
      .collection('products')
      .doc(productDoc.id)
      .collection('variants')
      .get();

    for (const variantDoc of variantsSnap.docs) {
      const data    = variantDoc.data();
      const master  = data.pricing?.master;

      if (!master || (master.perUnit == null && master.kit == null)) {
        console.warn(`  ⚠ SKIP ${productDoc.id} / ${variantDoc.id} — no master pricing`);
        skippedVariants++;
        continue;
      }

      const newPricing = {
        master: { ...master }, // preserve as-is
      };

      for (const [tier, multiplier] of Object.entries(MARGINS)) {
        const existing = data.pricing?.[tier] ?? {};
        newPricing[tier] = {
          ...existing,                               // preserve any byCountry overrides
          perUnit:  applyMargin(master.perUnit, multiplier),
          kit:      applyMargin(master.kit,     multiplier),
          currency: existing.currency ?? master.currency ?? 'USD',
        };
      }

      const ref = db
        .collection('products')
        .doc(productDoc.id)
        .collection('variants')
        .doc(variantDoc.id);

      batch.update(ref, { pricing: newPricing });
      batchCount++;
      updatedVariants++;

      console.log(
        `  ✓ ${productDoc.id}/${variantDoc.id}` +
        ` | master perUnit:${master.perUnit} kit:${master.kit}` +
        ` | retail:${newPricing.retail.perUnit}/${newPricing.retail.kit}` +
        ` | wholesale:${newPricing.wholesale.perUnit}/${newPricing.wholesale.kit}` +
        ` | clinic:${newPricing.clinic.perUnit}/${newPricing.clinic.kit}`
      );

      // Firestore batch limit is 500 writes
      if (batchCount >= 450) {
        await batch.commit();
        console.log('  [batch committed — 450 writes]');
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log('  [final batch committed]');
  }

  console.log('\n── Summary ───────────────────────────────────');
  console.log(`  Updated : ${updatedVariants}`);
  console.log(`  Skipped : ${skippedVariants}`);
  console.log('Done ✓');
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

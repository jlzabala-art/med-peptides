#!/usr/bin/env node
/**
 * goals_phase3_variants.mjs
 *
 * Phase 3 of Goals Migration:
 *   Propagates goalIds[] from each product to all its variants.
 *   Variants inherit the parent product's canonical goalIds[].
 *
 * Strategy:
 *   - For each product with goalIds[], read all its variants
 *   - Write the same goalIds[] to each variant that has none
 *   - Skip variants that already have goalIds[]
 *
 * Usage:
 *   node scripts/goals_phase3_variants.mjs --dry-run   (preview only)
 *   node scripts/goals_phase3_variants.mjs              (write to Firestore)
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8')
);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const DRY_RUN = process.argv.includes('--dry-run');

// ── Main migration ─────────────────────────────────────────────────────────
async function migrate() {
  console.log('\n🔄 Goals Phase 3 — Propagate goalIds[] to Variants');
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : '🔴 LIVE WRITE'}`);
  console.log('────────────────────────────────────────────────\n');

  const snap = await db.collection('products').get();
  const products = snap.docs;

  console.log(`Total products: ${products.length}\n`);

  let totalVariants = 0;
  let variantsUpdated = 0;
  let variantsSkipped = 0;
  let productsWithNoGoals = 0;
  let productsProcessed = 0;

  const BATCH_LIMIT = 450;
  const batches = [];
  let currentBatch = db.batch();
  let batchCount = 0;

  for (const productDoc of products) {
    const productData = productDoc.data();
    const parentGoalIds = productData.goalIds || [];

    if (parentGoalIds.length === 0) {
      productsWithNoGoals++;
      continue;
    }

    productsProcessed++;

    // Fetch all variants for this product
    const variantsSnap = await db
      .collection('products')
      .doc(productDoc.id)
      .collection('variants')
      .get();

    if (variantsSnap.empty) continue;

    for (const variantDoc of variantsSnap.docs) {
      totalVariants++;
      const variantData = variantDoc.data();
      const existingGoals = variantData.goalIds || [];

      if (existingGoals.length > 0) {
        variantsSkipped++;
        continue;
      }

      variantsUpdated++;

      if (process.env.VERBOSE === '1') {
        console.log(`  📦 ${productData.name || productDoc.id} → variant ${variantDoc.id}`);
        console.log(`     goalIds: [${parentGoalIds.join(', ')}]`);
      }

      if (!DRY_RUN) {
        currentBatch.update(variantDoc.ref, { goalIds: parentGoalIds });
        batchCount++;

        if (batchCount >= BATCH_LIMIT) {
          batches.push(currentBatch);
          currentBatch = db.batch();
          batchCount = 0;
        }
      }
    }
  }

  // Push remaining batch
  if (batchCount > 0) {
    batches.push(currentBatch);
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('════════════════════════════════════════════════');
  console.log(`  Products processed:    ${productsProcessed}`);
  console.log(`  Products without goals:${productsWithNoGoals}`);
  console.log(`  Total variants scanned:${totalVariants}`);
  console.log(`  Variants to update:    ${variantsUpdated}`);
  console.log(`  Variants already OK:   ${variantsSkipped}`);
  console.log('════════════════════════════════════════════════');

  if (!DRY_RUN && batches.length > 0) {
    console.log(`\n🔥 Committing ${batches.length} batch(es)...`);
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`   ✅ Batch ${i + 1}/${batches.length} committed`);
    }
    console.log(`\n✅ Phase 3 complete — ${variantsUpdated} variants now have goalIds[].`);
  } else if (DRY_RUN) {
    console.log(`\n📋 DRY RUN complete — ${variantsUpdated} variants would be updated.`);
    console.log('   Run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ Nothing to update — all variants already have goalIds[].');
  }
}

migrate().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

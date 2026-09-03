/**
 * enrich_supplier_calculations.mjs
 *
 * Golden Rule: supplierId lives ONLY in variants subcollections, NEVER in the
 * product root. This script reads variants subcollections to build accurate
 * per-supplier counts and writes them back to the `suppliers` collection.
 *
 * Fields written to each supplier doc:
 *   productsSupplied  — number of distinct canonical product IDs
 *   variantsSupplied  — total variant documents across those products
 *   analytics.lastCalculatedAt — ISO timestamp of last run
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore(app);

async function runEnrichment() {
  console.log('============================================================');
  console.log(' SUPPLIER STATS ENRICHMENT — reads from variants subcollections');
  console.log('============================================================\n');

  // Step 1: List all products
  const productsSnap = await db.collection('products').get();
  console.log(`Found ${productsSnap.size} products. Scanning variants...\n`);

  // supplierId → { productIds: Set, variantCount: number }
  const supplierMap = {};

  let totalVariantsScanned = 0;
  let productsWithVariants = 0;

  for (const productDoc of productsSnap.docs) {
    const productId = productDoc.id;

    // Fetch variants subcollection
    const variantsSnap = await productDoc.ref.collection('variants').get();

    if (variantsSnap.empty) continue;

    productsWithVariants++;

    for (const variantDoc of variantsSnap.docs) {
      totalVariantsScanned++;
      const v = variantDoc.data();
      const supplierId = v.supplierId;

      if (!supplierId) continue; // skip unassigned variants

      if (!supplierMap[supplierId]) {
        supplierMap[supplierId] = { productIds: new Set(), variantCount: 0 };
      }

      supplierMap[supplierId].productIds.add(productId);
      supplierMap[supplierId].variantCount++;
    }
  }

  console.log(`✅ Scanned ${totalVariantsScanned} variants across ${productsWithVariants} products.\n`);
  console.log('--- Per-Supplier Counts ---');

  for (const [supplierId, stats] of Object.entries(supplierMap)) {
    console.log(
      `  ${supplierId}: ${stats.productIds.size} products, ${stats.variantCount} variants`
    );
  }

  // Step 2: Write counts to supplier docs
  console.log('\n--- Writing to suppliers collection ---');
  const now = new Date().toISOString();

  for (const [supplierId, stats] of Object.entries(supplierMap)) {
    const suppRef = db.collection('suppliers').doc(supplierId);

    // Check the doc exists first
    const suppSnap = await suppRef.get();
    if (!suppSnap.exists) {
      console.warn(`⚠️  Supplier doc NOT FOUND for id: "${supplierId}" — skipping write`);
      continue;
    }

    await suppRef.set(
      {
        productsSupplied: stats.productIds.size,
        variantsSupplied: stats.variantCount,
        analytics: {
          productsSupplied: stats.productIds.size,
          variantsSupplied: stats.variantCount,
          lastCalculatedAt: now,
        },
        updatedAt: now,
      },
      { merge: true }
    );

    console.log(
      `  ✅ ${supplierId}: productsSupplied=${stats.productIds.size}, variantsSupplied=${stats.variantCount}`
    );
  }

  // Step 3: Also list any supplier docs with no products (so they show 0)
  console.log('\n--- Zeroing out suppliers with no variants ---');
  const allSuppliersSnap = await db.collection('suppliers').get();
  for (const suppDoc of allSuppliersSnap.docs) {
    if (!supplierMap[suppDoc.id]) {
      await suppDoc.ref.set(
        {
          productsSupplied: 0,
          variantsSupplied: 0,
          analytics: {
            productsSupplied: 0,
            variantsSupplied: 0,
            lastCalculatedAt: now,
          },
          updatedAt: now,
        },
        { merge: true }
      );
      console.log(`  ⚪ ${suppDoc.id}: set to 0 (no variants found)`);
    }
  }

  console.log('\n=== ENRICHMENT COMPLETE ===');
  process.exit(0);
}

runEnrichment().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});

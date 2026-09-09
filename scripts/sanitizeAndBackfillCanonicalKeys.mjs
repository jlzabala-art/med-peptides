/**
 * scripts/sanitizeAndBackfillCanonicalKeys.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Database & Index Sanitization & Backfill Pipeline
 *
 * 1. Reads all documents in Firestore `products` collection.
 * 2. Uses `deriveCanonicalIdentity` from `src/utils/canonicalProductRegistry.js`
 *    to resolve standardized canonicalKey and canonicalName for all products.
 * 3. Fixes known historical contamination (e.g. Nadolol being tagged as NAD+,
 *    or disparate names for KLOW/GLOW variants).
 * 4. Persists the normalized `canonicalKey` and `canonicalName` into Firestore.
 * 5. Synchronizes the clean catalog to Algolia index `products` via batch update.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { deriveCanonicalIdentity } from '../src/utils/canonicalProductRegistry.js';

const require = createRequire(import.meta.url);

// ── Algolia Config ─────────────────────────────────────────────────────────────
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || 'b3a78c3cf33841e6676a0da714800e0f';
const INDEX_NAME = 'products';

if (!ALGOLIA_ADMIN_KEY) {
  console.error('❌  ALGOLIA_ADMIN_KEY is required');
  process.exit(1);
}

// ── Firebase Admin Config ──────────────────────────────────────────────────────
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const SA_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccount-target.json';
if (!getApps().length) {
  const sa = JSON.parse(readFileSync(SA_PATH, 'utf8'));
  initializeApp({ credential: cert(sa) });
  console.log(`✅  Firebase Admin initialized (${sa.project_id})`);
}
const db = getFirestore();

function getTimestamp(val) {
  if (!val) return Date.now();
  if (typeof val === 'number') return val;
  if (val.toDate) return val.toDate().getTime();
  if (val instanceof Date) return val.getTime();
  const p = new Date(val).getTime();
  return isNaN(p) ? Date.now() : p;
}

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

async function algoliaBatchSave(records) {
  const url = `https://${ALGOLIA_APP_ID}.algolia.net/1/indexes/${INDEX_NAME}/batch`;
  const body = JSON.stringify({
    requests: records.map(r => ({ action: 'updateObject', body: r }))
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Algolia-Application-Id': ALGOLIA_APP_ID,
      'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Algolia batch failed (${res.status}): ${err}`);
  }
  return res.json();
}

async function main() {
  console.log('\n🚀  Starting Product Canonical Identity Sanitization & Backfill...\n');

  const snap = await db.collection('products').get();
  console.log(`📦  Fetched ${snap.size} product documents from Firestore.`);

  const firestoreUpdates = [];
  const algoliaRecords = [];

  let fixedNadolol = 0;
  let fixedKlow = 0;
  let fixedGlow = 0;
  let updatedFirestoreCount = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const docId = docSnap.id;

    // Derive deterministic canonical identity
    const canonical = deriveCanonicalIdentity({ id: docId, ...data });

    // Track specific fixes
    if (docId === 'nadolol' || (data.name || '').toLowerCase() === 'nadolol') {
      fixedNadolol++;
    }
    if (canonical.canonicalKey === 'klow') {
      fixedKlow++;
    }
    if (canonical.canonicalKey === 'glow') {
      fixedGlow++;
    }

    // Determine if Firestore document needs update
    const needsFirestoreUpdate =
      data.canonicalKey !== canonical.canonicalKey ||
      data.canonicalName !== canonical.canonicalName;

    if (needsFirestoreUpdate) {
      firestoreUpdates.push({
        ref: docSnap.ref,
        fields: {
          canonicalKey: canonical.canonicalKey,
          canonicalName: canonical.canonicalName,
          updatedAt: new Date().toISOString()
        }
      });
    }

    // Prepare Algolia record with canonicalKey
    const allGoals = [
      ...(data.goals || []),
      ...(data.canonicalGoals || []),
      ...(data.tags || []),
      data.category,
    ]
      .filter(Boolean)
      .map(g => String(g).toLowerCase().replace(/_/g, '-'));

    const variantsList = Array.isArray(data.variants) ? data.variants : [];

    algoliaRecords.push({
      objectID: docId,
      id: docId,
      name: data.name || data.title || '',
      canonicalKey: canonical.canonicalKey,
      canonicalName: canonical.canonicalName,
      category: data.category || '',
      description: data.description ? String(data.description).substring(0, 500) : '',
      goals: data.goals || [],
      canonicalGoals: data.canonicalGoals || [],
      tags: data.tags || [],
      searchableGoals: [...new Set(allGoals)],
      supplier: data.supplier || data.supplierName || '',
      supplierName: data.supplierName || data.supplier || '',
      stock: Number(data.stock ?? data.inventory ?? 0),
      price: Number(data.price || 0),
      variantsCount: Number(data.variantsCount ?? variantsList.length ?? 1),
      hasCoa: Boolean(data.hasCoa),
      hasGmp: Boolean(data.hasGmp),
      productType: data.productType || data.type || '',
      sku: data.sku || '',
      updatedAt_ts: getTimestamp(data.updatedAt || data.createdAt),
    });
  }

  console.log(`\n📊  Analysis & Transformation Summary:`);
  console.log(`    • Documents requiring Firestore update: ${firestoreUpdates.length}`);
  console.log(`    • KLOW documents mapped to canonicalKey 'klow': ${fixedKlow}`);
  console.log(`    • GLOW documents mapped to canonicalKey 'glow': ${fixedGlow}`);
  console.log(`    • Nadolol safeguarded: ${fixedNadolol}`);

  // 1. Commit Firestore batch updates in chunks of 400
  if (firestoreUpdates.length > 0) {
    console.log(`\n💾  Applying updates to Firestore in batches...`);
    const updateBatches = chunk(firestoreUpdates, 400);
    for (let i = 0; i < updateBatches.length; i++) {
      const b = db.batch();
      for (const item of updateBatches[i]) {
        b.set(item.ref, item.fields, { merge: true });
      }
      await b.commit();
      updatedFirestoreCount += updateBatches[i].length;
      console.log(`    Batch ${i + 1}/${updateBatches.length} committed (${updateBatches[i].length} docs)`);
    }
    console.log(`✅  Firestore backfill complete. ${updatedFirestoreCount} documents updated.`);
  } else {
    console.log(`✅  Firestore is already up-to-date with canonical identities.`);
  }

  // 2. Sync to Algolia with canonicalKey
  console.log(`\n⬆️   Syncing ${algoliaRecords.length} records to Algolia 'products' index...`);
  const algoliaBatches = chunk(algoliaRecords, 500);
  for (let i = 0; i < algoliaBatches.length; i++) {
    const res = await algoliaBatchSave(algoliaBatches[i]);
    console.log(`    Batch ${i + 1}/${algoliaBatches.length} synced (${algoliaBatches[i].length} records) → TaskID: ${res.taskID}`);
  }

  console.log('\n🎉  Sanitization & Backfill Pipeline successfully completed!\n');
}

main().catch(err => {
  console.error('❌  Pipeline failed:', err);
  process.exit(1);
});

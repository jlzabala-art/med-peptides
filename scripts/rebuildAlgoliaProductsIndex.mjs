/**
 * scripts/rebuildAlgoliaProductsIndex.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete Rebuild & Purge of Algolia `products` Index
 *
 * 1. Purges legacy orphan/composite records (e.g. `productId__variantId`).
 * 2. Fetches authoritative products from Firestore (`products` collection).
 * 3. Formats each product with its canonicalKey, canonicalName, supplier, stock, etc.
 * 4. Uploads clean records to Algolia using `saveObjects`.
 * 5. Applies index settings: `attributeForDistinct: 'canonicalKey'`, `distinct: 1`.
 * 6. Verifies clean distinct search results for KLOW, GLOW, BPC-157, etc.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { algoliasearch } from 'algoliasearch';
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { deriveCanonicalIdentity } from '../src/utils/canonicalProductRegistry.js';

const require = createRequire(import.meta.url);

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || 'b3a78c3cf33841e6676a0da714800e0f';
const INDEX_NAME = 'products';

if (!ADMIN_KEY) {
  console.error('❌  ALGOLIA_ADMIN_KEY is required');
  process.exit(1);
}

const client = algoliasearch(APP_ID, ADMIN_KEY);

// Firebase Admin
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

async function rebuildIndex() {
  console.log('\n🚀  Starting Authoritative Algolia `products` Index Rebuild...\n');

  // 1. Fetch from Firestore
  console.log('📦  Fetching authoritative products from Firestore...');
  const snap = await db.collection('products').get();
  console.log(`    Found ${snap.size} products in Firestore.`);

  const records = [];
  snap.docs.forEach(docSnap => {
    const data = docSnap.data();
    const docId = docSnap.id;

    // Use canonical identity
    const canonical = deriveCanonicalIdentity({ id: docId, ...data });

    const allGoals = [
      ...(data.goals || []),
      ...(data.canonicalGoals || []),
      ...(data.tags || []),
      data.category,
    ]
      .filter(Boolean)
      .map(g => String(g).toLowerCase().replace(/_/g, '-'));

    const variantsList = Array.isArray(data.variants) ? data.variants : [];
    const allSuppliers = [
      data.supplierName,
      data.supplier,
      ...(data.suppliers || []),
      ...(variantsList.map(v => v.supplierName || v.supplier).filter(Boolean))
    ].filter(Boolean);
    const uniqueSuppliers = [...new Set(allSuppliers)];

    records.push({
      objectID: docId,
      id: docId,
      name: data.name || data.title || '',
      canonicalKey: canonical.canonicalKey || data.canonicalKey || docId,
      canonicalName: canonical.canonicalName || data.canonicalName || data.name || docId,
      category: data.category || '',
      description: data.description ? String(data.description).substring(0, 500) : '',
      goals: data.goals || [],
      canonicalGoals: data.canonicalGoals || [],
      tags: data.tags || [],
      searchableGoals: [...new Set(allGoals)],
      supplier: uniqueSuppliers[0] || data.supplier || data.supplierName || '',
      supplierName: uniqueSuppliers[0] || data.supplierName || data.supplier || '',
      suppliers: uniqueSuppliers,
      stock: Number(data.stock ?? data.inventory ?? 0),
      price: Number(data.price || 0),
      variantsCount: Number(data.variantsCount ?? variantsList.length ?? 1),
      hasCoa: Boolean(data.hasCoa),
      hasGmp: Boolean(data.hasGmp),
      productType: data.productType || data.type || '',
      sku: data.sku || '',
      status: data.status || 'active',
      isActive: data.isActive !== false,
      updatedAt_ts: getTimestamp(data.updatedAt || data.createdAt),
    });
  });

  // 2. Clear old index to purge legacy composite objects
  console.log('\n🧹  Purging legacy & ghost records from Algolia `products` index...');
  const clearTask = await client.clearObjects({ indexName: INDEX_NAME });
  console.log(`    Clear task dispatched (TaskID: ${clearTask.taskID}).`);

  // 3. Upload clean authoritative records
  console.log(`\n⬆️   Uploading ${records.length} clean products to Algolia in batches...`);
  const batches = chunk(records, 250);
  for (let i = 0; i < batches.length; i++) {
    const res = await client.saveObjects({
      indexName: INDEX_NAME,
      objects: batches[i],
    });
    console.log(`    Batch ${i + 1}/${batches.length} uploaded (${batches[i].length} objects) → TaskID: ${res.taskID}`);
  }

  // 4. Configure settings
  console.log('\n⚙️   Applying index settings with attributeForDistinct: canonicalKey...');
  const settingsRes = await client.setSettings({
    indexName: INDEX_NAME,
    indexSettings: {
      attributeForDistinct: 'canonicalKey',
      distinct: 1,
      minWordSizefor1Typo: 5,
      disableTypoToleranceOnWords: [
        'glow', 'klow', 'bpc', 'ghk', 'kpv', 'mots', 'dsip', 'cjc', 'nad', 'telo', 'tymo', 'pt', 'ss'
      ],
      searchableAttributes: [
        'unordered(canonicalName)',
        'unordered(name)',
        'unordered(canonicalKey)',
        'unordered(searchableGoals)',
        'unordered(tags)',
        'unordered(supplierName)',
        'unordered(supplier)',
        'unordered(sku)',
        'unordered(description)',
      ],
      attributesForFaceting: [
        'filterOnly(canonicalKey)',
        'filterOnly(canonicalName)',
        'category',
        'categoryId',
        'supplier',
        'supplierName',
        'productType',
        'searchableGoals',
        'hasCoa',
        'hasGmp',
        'stock',
        'price',
        'status',
        'isActive',
      ],
      customRanking: [
        'desc(stock)',
        'desc(hasCoa)',
        'desc(updatedAt_ts)',
      ],
    },
  });
  console.log(`    Settings task dispatched (TaskID: ${settingsRes.taskID}).`);

  console.log('\n🎉  Algolia index rebuild complete! Testing search in 3 seconds...\n');
  await new Promise(r => setTimeout(r, 3000));

  // 5. Verification queries
  const testQueries = ['klow', 'glow', 'tirzepatide', 'bpc-157'];
  for (const q of testQueries) {
    const searchRes = await client.search({
      requests: [{ indexName: INDEX_NAME, query: q, distinct: 1, hitsPerPage: 5 }]
    });
    const hits = searchRes.results[0]?.hits || [];
    console.log(`🔍  Query "${q}" returned ${hits.length} distinct hit(s):`);
    hits.forEach(h => {
      console.log(`    • [${h.canonicalKey}] "${h.canonicalName}" (Doc ID: ${h.objectID}, Supplier: ${h.supplier})`);
    });
  }
}

rebuildIndex().catch(err => {
  console.error('❌  Rebuild failed:', err);
  process.exit(1);
});

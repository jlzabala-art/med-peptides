/**
 * scripts/configureAlgoliaProductIndex.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Configures the Algolia `products` index settings for native deduplication
 * and optimized peptide discovery.
 *
 * Key settings:
 * - attributeForDistinct: 'canonicalKey'  -> Natively collapses duplicate hits
 * - distinct: true                        -> Default to distinct in the engine
 * - searchableAttributes: prioritizes canonicalName and name
 * - attributesForFaceting: enables filtering by canonicalKey, category, supplier, etc.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || 'b3a78c3cf33841e6676a0da714800e0f';

if (!ADMIN_KEY) {
  console.error('❌  ALGOLIA_ADMIN_KEY is required');
  process.exit(1);
}

const client = algoliasearch(APP_ID, ADMIN_KEY);

async function configureProductIndex() {
  console.log('⚙️  Configuring Algolia settings for index: products...');

  const settings = {
    // ── Native Deduplication ──────────────────────────────────────────────────
    attributeForDistinct: 'canonicalKey',
    distinct: 1,

    // ── Strict Typo Tolerance for Peptide Acronyms & Short Names ──────────────
    minWordSizefor1Typo: 5,
    disableTypoToleranceOnWords: [
      'glow', 'klow', 'bpc', 'ghk', 'kpv', 'mots', 'dsip', 'cjc', 'nad', 'telo', 'tymo', 'pt', 'ss'
    ],

    // ── Search Relevance & Prioritization ─────────────────────────────────────
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

    // ── Facets & Filters ──────────────────────────────────────────────────────
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

    // ── Custom Ranking ────────────────────────────────────────────────────────
    customRanking: [
      'desc(stock)',
      'desc(hasCoa)',
      'desc(updatedAt_ts)',
    ],
  };

  const response = await client.setSettings({
    indexName: 'products',
    indexSettings: settings,
  });

  console.log('✅  Algolia index settings updated successfully. TaskID:', response.taskID);

  // Read back to verify
  const current = await client.getSettings({ indexName: 'products' });
  console.log('🔍  Verified Settings:');
  console.log('    • attributeForDistinct:', current.attributeForDistinct);
  console.log('    • distinct:', current.distinct);
  console.log('    • searchableAttributes:', current.searchableAttributes);
}

configureProductIndex().catch(err => {
  console.error('❌  Failed to configure Algolia settings:', err);
  process.exit(1);
});

/**
 * src/services/algoliaRecommendService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Algolia Recommend Engine Integration (AI Recommendations & Synergies)
 *
 * Utilizes Algolia's Recommend API models:
 *   - 'related-products'
 *   - 'bought-together'
 *   - 'trending-items'
 *
 * Includes automatic facet/search-based fallback (Goals / Category / Synergy matching)
 * when the Algolia Recommend ML model is warming up.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import logger from '../utils/logger.js';
import { checkAlgoliaQuota } from './algoliaSearch.js';

const APP_ID = (typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.VITE_ALGOLIA_APP_ID)
  : '') || 'G722EVODUJ';
const SEARCH_KEY = (typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || process.env.VITE_ALGOLIA_SEARCH_KEY)
  : '') || '609364d5500e57e9547d6e6ab05e04cb';

const INDEX_PRODUCTS = 'products';
const INDEX_PROTOCOLS = 'protocols';

let client = null;
function getClient() {
  if (!client && APP_ID && SEARCH_KEY) {
    try {
      client = algoliasearch(APP_ID, SEARCH_KEY);
    } catch (e) {
      logger.warn('[AlgoliaRecommend] Client init failed:', e.message);
    }
  }
  return client;
}

// ── In-Memory LRU/TTL Cache (5 min TTL) to save Algolia Recommend Quota ─────
const recommendCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(key) {
  const item = recommendCache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > CACHE_TTL_MS) {
    recommendCache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  if (recommendCache.size > 150) {
    const firstKey = recommendCache.keys().next().value;
    recommendCache.delete(firstKey);
  }
  recommendCache.set(key, { data, ts: Date.now() });
}

function normalizeCategoryFacet(cat = '') {
  if (!cat) return '';
  const c = String(cat).toLowerCase().trim();
  if (c.startsWith('peptide')) return 'peptide';
  if (c.startsWith('supplement')) return 'supplement';
  if (c.startsWith('raw') || c.includes('material')) return 'raw_material';
  if (c.includes('diagnostic')) return 'diagnostic';
  if (c.includes('skincare')) return 'skincare';
  if (c.includes('weight')) return 'weight_loss';
  return c;
}

/**
 * Fetches related products using Algolia Recommend with intelligent facet fallback.
 *
 * @param {Object} params
 * @param {string} params.objectID - The current product ID or slug
 * @param {string} [params.category] - Product category for fallback
 * @param {Array<string>} [params.goals] - Product goals/tags for fallback
 * @param {number} [params.maxRecommendations=4] - Max items to return
 * @returns {Promise<Array<Object>>}
 */
export async function getRelatedProducts({
  objectID,
  category = '',
  goals = [],
  maxRecommendations = 4,
}) {
  const cacheKey = `rel:${objectID}:${category}:${(goals || []).join(',')}:${maxRecommendations}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const quota = checkAlgoliaQuota();
  if (!quota.allowed) {
    logger.warn(`[AlgoliaRecommend] Monthly quota reached (${quota.count}/${quota.limit}). Skipping.`);
    return [];
  }

  const client = getClient();
  if (!client) return [];

  try {
    // 1. Attempt Algolia Recommend API (v5 getRecommendations)
    if (typeof client.getRecommendations === 'function' && objectID) {
      const response = await client.getRecommendations({
        requests: [
          {
            indexName: INDEX_PRODUCTS,
            model: 'related-products',
            objectID: String(objectID),
            maxRecommendations,
            threshold: 30,
          },
        ],
      });

      const hits = response?.results?.[0]?.hits || [];
      if (hits.length > 0) {
        const result = hits.filter((h) => h.objectID !== objectID && h.id !== objectID);
        setCached(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    // Suppress ML cold start errors to cleanly fallback
    console.debug('[AlgoliaRecommend] ML Recommend cold start, applying search fallback:', err.message);
  }

  // 2. Fallback: Query Algolia using category / synergies via official v5 client.search
  try {
    const normCategory = normalizeCategoryFacet(category);
    let hits = [];

    // Attempt 2a: If goals provided, clean and search
    if (goals && goals.length > 0) {
      const cleanGoalQuery = (Array.isArray(goals) ? goals : [goals])
        .map((g) => String(g).replace(/_/g, ' '))
        .slice(0, 2)
        .join(' ');

      const searchRequest = {
        indexName: INDEX_PRODUCTS,
        query: cleanGoalQuery,
        hitsPerPage: maxRecommendations * 3,
        clickAnalytics: true,
      };
      if (normCategory) searchRequest.facetFilters = [`category:${normCategory}`];

      const searchRes = await client.search({ requests: [searchRequest] });
      hits = searchRes.results?.[0]?.hits || [];
    }

    // Attempt 2b: If 0 hits from goals, fallback to category discovery query
    if (hits.length === 0) {
      const fallbackRequest = {
        indexName: INDEX_PRODUCTS,
        query: normCategory === 'peptide' ? 'peptide' : (normCategory || ''),
        hitsPerPage: maxRecommendations * 4,
        clickAnalytics: true,
      };
      if (normCategory) {
        fallbackRequest.facetFilters = [`category:${normCategory}`];
      }

      const fallbackRes = await client.search({ requests: [fallbackRequest] });
      hits = fallbackRes.results?.[0]?.hits || [];
    }

    // Attempt 2c: Broad fallback if category is too restrictive
    if (hits.length === 0) {
      const broadRes = await client.search({
        requests: [
          {
            indexName: INDEX_PRODUCTS,
            query: 'peptide',
            hitsPerPage: maxRecommendations * 4,
          },
        ],
      });
      hits = broadRes.results?.[0]?.hits || [];
    }

    // Deduplicate hits by normalized product name and exclude current product
    const currentNormId = String(objectID || '').toLowerCase();
    const seenNames = new Set();
    const uniqueHits = [];

    for (const hit of hits) {
      const hitId = String(hit.objectID || hit.id || hit.productId || '').toLowerCase();
      const hitName = (hit.name || hit.productName || hit.canonicalName || '').trim();
      const normNameKey = hitName.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Exclude exact matches to current product ID or slug
      if (hitId === currentNormId || currentNormId.includes(hitId) || hitId.includes(currentNormId)) {
        continue;
      }
      if (!normNameKey || seenNames.has(normNameKey)) {
        continue;
      }

      seenNames.add(normNameKey);
      uniqueHits.push(hit);

      if (uniqueHits.length >= maxRecommendations) break;
    }

    setCached(cacheKey, uniqueHits);
    return uniqueHits;
  } catch (fallbackErr) {
    logger.warn('[AlgoliaRecommend] Fallback search error:', fallbackErr.message);
  }

  return [];
}

/**
 * Fetches complementary / synergic products (Frequently Prescribed Together).
 */
export async function getFrequentlyPrescribedTogether({
  objectID,
  category = '',
  goals = [],
  maxRecommendations = 3,
}) {
  const cacheKey = `fbt:${objectID}:${category}:${maxRecommendations}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const client = getClient();
  if (!client) return [];

  try {
    if (typeof client.getRecommendations === 'function' && objectID) {
      const response = await client.getRecommendations({
        requests: [
          {
            indexName: INDEX_PRODUCTS,
            model: 'bought-together',
            objectID: String(objectID),
            maxRecommendations,
            threshold: 20,
          },
        ],
      });
      const hits = response?.results?.[0]?.hits || [];
      if (hits.length > 0) {
        const filtered = hits.filter((h) => (h.objectID || h.id) !== objectID);
        setCached(cacheKey, filtered);
        return filtered;
      }
    }
  } catch (err) {
    console.debug('[AlgoliaRecommend] Bought-together ML unavailable, falling back');
  }

  const result = await getRelatedProducts({ objectID, category, goals, maxRecommendations });
  setCached(cacheKey, result);
  return result;
}

/**
 * Fetches related protocols based on clinical goals.
 */
export async function getRelatedProtocols({
  protocolId,
  goals = [],
  category = '',
  maxRecommendations = 3,
}) {
  const cacheKey = `proto:${protocolId}:${(goals || []).join(',')}:${category}:${maxRecommendations}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const client = getClient();
  if (!client) return [];

  try {
    const query = Array.isArray(goals) ? goals.slice(0, 3).join(' ') : (category || '');
    const searchRes = await client.search({
      requests: [
        {
          indexName: INDEX_PROTOCOLS,
          query,
          hitsPerPage: maxRecommendations + 2,
          clickAnalytics: true,
        }
      ]
    });

    const hits = searchRes.results?.[0]?.hits || [];
    const filtered = hits
      .filter((h) => (h.objectID || h.id || h.protocol_id) !== protocolId)
      .slice(0, maxRecommendations);
    setCached(cacheKey, filtered);
    return filtered;
  } catch (err) {
    logger.warn('[AlgoliaRecommend] getRelatedProtocols error:', err.message);
  }
  return [];
}

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
 * Includes automatic facet-based fallback (Goals / Category / Synergy matching)
 * when the Algolia Recommend ML model is cold or during initial training.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import logger from '../utils/logger.js';

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '14102Y4B4O';
const SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || 'f11b6ecbe89fbabcfdbd0a3d46cb0a43';
const INDEX_PRODUCTS = 'products';
const INDEX_PROTOCOLS = 'protocols';

let client = null;
try {
  if (APP_ID && SEARCH_KEY) {
    client = algoliasearch(APP_ID, SEARCH_KEY);
  }
} catch (e) {
  logger.warn('[AlgoliaRecommend] Client init failed:', e.message);
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
        return hits.filter((h) => h.objectID !== objectID && h.id !== objectID);
      }
    }
  } catch (err) {
    // Suppress ML cold start errors to cleanly fallback
    console.debug('[AlgoliaRecommend] ML Recommend cold start, applying facet fallback:', err.message);
  }

  // 2. Fallback: Query Algolia using goals / category facets
  try {
    const filters = [];
    if (category) {
      filters.push(`categoryId:${category} OR category:${category}`);
    }
    if (goals && goals.length > 0) {
      const goalFilters = goals.slice(0, 3).map((g) => `goals:"${g}"`).join(' OR ');
      if (goalFilters) filters.push(`(${goalFilters})`);
    }

    const searchParams = {
      hitsPerPage: maxRecommendations + 2,
    };
    if (filters.length > 0) {
      searchParams.optionalFilters = goals.map((g) => `goals:${g}`);
      searchParams.facetFilters = category ? [`categoryId:${category}`] : undefined;
    }

    if (typeof client.searchSingleIndex === 'function') {
      const result = await client.searchSingleIndex({
        indexName: INDEX_PRODUCTS,
        searchParams,
      });
      return (result.hits || [])
        .filter((h) => (h.objectID || h.id) !== objectID)
        .slice(0, maxRecommendations);
    }
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
  maxRecommendations = 3,
}) {
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
        return hits.filter((h) => (h.objectID || h.id) !== objectID);
      }
    }
  } catch (err) {
    console.debug('[AlgoliaRecommend] Bought-together ML unavailable, falling back');
  }

  return getRelatedProducts({ objectID, category, maxRecommendations });
}

/**
 * Fetches related protocols based on clinical goals.
 */
export async function getRelatedProtocols({
  protocolId,
  goals = [],
  maxRecommendations = 3,
}) {
  if (!client) return [];

  try {
    const searchParams = {
      hitsPerPage: maxRecommendations + 1,
    };
    if (goals && goals.length > 0) {
      searchParams.optionalFilters = goals.map((g) => `goals:${g}`);
    }

    if (typeof client.searchSingleIndex === 'function') {
      const result = await client.searchSingleIndex({
        indexName: INDEX_PROTOCOLS,
        searchParams,
      });
      return (result.hits || [])
        .filter((h) => (h.objectID || h.id || h.protocol_id) !== protocolId)
        .slice(0, maxRecommendations);
    }
  } catch (err) {
    logger.warn('[AlgoliaRecommend] getRelatedProtocols error:', err.message);
  }
  return [];
}

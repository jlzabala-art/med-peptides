/**
 * Algolia Search Service
 * 
 * Wraps the Algolia client with quota-saving measures and in-memory TTL caching:
 * 1. Minimum 2-character query
 * 2. In-memory caching (5 min TTL) to avoid repeat queries
 * 3. Monthly usage tracker in localStorage
 * 4. Multi-index federated search capabilities (products, protocols, patients, prescriptions, clinics)
 */
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import logger from '../utils/logger.js';

const APP_ID = (typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.VITE_ALGOLIA_APP_ID) : '') || 'G722EVODUJ';
const SEARCH_KEY = (typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || process.env.VITE_ALGOLIA_SEARCH_KEY) : '') || '609364d52903d7aefa3080d0fe63db2a';

let client = null;
function getClient() {
  if (!client) {
    const appId = APP_ID;
    const searchKey = SEARCH_KEY;
    if (appId && searchKey) {
      try {
        client = algoliasearch(appId, searchKey);
      } catch (e) {
        logger.warn('[AlgoliaSearch] Failed to initialize client:', e.message);
      }
    }
  }
  return client;
}

// ── In-memory Query Cache (5 min TTL) ─────────────────────────────────────────
const memoryCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(key) {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  if (memoryCache.size > 150) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
  memoryCache.set(key, { data, ts: Date.now() });
}

// ── Monthly Usage Tracker ──────────────────────────────────────────────────
const USAGE_KEY = 'algolia_monthly_usage';
const FREE_TIER_LIMIT = 10000;
const WARNING_THRESHOLD = 0.80; // Warn at 80% usage (8,000 searches)

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getUsage() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(USAGE_KEY) : null;
    if (!raw) return { month: getMonthKey(), count: 0 };
    const parsed = JSON.parse(raw);
    if (parsed.month !== getMonthKey()) {
      return { month: getMonthKey(), count: 0 };
    }
    return parsed;
  } catch {
    return { month: getMonthKey(), count: 0 };
  }
}

function incrementUsage() {
  const usage = getUsage();
  usage.count += 1;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
    }
  } catch { /* ignore */ }
  return usage;
}

/**
 * Check if we're approaching the free tier limit.
 */
export function checkAlgoliaQuota() {
  const usage = getUsage();
  return {
    allowed: usage.count < FREE_TIER_LIMIT,
    count: usage.count,
    limit: FREE_TIER_LIMIT,
    percentage: Math.round((usage.count / FREE_TIER_LIMIT) * 100),
    warning: usage.count >= FREE_TIER_LIMIT * WARNING_THRESHOLD,
  };
}

/**
 * Perform a multi-index Algolia search (products + protocols).
 * Returns { products: [], protocols: [] }
 *
 * @param {string} query
 * @param {Object} [options]
 * @param {boolean} [options.distinct=true] - Collapse duplicate peptide hits by canonicalKey natively
 * @param {number} [options.hitsPerPage=15]
 */
export async function searchAlgolia(query, { distinct = true, hitsPerPage = 15 } = {}) {
  const currentClient = getClient();
  if (!currentClient) {
    return { products: [], protocols: [], source: 'disabled' };
  }

  if (!query || query.trim().length < 2) {
    return { products: [], protocols: [], source: 'skipped' };
  }

  const cleanQuery = query.trim();
  const cacheKey = `basic:${cleanQuery.toLowerCase()}:${distinct ? 1 : 0}:${hitsPerPage}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const quota = checkAlgoliaQuota();
  if (!quota.allowed) {
    logger.warn(`[AlgoliaSearch] Monthly free tier limit reached (${quota.count}/${quota.limit}). Blocking search.`);
    return { products: [], protocols: [], source: 'quota_exceeded' };
  }

  try {
    const results = await currentClient.search({
      requests: [
        {
          indexName: 'products',
          query: cleanQuery,
          hitsPerPage,
          distinct: distinct ? 1 : 0,
          clickAnalytics: true
        },
        { indexName: 'protocols', query: cleanQuery, hitsPerPage: 6, clickAnalytics: true },
      ]
    });

    incrementUsage();

    const data = {
      products: results.results[0]?.hits || [],
      protocols: results.results[1]?.hits || [],
      queryID: results.results[0]?.queryID,
      source: 'algolia',
      usage: { count: quota.count + 1, limit: FREE_TIER_LIMIT }
    };

    setCached(cacheKey, data);
    return data;
  } catch (error) {
    logger.warn('[AlgoliaSearch] Search failed, suppressed to avoid Next.js overlay:', error.message || error);
    return { products: [], protocols: [], source: 'error' };
  }
}

/**
 * Perform a federated Algolia search across all platform entities.
 * Returns { products, protocols, patients, prescriptions, clinics, queryID }
 */
export async function searchAlgoliaFederated(
  query,
  indices = ['products', 'protocols', 'atlas_patients', 'atlas_users', 'prescriptions'],
  hitsPerPage = 4,
  { distinct = true } = {}
) {
  const currentClient = getClient();
  if (!currentClient || !query || query.trim().length < 2) {
    return { products: [], protocols: [], patients: [], prescriptions: [], clinics: [], users: [] };
  }

  const cleanQuery = query.trim();
  const cacheKey = `federated:${cleanQuery.toLowerCase()}:${indices.join(',')}:${distinct ? 1 : 0}:${hitsPerPage}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const requests = indices.map((idx) => ({
      indexName: idx,
      query: cleanQuery,
      hitsPerPage,
      ...(idx === 'products' ? { distinct: distinct ? 1 : 0 } : {}),
      clickAnalytics: true,
    }));

    const results = await currentClient.search({ requests });

    incrementUsage();

    const resMap = {};
    indices.forEach((idx, i) => {
      resMap[idx] = results.results[i]?.hits || [];
    });

    const data = {
      products: resMap.products || [],
      protocols: resMap.protocols || [],
      patients: resMap.atlas_patients || resMap.patients || [],
      users: resMap.atlas_users || resMap.users || [],
      prescriptions: resMap.prescriptions || [],
      clinics: resMap.atlas_clinics || resMap.clinics || [],
      queryID: results.results[0]?.queryID,
      source: 'algolia'
    };

    setCached(cacheKey, data);
    return data;
  } catch (err) {
    return { products: [], protocols: [], patients: [], prescriptions: [], clinics: [], users: [] };
  }
}

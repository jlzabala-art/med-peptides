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

const APP_ID = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.VITE_ALGOLIA_APP_ID) : '';
const SEARCH_KEY = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || process.env.VITE_ALGOLIA_SEARCH_KEY) : '';

let client = null;
try {
  if (APP_ID && SEARCH_KEY) {
    client = algoliasearch(APP_ID, SEARCH_KEY);
  }
} catch (e) {
  logger.warn('[AlgoliaSearch] Failed to initialize client:', e.message);
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
 */
export async function searchAlgolia(query) {
  if (!client) {
    return { products: [], protocols: [], source: 'disabled' };
  }

  if (!query || query.trim().length < 2) {
    return { products: [], protocols: [], source: 'skipped' };
  }

  const cleanQuery = query.trim();
  const cacheKey = `basic:${cleanQuery.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const quota = checkAlgoliaQuota();
  if (!quota.allowed) {
    logger.warn(`[AlgoliaSearch] Monthly free tier limit reached (${quota.count}/${quota.limit}). Blocking search.`);
    return { products: [], protocols: [], source: 'quota_exceeded' };
  }

  try {
    const results = await client.search({
      requests: [
        { indexName: 'products', query: cleanQuery, hitsPerPage: 6, clickAnalytics: true },
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
export async function searchAlgoliaFederated(query, indices = ['products', 'protocols', 'users'], hitsPerPage = 4) {
  if (!client || !query || query.trim().length < 2) {
    return { products: [], protocols: [], patients: [], prescriptions: [], clinics: [], users: [] };
  }

  const cleanQuery = query.trim();
  const cacheKey = `federated:${cleanQuery.toLowerCase()}:${indices.join(',')}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const requests = indices.map((idx) => ({
      indexName: idx,
      query: cleanQuery,
      hitsPerPage,
      clickAnalytics: true,
    }));

    const results = await client.search({ requests });

    incrementUsage();

    const resMap = {};
    indices.forEach((idx, i) => {
      resMap[idx] = results.results[i]?.hits || [];
    });

    const data = {
      products: resMap.products || [],
      protocols: resMap.protocols || [],
      users: resMap.users || resMap.patients || [],
      prescriptions: resMap.prescriptions || [],
      clinics: resMap.clinics || [],
      queryID: results.results[0]?.queryID,
      source: 'algolia'
    };

    setCached(cacheKey, data);
    return data;
  } catch (err) {
    return { products: [], protocols: [], patients: [], prescriptions: [], clinics: [], users: [] };
  }
}

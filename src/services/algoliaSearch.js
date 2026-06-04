/**
 * Algolia Search Service
 * 
 * Wraps the Algolia client with aggressive quota-saving measures:
 * 1. 700ms debounce (handled by the caller)
 * 2. Minimum 3-character query to avoid wasting searches on short inputs
 * 3. Results capped at 5 per index to stay lightweight
 * 4. Monthly usage tracker stored in localStorage to warn before exceeding free tier
 * 
 * Free tier limits: 10,000 search requests/month, 10,000 records
 */
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID;
const SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;

let client = null;
try {
  if (APP_ID && SEARCH_KEY) {
    client = algoliasearch(APP_ID, SEARCH_KEY);
  }
} catch (e) {
  console.warn('[AlgoliaSearch] Failed to initialize client:', e.message);
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
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return { month: getMonthKey(), count: 0 };
    const parsed = JSON.parse(raw);
    // Reset counter if we're in a new month
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
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch { /* localStorage full — ignore */ }
  return usage;
}

/**
 * Check if we're approaching the free tier limit.
 * Returns { allowed: boolean, count: number, limit: number, percentage: number }
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
 * Quota-saving measures applied:
 * - Rejects queries < 3 chars
 * - Blocks searches when monthly limit is exceeded
 * - Caps results at 5 per index
 */
export async function searchAlgolia(query) {
  // Guard: no client configured
  if (!client) {
    return { products: [], protocols: [], source: 'disabled' };
  }

  // Guard: query too short
  if (!query || query.trim().length < 3) {
    return { products: [], protocols: [], source: 'skipped' };
  }

  // Guard: free tier exhausted
  const quota = checkAlgoliaQuota();
  if (!quota.allowed) {
    console.warn(`[AlgoliaSearch] Monthly free tier limit reached (${quota.count}/${quota.limit}). Blocking search.`);
    return { products: [], protocols: [], source: 'quota_exceeded' };
  }

  // Log warning if approaching limit
  if (quota.warning) {
    console.warn(`[AlgoliaSearch] ⚠️ Approaching free tier limit: ${quota.count}/${quota.limit} (${quota.percentage}%)`);
  }

  try {
    // Multi-index search in a single API call (counts as 1 search operation)
    const results = await client.multipleQueries([
      { indexName: 'products', query: query.trim(), params: { hitsPerPage: 5 } },
      { indexName: 'protocols', query: query.trim(), params: { hitsPerPage: 5 } },
    ]);

    // Increment usage counter (1 multipleQueries call = 1 search operation)
    const usage = incrementUsage();

    return {
      products: results.results[0]?.hits || [],
      protocols: results.results[1]?.hits || [],
      source: 'algolia',
      usage: { count: usage.count, limit: FREE_TIER_LIMIT }
    };
  } catch (error) {
    console.error('[AlgoliaSearch] Search failed:', error);
    return { products: [], protocols: [], source: 'error' };
  }
}

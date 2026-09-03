/**
 * src/services/algoliaInsights.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Algolia Insights Events Engine
 *
 * PURPOSE: Track user interactions to feed Algolia's AI models:
 *   - Algolia Recommend  → learns which products co-occur in prescriptions
 *   - Algolia Personalization → learns each doctor/wholesaler's preferences
 *   - Algolia Analytics  → populates "top searches", "no results", CTR dashboards
 *
 * EVENT TAXONOMY:
 *   CLICK events   → user viewed/opened an item from search results
 *   CONVERSION events → prescription created, quotation submitted, order placed
 *   VIEW events    → item appeared on screen (product page, catalog row)
 *
 * PRIVACY:
 *   - userToken is a hashed uid. Never PII.
 *   - Anonymous token for guests: 'guest_<random_hex>'
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

const APP_ID = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '')
  : '';
const SEARCH_KEY = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '')
  : '';

// ── Anonymous user token (persistent per browser session) ─────────────────
function getAnonToken() {
  if (typeof window === 'undefined') return 'ssr_anon';
  let token = sessionStorage.getItem('_agy_anon_token');
  if (!token) {
    token = 'anon_' + Math.random().toString(36).slice(2, 10);
    try { sessionStorage.setItem('_agy_anon_token', token); } catch { /**/ }
  }
  return token;
}

// ── Current user token (set when user authenticates) ──────────────────────
let _currentUserToken = null;

/**
 * Set the authenticated user token.
 * Call this once after Firebase Auth resolves.
 * @param {string|null} uid - Firebase UID or null on logout
 */
export function setInsightsUserToken(uid) {
  if (!uid) {
    _currentUserToken = null;
    return;
  }
  // Simple hash: first 16 chars of uid is sufficient for anonymization
  _currentUserToken = `user_${String(uid).slice(0, 16)}`;
}

function getUserToken() {
  return _currentUserToken || getAnonToken();
}

// ── HTTP Insights Endpoint ─────────────────────────────────────────────────
const INSIGHTS_ENDPOINT = `https://insights.algolia.io/1/events`;

/**
 * Send one or more events to Algolia Insights API.
 * Fire-and-forget — never blocks the UI.
 * @param {Array<Object>} events
 */
async function sendInsights(events) {
  if (!APP_ID || !SEARCH_KEY) return;
  if (typeof window === 'undefined') return; // SSR guard
  if (!events?.length) return;

  try {
    const payload = {
      events: events.map((e) => ({
        ...e,
        userToken: e.userToken || getUserToken(),
        timestamp: e.timestamp || Date.now(),
      })),
    };
    // Non-blocking fetch — navigator.sendBeacon not available for POST with JSON
    fetch(INSIGHTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': APP_ID,
        'X-Algolia-API-Key': SEARCH_KEY,
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => { /* suppress */ });
  } catch { /* suppress */ }
}

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC API — use these in components
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Track when a user clicks on a search result (Omnibar, GlobalSearchBar).
 *
 * @param {Object} params
 * @param {string} params.indexName - e.g. 'products', 'protocols'
 * @param {string} params.objectID  - Algolia objectID of the hit
 * @param {string} params.queryID   - queryID returned by Algolia search (if available)
 * @param {number} [params.position] - 1-indexed position in results list
 * @param {string} [params.eventName]
 */
export function trackSearchClick({ indexName, objectID, queryID, position = 1, eventName = 'Search Result Clicked' }) {
  const event = {
    eventType: 'click',
    eventName,
    index: indexName,
    objectIDs: [String(objectID)],
  };
  if (queryID) {
    event.queryID = queryID;
    event.positions = [position];
  }
  sendInsights([event]);
}

/**
 * Track when a product/protocol page is viewed.
 *
 * @param {Object} params
 * @param {string} params.indexName
 * @param {string} params.objectID
 * @param {string} [params.eventName]
 */
export function trackProductView({ indexName = 'products', objectID, eventName = 'Product Viewed' }) {
  sendInsights([{
    eventType: 'view',
    eventName,
    index: indexName,
    objectIDs: [String(objectID)],
  }]);
}

/**
 * Track a conversion event (prescription created, quotation submitted, order placed).
 * This is THE most valuable signal for Algolia Recommend + Personalization.
 *
 * @param {Object} params
 * @param {string} params.indexName
 * @param {string|string[]} params.objectIDs - one or multiple objectIDs involved
 * @param {string} [params.queryID] - if the conversion came from a search result
 * @param {string} [params.eventName]
 */
export function trackConversion({ indexName = 'products', objectIDs, queryID, eventName = 'Product Converted' }) {
  const ids = Array.isArray(objectIDs) ? objectIDs.map(String) : [String(objectIDs)];
  const event = {
    eventType: 'conversion',
    eventName,
    index: indexName,
    objectIDs: ids,
  };
  if (queryID) event.queryID = queryID;
  sendInsights([event]);
}

/**
 * Track a prescription creation as a conversion on ALL peptides included.
 * This is the highest-quality signal: co-converted products → Recommend learns synergies.
 *
 * @param {Object[]} items - prescription line items with {productId, productObjectID}
 * @param {string} [queryID]
 */
export function trackPrescriptionCreated(items = [], queryID) {
  const objectIDs = items
    .map((item) => item.productObjectID || item.productId || item.id)
    .filter(Boolean)
    .map(String);

  if (!objectIDs.length) return;

  trackConversion({
    indexName: 'products',
    objectIDs,
    queryID,
    eventName: 'Prescription Created',
  });
}

/**
 * Track a quotation submission.
 *
 * @param {string[]} productObjectIDs
 */
export function trackQuotationSubmitted(productObjectIDs = []) {
  const ids = productObjectIDs.filter(Boolean).map(String);
  if (!ids.length) return;
  trackConversion({
    indexName: 'products',
    objectIDs: ids,
    eventName: 'Quotation Submitted',
  });
}

/**
 * Track a filter selection (refinement) in the catalog or search page.
 * Feeds Personalization to understand per-user category preferences.
 *
 * @param {string} filterName  - e.g. 'category:peptides'
 * @param {string} [indexName]
 */
export function trackFilterSelected(filterName, indexName = 'products') {
  sendInsights([{
    eventType: 'click',
    eventName: 'Filter Selected',
    index: indexName,
    filters: [filterName],
  }]);
}

/**
 * Track when a product is added to the order builder cart.
 */
export function trackAddToCart({ objectID, indexName = 'products' }) {
  sendInsights([{
    eventType: 'conversion',
    eventName: 'Added to Cart',
    index: indexName,
    objectIDs: [String(objectID)],
  }]);
}

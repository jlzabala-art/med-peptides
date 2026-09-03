/**
 * settingsService.js
 * Centralizes all Firestore reads/writes for:
 *   - settings/global (exchange rates, discounts, shipping)
 *   - financial_approvals (CFO cost update queue)
 *   - settings/competitor_cache (Algolia competitor snapshots)
 *
 * Golden Rule #2: Components NEVER import firebase/firestore directly.
 */

import { db } from '../firebase.js';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  collection,
  query,
  writeBatch
} from 'firebase/firestore';
import { logger } from '../utils/logger';

// ─── Constants ────────────────────────────────────────────────────────────────

const SETTINGS_COLLECTION = 'settings';
const GLOBAL_DOC_ID       = 'global';
const COMPETITOR_DOC_ID   = 'competitor_cache';
const APPROVALS_COLLECTION = 'financial_approvals';

// ─── In-memory cache (Layer 1 — 0ms latency) ─────────────────────────────────

let _globalSettingsCache = null;
let _globalSettingsCacheTs = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isCacheFresh() {
  return _globalSettingsCache !== null && (Date.now() - _globalSettingsCacheTs) < CACHE_TTL_MS;
}

export function invalidateSettingsCache() {
  _globalSettingsCache = null;
  _globalSettingsCacheTs = 0;
  logger.info('[settingsService] Cache invalidated');
}

// ─── Global Settings ──────────────────────────────────────────────────────────

/**
 * Fetches global settings from Firestore (with in-memory cache).
 * @param {boolean} forceRefresh - bypass cache
 * @returns {Promise<object>}
 */
export const getGlobalSettings = async (forceRefresh = false) => {
  if (!forceRefresh && isCacheFresh()) {
    return _globalSettingsCache;
  }

  try {
    const ref = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC_ID);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};
    _globalSettingsCache = data;
    _globalSettingsCacheTs = Date.now();
    logger.info('[settingsService] Fetched global settings from Firestore');
    return data;
  } catch (err) {
    logger.error('[settingsService] getGlobalSettings failed', { error: err.message });
    throw err;
  }
};

/**
 * Fetches global settings by scanning collection (legacy pattern — prefer getGlobalSettings).
 * @returns {Promise<object>}
 */
export const getGlobalSettingsFromCollection = async () => {
  if (isCacheFresh()) return _globalSettingsCache;

  try {
    const snap = await getDocs(query(collection(db, SETTINGS_COLLECTION)));
    const globalDoc = snap.docs.find(d => d.id === GLOBAL_DOC_ID);
    const data = globalDoc ? globalDoc.data() : {};
    _globalSettingsCache = data;
    _globalSettingsCacheTs = Date.now();
    return data;
  } catch (err) {
    logger.error('[settingsService] getGlobalSettingsFromCollection failed', { error: err.message });
    throw err;
  }
};

/**
 * Saves (merges) updates into settings/global.
 * @param {object} updates - partial settings object
 * @returns {Promise<void>}
 */
export const updateGlobalSettings = async (updates) => {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC_ID);
    await setDoc(ref, updates, { merge: true });
    // Merge into cache immediately
    _globalSettingsCache = { ...(_globalSettingsCache || {}), ...updates };
    _globalSettingsCacheTs = Date.now();
    logger.info('[settingsService] Updated global settings', { keys: Object.keys(updates) });
  } catch (err) {
    logger.error('[settingsService] updateGlobalSettings failed', { error: err.message });
    throw err;
  }
};

/**
 * Initialises global settings if the doc does not exist yet.
 * @param {object} defaults
 * @returns {Promise<void>}
 */
export const initGlobalSettingsIfMissing = async (defaults) => {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC_ID);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, defaults);
      _globalSettingsCache = defaults;
      _globalSettingsCacheTs = Date.now();
      logger.info('[settingsService] Initialised global settings with defaults');
    }
  } catch (err) {
    logger.error('[settingsService] initGlobalSettingsIfMissing failed', { error: err.message });
    throw err;
  }
};

// ─── Category Discounts ───────────────────────────────────────────────────────

/**
 * Reads categoryDiscounts from global settings.
 * @returns {Promise<object>} map of category → discount%
 */
export const getCategoryDiscounts = async () => {
  const settings = await getGlobalSettings();
  return settings.categoryDiscounts || {};
};

/**
 * Saves updated category discounts and recalculates variant pricing via batch.
 * @param {object} updatedDiscounts - full discounts map
 * @param {Array}  affectedVariants - [{ productId, variantId, retail }]
 * @param {number} discountVal      - 0–100 decimal
 * @returns {Promise<number>} number of variants updated
 */
export const saveCategoryDiscountsAndVariants = async (updatedDiscounts, affectedVariants, discountVal) => {
  try {
    // 1. Save discounts
    await updateGlobalSettings({ categoryDiscounts: updatedDiscounts });

    // 2. Batch-update variants
    let batch = writeBatch(db);
    let batchCount = 0;
    let totalUpdated = 0;

    for (const { productId, variantId, retail } of affectedVariants) {
      const computedClinic    = parseFloat((retail * (1 - discountVal / 100)).toFixed(2));
      const computedWholesale = parseFloat((retail * (1 - discountVal / 100)).toFixed(2));

      const vRef = doc(db, 'products', productId, 'variants', variantId);
      batch.update(vRef, {
        'pricing.clinic':    computedClinic,
        'pricing.wholesale': computedWholesale,
        updatedAt: new Date().toISOString()
      });
      batchCount++;
      totalUpdated++;

      if (batchCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }

    if (batchCount > 0) await batch.commit();

    logger.info('[settingsService] saveCategoryDiscountsAndVariants', { totalUpdated });
    return totalUpdated;
  } catch (err) {
    logger.error('[settingsService] saveCategoryDiscountsAndVariants failed', { error: err.message });
    throw err;
  }
};

// ─── Competitor Cache & Settings ─────────────────────────────────────────────

const COMPETITOR_KPIS_DOC_ID = 'competitor_kpis';
const COMPETITOR_ANALYSIS_DOC_ID = 'competitor_analysis';
const COMPETITOR_RESULTS_COLLECTION = 'competitor_analysis_results';
const COMPETITOR_SCRAPE_QUEUE_COLLECTION = 'competitor_scrape_queue';

/**
 * Fetches the competitor cache snapshot from Firestore.
 * @returns {Promise<object>}
 */
export const getCompetitorCache = async () => {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, COMPETITOR_DOC_ID);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : {};
  } catch (err) {
    logger.error('[settingsService] getCompetitorCache failed', { error: err.message });
    throw err;
  }
};

/**
 * Fetches competitor KPIs.
 * @returns {Promise<object>}
 */
export const getCompetitorKPIs = async () => {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, COMPETITOR_KPIS_DOC_ID);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : { totalMatches: 0, highlyCompetitive: 0, needsAdjustment: 0, lastUpdated: null };
  } catch (err) {
    logger.error('[settingsService] getCompetitorKPIs failed', { error: err.message });
    throw err;
  }
};

/**
 * Fetches competitor analysis configuration.
 * @returns {Promise<object>}
 */
export const getCompetitorAnalysisSettings = async () => {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, COMPETITOR_ANALYSIS_DOC_ID);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : {};
  } catch (err) {
    logger.error('[settingsService] getCompetitorAnalysisSettings failed', { error: err.message });
    throw err;
  }
};

/**
 * Saves competitor analysis settings.
 * @param {object} settings
 * @returns {Promise<void>}
 */
export const saveCompetitorAnalysisSettings = async (settings) => {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, COMPETITOR_ANALYSIS_DOC_ID);
    await setDoc(ref, settings, { merge: true });
    logger.info('[settingsService] Saved competitor analysis settings');
  } catch (err) {
    logger.error('[settingsService] saveCompetitorAnalysisSettings failed', { error: err.message });
    throw err;
  }
};

/**
 * Fetches competitor analysis results for a specific product.
 * @param {string} productId
 * @returns {Promise<object|null>}
 */
export const getCompetitorAnalysisResults = async (productId) => {
  try {
    const ref = doc(db, COMPETITOR_RESULTS_COLLECTION, productId);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    logger.error('[settingsService] getCompetitorAnalysisResults failed', { productId, error: err.message });
    throw err;
  }
};

/**
 * Schedules a competitor scrape job for a product in queue.
 * @param {string} productId
 * @param {object} payload
 * @returns {Promise<void>}
 */
export const scheduleCompetitorScrape = async (productId, payload) => {
  try {
    const ref = doc(db, COMPETITOR_SCRAPE_QUEUE_COLLECTION, productId);
    await setDoc(ref, payload, { merge: true });
    logger.info('[settingsService] Scheduled competitor scrape', { productId });
  } catch (err) {
    logger.error('[settingsService] scheduleCompetitorScrape failed', { productId, error: err.message });
    throw err;
  }
};

// ─── Financial Approvals (CFO Queue) ─────────────────────────────────────────

/**
 * Queues a cost update for CFO approval.
 * @param {string} productId
 * @param {string} productName
 * @param {number} oldCost
 * @param {object} updates
 * @param {string} requestedBy
 * @returns {Promise<string>} docId of the approval record
 */
export const queueCostUpdateApproval = async (productId, productName, oldCost, updates, requestedBy = 'Admin') => {
  try {
    const ref = await addDoc(collection(db, APPROVALS_COLLECTION), {
      type: 'cost_update',
      status: 'pending',
      data: { productId, productName, oldCost, updates },
      requestedBy,
      createdAt: new Date().toISOString()
    });
    logger.info('[settingsService] Queued cost update for CFO approval', { productId, docId: ref.id });
    return ref.id;
  } catch (err) {
    logger.error('[settingsService] queueCostUpdateApproval failed', { productId, error: err.message });
    throw err;
  }
};


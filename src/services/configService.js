/**
 * configService.js
 *
 * Fetches and caches application-level configuration from Firestore.
 *
 * Collections used:
 *   blueprints/       → protocol blueprints (each doc is one blueprint)
 *   settings/         → singleton config docs (pathways, ui, dosageUnits)
 *
 * Session caching (sessionStorage) prevents redundant Firestore reads
 * on every navigation. Cache TTL is effectively the browser session.
 *
 * Public API:
 *   configService.getBlueprints()        → Promise<Array>
 *   configService.getPathwayMapping()    → Promise<Object>
 *   configService.getProductCategories() → Promise<Array<string>>
 *   configService.getDosageConfig()      → Promise<Object>
 *   configService.clearCache()           → void  (force re-fetch)
 */

import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

// ─── Cache helpers ────────────────────────────────────────────────────────────
const CACHE_PREFIX = 'rp_cfg_';

function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function cacheSet(key, value) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    // sessionStorage may be unavailable (e.g. private mode quota full) — silently ignore
  }
}

// ─── In-memory promise cache to deduplicate concurrent calls ─────────────────
const _pending = {};

async function cachedFetch(key, fetcher) {
  // 1. Check sessionStorage
  const cached = cacheGet(key);
  if (cached !== null) return cached;

  // 2. Deduplicate in-flight requests
  if (_pending[key]) return _pending[key];

  _pending[key] = fetcher().then(result => {
    cacheSet(key, result);
    delete _pending[key];
    return result;
  }).catch(err => {
    delete _pending[key];
    throw err;
  });

  return _pending[key];
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const configService = {

  /**
   * Returns all active blueprints from the `blueprints` collection.
   * Filters for `active: true` client-side to avoid requiring a composite index.
   */
  async getBlueprints() {
    return cachedFetch('blueprints', async () => {
      const snapshot = await getDocs(collection(db, 'blueprints'));
      const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return all.filter(b => b.active !== false);
    });
  },

  /**
   * Returns the PATHWAY_MAPPING object from settings/pathways.
   * Falls back to the local static map if Firestore is unavailable.
   */
  async getPathwayMapping() {
    return cachedFetch('pathways', async () => {
      const snap = await getDoc(doc(db, 'settings', 'pathways'));
      if (snap.exists()) return snap.data().mapping || {};
      // Local fallback (keeps the app working without Firestore)
      return _localPathwayFallback();
    });
  },

  /**
   * Returns the ordered list of product category names from settings/ui.
   */
  async getProductCategories() {
    return cachedFetch('productCategories', async () => {
      const snap = await getDoc(doc(db, 'settings', 'ui'));
      if (snap.exists()) return snap.data().productCategories || [];
      return _localCategoriesFallback();
    });
  },

  /**
   * Returns the dosage unit configuration from settings/dosageUnits.
   */
  async getDosageConfig() {
    return cachedFetch('dosageUnits', async () => {
      const snap = await getDoc(doc(db, 'settings', 'dosageUnits'));
      if (snap.exists()) return snap.data();
      return _localDosageFallback();
    });
  },

  /** Clears all cached config values — useful after admin edits. */
  clearCache() {
    ['blueprints', 'pathways', 'productCategories', 'dosageUnits'].forEach(k => {
      sessionStorage.removeItem(CACHE_PREFIX + k);
    });
  },
};

// ─── Local fallbacks (mirrors data/*.js — used if Firestore read fails) ───────
function _localPathwayFallback() {
  return {
    'healing-repair':                  'healing-recovery',
    'healing-amp-recovery':            'healing-recovery',
    'healing-recovery':                'healing-recovery',
    'metabolic-optimization':          'weight-management-metabolic',
    'weight-management-metabolic':     'weight-management-metabolic',
    'weight-management-amp-metabolic': 'weight-management-metabolic',
    'neuro-cognitive':                 'cognitive-neuro-protection',
    'cognitive-neuro-protection':      'cognitive-neuro-protection',
    'cognitive-amp-neuro-protection':  'cognitive-neuro-protection',
    'longevity-vitality':              'anti-aging-longevity',
    'anti-aging-longevity':            'anti-aging-longevity',
    'anti-aging-amp-longevity':        'anti-aging-longevity',
    'somatic-research':                'muscle-growth-performance',
    'muscle-growth-performance':       'muscle-growth-performance',
    'muscle-growth-amp-performance':   'muscle-growth-performance',
    'hormonal-pathways':               'hormonal-support',
    'hormonal-support':                'hormonal-support',
  };
}

function _localCategoriesFallback() {
  return [
    'Healing & Recovery',
    'Weight Management & Metabolic',
    'Anti-Aging & Longevity',
    'Cognitive & Neuro-Protection',
    'Muscle Growth & Performance',
    'Hormonal Support',
    'Research Supplies',
    'Other Research Peptides',
  ];
}

function _localDosageFallback() {
  return {
    units: { MG: 'mg', MCG: 'mcg', IU: 'IU', ML: 'ml', PERCENT: '%' },
    defaultUnit: 'mg',
    productUnitMap: {
      HCG: 'IU', HMG: 'IU', HGH: 'IU', 'FST-344': 'IU',
      Selank: 'mcg', Semax: 'mcg', 'Snap-8': 'mcg', 'GHK-Cu (Copper Peptide)': 'mcg',
    },
    categoryUnitMap: { hormone: 'IU', gonadotropin: 'IU', nasal: 'mcg', topical: 'mcg' },
  };
}

/**
 * clinicalRulesRepository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-Tiered Clinical Rules & Magistral Formulary Repository (Golden Rule #2).
 *
 * Implements the strict 4-layer caching architecture:
 *   1. Layer 1 (RAM): Module-scoped cache with TTL (1 hour) -> 0ms execution.
 *   2. Layer 2 (localStorage): Persistent client cache across page reloads.
 *   3. Layer 3 (Firestore): Top-level 'clinical_rules' collection — authoritative source of truth.
 *   4. Layer 4 (Local JSON): Immutable fallback catalogs & seed defaults.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { createRepositoryCache, invalidateCache } from '../../lib/cache';

// Layer 4 Local Fallback Catalogs
import defaultMagistralTemplates from '../../data/genomics/rules/magistralTemplates.json';
import defaultSpiceMatrix from '../../data/genomics/rules/spiceMatrix.json';
import defaultFoodTaxonomy from '../../data/genomics/rules/foodTaxonomy.json';

const CLINICAL_RULES_COLLECTION = 'clinical_rules';
const ONE_HOUR_MS = 60 * 60 * 1000;

// Caches for the 3 clinical rulesets
const magistralCache = createRepositoryCache('clinical_rules:magistral_templates', ONE_HOUR_MS);
const spiceCache = createRepositoryCache('clinical_rules:spice_matrix', ONE_HOUR_MS);
const foodTaxonomyCache = createRepositoryCache('clinical_rules:food_taxonomy', ONE_HOUR_MS);

/**
 * Retrieve Magistral Compounding Templates.
 * Order: L1 (RAM) -> L2 (localStorage) -> L3 (Firestore) -> L4 (Local JSON Fallback)
 */
export async function getMagistralTemplates({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = magistralCache.read();
    if (cached) return cached;
  }

  // Attempt Firestore Layer 3 read
  try {
    if (db) {
      const docRef = doc(db, CLINICAL_RULES_COLLECTION, 'magistral_templates');
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.capsules?.length) {
        const data = snap.data();
        magistralCache.write(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('[clinicalRulesRepository] Firestore fetch failed for magistral_templates, falling back to L4:', err.message);
  }

  // Fallback to Layer 4 Local Catalog & warm cache
  magistralCache.write(defaultMagistralTemplates);
  return defaultMagistralTemplates;
}

/**
 * Retrieve Spice & Bioactive Matrix Rules.
 */
export async function getSpiceMatrix({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = spiceCache.read();
    if (cached) return cached;
  }

  try {
    if (db) {
      const docRef = doc(db, CLINICAL_RULES_COLLECTION, 'spice_matrix');
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.spices?.length) {
        const data = snap.data();
        spiceCache.write(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('[clinicalRulesRepository] Firestore fetch failed for spice_matrix, falling back to L4:', err.message);
  }

  spiceCache.write(defaultSpiceMatrix);
  return defaultSpiceMatrix;
}

/**
 * Retrieve 17-Family Food Taxonomy.
 */
export async function getFoodTaxonomy({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = foodTaxonomyCache.read();
    if (cached) return cached;
  }

  try {
    if (db) {
      const docRef = doc(db, CLINICAL_RULES_COLLECTION, 'food_taxonomy');
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.families?.length) {
        const data = snap.data();
        foodTaxonomyCache.write(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('[clinicalRulesRepository] Firestore fetch failed for food_taxonomy, falling back to L4:', err.message);
  }

  foodTaxonomyCache.write(defaultFoodTaxonomy);
  return defaultFoodTaxonomy;
}

/**
 * Save / Update a Magistral Compounding Template in Firestore (Admin / Medical Director only).
 * Automatically updates L1 & L2 and invalidates stale caches.
 */
export async function saveMagistralTemplate(templateData) {
  if (!templateData || !Array.isArray(templateData.capsules)) {
    throw new Error('Invalid template data: capsules array is required.');
  }

  const payload = {
    ...templateData,
    updatedAt: new Date().toISOString()
  };

  if (db) {
    const docRef = doc(db, CLINICAL_RULES_COLLECTION, 'magistral_templates');
    await setDoc(docRef, payload, { merge: true });
  }

  magistralCache.write(payload);
  invalidateCache('clinical_rules:magistral_templates');
  return payload;
}

/**
 * Invalidate All Clinical Rules Caches (used by Admin Panel or upon manual trigger).
 */
export function invalidateClinicalRulesCache() {
  magistralCache.invalidate();
  spiceCache.invalidate();
  foodTaxonomyCache.invalidate();
}

/* eslint-disable no-unused-vars */
/**
 * supplementRepository.js
 *
 * ⚠️  REDIRECT LAYER — DO NOT ADD NEW LOGIC HERE
 *
 * After Phase 4 migration, all supplements live in the unified `products`
 * collection with `type: 'supplement'`. This file preserves the old API surface
 * so that existing callers (CatalogProvider, useStaticData, ProtocolSupplementSection,
 * SupplementCollectionPage, SupplementDetailPage, TestingDetailPage) continue
 * working without code changes.
 *
 * All functions now delegate to productRepository and filter by type.
 *
 * Migration date: 2024-08-10
 */

import {
  getActiveProducts,
  getProduct,
  getProductWithVariants,
} from './productRepository';

import { createCacheManager } from '../utils/cacheManager';

// ── Supplement-specific Cache ─────────────────────────────────────────────────
const SUPP_CACHE_KEY = 'regenpept_supplements_cache';
const SUPP_CACHE_TTL_MS = 60 * 60 * 1000; // 60 min

const cache = createCacheManager(SUPP_CACHE_KEY, SUPP_CACHE_TTL_MS);

export function invalidateSupplementsCache() {
  cache.invalidate();
}

/**
 * Filter helper: returns true if a product is a supplement.
 */
function isSupplement(product) {
  return (
    product.type === 'supplement' ||
    product.supplementData?.migrated === true
  );
}

/**
 * Fetch ALL supplement documents (no variants). Includes all statuses.
 * Useful for admin tools and audits.
 *
 * @returns {Promise<Array>}
 */
export async function getAllSupplements() {
  try {
    const all = await getActiveProducts({ forceRefresh: true });
    return all
      .filter(isSupplement)
      .map((p) => ({ ...p, productType: 'supplement' }));
  } catch (err) {
    console.error('[supplementRepository→redirect] getAllSupplements:', err);
    throw err;
  }
}

/**
 * Fetch only active supplements (status === 'active' or missing status field).
 *
 * @returns {Promise<Array>}
 */
export async function getActiveSupplements({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = cache.read();
    if (cached) return cached;
  }
  try {
    const all = await getActiveProducts({ forceRefresh });
    const supplements = all
      .filter(isSupplement)
      .map((p) => ({ ...p, productType: 'supplement' }));
    cache.write(supplements);
    return supplements;
  } catch (err) {
    console.error('[supplementRepository→redirect] getActiveSupplements:', err);
    throw err;
  }
}

/**
 * Fetch a single supplement by its slug (document ID).
 *
 * @param {string} slug - e.g. 'ashwagandha', 'co-q10'
 * @returns {Promise<Object|null>}
 */
export async function getSupplementBySlug(slug) {
  try {
    const product = await getProduct(slug);
    if (!product) return null;
    return { ...product, productType: 'supplement' };
  } catch (err) {
    console.error('[supplementRepository→redirect] getSupplementBySlug:', err);
    throw err;
  }
}

/**
 * Fetch all variants for a given supplement slug.
 * Now reads from products/{slug}/variants subcollection.
 *
 * @param {string} supplementSlug - e.g. 'ashwagandha'
 * @returns {Promise<Array>}
 */
export async function getSupplementVariants(supplementSlug) {
  try {
    const productWithVariants = await getProductWithVariants(supplementSlug);
    if (!productWithVariants) return [];
    return (productWithVariants.variants || []).map((v) => ({
      ...v,
      productType: 'supplement',
    }));
  } catch (err) {
    console.error('[supplementRepository→redirect] getSupplementVariants:', err);
    throw err;
  }
}

/**
 * Fetch a single supplement with ALL its variants merged in.
 * Convenience function for detail pages.
 *
 * @param {string} slug
 * @returns {Promise<Object|null>} supplement doc with `variants` array attached
 */
export async function getSupplementWithVariants(slug) {
  try {
    const product = await getProductWithVariants(slug);
    if (!product) return null;
    return { ...product, productType: 'supplement' };
  } catch (err) {
    console.error('[supplementRepository→redirect] getSupplementWithVariants:', err);
    throw err;
  }
}

/**
 * Fetch all active supplements that include a specific wellness goal.
 *
 * @param {string} goalId - one of the 7 canonical goal IDs
 * @returns {Promise<Array>}
 */
export async function getSupplementsByGoal(goalId) {
  try {
    const all = await getActiveSupplements();
    return all.filter((s) => s.goals?.includes(goalId));
  } catch (err) {
    console.error('[supplementRepository→redirect] getSupplementsByGoal:', err);
    throw err;
  }
}

/**
 * Fetch all active supplements in a specific category.
 *
 * @param {string} category
 * @returns {Promise<Array>}
 */
export async function getSupplementsByCategory(category) {
  try {
    const all = await getActiveSupplements();
    return all.filter(
      (s) => s.category?.toLowerCase() === category?.toLowerCase()
    );
  } catch (err) {
    console.error('[supplementRepository→redirect] getSupplementsByCategory:', err);
    throw err;
  }
}

/**
 * Client-side search: filters active supplements by name, desc, or tags.
 *
 * @param {string} searchTerm
 * @returns {Promise<Array>}
 */
export async function searchSupplements(searchTerm) {
  const lower = (searchTerm || '').toLowerCase().trim();
  if (!lower) return getActiveSupplements();

  try {
    const all = await getActiveSupplements();
    return all.filter(
      (s) =>
        s.name?.toLowerCase().includes(lower) ||
        s.desc?.toLowerCase().includes(lower) ||
        s.tags?.some((t) => t.toLowerCase().includes(lower))
    );
  } catch (err) {
    console.error('[supplementRepository→redirect] searchSupplements:', err);
    throw err;
  }
}

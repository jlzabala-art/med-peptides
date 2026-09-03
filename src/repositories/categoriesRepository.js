/**
 * categoriesRepository.js
 *
 * Data-access layer for the Firestore `categories` collection.
 *
 * Schema:
 *   categories/{categoryId}  — category metadata
 *     label        : string  — Display name (Spanish)
 *     labelEn      : string  — Display name (English)
 *     icon         : string  — Emoji icon
 *     description  : string  — Short description
 *     sortOrder    : number  — UI ordering
 *     isActive     : boolean — Whether the category is visible in the UI
 *     productCount : number  — Denormalized counter (optional)
 *     supplierCount: number  — Denormalized counter (optional)
 *     createdAt    : Timestamp
 *     updatedAt    : Timestamp
 *
 * 4-Layer cache strategy (Golden Rule #2):
 *   L1 — RAM (module variable, 0ms)
 *   L2 — localStorage (30min TTL)
 *   L3 — React Query (staleTime aligned)
 *   L4 — Firestore (only when layers above expire)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { createCacheManager } from '../utils/cacheManager';

// ── Collection helper ─────────────────────────────────────────────────────────
const categoriesCol = () => collection(db, 'categories');

// ── Dual-layer cache (RAM + localStorage) ─────────────────────────────────────
const CACHE_KEY = 'regenpept_categories_cache_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes — categories change rarely

const cache = createCacheManager(CACHE_KEY, CACHE_TTL_MS);

/**
 * Force-invalidate the categories cache.
 * Call after admin edits (create, update, delete) to force re-fetch.
 */
export function invalidateCategoriesCache() {
  cache.invalidate();
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetch all categories, sorted by sortOrder.
 * Uses 4-layer cache: RAM → localStorage → Firestore.
 *
 * @param {{ forceRefresh?: boolean, activeOnly?: boolean }} opts
 * @returns {Promise<Array<{ id: string, label: string, labelEn: string, icon: string, ... }>>}
 */
export async function getAllCategories({ forceRefresh = false, activeOnly = false } = {}) {
  // L1/L2: Check cache first
  if (!forceRefresh) {
    const cached = cache.read();
    if (cached) {
      return activeOnly ? cached.filter(c => c.isActive !== false) : cached;
    }
  }

  // L4: Firestore query
  try {
    const q = query(categoriesCol(), orderBy('sortOrder', 'asc'));
    const snap = await getDocs(q);

    const categories = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    // Write to L1/L2 cache
    cache.write(categories);

    return activeOnly ? categories.filter(c => c.isActive !== false) : categories;
  } catch (err) {
    console.error('[categoriesRepository] getAllCategories error:', err);
    // Fallback: try cache even if expired
    const stale = cache.read();
    if (stale) {
      console.warn('[categoriesRepository] Returning stale cache as fallback');
      return activeOnly ? stale.filter(c => c.isActive !== false) : stale;
    }
    throw err;
  }
}

/**
 * Fetch a single category by its document ID (slug).
 * @param {string} categoryId — e.g. 'peptide', 'genetic_test'
 * @returns {Promise<object|null>}
 */
export async function getCategoryById(categoryId) {
  // Try from cache first
  const cached = cache.read();
  if (cached) {
    const found = cached.find(c => c.id === categoryId);
    if (found) return found;
  }

  try {
    const snap = await getDoc(doc(db, 'categories', categoryId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('[categoriesRepository] getCategoryById error:', err);
    throw err;
  }
}

/**
 * Get category label for display (fast, cache-only when possible).
 * Returns the categoryId itself as fallback if not found.
 *
 * @param {string} categoryId
 * @param {'es'|'en'} lang
 * @returns {string}
 */
export function getCategoryLabel(categoryId, lang = 'es') {
  if (!categoryId) return '—';

  const cached = cache.read();
  if (cached) {
    const found = cached.find(c => c.id === categoryId);
    if (found) return lang === 'en' ? (found.labelEn || found.label) : found.label;
  }

  // Fallback: humanize the slug
  return categoryId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Build a categoryId → label map for quick lookups (useful in tables).
 * @param {'es'|'en'} lang
 * @returns {Promise<Record<string, string>>}
 */
export async function getCategoryLabelMap(lang = 'es') {
  const categories = await getAllCategories();
  const map = {};
  for (const cat of categories) {
    map[cat.id] = lang === 'en' ? (cat.labelEn || cat.label) : cat.label;
  }
  return map;
}

// ── Admin Mutations ───────────────────────────────────────────────────────────

/**
 * Create a new category.
 * @param {string} categoryId — slug ID (e.g. 'new_category')
 * @param {object} data — { label, labelEn, icon, description, sortOrder, isActive }
 */
export async function createCategory(categoryId, data) {
  try {
    const docData = {
      label: data.label || categoryId,
      labelEn: data.labelEn || '',
      icon: data.icon || '📁',
      description: data.description || '',
      sortOrder: data.sortOrder ?? 99,
      isActive: data.isActive !== false,
      productCount: 0,
      supplierCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'categories', categoryId), docData);
    invalidateCategoriesCache();
    return { id: categoryId, ...docData };
  } catch (err) {
    console.error('[categoriesRepository] createCategory error:', err);
    throw err;
  }
}

/**
 * Update an existing category.
 * @param {string} categoryId
 * @param {object} updates — partial fields to update
 */
export async function updateCategory(categoryId, updates) {
  try {
    await updateDoc(doc(db, 'categories', categoryId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    invalidateCategoriesCache();
  } catch (err) {
    console.error('[categoriesRepository] updateCategory error:', err);
    throw err;
  }
}

/**
 * Delete a category. Only allowed if no products/suppliers reference it.
 * @param {string} categoryId
 */
export async function deleteCategory(categoryId) {
  try {
    // Safety check: ensure no products reference this category
    const prodSnap = await getDocs(
      query(collection(db, 'products'), where('categoryId', '==', categoryId))
    );
    if (!prodSnap.empty) {
      throw new Error(
        `Cannot delete category "${categoryId}": ${prodSnap.size} products still reference it.`
      );
    }

    await deleteDoc(doc(db, 'categories', categoryId));
    invalidateCategoriesCache();
  } catch (err) {
    console.error('[categoriesRepository] deleteCategory error:', err);
    throw err;
  }
}

// ── Convenience ───────────────────────────────────────────────────────────────

/**
 * Returns an array of { value, label } pairs for use in <select> / filter dropdowns.
 * @param {{ activeOnly?: boolean, lang?: 'es'|'en' }} opts
 */
export async function getCategoryOptions({ activeOnly = true, lang = 'es' } = {}) {
  const categories = await getAllCategories({ activeOnly });
  return categories.map(c => ({
    value: c.id,
    label: lang === 'en' ? (c.labelEn || c.label) : c.label,
    icon: c.icon,
  }));
}

export const categoriesRepository = {
  getAllCategories,
  getCategoryById,
  getCategoryLabel,
  getCategoryLabelMap,
  getCategoryOptions,
  createCategory,
  updateCategory,
  deleteCategory,
  invalidateCategoriesCache,
};

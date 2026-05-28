 
/**
 * navigationRepository.js
 *
 * Fetches and caches navigation metadata from Firestore.
 * Data is loaded ONCE per session — never on hover.
 *
 * Sources:
 *   blueprints/{id}.metadata.category        → categories[]
 *   blueprints/{id}.metadata.primary_goal    → goals[]
 *   blueprints/{id}.metadata.primary_condition → conditions[]
 *   products/{id}.category                   → categories[] (merged)
 *
 * Slug rules: lowercase, spaces→"-", remove special chars.
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';

// ── In-memory session cache ───────────────────────────────────────────────────
let menuCache = null;
let fetchPromise = null;

// ── Slug helper ───────────────────────────────────────────────────────────────
export function toSlug(value) {
  if (!value || typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ── Extract unique sorted list, max N items ───────────────────────────────────
function uniqueSorted(arr, max = 8) {
  return [...new Set(arr.filter(Boolean).map(s => String(s).trim()))]
    .sort((a, b) => a.localeCompare(b))
    .slice(0, max);
}

// ── Core fetch (runs once) ────────────────────────────────────────────────────
async function fetchNavigationMetadata() {
  const categoriesRaw = [];
  const goalsRaw = [];
  const conditionsRaw = [];

  try {
    // ── Blueprints (protocols) ────────────────────────────────────────────────
    const blueprintSnap = await getDocs(collection(db, 'protocols'));
    blueprintSnap.forEach((doc) => {
      const data = doc.data();
      const meta = data.metadata || {};
      if (meta.category) categoriesRaw.push(meta.category);
      if (meta.primary_goal) goalsRaw.push(meta.primary_goal);
      if (meta.primary_condition) conditionsRaw.push(meta.primary_condition);
    });
  } catch (err) {
    console.warn('[navigationRepository] blueprints fetch failed:', err);
  }

  try {
    // ── Products ─────────────────────────────────────────────────────────────
    const productSnap = await getDocs(collection(db, 'products'));
    productSnap.forEach((doc) => {
      const data = doc.data();
      if (data.category) categoriesRaw.push(data.category);
    });
  } catch (err) {
    console.warn('[navigationRepository] products fetch failed:', err);
  }

  const categories = uniqueSorted(categoriesRaw, 8).map(label => ({
    label,
    slug: toSlug(label),
    path: `/collection/${toSlug(label)}`,
  }));

  const goals = uniqueSorted(goalsRaw, 8).map(label => ({
    label,
    slug: toSlug(label),
    path: `/collection/protocols?goal=${toSlug(label)}`,
  }));

  const conditions = uniqueSorted(conditionsRaw, 8).map(label => ({
    label,
    slug: toSlug(label),
    path: `/collection/protocols?search=${encodeURIComponent(label)}`,
  }));

  return { categories, goals, conditions };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns cached navigation metadata.
 * Fetches from Firestore on first call; subsequent calls return cache instantly.
 *
 * @returns {Promise<{ categories: Array, goals: Array, conditions: Array }>}
 */
export async function getNavigationMetadata() {
  if (menuCache) return menuCache;

  // Prevent duplicate parallel fetches
  if (!fetchPromise) {
    fetchPromise = fetchNavigationMetadata()
      .then(data => {
        menuCache = data;
        fetchPromise = null;
        return data;
      })
      .catch(err => {
        fetchPromise = null;
        console.error('[navigationRepository] fetch error:', err);
        return { categories: [], goals: [], conditions: [] };
      });
  }

  return fetchPromise;
}

/**
 * Force-clears cache (e.g. after admin edits).
 */
export function clearNavigationCache() {
  menuCache = null;
  fetchPromise = null;
}

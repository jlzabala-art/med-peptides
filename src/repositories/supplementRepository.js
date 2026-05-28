/* eslint-disable no-unused-vars */
/**
 * supplementRepository.js
 *
 * Single data-access layer for the Firestore `supplements` collection.
 *
 * Schema:
 *   supplements/{supplementSlug}          — one document per unique supplement name
 *     variants/{variantSlug}              — one document per SKU (dosage × quantity)
 *
 * Goals field (on the supplement doc):
 *   goals: string[]  — canonical wellness goals, matching the 7 GoalEntryFlow goals:
 *     'Recovery & Repair' | 'Metabolic & Weight' | 'Longevity & Anti-Aging' |
 *     'Cognitive & Mood'  | 'Sleep & Circadian'  | 'Hormonal Optimization'  |
 *     'Immune Support'
 *
 * ─ All callers must import from this module — never query Firestore directly.
 * ─ Firestore is the source of truth. src/data/supplements.js is editorial only.
 * ─ Run `node scripts/seedSupplementsToFirestore.mjs` to push edits to production.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

// ── Collection helpers ────────────────────────────────────────────────────────
const supplementsCol  = ()               => collection(db, 'supplements');
const variantsCol     = (supplementSlug) => collection(db, 'supplements', supplementSlug, 'variants');

// ── Supplement-level queries ──────────────────────────────────────────────────

/**
 * Fetch ALL supplement documents (no variants). Includes all statuses.
 * Useful for admin tools and audits.
 *
 * @returns {Promise<Array>}
 */
export async function getAllSupplements() {
  try {
    const snap = await getDocs(supplementsCol());
    return snap.docs.map((d) => ({ productType: 'supplement', id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[supplementRepository] getAllSupplements:', err);
    throw err;
  }
}

/**
 * Fetch only active supplements (status === 'active' or missing status field).
 *
 * @returns {Promise<Array>}
 */
export async function getActiveSupplements() {
  try {
    const snap = await getDocs(supplementsCol());
    const all = snap.docs.map((d) => ({ productType: 'supplement', id: d.id, ...d.data() }));
    return all.filter((s) => !s.status || s.status === 'active');
  } catch (err) {
    console.error('[supplementRepository] getActiveSupplements:', err);
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
    const docRef = doc(db, 'supplements', slug);
    const snap   = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { productType: 'supplement', id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('[supplementRepository] getSupplementBySlug:', err);
    throw err;
  }
}

/**
 * Fetch all variants for a given supplement slug.
 * Variants represent individual SKUs (dosage × quantity combinations).
 *
 * @param {string} supplementSlug - e.g. 'ashwagandha'
 * @returns {Promise<Array>}
 */
export async function getSupplementVariants(supplementSlug) {
  try {
    const snap = await getDocs(variantsCol(supplementSlug));
    // Variants inherit the supplement productType so cart / routing logic stays consistent
    return snap.docs.map((d) => ({ productType: 'supplement', id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[supplementRepository] getSupplementVariants:', err);
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
  const [supplement, variants] = await Promise.all([
    getSupplementBySlug(slug),
    getSupplementVariants(slug),
  ]);
  if (!supplement) return null;
  return { ...supplement, variants };
}

/**
 * Fetch all active supplements that include a specific wellness goal.
 *
 * @param {string} goalId - one of the 7 canonical goal IDs
 * @returns {Promise<Array>}
 */
export async function getSupplementsByGoal(goalId) {
  try {
    const all    = await getActiveSupplements();
    return all.filter((s) => Array.isArray(s.goals) && s.goals.includes(goalId));
  } catch (err) {
    console.error('[supplementRepository] getSupplementsByGoal:', err);
    throw err;
  }
}

/**
 * Fetch all active supplements in a given category.
 *
 * @param {string} category - e.g. 'Longevity', 'Antioxidants'
 * @returns {Promise<Array>}
 */
export async function getSupplementsByCategory(category) {
  try {
    const all = await getActiveSupplements();
    return all.filter((s) => s.category === category);
  } catch (err) {
    console.error('[supplementRepository] getSupplementsByCategory:', err);
    throw err;
  }
}

/**
 * Search supplements by text across name, desc, semanticKeywords.
 * Client-side filter — works without composite Firestore indexes.
 *
 * @param {string} searchText
 * @returns {Promise<Array>}
 */
export async function searchSupplements(searchText) {
  const lower = (searchText || '').toLowerCase().trim();
  if (!lower) return getActiveSupplements();

  try {
    const all = await getActiveSupplements();
    return all.filter((s) => {
      const fields = [
        s.name,
        s.desc,
        s.category,
        ...(s.semanticKeywords || []),
        ...(s.synonyms || []),
        ...(s.tags || []),
      ].map((f) => (f || '').toLowerCase());
      return fields.some((f) => f.includes(lower));
    });
  } catch (err) {
    console.error('[supplementRepository] searchSupplements:', err);
    throw err;
  }
}

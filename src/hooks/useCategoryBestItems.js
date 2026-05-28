 
/**
 * useCategoryBestItems.js
 *
 * Shared data hook for TrendingProtocols and TrendingPeptides.
 *
 * Fetches every document in a Firestore collection, groups them by
 * `category_main` (fallback: `category`, then 'General'), selects the
 * single best item per category using the ranking priority below, and
 * returns the full sorted list plus a convenience slice for the first page.
 *
 * Ranking priority (all DESC):
 *   1. usage_score
 *   2. view_count
 *   3. search_count
 *   4. updated_at
 *
 * @param {string} collectionName  - Firestore collection to query ('protocols' | 'peptides')
 * @param {string} [idField]       - Field to use as the item's unique ID.
 *                                   Defaults to `collectionName.slice(0,-1) + '_id'`
 *                                   e.g. 'protocol_id' for 'protocols', 'peptide_id' for 'peptides'.
 *                                   Falls back to the Firestore doc.id when the field is absent.
 *
 * @returns {{
 *   allItems: Array<{ category: string, item: object, totalInCategory: number }>,
 *   loading:  boolean,
 * }}
 *
 * Usage:
 *   const { allItems, loading } = useCategoryBestItems('protocols');
 *   const { allItems, loading } = useCategoryBestItems('peptides', 'peptide_id');
 *
 * `allItems` is sorted by the number of items in each category (DESC) so the
 * richest categories appear first. Callers slice allItems to implement pagination.
 */

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

// ── Ranking helper ────────────────────────────────────────────────────────────

/** Convert a Firestore Timestamp, ISO string, or epoch number to ms. */
function toMs(val) {
  if (!val) return 0;
  if (typeof val.toDate === 'function') return val.toDate().getTime();
  const t = new Date(val).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Return the single highest-ranked item from an array of docs.
 * Priority: usage_score → view_count → search_count → updated_at (all DESC).
 */
function pickBest(docs) {
  if (!docs || docs.length === 0) return null;

  return docs.reduce((best, candidate) => {
    // 1. usage_score
    const uC = candidate.usage_score ?? 0;
    const uB = best.usage_score ?? 0;
    if (uC !== uB) return uC > uB ? candidate : best;

    // 2. view_count
    const vC = candidate.view_count ?? 0;
    const vB = best.view_count ?? 0;
    if (vC !== vB) return vC > vB ? candidate : best;

    // 3. search_count
    const sC = candidate.search_count ?? 0;
    const sB = best.search_count ?? 0;
    if (sC !== sB) return sC > sB ? candidate : best;

    // 4. updated_at
    return toMs(candidate.updated_at) > toMs(best.updated_at) ? candidate : best;
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCategoryBestItems(collectionName, idField) {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading]   = useState(true);

  // Derive the default id field from the collection name:
  // 'protocols' → 'protocol_id', 'peptides' → 'peptide_id'
  const resolvedIdField =
    idField || `${collectionName.replace(/s$/, '')}_id`;

  useEffect(() => {
    let cancelled = false;

    getDocs(collection(db, collectionName))
      .then((snap) => {
        if (cancelled) return;

        // ── 1. Group docs by category ────────────────────────────────────────
        /** @type {Map<string, object[]>} */
        const groups = new Map();

        snap.docs.forEach((docSnap) => {
          const raw  = docSnap.data();
          // Normalise the id field: prefer explicit field, fallback to doc.id
          const data = {
            ...raw,
            [resolvedIdField]: raw[resolvedIdField] || raw.slug || docSnap.id,
          };

          const cat =
            data.category_main ||
            data.category      ||
            'General';

          if (!groups.has(cat)) groups.set(cat, []);
          groups.get(cat).push(data);
        });

        // ── 2. Pick 1 best per category; sort categories by count DESC ───────
        const result = Array.from(groups.entries())
          .map(([cat, docs]) => {
            const best = pickBest(docs);
            if (!best) return null;

            // Ensure the item carries a normalised category string
            best.category = best.category_main || best.category || cat;

            return {
              category:          cat,
              item:              best,
              totalInCategory:   docs.length,
            };
          })
          .filter(Boolean)
          // Most-populated categories first for a richer first page
          .sort((a, b) => b.totalInCategory - a.totalInCategory);

        setAllItems(result);
      })
      .catch((err) => {
        // Log the code (not the full error) to avoid noisy stack traces
        console.warn(`[useCategoryBestItems(${collectionName})] Firestore error:`, err.code ?? err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [collectionName, resolvedIdField]);

  return { allItems, loading };
}

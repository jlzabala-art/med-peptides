/**
 * useCategories — Firestore `categories` collection reader
 *
 * Single source of truth for category metadata (id, labelEn, icon, sortOrder).
 * Uses a 3-layer cache (module RAM → localStorage → Firestore) to avoid
 * re-fetching on every navigation between admin modules.
 *
 * Usage:
 *   const { categories, getCategoryLabel } = useCategories();
 *   // categories  → [{ id, labelEn, label, icon, sortOrder }, ...]
 *   // getCategoryLabel('peptide') → 'Peptides'
 */
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes
const LS_KEY = '__rg_categories_cache';

// Module-level cache — survives component unmount/remount within the same session
let _cache = { data: null, ts: 0 };

export function useCategories() {
  const [categories, setCategories] = useState(_cache.data || []);
  const [loading, setLoading]       = useState(!_cache.data);

  useEffect(() => {
    const now = Date.now();

    // Layer 1: in-memory (instant, 0 network)
    if (_cache.data && (now - _cache.ts) < CACHE_TTL_MS) {
      setCategories(_cache.data);
      setLoading(false);
      return;
    }

    // Layer 2: localStorage (survives page reload)
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (now - parsed.ts) < CACHE_TTL_MS) {
            _cache = { data: parsed.data, ts: parsed.ts };
            setCategories(parsed.data);
            setLoading(false);
            return;
          }
        }
      } catch (_) { /* corrupt cache — ignore */ }
    }

    // Layer 3: Firestore (cold fetch)
    async function fetchCategories() {
      setLoading(true);
      try {
        const q    = query(collection(db, 'categories'), orderBy('sortOrder', 'asc'));
        const snap = await getDocs(q);
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          // Only show active categories in filters
          .filter(c => c.isActive !== false);

        _cache = { data: list, ts: Date.now() };
        if (typeof window !== 'undefined') {
          localStorage.setItem(LS_KEY, JSON.stringify({ data: list, ts: Date.now() }));
        }
        setCategories(list);
      } catch (err) {
        console.error('useCategories: fetch failed', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  /**
   * Resolve a category ID to its English display label.
   * Returns the raw ID if no match found (safe fallback).
   */
  const getCategoryLabel = (id) => {
    if (!id) return '';
    const cat = categories.find(c => c.id === id);
    return cat?.labelEn || cat?.label || id;
  };

  /**
   * Convert an array of category IDs → MultiSelectFilter options array.
   * Filters to only IDs that exist in the collection; sorts by sortOrder.
   */
  const toFilterOptions = (ids = []) =>
    ids
      .map(id => {
        const cat = categories.find(c => c.id === id);
        return cat
          ? { label: cat.labelEn || cat.label, value: cat.id }
          : { label: id, value: id }; // unknown ID: show as-is
      })
      .sort((a, b) => a.label.localeCompare(b.label));

  /** All active categories as MultiSelectFilter options, sorted by sortOrder. */
  const allOptions = categories.map(c => ({
    label: c.labelEn || c.label,
    value: c.id,
    icon:  c.icon,
  }));

  return { categories, loading, getCategoryLabel, toFilterOptions, allOptions };
}

/** Invalidate cache — call after writing to the categories collection */
export function invalidateCategoriesCache() {
  _cache = { data: null, ts: 0 };
  if (typeof window !== 'undefined') localStorage.removeItem(LS_KEY);
}

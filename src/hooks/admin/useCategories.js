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

function getInitialCategories() {
  const now = Date.now();
  if (_cache.data && (now - _cache.ts) < CACHE_TTL_MS) {
    return _cache.data;
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (now - parsed.ts) < CACHE_TTL_MS) {
          _cache = { data: parsed.data, ts: parsed.ts };
          return parsed.data;
        }
      }
    } catch { /* corrupt cache — ignore */ }
  }
  return [];
}

export function useCategories() {
  const [categories, setCategories] = useState(getInitialCategories);
  const [loading, setLoading]       = useState(() => getInitialCategories().length === 0);

  useEffect(() => {
    const now = Date.now();
    if (_cache.data && (now - _cache.ts) < CACHE_TTL_MS) {
      return;
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

  const CATEGORY_ALIASES = {
    'api_raw_material': 'raw_material',
    'api_raw_materials': 'raw_material',
    'Aesthetic Injectables': 'aesthetic_injectables',
    'skincare': 'cosmetics',
    'service': 'corporate_services',
    'logistics_service': 'corporate_services',
    'medical_supplies': 'clinical_supplies',
    'diagnostic': 'diagnostic_test',
  };

  const DEFAULT_CATEGORY_STYLES = {
    peptide:               { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: '💊' },
    raw_material:          { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: '⚗️' },
    aesthetic_injectables: { bg: '#faf5ff', color: '#7c3aed', border: '#c4b5fd', icon: '💉' },
    diagnostic_test:       { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: '🩸' },
    genomics_biomarkers:   { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe', icon: '🧬' },
    nutricosmetics:        { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: '🌿' },
    cosmetics:             { bg: '#f0fdfa', color: '#0d9488', border: '#5eead4', icon: '🧴' },
    clinical_supplies:     { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', icon: '🩺' },
    iv_drips:              { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4', icon: '💧' },
    corporate_services:    { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff', icon: '💼' },
    supplement:            { bg: '#fffbeb', color: '#b45309', border: '#fde68a', icon: '💎' },
    compounding_material:  { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8', icon: '🧪' },
    hormone:               { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5', icon: '⚡' },
  };

  /**
   * Resolve a category ID to its English display label.
   */
  const getCategoryLabel = (id) => {
    if (!id) return '';
    const normId = CATEGORY_ALIASES[id] || id;
    const cat = categories.find(c => c.id === normId || c.id === id);
    if (cat?.labelEn || cat?.label) return cat.labelEn || cat.label;
    return normId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  /**
   * Get semantic badge configuration (icon, colors, label)
   */
  const getCategoryConfig = (id) => {
    const normId = CATEGORY_ALIASES[id] || id;
    const cat = categories.find(c => c.id === normId || c.id === id);
    const style = DEFAULT_CATEGORY_STYLES[normId] || {
      bg: '#f8fafc', color: '#475569', border: '#e2e8f0', icon: cat?.icon || '📦'
    };
    return {
      id: normId,
      rawId: id,
      label: cat?.labelEn || cat?.label || normId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: cat?.icon || style.icon,
      bg: style.bg,
      color: style.color,
      border: style.border
    };
  };

  /**
   * Convert an array of category IDs → MultiSelectFilter options array.
   * Filters to only IDs that exist in the collection; sorts by sortOrder.
   */
  const toFilterOptions = (ids = []) =>
    ids
      .map(id => {
        const normId = CATEGORY_ALIASES[id] || id;
        const cat = categories.find(c => c.id === normId || c.id === id);
        return {
          label: cat?.labelEn || cat?.label || normId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: normId
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

  /** All active categories as MultiSelectFilter options, sorted by sortOrder. */
  const allOptions = categories.map(c => ({
    label: c.labelEn || c.label,
    value: c.id,
    icon:  c.icon,
  }));

  return { categories, loading, getCategoryLabel, getCategoryConfig, toFilterOptions, allOptions };
}

/** Invalidate cache — call after writing to the categories collection */
export function invalidateCategoriesCache() {
  _cache = { data: null, ts: 0 };
  if (typeof window !== 'undefined') localStorage.removeItem(LS_KEY);
}

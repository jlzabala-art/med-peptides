import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CATEGORY_SUBCATEGORIES } from '../../../../config/categories';
import { useCategories } from '../../../../hooks/admin/useCategories';
import { PRESENTATION_LABELS } from '../../../../constants/presentationTypes';
import { CLINICAL_GOALS, getGoalLabel } from '../../../../config/goals';

export function useCatalogUrlFilters({ supplierIdToName = {} } = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { getCategoryLabel } = useCategories();

  // Multi-value URL params parser
  const parseMultiParam = useCallback((key, fallback = []) => {
    const raw = searchParams.get(key);
    if (!raw || raw === 'all') return fallback;
    try {
      const decoded = decodeURIComponent(raw);
      return decoded.split(/,|%2C/).map(s => s.trim()).filter(Boolean);
    } catch {
      return fallback;
    }
  }, [searchParams]);

  const updateUrlParam = useCallback((key, val) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const setMultiParam = useCallback((key, values) => {
    const uniqueVals = Array.from(new Set(values));
    updateUrlParam(key, uniqueVals.length > 0 ? uniqueVals.join(',') : '');
  }, [updateUrlParam]);

  const filterCategory     = parseMultiParam('category');     // string[]
  const filterSubcategory  = parseMultiParam('subcategory');  // string[]
  const filterGoals        = parseMultiParam('goals');        // string[]
  const filterFormatId     = parseMultiParam('formatId');     // string[] legacy
  const filterPresentation = parseMultiParam('presentation'); // string[] NEW indexed
  const filterSupplier     = parseMultiParam('supplier');     // string[]
  const filterProductType  = parseMultiParam('productType');  // string[]
  const filterTags         = parseMultiParam('tag');          // string[]
  const filterTagMode      = searchParams.get('tagMode') || 'any'; // 'any' | 'all'
  const filterPriority     = searchParams.get('priority') || 'all'; // string

  const rawUrlStatus = parseMultiParam('status');
  const urlStatus = rawUrlStatus.map(s => (s === 'published' ? 'active' : s)).filter(Boolean);
  const filterStatus = urlStatus.length > 0 ? urlStatus : ['active'];

  const filterAvailability = searchParams.get('availability') || '';
  const filterQuality      = searchParams.get('quality') || 'all';
  const filterTimeframe    = searchParams.get('timeframe') || (searchParams.get('filter') === 'recent_import' ? 'recent_import' : '');
  const searchQueryParam   = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(searchQueryParam);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchQueryParam);

  // Synchronize debounced search with URL and localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== (searchParams.get('q') || '')) {
        const params = new URLSearchParams(window.location.search);
        if (searchTerm) params.set('q', searchTerm);
        else params.delete('q');
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        
        try {
          const currentPrefs = JSON.parse(localStorage.getItem('regenpept-admin-catalog-prefs') || '{}');
          currentPrefs['q'] = searchTerm;
          localStorage.setItem('regenpept-admin-catalog-prefs', JSON.stringify(currentPrefs));
        } catch (err) {}
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, searchParams, pathname, router]);

  // Dynamically compute available subcategories based on selected categories
  const availableSubcategories = useMemo(() => {
    let subcats = [];
    if (filterCategory.length === 0) {
      subcats = Object.values(CATEGORY_SUBCATEGORIES).flat();
    } else {
      subcats = filterCategory.flatMap(cat => CATEGORY_SUBCATEGORIES[cat] || []);
    }
    const unique = [];
    const seen = new Set();
    subcats.forEach(s => {
      if (!seen.has(s.value)) {
        seen.add(s.value);
        unique.push(s);
      }
    });
    return unique;
  }, [filterCategory]);

  // Deselect subcategories that are no longer valid
  useEffect(() => {
    if (filterCategory.length > 0 && filterSubcategory.length > 0) {
      const validValues = new Set(availableSubcategories.map(s => s.value));
      const newSubs = filterSubcategory.filter(sub => validValues.has(sub));
      if (newSubs.length !== filterSubcategory.length) {
        setMultiParam('subcategory', newSubs);
      }
    }
  }, [filterCategory, availableSubcategories, filterSubcategory, setMultiParam]);

  // Clean legacy 'published' param from URL if present
  useEffect(() => {
    const stParam = searchParams.get('status');
    if (stParam && stParam.includes('published')) {
      const params = new URLSearchParams(window.location.search);
      const cleaned = stParam.split(',').map(s => s.trim() === 'published' ? 'active' : s.trim()).filter(Boolean);
      if (cleaned.length === 1 && cleaned[0] === 'active') {
        params.delete('status');
      } else {
        params.set('status', cleaned.join(','));
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    try {
      localStorage.removeItem('regenpept-admin-catalog-prefs');
      localStorage.removeItem('regenpept_recent_imported');
    } catch (e) {}
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  // Active filter chips array for DataTable
  const filterChips = useMemo(() => {
    return [
      ...filterProductType.map(val => ({
        key: `productType-${val}`,
        label: 'Product Type',
        value: val === 'api_raw_material' ? 'API / Raw Material' : val === 'finished_product' ? 'Finished Product' : val === 'clinical_supply' ? 'Clinical Supply' : val,
        onRemove: () => setMultiParam('productType', filterProductType.filter(v => v !== val))
      })),
      ...filterStatus.filter(v => v !== 'active' && v !== 'published').map(val => ({
        key: `status-${val}`,
        label: 'Status',
        value: val === 'archived' ? 'Archived' : val === 'draft' ? 'Draft' : val,
        onRemove: () => setMultiParam('status', filterStatus.filter(v => v !== val))
      })),
      ...filterCategory.map(val => ({
        key: `category-${val}`,
        label: 'Category',
        value: getCategoryLabel(val) || val,
        onRemove: () => setMultiParam('category', filterCategory.filter(v => v !== val))
      })),
      ...filterSubcategory.map(val => ({
        key: `subcategory-${val}`,
        label: 'Subcategory',
        value: val,
        onRemove: () => setMultiParam('subcategory', filterSubcategory.filter(v => v !== val))
      })),
      ...filterGoals.map(val => ({
        key: `goals-${val}`,
        label: 'Goal',
        value: getGoalLabel(val) || val,
        onRemove: () => setMultiParam('goals', filterGoals.filter(v => v !== val))
      })),
      ...filterPresentation.map(val => ({
        key: `presentation-${val}`,
        label: 'Presentation',
        value: PRESENTATION_LABELS[val] || val,
        onRemove: () => setMultiParam('presentation', filterPresentation.filter(v => v !== val))
      })),
      ...filterSupplier.map(val => ({
        key: `supplier-${val}`,
        label: 'Supplier',
        value: supplierIdToName[val] || val,
        onRemove: () => setMultiParam('supplier', filterSupplier.filter(v => v !== val))
      })),
      ...filterTags.map(val => ({
        key: `tag-${val}`,
        label: 'Program / Tag',
        value: val === 'fagron-genomics-telotest' ? '🧬 Fagron Genomics | TeloTest' :
               val === 'fagron-genomics-trichotest' ? '🧬 Fagron Genomics | TrichoTest' :
               val === 'fagron-genomics-nutrigen' ? '🧬 Fagron Genomics | NutriGen' : val,
        onRemove: () => {
          const remaining = filterTags.filter(v => v !== val);
          setMultiParam('tag', remaining);
          if (!remaining.some(r => r.startsWith('fagron-genomics-'))) {
            updateUrlParam('priority', '');
          }
        }
      })),
      ...(filterTagMode === 'all' && filterTags.length >= 2 ? [{
        key: 'tag-mode-chip',
        label: 'Match Mode',
        value: '🎯 Match ALL (Shared Ingredients)',
        onRemove: () => updateUrlParam('tagMode', '')
      }] : []),
      ...(filterPriority && filterPriority !== 'all' ? [{
        key: 'priority-chip',
        label: 'Genomics Priority',
        value: filterPriority === 'A' ? '🟢 Priority A (First-line)' :
               filterPriority === 'B' ? '🟡 Priority B (Second-line)' :
               filterPriority === 'C' ? '🔵 Priority C (Supportive)' : filterPriority,
        onRemove: () => updateUrlParam('priority', '')
      }] : []),
      ...(filterAvailability ? [{
        key: `availability-${filterAvailability}`,
        label: 'Availability',
        value: filterAvailability === 'in_stock' ? 'Stock Confirmado' : 'Información no disponible',
        onRemove: () => updateUrlParam('availability', '')
      }] : []),
      ...(filterTimeframe ? [{
        key: 'timeframe-chip',
        label: 'Import Date',
        value: filterTimeframe === 'today' ? 'Imported Today' :
               filterTimeframe === '7d' || filterTimeframe === 'this_week' ? 'Last 7 Days' :
               filterTimeframe === '30d' || filterTimeframe === 'this_month' ? 'Last 30 Days' :
               filterTimeframe === '90d' ? 'Last 90 Days' : 'Latest Import',
        onRemove: () => {
          updateUrlParam('timeframe', '');
          const params = new URLSearchParams(window.location.search);
          params.delete('filter');
          params.delete('timeframe');
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
      }] : []),
    ].filter(Boolean);
  }, [
    filterProductType, filterStatus, filterCategory, filterSubcategory,
    filterGoals, filterPresentation, filterSupplier, filterTags,
    filterPriority, filterAvailability, filterTimeframe, supplierIdToName,
    getCategoryLabel, setMultiParam, updateUrlParam, pathname, router
  ]);

  const hasAnyFilter = Boolean(
    searchTerm ||
    filterProductType.length > 0 ||
    (filterStatus.length > 0 && !filterStatus.includes('active')) ||
    filterCategory.length > 0 ||
    filterSubcategory.length > 0 ||
    filterGoals.length > 0 ||
    filterPresentation.length > 0 ||
    filterSupplier.length > 0 ||
    filterTags.length > 0 ||
    (filterPriority && filterPriority !== 'all') ||
    filterAvailability ||
    filterTimeframe
  );

  return {
    filterCategory,
    filterSubcategory,
    availableSubcategories,
    filterGoals,
    filterFormatId,
    filterPresentation,
    filterSupplier,
    filterProductType,
    filterTags,
    filterTagMode,
    filterPriority,
    filterStatus,
    filterAvailability,
    filterQuality,
    filterTimeframe,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    updateUrlParam,
    setMultiParam,
    clearAllFilters,
    clearFilters: clearAllFilters,
    filterChips,
    hasAnyFilter
  };
}

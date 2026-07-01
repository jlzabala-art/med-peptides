import { useState, useMemo, useEffect, useCallback } from 'react';

/**
 * useDataTable
 * A comprehensive hook for managing table state including global search,
 * pagination, sorting, custom filtering, and bulk row selection.
 *
 * @param {Array}    data                  - The raw array of data to display
 * @param {Object}   options               - Configuration options
 * @param {Function} options.filterFn      - Custom filtering logic (e.g. for SmartChips)
 * @param {Array}    options.searchFields  - Keys to perform text search on (supports dot notation)
 * @param {Number}   options.initialPageSize - Default rows per page (default: 50)
 * @param {String}   options.idField       - The field name to use as unique row ID (default: 'id')
 */
export function useDataTable(data = [], options = {}) {
  const { filterFn, searchFields = [], initialPageSize = 50, idField = 'id' } = options;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortBy, setSortBy] = useState(null);
  const [sortDesc, setSortDesc] = useState(false);
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 768
  );

  // ── Bulk Selection ──────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleRowSelection = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id) => selectedIds.has(id), [selectedIds]);

  // ── Responsive listener ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Debounce search input ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // ── Reset page when data or filters change ─────────────────────────────────
  useEffect(() => {
    setPage(1);
  }, [data.length, debouncedSearch, filterFn]);

  // ── Clear selection when data changes (e.g. page reload) ──────────────────
  useEffect(() => {
    setSelectedIds(new Set());
  }, [data.length]);

  // ── Helper: resolve dot-notation paths ────────────────────────────────────
  const resolvePath = (obj, path) =>
    path.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj);

  // ── Process data: filter → search → sort ──────────────────────────────────
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Custom filtering (Smart Chips)
    if (filterFn) {
      result = result.filter(filterFn);
    }

    // 2. Text search (local fallback — Algolia overrides this externally)
    if (debouncedSearch && searchFields.length > 0) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const val = resolvePath(item, field);
          return val && String(val).toLowerCase().includes(query);
        })
      );
    }

    // 3. Sorting
    if (sortBy) {
      result.sort((a, b) => {
        const valA = resolvePath(a, sortBy);
        const valB = resolvePath(b, sortBy);
        if (valA === valB) return 0;
        if (valA == null) return sortDesc ? -1 : 1;
        if (valB == null) return sortDesc ? 1 : -1;
        const comparison = valA < valB ? -1 : 1;
        return sortDesc ? -comparison : comparison;
      });
    }

    return result;
  }, [data, filterFn, debouncedSearch, searchFields, sortBy, sortDesc]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, page, pageSize]);

  // ── Derived selection helpers ──────────────────────────────────────────────
  const allVisibleIds = paginatedData.map((item) => item[idField]).filter(Boolean);
  const isAllCurrentPageSelected =
    allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id));
  const isIndeterminate =
    !isAllCurrentPageSelected && allVisibleIds.some((id) => selectedIds.has(id));

  const toggleSelectAllCurrentPage = useCallback(() => {
    if (isAllCurrentPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allVisibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allVisibleIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [isAllCurrentPageSelected, allVisibleIds]);

  return {
    // ── Data ────────────────────────────────────────────────────────────────
    paginatedData,
    processedData,
    totalCount: processedData.length,

    // ── Search ──────────────────────────────────────────────────────────────
    search,
    setSearch,

    // ── Pagination ──────────────────────────────────────────────────────────
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,

    // ── Sorting ─────────────────────────────────────────────────────────────
    sortBy,
    setSortBy,
    sortDesc,
    setSortDesc,

    // ── Bulk Selection ──────────────────────────────────────────────────────
    selectedIds,
    selectedCount: selectedIds.size,
    isSelected,
    toggleRowSelection,
    selectAll,
    clearSelection,
    isAllCurrentPageSelected,
    isIndeterminate,
    toggleSelectAllCurrentPage,
    selectedItems: processedData.filter((item) => selectedIds.has(item[idField])),

    // ── Helpers ─────────────────────────────────────────────────────────────
    isMobileView,
  };
}

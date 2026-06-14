import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

const DEFAULT_ROWS_PER_PAGE = 20;

export const PRESET_VIEWS = [
  {
    id: 'default',
    name: 'Default View',
    filters: [],
    sortConfig: [{ key: 'importDate', direction: 'desc' }],
  },
  {
    id: 'audit',
    name: 'Review New Imports',
    filters: [{ id: 'dateRange', value: 'last7days', label: 'Imported Last 7 Days' }, { id: 'missingData', value: 'true', label: 'Missing Data' }],
    sortConfig: [{ key: 'importDate', direction: 'desc' }],
  },
  {
    id: 'missing-coa',
    name: 'Missing COA',
    filters: [{ id: 'missingCoa', value: 'true', label: 'Missing COA' }],
    sortConfig: [{ key: 'name', direction: 'asc' }],
  }
];

export function useCatalogFilters(items = []) {
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState([]);
  const [sortConfig, setSortConfig] = useState([{ key: 'importDate', direction: 'desc' }]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  
  const [activeViewId, setActiveViewId] = useState('default');
  const [savedViews, setSavedViews] = useState(PRESET_VIEWS);
  const [visibleColumns, setVisibleColumns] = useState(null);

  // Load custom views from Firebase
  useEffect(() => {
    let isMounted = true;
    if (user?.uid) {
      const loadViews = async () => {
        try {
          const snapshot = await getDoc(doc(db, `users/${user.uid}/catalogViews/custom`));
          if (snapshot.exists() && isMounted) {
             const data = snapshot.data();
             if (data.views) {
               setSavedViews([...PRESET_VIEWS, ...data.views]);
             }
             if (data.activeViewId) {
               applyView(data.activeViewId, [...PRESET_VIEWS, ...(data.views || [])]);
             }
          }
        } catch (err) {
          console.error("Failed to load catalog views", err);
        }
      };
      loadViews();
    }
    return () => { isMounted = false; };
  }, [user]);

  const applyView = (viewId, allViews = savedViews) => {
    const view = allViews.find(v => v.id === viewId);
    if (view) {
      setFilters(view.filters || []);
      setSortConfig(view.sortConfig || [{ key: 'importDate', direction: 'desc' }]);
      if (view.visibleColumns) setVisibleColumns(view.visibleColumns);
      setActiveViewId(viewId);
      setCurrentPage(1);
    }
  };

  const handleActiveViewChange = async (viewId) => {
    applyView(viewId);
    if (user?.uid) {
       await setDoc(doc(db, `users/${user.uid}/catalogViews/custom`), { activeViewId: viewId }, { merge: true });
    }
  };

  // Helper to check if a date is within a range
  const isDateInRange = (dateStr, rangeType) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (rangeType) {
      case 'today':
        return date >= today;
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return date >= yesterday && date < today;
      }
      case 'last7days': {
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        return date >= last7;
      }
      case 'last30days': {
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        return date >= last30;
      }
      case 'thisMonth': {
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      }
      default:
        return true;
    }
  };

  // Filtering Logic
  const filteredData = useMemo(() => {
    let result = [...items];

    // Search
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.name || '').toLowerCase().includes(lowerQ) ||
        (item.sku || '').toLowerCase().includes(lowerQ) ||
        (item.supplier || '').toLowerCase().includes(lowerQ) ||
        (item.category || '').toLowerCase().includes(lowerQ)
      );
    }

    // Advanced Filters
    if (filters.length > 0) {
      result = result.filter(item => {
        return filters.every(f => {
          if (f.id === 'dateRange') {
            return isDateInRange(item.importDate, f.value);
          }
          if (f.id === 'missingData') {
            return item.isMissingSupplier || item.isMissingPricing || item.isMissingImages || item.coa === 'Missing';
          }
          if (f.id === 'missingCoa') {
            return item.coa === 'Missing';
          }
          if (f.id === 'noSupplier') {
            return item.isMissingSupplier;
          }
          if (f.id === 'regulatoryRisk') {
            return item.gmp === 'Missing' || item.coa === 'Missing';
          }
          if (f.id === 'outOfStock') {
            return item.stock === 0;
          }
          if (f.id === 'lowStock') {
            return item.stock > 0 && item.stock <= item.reorderPoint;
          }
          if (f.id === 'activeRegistration') {
            return item.registration === 'Active';
          }
          if (f.id === 'supplier') {
             return item.supplier === f.value;
          }
          // Add other specific filter rules as needed
          return true;
        });
      });
    }

    return result;
  }, [items, searchQuery, filters]);

  // Multi-column sorting
  const sortedData = useMemo(() => {
    if (sortConfig.length === 0) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      for (const sort of sortConfig) {
        const aVal = a[sort.key];
        const bVal = b[sort.key];

        if (aVal === bVal) continue;

        let cmp = 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
           cmp = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        } else if (aVal instanceof Date || !isNaN(Date.parse(aVal))) {
           cmp = new Date(aVal) - new Date(bVal);
        } else {
           cmp = aVal < bVal ? -1 : 1;
        }
        
        if (cmp !== 0) {
           return sort.direction === 'asc' ? cmp : -cmp;
        }
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination Logic
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const loadedData = useMemo(() => {
    return sortedData.slice(0, currentPage * rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const addFilter = (filter) => {
    setFilters(prev => {
      const existing = prev.filter(p => p.id !== filter.id);
      return [...existing, filter];
    });
    setCurrentPage(1);
    setActiveViewId('custom');
  };

  const removeFilter = (filterId) => {
    setFilters(prev => prev.filter(p => p.id !== filterId));
    setCurrentPage(1);
    setActiveViewId('custom');
  };

  const updateSort = (key, direction, multi = false) => {
    setSortConfig(prev => {
      if (!multi) return [{ key, direction }];
      const existing = prev.filter(p => p.key !== key);
      return [...existing, { key, direction }];
    });
    setCurrentPage(1);
    setActiveViewId('custom');
  };

  return {
    // Data
    paginatedData,
    loadedData,
    totalItems,
    totalPages,
    
    // Search
    searchQuery,
    setSearchQuery: (q) => { setSearchQuery(q); setCurrentPage(1); },
    
    // Filters
    filters,
    addFilter,
    removeFilter,
    setFilters,
    
    // Sorting
    sortConfig,
    updateSort,
    
    // Pagination
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage: (r) => { setRowsPerPage(r); setCurrentPage(1); },
    
    // Views
    activeViewId,
    savedViews,
    handleActiveViewChange,
    
    // Columns
    visibleColumns,
    setVisibleColumns
  };
}

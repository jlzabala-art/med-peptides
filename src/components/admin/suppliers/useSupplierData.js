"use client";
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs, getDoc, updateDoc, doc, setDoc, query, limit, where, writeBatch, orderBy } from 'firebase/firestore';
import * as fb from '../../../firebase';
const db = fb?.db;
import toast from 'react-hot-toast';

// ── In-memory cache (Layer 1) ─────────────────────────────────────────────────
// Survives tab switches and component remounts. TTL: 5 minutes.
const _supplierCache = { data: null, ts: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000;

export function useSupplierData({ initialData } = {}) {
  const searchParams = useSearchParams();
  const [suppliers, setSuppliers] = useState(initialData?.suppliers || []);
  const [loading, setLoading] = useState(!initialData?.suppliers);
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '');
  const [algoliaSuppliers, setAlgoliaSuppliers] = useState(null);
  
  // Advanced Filters
  const [activeKpiFilter, setActiveKpiFilter] = useState('all'); // all, active, strategic, pending, low_response
  const [filters, setFilters] = useState({
    country: [],
    type: [], // Deprecated
    category: [],
    status: [],
    supplierIds: [],          // Multi-select: array of canonical IDs (e.g. ['supplier-bloodo'])
    hasProducts: true,        // Default: show only suppliers with products
    productCategory: [],      // Filter by product category (Peptides, DNA Test, etc.)
  });

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'companyName', direction: 'asc' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // KPIs
  const [serverKpis, setServerKpis] = useState(initialData?.kpis || { total: 0, active: 0, strategic: 0, pendingDocs: 0, lowResponse: 0, coveredCountriesCount: 6 });
  const [kpisLoading, setKpisLoading] = useState(!initialData?.kpis);

  // Fetch server-side stats (productsSupplied, variantsSupplied) from Admin SDK route.
  // This avoids downloading any product or variant documents to the client.
  const fetchServerStats = async (forceRefresh = false) => {
    try {
      const url = `/api/suppliers/stats${forceRefresh ? '?refresh=1' : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`stats API returned status ${res.status}, using local stats fallback`);
        return [];
      }
      const data = await res.json();
      return Array.isArray(data?.stats) ? data.stats : [];
    } catch (err) {
      console.warn('fetchServerStats failed, using local stats fallback:', err.message);
      return [];
    }
  };

  useEffect(() => {
    if (initialData?.kpis) return;

    async function fetchKpis() {
      setKpisLoading(true);
      try {
        // ── Read pre-computed KPIs from _meta/supplier_coverage (zero product scan) ──
        const metaSnap = await getDoc(doc(db, '_meta', 'supplier_coverage'));

        if (metaSnap.exists() && metaSnap.data()?.kpis) {
          // Server already computed everything — just read the materialized view
          setServerKpis(metaSnap.data().kpis);
        } else {
          // Fallback: _meta doc missing or old schema — trigger a lightweight API call
          const stats = await fetchServerStats();
          const activeSuppliers    = stats.filter(s => (s.productsSupplied || 0) > 0).length;
          const totalSKUs          = stats.reduce((acc, s) => acc + (s.variantsSupplied || 0), 0);
          const topEntry           = stats.reduce((best, s) =>
            (s.productsSupplied || 0) > (best?.productsSupplied || 0) ? s : best, null);
          const topSupplierShare   = topEntry && stats.length > 0
            ? Math.round((topEntry.productsSupplied / stats.reduce((a, s) => a + (s.productsSupplied || 0), 0)) * 100)
            : 0;
          const avgSkusPerSupplier = activeSuppliers > 0 ? Math.round(totalSKUs / activeSuppliers) : 0;
          setServerKpis({
            activeSuppliers, totalSKUs, topSupplierShare,
            topSupplierName: topEntry?.name || topEntry?.companyName || '',
            avgSkusPerSupplier,
          });
        }
      } catch (err) {
        console.error('Error fetching supplier KPIs:', err);
      } finally {
        setKpisLoading(false);
      }
    }
    fetchKpis();
  }, [initialData?.kpis]);


  // Fetch all suppliers from `suppliers` collection (source of truth)
  // and merge in server-computed product/variant counts.
  const fetchAllSuppliers = async (forceRefresh = false) => {
    const now = Date.now();

    // ── Layer 1: In-memory cache ──────────────────────────────────────────────
    if (!forceRefresh && _supplierCache.data && (now - _supplierCache.ts) < CACHE_TTL_MS) {
      setSuppliers(_supplierCache.data);
      setLoading(false);
      return;
    }

    // ── Layer 2: localStorage cache ───────────────────────────────────────────
    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const cachedStr = localStorage.getItem('__rg_suppliers_cache');
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          if (parsed && (now - parsed.ts) < CACHE_TTL_MS * 6) {
            _supplierCache.data = parsed.data;
            _supplierCache.ts = parsed.ts;
            setSuppliers(parsed.data);
            setLoading(false);

            // Background revalidation — keeps UI snappy
            setTimeout(() => fetchAllSuppliers(true), 500);
            return;
          }
        }
      } catch (_) { /* ignore */ }
    }

    setLoading(true);
    try {
      // ── Layer 3: Firestore `suppliers` collection ────────────────────────────
      // Only read supplier metadata docs — never download products or variants
      const q = query(collection(db, 'suppliers'), limit(200));
      const snap = await getDocs(q);
      let list = snap.docs.map(d => {
        const data = d.data();
        const rawName = data.companyName || data.name || data.displayName || data.legalName;
        const resolvedName = rawName || d.id.replace(/^supplier-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return {
          id: d.id,
          ...data,
          companyName: resolvedName,
          name: resolvedName
        };
      });

      // ── Layer 4: Merge server-side stats (products + variants per supplier) ──
      // The API route does the heavy lifting on the server using Admin SDK
      const stats = await fetchServerStats(forceRefresh);
      if (stats.length > 0) {
        const statsMap = Object.fromEntries(stats.map(s => [s.id, s]));
        list = list.map(supplier => ({
          ...supplier,
          productsSupplied: statsMap[supplier.id]?.productsSupplied ?? supplier.productsSupplied ?? 0,
          variantsSupplied: statsMap[supplier.id]?.variantsSupplied ?? supplier.variantsSupplied ?? 0,
          productCategories: statsMap[supplier.id]?.productCategories ?? supplier.productCategories ?? [],
        }));
      }

      _supplierCache.data = list;
      _supplierCache.ts = Date.now();

      if (typeof window !== 'undefined') {
        try {
          const trimmedList = list.slice(0, 25);
          const serialized = JSON.stringify({ data: trimmedList, ts: Date.now() });
          if (serialized.length < 100000) {
            localStorage.setItem('__rg_suppliers_cache', serialized);
          }
        } catch (e) {}
      }

      setSuppliers(list);
    } catch (err) {
      console.error('Firestore fetch error:', err);
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData?.suppliers) {
      fetchAllSuppliers();
    }
  }, [initialData?.suppliers]);

  const [isSearching, setIsSearching] = useState(false);

  // Debounced Peptide Search via API
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setAlgoliaSuppliers(null);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suppliers/search?q=${encodeURIComponent(searchTerm)}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setAlgoliaSuppliers(data.suppliers || []);
        }
      } catch (err) {
        console.error("Supplier search failed", err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleUpdate = async (id, data) => {
    try {
      // ── Name change: cascade to all variants via server-side API ──────────
      const nameChanged = data.name || data.companyName || data.displayName;
      if (nameChanged) {
        const canonicalName = data.name || data.companyName || data.displayName;
        const res = await fetch(`/api/suppliers/${id}/rename`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: canonicalName }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Rename API failed');

        // Ensure all three name aliases stay in sync on the local state
        const nameUpdate = { name: canonicalName, companyName: canonicalName, displayName: canonicalName };
        setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data, ...nameUpdate } : s));
        _supplierCache.data = null;
        _supplierCache.ts = 0;
        if (typeof window !== 'undefined') localStorage.removeItem('__rg_suppliers_cache');

        toast.success(`Supplier renamed → ${canonicalName} (${result.variantsCascaded ?? 0} variants updated)`);
        // Apply any remaining non-name fields via normal updateDoc
        const remainingFields = Object.fromEntries(
          Object.entries(data).filter(([k]) => !['name','companyName','displayName'].includes(k))
        );
        if (Object.keys(remainingFields).length > 0) {
          await updateDoc(doc(db, 'suppliers', id), { ...remainingFields, updatedAt: new Date().toISOString() });
        }
        return;
      }

      // ── Non-name update path ──────────────────────────────────────────────
      // If activating B2C, enforce single-active-B2C rule across all suppliers
      if (data.statusB2C === 'active') {
        const batch = writeBatch(db);
        const activeB2CQuery = query(collection(db, 'suppliers'), where('statusB2C', '==', 'active'));
        const snap = await getDocs(activeB2CQuery);

        snap.forEach(docSnap => {
          if (docSnap.id !== id) batch.update(docSnap.ref, { statusB2C: 'inactive' });
        });

        batch.update(doc(db, 'suppliers', id), data);
        await batch.commit();

        // Invalidate cache so name changes propagate everywhere
        _supplierCache.data = null;
        _supplierCache.ts = 0;

        setSuppliers(prev => prev.map(s => {
          if (s.id === id) return { ...s, ...data };
          if (s.statusB2C === 'active') return { ...s, statusB2C: 'inactive' };
          return s;
        }));
        toast.success('B2C Status updated exclusively');
      } else {
        await updateDoc(doc(db, 'suppliers', id), data);
        // Optimistic UI update
        setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
        // Invalidate cache so all components that resolve names by ID see the change
        _supplierCache.data = null;
        _supplierCache.ts = 0;
        if (typeof window !== 'undefined') localStorage.removeItem('__rg_suppliers_cache');
        toast.success('Changes saved successfully');
      }
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to update supplier.');
    }
  };

  const handleBulkUpdate = async (ids, data) => {
    try {
      if (data.statusB2C === 'active') {
        if (ids.length > 1) {
          toast.error('Only one supplier can be active for B2C at a time.');
          return;
        }
        if (ids.length === 1) return handleUpdate(ids[0], data);
      }

      const batch = writeBatch(db);
      ids.forEach(id => batch.update(doc(db, 'suppliers', id), data));
      await batch.commit();

      setSuppliers(prev => prev.map(s => ids.includes(s.id) ? { ...s, ...data } : s));
      toast.success(`Successfully updated ${ids.length} suppliers.`);
    } catch (err) {
      console.error('Bulk update failed:', err);
      toast.error('Failed to update suppliers.');
    }
  };

  const handleCreate = async (data) => {
    try {
      // Generate canonical ID: supplier-{slugified-name}
      const slug = (data.name || data.companyName || 'unknown')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const newId = 'supplier-' + slug;
      // ── New schema: always write `name` as the canonical display field ──────
      const canonicalName = data.name || data.companyName || data.displayName || '';
      const newDoc = {
        ...data,
        name:             canonicalName,   // ← Phase 7 canonical field
        companyName:      canonicalName,   // ← legacy compat
        displayName:      canonicalName,   // ← legacy compat
        productsSupplied: 0,
        variantsSupplied: 0,
        statusB2B: 'active',
        statusB2C: 'inactive',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'suppliers', newId), newDoc);
      _supplierCache.data = null;
      _supplierCache.ts = 0;
      setSuppliers(prev => [{ id: newId, ...newDoc }, ...prev]);
      toast.success('New supplier registered');
    } catch (err) {
      console.error('Create failed:', err);
      toast.error('Failed to create supplier.');
    }
  };

  const deduplicatedSuppliers = useMemo(() => {
    // ── Dedup by Firestore document ID (globally unique) ─────────────────────
    // Previously deduped by name which created ghost duplicates when
    // companyName !== name. Now we merge Algolia hits by ID only.
    const uniqueMap = new Map();

    const combinedList = [...suppliers];
    if (algoliaSuppliers) {
      algoliaSuppliers.forEach(as => {
        if (!combinedList.find(s => s.id === as.id)) combinedList.push(as);
      });
    }

    combinedList.forEach(s => {
      if (!uniqueMap.has(s.id)) {
        uniqueMap.set(s.id, { ...s });
      } else {
        // Merge: keep the entry with higher product count as the primary record
        const existing = uniqueMap.get(s.id);
        if ((s.productsSupplied || 0) > (existing.productsSupplied || 0)) {
          uniqueMap.set(s.id, { ...existing, ...s });
        } else {
          // Just merge in any new fields without downgrading counts
          Object.assign(existing, s);
        }
      }
    });
    return Array.from(uniqueMap.values());
  }, [suppliers, algoliaSuppliers]);

  const processedData = useMemo(() => {
    let result = deduplicatedSuppliers;

    // 1. Search (Deep search across fields + Algolia peptide matching)
    // NOTE: Suppliers pinned by the supplierIds filter always pass — search only
    //       narrows the unpinned pool to avoid the "lotus + Magenta = 0" conflict.
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const algoliaIds = algoliaSuppliers ? algoliaSuppliers.map(s => s.id) : [];
      const pinnedIds  = filters.supplierIds || [];

      result = result.filter(s => {
        // Always keep suppliers explicitly selected in the supplier filter
        if (pinnedIds.includes(s.id)) return true;
        // If it was found via Algolia product matching, keep it
        if (algoliaIds.includes(s.id)) return true;
        // Fallback to local text search on the supplier itself
        // Also match the canonical supplierId so 'lotusland' finds 'supplier-lotusland'
        return (s.name || s.companyName || '').toLowerCase().includes(term) ||
          s.id.toLowerCase().includes(term) ||
          (s.email || '').toLowerCase().includes(term) ||
          (s.country || '').toLowerCase().includes(term) ||
          (s.type || '').toLowerCase().includes(term) ||
          (s.tags || []).some(t => t.toLowerCase().includes(term)) ||
          (s.suppliedProductNames || []).some(p => p.toLowerCase().includes(term));
      });
    }


    // 2. KPI Pre-Filters
    if (activeKpiFilter === 'active') result = result.filter(s => s.statusB2B === 'active');
    else if (activeKpiFilter === 'single_source') result = result.filter(s => s.singleSourceItems > 0);
    else if (activeKpiFilter === 'expiring_gmp') result = result.filter(s => (s.gmps || []).some(g => g.status === 'Expiring Soon'));
    else if (activeKpiFilter === 'pending_coa') result = result.filter(s => (s.coas || []).some(c => c.status === 'Missing'));

    // 3. Advanced Filters
    if (filters.country && filters.country.length > 0) result = result.filter(s => filters.country.includes(s.country));
    if (filters.category && filters.category.length > 0) result = result.filter(s => filters.category.includes(s.category));
    if (filters.status && filters.status.length > 0) result = result.filter(s => filters.status.includes(s.statusB2B) || filters.status.includes(s.statusB2C));

    // Product Category filter — filters suppliers that offer products in the selected categories
    if (filters.productCategory && filters.productCategory.length > 0) {
      result = result.filter(s => {
        const cats = s.productCategories || [];
        return filters.productCategory.some(fc => cats.includes(fc));
      });
    }

    // Supplier filter — multi-select by canonical supplier ID array
    if (filters.supplierIds && filters.supplierIds.length > 0) {
      result = result.filter(s => filters.supplierIds.includes(s.id));
    }

    // Bypass 'hasProducts' filter for Algolia search hits
    const algoliaIds = algoliaSuppliers ? algoliaSuppliers.map(s => s.id) : [];
    if (filters.hasProducts) {
      result = result.filter(s => (s.productsSupplied || 0) > 0 || (s.variantsSupplied || 0) > 0 || (searchTerm && algoliaIds.includes(s.id)));
    }

    // 4. Sort
    result.sort((a, b) => {
      let valA = a[sortConfig.key] || '';
      let valB = b[sortConfig.key] || '';
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [deduplicatedSuppliers, searchTerm, activeKpiFilter, filters, sortConfig, algoliaSuppliers]);

  // Pagination bounds
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Effect to reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeKpiFilter, filters, pageSize]);

  return {
    suppliers,
    paginatedData,
    loading,
    isSearching,
    kpisLoading,
    serverKpis,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    activeKpiFilter,
    setActiveKpiFilter,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    handleUpdate,
    handleBulkUpdate,
    handleCreate,
    refresh: () => fetchAllSuppliers(true),
    refreshData: () => fetchAllSuppliers(true)
  };
}

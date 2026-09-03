"use client";
/**
 * useWholesellerData.js
 *
 * Hook exclusivo para la colección `wholesellers`.
 * Esta colección es INDEPENDIENTE de `suppliers`.
 *
 * REGLA: Wholesellers = distribuidores/revendedores que acceden al catálogo.
 *        Son completamente distintos de los Suppliers (laboratorios/fabricantes).
 *
 * Relación con catálogo:
 *   - wholesellers/{id}.authorizedVariantIds → variantes que puede ver/vender
 *   - wholesellers/{id}.catalogAccessId → referencia a catalogAccess/{id} para mappings complejos
 */

import { useState, useEffect, useMemo } from 'react';
import {
  collection, getDocs, updateDoc, doc, setDoc, query, limit,
  where, writeBatch, orderBy, getDoc
} from 'firebase/firestore';
import { db } from '../../../firebase';
import toast from 'react-hot-toast';

// ── Module-level cache (RAM, TTL 5 min) ─────────────────────────────────────
const _cache = { data: null, ts: 0, TTL: 5 * 60 * 1000 };

const CACHE_KEY = '__rg_wholesellers_cache';

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts, TTL } = JSON.parse(raw);
    if (Date.now() - ts < TTL) return data;
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch { return null; }
}

function saveToLocalStorage(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now(), TTL: 30 * 60 * 1000 }));
  } catch {}
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useWholesellerData({ initialData = null } = {}) {
  const [wholesellers, setWholesellers] = useState(initialData?.wholesellers || []);
  const [loading, setLoading] = useState(!initialData?.wholesellers?.length);
  const [serverKpis, setServerKpis] = useState(initialData?.kpis || null);
  const [kpisLoading, setKpisLoading] = useState(!initialData?.kpis);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState(null);
  const [filters, setFilters] = useState({ country: [], status: [], tier: [] });
  const [sortConfig, setSortConfig] = useState({ key: 'companyName', direction: 'asc' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // ── Fetch from Firestore `wholesellers` collection ──────────────────────────
  const fetchAll = async (forceRefresh = false) => {
    // Layer 1: RAM cache
    if (!forceRefresh && _cache.data && Date.now() - _cache.ts < _cache.TTL) {
      setWholesellers(_cache.data);
      setLoading(false);
      return;
    }

    // Layer 2: localStorage
    if (!forceRefresh) {
      const lsData = loadFromLocalStorage();
      if (lsData) {
        setWholesellers(lsData);
        _cache.data = lsData;
        _cache.ts = Date.now();
        setLoading(false);
        return;
      }
    }

    // Layer 3: Firestore
    setLoading(true);
    try {
      const q = query(collection(db, 'wholesellers'), limit(300));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      _cache.data = data;
      _cache.ts = Date.now();
      saveToLocalStorage(data);
      setWholesellers(data);
    } catch (err) {
      console.error('[useWholesellerData] Fetch error:', err);
      toast.error('Failed to load wholesellers.');
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch KPIs from server API ──────────────────────────────────────────────
  const fetchKpis = async () => {
    setKpisLoading(true);
    try {
      const res = await fetch('/api/wholesellers/stats');
      if (res.ok) {
        const data = await res.json();
        setServerKpis(data.kpis);
      }
    } catch (err) {
      console.error('[useWholesellerData] KPI fetch error:', err);
    } finally {
      setKpisLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchKpis();
  }, []);

  // ── CRUD Operations ─────────────────────────────────────────────────────────
  const handleUpdate = async (id, data) => {
    try {
      await updateDoc(doc(db, 'wholesellers', id), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      // Optimistic update
      setWholesellers(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
      // Invalidate caches
      _cache.data = null; _cache.ts = 0;
      localStorage.removeItem(CACHE_KEY);
      toast.success('Wholeseller updated successfully');
    } catch (err) {
      console.error('[useWholesellerData] Update error:', err);
      toast.error('Failed to update wholeseller.');
    }
  };

  const handleBulkUpdate = async (ids, data) => {
    try {
      const batch = writeBatch(db);
      ids.forEach(id => batch.update(doc(db, 'wholesellers', id), {
        ...data,
        updatedAt: new Date().toISOString(),
      }));
      await batch.commit();
      setWholesellers(prev => prev.map(w => ids.includes(w.id) ? { ...w, ...data } : w));
      _cache.data = null; _cache.ts = 0;
      toast.success(`Updated ${ids.length} wholesellers.`);
    } catch (err) {
      console.error('[useWholesellerData] Bulk update error:', err);
      toast.error('Failed to bulk update wholesellers.');
    }
  };

  const handleCreate = async (data) => {
    try {
      const newId = 'ws-' + Date.now();
      const newDoc = {
        ...data,
        status: data.status || 'active',
        // catalogAccess: all by default (empty = full access)
        authorizedVariantIds: [],
        catalogAccessId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'wholesellers', newId), newDoc);
      _cache.data = null; _cache.ts = 0;
      localStorage.removeItem(CACHE_KEY);
      setWholesellers(prev => [{ id: newId, ...newDoc }, ...prev]);
      toast.success('Wholeseller created successfully');
      return newId;
    } catch (err) {
      console.error('[useWholesellerData] Create error:', err);
      toast.error('Failed to create wholeseller.');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await updateDoc(doc(db, 'wholesellers', id), {
        status: 'archived',
        updatedAt: new Date().toISOString(),
      });
      _cache.data = null; _cache.ts = 0;
      localStorage.removeItem(CACHE_KEY);
      setWholesellers(prev => prev.filter(w => w.id !== id));
      toast.success('Wholeseller archived.');
    } catch (err) {
      console.error('[useWholesellerData] Delete error:', err);
      toast.error('Failed to archive wholeseller.');
    }
  };

  // ── Processed/Filtered Data ─────────────────────────────────────────────────
  const processedData = useMemo(() => {
    let result = [...wholesellers];

    // 1. Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(w =>
        (w.companyName || w.name || '').toLowerCase().includes(term) ||
        (w.email || '').toLowerCase().includes(term) ||
        (w.country || '').toLowerCase().includes(term) ||
        (w.contactPerson || '').toLowerCase().includes(term)
      );
    }

    // 2. KPI filters
    if (activeKpiFilter === 'active') result = result.filter(w => w.status === 'active');
    else if (activeKpiFilter === 'pending') result = result.filter(w => w.status === 'pending');
    else if (activeKpiFilter === 'restricted') result = result.filter(w => (w.authorizedVariantIds?.length || 0) > 0);
    else if (activeKpiFilter === 'full_access') result = result.filter(w => !w.authorizedVariantIds?.length);

    // 3. Column filters
    if (filters.country?.length) result = result.filter(w => filters.country.includes(w.country));
    if (filters.status?.length) result = result.filter(w => filters.status.includes(w.status));
    if (filters.tier?.length) result = result.filter(w => filters.tier.includes(w.pricingTier));

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
  }, [wholesellers, searchTerm, activeKpiFilter, filters, sortConfig]);

  // Pagination
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, activeKpiFilter, filters]);

  return {
    wholesellers,
    paginatedData,
    loading,
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
    handleDelete,
    refresh: () => fetchAll(true),
    refreshKpis: () => fetchKpis(),
  };
}

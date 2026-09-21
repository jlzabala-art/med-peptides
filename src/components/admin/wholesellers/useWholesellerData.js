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
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'wholesellers', id), {
        ...data,
        updatedAt: now,
      });

      // Dual-sync to customers SSOT
      const customerUpdate = { updatedAt: now };
      if (data.companyName !== undefined) {
        customerUpdate.name = data.companyName;
        customerUpdate.companyName = data.companyName;
      }
      if (data.email !== undefined) customerUpdate.email = data.email;
      if (data.contactEmail !== undefined) customerUpdate.email = data.contactEmail;
      if (data.phone !== undefined) customerUpdate.phone = data.phone;
      if (data.contactPhone !== undefined) customerUpdate.phone = data.contactPhone;
      if (data.country !== undefined) customerUpdate.country = data.country;
      if (data.city !== undefined) customerUpdate.city = data.city;
      if (data.pricingTier !== undefined) customerUpdate.pricingTier = data.pricingTier;
      if (data.discountMargin !== undefined) customerUpdate.discountMargin = data.discountMargin;
      if (data.status !== undefined) customerUpdate.status = data.status;
      if (data.notes !== undefined) customerUpdate.notes = data.notes;
      if (data.authorizedVariantIds !== undefined) {
        customerUpdate['wholesalerProfile.authorizedVariantIds'] = data.authorizedVariantIds;
      }
      await setDoc(doc(db, 'customers', id), customerUpdate, { merge: true }).catch(() => {});

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
      const now = new Date().toISOString();
      const batch = writeBatch(db);
      ids.forEach(id => {
        batch.update(doc(db, 'wholesellers', id), {
          ...data,
          updatedAt: now,
        });
        batch.set(doc(db, 'customers', id), {
          ...data,
          updatedAt: now,
        }, { merge: true });
      });
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
      const now = new Date().toISOString();
      const newDoc = {
        ...data,
        status: data.status || 'active',
        // catalogAccess: all by default (empty = full access)
        authorizedVariantIds: [],
        catalogAccessId: null,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'wholesellers', newId), newDoc);

      // Dual-sync to customers SSOT
      const customerDoc = {
        id: newId,
        customerType: 'wholesaler',
        name: newDoc.companyName || newDoc.name || 'Wholesaler',
        companyName: newDoc.companyName || newDoc.name || '',
        email: newDoc.contactEmail || newDoc.email || '',
        phone: newDoc.contactPhone || newDoc.phone || '',
        country: newDoc.country || '',
        city: newDoc.city || '',
        pricingTier: newDoc.pricingTier || 'tier_b2b_clinic',
        discountMargin: typeof newDoc.discountMargin === 'number' ? newDoc.discountMargin : 25,
        currency: newDoc.currency || 'USD',
        paymentTerms: newDoc.paymentTerms || 'Net 30',
        creditLimit: typeof newDoc.creditLimit === 'number' ? newDoc.creditLimit : 50000,
        status: newDoc.status || 'active',
        notes: newDoc.notes || '',
        createdAt: now,
        updatedAt: now,
        wholesalerProfile: {
          authorizedVariantIds: newDoc.authorizedVariantIds || [],
          exclusiveTerritories: newDoc.zones || [],
          resellerCertificateUrl: newDoc.resellerCertificateUrl || null,
        }
      };
      await setDoc(doc(db, 'customers', newId), customerDoc, { merge: true }).catch(() => {});

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
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'wholesellers', id), {
        status: 'archived',
        updatedAt: now,
      });
      await updateDoc(doc(db, 'customers', id), {
        status: 'archived',
        updatedAt: now,
      }).catch(() => {});

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

    // 1. Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const cleanTerm = term.replace(/[^\d+]/g, '');

      result = result.filter(w => {
        const company = (w.companyName || w.name || '').toLowerCase();
        const email = (w.contactEmail || w.email || '').toLowerCase();
        const country = (w.country || '').toLowerCase();
        const city = (w.city || '').toLowerCase();
        const person = (w.contactPerson || w.contactName || '').toLowerCase();
        const id = (w.id || '').toLowerCase();
        const zohoId = (w.zohoContactId || w.zohoContactNumber || w.zohoBiginContactId || '').toLowerCase();
        const rawPhone = (w.contactPhone || w.phone || w.mobile || '');
        const cleanPhone = rawPhone.replace(/[^\d+]/g, '');

        return (
          company.includes(term) ||
          email.includes(term) ||
          country.includes(term) ||
          city.includes(term) ||
          person.includes(term) ||
          id.includes(term) ||
          zohoId.includes(term) ||
          (cleanTerm.length >= 3 && cleanPhone.includes(cleanTerm))
        );
      });
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

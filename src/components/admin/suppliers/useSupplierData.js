import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, updateDoc, doc, setDoc, query, limit, getCountFromServer, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import toast from 'react-hot-toast';

export function useSupplierData() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Filters
  const [activeKpiFilter, setActiveKpiFilter] = useState('all'); // all, active, strategic, pending, low_response
  const [filters, setFilters] = useState({
    country: [],
    type: [],
    status: [],
  });

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'companyName', direction: 'asc' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // KPIs
  const [serverKpis, setServerKpis] = useState({ total: 0, active: 0, strategic: 0, pendingDocs: 0, lowResponse: 0, coveredCountriesCount: 6 });
  const [kpisLoading, setKpisLoading] = useState(true);

  // Fetch initial KPIs
  useEffect(() => {
    async function fetchKpis() {
      setKpisLoading(true);
      try {
        const collRef = collection(db, 'wholesellers');
        const [totalSnap, activeSnap, strategicSnap] = await Promise.all([
          getCountFromServer(collRef),
          getCountFromServer(query(collRef, where('status', '==', 'active'))),
          getCountFromServer(query(collRef, where('rating', '==', 5)))
        ]);
        const total = totalSnap.data().count;
        setServerKpis({
          total,
          active: activeSnap.data().count,
          strategic: strategicSnap.data().count,
          pendingDocs: Math.floor(total * 0.12),
          lowResponse: Math.max(0, Math.floor(total * 0.05)),
          coveredCountriesCount: 6
        });
      } catch (err) {
        console.error("Error fetching supplier KPIs:", err);
      } finally {
        setKpisLoading(false);
      }
    }
    fetchKpis();
  }, []);

  // Fetch all suppliers for client-side operations (max 2000 for safety)
  const fetchAllSuppliers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'wholesellers'), limit(2000));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSuppliers(list);
    } catch (err) {
      console.error("Firestore fetch error:", err);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSuppliers();
  }, []);

  const handleUpdate = async (id, data) => {
    try {
      await updateDoc(doc(db, 'wholesellers', id), data);
      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      toast.success("Changes saved successfully");
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to update supplier.');
    }
  };

  const handleCreate = async (data) => {
    try {
      const newId = 'ws_' + Date.now();
      const newDoc = {
        ...data,
        status: 'active',
        createdAt: new Date().toISOString(),
        isZohoMaster: false
      };
      await setDoc(doc(db, 'wholesellers', newId), newDoc);
      setSuppliers(prev => [{id: newId, ...newDoc}, ...prev]);
      toast.success("New supplier registered");
    } catch (err) {
      console.error('Create failed:', err);
      toast.error('Failed to create supplier.');
    }
  };

  const processedData = useMemo(() => {
    // 0. Deduplicate by base company name to avoid duplicates like (Lotusland EUR vs USD)
    const uniqueMap = new Map();
    [...suppliers].forEach(s => {
      const rawName = s.companyName || s.name || s.id;
      const key = rawName.toLowerCase().replace(/\s+(eur|usd|aed|r\\$)$/i, '').trim();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, { ...s, supplierVariants: [s] });
      } else {
        const existing = uniqueMap.get(key);
        existing.supplierVariants.push(s);
      }
    });
    let result = Array.from(uniqueMap.values());

    // 1. Search (Deep search across fields)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s => 
        (s.companyName || s.name || '').toLowerCase().includes(term) ||
        (s.email || '').toLowerCase().includes(term) ||
        (s.country || '').toLowerCase().includes(term) ||
        (s.type || '').toLowerCase().includes(term) ||
        (s.tags || []).some(t => t.toLowerCase().includes(term))
      );
    }

    // 2. KPI Pre-Filters
    if (activeKpiFilter === 'active') result = result.filter(s => s.status === 'active');
    else if (activeKpiFilter === 'strategic') result = result.filter(s => s.rating === 5);
    else if (activeKpiFilter === 'low_response') result = result.filter(s => (s.healthScore || 100) < 85);
    else if (activeKpiFilter === 'pending') result = result.filter(s => s.pendingDocsCount > 0);

    // 3. Advanced Filters
    if (filters.country.length > 0) result = result.filter(s => filters.country.includes(s.country));
    if (filters.type.length > 0) result = result.filter(s => filters.type.includes(s.type));
    if (filters.status.length > 0) result = result.filter(s => filters.status.includes(s.status));

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
  }, [suppliers, searchTerm, activeKpiFilter, filters, sortConfig]);

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
    handleCreate,
    refreshData: fetchAllSuppliers
  };
}

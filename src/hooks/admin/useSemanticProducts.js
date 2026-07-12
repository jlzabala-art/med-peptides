import { useCallback, useEffect, useState } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, where, startAt, endAt } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;

export function useSemanticProducts(options = {}) {
  const { initialData = null } = options;
  const [products, setProducts] = useState(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'ready' | 'pending'
  
  // We don't dispatch context events here unless needed.
  // We manage the custom logs from the hook to avoid leaking it to the component.
  const [log, setLog] = useState([]);

  const addLog = useCallback((msg, type = 'info') => {
    setLog((prev) => [{ msg, type, ts: new Date().toLocaleTimeString() }, ...prev].slice(0, 15));
  }, []);

  const fetchProducts = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) setLoadingMore(true);
      else {
        setLoading(true);
        setProducts([]);
      }

      try {
        let qRef = collection(db, 'products');
        let constraints = [];

        // Goal Filter
        if (selectedGoal && selectedGoal !== 'all') {
          constraints.push(where('goals', 'array-contains', selectedGoal));
        }

        // Name Search Prefix Match (case-sensitive)
        if (searchTerm.trim()) {
          constraints.push(orderBy('name'));
          constraints.push(startAt(searchTerm.trim()));
          constraints.push(endAt(searchTerm.trim() + '\uf8ff'));
        } else {
          constraints.push(orderBy('name'));
        }

        // Pagination
        if (isLoadMore && lastDoc) {
          constraints.push(startAfter(lastDoc));
        }

        constraints.push(limit(20));

        const q = query(qRef, ...constraints);
        const querySnapshot = await getDocs(q);

        const newDocs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Apply client-side status filter
        let filteredDocs = newDocs;
        if (selectedStatus === 'ready') {
          filteredDocs = newDocs.filter((p) => p.goals && p.goals.length > 0);
        } else if (selectedStatus === 'pending') {
          filteredDocs = newDocs.filter((p) => !(p.goals && p.goals.length > 0));
        }

        if (isLoadMore) {
          setProducts((prev) => [...prev, ...filteredDocs]);
        } else {
          setProducts(filteredDocs);
        }

        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
        setHasMore(querySnapshot.docs.length === 20);

        if (!isLoadMore) {
          addLog(`Loaded ${newDocs.length} products (Page 1)`, 'success');
        } else {
          addLog(`Loaded ${newDocs.length} additional products`, 'success');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        addLog(`Fetch error: ${err.message}`, 'error');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchTerm, selectedGoal, selectedStatus, lastDoc, addLog]
  );

  useEffect(() => {
    // Skip first fetch if initialData is provided and no filters are active yet
    if (initialData && products.length > 0 && products[0] === initialData[0] && !lastDoc && searchTerm === '' && selectedGoal === 'all' && selectedStatus === 'all') {
      if (initialData.length > 0) {
        setHasMore(initialData.length === 20); // Guess based on limit
      }
      return;
    }
    setLastDoc(null);
    fetchProducts(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedGoal, selectedStatus]);
  
  // Legacy compatibility for direct state updates (e.g. when an item is modified inline)
  const updateProductInline = useCallback((id, updatedData) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  }, []);

  return {
    products,
    loading,
    loadingMore,
    hasMore,
    searchTerm,
    setSearchTerm,
    selectedGoal,
    setSelectedGoal,
    selectedStatus,
    setSelectedStatus,
    fetchProducts,
    log,
    addLog,
    setLog,
    updateProductInline
  };
}

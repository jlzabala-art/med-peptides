import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, limit, startAfter, orderBy, onSnapshot } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;
import { useAuth } from '../../context/AuthContext';

/**
 * Hook for Suppliers to manage their own products/catalog.
 * Uses the Golden Rule: Required limit() and lazy loading.
 */
export function useSupplierProducts(options = {}) {
  const { 
    pageSize = 50, 
    realtime = true 
  } = options;
  
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Base query: Products where supplierId == user.uid
    const qBase = query(
      collection(db, 'products'),
      where('supplierId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (realtime) {
      // Real-time listener
      const unsubscribe = onSnapshot(qBase, (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetched);
        
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        }
        setHasMore(snapshot.docs.length === pageSize);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching supplier products:", err);
        setError(err.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // One-time fetch
      getDocs(qBase).then((snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetched);
        
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        }
        setHasMore(snapshot.docs.length === pageSize);
        setLoading(false);
      }).catch(err => {
        console.error("Error fetching supplier products:", err);
        setError(err.message);
        setLoading(false);
      });
    }
  }, [user?.uid, pageSize, realtime]);

  const loadMore = async () => {
    if (!hasMore || loading || !lastDoc || !user?.uid) return;
    
    setLoading(true);
    try {
      const qNext = query(
        collection(db, 'products'),
        where('supplierId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(qNext);
      const nextProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setProducts(prev => [...prev, ...nextProducts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (err) {
      console.error("Error loading more supplier products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore
  };
}

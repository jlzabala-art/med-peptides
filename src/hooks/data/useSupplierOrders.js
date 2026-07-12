import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, startAfter, orderBy, onSnapshot } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;
import { useAuth } from '../../context/AuthContext';

/**
 * Hook for Suppliers to manage B2B orders they have received.
 * Golden Rule: Enforced pagination and limits.
 */
export function useSupplierOrders(options = {}) {
  const { 
    pageSize = 50, 
    realtime = true,
    statusFilter = null // optional: e.g., 'pending', 'shipped'
  } = options;
  
  const { user, userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // If not logged in, or not a supplier (and not admin), do nothing
    if (!user?.uid || (userProfile?.role !== 'supplier' && userProfile?.role !== 'admin')) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Base query logic
    let conditions = [
      where('supplierId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    ];

    if (userProfile?.role === 'admin') {
       // Admins can see all supplier orders if needed, or we might still filter by supplierId if passed in via options. 
       // For now, if admin, we might just fetch all B2B orders, but let's stick to the supplier scope for this hook.
       // We'll leave the supplierId filter as is, assuming the admin is viewing a specific supplier's dashboard.
    }

    if (statusFilter) {
      conditions = [where('status', '==', statusFilter), ...conditions];
    }

    const qBase = query(collection(db, 'orders'), ...conditions);

    if (realtime) {
      const unsubscribe = onSnapshot(qBase, (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(fetched);
        
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        }
        setHasMore(snapshot.docs.length === pageSize);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching supplier orders:", err);
        setError(err.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      getDocs(qBase).then((snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(fetched);
        
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        }
        setHasMore(snapshot.docs.length === pageSize);
        setLoading(false);
      }).catch(err => {
        console.error("Error fetching supplier orders:", err);
        setError(err.message);
        setLoading(false);
      });
    }
  }, [user?.uid, userProfile?.role, pageSize, realtime, statusFilter]);

  const loadMore = async () => {
    if (!hasMore || loading || !lastDoc || !user?.uid) return;
    
    setLoading(true);
    try {
      let conditions = [
        where('supplierId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      ];

      if (statusFilter) {
        conditions = [where('status', '==', statusFilter), ...conditions];
      }

      const qNext = query(collection(db, 'orders'), ...conditions);
      const snapshot = await getDocs(qNext);
      const nextOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setOrders(prev => [...prev, ...nextOrders]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (err) {
      console.error("Error loading more supplier orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    hasMore,
    loadMore
  };
}

import { useState, useEffect, useCallback } from 'react';
import * as fb from '../../firebase';
const db = fb?.db;
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';

/**
 * Hook to fetch paginated order history for a specific patient.
 * Adheres to the "Golden Rule" pagination architecture.
 * 
 * @param {Object} options - Hook options
 * @param {string} options.patientId - The ID of the patient
 * @param {number} [options.pageSize=50] - Number of orders per page
 */
export function usePatientOrders({ patientId, pageSize = 50 }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchOrders = useCallback(async (isNextPage = false) => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'orders'),
        where('buyerId', '==', patientId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (isNextPage && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      
      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setOrders(prev => isNextPage ? [...prev, ...newItems] : newItems);
      
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc || null);
      
      if (snapshot.docs.length < pageSize) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error("Error fetching patient orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientId, pageSize, lastVisible]);

  useEffect(() => {
    // Initial fetch
    setOrders([]);
    setLastVisible(null);
    setHasMore(true);
    fetchOrders(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, pageSize]); 

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchOrders(true);
    }
  };

  return { orders, loading, error, hasMore, loadMore };
}

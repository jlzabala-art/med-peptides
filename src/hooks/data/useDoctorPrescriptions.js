import { useState, useEffect, useCallback } from 'react';
import * as fb from '../../firebase';
const db = fb?.db;
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';

/**
 * Hook to fetch paginated prescriptions authored by a specific doctor.
 * Adheres to the "Golden Rule" pagination architecture.
 * 
 * @param {Object} options - Hook options
 * @param {string} options.doctorId - The ID of the doctor
 * @param {number} [options.pageSize=50] - Number of prescriptions per page
 */
export function useDoctorPrescriptions({ doctorId, pageSize = 50 }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPrescriptions = useCallback(async (isNextPage = false) => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'prescriptions'),
        where('doctorId', '==', doctorId),
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

      setPrescriptions(prev => isNextPage ? [...prev, ...newItems] : newItems);
      
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc || null);
      
      if (snapshot.docs.length < pageSize) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [doctorId, pageSize, lastVisible]);

  useEffect(() => {
    // Initial fetch
    setPrescriptions([]);
    setLastVisible(null);
    setHasMore(true);
    fetchPrescriptions(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, pageSize]); // intentionally omit lastVisible

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPrescriptions(true);
    }
  };

  return { prescriptions, loading, error, hasMore, loadMore };
}

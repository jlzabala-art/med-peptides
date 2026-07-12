import { useState, useEffect, useCallback } from 'react';
import * as fb from '../../firebase';
const db = fb?.db;
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';

/**
 * Hook to fetch paginated patients assigned to a specific doctor.
 * Adheres to the "Golden Rule" pagination architecture to prevent UI freezing.
 * 
 * @param {Object} options - Hook options
 * @param {string} options.doctorId - The ID of the doctor to fetch patients for
 * @param {number} [options.pageSize=50] - Number of patients per page
 */
export function useDoctorPatients({ doctorId, pageSize = 50 }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPatients = useCallback(async (isNextPage = false) => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create base query: all users where role='patient' and assignedDoctor includes doctorId
      // Note: adjust the query to match the exact schema used for patient-doctor relations
      let q = query(
        collection(db, 'users'),
        where('role', '==', 'patient'),
        where('assignedDoctorId', '==', doctorId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (isNextPage && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      
      const newPatients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPatients(prev => isNextPage ? [...prev, ...newPatients] : newPatients);
      
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc || null);
      
      if (snapshot.docs.length < pageSize) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [doctorId, pageSize, lastVisible]);

  useEffect(() => {
    // Initial fetch
    setPatients([]);
    setLastVisible(null);
    setHasMore(true);
    fetchPatients(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, pageSize]); // intentionally omit lastVisible

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPatients(true);
    }
  };

  return { patients, loading, error, hasMore, loadMore };
}

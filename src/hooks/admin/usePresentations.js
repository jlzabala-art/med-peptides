import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';

export function usePresentations() {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'presentations'), orderBy('name', 'asc'));
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPresentations(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching presentations:", err);
        // Fallback or ignore if the collection doesn't exist or permissions fail
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPresentations();
  }, []);

  return { presentations, loading, error };
}

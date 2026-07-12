import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;

export function useSearchSupplements(searchQuery = '', maxResults = 10) {
  const [supplements, setSupplements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function search() {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setSupplements([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const qStr = searchQuery.toLowerCase().trim();
        
        // Similar to protocols, we do a prefix query on 'name_lower' or 'name'
        const q = query(
          collection(db, 'supplements'),
          where('name_lower', '>=', qStr),
          where('name_lower', '<=', qStr + '\uf8ff'),
          limit(maxResults)
        );
        
        const snap = await getDocs(q);
        const results = [];
        snap.forEach(doc => {
          results.push({ id: doc.id, ...doc.data() });
        });
        
        if (isMounted) {
          setSupplements(results);
        }
      } catch (err) {
        console.error('Error searching supplements:', err);
        if (isMounted) setSupplements([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    const delayDebounce = setTimeout(() => {
      search();
    }, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(delayDebounce);
    };
  }, [searchQuery, maxResults]);

  return { supplements, isLoading };
}

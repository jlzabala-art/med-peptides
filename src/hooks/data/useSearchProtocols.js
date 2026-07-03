import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

export function useSearchProtocols(searchQuery = '', maxResults = 10) {
  const [protocols, setProtocols] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function search() {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setProtocols([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const qStr = searchQuery.toLowerCase().trim();
        
        // Firestore doesn't do native full-text search well, but we can do prefix matching
        // or just fetch recent ones and filter in memory if the catalog is small, BUT
        // the golden rule requires limits. We'll do a simple prefix query on 'name'.
        // If they want better search, Algolia is needed. For now:
        const q = query(
          collection(db, 'protocols'),
          where('name_lower', '>=', qStr),
          where('name_lower', '<=', qStr + '\uf8ff'),
          limit(maxResults)
        );
        
        const snap = await getDocs(q);
        const results = [];
        snap.forEach(doc => {
          results.push({ id: doc.id, ...doc.data() });
        });
        
        // Fallback: If 'name_lower' doesn't exist or returns empty, we might need a backup
        // but typically name_lower should be indexed. For now, we return what we find.
        if (isMounted) {
          setProtocols(results);
        }
      } catch (err) {
        console.error('Error searching protocols:', err);
        // Fallback gracefully
        if (isMounted) setProtocols([]);
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

  return { protocols, isLoading };
}

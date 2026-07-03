import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * Fetches only the products (peptides) required by a specific protocol.
 * This avoids fetching the entire catalog into memory.
 */
export function useProtocolProducts(protocol) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchProducts() {
      if (!protocol) {
        setProducts([]);
        return;
      }
      
      setIsLoading(true);
      
      // Collect unique peptide IDs or Slugs from all phases
      const targetIds = new Set();
      const targetNames = new Set();
      
      const phases = protocol.phases || [];
      phases.forEach(phase => {
        (phase.peptides || []).forEach(p => {
          if (p.id) targetIds.add(p.id.toLowerCase().trim());
          if (p.name) targetNames.add(p.name.toLowerCase().replace(/\s+/g, '-').trim());
        });
      });
      
      if (targetIds.size === 0 && targetNames.size === 0) {
        if (isMounted) {
          setProducts([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const fetchedProducts = [];
        
        // Firestore 'in' queries are limited to 10 items.
        // We do chunks of 10 if necessary.
        const idsArray = Array.from(targetIds);
        if (idsArray.length > 0) {
          for (let i = 0; i < idsArray.length; i += 10) {
            const chunk = idsArray.slice(i, i + 10);
            const q = query(collection(db, 'products'), where(documentId(), 'in', chunk));
            const snap = await getDocs(q);
            snap.forEach(doc => {
              fetchedProducts.push({ id: doc.id, ...doc.data() });
            });
          }
        }
        
        // Also query by slug just in case some are matched by name
        const namesArray = Array.from(targetNames).filter(n => !idsArray.includes(n));
        if (namesArray.length > 0) {
          for (let i = 0; i < namesArray.length; i += 10) {
            const chunk = namesArray.slice(i, i + 10);
            const q = query(collection(db, 'products'), where('slug', 'in', chunk));
            const snap = await getDocs(q);
            snap.forEach(doc => {
              if (!fetchedProducts.find(p => p.id === doc.id)) {
                fetchedProducts.push({ id: doc.id, ...doc.data() });
              }
            });
          }
        }
        
        if (isMounted) setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching protocol products:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    fetchProducts();
    
    return () => { isMounted = false; };
  }, [protocol]);

  return { products, isLoading };
}

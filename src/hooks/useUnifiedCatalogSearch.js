import { useState, useCallback, useRef } from 'react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { products as localProducts } from '../data/products';

export function useUnifiedCatalogSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef(null);

  const search = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const searchTerm = term.toLowerCase();
      
      // 1. Search Local Products (Peptides, Testing, Supplements)
      const localMatches = localProducts
        .filter(p => p.name?.toLowerCase().includes(searchTerm) || p.sku?.toLowerCase().includes(searchTerm))
        .map(p => ({
          id: p.id || p.name,
          type: p.productType || p.category === 'Longevity Diagnostics' ? 'testing' : 'product',
          name: p.name,
          sku: p.sku || '—',
          price: p.price || p.priceRanges?.[0]?.price || 0,
          relativeCostScore: null,
          category: p.category,
          unit: 'vials'
        }));

      // 2. Search Firestore Ingredients (APIs)
      const ingSnap = await getDocs(query(collection(db, 'ingredients'), limit(50)));
      const ingMatches = ingSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => p.name?.toLowerCase().includes(searchTerm))
        .map(p => ({
          id: p.id,
          type: 'api',
          name: p.name,
          sku: p.sku || 'API-RAW',
          price: p.price || null,
          relativeCostScore: p.relativeCostScore || null,
          category: 'Ingredients / APIs',
          unit: 'mg'
        }));

      // 3. Search Firestore Protocols
      const protoSnap = await getDocs(query(collection(db, 'protocols'), limit(50)));
      const protoMatches = protoSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => p.name?.toLowerCase().includes(searchTerm))
        .map(p => ({
          id: p.id,
          type: 'protocol',
          name: p.name,
          sku: 'PROTO',
          price: p.price || 0,
          relativeCostScore: null,
          category: 'Protocol',
          unit: 'bundle'
        }));

      // Combine and return top 20
      const combined = [...localMatches, ...ingMatches, ...protoMatches]
        .slice(0, 20);

      setResults(combined);
    } catch (err) {
      console.error('[useUnifiedCatalogSearch] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (val) => {
    clearTimeout(debounce.current);
    if (!val) {
      setResults([]);
      return;
    }
    debounce.current = setTimeout(() => search(val), 300);
  };

  const clear = () => setResults([]);

  return { results, loading, handleInput, clear, search };
}

import { useState, useCallback, useRef } from 'react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useStaticData } from '../hooks/useStaticData';
import { useProductSearch } from './useProductSearch';

export function useUnifiedCatalogSearch() {
  const { products: localProducts } = useStaticData();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef(null);

  // Initialize the new Algolia hook specifically for products
  const { forceSearch: searchAlgolia, results: algoliaResults } = useProductSearch({
    indexName: 'products',
    hitsPerPage: 10
  });

  const search = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const searchTerm = term.toLowerCase();
      
      // 1. Search Local Static Data (fallback)
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

      // 2. Search Algolia for Firestore Products
      let algoliaMatches = [];
      try {
        const algResult = await searchAlgolia(searchTerm);
        if (algResult && algResult.length > 0) {
          algoliaMatches = algResult.map(p => {
            // Check if a specific variant matched
            let matchedVariantSku = null;
            let matchedVariantStrength = null;
            if (p._highlightResult && p._highlightResult.variants) {
              const matchedVariantIdx = p._highlightResult.variants.findIndex(
                v => (v.sku && v.sku.matchLevel !== 'none') || (v.strengthLabel && v.strengthLabel.matchLevel !== 'none')
              );
              if (matchedVariantIdx !== -1 && p.variants && p.variants[matchedVariantIdx]) {
                matchedVariantSku = p.variants[matchedVariantIdx].sku;
                matchedVariantStrength = p.variants[matchedVariantIdx].strengthLabel;
              }
            }

            const variantSuffix = matchedVariantStrength ? ` (${matchedVariantStrength})` : (matchedVariantSku ? ` (${matchedVariantSku})` : '');

            return {
              id: p.objectID || p.id,
              type: p.productType || 'product',
              name: p.name + variantSuffix,
              originalName: p.name,
              sku: matchedVariantSku || p.sku || '—',
              price: p.price || 0,
              category: p.category,
              unit: 'vials',
              matchedVariant: matchedVariantSku ? p.variants?.find(v => v.sku === matchedVariantSku) : null,
              ...p
            };
          });
        }
      } catch (e) {
        // Silent fail if Algolia is not configured, we'll rely on fallbacks
      }

      // 3. Search Firestore Ingredients (APIs)
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

      // 4. Search Firestore Protocols
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

      // Combine, deduplicate by ID, and return top 20
      const combined = [...algoliaMatches, ...localMatches, ...ingMatches, ...protoMatches];
      const uniqueCombined = Array.from(new Map(combined.map(item => [item.id, item])).values()).slice(0, 20);
      
      // -- PRICING RULES ENGINE (Phase 5) --
      // Simulate applying a pricing rule based on user/tenant.
      // In production, this would fetch from a `pricing_rules` collection.
      const applyPricingRules = (items) => {
        return items.map(item => {
          let finalPrice = item.price;
          // Example: 10% discount on protocols
          if (item.type === 'protocol') {
            finalPrice = finalPrice * 0.9;
          }
          // Example: Mark up APIs by 20%
          if (item.type === 'api' && finalPrice) {
            finalPrice = finalPrice * 1.2;
          }
          return {
            ...item,
            basePrice: item.price,
            price: finalPrice,
            pricingRuleApplied: finalPrice !== item.price
          };
        });
      };

      const finalResults = applyPricingRules(uniqueCombined);
      setResults(finalResults);
    } catch (err) {
      console.error('[useUnifiedCatalogSearch] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [localProducts]);

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

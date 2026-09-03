import { useState, useEffect, useMemo } from 'react';
import { searchClient } from '../../../algolia';
import { GOALS } from '../../../constants/catalogFilters';
import {
  collection,
  query,
  getDocs,
  getDoc,
  orderBy,
  doc,
  collectionGroup,
  limit,
  startAfter,
  where,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '../../../firebase';

import { useToast } from '../../../hooks/useToast';
import {
  createProduct as repoCreateProduct,
  updateProduct as repoUpdateProduct,
  deleteProduct as repoDeleteProduct,
  createVariant as repoCreateVariant,
} from '../../../repositories/productRepository';

const DEFAULT_ADVANCED_FILTERS = {};
const DEFAULT_ACTIVE_KPIS = [];



// ── In-memory cache (Layer 1) ─────────────────────────────────────────────────
const _catalogCache = { products: null, variants: null, ts: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function useCatalogData(options = {}) {
  const {
    pageSize = 20,
    searchQuery = '',
    categoryFilter = 'All Categories',
    supplierFilter = null,
    advancedFilters = DEFAULT_ADVANCED_FILTERS,
    activeKpis = DEFAULT_ACTIVE_KPIS,
    activeWorkspace = 'products',
    skipFetch = false,
  } = options;

  const hasAlgoliaFilters = 
    (advancedFilters.goals && advancedFilters.goals.length > 0) ||
    (advancedFilters.productTypes && advancedFilters.productTypes.length > 0) ||
    (advancedFilters.commercialStatus && advancedFilters.commercialStatus.length > 0) ||
    (advancedFilters.regulatoryStatus && advancedFilters.regulatoryStatus.length > 0) ||
    (activeKpis && activeKpis.length > 0) ||
    (categoryFilter && categoryFilter !== 'All Categories');

  const isDefaultQuery = !searchQuery && !hasAlgoliaFilters && !supplierFilter;

  // Initialize state with cache if available
  const getInitialState = () => {
    if (isDefaultQuery && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('__rg_catalog_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (Date.now() - parsed.ts) < CACHE_TTL_MS * 6) {
             _catalogCache.products = parsed.products;
             _catalogCache.variants = parsed.variants;
             _catalogCache.ts = parsed.ts;
             return { p: parsed.products, v: parsed.variants, loading: false };
          }
        }
      } catch(e) {}
    }
    return { p: [], v: [], loading: true };
  };

  const initial = getInitialState();

  const [products, setProducts] = useState(initial.p);
  const [variants, setVariants] = useState(initial.v);
  const [loading, setLoading] = useState(initial.loading);

  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalVariants: 0,
    lowStock: 0,
    outOfStock: 0,
    missingCOA: 0,
    missingGMP: 0,
    missingSupplier: 0,
    missingPricing: 0,
  });
  
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [pageHistory, setPageHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchProducts = async (direction = 'next', reset = false) => {
    try {
      // If we are resetting, checking if it's the default query, and we have in-memory or localStorage cache, serve it instantly
      if (reset && isDefaultQuery) {
         const now = Date.now();
         if (_catalogCache.products && (now - _catalogCache.ts) < CACHE_TTL_MS) {
            setProducts(_catalogCache.products);
            setVariants(_catalogCache.variants);
            setLoading(false);
            
            // Re-validate silently
            setTimeout(() => fetchProductsImpl(direction, reset, true), 500);
            return;
         }
      }

      await fetchProductsImpl(direction, reset, false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchProductsImpl = async (direction, reset, isSilent) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      if (supplierFilter) {
        // Query variants by supplierId (canonical field)
        const vQ = query(collectionGroup(db, 'variants'), where('supplierId', '==', supplierFilter));
        const vSnap = await getDocs(vQ);
        const variantsOfSupplier = vSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const productIds = [...new Set(variantsOfSupplier.map(v => v.productId).filter(Boolean))];
        
        // Also query products by supplierIds array (canonical field)
        const pQ = query(collection(db, 'products'), where('supplierIds', 'array-contains', supplierFilter));
        const pSnap = await getDocs(pQ);
        pSnap.docs.forEach(d => {
            if (!productIds.includes(d.id)) {
                productIds.push(d.id);
            }
        });

        if (productIds.length === 0) {
          setProducts([]);
          setVariants([]);
          setHasMore(false);
          setLoading(false);
          return;
        }

        const chunkArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
        const idChunks = chunkArray(productIds, 10);
        let rawProducts = [];
        
        for (const chunk of idChunks) {
           const chunkQ = query(collection(db, 'products'), where('__name__', 'in', chunk));
           const chunkSnap = await getDocs(chunkQ);
           rawProducts = rawProducts.concat(chunkSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        let allVariants = [];
        for (const chunk of idChunks) {
            const vQ2 = query(collectionGroup(db, 'variants'), where('productId', 'in', chunk));
            const vSnap2 = await getDocs(vQ2);
            allVariants = allVariants.concat(vSnap2.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        const variantsByProduct = {};
        allVariants.forEach(v => {
           if (!variantsByProduct[v.productId]) variantsByProduct[v.productId] = [];
           variantsByProduct[v.productId].push(v);
        });

        const finalProducts = rawProducts.map(p => {
           p.variants = variantsByProduct[p.id] || [];
           return p;
        });

        setProducts(finalProducts);
        
        // Build flatVars
        const flatVars = [];
        finalProducts.forEach((p) => {
          if (p.variants && p.variants.length > 0) {
            p.variants.forEach((v, idx) => {
              const details = [
                v.format || p.format || '',
                v.dosage || p.dosage || '',
                v.size || p.size || '',
              ].filter(Boolean).join(' ');
              const computedPrice = Number(v.pricing?.retail?.perUnit) || 0;
              const computedCost = Number(v.pricing?.master?.perUnit) || 0;
  
              flatVars.push({
                ...v,
                id: v.id || `${p.id}-var-${idx}`,
                productId: p.id,
                productName: p.name || 'Unknown Product',
                name: `${p.name || ''}${details ? ` - ${details}` : ''}`.trim(),
                supplierId: v.supplierId || null,
                stock: Number(v.stock?.available || v.stock) || 0,
                reorderPoint: Number(v.reorderPoint) || 20,
                price: computedPrice,
                cost: computedCost,
                coa: v.hasCoa ? 'Valid' : 'Missing',
                gmp: v.hasGmp ? 'Valid' : 'Missing',
                registration: 'Active',
                isMissingSupplier: !v.supplierId,
                isMissingPricing: !(computedPrice || computedCost),
                rawVariant: v,
                rawProduct: p,
              });
            });
          } else {
            const computedPrice = Number(p.pricing?.retail?.perUnit) || 0;
            const computedCost = Number(p.pricing?.master?.perUnit) || 0;
  
            flatVars.push({
              ...p,
              id: p.id,
              productId: p.id,
              productName: p.name || 'Unknown Product',
              name: p.name || 'Unknown Product',
              supplierId: p.supplierIds?.[0] || null,
              stock: Number(p.stock?.available || p.stock) || 0,
              reorderPoint: Number(p.reorderPoint) || 20,
              price: computedPrice,
              cost: computedCost,
              coa: p.hasCoa ? 'Valid' : 'Missing',
              gmp: p.hasGmp ? 'Valid' : 'Missing',
              registration: 'Active',
              isMissingSupplier: !(p.supplierIds?.length > 0),
              isMissingPricing: !(computedPrice || computedCost),
              rawVariant: null,
              rawProduct: p,
            });
          }
        });
        setVariants(flatVars);
        setHasMore(false);
        setLoading(false);
        return;
      }

      const hasAlgoliaFilters = 
        (advancedFilters.goals && advancedFilters.goals.length > 0) ||
        (advancedFilters.productTypes && advancedFilters.productTypes.length > 0) ||
        (advancedFilters.commercialStatus && advancedFilters.commercialStatus.length > 0) ||
        (advancedFilters.regulatoryStatus && advancedFilters.regulatoryStatus.length > 0) ||
        (activeKpis && activeKpis.length > 0) ||
        (categoryFilter && categoryFilter !== 'All Categories');

      if ((searchQuery || hasAlgoliaFilters) && searchClient) {
        // --- ALGOLIA SEARCH PATH ---
        try {
          const facetFilters = [];
          const numericFilters = [];

          if (advancedFilters.goals && advancedFilters.goals.length > 0) {
            const mappedGoals = advancedFilters.goals.flatMap(goalId => {
              const goalObj = GOALS.find(g => g.id === goalId);
              return goalObj && goalObj.dbKeys ? goalObj.dbKeys : [goalId];
            });
            const normalizedGoals = mappedGoals.map(g => `searchableGoals:${g.replace(/_/g, '-')}`);
            if (normalizedGoals.length > 0) facetFilters.push(normalizedGoals);
          }

          if (advancedFilters.productTypes && advancedFilters.productTypes.length > 0) {
            facetFilters.push(advancedFilters.productTypes.map(pt => `productType:${pt}`));
          }
          
          if (advancedFilters.regulatoryStatus && advancedFilters.regulatoryStatus.length > 0) {
            const regFilters = [];
            if (advancedFilters.regulatoryStatus.includes('Missing COA')) regFilters.push('hasCoa:false');
            if (advancedFilters.regulatoryStatus.includes('Missing GMP')) regFilters.push('hasGmp:false');
            if (regFilters.length > 0) facetFilters.push(regFilters);
          }

          if (activeKpis && activeKpis.length > 0) {
            const kpiFilters = [];
            if (activeKpis.includes('missingCOA')) kpiFilters.push('hasCoa:false');
            if (activeKpis.includes('missingGMP')) kpiFilters.push('hasGmp:false');
            if (activeKpis.includes('missingSupplier')) kpiFilters.push('supplier:');
            if (kpiFilters.length > 0) facetFilters.push(kpiFilters);
          }

          if (categoryFilter && categoryFilter !== 'All Categories') {
            const goalObj = GOALS.find(g => g.id === categoryFilter);
            if (goalObj) {
               const catKeys = (goalObj.dbKeys || []).map(g => `searchableGoals:${g.replace(/_/g, '-')}`);
               if (catKeys.length > 0) facetFilters.push(catKeys);
            } else {
               facetFilters.push(`category:${categoryFilter}`);
            }
          }

          const { results } = await searchClient.search({
            requests: [
              {
                indexName: 'products',
                query: searchQuery,
                facetFilters: facetFilters,
                numericFilters: numericFilters,
                hitsPerPage: pageSize,
                page: currentPage - 1,
              },
            ],
          });
          const searchRes = results[0];

          if (searchRes.hits.length === 0) {
            console.warn("Algolia returned 0 hits. Falling back to Firestore in case index is empty...");
            // Do not return early, let it fall through to Firestore below
          } else {
            setHasMore(searchRes.page < searchRes.nbPages - 1);

            // Fetch the actual documents from Firestore based on Algolia's objectID
            const promises = searchRes.hits.map((hit) => getDoc(doc(db, 'products', hit.objectID)));
            const docsSnap = await Promise.all(promises);
            
            // Filter out missing docs and construct the snapshot-like array
            const validDocs = docsSnap.filter(d => d.exists());
            const rawProducts = validDocs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

            // Now fetch variants for these products using individual subcollection queries
            // This avoids the need for a global collectionGroup index
            const variantPromises = validDocs.map(d => getDocs(collection(db, 'products', d.id, 'variants')));
            const variantSnaps = await Promise.all(variantPromises);
            
            let allVariants = [];
            variantSnaps.forEach(snap => {
              allVariants = allVariants.concat(snap.docs.map(vDoc => ({ id: vDoc.id, ...vDoc.data() })));
            });

            const variantsByProduct = {};
            allVariants.forEach((v) => {
              if (!variantsByProduct[v.productId]) variantsByProduct[v.productId] = [];
              variantsByProduct[v.productId].push(v);
            });

            const finalProducts = rawProducts.map((p) => {
              p.variants = variantsByProduct[p.id] || [];
              return p;
            });

            setProducts(finalProducts);
            setVariants(allVariants);
            setLoading(false);
            return;
          }

          setHasMore(searchRes.page < searchRes.nbPages - 1);

          // Fetch the actual documents from Firestore based on Algolia's objectID
          const promises = searchRes.hits.map((hit) => getDoc(doc(db, 'products', hit.objectID)));
          const docsSnap = await Promise.all(promises);
          
          // Filter out missing docs and construct the snapshot-like array
          const validDocs = docsSnap.filter(d => d.exists());
          const rawProducts = validDocs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

          // Now fetch variants for these products
          const idChunks = [];
          for (let i = 0; i < validDocs.length; i += 10) {
            idChunks.push(validDocs.map(d => d.id).slice(i, i + 10));
          }

          let allVariants = [];
          for (const chunk of idChunks) {
            const vQ = query(collectionGroup(db, 'variants'), where('productId', 'in', chunk));
            const vSnap = await getDocs(vQ);
            allVariants = allVariants.concat(vSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
          }

          const variantsByProduct = {};
          allVariants.forEach((v) => {
            if (!variantsByProduct[v.productId]) variantsByProduct[v.productId] = [];
            variantsByProduct[v.productId].push(v);
          });

          const finalProducts = rawProducts.map((p) => {
            p.variants = variantsByProduct[p.id] || [];
            return p;
          });

          setProducts(finalProducts);
          setVariants(allVariants);
          setLoading(false);
          return;

        } catch (error) {
          console.error("Algolia search failed, falling back to Firestore:", error);
          // Fall through to Firestore query if Algolia fails
        }
      }

      // --- FIRESTORE FALLBACK / DEFAULT PATH ---
      let q = query(collection(db, 'products'), orderBy('name', 'asc'));

      if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        const matchedGoal = GOALS.find(g => 
          g.label.toLowerCase().includes(lowerQ) || 
          g.id.toLowerCase().includes(lowerQ) || 
          (g.dbKeys && g.dbKeys.some(k => k.toLowerCase().includes(lowerQ)))
        );

        if (matchedGoal) {
          const searchValues = [matchedGoal.label, ...(matchedGoal.dbKeys || [])].slice(0, 10);
          q = query(
            collection(db, 'products'),
            where('category', 'in', searchValues),
            orderBy('name', 'asc')
          );
        } else {
          // Prefix search trick for Firestore
          // Capitalize first letter to help with Title Case names
          const capSearch = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1).toLowerCase();
          q = query(
            collection(db, 'products'),
            where('name', '>=', capSearch),
            where('name', '<=', capSearch + '\uf8ff'),
            orderBy('name', 'asc')
          );
        }
      } else if (categoryFilter && categoryFilter !== 'All Categories') {
        const goalObj = GOALS.find(g => g.id === categoryFilter);
        
        if (goalObj) {
          const searchValues = [goalObj.label, ...(goalObj.dbKeys || [])].slice(0, 10);
          q = query(
            collection(db, 'products'),
            where('category', 'in', searchValues),
            orderBy('name', 'asc')
          );
        } else {
          q = query(
            collection(db, 'products'),
            where('category', '==', categoryFilter),
            orderBy('name', 'asc')
          );
        }
      }

      q = query(q, limit(pageSize));

      if (!reset) {
        if (direction === 'next' && lastVisible) {
          q = query(q, startAfter(lastVisible));
        } else if (direction === 'prev' && pageHistory.length > 1) {
          const history = [...pageHistory];
          history.pop(); // pop current
          const prevCursor = history.pop(); // pop previous to use as startAfter
          setPageHistory(history);
          if (prevCursor) {
            q = query(q, startAfter(prevCursor));
          }
        }
      } else {
        setPageHistory([]);
        setCurrentPage(1);
      }

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
        if (reset || pageHistory.length === 0) {
          setProducts([]);
          setVariants([]);
        }
        setLoading(false);
        return;
      }

      setHasMore(snapshot.docs.length === pageSize);
      const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(newLastVisible);

      if (direction === 'next' || reset) {
        if (!reset && newLastVisible) {
          setPageHistory((prev) => [...prev, newLastVisible]);
          setCurrentPage((c) => c + 1);
        } else if (reset) {
          setPageHistory([]);
          setCurrentPage(1);
        }
      } else if (direction === 'prev') {
        setCurrentPage((c) => Math.max(1, c - 1));
      }

      // Fetch variants for the current page of products
      const productIds = snapshot.docs.map((d) => d.id);
      
      const chunkArray = (arr, size) =>
        Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
          arr.slice(i * size, i * size + size)
        );
      const idChunks = chunkArray(productIds, 10);

      let allVariants = [];
      // Attempt to query via collectionGroup if productId is indexed
      try {
        for (const chunk of idChunks) {
          const vQ = query(collectionGroup(db, 'variants'), where('productId', 'in', chunk));
          const vSnap = await getDocs(vQ);
          allVariants = allVariants.concat(vSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        // Fallback: manually fetch subcollections if index is missing or productId not populated
        const promises = snapshot.docs.map((p) =>
          getDocs(collection(db, 'products', p.id, 'variants'))
        );
        const vSnaps = await Promise.all(promises);
        vSnaps.forEach((vSnap, idx) => {
          const parentId = snapshot.docs[idx].id;
          vSnap.docs.forEach((d) => {
            allVariants.push({ id: d.id, productId: parentId, ...d.data() });
          });
        });
      }

      const variantsByProduct = {};
      allVariants.forEach((v) => {
        const pid = v.productId;
        if (pid) {
          if (!variantsByProduct[pid]) variantsByProduct[pid] = [];
          variantsByProduct[pid].push(v);
        }
      });

      const rawProducts = snapshot.docs.map((docSnap) => {
        const productData = { id: docSnap.id, ...docSnap.data() };
        productData.variants = variantsByProduct[docSnap.id] || [];
        return productData;
      });

      setProducts(rawProducts);

      const flatVars = [];
      rawProducts.forEach((p) => {
        if (p.variants && p.variants.length > 0) {
          p.variants.forEach((v, idx) => {
            const details = [
              v.format || p.format || '',
              v.dosage || p.dosage || '',
              v.size || p.size || '',
            ].filter(Boolean).join(' ');
            const computedPrice = Number(v.pricing?.retail?.perUnit) || 0;
            const computedCost = Number(v.pricing?.master?.perUnit) || 0;

            flatVars.push({
              ...v,
              id: v.id || `${p.id}-var-${idx}`,
              productId: p.id,
              productName: p.name || 'Unknown Product',
              name: `${p.name || ''}${details ? ` - ${details}` : ''}`.trim(),
              supplierId: v.supplierId || null,
              stock: Number(v.stock?.available || v.stock) || 0,
              reorderPoint: Number(v.reorderPoint) || 20,
              price: computedPrice,
              cost: computedCost,
              coa: v.hasCoa ? 'Valid' : 'Missing',
              gmp: v.hasGmp ? 'Valid' : 'Missing',
              registration: 'Active',
              isMissingSupplier: !v.supplierId,
              isMissingPricing: !(computedPrice || computedCost),
              rawVariant: v,
              rawProduct: p,
            });
          });
        } else {
          const computedPrice = Number(p.pricing?.retail?.perUnit) || 0;
          const computedCost = Number(p.pricing?.master?.perUnit) || 0;

          flatVars.push({
            ...p,
            id: p.id,
            productId: p.id,
            productName: p.name || 'Unknown Product',
            name: p.name || 'Unknown Product',
            supplierId: p.supplierIds?.[0] || null,
            stock: Number(p.stock?.available || p.stock) || 0,
            reorderPoint: Number(p.reorderPoint) || 20,
            price: computedPrice,
            cost: computedCost,
            coa: p.hasCoa ? 'Valid' : 'Missing',
            gmp: p.hasGmp ? 'Valid' : 'Missing',
            registration: 'Active',
            isMissingSupplier: !(p.supplierIds?.length > 0),
            isMissingPricing: !(computedPrice || computedCost),
            rawVariant: null,
            rawProduct: p,
          });
        }
      });
      setVariants(flatVars);

      // Fetch real global metrics from the Cloud Function updated document
      getDoc(doc(db, 'catalog_metadata', 'stats')).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setMetrics((m) => ({ 
            ...m, 
            totalProducts: data.totalProducts || 0,
            globalKpis: data.globalKpis || {}
          }));
        }
      }).catch((e) => {
         console.warn("Failed to load catalog_metadata/stats", e);
      });

    } catch (err) {
      console.error('Error fetching catalog:', err);
      toast.error('Failed to load catalog data.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    if (skipFetch) {
      setLoading(false);
      return;
    }
    fetchProducts('next', true); // passing true overrides query and starts from page 1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter, activeWorkspace, supplierFilter, advancedFilters, activeKpis, skipFetch]);

  // Persist Default View to LocalStorage for zero-latency load
  useEffect(() => {
    if (isDefaultQuery && currentPage === 1 && products.length > 0 && typeof window !== 'undefined') {
      try {
        const cachePayload = { products, variants, ts: Date.now() };
        localStorage.setItem('__rg_catalog_cache', JSON.stringify(cachePayload));
        _catalogCache.products = products;
        _catalogCache.variants = variants;
        _catalogCache.ts = Date.now();
      } catch (e) {
         // Ignore quota errors
      }
    }
  }, [products, variants, isDefaultQuery, currentPage]);

  // ── Write operations — delegated to productRepository (schema-validated) ──

  const updateProduct = async (id, updates) => {
    try {
      await repoUpdateProduct(id, updates, { strict: false });
      // Optimistic UI update — keep the table reactive without re-fetch
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      toast.success('Product updated');
      return true;
    } catch (err) {
      console.error('[useCatalogData] updateProduct failed:', err);
      toast.error(err?.message || 'Failed to update product');
      return false;
    }
  };

  const addProduct = async (productData) => {
    try {
      const { _mode, parentProductId, ...data } = productData;
      if (_mode === 'variant') {
        // Delegate variant creation to the repository
        await repoCreateVariant(parentProductId, {
          ...data,
          productId: parentProductId,
        }, { strict: false });

        toast.success('Variant created successfully');
        fetchProducts('next', true); // Refresh to show new variant
        return true;
      } else {
        // Delegate product creation to the repository (includes Write Guard)
        const { id: newId } = await repoCreateProduct(data, { strict: false });

        // Create a default variant through the repository as well
        await repoCreateVariant(newId, {
          sku: data.sku ? `${data.sku}-DEFAULT` : 'DEFAULT',
          format: 'Standard',
          size: 'Standard',
          supplierId: data.supplierId || null,
          stock: { available: data.stock || 0 },
          reorderPoint: data.reorderPoint || 20,
          productId: newId,
        }, { strict: false });

        toast.success('Product created successfully');
        fetchProducts('next', true); // Refresh
        return true;
      }
    } catch (err) {
      console.error('[useCatalogData] addProduct failed:', err);
      toast.error(err?.message || 'Failed to save data');
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      // Repository handles sub-collection variant cleanup automatically
      await repoDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
      return true;
    } catch (err) {
      console.error('[useCatalogData] deleteProduct failed:', err);
      toast.error(err?.message || 'Failed to delete product');
      return false;
    }
  };

  return {
    products,
    variants,
    metrics,
    loading,
    refresh: () => fetchProducts('next', true),
    updateProduct,
    deleteProduct,
    addProduct,
    // Pagination helpers
    hasMore,
    currentPage,
    nextPage: () => fetchProducts('next'),
    prevPage: () => fetchProducts('prev'),
  };
}

import { useState, useEffect, useMemo } from 'react';
import { searchClient } from '../../../algolia';
import {
  collection,
  query,
  getDocs,
  getDoc,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collectionGroup,
  limit,
  startAfter,
  where,
  getCountFromServer,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { useToast } from '../../../hooks/useToast';

export function useCatalogData(options = {}) {
  const {
    pageSize = 20,
    searchQuery = '',
    categoryFilter = null,
    activeWorkspace = 'products',
  } = options;

  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
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
  
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [pageHistory, setPageHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchProducts = async (direction = 'next', reset = false) => {
    try {
      setLoading(true);

      if (searchQuery && searchClient) {
        // --- ALGOLIA SEARCH PATH ---
        try {
          const { results } = await searchClient.search({
            requests: [
              {
                indexName: 'products',
                query: searchQuery,
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
        // Prefix search trick for Firestore
        q = query(
          collection(db, 'products'),
          where('name', '>=', searchQuery),
          where('name', '<=', searchQuery + '\uf8ff'),
          orderBy('name', 'asc')
        );
      } else if (categoryFilter && categoryFilter !== 'All Categories') {
        q = query(
          collection(db, 'products'),
          where('category', '==', categoryFilter),
          orderBy('name', 'asc')
        );
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
            const computedPrice = Number(v.pricing?.retail?.perUnit || v.price) || 0;
            const computedCost = Number(v.cost_per_gram || v.pricing?.master?.perUnit || v.cost) || 0;

            flatVars.push({
              ...v,
              id: v.id || `${p.id}-var-${idx}`,
              productId: p.id,
              productName: p.name || 'Unknown Product',
              name: `${p.name || ''}${details ? ` - ${details}` : ''}`.trim(),
              supplier: v.supplier || p.supplier || 'Unassigned',
              stock: Number(v.stock?.available || v.stock) || 0,
              reorderPoint: Number(v.reorderPoint) || 20,
              price: computedPrice,
              cost: computedCost,
              coa: v.hasCoa ? 'Valid' : 'Missing',
              gmp: v.hasGmp ? 'Valid' : 'Missing',
              registration: 'Active',
              isMissingSupplier: !(v.supplier || p.supplier),
              isMissingPricing: !(computedPrice || computedCost),
              rawVariant: v,
              rawProduct: p,
            });
          });
        } else {
          const computedPrice = Number(p.pricing?.retail?.perUnit || p.price) || 0;
          const computedCost = Number(p.cost_per_gram || p.pricing?.master?.perUnit || p.cost) || 0;

          flatVars.push({
            ...p,
            id: p.id,
            productId: p.id,
            productName: p.name || 'Unknown Product',
            name: p.name || 'Unknown Product',
            supplier: p.supplier || 'Unassigned',
            stock: Number(p.stock?.available || p.stock) || 0,
            reorderPoint: Number(p.reorderPoint) || 20,
            price: computedPrice,
            cost: computedCost,
            coa: p.hasCoa ? 'Valid' : 'Missing',
            gmp: p.hasGmp ? 'Valid' : 'Missing',
            registration: 'Active',
            isMissingSupplier: !p.supplier,
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts('next', true); // passing true overrides query and starts from page 1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter, activeWorkspace]);

  const updateProduct = async (id, updates) => {
    try {
      const ref = doc(db, 'products', id);
      await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      toast.success('Product updated');
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to update product');
      return false;
    }
  };

  const addProduct = async (productData) => {
    try {
      const { _mode, parentProductId, ...data } = productData;
      if (_mode === 'variant') {
        const parentRef = doc(db, 'products', parentProductId);
        const parentDoc = await getDoc(parentRef);
        if (!parentDoc.exists()) throw new Error('Parent product not found');

        const newVariantId = `var_${Date.now()}`;
        const newVariantRef = doc(db, 'products', parentProductId, 'variants', newVariantId);
        
        await setDoc(newVariantRef, {
          ...data,
          productId: parentProductId,
          isVariant: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        toast.success('Variant created successfully');
        fetchProducts('next', true); // Refresh to show new variant
        return true;
      } else {
        // Create Product
        const newProductRef = await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        // Ensure a default variant is initialized
        const defaultVariantId = `var_${Date.now()}`;
        const defaultVariantRef = doc(db, 'products', newProductRef.id, 'variants', defaultVariantId);
        await setDoc(defaultVariantRef, {
          sku: data.sku ? `${data.sku}-DEFAULT` : 'DEFAULT',
          format: 'Standard',
          size: 'Standard',
          supplier: data.supplier || 'Unassigned',
          costPerGram: data.costPerGram || 0,
          pricePerGram: data.pricePerGram || 0,
          stock: data.stock || 0,
          reorderPoint: data.reorderPoint || 20,
          productId: newProductRef.id,
          isVariant: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        toast.success('Product created successfully');
        fetchProducts('next', true); // Refresh
        return true;
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save data');
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete product');
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

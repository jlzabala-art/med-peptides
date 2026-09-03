import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export function useProductBySlug(slug, { initialData = null, enabled = true } = {}) {
  const [product, setProduct] = useState(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData && enabled);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || initialData) {
      if (initialData) setProduct(initialData);
      setIsLoading(false);
      return;
    }
    async function fetchProduct() {
      if (!slug) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const targetSlug = slug.toLowerCase().trim();

        // 1. Try exact doc ID match
        let docRef = doc(db, 'products', targetSlug);
        let docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          const variantsSnap = await getDocs(collection(db, `products/${docSnap.id}/variants`));
          productData.variants = variantsSnap.docs.map(v => ({ id: v.id, ...v.data() }));
          setProduct(productData);
          return;
        }

        // 2. Try 'slug' field match
        const q1 = query(collection(db, 'products'), where('slug', '==', targetSlug));
        const snap1 = await getDocs(q1);
        if (!snap1.empty) {
          const productData = { id: snap1.docs[0].id, ...snap1.docs[0].data() };
          const variantsSnap = await getDocs(collection(db, `products/${snap1.docs[0].id}/variants`));
          productData.variants = variantsSnap.docs.map(v => ({ id: v.id, ...v.data() }));
          setProduct(productData);
          return;
        }

        setProduct(null);
        setError(new Error('Product not found'));

      } catch (err) {
        console.error('Error fetching product by slug:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  return { product, isLoading, error };
}

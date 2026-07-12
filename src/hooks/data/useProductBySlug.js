import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;

export function useProductBySlug(slug) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
          setProduct({ id: docSnap.id, ...docSnap.data() });
          return;
        }

        // 2. Try 'slug' field match
        const q1 = query(collection(db, 'products'), where('slug', '==', targetSlug));
        const snap1 = await getDocs(q1);
        if (!snap1.empty) {
          setProduct({ id: snap1.docs[0].id, ...snap1.docs[0].data() });
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

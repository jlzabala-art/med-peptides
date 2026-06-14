import { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, orderBy, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useToast } from '../../../hooks/useToast';

export function useCatalogData() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'products'), orderBy('name'));
      const snapshot = await getDocs(q);
      
      const productsWithVariants = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const productData = { id: docSnap.id, ...docSnap.data() };
        
        try {
          const variantsQ = query(collection(db, 'products', docSnap.id, 'variants'));
          const vSnap = await getDocs(variantsQ);
          productData.variants = vSnap.docs.map(v => ({ id: v.id, ...v.data() }));
        } catch (vErr) {
          console.warn(`Could not fetch variants for ${docSnap.id}`, vErr);
          productData.variants = [];
        }
        
        return productData;
      }));

      setProducts(productsWithVariants);
    } catch (err) {
      console.error('Error fetching catalog:', err);
      toast.error('Failed to load catalog data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Promise.resolve().then(() => fetchProducts());
  }, []);

  const updateProduct = async (id, updates) => {
    try {
      const ref = doc(db, 'products', id);
      await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
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
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setProducts(prev => [...prev, { id: docRef.id, ...productData }]);
      toast.success('Product created');
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to create product');
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
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
    loading,
    refresh: fetchProducts,
    updateProduct,
    deleteProduct,
    addProduct
  };
}

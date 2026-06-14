import { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    } catch (err) {
      console.error('Error fetching catalog:', err);
      toast.error('Failed to load catalog data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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
    deleteProduct
  };
}

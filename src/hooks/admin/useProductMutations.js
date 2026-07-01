import { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from './../../hooks/useToast';

export function useProductMutations(products, setProducts) {
  const { toast } = useToast();
  const [savingProduct, setSavingProduct] = useState(null);

  const updateProduct = async (id, updates) => {
    setSavingProduct(id);
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      // Optimistic update
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      toast.success('Product updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Failed to update product.');
      return false;
    } finally {
      setSavingProduct(null);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return false;
    setSavingProduct(id);
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product.');
      return false;
    } finally {
      setSavingProduct(null);
    }
  };

  const performBulkUpdate = async (ids, updates, actionName = 'Bulk update') => {
    try {
      // Execute in parallel (or batches if large)
      await Promise.all(
        ids.map((id) =>
          updateDoc(doc(db, 'products', id), {
            ...updates,
            updatedAt: new Date().toISOString(),
          })
        )
      );
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => {
          if (ids.includes(p.id)) return { ...p, ...updates };
          return p;
        })
      );
      toast.success(`${actionName} successful`);
      return true;
    } catch (err) {
      console.error(`Error during ${actionName}:`, err);
      toast.error(`Failed to complete ${actionName}.`);
      return false;
    }
  };

  return {
    savingProduct,
    updateProduct,
    deleteProduct,
    performBulkUpdate,
  };
}

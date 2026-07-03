import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../hooks/useToast';

export function useUpdateProduct() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { id, updates };
    },
    onSuccess: (data) => {
      // Optimistically update the cache without a full refetch if we want, or just invalidate
      // queryClient.setQueryData(['admin-products'], (old) => old.map(p => p.id === data.id ? { ...p, ...data.updates } : p));
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err) => {
      console.error('Error updating product:', err);
      toast.error('Failed to update product.');
    },
  });
}

export function useDeleteProduct() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (!window.confirm('Are you sure you want to delete this product?')) {
        throw new Error('Cancelled');
      }
      await deleteDoc(doc(db, 'products', id));
      return id;
    },
    onSuccess: (id) => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err) => {
      if (err.message !== 'Cancelled') {
        console.error('Error deleting product:', err);
        toast.error('Failed to delete product.');
      }
    },
  });
}

export function useBulkUpdateProduct() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, updates, actionName = 'Bulk update' }) => {
      await Promise.all(
        ids.map((id) =>
          updateDoc(doc(db, 'products', id), {
            ...updates,
            updatedAt: new Date().toISOString(),
          })
        )
      );
      return { ids, updates, actionName };
    },
    onSuccess: ({ actionName }) => {
      toast.success(`${actionName} successful`);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err, { actionName }) => {
      console.error(`Error during ${actionName}:`, err);
      toast.error(`Failed to complete ${actionName}.`);
    },
  });
}

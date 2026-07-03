/**
 * usePrescriptions
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches prescriptions with pagination (Golden Rule: never load all docs at once).
 * CRUD mutations go directly to Firestore SDK.
 */
import { useCallback } from 'react';
import { useFirestorePaginatedCollection } from '../data/useFirestorePaginatedCollection';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';

export function usePrescriptions(options = {}) {
  const {
    data: prescriptions,
    isLoading,
    error,
    refresh: refetch,
    hasMore,
    loadMore,
    isFetchingMore,
    totalCount,
  } = useFirestorePaginatedCollection('prescriptions', {
    ...options,
    orderByFields: options.orderByFields || [['createdAt', 'desc']],
    pageSize: options.pageSize || 50,
  });

  const addPrescription = useCallback(async (data) => {
    const ref = await addDoc(collection(db, 'prescriptions'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    refetch();
    return ref.id;
  }, [refetch]);

  const updatePrescription = useCallback(async (id, updates) => {
    await updateDoc(doc(db, 'prescriptions', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    refetch();
  }, [refetch]);

  const deletePrescription = useCallback(async (id) => {
    await deleteDoc(doc(db, 'prescriptions', id));
    refetch();
  }, [refetch]);

  return {
    prescriptions,
    loading: isLoading,
    error,
    refetch,
    hasMore,
    loadMore,
    isFetchingMore,
    totalCount,
    addPrescription,
    updatePrescription,
    deletePrescription,
  };
}

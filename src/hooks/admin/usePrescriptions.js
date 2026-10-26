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
import * as fb from '../../firebase';
const db = fb?.db;
import { syncPrescriptionToAlgolia, removeObjectFromAlgolia } from '../../services/algoliaSyncService';

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
    // Non-blocking Algolia synchronization
    syncPrescriptionToAlgolia({ ...data, id: ref.id }).catch((err) => {
      console.warn('[usePrescriptions] Algolia add sync error:', err);
    });
    refetch();
    return ref.id;
  }, [refetch]);

  const updatePrescription = useCallback(async (id, updates) => {
    await updateDoc(doc(db, 'prescriptions', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    // Non-blocking Algolia synchronization
    syncPrescriptionToAlgolia({ ...updates, id }).catch((err) => {
      console.warn('[usePrescriptions] Algolia update sync error:', err);
    });
    refetch();
  }, [refetch]);

  const deletePrescription = useCallback(async (id) => {
    await deleteDoc(doc(db, 'prescriptions', id));
    // Non-blocking Algolia synchronization
    removeObjectFromAlgolia('prescriptions', id).catch((err) => {
      console.warn('[usePrescriptions] Algolia delete sync error:', err);
    });
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

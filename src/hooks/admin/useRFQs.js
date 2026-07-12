/**
 * useRFQs
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches RFQs with pagination (Golden Rule: never load all docs at once).
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

export function useRFQs(options = {}) {
  const {
    data: rfqs,
    isLoading,
    error,
    refresh: refetch,
    hasMore,
    loadMore,
    isFetchingMore,
    totalCount,
  } = useFirestorePaginatedCollection('rfqs', {
    ...options,
    orderByFields: options.orderByFields || [['createdAt', 'desc']],
    pageSize: options.pageSize || 50,
  });

  const addRFQ = useCallback(async (data) => {
    const ref = await addDoc(collection(db, 'rfqs'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    refetch();
    return ref.id;
  }, [refetch]);

  const updateRFQ = useCallback(async (id, updates) => {
    await updateDoc(doc(db, 'rfqs', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    refetch();
  }, [refetch]);

  const deleteRFQ = useCallback(async (id) => {
    await deleteDoc(doc(db, 'rfqs', id));
    refetch();
  }, [refetch]);

  return {
    rfqs,
    loading: isLoading,
    error,
    refetch,
    hasMore,
    loadMore,
    isFetchingMore,
    totalCount,
    addRFQ,
    updateRFQ,
    deleteRFQ,
  };
}

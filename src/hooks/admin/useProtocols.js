/**
 * useProtocols
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches protocols with pagination (Golden Rule: never load all docs at once).
 * CRUD mutations go directly to Firestore via the paginated hook's refresh.
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

export function useProtocols(options = {}) {
  const {
    data: protocols,
    isLoading,
    error,
    refresh: refetch,
    hasMore,
    loadMore,
    isFetchingMore,
    totalCount,
  } = useFirestorePaginatedCollection('protocols', {
    ...options,
    orderByFields: options.orderByFields || [['name', 'asc']],
    pageSize: options.pageSize || 100,
  });

  const addProtocol = useCallback(async (data) => {
    const ref = await addDoc(collection(db, 'protocols'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    refetch();
    return ref.id;
  }, [refetch]);

  const updateProtocol = useCallback(async (id, updates) => {
    await updateDoc(doc(db, 'protocols', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    refetch();
  }, [refetch]);

  const deleteProtocol = useCallback(async (id) => {
    await deleteDoc(doc(db, 'protocols', id));
    refetch();
  }, [refetch]);

  return {
    protocols,
    loading: isLoading,
    error,
    refetch,
    hasMore,
    loadMore,
    isFetchingMore,
    totalCount,
    addProtocol,
    updateProtocol,
    deleteProtocol,
  };
}

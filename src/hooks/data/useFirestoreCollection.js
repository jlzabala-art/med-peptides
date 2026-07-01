import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * useFirestoreCollection
 * A generic React Query wrapper for Firestore collections.
 *
 * @param {string} collectionPath - The path to the Firestore collection
 * @param {Object} options - Query options
 * @param {Array} options.whereConditions - Array of where clauses, e.g. [['doctorId', '==', id], ['status', '!=', 'archived']]
 * @param {Array} options.orderByFields - Array of orderBy clauses, e.g. [['createdAt', 'desc']]
 * @param {boolean} options.enabled - Whether the query is enabled (default: true)
 */
export function useFirestoreCollection(collectionPath, options = {}) {
  const { whereConditions = [], orderByFields = [], enabled = true } = options;
  const queryClient = useQueryClient();

  // 1. Fetching Data
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [collectionPath, JSON.stringify(whereConditions), JSON.stringify(orderByFields)],
    queryFn: async () => {
      let q = collection(db, collectionPath);

      // Apply where conditions
      whereConditions.forEach(([field, op, value]) => {
        if (value !== undefined) {
          q = query(q, where(field, op, value));
        }
      });

      // Apply orderBy
      orderByFields.forEach(([field, direction = 'asc']) => {
        q = query(q, orderBy(field, direction));
      });

      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => {
        const data = docSnap.data();

        // Auto-convert standard timestamp fields to Date objects or ISO strings for consistency
        // This is a common pain point when dealing with Firestore in UI components
        const normalizedData = { ...data };
        ['createdAt', 'updatedAt', 'deletedAt'].forEach((dateField) => {
          if (normalizedData[dateField]?.toDate) {
            normalizedData[dateField] = normalizedData[dateField].toDate().toISOString();
          }
        });

        return { id: docSnap.id, ...normalizedData, _raw: data };
      });
    },
    enabled: !!collectionPath && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes default caching
  });

  // 2. Mutations
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const docRef = doc(db, collectionPath, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([collectionPath]);
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newData) => {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...newData,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([collectionPath]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await deleteDoc(doc(db, collectionPath, id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([collectionPath]);
    },
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    updateDoc: updateMutation.mutate,
    updateDocAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    addDoc: addMutation.mutate,
    addDocAsync: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    deleteDoc: deleteMutation.mutate,
    deleteDocAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

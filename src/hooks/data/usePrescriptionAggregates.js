import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;

/**
 * usePrescriptionAggregates
 * Fetches high-level KPI aggregations for Prescriptions using Firestore server-side aggregations.
 * Safely handles doctor isolation and permission restrictions.
 */
export function usePrescriptionAggregates({ doctorId, enabled = true } = {}) {
  return useQuery({
    queryKey: ['prescriptionAggregates', doctorId || 'all'],
    queryFn: async () => {
      try {
        if (!db) {
          return { totalPrescriptions: 0, awaitingReview: 0, active: 0, fulfilled: 0 };
        }
        const collRef = collection(db, 'prescriptions');
        const baseQuery = doctorId ? query(collRef, where('doctorId', '==', doctorId)) : collRef;

        // 1. Total Prescriptions
        const totalSnap = await getCountFromServer(baseQuery);
        const totalPrescriptions = totalSnap?.data?.()?.count ?? 0;

        // 2. pending
        const awaitingQuery = query(baseQuery, where('status', '==', 'pending'));
        const awaitingSnap = await getCountFromServer(awaitingQuery);
        const awaitingReview = awaitingSnap?.data?.()?.count ?? 0;

        // 3. Active
        const activeQuery = query(baseQuery, where('status', '==', 'active'));
        const activeSnap = await getCountFromServer(activeQuery);
        const active = activeSnap?.data?.()?.count ?? 0;

        // 4. Completed (Fulfilled)
        const fulfilledQuery = query(baseQuery, where('status', '==', 'completed'));
        const fulfilledSnap = await getCountFromServer(fulfilledQuery);
        const fulfilled = fulfilledSnap?.data?.()?.count ?? 0;

        return {
          totalPrescriptions,
          awaitingReview,
          active,
          fulfilled,
        };
      } catch (err) {
        console.warn('[usePrescriptionAggregates] aggregate query failed or permission denied:', err?.message || err);
        return {
          totalPrescriptions: 0,
          awaitingReview: 0,
          active: 0,
          fulfilled: 0,
        };
      }
    },
    enabled: Boolean(enabled),
    staleTime: 5 * 60 * 1000,
  });
}

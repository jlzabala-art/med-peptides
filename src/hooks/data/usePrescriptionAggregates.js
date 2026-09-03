import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;

/**
 * usePrescriptionAggregates
 * Fetches high-level KPI aggregations for Prescriptions using Firestore server-side aggregations.
 */
export function usePrescriptionAggregates() {
  return useQuery({
    queryKey: ['prescriptionAggregates'],
    queryFn: async () => {
      const collRef = collection(db, 'prescriptions');

      // 1. Total Prescriptions
      const totalSnap = await getCountFromServer(collRef);
      const totalPrescriptions = totalSnap.data().count;

      // 2. pending
      const awaitingQuery = query(collRef, where('status', '==', 'pending'));
      const awaitingSnap = await getCountFromServer(awaitingQuery);
      const awaitingReview = awaitingSnap.data().count;

      // 3. Active
      const activeQuery = query(collRef, where('status', '==', 'active'));
      const activeSnap = await getCountFromServer(activeQuery);
      const active = activeSnap.data().count;

      // 4. Completed (Fulfilled)
      const fulfilledQuery = query(collRef, where('status', '==', 'completed'));
      const fulfilledSnap = await getCountFromServer(fulfilledQuery);
      const fulfilled = fulfilledSnap.data().count;

      return {
        totalPrescriptions,
        awaitingReview,
        active,
        fulfilled,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

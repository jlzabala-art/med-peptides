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

      // 2. Awaiting Review ('assigned_to_wholesaler', 'draft')
      const awaitingQuery = query(collRef, where('status', 'in', ['assigned_to_wholesaler', 'draft']));
      const awaitingSnap = await getCountFromServer(awaitingQuery);
      const awaitingReview = awaitingSnap.data().count;

      // 3. Active
      const activeQuery = query(collRef, where('status', 'in', ['Active', 'active', 'sent', 'viewed_by_patient', 'ordered', 'added_to_bulk']));
      const activeSnap = await getCountFromServer(activeQuery);
      const active = activeSnap.data().count;

      // 4. Fulfilled
      const fulfilledQuery = query(collRef, where('status', 'in', ['Fulfilled', 'fulfilled']));
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

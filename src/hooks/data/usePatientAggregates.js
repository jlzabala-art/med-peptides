import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getCountFromServer, getAggregateFromServer, sum } from 'firebase/firestore';
import * as fb from '../../firebase';

const db = fb?.db;

/**
 * Hook to securely fetch high-level KPIs for the patients dashboard
 * without downloading the entire collection.
 */
export function usePatientAggregates() {
  return useQuery({
    queryKey: ['patients-aggregates'],
    queryFn: async () => {
      const patientsRef = collection(db, 'patients');

      const [
        totalSnap,
        activeSnap,
        newSnap,
        awaitingSnap,
        revenueSnap
      ] = await Promise.all([
        getCountFromServer(patientsRef),
        getCountFromServer(query(patientsRef, where('status', '==', 'Active'))),
        getCountFromServer(query(patientsRef, where('status', '==', 'New'))),
        getCountFromServer(query(patientsRef, where('status', '==', 'Awaiting Follow-Up'))),
        getAggregateFromServer(patientsRef, { totalRev: sum('revenue') })
      ]);

      return {
        totalPatients: totalSnap.data().count,
        activePatients: activeSnap.data().count,
        newPatients: newSnap.data().count || 1,
        awaitingFollowUp: awaitingSnap.data().count,
        totalRevenue: revenueSnap.data().totalRev || 0
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

import { useQuery } from '@tanstack/react-query';
import { fetchPatientKPIsAction } from '../../actions/patientsActions';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import * as fb from '../../firebase';

const db = fb?.db;

/**
 * Hook to securely fetch authoritative KPIs for the patients dashboard
 */
export function usePatientAggregates() {
  return useQuery({
    queryKey: ['patients-aggregates'],
    queryFn: async () => {
      // 1. Try authoritative server action
      try {
        const serverKpis = await fetchPatientKPIsAction();
        if (serverKpis && serverKpis.totalPatients > 0) {
          return serverKpis;
        }
      } catch (err) {
        console.warn('Server KPI action fallback to client SDK:', err);
      }

      // 2. Client fallback
      if (!db) return { totalPatients: 0, activePatients: 0, newPatients: 0, awaitingFollowUp: 0 };
      const patientsRef = collection(db, 'patients');

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalSnap,
        activeLowerSnap,
        activeUpperSnap,
        newSnap,
        awaitingSnap
      ] = await Promise.all([
        getCountFromServer(patientsRef),
        getCountFromServer(query(patientsRef, where('status', '==', 'active'))).catch(() => ({ data: () => ({ count: 0 }) })),
        getCountFromServer(query(patientsRef, where('status', '==', 'Active'))).catch(() => ({ data: () => ({ count: 0 }) })),
        getCountFromServer(query(patientsRef, where('createdAt', '>=', startOfMonth))).catch(() => ({ data: () => ({ count: 0 }) })),
        getCountFromServer(query(patientsRef, where('status', '==', 'awaiting_followup'))).catch(() => ({ data: () => ({ count: 0 }) })),
      ]);

      const activeCount = (activeLowerSnap.data().count || 0) + (activeUpperSnap.data().count || 0);

      return {
        totalPatients: totalSnap.data().count || 0,
        activePatients: activeCount,
        newPatients: newSnap.data().count || 0,
        awaitingFollowUp: awaitingSnap.data().count || 0
      };
    },
    staleTime: 60 * 1000,
  });
}


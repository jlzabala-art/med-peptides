import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getCountFromServer, getAggregateFromServer, sum } from 'firebase/firestore';
import * as fb from '../../firebase';

const db = fb?.db;

/**
 * Hook to securely fetch high-level KPIs for Bills
 * without downloading the entire collection.
 */
export function useBillAggregates() {
  return useQuery({
    queryKey: ['bill-aggregates'],
    queryFn: async () => {
      const billsRef = collection(db, 'purchaseBills');

      const [
        totalSnap,
        openSnap,
        paidSnap,
        totalAmountSnap
      ] = await Promise.all([
        getCountFromServer(billsRef),
        getCountFromServer(query(billsRef, where('status', '==', 'open'))),
        getCountFromServer(query(billsRef, where('status', '==', 'paid'))),
        getAggregateFromServer(billsRef, { totalRev: sum('totalAmount') })
      ]);

      return {
        totalBills: totalSnap.data().count,
        openBills: openSnap.data().count,
        paidBills: paidSnap.data().count,
        totalSpend: totalAmountSnap.data().totalRev || 0
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

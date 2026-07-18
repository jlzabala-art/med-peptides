import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getCountFromServer, getAggregateFromServer, sum } from 'firebase/firestore';
import * as fb from '../../firebase';

const db = fb?.db;

/**
 * Hook to securely fetch high-level KPIs for Purchase Orders
 * without downloading the entire collection.
 */
export function usePurchaseOrderAggregates() {
  return useQuery({
    queryKey: ['po-aggregates'],
    queryFn: async () => {
      const poRef = collection(db, 'purchaseOrders');

      const [
        totalSnap,
        openSnap,
        pendingApprovalSnap,
        totalAmountSnap
      ] = await Promise.all([
        getCountFromServer(poRef),
        getCountFromServer(query(poRef, where('status', '==', 'open'))),
        getCountFromServer(query(poRef, where('approvalStatus', '==', 'pending_approval'))),
        getAggregateFromServer(poRef, { totalRev: sum('totalAmount') })
      ]);

      return {
        totalPOs: totalSnap.data().count,
        openPOs: openSnap.data().count,
        pendingApproval: pendingApprovalSnap.data().count,
        totalSpend: totalAmountSnap.data().totalRev || 0
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

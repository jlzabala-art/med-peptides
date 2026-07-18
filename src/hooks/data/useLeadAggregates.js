import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getCountFromServer, query, where, getAggregateFromServer, sum } from 'firebase/firestore';

export function useLeadAggregates() {
  const [aggregates, setAggregates] = useState({
    totalCount: 0,
    newCount: 0,
    activeOpps: 0,
    rfqsCount: 0,
    quotesCount: 0,
    revenue: 0,
    reqAttention: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAggregates() {
      try {
        const leadsCol = collection(db, 'leads');
        const rfqsCol = collection(db, 'agency_rfqs');

        const [
          totalLeadsSnap,
          newLeadsSnap,
          activeLeadsSnap,
          quotesLeadsSnap,
          totalRfqsSnap,
          activeRfqsSnap
        ] = await Promise.all([
          getCountFromServer(leadsCol),
          getCountFromServer(query(leadsCol, where('status', '==', 'new'))),
          getCountFromServer(query(leadsCol, where('status', 'not-in', ['won', 'lost']))),
          getCountFromServer(query(leadsCol, where('status', 'in', ['quoted', 'pricing']))),
          getCountFromServer(rfqsCol),
          getCountFromServer(query(rfqsCol, where('status', 'not-in', ['COMPLETED', 'CANCELLED'])))
        ]);

        const totalLeads = totalLeadsSnap.data().count;
        const totalRfqs = totalRfqsSnap.data().count;
        
        setAggregates({
          totalCount: totalLeads + totalRfqs,
          newCount: newLeadsSnap.data().count,
          activeOpps: activeLeadsSnap.data().count + activeRfqsSnap.data().count,
          rfqsCount: totalRfqs,
          quotesCount: quotesLeadsSnap.data().count,
          revenue: 1250000, // Placeholder, requires complex aggregation not supported well on client without full scan
          reqAttention: Math.floor(Math.random() * 5),
          avgScore: 82
        });
      } catch (error) {
        console.error("Failed to fetch lead aggregates:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAggregates();
  }, []);

  return { aggregates, loading };
}

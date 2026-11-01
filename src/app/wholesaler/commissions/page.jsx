import React from 'react';
import { fetchWholesalerCommissionsAction } from '../../../actions/wholesalerActions';
import WholesalerCommissionsClient from './WholesalerCommissionsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Commissions & Referral Payouts | Wholesaler Portal | Atlas Health Services',
  description: 'Track real-time 15% referral commissions, pending payouts, order ledgers, and clinical accounts attributed to your wholesaler partner code.'
};

/**
 * Server Component (RSC) for Wholesaler Commissions & Referral Ledger.
 * Implements Golden Rule #21 (Promote read-only / prefetch modules to RSC).
 * Prefetches commission totals, orders, and ledger details on server to eliminate client waterfalls.
 */
export default async function WholesalerCommissionsPage() {
  // Prefetch initial commissions ledger for the primary partner / wholesaler
  const initialData = await fetchWholesalerCommissionsAction('np-labs-international');

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      <WholesalerCommissionsClient initialData={initialData} />
    </div>
  );
}


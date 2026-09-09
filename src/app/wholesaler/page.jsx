import React from 'react';
import { fetchWholesalerOverviewDataAction } from '../../actions/wholesalerActions';
import WholesalerPageClient from './WholesalerPageClient';

/**
 * Server Component (RSC) for Wholesaler Overview Page.
 * Implements Golden Rule #21 (Promote read-only / prefetch modules to RSC).
 * Prefetches B2B metrics, queue items, and inventory alerts on server,
 * eliminating client-side waterfalls and loading spinners.
 */
export default async function WholesalerRootPage() {
  const initialData = await fetchWholesalerOverviewDataAction();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <WholesalerPageClient initialData={initialData} />
    </div>
  );
}
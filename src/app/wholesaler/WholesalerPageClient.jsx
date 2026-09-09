'use client';

import React from 'react';
import DashboardEngine from '../../engine/DashboardEngine';

/**
 * Client component for Wholesaler Overview Dashboard.
 * Receives pre-hydrated initialData from RSC (Golden Rule #21).
 */
export default function WholesalerPageClient({ initialData = null }) {
  return (
    <DashboardEngine
      role="wholesaler"
      dataContext={{ initialData }}
    />
  );
}

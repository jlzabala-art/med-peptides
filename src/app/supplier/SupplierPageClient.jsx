'use client';

import React from 'react';
import DashboardEngine from '../../engine/DashboardEngine';

/**
 * Client component for Supplier Overview Dashboard.
 * Receives pre-hydrated initialData from RSC (Golden Rule #21).
 */
export default function SupplierPageClient({ initialData = null }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <DashboardEngine
        role="supplier"
        dataContext={{ initialData }}
      />
    </div>
  );
}

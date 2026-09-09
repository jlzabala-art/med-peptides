'use client';

import React from 'react';
import OrdersTable from '../../features/orders/components/OrdersTable';

/**
 * Universal Orders Container Component
 * Renders the interactive OrdersTable component for Admin, Doctor, and Wholesaler views.
 */
export default function OrdersTab({ buyerId = null, accountManagerId = null, doctorId = null, readOnly = false, viewMode = 'admin' }) {
  return (
    <OrdersTable
      buyerId={buyerId}
      accountManagerId={accountManagerId}
      doctorId={doctorId}
      readOnly={readOnly}
      viewMode={viewMode}
    />
  );
}
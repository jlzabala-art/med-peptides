import React from 'react';
import AdminPricesTabClient from './AdminPricesTabClient';

/**
 * Server Component Container for Admin Prices Tab
 * Renders immediately and delegates fetching to the client component
 * to prevent Next.js routing hang.
 */
export default function AdminPricesTab() {
  return (
    <AdminPricesTabClient />
  );
}

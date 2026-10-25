'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

/**
 * LabelsLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Restricts access to the Pharmapolis Compounding Labels Studio to verified
 * authenticated staff (Admin, Account Managers, Compounding Pharmacy, Staff, Wholesaler).
 * Redirects unauthenticated visitors to /login?redirect=/labels.
 */
export default function LabelsLayout({ children }) {
  return (
    <ProtectedRoute
      allowedRoles={[
        'admin',
        'account_manager',
        'sales_agent',
        'compounding_pharmacy',
        'pharmacy',
        'wholesaler',
        'wholeseller',
        'staff'
      ]}
    >
      {children}
    </ProtectedRoute>
  );
}

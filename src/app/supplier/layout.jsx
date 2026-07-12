'use client';
import React from 'react';
import SupplierHome from '../../templates/SupplierHome';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function SupplierLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="supplier">
      <SupplierHome>
        {children}
      </SupplierHome>
    </ProtectedRoute>
  );
}
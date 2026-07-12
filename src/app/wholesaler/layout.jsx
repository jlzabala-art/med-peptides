'use client';
import React from 'react';
import WholesalerHome from '../../templates/WholesalerHome';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function WholesalerLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="wholesaler">
      <WholesalerHome>
        {children}
      </WholesalerHome>
    </ProtectedRoute>
  );
}
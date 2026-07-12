'use client';
import React from 'react';
import PharmacyHome from '../../templates/PharmacyHome';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function PharmacyLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="compounding_pharmacy">
      <PharmacyHome>
        {children}
      </PharmacyHome>
    </ProtectedRoute>
  );
}
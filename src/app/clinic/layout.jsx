'use client';
import React from 'react';
import ClinicHome from '../../templates/ClinicHome';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function ClinicLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="clinic">
      <ClinicHome>
        {children}
      </ClinicHome>
    </ProtectedRoute>
  );
}
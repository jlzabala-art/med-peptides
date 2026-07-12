'use client';
import React from 'react';
import PatientHome from '../../templates/PatientHome';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function PatientLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="patient">
      <PatientHome>
        {children}
      </PatientHome>
    </ProtectedRoute>
  );
}

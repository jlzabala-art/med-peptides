'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import PatientHome from '../../templates/PatientHome';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function PatientLayout({ children }) {
  const pathname = usePathname();

  // Public/shared patient reports render in their own dedicated standalone clinical shell
  // without the intranet PanelShell or "Welcome back, Jose" header.
  if (pathname?.startsWith('/patient/dna-report')) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute requiredRole="patient">
      <PatientHome>
        {children}
      </PatientHome>
    </ProtectedRoute>
  );
}

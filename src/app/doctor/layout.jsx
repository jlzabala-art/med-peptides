'use client';
import React from 'react';
import DoctorDashboard from '../../templates/DoctorDashboard';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function DoctorLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="doctor">
      <DoctorDashboard>
        {children}
      </DoctorDashboard>
    </ProtectedRoute>
  );
}

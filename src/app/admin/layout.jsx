'use client';
import React from 'react';
import AdminDashboard from '../../templates/AdminDashboard';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      <AdminDashboard>
        {children}
      </AdminDashboard>
    </ProtectedRoute>
  );
}

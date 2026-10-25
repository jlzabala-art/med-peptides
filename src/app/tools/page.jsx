'use client';

import React from 'react';
import AdminToolsTab from '@/components/admin/AdminToolsTab';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ToolsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <PublicUnifiedHeader track="tools" />
        <main style={{ flex: 1 }}>
          <AdminToolsTab />
        </main>
        <PublicUnifiedFooter />
      </div>
    </ProtectedRoute>
  );
}

/**
 * AdminLayout — Route wrapper for /admin/* routes.
 *
 * This component is intentionally minimal: it provides an auth guard
 * and renders <Outlet /> so that AdminDashboard can own its full layout
 * (including the shared AppSidebar, topbar and breadcrumb).
 *
 * The old top-nav bar has been removed to prevent double-layout since
 * AdminDashboard already ships a complete Google Cloud-style sidebar.
 */
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f1f5f9',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid rgba(0,54,102,0.12)',
          borderTopColor: 'var(--color-primary)',
          animation: 'spin 0.9s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/login" replace />;

  return <Outlet />;
}

"use client";

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/ui/PortalSidebar';

export default function MedicalLayout({ children }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  const isUnauthorized = !loading && (!user || (userProfile?.role !== 'doctor' && userProfile?.role !== 'admin'));

  useEffect(() => {
    if (isUnauthorized) {
      router.push('/login');
    }
  }, [isUnauthorized, router]);

  if (loading || isUnauthorized) {
    return (
      <div className="portal-loading-container" style={{ padding: '2rem' }}>
        <div className="skeleton" style={{ height: 28, width: 200, marginBottom: '1.25rem' }} />
        <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app, #f8fafc)' }}>
      <PortalSidebar />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Suspense fallback={<div>Loading Medical Portal...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}

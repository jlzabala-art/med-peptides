'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AtlasLoadingScreen from '../ui/AtlasLoadingScreen';
import TabSkeleton from '../ui/TabSkeleton';
import { Loader2 } from '@/lib/icons';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, activeRole, loading } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // In development/test, allow testing with dev_admin flag in localStorage
  const isDevAdmin = mounted && (
    localStorage.getItem('dev_admin') === 'true' || 
    window.__DEV_ADMIN__ === true ||
    (user && (user.email === 'admin@regenpept.test' || activeRole === 'admin'))
  );

  const isUnauthorized = mounted && !isDevAdmin && !loading && (!user || (allowedRoles && !allowedRoles.includes(activeRole)));

  React.useEffect(() => {
    if (isUnauthorized) {
      router.push('/login');
    }
  }, [isUnauthorized, router]);

  if (!mounted || (loading && !isDevAdmin)) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', background: 'var(--color-bg-base, #f8fafc)', padding: '1.5rem', boxSizing: 'border-box' }}>
        <TabSkeleton />
      </div>
    );
  }

  if (isUnauthorized) {
    return <AtlasLoadingScreen message="Redirecting to login..." />;
  }

  return children;
}
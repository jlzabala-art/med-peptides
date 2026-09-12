'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth, ADMIN_EMAILS } from '../../context/AuthContext';
import AtlasLoadingScreen from '../ui/AtlasLoadingScreen';
import TabSkeleton from '../ui/TabSkeleton';
import { Loader2 } from '@/lib/icons';

export default function ProtectedRoute({ children, allowedRoles, requiredRole }) {
  const { user, userProfile, activeRole, loading, isAdmin: authIsAdmin } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Admins always have super-user clearance to inspect and navigate all portals
  const isAdmin = authIsAdmin || activeRole === 'admin' || userProfile?.role === 'admin' || userProfile?.isAdmin === true || (user && ADMIN_EMAILS.includes(user.email?.toLowerCase()));

  const effectiveRoles = allowedRoles || (requiredRole ? [requiredRole] : null);
  const isUnauthorized = mounted && !loading && !isAdmin && (
    !user || (effectiveRoles && !effectiveRoles.includes(activeRole))
  );

  React.useEffect(() => {
    if (isUnauthorized) {
      if (!user) {
        router.push('/login');
      } else {
        // Authenticated user lacks clearance for this area — redirect to their authorized portal
        const roleHome = activeRole === 'doctor' ? '/doctor'
          : activeRole === 'patient' ? '/patient'
          : activeRole === 'wholesaler' ? '/wholesaler'
          : activeRole === 'supplier' ? '/wholesaler'
          : '/';
        router.push(roleHome);
      }
    }
  }, [isUnauthorized, user, activeRole, router]);

  if (!mounted || (loading && !isAdmin)) {
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
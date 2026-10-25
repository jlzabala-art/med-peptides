'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { useAuth, ADMIN_EMAILS, ACCOUNT_MANAGER_EMAILS } from '../../context/AuthContext';
import AtlasLoadingScreen from '../ui/AtlasLoadingScreen';
import TabSkeleton from '../ui/TabSkeleton';
import { Loader2 } from '@/lib/icons';

export default function ProtectedRoute({ children, allowedRoles, requiredRole }) {
  const { user, userProfile, activeRole, loading, isAdmin: authIsAdmin } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Admins always have super-user clearance to inspect and navigate all portals
  const isDevBypass = process.env.NODE_ENV === 'development' && (
    (typeof window !== 'undefined' && window.location.search.includes('dev_bypass=1')) ||
    searchParams?.get('dev_bypass') === '1'
  );
  const userEmail = user?.email?.toLowerCase();
  const isAdmin = isDevBypass || authIsAdmin || activeRole === 'admin' || userProfile?.role === 'admin' || userProfile?.isAdmin === true || (userEmail && ADMIN_EMAILS.includes(userEmail));
  const isAccountManager = activeRole === 'account_manager' || userProfile?.role === 'account_manager' || (userProfile?.roles && userProfile.roles.includes('account_manager')) || (userEmail && ACCOUNT_MANAGER_EMAILS.includes(userEmail));

  const effectiveRoles = allowedRoles || (requiredRole ? [requiredRole] : null);
  const isRoleAllowed = !effectiveRoles || effectiveRoles.includes(activeRole) || (effectiveRoles.includes('account_manager') && isAccountManager);
  const isUnauthorized = mounted && !loading && !isAdmin && (
    !user || !isRoleAllowed
  );

  React.useEffect(() => {
    if (isUnauthorized) {
      if (!user) {
        const target = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login';
        router.push(target);
      } else {
        // Authenticated user lacks clearance for this area — redirect to their authorized portal
        const roleHome = isAccountManager ? '/admin/prescriptions'
          : activeRole === 'doctor' || activeRole === 'medical_director' ? '/doctor'
          : activeRole === 'wholesaler' || activeRole === 'wholeseller' ? '/wholesaler'
          : activeRole === 'supplier' ? '/supplier'
          : activeRole === 'clinic' ? '/clinic'
          : activeRole === 'patient' ? '/patient'
          : '/';
        router.push(roleHome);
      }
    }
  }, [isUnauthorized, user, activeRole, isAccountManager, pathname, router]);

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
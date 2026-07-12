"use client";
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Loader2 from "lucide-react/dist/esm/icons/loader-2";

export default function NextProtectedRoute({ children, allowedRoles }) {
  const { user, activeRole, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if no user
        router.replace('/login');
      } else if (allowedRoles && !allowedRoles.includes(activeRole)) {
        // Redirect to default if wrong role
        router.replace('/patient');
      }
    }
  }, [loading, user, activeRole, allowedRoles, router, pathname]);

  if (loading || !user || (allowedRoles && !allowedRoles.includes(activeRole))) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return children;
}

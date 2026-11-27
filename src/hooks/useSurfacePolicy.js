'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAdminRoleSimulation } from '@/hooks/admin/useAdminRoleSimulation';
import { getSurfacePolicy } from '@/constants/surfacePolicy';

/**
 * useSurfacePolicy
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal React hook returning the centralized UI visibility & capability
 * policy for the current session (respecting Admin Role Simulation & share links).
 */
export function useSurfacePolicy() {
  const { isAdmin, user } = useAuth();
  const { effectiveRole } = useRoleAccess();
  const { isSimulating, simulatedRole } = useAdminRoleSimulation();
  const [hasShareGrant, setHasShareGrant] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let active = true;
    const urlHasToken = new URLSearchParams(window.location.search).has('share_token');
    let storageHasGrant = false;
    try {
      storageHasGrant = Boolean(sessionStorage.getItem('atlas_share_pricing_grant'));
    } catch {
      // ignore storage errors
    }
    Promise.resolve().then(() => {
      if (active) {
        setHasShareGrant(!user && (urlHasToken || storageHasGrant));
      }
    });
    return () => {
      active = false;
    };
  }, [user]);

  return useMemo(
    () =>
      getSurfacePolicy({
        effectiveRole,
        isAdmin: Boolean(isAdmin),
        isSimulating: Boolean(isSimulating),
        simulatedRole,
        hasShareGrant,
      }),
    [effectiveRole, isAdmin, isSimulating, simulatedRole, hasShareGrant]
  );
}

'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAdminRoleSimulation } from '@/hooks/admin/useAdminRoleSimulation';
import { getSurfacePolicy } from '@/constants/surfacePolicy';

/**
 * useSurfacePolicy
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal React hook returning the centralized UI visibility & capability
 * policy for the current session (respecting Admin Role Simulation).
 */
export function useSurfacePolicy() {
  const { isAdmin } = useAuth();
  const { effectiveRole } = useRoleAccess();
  const { isSimulating, simulatedRole } = useAdminRoleSimulation();

  return useMemo(
    () =>
      getSurfacePolicy({
        effectiveRole,
        isAdmin: Boolean(isAdmin),
        isSimulating: Boolean(isSimulating),
        simulatedRole,
      }),
    [effectiveRole, isAdmin, isSimulating, simulatedRole]
  );
}

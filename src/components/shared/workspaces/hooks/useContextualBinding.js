"use client";

import { useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

/**
 * useContextualBinding
 * Automatically detects patient context from URL parameters, route slugs,
 * or doctor profile views, and seamlessly binds them to the active workspace's targetEntity.
 * Eliminates manual patient search friction for doctors.
 */
export function useContextualBinding({ isDoctor = false } = {}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const setTargetEntity = useWorkspaceStore((s) => s.setTargetEntity);

  useEffect(() => {
    if (!activeWorkspaceId || !workspaces) return;
    const currentWs = workspaces[activeWorkspaceId];
    if (!currentWs) return;

    // 1. Check URL search parameters (?patientId=... or ?patientName=...)
    const urlPatientId = searchParams?.get('patientId') || searchParams?.get('patient_id');
    const urlPatientName = searchParams?.get('patientName') || searchParams?.get('patient_name');

    if (urlPatientId) {
      if (currentWs.targetEntity?.id !== urlPatientId) {
        setTargetEntity(
          {
            id: urlPatientId,
            name: urlPatientName || 'Patient',
            type: 'patient',
            autoBound: true,
          },
          activeWorkspaceId
        );
      }
      return;
    }

    // 2. Check route path: e.g. /doctor/patients/[id] or /admin/patients/[id]
    const parts = (pathname || '').split('/').filter(Boolean);
    const patientIndex = parts.indexOf('patients');
    if (patientIndex !== -1 && parts[patientIndex + 1]) {
      const routePatientId = parts[patientIndex + 1];
      // Ignore sub-tabs like 'cohorts' or 'leads'
      if (!['new', 'cohorts', 'leads', 'overview'].includes(routePatientId)) {
        if (currentWs.targetEntity?.id !== routePatientId) {
          setTargetEntity(
            {
              id: routePatientId,
              name: currentWs.targetEntity?.name || `Patient #${routePatientId.slice(0, 6)}`,
              type: 'patient',
              autoBound: true,
            },
            activeWorkspaceId
          );
        }
      }
    }
  }, [pathname, searchParams, activeWorkspaceId, workspaces, setTargetEntity]);
}

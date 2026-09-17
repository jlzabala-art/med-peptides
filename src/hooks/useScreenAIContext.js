"use client";

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { resolveScreenAIContext } from '../utils/screenAIResolver';
import { useClinicalContextStore } from '../stores/clinicalContextStore';
import { useWorkspaceStore } from '../stores/useWorkspaceStore';
import { useAuth } from '../context/AuthContext';
import { useRoleAccess } from './useRoleAccess';

/**
 * useScreenAIContext
 * React hook that returns the tailored AI Persona, Scope Key, Suggested Prompts,
 * and Context Anchor based on (Role × User × Screen × Entity).
 */
export function useScreenAIContext(customPathname, customEntity = null, customUser = null) {
  const currentPath = usePathname();
  const path = customPathname || currentPath || '/';

  const { userProfile, user, isAdmin } = useAuth();
  const { effectiveRole } = useRoleAccess();
  const activePatient = useClinicalContextStore((s) => s.activePatient);
  const activeDoctor = useClinicalContextStore((s) => s.activeDoctor);
  const activeWs = useWorkspaceStore((s) => s.workspaces?.[s.activeWorkspaceId]);

  const resolvedUser = useMemo(() => {
    if (customUser) return customUser;

    const isDoctor = effectiveRole === 'doctor' || path.startsWith('/doctor');
    const isPatient = effectiveRole === 'patient' || path.startsWith('/patient');
    const isWholesaler = effectiveRole === 'wholesaler' || effectiveRole === 'compounding_pharmacy' || path.startsWith('/wholesaler');
    const isSupplier = effectiveRole === 'supplier' || path.startsWith('/supplier');
    const isPlatformAdmin = effectiveRole === 'admin' || effectiveRole === 'medical_director' || isAdmin;

    let role = effectiveRole;
    if (isDoctor) role = 'doctor';
    else if (isPatient) role = 'patient';
    else if (isWholesaler) role = 'wholesaler';
    else if (isSupplier) role = 'supplier';
    else if (isPlatformAdmin) role = 'admin';

    let name = userProfile?.displayName || userProfile?.name || user?.displayName;
    let id = user?.uid || userProfile?.uid || 'guest';
    let clinic = userProfile?.clinicName || userProfile?.clinic || null;
    let license = userProfile?.licenseNumber || null;

    if (role === 'doctor') {
      if (activeDoctor?.name) {
        name = activeDoctor.name;
        id = activeDoctor.id || id;
        clinic = activeDoctor.clinic || clinic || 'Specialist Clinical Practice';
      } else if (!name || name === 'User' || name.toLowerCase().includes('admin')) {
        name = 'Dr. Hanieh Erdmann';
        id = 'dr-hanieh-erdmann';
        clinic = 'Bedaya Polyclinic L.L.C.';
        license = 'DHA-00013060-006';
      }
    } else if (role === 'patient') {
      if (!name) name = 'Carlos Méndez';
    } else if (role === 'wholesaler') {
      if (!name) name = userProfile?.companyName || 'Gulf Medical Reseller';
    } else if (role === 'admin') {
      if (!name) name = 'Jose Luis Zabala';
    }

    return {
      id,
      name: name || 'Valued User',
      role: role || 'guest',
      clinic,
      license,
      isAdmin,
    };
  }, [customUser, effectiveRole, path, userProfile, user, isAdmin, activeDoctor]);

  const resolvedEntity = useMemo(() => {
    if (customEntity) return customEntity;
    if (activePatient) {
      return {
        type: 'patient',
        id: activePatient.id,
        name: activePatient.name,
        clinic: activePatient.clinic,
        fileNumber: activePatient.id,
      };
    }
    return null;
  }, [customEntity, activePatient]);

  return useMemo(() => {
    return resolveScreenAIContext(path, resolvedEntity, resolvedUser);
  }, [path, resolvedEntity, resolvedUser]);
}

export { resolveScreenAIContext } from '../utils/screenAIResolver';
export default useScreenAIContext;

import { useState, useCallback, useEffect } from 'react';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { CANONICAL_ROLES, normalizeRole } from '../../constants/roles';

export const ADMIN_ROLES = {
  [CANONICAL_ROLES.ADMIN]: {
    id: CANONICAL_ROLES.ADMIN,
    label: 'Super Admin',
    allowedTabs: ['*'], // Admin bypasses filtering
  },
  [CANONICAL_ROLES.MEDICAL_DIRECTOR]: {
    id: CANONICAL_ROLES.MEDICAL_DIRECTOR,
    label: 'Medical Director',
    allowedTabs: [
      'dashboard',
      'prescriptions',
      'prescription-agent',
      'patients',
      'protocols',
      'products',
      'clinical-ai',
      'lab-tests',
      'doctors',
    ],
  },
  [CANONICAL_ROLES.DOCTOR]: {
    id: CANONICAL_ROLES.DOCTOR,
    label: 'Physician / Prescriber',
    allowedTabs: [
      'dashboard',
      'prescriptions',
      'prescription-agent',
      'patients',
      'protocols',
      'products',
      'clinical-ai',
      'lab-tests',
    ],
  },
  [CANONICAL_ROLES.CLINIC]: {
    id: CANONICAL_ROLES.CLINIC,
    label: 'Clinic / Practice',
    allowedTabs: [
      'dashboard',
      'doctors',
      'patients',
      'prescriptions',
      'protocols',
      'products',
      'orders',
    ],
  },
  [CANONICAL_ROLES.COMPOUNDING_PHARMACY]: {
    id: CANONICAL_ROLES.COMPOUNDING_PHARMACY,
    label: 'Compounding Pharmacy',
    allowedTabs: [
      'dashboard',
      'prescriptions',
      'products',
      'purchase-orders',
      'logistics',
    ],
  },
  [CANONICAL_ROLES.WHOLESALER]: {
    id: CANONICAL_ROLES.WHOLESALER,
    label: 'Wholesaler / Distributor',
    allowedTabs: [
      'dashboard',
      'orders',
      'products',
      'purchase-orders',
      'wholesellers',
      'logistics',
      'quotations',
    ],
  },
  [CANONICAL_ROLES.SUPPLIER]: {
    id: CANONICAL_ROLES.SUPPLIER,
    label: 'Supplier / Manufacturer',
    allowedTabs: [
      'dashboard',
      'purchase-orders',
      'wholesellers',
      'purchase-rfqs',
      'purchase-bills',
      'products',
      'logistics',
      'import-catalogs',
    ],
  },
  [CANONICAL_ROLES.ACCOUNT_MANAGER]: {
    id: CANONICAL_ROLES.ACCOUNT_MANAGER,
    label: 'Account Manager',
    allowedTabs: [
      'dashboard',
      'clinics',
      'doctors',
      'orders',
      'quotations',
      'invoices',
      'leads',
      'agency-deals',
      'relationships',
    ],
  },
  [CANONICAL_ROLES.PATIENT_COORDINATOR]: {
    id: CANONICAL_ROLES.PATIENT_COORDINATOR,
    label: 'Patient Coordinator',
    allowedTabs: [
      'dashboard',
      'patients',
      'prescriptions',
      'protocols',
      'orders',
      'communications',
    ],
  },
  [CANONICAL_ROLES.PATIENT]: {
    id: CANONICAL_ROLES.PATIENT,
    label: 'Patient Personal Health',
    allowedTabs: [
      'dashboard',
      'prescriptions',
      'protocols',
      'orders',
      'lab-tests',
    ],
  },
  [CANONICAL_ROLES.GUEST]: {
    id: CANONICAL_ROLES.GUEST,
    label: 'Public / Guest',
    allowedTabs: ['dashboard'],
  },
  wholeseller: {
    id: 'wholesaler',
    label: 'Wholesaler / Distributor',
    allowedTabs: [
      'dashboard',
      'orders',
      'products',
      'purchase-orders',
      'wholesellers',
      'logistics',
      'quotations',
    ],
  },
  fagron_clinic: {
    id: 'fagron_clinic',
    label: 'Fagron Clinic',
    allowedTabs: [
      'dashboard',
      'clinics',
      'prescriptions',
      'prescription-agent',
      'protocols',
      'orders',
      'lab-tests',
    ],
  },
};

let globalImpersonatedUser = null;
const listeners = new Set();

/**
 * Global singleton state for simulated role and user impersonation inside the Admin Dashboard.
 * Reactively synced with Zustand `useSimulationStore`.
 */
export function useAdminRoleSimulation() {
  const storeSimulatedRole = useSimulationStore((state) => state.simulatedRole);
  const setStoreSimulatedRole = useSimulationStore((state) => state.setSimulatedRole);
  const exitStoreSimulation = useSimulationStore((state) => state.exitSimulation);

  const [impersonatedUser, setImpersonatedUser] = useState(globalImpersonatedUser);

  const role = storeSimulatedRole || 'admin';

  const setSimulatedRole = useCallback((newRoleId) => {
    setStoreSimulatedRole(newRoleId === 'admin' ? null : newRoleId);
    listeners.forEach((listener) => listener());
  }, [setStoreSimulatedRole]);

  const impersonateUser = useCallback((userObj) => {
    globalImpersonatedUser = userObj;
    setImpersonatedUser(userObj);
    if (userObj?.role) {
      setStoreSimulatedRole(userObj.role);
    }
    listeners.forEach((listener) => listener());
  }, [setStoreSimulatedRole]);

  const exitImpersonation = useCallback(() => {
    globalImpersonatedUser = null;
    setImpersonatedUser(null);
    exitStoreSimulation();
    listeners.forEach((listener) => listener());
  }, [exitStoreSimulation]);

  const normalizedRole = normalizeRole(role);
  const currentRoleConfig = ADMIN_ROLES[normalizedRole] || ADMIN_ROLES[role] || ADMIN_ROLES.admin;

  return {
    simulatedRole: normalizedRole,
    setSimulatedRole,
    impersonatedUser,
    impersonateUser,
    exitImpersonation,
    allowedAdminTabs: currentRoleConfig.allowedTabs,
    isSimulating: role !== 'admin' || Boolean(impersonatedUser),
  };
}

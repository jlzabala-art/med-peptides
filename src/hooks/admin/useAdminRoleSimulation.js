import { useState, useCallback, useEffect } from 'react';
import { useSimulationStore } from '../../stores/useSimulationStore';

export const ADMIN_ROLES = {
  admin: {
    id: 'admin',
    label: 'Admin / Superuser',
    allowedTabs: ['*'], // Admin bypasses filtering
  },
  medical_director: {
    id: 'medical_director',
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
    ],
  },
  account_manager: {
    id: 'account_manager',
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
  supplier: {
    id: 'supplier',
    label: 'Supplier / Wholesaler',
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
  patient_coordinator: {
    id: 'patient_coordinator',
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

  const currentRoleConfig = ADMIN_ROLES[role] || ADMIN_ROLES.admin;

  return {
    simulatedRole: role,
    setSimulatedRole,
    impersonatedUser,
    impersonateUser,
    exitImpersonation,
    allowedAdminTabs: currentRoleConfig.allowedTabs,
    isSimulating: role !== 'admin' || Boolean(impersonatedUser),
  };
}

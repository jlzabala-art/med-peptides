import { useState, useCallback, useEffect } from 'react';

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

let globalSimulatedRole = 'admin';
let globalImpersonatedUser = null;
const listeners = new Set();

/**
 * Global singleton state for simulated role and user impersonation inside the Admin Dashboard.
 */
export function useAdminRoleSimulation() {
  const [role, setRole] = useState(globalSimulatedRole);
  const [impersonatedUser, setImpersonatedUser] = useState(globalImpersonatedUser);

  const sync = useCallback(() => {
    setRole(globalSimulatedRole);
    setImpersonatedUser(globalImpersonatedUser);
  }, []);

  useEffect(() => {
    listeners.add(sync);
    return () => listeners.delete(sync);
  }, [sync]);

  const setSimulatedRole = useCallback((newRoleId) => {
    if (ADMIN_ROLES[newRoleId] || newRoleId === 'admin') {
      globalSimulatedRole = newRoleId;
      listeners.forEach((listener) => listener());
    }
  }, []);

  const impersonateUser = useCallback((userObj) => {
    globalImpersonatedUser = userObj;
    if (userObj?.role) {
      globalSimulatedRole = userObj.role;
    }
    listeners.forEach((listener) => listener());
  }, []);

  const exitImpersonation = useCallback(() => {
    globalImpersonatedUser = null;
    globalSimulatedRole = 'admin';
    listeners.forEach((listener) => listener());
  }, []);

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

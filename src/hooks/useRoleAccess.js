import { useAuth } from '../context/AuthContext';
import { useAdminRoleSimulation } from './admin/useAdminRoleSimulation';
import { useMemo } from 'react';

// Simplified permissions mapping for demonstration.
// In a real app, this might come from Firestore or a more complex registry.
const ROLE_PERMISSIONS = {
  admin: ['*'], // Can do everything
  doctor: [
    'view:patients', 'edit:patients', 
    'view:prescriptions', 'create:prescriptions',
    'view:protocols', 'view:products',
    'view:clinical_logs'
  ],
  patient: [
    'view:prescriptions', 'view:protocols', 'view:orders'
  ],
  wholeseller: [
    'view:products', 'view:orders', 'create:orders'
  ]
};

/**
 * Universal hook for role-based access control.
 * Replaces scattered `if (role === 'admin')` logic.
 */
export function useRoleAccess() {
  const { userProfile, isAdmin } = useAuth();
  const { simulatedRole, isSimulating } = useAdminRoleSimulation();

  // Determine the effective role
  const effectiveRole = isSimulating 
    ? simulatedRole 
    : (isAdmin ? 'admin' : (userProfile?.role || 'patient'));

  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[effectiveRole] || [];
  }, [effectiveRole]);

  /**
   * Checks if the current role has a specific permission.
   * @param {string} action - The permission action (e.g. 'edit:products')
   * @returns {boolean}
   */
  const can = (action) => {
    if (permissions.includes('*')) return true;
    return permissions.includes(action);
  };

  /**
   * Checks if the current role matches a specific role identifier.
   * @param {string} roleToCheck 
   * @returns {boolean}
   */
  const is = (roleToCheck) => {
    return effectiveRole === roleToCheck;
  };

  return { can, is, effectiveRole };
}

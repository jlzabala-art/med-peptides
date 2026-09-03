/**
 * useRoleAccess.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal hook for role-based access control (AGENTS.md Rule #14).
 *
 * UNIFIED PERMISSIONS — Single source of truth via AuthContext.
 *
 * Design:
 *   - AuthContext resolves the canonical role and feature-flag permissions
 *     (loaded from Firestore /settings/permissions with per-user overrides).
 *   - This hook consumes that context and exposes TWO APIs:
 *
 *   1. can(action: string) → boolean
 *      Action-based checks. Replaces the old static ROLE_PERMISSIONS array.
 *      Action strings follow the pattern 'verb:resource' (e.g. 'edit:products').
 *
 *   2. feature(flag: string) → boolean
 *      Feature-flag checks from Firestore-backed rolePermissions.
 *      (e.g. feature('canBulkOrder'), feature('clinicalLogs'))
 *
 *   3. is(role: string) → boolean
 *      Simple role identity check. Normalises the legacy 'wholeseller' typo.
 *
 * BACKWARD COMPATIBILITY:
 *   - The old 'wholeseller' role string is silently aliased to 'wholesaler'.
 *   - Consumers using can() or is() do not need to be updated for this alias.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useAuth } from '../context/AuthContext';
import { useAdminRoleSimulation } from './admin/useAdminRoleSimulation';
import { useMemo } from 'react';

// ── Role aliases — normalise legacy/typo role strings ─────────────────────────
/** @type {Record<string, string>} */
const ROLE_ALIASES = Object.freeze({
  wholeseller: 'wholesaler', // canonical spelling is 'wholesaler'
  pharmacy:    'compounding_pharmacy',
});

// ── Action-based permissions per canonical role ───────────────────────────────
/**
 * This is the canonical action registry.
 * Each role gets an explicit set of allowed action strings.
 * admin receives '*' (wildcard — all actions allowed).
 *
 * Naming convention: 'verb:resource'
 *   Verbs: view | create | edit | delete | respond | manage | export
 *   Resources: products | variants | orders | prescriptions | patients |
 *              protocols | quotations | rfqs | clients | clinical_logs |
 *              staff | commission | settings | catalog
 */
const ROLE_ACTION_PERMISSIONS = Object.freeze({
  admin: ['*'],

  doctor: [
    'view:patients', 'edit:patients',
    'create:prescriptions', 'view:prescriptions', 'edit:prescriptions',
    'view:protocols',
    'view:products',
    'view:clinical_logs',
    'view:quotations',
  ],

  clinic: [
    'view:patients', 'edit:patients',
    'create:prescriptions', 'view:prescriptions', 'edit:prescriptions',
    'view:protocols',
    'view:products',
    'create:orders', 'view:orders',
    'view:quotations',
    'manage:staff',
  ],

  patient: [
    'view:prescriptions',
    'view:protocols',
    'view:orders',
  ],

  wholesaler: [
    'view:products',
    'create:orders', 'view:orders',
    'view:clients',
    'view:quotations', 'create:quotations',
    'export:catalog',
  ],

  supplier: [
    'view:products', 'edit:products',
    'view:orders', 'edit:orders',
    'view:rfqs', 'respond:rfqs',
  ],

  compounding_pharmacy: [
    'view:products',
    'view:orders',
    'view:rfqs', 'respond:rfqs',
  ],

  staff: [
    'view:patients',
    'view:prescriptions',
    'view:orders', 'create:orders',
    'view:clinical_logs',
  ],

  sales_agent: [
    'view:clients',
    'view:quotations', 'create:quotations',
    'view:orders',
    'view:commission',
  ],

  guest: [],
});

/**
 * Universal hook for role-based access control.
 *
 * @returns {{
 *   can: (action: string) => boolean,
 *   feature: (flag: string) => boolean,
 *   is: (role: string) => boolean,
 *   effectiveRole: string,
 *   permissions: string[],
 * }}
 */
export function useRoleAccess() {
  const { userProfile, isAdmin, activeRole, activePermissions } = useAuth();
  const { simulatedRole, isSimulating } = useAdminRoleSimulation();

  // Determine the effective role, normalising legacy aliases
  const effectiveRole = useMemo(() => {
    const raw = isSimulating
      ? simulatedRole
      : (isAdmin ? 'admin' : (activeRole || userProfile?.role || 'guest'));
    return ROLE_ALIASES[raw] || raw;
  }, [isSimulating, simulatedRole, isAdmin, activeRole, userProfile?.role]);

  // Resolve action permissions for this role
  const permissions = useMemo(() => {
    return ROLE_ACTION_PERMISSIONS[effectiveRole] || ROLE_ACTION_PERMISSIONS.guest;
  }, [effectiveRole]);

  /**
   * Action-based permission check.
   * @param {string} action — e.g. 'edit:products'
   */
  const can = (action) => {
    if (permissions.includes('*')) return true;
    return permissions.includes(action);
  };

  /**
   * Feature-flag check — backed by Firestore /settings/permissions
   * with per-user overrides (via AuthContext.activePermissions).
   * @param {string} flag — e.g. 'canBulkOrder', 'clinicalLogs'
   */
  const feature = (flag) => {
    if (isAdmin) return true; // admin has all features
    return Boolean(activePermissions?.[flag]);
  };

  /**
   * Role identity check. Normalises legacy 'wholeseller' alias.
   * @param {string} roleToCheck
   */
  const is = (roleToCheck) => {
    const normalised = ROLE_ALIASES[roleToCheck] || roleToCheck;
    return effectiveRole === normalised;
  };

  return { can, feature, is, effectiveRole, permissions };
}

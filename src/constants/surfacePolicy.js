/**
 * surfacePolicy.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure domain policy (zero React/Next dependencies) defining what global
 * navigation menus, pricing tiers, and inline editing surfaces a session may
 * see. Single Source of Truth for:
 *   - Admin-only global navigation menus (non-admins only see the shared page
 *     and direct links within its main module — never global portal menus)
 *   - Pricing tier visibility (Cost, Distributor +15%, Wholeseller 15%+15%)
 *   - Inline admin editing capabilities
 */

import { normalizeRole } from './roles.js';

/**
 * Resolves the UI surface policy for the given session.
 *
 * @param {object} params
 * @param {string} [params.effectiveRole='guest'] - Already includes simulation if active
 * @param {boolean} [params.isAdmin=false]        - Real admin flag from AuthContext
 * @param {boolean} [params.isSimulating=false]   - True when Admin is previewing via View As
 * @param {string|null} [params.simulatedRole=null]
 * @returns {{
 *   effectiveRole: string,
 *   canSeeGlobalMenus: boolean,
 *   canSeeAppSwitcher: boolean,
 *   canSeeB2BDrawer: boolean,
 *   canSeeFormatSwitcher: boolean,
 *   canSeeGlobalSearch: boolean,
 *   canSeeGlobalBreadcrumbs: boolean,
 *   canNavigateBrandHome: boolean,
 *   canSeeCostTier: boolean,
 *   canSeeDistributorTier: boolean,
 *   canEditPricesInline: boolean,
 * }}
 */
export function getSurfacePolicy({
  effectiveRole = 'guest',
  isAdmin = false,
  isSimulating = false,
  simulatedRole = null,
  hasShareGrant = false,
} = {}) {
  const normalized = normalizeRole(
    isSimulating && simulatedRole ? simulatedRole : (isAdmin ? 'admin' : effectiveRole)
  );

  // Strict rule:
  // - Admin (not simulating another role) -> full global menus
  // - Authenticated non-admin (not via guest share link) -> concise role-scoped menu
  // - Guest or signed share link (/s/[token]) -> zero navigation menus
  const isEffectiveAdmin = normalized === 'admin' && !hasShareGrant;
  const canSeeGlobalMenus = isEffectiveAdmin;
  const canSeeRoleMenu = !isEffectiveAdmin && !hasShareGrant && normalized !== 'guest';

  return Object.freeze({
    effectiveRole: normalized,
    canSeeGlobalMenus,
    canSeeRoleMenu,
    canSeeAppSwitcher: canSeeGlobalMenus,
    canSeeB2BDrawer: canSeeGlobalMenus,
    canSeeFormatSwitcher: canSeeGlobalMenus,
    canSeeGlobalSearch: canSeeGlobalMenus,
    canSeeGlobalBreadcrumbs: canSeeGlobalMenus,
    canNavigateBrandHome: canSeeGlobalMenus,
    canSeeCostTier: isEffectiveAdmin,
    canSeeDistributorTier: isEffectiveAdmin || normalized === 'distributor',
    canEditPricesInline: isEffectiveAdmin,
  });
}

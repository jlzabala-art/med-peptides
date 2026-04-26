/**
 * usePricingTier.js
 *
 * Maps the authenticated user's Firebase role to a canonical pricing tier.
 * This is the single source of truth for role → price resolution.
 *
 * Role hierarchy (ascending price privilege):
 *   guest / not logged in → retailPrice   (highest price, public)
 *   researcher            → retailPrice   (no discount — standard public)
 *   verified_medical      → wholesalePrice (professional discount)
 *   clinic / pharmacy     → clinicPrice   (institutional rate)
 *   distributor           → wholesalePrice (reseller rate)
 *   admin                 → masterPrice   (supplier cost — internal only)
 *
 * Usage:
 *   const { tier, tierLabel, isLoading } = usePricingTier();
 *   const resolved = resolveVariantPrice(variant, { tier, countryCode });
 */

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { PRICING_TIER, PRICING_TIER_LABELS } from '../constants/productEnums';

// ── Role → Tier mapping ────────────────────────────────────────────────────────
// Keys are lowercase role strings as stored in Firestore users/{uid}.role
const ROLE_TO_TIER = Object.freeze({
  // Unauthenticated / basic
  guest:            PRICING_TIER.RETAIL,
  researcher:       PRICING_TIER.RETAIL,

  // Verified professional → wholesale discount
  verified_medical: PRICING_TIER.WHOLESALE,
  professional:     PRICING_TIER.WHOLESALE,
  distributor:      PRICING_TIER.WHOLESALE,

  // Institutional → clinic rate
  clinic:           PRICING_TIER.CLINIC,
  pharmacy:         PRICING_TIER.CLINIC,
  hospital:         PRICING_TIER.CLINIC,

  // Admin → full cost visibility
  admin:            PRICING_TIER.MASTER,
});

/**
 * Resolve tier from a raw role string (handles nulls & legacy userType values).
 * @param {string|undefined} role
 * @param {boolean} isAdmin
 * @returns {string} One of PRICING_TIER values
 */
function resolveTierFromRole(role, isAdmin) {
  if (isAdmin) return PRICING_TIER.MASTER;

  const normalised = (role ?? 'guest').toLowerCase().trim();

  // Direct match
  if (ROLE_TO_TIER[normalised]) return ROLE_TO_TIER[normalised];

  // Partial match for legacy composite roles (e.g. 'verified_medical_pro')
  const matchedKey = Object.keys(ROLE_TO_TIER).find((k) => normalised.includes(k));
  if (matchedKey) return ROLE_TO_TIER[matchedKey];

  // Default: public retail
  return PRICING_TIER.RETAIL;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @returns {{
 *   tier: string,          // One of PRICING_TIER values
 *   tierLabel: string,     // Human-readable label
 *   isLoading: boolean,    // True while Firebase auth is still hydrating
 *   isGuest: boolean,      // True when user is not logged in
 *   role: string,          // Raw role string from Firestore
 * }}
 */
export function usePricingTier() {
  const { user, userProfile, isAdmin, loading } = useAuth();

  const { tier, role } = useMemo(() => {
    // While auth is loading, default to retail to avoid flash of wrong price
    if (loading) {
      return { tier: PRICING_TIER.RETAIL, role: 'guest' };
    }

    if (!user) {
      return { tier: PRICING_TIER.RETAIL, role: 'guest' };
    }

    // Prefer explicit 'role' field; fall back to legacy 'userType'
    const rawRole = userProfile?.role || userProfile?.userType || 'researcher';
    const resolvedTier = resolveTierFromRole(rawRole, isAdmin);

    return { tier: resolvedTier, role: rawRole.toLowerCase() };
  }, [user, userProfile, isAdmin, loading]);

  return {
    tier,
    tierLabel: PRICING_TIER_LABELS[tier] ?? tier,
    isLoading: loading,
    isGuest: !user,
    role,
  };
}

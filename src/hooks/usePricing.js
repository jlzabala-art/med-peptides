'use client';

import { useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import {
  ATLAS_MARGIN_RATES,
  extractCost,
  formatMoney,
  normalizePricingRole,
  resolveAllPrices,
  resolvePriceForSession,
} from '@/lib/pricing/pricingCore';

/**
 * usePricing — Hook único de precios para toda la plataforma.
 *  - No registrado: Wholeseller = Cost + 15% + 15% (× 1.3225)
 *  - Registrado:    Margen/tarifa del role
 *  - Admin:         Coste, Wholeseller y Distribuitor
 */
export function usePricing({ currency = 'EUR', fxRate = 1 } = {}) {
  const { user, activeRole, loading } = useAuth();
  const { is, effectiveRole } = useRoleAccess();

  const isAdmin = is('admin') || is('medical_director');
  const rawRole = effectiveRole || activeRole || user?.role || 'guest';

  const pricingRole = useMemo(
    () => (isAdmin ? 'admin' : normalizePricingRole(rawRole, user)),
    [isAdmin, rawRole, user]
  );

  const isGuest = !user || pricingRole === 'guest';

  const resolve = useCallback(
    (item, opts = {}) =>
      resolvePriceForSession(item, {
        user,
        role: rawRole,
        isAdmin,
        currency: opts.currency || currency,
        fxRate: opts.fxRate ?? fxRate,
      }),
    [user, rawRole, isAdmin, currency, fxRate]
  );

  const format = useCallback(
    (amount, overrideCurrency) => formatMoney(amount, overrideCurrency || currency),
    [currency]
  );

  return {
    isLoading: loading,
    isAdmin,
    isGuest,
    pricingRole,
    rates: ATLAS_MARGIN_RATES,
    resolve,
    resolveAllPrices,
    extractCost,
    format,
  };
}

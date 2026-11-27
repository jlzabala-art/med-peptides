'use client';

import { useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAdminRoleSimulation } from '@/hooks/admin/useAdminRoleSimulation';
import { normalizePricingMarket, marketToCountryCode } from '@/constants/roles';
import {
  ATLAS_MARGIN_RATES,
  extractCost,
  formatMoney,
  normalizePricingRole,
  resolveAllPrices,
  resolvePriceForSession,
} from '@/lib/pricing/pricingCore';
import {
  FX_RATES_FROM_EUR,
  CURRENCY_SYMBOLS,
  MARKET_DEFAULT_CURRENCY,
  convertCurrency,
  formatCurrency,
} from '@/constants/fxRates';

/**
 * usePricing — Hook único de precios por Rol + Mercado para toda la plataforma.
 *  - No registrado: Wholeseller = Cost + 15% + 15% (× 1.3225)
 *  - Registrado:    Margen/tarifa del role + overrides de su mercado/país
 *  - Admin:         Coste, Wholeseller y Distributor (o vista simulada por Rol + Mercado)
 */
export function usePricing({ currency = 'EUR', fxRate = 1, market: marketOverride = null } = {}) {
  const { user, userProfile, activeRole, loading } = useAuth();
  const { is, effectiveRole } = useRoleAccess();
  const { isSimulating, simulatedMarket, setSimulatedMarket } = useAdminRoleSimulation();

  const isAdmin = (is('admin') || is('medical_director')) && !isSimulating;
  const rawRole = effectiveRole || activeRole || user?.role || 'guest';

  const market = useMemo(
    () =>
      normalizePricingMarket(
        simulatedMarket ||
          marketOverride ||
          userProfile?.market ||
          userProfile?.countryCode ||
          userProfile?.country ||
          user?.market ||
          'global'
      ),
    [simulatedMarket, marketOverride, userProfile?.market, userProfile?.countryCode, userProfile?.country, user?.market]
  );

  const countryCode = useMemo(() => marketToCountryCode(market), [market]);

  const pricingRole = useMemo(
    () => (isAdmin ? 'admin' : normalizePricingRole(rawRole, userProfile || user, { isSimulating })),
    [isAdmin, rawRole, userProfile, user, isSimulating]
  );

  const isGuest = (!user && !isSimulating) || pricingRole === 'guest';

  const resolve = useCallback(
    (item, opts = {}) =>
      resolvePriceForSession(item, {
        user: userProfile || user,
        role: rawRole,
        isAdmin,
        isSimulating,
        market: opts.market || market,
        countryCode: opts.countryCode || countryCode,
        currency: opts.currency || currency,
        fxRate: opts.fxRate ?? fxRate,
      }),
    [userProfile, user, rawRole, isAdmin, isSimulating, market, countryCode, currency, fxRate]
  );

  const format = useCallback(
    (amount, overrideCurrency) => formatMoney(amount, overrideCurrency || currency),
    [currency]
  );

  return {
    isLoading: loading,
    isAdmin,
    isGuest,
    isSimulating,
    pricingRole,
    market,
    countryCode,
    defaultCurrencyForMarket: MARKET_DEFAULT_CURRENCY[market] || 'EUR',
    setSimulatedMarket,
    rates: ATLAS_MARGIN_RATES,
    fxRates: FX_RATES_FROM_EUR,
    currencySymbols: CURRENCY_SYMBOLS,
    resolve,
    resolveAllPrices,
    extractCost,
    convertCurrency,
    formatCurrency,
    format,
  };
}

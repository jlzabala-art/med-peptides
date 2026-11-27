'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
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
  const [shareGrant, setShareGrant] = useState(null);

  // Resolve signed Role + Market share link (?share_token=XXXX) if present
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('share_token');
    try {
      const cachedRaw = sessionStorage.getItem('atlas_share_pricing_grant');
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw);
        if (parsed && (!urlToken || parsed.token === urlToken)) {
          setShareGrant(parsed);
          if (!urlToken) return undefined;
        }
      }
    } catch {
      // ignore storage errors
    }
    if (!urlToken) return undefined;

    fetch(`/api/shares/pricing-link?token=${encodeURIComponent(urlToken)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.ok || !data?.grant) return;
        setShareGrant(data.grant);
        try {
          sessionStorage.setItem('atlas_share_pricing_grant', JSON.stringify(data.grant));
        } catch {
          // ignore storage errors
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const isAdmin = (is('admin') || is('medical_director')) && !isSimulating;
  const hasShareGrant = Boolean(shareGrant && !isAdmin && !isSimulating);
  const rawRole = hasShareGrant
    ? shareGrant.role
    : (effectiveRole || activeRole || user?.role || 'guest');

  const market = useMemo(
    () =>
      normalizePricingMarket(
        simulatedMarket ||
          (hasShareGrant ? shareGrant.market : null) ||
          marketOverride ||
          userProfile?.market ||
          userProfile?.countryCode ||
          userProfile?.country ||
          user?.market ||
          'global'
      ),
    [simulatedMarket, hasShareGrant, shareGrant?.market, marketOverride, userProfile?.market, userProfile?.countryCode, userProfile?.country, user?.market]
  );

  const countryCode = useMemo(() => marketToCountryCode(market), [market]);

  const pricingRole = useMemo(
    () =>
      isAdmin
        ? 'admin'
        : normalizePricingRole(rawRole, userProfile || user, {
            isSimulating: isSimulating || hasShareGrant,
          }),
    [isAdmin, rawRole, userProfile, user, isSimulating, hasShareGrant]
  );

  const isGuest = (!user && !isSimulating && !hasShareGrant) || pricingRole === 'guest';

  const resolve = useCallback(
    (item, opts = {}) =>
      resolvePriceForSession(item, {
        user: userProfile || user,
        role: rawRole,
        isAdmin,
        isSimulating: isSimulating || hasShareGrant,
        market: opts.market || market,
        countryCode: opts.countryCode || countryCode,
        currency: opts.currency || currency,
        fxRate: opts.fxRate ?? fxRate,
      }),
    [userProfile, user, rawRole, isAdmin, isSimulating, hasShareGrant, market, countryCode, currency, fxRate]
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

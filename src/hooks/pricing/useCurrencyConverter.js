'use client';

import { useState, useMemo, useCallback } from 'react';
import { FX_RATES_FROM_AED, CURRENCY_SYMBOLS } from '@/constants/fxRates';

const DEFAULT_RATES_FROM_AED = FX_RATES_FROM_AED;

export function useCurrencyConverter({
  defaultCurrency = 'AED',
  currencies = ['AED', 'USD', 'EUR'],
} = {}) {
  const [currency, setCurrencyState] = useState(defaultCurrency);

  const setCurrency = useCallback((nextCurrency) => {
    const normalized = String(nextCurrency || '').toUpperCase();
    if (!currencies.includes(normalized)) return;
    setCurrencyState(normalized);
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('cur', normalized);
        window.history.replaceState(null, '', url.toString());
      } catch {
        // ignore history error
      }
    }
  }, [currencies]);

  const fxRate = useMemo(() => {
    return DEFAULT_RATES_FROM_AED[currency] ?? 1;
  }, [currency]);

  const currencySymbol = useMemo(() => {
    return CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  }, [currency]);

  const formatPrice = useCallback(
    (aedAmount) => {
      if (aedAmount == null || Number.isNaN(Number(aedAmount))) return '—';
      const converted = Number(aedAmount) * fxRate;
      return `${currencySymbol}${converted.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [currencySymbol, fxRate]
  );

  return {
    currency,
    setCurrency,
    fxRate,
    currencySymbol,
    formatPrice,
    availableCurrencies: currencies,
  };
}

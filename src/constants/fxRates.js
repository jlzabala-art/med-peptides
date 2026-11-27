/**
 * fxRates.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single Source of Truth for FX rates & currency formatting across all
 * /pricing/* schedules, cart calculations, and PDF exports.
 *
 * Replaces duplicate FX tables previously scattered across:
 *   - BloodoPriceListClient.jsx
 *   - PelletsPriceListClient.jsx
 *   - useCurrencyConverter.js
 *   - pricingActions.js
 *
 * Base anchor: EUR = 1.00
 */

export const FX_RATES_FROM_EUR = Object.freeze({
  EUR: 1.0,
  USD: 1.087,
  AED: 3.992,
  QAR: 3.957,
  PLN: 4.30,
  GBP: 0.855,
});

export const FX_RATES_FROM_AED = Object.freeze({
  AED: 1.0,
  EUR: Number((1 / FX_RATES_FROM_EUR.AED).toFixed(6)),
  USD: Number((FX_RATES_FROM_EUR.USD / FX_RATES_FROM_EUR.AED).toFixed(6)),
  QAR: Number((FX_RATES_FROM_EUR.QAR / FX_RATES_FROM_EUR.AED).toFixed(6)),
  PLN: Number((FX_RATES_FROM_EUR.PLN / FX_RATES_FROM_EUR.AED).toFixed(6)),
  GBP: Number((FX_RATES_FROM_EUR.GBP / FX_RATES_FROM_EUR.AED).toFixed(6)),
});

export const CURRENCY_SYMBOLS = Object.freeze({
  EUR: '€',
  USD: '$',
  AED: 'AED ',
  QAR: 'QAR ',
  PLN: 'PLN ',
  GBP: '£',
});

export const MARKET_DEFAULT_CURRENCY = Object.freeze({
  global: 'EUR',
  uae: 'AED',
  qatar: 'QAR',
  us: 'USD',
});

/**
 * Converts an amount from one currency to another using the unified EUR anchor.
 */
export function convertCurrency(amount, fromCurrency = 'EUR', toCurrency = 'EUR', customRates = null) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return 0;
  const from = String(fromCurrency || 'EUR').toUpperCase();
  const to = String(toCurrency || 'EUR').toUpperCase();
  if (from === to) return Math.round((num + Number.EPSILON) * 100) / 100;

  const rates = customRates || FX_RATES_FROM_EUR;
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  const amountInEur = num / fromRate;
  return Math.round((amountInEur * toRate + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a numeric amount with the unified currency symbol and 2 decimals.
 */
export function formatCurrency(amount, currency = 'EUR') {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  const code = String(currency || 'EUR').toUpperCase();
  const sym = CURRENCY_SYMBOLS[code] || `${code} `;
  return `${sym}${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

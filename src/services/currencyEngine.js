/**
 * currencyEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Multi-Currency Conversion & Real-Time Exchange Rates Engine.
 * Supports cross-border transactions across UAE (AED), EU (EUR), UK (GBP), and USA (USD).
 *
 * Implements AGENTS.md Rule #2 (Firestore Source of Truth + Multilayer Cache).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import logger from '../utils/logger.js';

// Fallback rates (Base USD = 1.0)
const DEFAULT_RATES = {
  USD: 1.0000,
  EUR: 0.9250,
  AED: 3.6725,
  GBP: 0.7920
};

// In-memory cache layer (TTL: 1 hour)
let memoryRates = { ...DEFAULT_RATES };
let lastFetchedTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Fetches latest exchange rates from Firestore _meta/system_config.
 */
export async function getExchangeRates(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && lastFetchedTime > 0 && (now - lastFetchedTime) < CACHE_TTL_MS) {
    return memoryRates;
  }

  try {
    const configSnap = await getDoc(doc(db, '_meta', 'system_config'));
    if (configSnap.exists() && configSnap.data().exchangeRates) {
      memoryRates = { ...DEFAULT_RATES, ...configSnap.data().exchangeRates };
      lastFetchedTime = now;
    }
  } catch (error) {
    logger.warn('[currencyEngine] Failed to read _meta/system_config rates, using cached rates:', error.message);
  }

  return memoryRates;
}

/**
 * Synchronous currency conversion using cached exchange rates.
 * @param {number} amount
 * @param {string} fromCurrency - 'USD' | 'EUR' | 'AED' | 'GBP'
 * @param {string} toCurrency   - 'USD' | 'EUR' | 'AED' | 'GBP'
 * @returns {number}
 */
export function convertCurrencySync(amount, fromCurrency = 'USD', toCurrency = 'USD') {
  const num = Number(amount || 0);
  const from = fromCurrency.toUpperCase().trim();
  const to = toCurrency.toUpperCase().trim();

  if (from === to || num === 0) return num;

  const rateFrom = memoryRates[from] || DEFAULT_RATES[from] || 1.0;
  const rateTo = memoryRates[to] || DEFAULT_RATES[to] || 1.0;

  // Convert amount -> USD -> target currency
  const amountInUSD = num / rateFrom;
  const converted = amountInUSD * rateTo;
  return parseFloat(converted.toFixed(2));
}

/**
 * Formats amount with proper ISO currency symbol.
 */
export function formatCurrencyISO(amount, currency = 'USD', locale = 'en-US') {
  const val = Number(amount || 0);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase().trim(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  } catch {
    return `${currency.toUpperCase()} ${val.toFixed(2)}`;
  }
}

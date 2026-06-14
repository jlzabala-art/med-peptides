 
/**
 * liveRates.js
 * Fetches real-time exchange rates from open.er-api.com (free tier, no API key).
 * ECB-sourced data, updated daily.
 *
 * Maps API response → AdminDashboard / App.jsx field format.
 */

const USD_API = 'https://open.er-api.com/v6/latest/USD';
const EUR_API = 'https://open.er-api.com/v6/latest/EUR';

// AdminDashboard uses these keys for USD-base rates
const USD_KEY_MAP = {
  uae:    'AED',  // UAE Dirham
  qatar:  'QAR',  // Qatari Riyal
  kuwait: 'KWD',  // Kuwaiti Dinar
  saudi:  'SAR',  // Saudi Riyal
  euro:   'EUR',  // Euro
  row:    'USD',  // Rest of World (same as USD base → 1)
};

// AdminDashboard uses these keys for EUR-base rates
const EUR_KEY_MAP = {
  uae:    'AED',
  qatar:  'QAR',
  kuwait: 'KWD',
  saudi:  'SAR',
  usd:    'USD',
  row:    'USD',  // treat same as USD for ROW
};

/**
 * Fetches live exchange rates and returns them in the format used by
 * AdminDashboard state + Firestore `settings/global`.
 *
 * @returns {{
 *   exchangeRates: Record<string, number>,
 *   eurExchangeRates: Record<string, number>,
 *   ratesLastUpdated: string   // ISO timestamp
 * }}
 */
export async function fetchLiveRates() {
  const [usdRes, eurRes] = await Promise.all([
    fetch(USD_API),
    fetch(EUR_API),
  ]);

  if (!usdRes.ok || !eurRes.ok) {
    throw new Error('Exchange rate API unavailable');
  }

  const [usdData, eurData] = await Promise.all([
    usdRes.js(),
    eurRes.js(),
  ]);

  if (usdData.result !== 'success' || eurData.result !== 'success') {
    throw new Error('Exchange rate API returned error');
  }

  // Build USD-base map
  const exchangeRates = {};
  for (const [key, isoCode] of Object.entries(USD_KEY_MAP)) {
    const raw = usdData.rates[isoCode] ?? 1;
    exchangeRates[key] = parseFloat(raw.toFixed(4));
  }

  // Build EUR-base map
  const eurExchangeRates = {};
  for (const [key, isoCode] of Object.entries(EUR_KEY_MAP)) {
    const raw = eurData.rates[isoCode] ?? 1;
    eurExchangeRates[key] = parseFloat(raw.toFixed(4));
  }

  return {
    exchangeRates,
    eurExchangeRates,
    ratesLastUpdated: new Date().toISOString(),
    ratesSource: 'open.er-api.com',
  };
}

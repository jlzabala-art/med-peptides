import { getCountryByCode, COUNTRIES } from '../data/countries';

const STORAGE_KEY = 'user_detected_geo_country';
let inFlightPromise = null;

/**
 * Synchronous lookup for previously detected/cached country.
 * Returns country object or null if not yet resolved.
 */
export function getCachedDetectedCountry() {
  if (typeof window === 'undefined') return null;
  try {
    const cachedCode = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (cachedCode) {
      return getCountryByCode(cachedCode);
    }
  } catch {
    // Ignore storage restrictions
  }
  return null;
}

/**
 * Asynchronous detector that resolves the visitor's country by IP.
 * Caches in sessionStorage and localStorage for instant 0ms retrieval on page transitions.
 */
export async function getDetectedCountry() {
  if (typeof window === 'undefined') {
    return getCountryByCode('es') || COUNTRIES[0];
  }

  // 1. Check instant cache
  const cached = getCachedDetectedCountry();
  if (cached) return cached;

  // 2. Prevent duplicate concurrent fetches
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = (async () => {
    let resolvedCode = null;

    // Strategy A: Next.js internal API (/api/geo)
    try {
      const res = await fetch('/api/geo', {
        headers: { 'Accept': 'application/json' },
        cache: 'default'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.countryCode) {
          resolvedCode = data.countryCode;
        }
      }
    } catch {
      // Fallback below
    }

    // Strategy B: Public Client-side edge fallback (instant, CORS-friendly)
    if (!resolvedCode) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch('https://api.country.is/', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data.country) {
            resolvedCode = data.country;
          }
        }
      } catch {
        // Fallback below
      }
    }

    // Strategy C: Browser Navigator Locale (e.g. "es-ES" -> "ES", "en-GB" -> "GB")
    if (!resolvedCode && typeof navigator !== 'undefined') {
      const lang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
      const parts = lang.split('-');
      if (parts.length > 1 && parts[1].length === 2) {
        resolvedCode = parts[1].toUpperCase();
      } else if (parts[0].toLowerCase() === 'es') {
        resolvedCode = 'ES';
      }
    }

    const countryObj = getCountryByCode(resolvedCode || 'es') || getCountryByCode('es') || COUNTRIES[0];

    // Cache in session and local storage
    try {
      if (countryObj?.code) {
        sessionStorage.setItem(STORAGE_KEY, countryObj.code);
        localStorage.setItem(STORAGE_KEY, countryObj.code);
      }
    } catch {
      // Storage might be blocked in private mode
    }

    // Notify listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:geo-country-detected', { detail: countryObj }));
    }

    inFlightPromise = null;
    return countryObj;
  })();

  return inFlightPromise;
}

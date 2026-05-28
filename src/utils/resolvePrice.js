 
/**
 * resolvePrice.js — Engine v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional-grade price resolver for Antigravity.
 *
 * Firestore variant.pricing schema:
 *   pricing: {
 *     retail:    { perUnit, kit, currency, byCountry?: { [CC]: { perUnit, kit, currency } } }
 *     wholesale: { … }
 *     clinic:    { … }
 *     master:    { … }
 *   }
 *
 * Price resolution hierarchy:
 *   1. customerOverride
 *   2. Country-level override  (variant.pricing.{tier}.byCountry.{CC})
 *   3. Tier base price
 *   4. Tier fallback chain     (clinic → wholesale → retail) — sets isFallback: true
 *
 * New in v2:
 *   - VAT/IVA via calculateTax(amount, countryCode)
 *   - Dynamic currency conversion via exchangeRates + targetCurrency opts
 *   - Tier fallback with isFallback flag
 *   - Render-cycle memoization (WeakMap keyed on variant object)
 *   - EU-locale-aware formatPrice
 *
 * @module resolvePrice
 */

import { PRICING_TIER } from '../constants/productEnums.js';

let globalActiveTenant = null;

export function setActiveTenantForResolution(tenant) {
  globalActiveTenant = tenant;
}

export function getActiveTenantForResolution() {
  return globalActiveTenant;
}

// ── Constants ──────────────────────────────────────────────────────────────────

/** Canonical tier order for fallback escalation (most specific → least). */
const TIER_FALLBACK_CHAIN = Object.freeze([
  PRICING_TIER.MASTER,
  PRICING_TIER.CLINIC,
  PRICING_TIER.WHOLESALE,
  PRICING_TIER.RETAIL,
]);

/** Maps PRICING_TIER constants → Firestore short keys (canonical schema). */
const TIER_TO_KEY = Object.freeze({
  [PRICING_TIER.RETAIL]:    'retail',
  [PRICING_TIER.WHOLESALE]: 'wholesale',
  [PRICING_TIER.CLINIC]:    'clinic',
  [PRICING_TIER.MASTER]:    'master',
});

/**
 * Maps legacy long-form keys (e.g. 'retailPrice') → canonical short keys.
 * Handles Firestore docs created before the key migration.
 */
const LEGACY_KEY_MAP = Object.freeze({
  retailPrice:    'retail',
  wholesalePrice: 'wholesale',
  clinicPrice:    'clinic',
  masterPrice:    'master',
});

/**
 * Normalise a single tier entry so it always exposes { perUnit, kit, currency }.
 *
 * Firestore variant docs may store tier prices in two different schemas:
 *   Schema A (canonical): { perUnit: 50, kit: 45, currency: 'USD' }
 *   Schema B (legacy):    { base: 50, byCountry: {...} }
 *                     OR  { perUnit: 50, base: 50, byCountry: {...} }
 *
 * This function unifies both so extractBase always finds 'perUnit'.
 *
 * @param {Object|null} entry  - A single tier object (e.g. pricing.retail)
 * @returns {Object|null}
 */
function normaliseTierEntry(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  // If already has perUnit, nothing to do
  if (entry.perUnit != null) return entry;
  // Map 'base' → 'perUnit' (legacy Firestore schema)
  if (entry.base != null) {
    return { ...entry, perUnit: entry.base };
  }
  return entry;
}

/**
 * Normalise a pricing object so that both canonical short keys ('retail')
 * and legacy long keys ('retailPrice') resolve correctly, and that tier
 * entries always expose { perUnit, kit, currency } regardless of whether
 * the original Firestore doc used 'base' or 'perUnit'.
 *
 * Returns the original object if no changes are needed (zero-cost fast path).
 *
 * @param {Object|null} pricing
 * @returns {Object|null}
 */
function normalisePricingKeys(pricing) {
  if (!pricing) return pricing;

  // ── Step 1: key normalization (retailPrice → retail, etc.) ──
  const hasLegacy = Object.keys(LEGACY_KEY_MAP).some((k) => k in pricing);

  let normalised = pricing;
  if (hasLegacy) {
    normalised = { ...pricing };
    let warned = false;
    for (const [legacyKey, canonicalKey] of Object.entries(LEGACY_KEY_MAP)) {
      if (pricing[legacyKey] != null && normalised[canonicalKey] == null) {
        normalised[canonicalKey] = pricing[legacyKey];
        if (!warned) {
          console.warn(
            '[resolvePrice] Detected legacy pricing schema key "%s" on variant. ' +
            'Update Firestore docs to use "%s" instead.',
            legacyKey, canonicalKey
          );
          warned = true;
        }
      }
    }
  }

  // ── Step 2: inner-field normalization (base → perUnit) ──
  // Walk all canonical tier keys and normalise each tier entry.
  const canonicalKeys = Object.values(TIER_TO_KEY); // ['retail','wholesale','clinic','master']
  let needsInnerFix = false;
  for (const key of canonicalKeys) {
    const entry = normalised[key];
    if (entry && typeof entry === 'object' && entry.perUnit == null && entry.base != null) {
      needsInnerFix = true;
      break;
    }
  }

  if (needsInnerFix) {
    if (normalised === pricing) normalised = { ...pricing }; // ensure we have a copy
    for (const key of canonicalKeys) {
      if (normalised[key]) {
        const fixed = normaliseTierEntry(normalised[key]);
        if (fixed !== normalised[key]) {
          if (import.meta.env.MODE !== 'production') {
            console.warn(
              '[resolvePrice] Tier "%s" uses legacy "base" field instead of "perUnit". ' +
              'Update Firestore docs to use "perUnit".',
              key
            );
          }
          normalised = { ...normalised, [key]: fixed };
        }
      }
    }
  }

  return normalised;
}

/**
 * Default exchange rates (EUR base).
 * Callers can override by passing opts.exchangeRates.
 */
const DEFAULT_EXCHANGE_RATES = Object.freeze({
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  CHF: 0.97,
});

/**
 * VAT/IVA rates by ISO 3166-1 alpha-2 country code.
 * Covers Portugal, Spain, Greece and common EU markets.
 */
const VAT_RATES = Object.freeze({
  PT: 0.23,   // Portugal
  ES: 0.21,   // Spain
  GR: 0.24,   // Greece
  DE: 0.19,   // Germany
  FR: 0.20,   // France
  IT: 0.22,   // Italy
  NL: 0.21,   // Netherlands
  BE: 0.21,   // Belgium
  AT: 0.20,   // Austria
  PL: 0.23,   // Poland
  SE: 0.25,   // Sweden
  FI: 0.24,   // Finland
  DK: 0.25,   // Denmark
  US: 0,      // No federal VAT
  GB: 0.20,   // UK
});

/** EU country codes for locale-aware formatting. */
const EU_COUNTRIES = new Set([
  'AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI',
  'FR','GR','HR','HU','IE','IT','LT','LU','LV','MT',
  'NL','PL','PT','RO','SE','SI','SK',
]);

/** Locale map for Intl formatting — falls back to 'de-DE' (European decimal format). */
const COUNTRY_LOCALE = Object.freeze({
  PT: 'pt-PT', ES: 'es-ES', GR: 'el-GR', DE: 'de-DE',
  FR: 'fr-FR', IT: 'it-IT', NL: 'nl-NL', BE: 'fr-BE',
  AT: 'de-AT', PL: 'pl-PL', SE: 'sv-SE', FI: 'fi-FI',
  DK: 'da-DK', US: 'en-US', GB: 'en-GB',
});

// ── Memoization cache ──────────────────────────────────────────────────────────

/**
 * WeakMap keyed on the variant object — garbage-collected automatically when
 * the variant ref is dropped (safe for React render cycles).
 * Inner map key: JSON of opts for quick lookup.
 */
const _cache = new WeakMap();

function _cacheGet(variant, key) {
  return _cache.get(variant)?.get(key) ?? null;
}
function _cacheSet(variant, key, value) {
  if (!_cache.has(variant)) _cache.set(variant, new Map());
  _cache.get(variant).set(key, value);
}

// ── Tax engine ─────────────────────────────────────────────────────────────────

/**
 * Calculate VAT/IVA for a given amount and country.
 *
 * @param {number}      amount
 * @param {string|null} countryCode - ISO 3166-1 alpha-2
 * @param {Object}      [opts]
 * @param {boolean}     [opts.inclusive=false] - If true, amount already includes tax
 * @returns {{ net: number, tax: number, gross: number, rate: number, taxInclusive: boolean }}
 */
export function calculateTax(amount, countryCode, { inclusive = false } = {}) {
  const cc   = (countryCode ?? '').toUpperCase();
  const rate = VAT_RATES[cc] ?? 0;

  if (rate === 0) {
    return { net: amount, tax: 0, gross: amount, rate: 0, taxInclusive: false };
  }

  if (inclusive) {
    const net = amount / (1 + rate);
    return { net, tax: amount - net, gross: amount, rate, taxInclusive: true };
  }

  const tax = amount * rate;
  return { net: amount, tax, gross: amount + tax, rate, taxInclusive: false };
}

// ── Currency conversion ────────────────────────────────────────────────────────

/**
 * Convert an amount from one currency to another using provided or default rates.
 *
 * @param {number} amount
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @param {Object} [rates=DEFAULT_EXCHANGE_RATES] - { [currency]: rateVsEUR }
 * @returns {number}
 */
function convertCurrency(amount, fromCurrency, toCurrency, rates = DEFAULT_EXCHANGE_RATES) {
  if (!amount || fromCurrency === toCurrency) return amount;
  const from = rates[fromCurrency] ?? 1;
  const to   = rates[toCurrency]   ?? 1;
  // Convert to EUR base, then to target
  return (amount / from) * to;
}

// ── Internal helpers ───────────────────────────────────────────────────────────

function extractBase(pricing, tier) {
  if (!pricing) return { perUnit: null, kit: null, currency: 'EUR' };
  const key   = TIER_TO_KEY[tier];
  const entry = key ? pricing[key] : null;
  if (!entry) {
    // Dev-time diagnostic: log available keys so mismatches are easy to spot
    if (import.meta.env.MODE !== 'production') {
      console.debug(
        '[resolvePrice] extractBase: no entry for tier key "%s" (tier=%s). ' +
        'Pricing keys present: %s',
        key, tier, Object.keys(pricing).join(', ') || '(none)'
      );
    }
    return { perUnit: null, kit: null, currency: pricing.currency ?? 'EUR' };
  }
  return {
    perUnit:  entry.perUnit  ?? null,
    kit:      entry.kit      ?? null,
    currency: entry.currency ?? pricing.currency ?? 'EUR',
  };
}

function extractCountry(pricing, tier, countryCode) {
  if (!pricing || !countryCode) return null;
  const key      = TIER_TO_KEY[tier];
  const entry    = key ? pricing[key] : null;
  const cc       = countryCode.toUpperCase();
  const override = entry?.byCountry?.[cc];
  if (!override) return null;

  // Support both canonical { perUnit } and legacy { base } schemas
  const perUnit = override.perUnit ?? override.base ?? null;
  const kit     = override.kit     ?? null;

  if (perUnit == null && kit == null) return null;
  return {
    perUnit,
    kit,
    currency: override.currency ?? entry?.currency ?? pricing.currency ?? 'EUR',
  };
}

/**
 * Find the best available tier, falling back up the chain if the requested
 * tier has no price data.  Sets isFallback = true when escalation occurs.
 *
 * @param {Object} pricing
 * @param {string} requestedTier
 * @returns {{ tier: string, isFallback: boolean }}
 */
function resolveTierWithFallback(pricing, requestedTier) {
  if (!pricing) return { tier: PRICING_TIER.RETAIL, isFallback: true };

  const startIdx = TIER_FALLBACK_CHAIN.indexOf(requestedTier);
  // Walk from requested tier toward retail
  for (let i = startIdx; i < TIER_FALLBACK_CHAIN.length; i++) {
    const candidate = TIER_FALLBACK_CHAIN[i];
    const key       = TIER_TO_KEY[candidate];
    const entry     = key ? pricing[key] : null;
    if (entry && (entry.perUnit != null || entry.kit != null)) {
      return { tier: candidate, isFallback: candidate !== requestedTier };
    }
  }

  return { tier: PRICING_TIER.RETAIL, isFallback: true };
}

// ── Types ──────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ResolvedPrice
 * @property {number|null}                   perUnit
 * @property {number|null}                   kit
 * @property {string}                        currency       - Resolved output currency
 * @property {string}                        tier           - Effective tier used
 * @property {'customer'|'country'|'base'}   source
 * @property {boolean}                       isFallback     - True if tier was escalated
 * @property {{ rate: number, taxInclusive: boolean }|null} tax
 */

// ── Core resolver ──────────────────────────────────────────────────────────────

/**
 * Resolve the effective price for a variant — Engine v2.
 *
 * @param {Object}  variant
 * @param {Object}  [opts]
 * @param {string}  [opts.tier=PRICING_TIER.RETAIL]
 * @param {string}  [opts.countryCode]                - ISO 3166-1 alpha-2
 * @param {Object}  [opts.customerOverride]
 * @param {string}  [opts.targetCurrency]             - Convert output to this currency
 * @param {Object}  [opts.exchangeRates]              - Override default exchange rates
 * @param {boolean} [opts.includeTax=false]           - Append VAT breakdown to result
 * @returns {ResolvedPrice}
 */
export function resolveVariantPrice(variant, {
  tier             = PRICING_TIER.RETAIL,
  countryCode      = null,
  customerOverride = null,
  targetCurrency   = null,
  exchangeRates    = DEFAULT_EXCHANGE_RATES,
  includeTax       = false,
  tenant           = null,
} = {}) {
  const activeTenant = tenant || globalActiveTenant;
  // ── Memoization key ──
  const cacheKey = JSON.stringify({ tier, countryCode, targetCurrency, includeTax, tenantId: activeTenant?.id || null });
  const cached   = _cacheGet(variant, cacheKey);
  if (cached) return cached;

  // Normalise pricing keys (handles both 'retail' and 'retailPrice' schemas)
  let pricing = variant?.pricing ?? null;
  if (variant && (!pricing || (pricing.retail == null && pricing.retailPrice == null))) {
    const flatPrice = variant.priceUSD ?? variant.perVialPriceUSD ?? variant.perUnit ?? null;
    const flatKit = variant.kitPriceUSD ?? variant.kit ?? null;
    if (flatPrice != null || flatKit != null) {
      pricing = {
        ...pricing,
        retail: {
          perUnit: flatPrice,
          kit: flatKit,
          currency: variant.currency ?? 'USD'
        }
      };
    }
  }
  pricing = normalisePricingKeys(pricing);

  // Apply B2B pricing calculations for NPLAB supplier (EUR->USD and tier multipliers)
  if (pricing && variant && (variant.supplier === 'NPLAB' || variant.supplier === 'nplab')) {
    const isEur = pricing.retail?.currency === 'EUR' || pricing.currency === 'EUR';
    let retailPrice = pricing.retail?.perUnit ?? null;
    let retailKit = pricing.retail?.kit ?? null;

    if (isEur) {
      if (retailPrice != null) retailPrice = retailPrice * 1.10;
      if (retailKit != null) retailKit = retailKit * 1.10;
    }

    const masterPrice = retailPrice != null ? retailPrice / 1.5 : null;
    const masterKit = retailKit != null ? retailKit / 1.5 : null;

    const wholesalePrice = masterPrice != null ? masterPrice * 1.2 : null;
    const wholesaleKit = masterKit != null ? masterKit * 1.2 : null;

    const clinicPrice = masterPrice != null ? masterPrice * 1.3 : null;
    const clinicKit = masterKit != null ? masterKit * 1.3 : null;

    pricing = {
      ...pricing,
      retail: {
        ...pricing.retail,
        ...(retailPrice != null ? { perUnit: retailPrice } : {}),
        ...(retailKit != null ? { kit: retailKit } : {}),
        currency: 'USD'
      },
      master: {
        ...pricing.master,
        ...(masterPrice != null ? { perUnit: masterPrice } : {}),
        ...(masterKit != null ? { kit: masterKit } : {}),
        currency: 'USD'
      },
      wholesale: {
        ...pricing.wholesale,
        ...(wholesalePrice != null ? { perUnit: wholesalePrice } : {}),
        ...(wholesaleKit != null ? { kit: wholesaleKit } : {}),
        currency: 'USD'
      },
      clinic: {
        ...pricing.clinic,
        ...(clinicPrice != null ? { perUnit: clinicPrice } : {}),
        ...(clinicKit != null ? { kit: clinicKit } : {}),
        currency: 'USD'
      }
    };
  }

  // ── Validate + fallback tier ──
  const { tier: effectiveTier, isFallback } = resolveTierWithFallback(pricing, tier);
  const base = extractBase(pricing, effectiveTier);

  let resolved = null;

  // 1. Tenant override
  if (activeTenant) {
    const productKey = variant.productSlug || variant.productId || variant.id || variant.name?.toLowerCase().replace(/\s+/g, '-');
    const override = activeTenant.priceOverrides ? (activeTenant.priceOverrides[productKey] || activeTenant.priceOverrides[variant.name]) : undefined;
    if (override !== undefined) {
      if (typeof override === 'number') {
        resolved = {
          perUnit: override,
          kit: null,
          currency: 'USD',
          tier: effectiveTier,
          source: 'customer',
          isFallback: false,
          tax: null,
        };
      } else if (typeof override === 'object' && override !== null) {
        resolved = {
          perUnit: override.perUnit !== undefined ? override.perUnit : (override[effectiveTier] !== undefined ? override[effectiveTier] : base.perUnit),
          kit: override.kit !== undefined ? override.kit : base.kit,
          currency: override.currency || 'USD',
          tier: effectiveTier,
          source: 'customer',
          isFallback: false,
          tax: null,
        };
      }
    } else {
      // If there's no override for this variant/product under the active tenant, hide prices
      resolved = {
        perUnit: null,
        kit: null,
        currency: 'USD',
        tier: effectiveTier,
        source: 'customer',
        isFallback: false,
        tax: null,
      };
    }
  }

  if (!resolved) {
    // 2. Customer override
    if (customerOverride && (customerOverride.perUnit != null || customerOverride.kit != null)) {
      resolved = {
        perUnit:    customerOverride.perUnit  ?? base.perUnit,
        kit:        customerOverride.kit      ?? base.kit,
        currency:   customerOverride.currency ?? base.currency,
        tier:       effectiveTier,
        source:     'customer',
        isFallback: false,
        tax:        null,
      };
    } else {
      // 3. Country override
      const country = extractCountry(pricing, effectiveTier, countryCode);
      if (country) {
        resolved = {
          perUnit:    country.perUnit  ?? base.perUnit,
          kit:        country.kit      ?? base.kit,
          currency:   country.currency ?? base.currency,
          tier:       effectiveTier,
          source:     'country',
          isFallback,
          tax:        null,
        };
      } else {
        // 4. Base global
        resolved = {
          perUnit:    base.perUnit,
          kit:        base.kit,
          currency:   base.currency,
          tier:       effectiveTier,
          source:     'base',
          isFallback,
          tax:        null,
        };
      }
    }
  }

  // ── Dynamic kit price fallback ──
  // If a tier lacks a kit price but has perUnit pricing, calculate the kit price
  // using the retail tier's kit discount ratio (preserving any quantity-based pricing advantages)
  if (resolved && resolved.kit == null && resolved.perUnit != null) {
    const units = variant?.attributes?.unitsPerPack || 10;
    const retailEntry = pricing?.retail;
    if (retailEntry && retailEntry.perUnit != null && retailEntry.kit != null) {
      const retailRatio = retailEntry.kit / (retailEntry.perUnit * units);
      resolved.kit = resolved.perUnit * units * retailRatio;
    } else {
      resolved.kit = resolved.perUnit * units;
    }
  }


  // ── Currency conversion ──
  if (targetCurrency && targetCurrency !== resolved.currency) {
    resolved.perUnit   = resolved.perUnit != null
      ? convertCurrency(resolved.perUnit, resolved.currency, targetCurrency, exchangeRates)
      : null;
    resolved.kit       = resolved.kit != null
      ? convertCurrency(resolved.kit, resolved.currency, targetCurrency, exchangeRates)
      : null;
    resolved.currency  = targetCurrency;
  }

  // ── Tax ──
  if (includeTax && resolved.perUnit != null) {
    const taxInfo  = calculateTax(resolved.perUnit, countryCode);
    resolved.tax   = { rate: taxInfo.rate, taxInclusive: taxInfo.taxInclusive };
    resolved.gross = { perUnit: taxInfo.gross, kit: resolved.kit != null ? calculateTax(resolved.kit, countryCode).gross : null };
  }

  _cacheSet(variant, cacheKey, resolved);
  return resolved;
}

// ── Formatter ──────────────────────────────────────────────────────────────────

/**
 * Format a price for display.
 * EU countries: uses local decimal/thousands separators and trailing € symbol.
 * Non-EU: falls back to Intl en-US standard.
 *
 * @param {number|null} amount
 * @param {string}      [currency='EUR']
 * @param {string|null} [countryCode=null]  - Drives locale selection
 * @returns {string|null}
 */
export function formatPrice(amount, currency = 'EUR', countryCode = null) {
  if (amount == null) return null;

  const cc     = (countryCode ?? '').toUpperCase();
  const isEU   = EU_COUNTRIES.has(cc);
  const locale = COUNTRY_LOCALE[cc] ?? (isEU ? 'de-DE' : 'en-US');

  return new Intl.NumberFormat(locale, {
    style:                 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ── Convenience ────────────────────────────────────────────────────────────────

/**
 * Resolve + format in one call.
 *
 * @param {Object} variant
 * @param {Object} [opts]  - Passed through to resolveVariantPrice
 * @returns {{
 *   resolved: ResolvedPrice,
 *   display: { perUnit: string|null, kit: string|null }
 * }}
 */
export function resolveAndFormatPrice(variant, opts = {}) {
  const resolved = resolveVariantPrice(variant, opts);
  const cc       = opts.countryCode ?? null;
  return {
    resolved,
    display: {
      perUnit: formatPrice(resolved.perUnit, resolved.currency, cc),
      kit:     formatPrice(resolved.kit,     resolved.currency, cc),
    },
  };
}

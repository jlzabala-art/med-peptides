/**
 * pricingCore.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single Source of Truth for Atlas Health pricing & margin calculation
 * (Server & Client safe, zero React dependencies).
 *
 * Business Policy:
 *   1. Unauthenticated / Guest -> Wholeseller = Cost + 15% + 15% (cost × 1.3225)
 *   2. Registered user         -> Margin/tier corresponding to their role
 *   3. Admin                   -> Always exposes all 3 prices: Cost, Wholeseller, Distributor
 */

import { marketToCountryCode, normalizePricingMarket } from '@/constants/roles';

export const ATLAS_MARGIN_RATES = Object.freeze({
  DISTRIBUTOR_MARKUP: 0.15,      // +15% over cost (× 1.15)
  WHOLESELLER_COMPOUND: 1.3225,  // +15% + 15% compounded (1.15 × 1.15)
  CLINIC_OVER_WHOLESELLER: 1.15, // +15% over wholeseller
  RETAIL_OVER_CLINIC: 1.30,      // +30% over clinic
});

const CURRENCY_META = Object.freeze({
  EUR: { symbol: '€', locale: 'en-IE' },
  USD: { symbol: '$', locale: 'en-US' },
  AED: { symbol: 'AED ', locale: 'en-AE' },
  QAR: { symbol: 'QAR ', locale: 'en-QA' },
  PLN: { symbol: 'PLN ', locale: 'pl-PL' },
});

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const firstPositive = (...vals) => {
  for (const v of vals) {
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v;
    if (typeof v === 'string' && v.trim() !== '') {
      const parsed = Number(v);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
  }
  return null;
};

/**
 * Extracts raw base cost from any product or variant document.
 */
export function extractCost(item) {
  if (!item) return null;
  const p = item.pricing || {};
  const v0 = Array.isArray(item.variants) && item.variants.length > 0 ? item.variants[0] : null;
  const v0p = v0?.pricing || {};

  return firstPositive(
    item.costPriceEur,
    item.costPrice,
    item.cost,
    item.landedCost,
    item.landedCostEur,
    item.calculatedLanded,
    p.masterPrice,
    p.master?.perUnit,
    p.master?.base,
    p.supplierCost,
    p.costPrice,
    p.cost,
    item.price_eur,
    item.costEur,
    item.unit_price,
    v0?.costPrice,
    v0?.cost,
    v0?.unit_price,
    v0p.master?.perUnit,
    v0p.supplierCost
  );
}

/**
 * Resolves all commercial tiers for a product/variant:
 *   cost, wholeseller (15%+15%), distributor (+15%), clinic, retail.
 */
export function resolveAllPrices(item, options = {}) {
  const defaultCurrency = options.currency || 'EUR';
  const normalizedMarket = normalizePricingMarket(options.market || options.countryCode || 'global');
  const countryCode = options.countryCode
    ? String(options.countryCode).toUpperCase()
    : marketToCountryCode(normalizedMarket);

  if (!item) {
    return {
      cost: null,
      wholeseller: null,
      distributor: null,
      clinic: null,
      retail: null,
      currency: defaultCurrency,
      market: normalizedMarket,
      countryCode,
      isMarketOverride: false,
    };
  }

  const p = item.pricing || {};
  const v0 = Array.isArray(item.variants) && item.variants.length > 0 ? item.variants[0] : null;
  const v0p = v0?.pricing || {};
  const fx = Number(options.fxRate) > 0 ? Number(options.fxRate) : 1;

  // Market / country override extraction.
  // Business invariant: when market === 'global' (no specific market assigned),
  // NEVER apply regional overrides — always keep the general base rule intact.
  const isRegionalMarket = normalizedMarket !== 'global';
  const marketBlock = isRegionalMarket
    ? (
      item.byCountry?.[countryCode] ||
      item.pricingByCountry?.[countryCode] ||
      item.byMarket?.[normalizedMarket] ||
      p.byCountry?.[countryCode] ||
      p.byMarket?.[normalizedMarket] ||
      null
    )
    : null;

  const tierCountryVal = (tierKey) => {
    if (!isRegionalMarket) return null;
    return firstPositive(
      p[tierKey]?.byCountry?.[countryCode]?.perUnit,
      p[tierKey]?.byCountry?.[countryCode]?.base,
      p[tierKey]?.byCountry?.[countryCode],
      v0p[tierKey]?.byCountry?.[countryCode]?.perUnit,
      v0p[tierKey]?.byCountry?.[countryCode],
      marketBlock?.[tierKey]?.perUnit,
      marketBlock?.[tierKey]
    );
  };

  const cost = firstPositive(tierCountryVal('master'), extractCost(item));

  const explicitDistributor = firstPositive(
    tierCountryVal('distributor'),
    item.distributorPriceEur,
    item.distributorPrice,
    item.mediluxePrice,
    p.distributorPrice,
    p.distributor?.perUnit,
    p.distributor,
    p.mediluxePrice,
    v0?.distributorPrice,
    v0p.distributor?.perUnit
  );

  const explicitWholeseller = firstPositive(
    tierCountryVal('wholesale'),
    item.wholesalePriceEur,
    item.wholesalePrice,
    item.wholesellerPrice,
    item.calculatedWholesale,
    p.wholesalePrice,
    p.wholesale?.perUnit,
    p.wholesale?.base,
    p.wholesale,
    v0?.wholesalePrice,
    v0p.wholesale?.perUnit
  );

  const explicitClinic = firstPositive(
    tierCountryVal('clinic'),
    item.clinicPriceEur,
    item.clinicPrice,
    item.recommendedClinic,
    p.clinicPrice,
    p.clinic?.perUnit,
    p.clinic?.base,
    p.clinic,
    v0?.clinicPrice,
    v0p.clinic?.perUnit
  );

  const explicitRetail = firstPositive(
    tierCountryVal('retail'),
    item.retailPriceEur,
    item.retailPrice,
    item.recommendedRetail,
    p.retailPrice,
    p.retail?.perUnit,
    p.retail?.base,
    p.retail,
    v0?.retailPrice,
    v0p.retail?.perUnit
  );

  const isMarketOverride = Boolean(
    marketBlock ||
    tierCountryVal('master') ||
    tierCountryVal('distributor') ||
    tierCountryVal('wholesale') ||
    tierCountryVal('clinic') ||
    tierCountryVal('retail')
  );

  const effectiveCost =
    cost ??
    (explicitWholeseller != null
      ? round2(explicitWholeseller / ATLAS_MARGIN_RATES.WHOLESELLER_COMPOUND)
      : null);

  const distributor =
    explicitDistributor ??
    (effectiveCost != null
      ? round2(effectiveCost * (1 + ATLAS_MARGIN_RATES.DISTRIBUTOR_MARKUP))
      : null);

  const wholeseller =
    explicitWholeseller ??
    (effectiveCost != null
      ? round2(effectiveCost * ATLAS_MARGIN_RATES.WHOLESELLER_COMPOUND)
      : null);

  const clinic =
    explicitClinic ??
    (wholeseller != null
      ? round2(wholeseller * ATLAS_MARGIN_RATES.CLINIC_OVER_WHOLESELLER)
      : null);

  const retail =
    explicitRetail ??
    (clinic != null
      ? round2(clinic * ATLAS_MARGIN_RATES.RETAIL_OVER_CLINIC)
      : wholeseller);

  const scale = (v) => (v != null ? round2(v * fx) : null);

  return {
    cost: scale(effectiveCost),
    wholeseller: scale(wholeseller),
    distributor: scale(distributor),
    clinic: scale(clinic),
    retail: scale(retail),
    currency:
      marketBlock?.currency ||
      item.currency ||
      p.wholesale?.currency ||
      p.retail?.currency ||
      defaultCurrency,
    market: normalizedMarket,
    countryCode,
    isMarketOverride,
  };
}

/**
 * Normalizes any role / priceTier string into:
 * 'admin' | 'distributor' | 'wholeseller' | 'clinic' | 'retail' | 'guest'
 */
export function normalizePricingRole(role, user = null, { isSimulating = false } = {}) {
  if (isSimulating && role) {
    const simRaw = String(role).toLowerCase().trim();
    if (simRaw === 'guest') return 'guest';
    if (['admin', 'superadmin', 'medical_director'].includes(simRaw)) return 'admin';
    if (['distributor', 'distribuitor', 'mediluxe', 'master'].includes(simRaw)) return 'distributor';
    if (['wholeseller', 'wholesaler', 'wholesale', 'supplier'].includes(simRaw)) return 'wholeseller';
    if (['clinic', 'doctor', 'physician', 'fagron_clinic', 'pharmacy', 'compounding_pharmacy', 'hospital', 'professional', 'verified_medical', 'clinic_manager', 'pharmacist'].includes(simRaw)) return 'clinic';
    if (['patient', 'retail', 'b2c'].includes(simRaw)) return 'retail';
  }
  if (!user && (!role || String(role).toLowerCase() === 'guest')) {
    return 'guest';
  }
  const raw = String(
    user?.priceTier || user?.pricingChannel || role || user?.role || 'guest'
  )
    .toLowerCase()
    .trim();

  if (['admin', 'superadmin', 'medical_director'].includes(raw)) return 'admin';
  if (['distributor', 'distribuitor', 'mediluxe', 'master'].includes(raw)) return 'distributor';
  if (['wholeseller', 'wholesaler', 'wholesale', 'supplier'].includes(raw)) return 'wholeseller';
  if (
    [
      'clinic',
      'doctor',
      'physician',
      'fagron_clinic',
      'pharmacy',
      'compounding_pharmacy',
      'hospital',
      'professional',
      'verified_medical',
    ].includes(raw)
  ) {
    return 'clinic';
  }
  if (['patient', 'retail', 'b2c'].includes(raw)) return 'retail';

  return user ? 'wholeseller' : 'guest';
}

/**
 * Resolves the exact price(s) a session should display:
 *  - Guest (not registered): Wholeseller (15% + 15%)
 *  - Registered:             Role-specific tier or custom user markup
 *  - Admin:                  All 3 tiers (cost, wholeseller, distributor)
 */
export function resolvePriceForSession(
  item,
  { user = null, role = null, isAdmin = false, isSimulating = false, market = 'global', countryCode = null, customMarkupPercent = null, fxRate = 1, currency = 'EUR' } = {}
) {
  const tiers = resolveAllPrices(item, { fxRate, currency, market, countryCode });
  const normalizedRole = isAdmin && !isSimulating ? 'admin' : normalizePricingRole(role, user, { isSimulating });

  if (normalizedRole === 'admin') {
    return {
      mode: 'admin_triple',
      showTriple: true,
      role: 'admin',
      primaryTier: 'wholeseller',
      primaryPrice: tiers.wholeseller ?? tiers.distributor ?? tiers.cost,
      primaryLabel: 'Wholeseller',
      ...tiers,
    };
  }

  if (normalizedRole === 'guest' || (!user && !isSimulating)) {
    return {
      mode: 'guest_wholeseller',
      showTriple: false,
      role: 'guest',
      primaryTier: 'wholeseller',
      primaryPrice: tiers.wholeseller,
      primaryLabel: 'Wholeseller',
      wholeseller: tiers.wholeseller,
      currency: tiers.currency,
      market: tiers.market,
      countryCode: tiers.countryCode,
      isMarketOverride: tiers.isMarketOverride,
    };
  }

  const userMarkup = isSimulating
    ? null
    : (customMarkupPercent ??
      user?.priceMarkupPercent ??
      user?.appliedMarkupPercent ??
      null);

  if (userMarkup != null && Number.isFinite(Number(userMarkup)) && tiers.cost != null) {
    const customPrice = round2(tiers.cost * (1 + Number(userMarkup) / 100));
    return {
      mode: 'registered_role',
      showTriple: false,
      role: normalizedRole,
      primaryTier: normalizedRole,
      primaryPrice: customPrice,
      primaryLabel: `Partner Rate (+${Number(userMarkup)}%)`,
      currency: tiers.currency,
    };
  }

  const tierMap = {
    distributor: { price: tiers.distributor, label: 'Distributor (+15%)' },
    wholeseller: { price: tiers.wholeseller, label: 'Wholeseller' },
    clinic: { price: tiers.clinic ?? tiers.wholeseller, label: 'Clinic / Doctor Rate' },
    retail: { price: tiers.retail ?? tiers.clinic ?? tiers.wholeseller, label: 'Patient / Retail Rate' },
  };

  const selected = tierMap[normalizedRole] || tierMap.wholeseller;

  return {
    mode: 'registered_role',
    showTriple: false,
    role: normalizedRole,
    primaryTier: normalizedRole,
    primaryPrice: selected.price,
    primaryLabel: selected.label,
    currency: tiers.currency,
    market: tiers.market,
    countryCode: tiers.countryCode,
    isMarketOverride: tiers.isMarketOverride,
  };
}

/**
 * Formats an amount into localized currency string.
 */
export function formatMoney(amount, currency = 'EUR') {
  if (amount == null || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    return '—';
  }
  const code = String(currency || 'EUR').toUpperCase();
  const meta = CURRENCY_META[code];
  const formatted = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return meta ? `${meta.symbol}${formatted}` : `${code} ${formatted}`;
}

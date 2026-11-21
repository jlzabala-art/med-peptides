/**
 * productViewModel.js — Canonical Model v2 Adapter (Server -> Client)
 * ─────────────────────────────────────────────────────────────────────────────
 * Normalizes heterogeneous Firestore `products` documents (legacy aliases,
 * EUR vs USD base prices, string vs structured doses) into a single predictable
 * ViewModel contract without breaking legacy UI components.
 */

export const CANONICAL_FX_FROM_USD = Object.freeze({
  USD: 1.0,
  EUR: 1 / 1.087,
  AED: 3.6725,
});

export function convertCurrencyAmount(amount, fromCurrency = 'USD', toCurrency = 'USD') {
  const num = Number(amount);
  if (!Number.isFinite(num)) return 0;
  const from = String(fromCurrency || 'USD').toUpperCase();
  const to = String(toCurrency || 'USD').toUpperCase();
  if (from === to) return Number(num.toFixed(2));
  const usdAmount = from === 'USD' ? num : num / (CANONICAL_FX_FROM_USD[from] || 1);
  const converted = to === 'USD' ? usdAmount : usdAmount * (CANONICAL_FX_FROM_USD[to] || 1);
  return Number(converted.toFixed(2));
}

export function normalizeCanonicalKey(doc = {}) {
  const raw = doc.canonicalKey || doc.slug || doc.canonicalName || doc.productName || doc.name || doc.id || '';
  return String(raw)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseStrength(rawStrength, fallbackValue = null) {
  if (rawStrength && typeof rawStrength === 'object') {
    const val = Number(rawStrength.strengthValue ?? fallbackValue);
    const unit = String(rawStrength.strengthUnit || 'mg').trim();
    return {
      strengthValue: Number.isFinite(val) ? val : null,
      strengthUnit: unit,
      doseLabel: Number.isFinite(val) ? `${val} ${unit}` : '',
    };
  }

  const str = String(rawStrength || '').trim();
  const match = str.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z%µ/]+)?/);
  if (match) {
    const val = Number(match[1]);
    const unit = (match[2] || 'mg').trim();
    return {
      strengthValue: Number.isFinite(val) ? val : null,
      strengthUnit: unit,
      doseLabel: str,
    };
  }

  const numFallback = Number(fallbackValue);
  return {
    strengthValue: Number.isFinite(numFallback) && numFallback > 0 ? numFallback : null,
    strengthUnit: 'mg',
    doseLabel: str,
  };
}

export function normalizeMoneyEnvelope(doc = {}, { tier = 'wholesale', targetCurrency = null } = {}) {
  const pricing = doc.pricing || {};
  const hasEurFields = Boolean(
    pricing.wholesalePriceEur || pricing.price_eur || pricing.costPriceEur || pricing.pack10PriceEur
  );
  const baseCurrency = String(
    doc.baseCurrency || pricing.currency || (hasEurFields ? 'EUR' : 'USD')
  ).toUpperCase();

  const tierObj = pricing[tier] || pricing.wholesale || pricing.retail || null;
  const rawUnit = Number(
    (tierObj && typeof tierObj === 'object' ? (tierObj.perUnit ?? tierObj.base ?? tierObj.price) : undefined)
      ?? pricing.wholesalePriceEur
      ?? pricing.price_eur
      ?? doc.unitPrice
      ?? doc.price
      ?? pricing.costPriceEur
      ?? 0
  );

  const defaultPackDiscount = doc.type === 'pellet' ? 0.9 : 0.85;
  const rawPack10 = Number(
    (tierObj && typeof tierObj === 'object' ? (tierObj.kit ?? tierObj.pack10) : undefined)
      ?? pricing.pack10PriceEur
      ?? pricing.box10WholesalePriceEur
      ?? doc.pack10Price
      ?? (rawUnit > 0 ? rawUnit * 10 * defaultPackDiscount : 0)
  );

  const resolvedCurrency = String(targetCurrency || baseCurrency).toUpperCase();
  const pack10SavingsPct = rawUnit > 0 && rawPack10 > 0
    ? Math.max(0, Math.round((1 - rawPack10 / (rawUnit * 10)) * 100))
    : 0;
  return {
    baseCurrency,
    currency: resolvedCurrency,
    tier,
    unitPriceBase: Number.isFinite(rawUnit) ? Number(rawUnit.toFixed(2)) : 0,
    pack10PriceBase: Number.isFinite(rawPack10) ? Number(rawPack10.toFixed(2)) : 0,
    unitPrice: convertCurrencyAmount(rawUnit, baseCurrency, resolvedCurrency),
    pack10Price: convertCurrencyAmount(rawPack10, baseCurrency, resolvedCurrency),
    pack10SavingsPct,
  };
}

export function resolveSynergyKeys(doc = {}, canonicalKey = '') {
  if (Array.isArray(doc.synergyKeys) && doc.synergyKeys.length > 0) {
    return doc.synergyKeys;
  }
  const key = String(canonicalKey || '').toLowerCase();
  if (doc.category === 'Trocar Kits' || doc.hormoneType === 'instrument') {
    return ['bpc-157'];
  }
  if (doc.type === 'pellet') {
    if (doc.hormoneType === 'estrogen' || doc.hormoneType === 'biest' || doc.hormoneType === 'progesterone') {
      return ['ghk-cu', 'epithalon', 'bpc-157'];
    }
    return ['cjc-1295', 'bpc-157', 'nad'];
  }
  if (key.includes('bpc-157')) return ['tb-500', 'ghk-cu'];
  if (key.includes('tb-500')) return ['bpc-157'];
  if (key.includes('cjc-1295')) return ['ipamorelin'];
  if (key.includes('ipamorelin')) return ['cjc-1295'];
  if (key.includes('nad')) return ['ss-31', 'epithalon'];
  if (key.includes('mots-c')) return ['nad'];
  if (key.includes('selank')) return ['semax'];
  if (key.includes('semax')) return ['selank'];
  return [];
}

export function toProductViewModel(doc = {}, opts = {}) {
  const canonicalKey = normalizeCanonicalKey(doc);
  const parsedDose = parseStrength(doc.strength ?? doc.dose ?? doc.presentation, doc.strengthValue);
  const money = normalizeMoneyEnvelope(doc, opts);
  const title = doc.canonicalName || doc.displayName || doc.productName || doc.name || canonicalKey;
  const strengthValue = doc.strengthValue ?? parsedDose.strengthValue;
  const strengthUnit = doc.strengthUnit || parsedDose.strengthUnit;
  const sortDoseValue = typeof strengthValue === 'number' && Number.isFinite(strengthValue)
    ? (String(strengthUnit || '').toLowerCase() === 'mcg' ? strengthValue / 1000 : strengthValue)
    : null;

  return {
    ...doc,
    schemaVersion: 2,
    id: doc.id || canonicalKey,
    sku: doc.sku || doc.itemNumber || doc.id || canonicalKey,
    slug: doc.slug || canonicalKey,
    canonicalKey,
    title,
    strengthValue,
    strengthUnit,
    sortDoseValue,
    doseLabel: parsedDose.doseLabel || doc.strength || '',
    route: doc.route || doc.routeOfAdministration || (doc.type === 'pellet' ? 'SUBCUTANEOUS_IMPLANT' : 'SC'),
    synergyKeys: resolveSynergyKeys(doc, canonicalKey),
    money,
  };
}

/**
 * src/repositories/agreementWriteGuard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Commercial Agreement Write Guard & Data Integrity Layer
 *
 * Ensures all writes to `commercial_agreements/{agreementId}` are structurally
 * valid, mathematically consistent, and auditable BEFORE writing to Firestore.
 *
 * Standards: OWASP Input Validation, Zero-Corruption Guarantee.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export class AgreementValidationError extends Error {
  constructor(errors, context = '') {
    const prefix = context ? `[${context}] ` : '';
    super(`${prefix}Agreement validation failed:\n  - ${errors.join('\n  - ')}`);
    this.name = 'AgreementValidationError';
    this.errors = errors;
    this.context = context;
  }
}

/**
 * Validate and sanitize a commercial agreement document.
 *
 * @param {Object} data - Raw agreement data
 * @param {Object} [options] - Additional validation options
 * @returns {Object} Clean, normalized agreement document ready for Firestore
 */
export function validateAndNormalizeAgreement(data, options = {}) {
  const errors = [];
  const context = data?.slug || data?.id || 'UnknownAgreement';

  if (!data || typeof data !== 'object') {
    throw new AgreementValidationError(['Agreement payload must be a non-null object.'], context);
  }

  // 1. Mandatory Identity Fields
  const slug = String(data.slug || data.id || '').trim().toLowerCase();
  if (!slug) {
    errors.push('Missing required field: "slug" or "id"');
  }

  const partnerName = String(data.partnerName || '').trim();
  if (!partnerName) {
    errors.push('Missing required field: "partnerName"');
  }

  const organization = String(data.organization || '').trim();
  if (!organization) {
    errors.push('Missing required field: "organization"');
  }

  const territory = String(data.territory || '').trim();
  if (!territory) {
    errors.push('Missing required field: "territory"');
  }

  const baseCurrency = String(data.baseCurrency || 'PLN').toUpperCase().trim();
  if (!['PLN', 'USD', 'QAR', 'EUR', 'AED'].includes(baseCurrency)) {
    errors.push(`Invalid "baseCurrency": "${baseCurrency}". Must be one of PLN, USD, QAR, EUR, AED.`);
  }

  // 2. Numerical Pricing Validation
  const pricing = data.pricing || {};
  const unitProductPricePln = Number(pricing.unitProductPricePln || 0);
  const unitShippingPln = Number(pricing.unitShippingPln || 0);
  const unitTotalPln = Number(pricing.unitTotalPln || 0);
  const unitDistributorPriceQar = Number(pricing.unitDistributorPriceQar || 0);
  const unitRecommendedRetailQar = Number(pricing.unitRecommendedRetailQar || 0);

  if (unitProductPricePln <= 0) {
    errors.push('pricing.unitProductPricePln must be greater than 0.');
  }
  if (unitShippingPln < 0) {
    errors.push('pricing.unitShippingPln cannot be negative.');
  }

  // Mathematical consistency: product + shipping ≈ total landed
  const expectedTotalPln = unitProductPricePln + unitShippingPln;
  if (unitTotalPln > 0 && Math.abs(expectedTotalPln - unitTotalPln) > 0.05) {
    errors.push(
      `Mathematical discrepancy in PLN pricing: unitProductPricePln (${unitProductPricePln}) + unitShippingPln (${unitShippingPln}) = ${expectedTotalPln.toFixed(2)}, but unitTotalPln is set to ${unitTotalPln}.`
    );
  }

  if (unitRecommendedRetailQar > 0 && unitDistributorPriceQar > 0 && unitRecommendedRetailQar <= unitDistributorPriceQar) {
    errors.push('unitRecommendedRetailQar must be strictly greater than unitDistributorPriceQar to provide distributor gross margin.');
  }

  // 3. Order Quantity & Items
  const orderQuantity = Number(data.orderQuantity || 80);
  if (orderQuantity <= 0) {
    errors.push('orderQuantity must be a positive integer.');
  }

  const items = Array.isArray(data.items) ? data.items : [];
  if (items.length === 0) {
    errors.push('Agreement must contain at least one product item in "items" array.');
  } else {
    items.forEach((item, idx) => {
      if (!item.name || typeof item.name !== 'string') {
        errors.push(`Item at index ${idx} is missing a valid "name".`);
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        errors.push(`Item "${item.name || idx}" has invalid quantity.`);
      }
    });
  }

  // 4. Key Conditions
  const keyConditions = Array.isArray(data.keyConditions) ? data.keyConditions : [];
  if (keyConditions.length === 0) {
    errors.push('Agreement must define at least one contractual term in "keyConditions".');
  }

  if (errors.length > 0) {
    throw new AgreementValidationError(errors, context);
  }

  // 5. Normalization & Totals Auto-Calculation
  const grossMarginPerUnit = unitRecommendedRetailQar > 0 ? (unitRecommendedRetailQar - unitDistributorPriceQar) : 0;
  const grossMarginPct = unitRecommendedRetailQar > 0 ? Number(((grossMarginPerUnit / unitRecommendedRetailQar) * 100).toFixed(1)) : 0;
  const totalGrossProfit = orderQuantity * grossMarginPerUnit;

  const opexPerUnit = Number((unitRecommendedRetailQar * 0.15).toFixed(2));
  const netProfitPerUnit = Number((grossMarginPerUnit - opexPerUnit).toFixed(2));
  const netProfitPct = unitRecommendedRetailQar > 0 ? Number(((netProfitPerUnit / unitRecommendedRetailQar) * 100).toFixed(2)) : 0;
  const totalNetProfit = Number((orderQuantity * netProfitPerUnit).toFixed(2));

  const totalInvoiceQar = Number((orderQuantity * unitDistributorPriceQar).toFixed(2));
  const totalInvoicePln = Number((orderQuantity * (unitTotalPln || expectedTotalPln)).toFixed(2));
  const totalInvoiceUsd = Number((orderQuantity * (pricing.unitTotalUsd || 31.00)).toFixed(2));

  return {
    id: data.id || slug,
    slug,
    documentRef: data.documentRef || `DOC-QA-${slug.toUpperCase()}-2026-V1`,
    partnerName,
    organization,
    territory,
    tier: data.tier || 'Authorized Commercial Distributor',
    pricingBasis: data.pricingBasis || 'CIF Doha Port of Entry (excl. 5% local VAT)',
    title: data.title || `${organization.toUpperCase()} COMMERCIAL SCHEDULE`,
    subtitle: data.subtitle || 'Exclusive B2B Commercial Distribution Architecture',
    status: data.status || 'active',
    baseCurrency,
    securedDiscountPct: Number(data.securedDiscountPct || 18),
    orderQuantity,
    pegRates: {
      QAR_USD: Number(data.pegRates?.QAR_USD || 3.6795),
      PLN_USD: Number(data.pegRates?.PLN_USD || 3.9268),
      QAR_PLN: Number(data.pegRates?.QAR_PLN || 0.92098)
    },
    pricing: {
      unitProductPricePln,
      unitShippingPln,
      unitTotalPln: unitTotalPln || expectedTotalPln,
      unitProductPriceUsd: Number(pricing.unitProductPriceUsd || 26.00),
      unitShippingUsd: Number(pricing.unitShippingUsd || 5.00),
      unitTotalUsd: Number(pricing.unitTotalUsd || 31.00),
      unitProductPriceQar: Number(pricing.unitProductPriceQar || 93.94),
      unitShippingQar: Number(pricing.unitShippingQar || 18.06),
      unitDistributorPriceQar,
      unitRecommendedRetailQar,
      distributorGrossMarginPerUnit: Number(grossMarginPerUnit.toFixed(2)),
      distributorGrossMarginPct: grossMarginPct,
      distributorOpexPerUnit: opexPerUnit,
      distributorNetProfitPerUnit: netProfitPerUnit,
      distributorNetProfitPct: netProfitPct
    },
    totals: {
      totalDistributorInvoicePln: totalInvoicePln,
      totalDistributorInvoiceUsd: totalInvoiceUsd,
      totalDistributorInvoiceQar: totalInvoiceQar,
      totalDistributorGrossProfit: totalGrossProfit,
      totalDistributorNetProfit: totalNetProfit
    },
    items: items.map(item => ({
      id: item.id || `item-${Math.random().toString(36).substr(2, 6)}`,
      name: String(item.name).trim(),
      quantity: Number(item.quantity),
      unitPriceQar: Number(item.unitPriceQar || unitDistributorPriceQar),
      unitPriceUsd: Number(item.unitPriceUsd || pricing.unitTotalUsd || 31.00),
      unitPricePln: Number(item.unitPricePln || unitTotalPln || expectedTotalPln),
      actives: item.actives ? String(item.actives).trim() : ''
    })),
    keyConditions: keyConditions.map(cond => ({
      title: String(cond.title).trim(),
      text: String(cond.text).trim()
    })),
    _schemaVersion: 1,
    validatedAt: new Date().toISOString()
  };
}


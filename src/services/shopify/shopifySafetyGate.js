/**
 * shopifySafetyGate.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mediluxe Health Solutions · Regulatory & Commercial Compliance Gate.
 * Enforces strict boundaries between direct-to-consumer online retail
 * (mediluxegulf.com) and clinical/prescription B2B healthcare in Atlas Health.
 */

export const REGULATORY_TIERS = {
  RETAIL_ELIGIBLE: 'retail_eligible',
  RESTRICTED_CLINICAL: 'restricted_clinical',
  REQUIRES_REVIEW: 'requires_review'
};

/**
 * Hardcoded blacklist of categories and keywords strictly prohibited
 * from direct online retail sale on Shopify.
 */
const RESTRICTED_PATTERNS = [
  /peptide/i,
  /injectable/i,
  /subq/i,
  /intramuscular/i,
  /vial/i,
  /prescription/i,
  /compounded rx/i,
  /controlled/i,
  /hormone/i,
  /bhrt/i,
  /semaglutide/i,
  /tirzepatide/i,
  /retatrutide/i,
  /bpc-157/i,
  /tb-500/i,
  /epithalon/i,
  /cjc-1295/i,
  /ipamorelin/i,
  /ghk-cu/i
];

/**
 * Categories explicitly approved for direct online sales in UAE.
 */
const RETAIL_APPROVED_CATEGORIES = [
  'supplement',
  'supplements',
  'nutraceutical',
  'nutraceuticals',
  'oral supplement',
  'oral nutraceutical',
  'topical',
  'haircare',
  'cosmeceutical',
  'skincare',
  'wellness',
  'longevity oral'
];

/**
 * Evaluates whether an Atlas product is eligible for synchronization and sale on Shopify.
 * 
 * @param {Object} product - Atlas canonical product object
 * @returns {Object} Evaluation report with tier, isBlocked, and reasons
 */
export function evaluateProductCompliance(product) {
  if (!product) {
    return {
      tier: REGULATORY_TIERS.REQUIRES_REVIEW,
      isAllowedOnShopify: false,
      reasons: ['Missing product data'],
      badgeLabel: 'Incomplete'
    };
  }

  const reasons = [];
  const name = String(product.name || product.title || '').trim();
  const category = String(product.category || '').toLowerCase();
  const form = String(product.form || product.deliveryMethod || '').toLowerCase();
  const regulatoryClass = String(product.regulatoryClassification || '').toLowerCase();

  // 1. Check for hard-blocked regulatory classifications
  if (regulatoryClass.includes('prescription') || regulatoryClass.includes('rx_only') || regulatoryClass.includes('unlicensed_api')) {
    reasons.push('Classified as Prescription Only (Rx) or Unlicensed API.');
  }

  // 2. Check for restricted patterns in name, form or ingredients
  for (const pattern of RESTRICTED_PATTERNS) {
    if (pattern.test(name)) {
      reasons.push(`Contains restricted clinical indicator in title: "${name.match(pattern)[0]}".`);
      break;
    }
    if (pattern.test(category)) {
      reasons.push(`Category "${category}" matches restricted clinical pattern.`);
      break;
    }
    if (pattern.test(form)) {
      reasons.push(`Form "${form}" is not authorized for direct retail sale.`);
      break;
    }
  }

  // Check active ingredients if present
  const apis = Array.isArray(product.apis) ? product.apis : [];
  for (const api of apis) {
    const apiName = String(api.name || api.productName || '');
    for (const pattern of RESTRICTED_PATTERNS) {
      if (pattern.test(apiName)) {
        reasons.push(`Contains restricted active compound: "${apiName}".`);
        break;
      }
    }
  }

  // 3. If any clinical restriction triggered -> STRICTLY BLOCKED
  if (reasons.length > 0) {
    return {
      tier: REGULATORY_TIERS.RESTRICTED_CLINICAL,
      isAllowedOnShopify: false,
      reasons,
      badgeLabel: 'B2B Clinical Only (Blocked)',
      suggestedAction: 'Keep in Atlas for physicians, clinics, and compounding pharmacy use only.'
    };
  }

  // 4. Verify category matches approved retail list
  const isApprovedCategory = RETAIL_APPROVED_CATEGORIES.some(c => category.includes(c)) ||
    ['oral', 'capsules', 'tablet', 'lotion', 'topical', 'shampoo', 'serum'].some(f => form.includes(f));

  if (!isApprovedCategory && !product.approvedForShopify) {
    return {
      tier: REGULATORY_TIERS.REQUIRES_REVIEW,
      isAllowedOnShopify: false,
      reasons: ['Product category is not in the automatic OTC whitelist. Requires explicit administrator verification.'],
      badgeLabel: 'Needs Clinical Review',
      suggestedAction: 'Review formulation and assign explicit OTC compliance classification.'
    };
  }

  // 5. Approved for Retail
  return {
    tier: REGULATORY_TIERS.RETAIL_ELIGIBLE,
    isAllowedOnShopify: true,
    reasons: ['Meets UAE OTC / general wellness retail criteria.'],
    badgeLabel: 'Retail Ready (OTC)',
    suggestedAction: 'Ready to stage and synchronize to mediluxegulf.com.'
  };
}


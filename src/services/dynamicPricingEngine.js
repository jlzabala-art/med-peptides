import crypto from 'crypto';

/**
 * dynamicPricingEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * High-Performance Multi-Channel Dynamic Pricing & Cryptographic Quote Engine.
 * 
 * Channels:
 *   - 'b2c' / 'patient' : Standard patient retail pricing
 *   - 'clinic'          : Professional practitioner wholesale tier (15-25% margin)
 *   - 'wholesale_t1'    : Tier 1 Bulk (10-49 units, 30% margin)
 *   - 'wholesale_t2'    : Master Wholesaler / Pharmacy (50+ units, 40% margin)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CHANNEL_MARGIN_CONFIG = {
  'b2c': {
    label: 'Direct-to-Patient Retail',
    markupMultiplier: 1.50, // 50% markup over net cost
    minMarginPercent: 30,
    allowCreditTerms: false
  },
  'clinic': {
    label: 'Medical Clinic & Practitioner Tier',
    markupMultiplier: 1.25, // 25% markup over net cost
    minMarginPercent: 20,
    allowCreditTerms: true,
    creditDays: 30
  },
  'wholesale_t1': {
    label: 'Wholesale Tier 1 (10-49 units)',
    markupMultiplier: 1.18, // 18% markup over net cost
    minMarginPercent: 12,
    allowCreditTerms: true,
    creditDays: 45
  },
  'wholesale_t2': {
    label: 'Master Distributor Tier 2 (50+ units)',
    markupMultiplier: 1.12, // 12% markup over net cost
    minMarginPercent: 8,
    allowCreditTerms: true,
    creditDays: 60
  }
};

export const COLD_CHAIN_SURCHARGE = {
  USD: 18.50,
  EUR: 16.50,
  GBP: 14.50
};

export const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79
};

/**
 * Calculates deterministic multi-channel price for a product or variant
 */
export function calculateChannelPrice({
  baseCost = 0,
  listPrice = 0,
  channel = 'b2c',
  targetCurrency = 'USD',
  requiresColdChain = false,
  quantity = 1
}) {
  const normChannel = String(channel).toLowerCase().trim();
  const config = CHANNEL_MARGIN_CONFIG[normChannel] || CHANNEL_MARGIN_CONFIG['b2c'];
  const currencyRate = EXCHANGE_RATES[targetCurrency] || 1.0;

  // Determine effective unit cost
  let effectiveCost = Number(baseCost) || 0;
  if (effectiveCost <= 0 && listPrice > 0) {
    effectiveCost = listPrice * 0.6; // Inferred 40% margin base if cost unlisted
  }

  // Calculate channel unit price
  let unitPrice = effectiveCost > 0 ? effectiveCost * config.markupMultiplier : (listPrice || 0);

  // If list price is explicitly set and channel is b2c, respect listPrice
  if (normChannel === 'b2c' && listPrice > 0 && listPrice >= effectiveCost) {
    unitPrice = listPrice;
  }

  // Quantity volume discount tiering
  if (quantity >= 50 && normChannel !== 'wholesale_t2') {
    unitPrice *= 0.90; // Additional 10% volume rebate
  } else if (quantity >= 20 && normChannel === 'clinic') {
    unitPrice *= 0.93; // Additional 7% clinic volume rebate
  }

  // Currency conversion
  const convertedUnitPrice = unitPrice * currencyRate;
  const convertedCost = effectiveCost * currencyRate;

  // Cold chain handling fee per order
  const coldChainFee = requiresColdChain ? (COLD_CHAIN_SURCHARGE[targetCurrency] || 18.50) : 0;
  const subtotal = convertedUnitPrice * quantity;
  const total = subtotal + coldChainFee;

  // Margin safety guardrail calculation
  const grossProfit = total - (convertedCost * quantity + coldChainFee * 0.5);
  const marginPercent = total > 0 ? Math.round((grossProfit / total) * 100) : 0;

  return {
    channel: normChannel,
    channelLabel: config.label,
    quantity,
    currency: targetCurrency,
    unitPrice: Number(convertedUnitPrice.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    coldChainFee: Number(coldChainFee.toFixed(2)),
    total: Number(total.toFixed(2)),
    marginPercent,
    isMarginSafe: marginPercent >= config.minMarginPercent,
    creditTerms: config.allowCreditTerms ? `Net ${config.creditDays} Days` : 'Due Upon Receipt'
  };
}

const QUOTE_SECRET = process.env.QUOTE_SECRET_KEY || 'regenpept-secure-quote-signing-key-2026';

/**
 * Generates a tamper-proof cryptographically signed quote token
 */
export function generateSignedQuoteToken(quotePayload, validityHours = 48) {
  const expiresAt = Date.now() + validityHours * 3600 * 1000;
  const payloadToSign = {
    ...quotePayload,
    exp: expiresAt,
    iat: Date.now()
  };

  const payloadString = Buffer.from(JSON.stringify(payloadToSign)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', QUOTE_SECRET)
    .update(payloadString)
    .digest('base64url');

  return `${payloadString}.${signature}`;
}

/**
 * Verifies a signed quote token and returns the parsed payload if valid & non-expired
 */
export function verifySignedQuoteToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Missing token' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid token structure' };
  }

  const [payloadString, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', QUOTE_SECRET)
    .update(payloadString)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return { valid: false, error: 'Tampered token signature' };
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadString, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false, expired: true, error: 'Quote link has expired', payload };
    }
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Malformed token payload' };
  }
}

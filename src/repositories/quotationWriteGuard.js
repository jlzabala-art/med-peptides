/**
 * src/repositories/quotationWriteGuard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Firestore Quotation Write Guard & Normalizer — v1
 *
 * Rules:
 *   - Status normalization (lowercase canonical: draft, pending, sent, approved, converted, rejected, expired, cancelled)
 *   - RecipientType normalization (patient, clinic, wholesaler)
 *   - Auto-generation of quotationNumber if missing: QT-YYYYMMDD-XXXX
 *   - Line items calculation: quantity * unitPrice = totalPrice, margin calculation
 *   - Deprecated field stripping (category -> recipientType, tier -> pricingTier)
 *   - B2B Channel Context normalization
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const VALID_QUOTATION_STATUSES = Object.freeze([
  'draft',
  'pending',
  'sent',
  'approved',
  'converted',
  'rejected',
  'expired',
  'cancelled',
]);

export const VALID_RECIPIENT_TYPES = Object.freeze([
  'patient',
  'clinic',
  'wholesaler',
]);

export const VALID_PAYMENT_TERMS = Object.freeze([
  'due_on_receipt',
  'net_15',
  'net_30',
  'net_60',
  '50_deposit_50_delivery',
]);

export class QuotationValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'QuotationValidationError';
    this.details = details;
  }
}

/**
 * Generates a readable quotation number: QT-YYYYMMDD-XXXX
 */
function generateQuotationNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `QT-${datePart}-${randPart}`;
}

/**
 * Validates and normalizes a quotation document before writing to Firestore.
 *
 * @param {Object} inputData
 * @param {boolean} [isUpdate=false]
 * @returns {Object} Normalized quotation object ready for Firestore
 */
export function validateQuotationWrite(inputData, isUpdate = false) {
  if (!inputData || typeof inputData !== 'object') {
    throw new QuotationValidationError('Input data must be a valid object.');
  }

  const clean = { ...inputData };
  const warnings = [];

  // 1. Deprecated field migrations
  if ('category' in clean) {
    if (!clean.recipientType) clean.recipientType = clean.category;
    warnings.push('category migrated to recipientType');
    delete clean.category;
  }
  if ('tier' in clean) {
    if (!clean.pricingTier) clean.pricingTier = clean.tier;
    warnings.push('tier migrated to pricingTier');
    delete clean.tier;
  }
  if ('tierLevel' in clean) {
    if (!clean.pricingTier) clean.pricingTier = clean.tierLevel;
    delete clean.tierLevel;
  }

  // 2. Auto-generate quotationNumber if missing on create
  if (!isUpdate && !clean.quotationNumber) {
    clean.quotationNumber = clean.refNumber || generateQuotationNumber();
  }

  // 3. Status normalization
  if (clean.status) {
    const rawStatus = String(clean.status).toLowerCase().trim();
    if (rawStatus === 'accepted') clean.status = 'approved';
    else if (rawStatus === 'generated') clean.status = 'sent';
    else if (rawStatus === 'active') clean.status = 'approved';
    else clean.status = rawStatus;

    if (!VALID_QUOTATION_STATUSES.includes(clean.status)) {
      warnings.push(`Unknown status "${rawStatus}", defaulting to "pending"`);
      clean.status = 'pending';
    }
  } else if (!isUpdate) {
    clean.status = 'draft';
  }

  // 4. RecipientType normalization
  if (clean.recipientType) {
    clean.recipientType = String(clean.recipientType).toLowerCase().trim();
    if (!VALID_RECIPIENT_TYPES.includes(clean.recipientType)) {
      clean.recipientType = 'clinic';
    }
  } else if (!isUpdate) {
    clean.recipientType = 'patient';
  }

  // 5. Payment terms
  if (clean.paymentTerms) {
    clean.paymentTerms = String(clean.paymentTerms).toLowerCase().trim();
    if (!VALID_PAYMENT_TERMS.includes(clean.paymentTerms)) {
      clean.paymentTerms = 'due_on_receipt';
    }
  } else if (!isUpdate) {
    clean.paymentTerms = 'due_on_receipt';
  }

  // 6. Currency
  clean.currency = clean.currency ? String(clean.currency).toUpperCase().trim() : 'USD';

  // 7. Line Items normalization & financial calculations
  if (Array.isArray(clean.items)) {
    let subtotal = 0;
    let totalCost = 0;

    clean.items = clean.items.map((item, idx) => {
      const qty = Math.max(1, Number(item.quantity || 1));
      const unitPrice = Math.max(0, Number(item.unitPrice || item.unitRate || item.price || 0));
      const supplierCost = Math.max(0, Number(item.supplierCost || (unitPrice > 0 ? unitPrice * 0.55 : 0)));
      const totalPrice = Number((qty * unitPrice).toFixed(2));
      const lineCost = Number((qty * supplierCost).toFixed(2));

      subtotal += totalPrice;
      totalCost += lineCost;

      const marginPercent = totalPrice > 0 && lineCost > 0
        ? Number((((totalPrice - lineCost) / totalPrice) * 100).toFixed(1))
        : null;

      return {
        productId: String(item.productId || item.id || `item-${idx + 1}`),
        variantId: item.variantId ? String(item.variantId) : '',
        name: String(item.name || item.productName || item.title || 'Product'),
        dosage: item.dosage || item.dose || '',
        presentation: item.presentation || '',
        supplierId: item.supplierId ? String(item.supplierId) : '',
        supplierName: item.supplierName ? String(item.supplierName) : '',
        quantity: qty,
        unitPrice,
        supplierCost,
        totalPrice,
        marginPercent,
        requiresColdChain: item.requiresColdChain !== false,
      };
    });

    clean.subtotal = Number(subtotal.toFixed(2));
    clean.taxTotal = clean.taxTotal !== undefined ? Number(clean.taxTotal) : Number((subtotal * 0.05).toFixed(2));
    clean.shippingTotal = clean.shippingTotal !== undefined ? Number(clean.shippingTotal) : 0;
    clean.discountTotal = clean.discountTotal !== undefined ? Number(clean.discountTotal) : 0;
    clean.grandTotal = Number((clean.subtotal + clean.taxTotal + clean.shippingTotal - clean.discountTotal).toFixed(2));

    clean.marginPercent = clean.subtotal > 0 && totalCost > 0
      ? Number((((clean.subtotal - totalCost) / clean.subtotal) * 100).toFixed(1))
      : 45.0;
  }

  // 8. Timestamps
  const nowIso = new Date().toISOString();
  if (!isUpdate && !clean.createdAt) {
    clean.createdAt = nowIso;
  }
  clean.updatedAt = nowIso;

  if (warnings.length > 0) {
    clean._guardWarnings = warnings;
  }

  return clean;
}

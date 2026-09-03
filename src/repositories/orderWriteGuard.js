/**
 * orderWriteGuard.js — Extended v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Extended from the original basic guard. Adds:
 *   - Full alignment with firestoreOrderSchema.js field contract
 *   - Status + payment status normalization (Rule #28)
 *   - Auto-generation of orderNumber if missing (RP-YYYYMMDD-XXXX)
 *   - Items validation: productId + name required, totalPrice auto-computed
 *   - Deprecated field stripping (lineItems → items, etc.)
 *   - Schema version stamping
 *
 * BACKWARDS COMPATIBLE: All existing exports preserved.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  ORDER_SCHEMA_VER,
  VALID_ORDER_STATUSES,
  VALID_PAYMENT_STATUSES,
  VALID_PRODUCTION_STATUSES,
  KNOWN_ORDER_FIELDS,
  DEPRECATED_ORDER_FIELDS,
} from '../schemas/firestoreOrderSchema.js';

// ── Re-export canonical statuses (backwards compatible) ───────────────────────
export const ORDER_STATUSES = Object.freeze({
  DRAFT:            'draft',
  AWAITING_PAYMENT: 'awaiting payment',
  PROCESSING:       'processing',
  IN_TRANSIT:       'en tránsito',
  DELIVERED:        'delivered',
  DISPUTED:         'disputed',
  CANCELLED:        'cancelled',
});

// ── Custom Error ──────────────────────────────────────────────────────────────
export class OrderValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'OrderValidationError';
    this.details = details;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generates a readable order number: RP-YYYYMMDD-XXXX
 * @returns {string}
 */
function generateOrderNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RP-${datePart}-${randPart}`;
}

// ── Order Write Guard ─────────────────────────────────────────────────────────

/**
 * Validates and normalizes an order document before writing to Firestore.
 *
 * @param {Object}  inputData
 * @param {boolean} [isUpdate=false] — if true, relaxes required field checks
 * @returns {Object} Cleaned, normalized order data ready for Firestore
 * @throws {OrderValidationError}
 */
export function validateOrderWrite(inputData, isUpdate = false) {
  if (!inputData || typeof inputData !== 'object') {
    throw new OrderValidationError('Input data must be a valid object.');
  }

  const clean = { ...inputData };
  const warnings = [];

  // ── 1. Migrate deprecated field names ─────────────────────────────────────
  DEPRECATED_ORDER_FIELDS.forEach((f) => {
    if (f in clean) {
      if (f === 'lineItems' || f === 'products' || f === 'orderItems') {
        if (!clean.items) clean.items = clean[f];
        warnings.push(`${f} migrated to items[]`);
      }
      if (f === 'price') {
        if (!clean.subtotal) clean.subtotal = clean[f];
        warnings.push(`price migrated to subtotal`);
      }
      if (f === 'amount') {
        if (!clean.total) clean.total = clean[f];
        warnings.push(`amount migrated to total`);
      }
      delete clean[f];
    }
  });

  // ── 2. Auto-generate orderNumber if missing (creates only) ─────────────────
  if (!isUpdate && !clean.orderNumber) {
    clean.orderNumber = generateOrderNumber();
  }

  // ── 3. Status normalization (Rule #28 — always lowercase) ─────────────────
  if (clean.status) {
    const lower = clean.status.toLowerCase();
    // Handle 'canceled' → 'cancelled'
    const normalized = lower === 'canceled' ? 'cancelled' : lower;
    if (!VALID_ORDER_STATUSES.includes(normalized)) {
      throw new OrderValidationError(
        `Invalid order status: '${clean.status}'. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`
      );
    }
    clean.status = normalized;
  } else if (!isUpdate) {
    clean.status = ORDER_STATUSES.AWAITING_PAYMENT;
  }

  // ── 4. Payment status normalization ───────────────────────────────────────
  if (clean.paymentStatus) {
    const lower = clean.paymentStatus.toLowerCase();
    if (!VALID_PAYMENT_STATUSES.includes(lower)) {
      warnings.push(`Invalid paymentStatus "${clean.paymentStatus}" — reset to "pending"`);
      clean.paymentStatus = 'pending';
    } else {
      clean.paymentStatus = lower;
    }
  } else if (!isUpdate) {
    clean.paymentStatus = 'pending';
  }

  // ── 5. Production status normalization ────────────────────────────────────
  if (clean.productionStatus) {
    const lower = clean.productionStatus.toLowerCase();
    const normalized = lower === 'canceled' ? 'cancelled' : lower;
    if (!VALID_PRODUCTION_STATUSES.includes(normalized)) {
      warnings.push(`Invalid productionStatus "${clean.productionStatus}" — reset to "pending"`);
      clean.productionStatus = 'pending';
    } else {
      clean.productionStatus = normalized;
    }
  } else if (!isUpdate) {
    clean.productionStatus = 'pending';
  }

  // ── 6. Financial fields validation ────────────────────────────────────────
  const financialFields = ['subtotal', 'total', 'shippingFee', 'taxTotal'];
  financialFields.forEach((field) => {
    if (clean[field] !== undefined && clean[field] !== null) {
      const parsed = parseFloat(clean[field]);
      if (isNaN(parsed)) {
        throw new OrderValidationError(`Field '${field}' must be a valid number.`);
      }
      clean[field] = Math.max(0, parsed);
    } else if (!isUpdate && (field === 'subtotal' || field === 'total')) {
      clean[field] = 0;
    }
  });

  // ── 7. Items validation ───────────────────────────────────────────────────
  if (clean.items) {
    if (!Array.isArray(clean.items)) {
      throw new OrderValidationError('items must be an array.');
    }
    clean.items = clean.items.map((item, index) => {
      if (!item.productId) {
        throw new OrderValidationError(
          `Order item at index ${index} must have a valid 'productId'.`
        );
      }
      if (!item.name) {
        throw new OrderValidationError(
          `Order item at index ${index} must have a 'name'.`
        );
      }
      // Auto-compute totalPrice
      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(item.unitPrice) || 0;
      return {
        ...item,
        quantity: qty,
        unitPrice: unitPrice,
        totalPrice: item.totalPrice ?? qty * unitPrice,
      };
    });
    if (!isUpdate && clean.items.length === 0) {
      throw new OrderValidationError('Order must contain at least one item.');
    }
  } else if (!isUpdate) {
    clean.items = [];
  }

  // ── 8. Schema version stamp ───────────────────────────────────────────────
  clean._schemaVersion = ORDER_SCHEMA_VER;

  // ── 9. Timestamps ─────────────────────────────────────────────────────────
  if (!isUpdate && !clean.createdAt) {
    clean.createdAt = new Date().toISOString();
  }
  clean.updatedAt = new Date().toISOString();

  if (warnings.length > 0) {
    console.warn('[orderWriteGuard] Warnings:', warnings);
  }

  return clean;
}

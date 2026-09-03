/**
 * firestoreOrderSchema.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Firestore Order Schema — v1
 *
 * SINGLE SOURCE OF TRUTH para el modelo de datos de la colección `orders`.
 *
 * Define:
 *   - ORDER_SCHEMA_VER         → versión del schema
 *   - VALID_ORDER_STATUSES     → valores de status canónicos (Rule #28)
 *   - VALID_PAYMENT_STATUSES   → estados de pago canónicos
 *   - ORDER_FIELD_CONTRACT     → contrato explícito de campos raíz
 *   - ORDER_ITEM_FIELD_CONTRACT → contrato de línea de pedido
 *   - KNOWN_ORDER_FIELDS       → set para stripping
 *   - DEPRECATED_ORDER_FIELDS  → campos legacy prohibidos
 *
 * REGLAS:
 *   - Zero UI imports.
 *   - Zero Firebase imports.
 *   - Pure JS — seguro para Node scripts, Cloud Functions y browser.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Schema version ────────────────────────────────────────────────────────────
export const ORDER_SCHEMA_VER = 1;

// ── Allowed enum values (AGENTS.md Rule #28) ──────────────────────────────────

/**
 * Canonical order statuses. ALWAYS lowercase.
 * Lifecycle: draft → awaiting payment → processing → en tránsito → delivered
 * Exceptions: disputed | cancelled (can happen at any post-payment stage)
 * @readonly
 */
export const VALID_ORDER_STATUSES = Object.freeze([
  'draft',
  'awaiting payment',
  'processing',
  'en tránsito',
  'delivered',
  'disputed',
  'cancelled',
]);

/**
 * Canonical payment statuses.
 * @readonly
 */
export const VALID_PAYMENT_STATUSES = Object.freeze([
  'pending',
  'paid',
  'failed',
  'refunded',
]);

/**
 * Canonical production statuses (internal fulfillment tracking).
 * @readonly
 */
export const VALID_PRODUCTION_STATUSES = Object.freeze([
  'pending',
  'production',
  'done',
  'cancelled',
]);

/**
 * Roles that can place orders.
 * @readonly
 */
export const VALID_ORDER_ROLES = Object.freeze([
  'patient',
  'doctor',
  'clinic',
  'wholesaler',
  'supplier',
  'admin',
]);

// ── Order Line Item Contract ───────────────────────────────────────────────────

/**
 * Contrato de campo para cada elemento de `orders/{orderId}/items[]`.
 */
export const ORDER_ITEM_FIELD_CONTRACT = Object.freeze({
  productId:    { type: 'string',  required: true,  default: '' },
  variantId:    { type: 'string',  required: false, default: '' },
  name:         { type: 'string',  required: true,  default: '' },
  sku:          { type: 'string',  required: false, default: '' },
  dosage:       { type: 'string',  required: false, default: '' },
  presentation: { type: 'string',  required: false, default: '' },
  supplierId:   { type: 'string',  required: false, default: '' },
  supplierName: { type: 'string',  required: false, default: '' },
  quantity:     { type: 'number',  required: true,  default: 1 },
  unitPrice:    { type: 'number',  required: true,  default: 0 },
  totalPrice:   { type: 'number',  required: false, default: 0, auto: true }, // quantity * unitPrice
  marginPercent:{ type: 'number',  required: false, default: null },
  lotNumber:    { type: 'string',  required: false, default: '' },
  coaUrl:       { type: 'string',  required: false, default: '' },
});

// ── Root Order Field Contract ─────────────────────────────────────────────────

/**
 * Contrato explícito de campos para `orders/{orderId}`.
 */
export const ORDER_FIELD_CONTRACT = Object.freeze({
  // ── Auto-generated identifier ─────────────────────────────────────────────
  orderNumber: { type: 'string', required: false, auto: true, default: '',
    note: 'Format: RP-YYYYMMDD-XXXX. Auto-stamped by WriteGuard if missing.' },

  // ── Actors ────────────────────────────────────────────────────────────────
  userId:       { type: 'string',  required: true,  default: '' },
  userEmail:    { type: 'string',  required: false, default: '' },
  userName:     { type: 'string',  required: false, default: '' },
  role:         { type: 'enum',    required: false, default: 'patient', values: VALID_ORDER_ROLES },

  // ── Supplier ──────────────────────────────────────────────────────────────
  supplierId:              { type: 'string',  required: false, default: '' },
  supplierName:            { type: 'string',  required: false, default: '' },
  supplierInvoiceNumber:   { type: 'string',  required: false, default: '' },
  supplierInvoiceStatus:   { type: 'enum',    required: false, default: 'pending',
    values: ['pending', 'paid'] },
  supplierShippingCost:    { type: 'number',  required: false, default: 0 },
  supplierItemsCost:       { type: 'number',  required: false, default: 0 },

  // ── Status ────────────────────────────────────────────────────────────────
  status:           { type: 'enum', required: true, default: 'awaiting payment', values: VALID_ORDER_STATUSES },
  paymentStatus:    { type: 'enum', required: false, default: 'pending', values: VALID_PAYMENT_STATUSES },
  productionStatus: { type: 'enum', required: false, default: 'pending', values: VALID_PRODUCTION_STATUSES },

  // ── Financial ─────────────────────────────────────────────────────────────
  currency:     { type: 'string',  required: false, default: 'USD' },
  subtotal:     { type: 'number',  required: true,  default: 0 },
  shippingFee:  { type: 'number',  required: false, default: 0 },
  taxTotal:     { type: 'number',  required: false, default: 0 },
  total:        { type: 'number',  required: true,  default: 0 },

  // ── Line Items ────────────────────────────────────────────────────────────
  items: { type: 'object[]', required: true, default: [],
    note: 'Array of ORDER_ITEM_FIELD_CONTRACT objects. Min 1 item required.' },

  // ── Addresses ─────────────────────────────────────────────────────────────
  shippingAddress: { type: 'object', required: false, default: null },
  billingAddress:  { type: 'object', required: false, default: null },

  // ── Payment ───────────────────────────────────────────────────────────────
  paymentMethod:         { type: 'string', required: false, default: '' },
  signedPrescriptionUrl: { type: 'string', required: false, default: '' },

  // ── Notes & Tracking ──────────────────────────────────────────────────────
  notes:          { type: 'string',  required: false, default: '' },
  trackingNumber: { type: 'string',  required: false, default: '' },
  trackingUrl:    { type: 'string',  required: false, default: '' },
  carrier:        { type: 'string',  required: false, default: '' },

  // ── Schema versioning ─────────────────────────────────────────────────────
  _schemaVersion: { type: 'number', required: false, auto: true, default: ORDER_SCHEMA_VER },

  // ── Timestamps ────────────────────────────────────────────────────────────
  createdAt:      { type: 'timestamp', required: false, auto: true },
  updatedAt:      { type: 'timestamp', required: false, auto: true },
  deliveredAt:    { type: 'timestamp', required: false, default: null },
  cancelledAt:    { type: 'timestamp', required: false, default: null },
});

// ── Known & Deprecated Fields ─────────────────────────────────────────────────

export const KNOWN_ORDER_FIELDS = Object.freeze(
  Object.keys(ORDER_FIELD_CONTRACT)
);

export const KNOWN_ORDER_ITEM_FIELDS = Object.freeze(
  Object.keys(ORDER_ITEM_FIELD_CONTRACT)
);

/**
 * Legacy field names that must not appear in new writes.
 */
export const DEPRECATED_ORDER_FIELDS = Object.freeze([
  'price',          // → subtotal
  'amount',         // → total
  'patientId',      // → userId (with role: 'patient')
  'doctorId',       // → userId (with role: 'doctor')
  'lineItems',      // → items
  'products',       // → items
  'orderItems',     // → items
]);

/**
 * transactionalStateMachine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional State Machine & Transition Rules for Transactional Entities:
 *   - RFQ (Request For Quotation)
 *   - Quotation (Client & Supplier Quotations)
 *   - Purchase Order (PO)
 *   - Sales Order (Client Order)
 *
 * Implements AGENTS.md Rule #25 (Idempotency) & Rule #28 (Strict Taxonomy).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const TRANSACTION_TYPES = Object.freeze({
  RFQ: 'rfq',
  QUOTATION: 'quotation',
  PRESCRIPTION: 'prescription',
  PURCHASE_ORDER: 'purchase_order',
  SALES_ORDER: 'sales_order'
});

export const TRANSACTION_TAXONOMY = Object.freeze({
  prescription: {
    // AGENTS.md Rule #28: draft, pending, approved, processing, en tránsito, completed, cancelled
    states: ['draft', 'pending', 'pending_approval', 'approved', 'processing', 'en tránsito', 'completed', 'cancelled'],
    initial: 'draft',
    transitions: {
      draft: ['pending', 'pending_approval', 'approved', 'cancelled'],
      pending: ['approved', 'cancelled'],
      pending_approval: ['approved', 'cancelled'],
      approved: ['processing', 'en tránsito', 'cancelled'],
      processing: ['en tránsito', 'completed', 'cancelled'],
      'en tránsito': ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    }
  },
  rfq: {
    states: ['draft', 'pending_supplier', 'supplier_quoted', 'converted_to_client_quote', 'converted_to_po', 'rejected', 'closed'],
    initial: 'draft',
    transitions: {
      draft: ['pending_supplier', 'rejected', 'closed'],
      pending_supplier: ['supplier_quoted', 'rejected', 'closed'],
      supplier_quoted: ['converted_to_client_quote', 'converted_to_po', 'rejected', 'closed'],
      converted_to_client_quote: ['converted_to_po', 'closed'],
      converted_to_po: ['closed'],
      rejected: ['draft'],
      closed: []
    }
  },
  quotation: {
    states: ['draft', 'pending_approval', 'sent', 'accepted', 'converted_to_order', 'converted_to_po', 'rejected', 'expired', 'cancelled'],
    initial: 'draft',
    transitions: {
      draft: ['pending_approval', 'sent', 'cancelled'],
      pending_approval: ['sent', 'rejected', 'cancelled'],
      sent: ['accepted', 'rejected', 'expired', 'cancelled'],
      accepted: ['converted_to_order', 'converted_to_po', 'cancelled'],
      converted_to_order: [],
      converted_to_po: [],
      rejected: ['draft'],
      expired: ['draft'],
      cancelled: []
    }
  },
  purchase_order: {
    states: ['draft', 'po_created', 'awaiting_payment', 'in_transit', 'delivered', 'reconciled', 'disputed', 'cancelled'],
    initial: 'draft',
    transitions: {
      draft: ['po_created', 'cancelled'],
      po_created: ['awaiting_payment', 'in_transit', 'cancelled'],
      awaiting_payment: ['in_transit', 'cancelled'],
      in_transit: ['delivered', 'disputed'],
      delivered: ['reconciled', 'disputed'],
      reconciled: [],
      disputed: ['delivered', 'reconciled', 'cancelled'],
      cancelled: []
    }
  },
  sales_order: {
    states: ['draft', 'pending', 'processing', 'en tránsito', 'shipped', 'delivered', 'completed', 'disputed', 'cancelled'],
    initial: 'draft',
    transitions: {
      draft: ['pending', 'cancelled'],
      pending: ['processing', 'cancelled'],
      processing: ['en tránsito', 'shipped', 'cancelled'],
      'en tránsito': ['delivered', 'disputed'],
      shipped: ['delivered', 'disputed'],
      delivered: ['completed', 'disputed'],
      completed: [],
      disputed: ['delivered', 'completed', 'cancelled'],
      cancelled: []
    }
  }
});

/**
 * Validates if a transition is legal for a given transaction type.
 * @param {string} type - 'rfq' | 'quotation' | 'purchase_order' | 'sales_order'
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @returns {boolean}
 */
export function canTransitionTo(type, currentStatus, targetStatus) {
  if (!type || !currentStatus || !targetStatus) return false;
  if (currentStatus.toLowerCase() === targetStatus.toLowerCase()) return true;

  const entityRules = TRANSACTION_TAXONOMY[type.toLowerCase()];
  if (!entityRules) return false;

  const allowed = entityRules.transitions[currentStatus.toLowerCase()] || [];
  return allowed.map(s => s.toLowerCase()).includes(targetStatus.toLowerCase());
}

/**
 * Returns list of allowed next states for a given transaction.
 * @param {string} type 
 * @param {string} currentStatus 
 * @returns {string[]}
 */
export function getNextAllowedStates(type, currentStatus) {
  if (!type || !currentStatus) return [];
  const entityRules = TRANSACTION_TAXONOMY[type.toLowerCase()];
  if (!entityRules) return [];
  return entityRules.transitions[currentStatus.toLowerCase()] || [];
}

/**
 * Returns GCP semantic color for transaction badges.
 */
export function getTransactionStatusSemantic(status = '') {
  const low = String(status).toLowerCase().trim();
  if (['active', 'approved', 'accepted', 'completed', 'delivered', 'reconciled'].includes(low)) {
    return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Success / Completed' };
  }
  if (['pending', 'pending_supplier', 'pending_approval', 'draft', 'processing', 'awaiting_payment', 'awaiting payment'].includes(low)) {
    return { color: '#d97706', bg: '#fffbeb', border: '#fef3c7', label: 'Pending / Action Required' };
  }
  if (['error', 'rejected', 'disputed', 'failed', 'cancelled', 'expired'].includes(low)) {
    return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Alert / Cancelled' };
  }
  if (['in_transit', 'en tránsito', 'shipped', 'po_created', 'converted_to_order', 'converted_to_po', 'converted_to_client_quote'].includes(low)) {
    return { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'In Progress / Converted' };
  }
  return { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', label: 'Neutral' };
}

/**
 * Validates business prerequisites for Purchase Order state transitions (Cold-Chain, Tracking, COA).
 * @param {Object} poRecord - The PO document data
 * @param {string} targetStatus - Intended next status
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePurchaseOrderTransition(poRecord = {}, targetStatus) {
  const current = (poRecord.status || 'draft').toLowerCase();
  const next = String(targetStatus).toLowerCase();

  // 1. First verify taxonomy transition
  if (!canTransitionTo('purchase_order', current, next)) {
    return { valid: false, error: `Invalid PO status transition from "${current}" to "${next}".` };
  }

  // 2. Business guards for in_transit: Must have tracking ID or carrier dispatch proof
  if (next === 'in_transit') {
    const hasTracking = Boolean(poRecord.trackingNumber || poRecord.trackingId || poRecord.awb || poRecord.carrier);
    if (!hasTracking) {
      return { valid: false, error: 'A valid tracking number, AWB or carrier dispatch is required to mark PO as in_transit.' };
    }
  }

  // 3. Business guards for reconciled: Must have cold-chain check or batch verification
  if (next === 'reconciled') {
    if (poRecord.temperatureExcursionDisputed) {
      return { valid: false, error: 'Cannot reconcile PO while temperature excursion is marked disputed.' };
    }
  }

  return { valid: true };
}

/**
 * Validates clinical prerequisites for Prescription transitions.
 * @param {Object} prescriptionRecord
 * @param {string} targetStatus
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePrescriptionTransition(prescriptionRecord = {}, targetStatus) {
  const current = (prescriptionRecord.status || 'draft').toLowerCase();
  const next = String(targetStatus).toLowerCase();

  // 1. Verify taxonomy graph
  if (!canTransitionTo('prescription', current, next) && !canTransitionTo('quotation', current, next)) {
    return { valid: false, error: `Invalid Prescription transition from "${current}" to "${next}".` };
  }

  // 2. Business guard for approved: Doctor verification or signature must be present
  if (next === 'approved' || next === 'accepted') {
    const hasDoctorIdentity = Boolean(
      prescriptionRecord.doctorId || 
      prescriptionRecord.doctorLicense || 
      prescriptionRecord.digitalSignature || 
      prescriptionRecord.signedBy
    );
    if (!hasDoctorIdentity) {
      return { valid: false, error: 'Prescription approval requires a verified doctor ID, license number or digital signature.' };
    }
  }

  return { valid: true };
}

/**
 * Validates commercial prerequisites for Quotation transitions.
 * @param {Object} quoteRecord
 * @param {string} targetStatus
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateQuotationTransition(quoteRecord = {}, targetStatus) {
  const current = (quoteRecord.status || 'draft').toLowerCase();
  const next = String(targetStatus).toLowerCase();

  // 1. Verify taxonomy graph
  if (!canTransitionTo('quotation', current, next)) {
    return { valid: false, error: `Invalid Quotation transition from "${current}" to "${next}".` };
  }

  // 2. Business guard for converted_to_order: Cannot convert if expired
  if (next === 'converted_to_order' || next === 'converted_to_po') {
    if (quoteRecord.validUntil) {
      const expiryDate = new Date(quoteRecord.validUntil);
      if (!isNaN(expiryDate.getTime()) && expiryDate.getTime() < Date.now()) {
        return { valid: false, error: 'Cannot convert quote: Quotation validity has expired.' };
      }
    }
  }

  return { valid: true };
}



/**
 * statusWorkflow.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single Source of Truth for multi-role prescription lifecycle statuses:
 *  1. clinicalStatus   (Doctor / Clinical Review)
 *  2. paymentStatus    (Billing / Payment Gate)
 *  3. productionStatus (Supplier / Compounding Lab — LOCKED until paid & approved)
 *  4. labelStatus      (EU GMP Dispensary Labeling)
 *  5. logisticsStatus  (Logistics Operator — customs-safe external wording)
 */

export const CLINICAL_STATUSES = [
  { value: 'draft', label: 'Draft (Incomplete)', patientLabel: 'In Preparation' },
  { value: 'pending', label: 'Pending Clinical Review', patientLabel: 'Under Medical Review' },
  { value: 'approved', label: 'Clinically Approved', patientLabel: 'Clinically Approved' },
  { value: 'cancelled', label: 'Cancelled', patientLabel: 'Cancelled' },
];

export const PAYMENT_STATUSES = [
  { value: 'unpaid', label: 'Unpaid', patientLabel: 'Payment Pending' },
  { value: 'awaiting_payment', label: 'Payment Link Sent', patientLabel: 'Awaiting Payment' },
  { value: 'paid', label: 'Paid', patientLabel: 'Paid' },
  { value: 'invoiced_b2b', label: 'Invoiced B2B (Authorized)', patientLabel: 'Clinic Covered' },
  { value: 'refunded', label: 'Refunded', patientLabel: 'Refunded' },
];

export const PRODUCTION_STATUSES = [
  { value: 'not_started', label: 'Not Started', patientLabel: 'Queued' },
  { value: 'queued', label: 'Queued for Lab', patientLabel: 'Formula Queued' },
  { value: 'processing', label: 'Compounding in Progress', patientLabel: 'Formula in Preparation' },
  { value: 'qc_passed', label: 'QC Passed / Ready', patientLabel: 'Prepared & Quality Checked' },
];

export const LABEL_STATUSES = [
  { value: 'unprinted', label: 'Unprinted', patientLabel: 'Processing' },
  { value: 'ready', label: 'Validated / Queued', patientLabel: 'Processing' },
  { value: 'printed', label: 'Printed (GMP)', patientLabel: 'Processing' },
  { value: 'reprint_needed', label: 'Reprint Needed', patientLabel: 'Processing' },
];

export const LOGISTICS_STATUSES = [
  { value: 'awaiting_release', label: 'Awaiting Payment / GMP Release', patientLabel: 'Order Confirmed — In Queue' },
  { value: 'packed_at_lab', label: 'Packed at Lab', patientLabel: 'Prepared & Quality Checked' },
  // Customs-safe wording: never claim "Sent to Patient" while in customs or international hub
  { value: 'in_transit_hub', label: 'In International Transit / Customs', patientLabel: 'In Logistics Processing / Customs Clearance' },
  { value: 'local_dispatch', label: 'Out for Local Delivery (Cleared)', patientLabel: 'Out for Local Delivery' },
  { value: 'delivered', label: 'Delivered', patientLabel: 'Delivered' },
];

/**
 * Business rule: Nothing can enter production until payment is confirmed (paid or authorized B2B invoice)
 * and clinical review is approved (or active legacy).
 */
export function isPaymentClearedForProduction(paymentStatus) {
  const p = String(paymentStatus || '').toLowerCase().trim();
  return p === 'paid' || p === 'invoiced_b2b';
}

export function canEnterProduction({ clinicalStatus, paymentStatus }) {
  const c = String(clinicalStatus || 'pending').toLowerCase().trim();
  const clinicalOk = c === 'approved' || c === 'active' || c === 'processing' || c === 'completed';
  return clinicalOk && isPaymentClearedForProduction(paymentStatus);
}

/**
 * Normalizes a prescription record into all 5 orthogonal status axes.
 */
export function resolvePrescriptionAxes(rx = {}) {
  const legacyStatus = String(rx?.status || 'pending').toLowerCase().trim();

  const clinicalStatus =
    rx?.clinicalStatus ||
    (['draft', 'pending', 'approved', 'cancelled'].includes(legacyStatus)
      ? legacyStatus
      : ['processing', 'completed', 'active', 'en tránsito', 'dispensed', 'delivered'].includes(legacyStatus)
        ? 'approved'
        : 'pending');

  const paymentStatus = rx?.paymentStatus || (legacyStatus === 'awaiting payment' ? 'awaiting_payment' : 'unpaid');

  const productionStatus =
    rx?.productionStatus ||
    (legacyStatus === 'processing'
      ? 'processing'
      : ['completed', 'delivered', 'dispensed', 'en tránsito'].includes(legacyStatus)
        ? 'qc_passed'
        : 'not_started');

  const labelStatus =
    rx?.labelStatus ||
    (Number(rx?.a4PrintCount || 0) > 0 ? 'printed' : 'unprinted');

  const logisticsStatus =
    rx?.logisticsStatus ||
    (legacyStatus === 'completed' || legacyStatus === 'delivered'
      ? 'delivered'
      : legacyStatus === 'en tránsito'
        ? 'in_transit_hub'
        : 'awaiting_release');

  return {
    clinicalStatus,
    paymentStatus,
    productionStatus,
    labelStatus,
    logisticsStatus,
  };
}

/**
 * Role-based editability matrix (Admin sees & edits all 5 axes).
 */
export function getEditableAxesForRole(role = 'admin') {
  const r = String(role || 'admin').toLowerCase().trim();
  if (r === 'admin' || r === 'superadmin' || r === 'staff') {
    return ['clinicalStatus', 'paymentStatus', 'productionStatus', 'labelStatus', 'logisticsStatus'];
  }
  if (r === 'doctor' || r === 'medical_director') {
    return ['clinicalStatus'];
  }
  if (r === 'supplier') {
    return ['productionStatus', 'labelStatus'];
  }
  if (r === 'pharmacy' || r === 'compounding_pharmacy') {
    return ['productionStatus', 'labelStatus', 'logisticsStatus'];
  }
  if (r === 'logistics' || r === 'fulfillment') {
    return ['logisticsStatus'];
  }
  return [];
}

/**
 * Deterministic cascade rules across the 5 axes so related statuses in the same row
 * stay coherent automatically whenever any axis is changed.
 */
export function cascadeAxisChange(prevAxes, changedKey, nextValue, isAdmin = false) {
  const next = { ...prevAxes, [changedKey]: nextValue };

  if (changedKey === 'clinicalStatus') {
    if (['draft', 'pending', 'cancelled'].includes(nextValue)) {
      next.productionStatus = 'not_started';
      next.logisticsStatus = 'awaiting_release';
    } else if (nextValue === 'approved' && isPaymentClearedForProduction(next.paymentStatus) && next.productionStatus === 'not_started') {
      next.productionStatus = 'queued';
    }
  }

  if (changedKey === 'paymentStatus') {
    if (!isPaymentClearedForProduction(nextValue)) {
      next.productionStatus = 'not_started';
      next.logisticsStatus = 'awaiting_release';
    } else if (next.clinicalStatus === 'approved' && next.productionStatus === 'not_started') {
      next.productionStatus = 'queued';
    }
  }

  if (changedKey === 'productionStatus') {
    if (nextValue === 'qc_passed' && next.logisticsStatus === 'awaiting_release') {
      next.logisticsStatus = 'packed_at_lab';
    }
  }

  if (changedKey === 'logisticsStatus') {
    if (nextValue === 'packed_at_lab') {
      next.clinicalStatus = 'approved';
      next.productionStatus = 'qc_passed';
    } else if (['in_transit_hub', 'local_dispatch', 'delivered'].includes(nextValue)) {
      next.clinicalStatus = 'approved';
      next.productionStatus = 'qc_passed';
      if (next.labelStatus === 'unprinted') {
        next.labelStatus = 'printed';
      }
      if (isAdmin && !isPaymentClearedForProduction(next.paymentStatus)) {
        next.paymentStatus = 'paid';
      }
    }
  }

  return next;
}

/**
 * normalizeRxStatus.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Maps ALL legacy Firestore status values → canonical lowercase vocabulary
 * as defined in AGENTS.md Rule #28 and prescriptionSchema.js.
 *
 * Canonical values:
 *   draft | pending | approved | processing | en tránsito | completed | cancelled
 *
 * Usage:
 *   import { normalizeRxStatus } from '@/lib/normalizeRxStatus';
 *   const status = normalizeRxStatus(rx.status); // always returns canonical
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** @type {Record<string, string>} */
const LEGACY_TO_CANONICAL = {
  // ── Draft variants ──────────────────────────────────────────────────────
  'draft':                     'draft',
  'Draft':                     'draft',
  'DRAFT':                     'draft',

  // ── Pending / Awaiting variants ─────────────────────────────────────────
  'pending':                   'pending',
  'Pending':                   'pending',
  'PENDING':                   'pending',
  'awaiting':                  'pending',
  'Awaiting':                  'pending',
  'assigned_to_wholesaler':    'pending',    // legacy Firestore value
  'sent':                      'pending',    // legacy: sent to patient
  'Sent':                      'pending',

  // ── Approved variants ───────────────────────────────────────────────────
  'approved':                  'approved',
  'Approved':                  'approved',
  'APPROVED':                  'approved',
  'active':                    'approved',   // legacy: "active" = prescription approved
  'Active':                    'approved',
  'ACTIVE':                    'approved',
  'viewed_by_patient':         'approved',   // legacy: patient viewed → still approved
  'added_to_bulk':             'approved',   // in a bulk order → still valid/approved

  // ── Processing variants ─────────────────────────────────────────────────
  'processing':                'processing',
  'Processing':                'processing',
  'PROCESSING':                'processing',
  'ordered':                   'processing', // legacy: order placed = processing
  'Ordered':                   'processing',

  // ── In transit variants ─────────────────────────────────────────────────
  'en tránsito':               'en tránsito',
  'in_transit':                'en tránsito',
  'In Transit':                'en tránsito',
  'in transit':                'en tránsito',
  'shipped':                   'en tránsito',
  'Shipped':                   'en tránsito',

  // ── Completed variants ──────────────────────────────────────────────────
  'completed':                 'completed',
  'Completed':                 'completed',
  'COMPLETED':                 'completed',
  'fulfilled':                 'completed',  // legacy "Fulfilled" = completed
  'Fulfilled':                 'completed',
  'FULFILLED':                 'completed',
  'delivered':                 'completed',
  'Delivered':                 'completed',

  // ── Cancelled variants ──────────────────────────────────────────────────
  'cancelled':                 'cancelled',
  'Cancelled':                 'cancelled',
  'CANCELLED':                 'cancelled',
  'canceled':                  'cancelled',  // US spelling
  'Canceled':                  'cancelled',
  'expired':                   'cancelled',  // expired prescriptions = effectively cancelled
  'Expired':                   'cancelled',
  'rejected':                  'cancelled',
  'Rejected':                  'cancelled',
};

/**
 * Normalize any raw Firestore status string to canonical lowercase value.
 * Falls back to `'draft'` for unknown / null / undefined values.
 *
 * @param {string|null|undefined} rawStatus
 * @returns {'draft'|'pending'|'approved'|'processing'|'en tránsito'|'completed'|'cancelled'}
 */
export function normalizeRxStatus(rawStatus) {
  if (!rawStatus) return 'draft';
  const mapped = LEGACY_TO_CANONICAL[rawStatus];
  if (mapped) return mapped;

  // Fallback: try lowercase match
  const lower = rawStatus.toLowerCase().trim();
  const fallback = LEGACY_TO_CANONICAL[lower];
  if (fallback) return fallback;

  console.warn(`[normalizeRxStatus] Unknown status: "${rawStatus}" — defaulting to "draft"`);
  return 'draft';
}

/**
 * Human-readable labels for each canonical status.
 * Use this for display text alongside <StatusBadge />.
 */
export const RX_STATUS_LABELS = {
  draft:          'Draft',
  pending:        'Pending',
  approved:       'Approved',
  processing:     'Processing',
  'en tránsito':  'In Transit',
  completed:      'Completed',
  cancelled:      'Cancelled',
};

/**
 * All canonical status values in logical workflow order.
 * Useful for building filter dropdowns.
 */
export const RX_STATUS_FLOW = [
  'draft',
  'pending',
  'approved',
  'processing',
  'en tránsito',
  'completed',
  'cancelled',
];

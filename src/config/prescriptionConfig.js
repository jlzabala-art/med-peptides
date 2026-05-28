/**
 * prescriptionConfig.js
 * 
 * Single source of truth for the Prescription + Bulk Order system.
 * Shared between doctor, wholesaler, patient, and admin views.
 */

// ── Prescription types ────────────────────────────────────────────────────────
export const RX_TYPE = {
  PATIENT:       'patient',       // For a specific patient
  CLINIC_SUPPLY: 'clinic_supply', // For the clinic's own stock
};

// ── Delivery methods ──────────────────────────────────────────────────────────
export const DELIVERY_METHOD = {
  DIRECT_PATIENT:  'direct_patient',  // Doctor → Patient directly
  VIA_WHOLESALER:  'via_wholesaler',  // Doctor → Wholesaler → Patient
  CLINIC_SUPPLY:   'clinic_supply',   // Doctor → Wholesaler (for clinic stock)
};

// ── Prescription status lifecycle ─────────────────────────────────────────────
export const RX_STATUS = {
  DRAFT:              'draft',
  SENT:               'sent',
  VIEWED_BY_PATIENT:  'viewed_by_patient',
  ASSIGNED_TO_WS:     'assigned_to_wholesaler',
  ADDED_TO_BULK:      'added_to_bulk',
  ORDERED:            'ordered',
  FULFILLED:          'fulfilled',
  EXPIRED:            'expired',
  CANCELLED:          'cancelled',
};

// ── Bulk order status ─────────────────────────────────────────────────────────
export const BULK_STATUS = {
  DRAFT:     'draft',
  SUBMITTED: 'submitted',
  CONFIRMED: 'confirmed',
  SHIPPED:   'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// ── Status display config ─────────────────────────────────────────────────────
export const RX_STATUS_META = {
  draft:                   { label: 'Borrador',           color: 'var(--color-text-tertiary)', bg: '#f1f5f9', emoji: '📝' },
  sent:                    { label: 'Enviada',            color: 'var(--color-primary)', bg: '#eff6ff', emoji: '📨' },
  viewed_by_patient:       { label: 'Vista por paciente', color: '#8b5cf6', bg: '#f5f3ff', emoji: '👁️' },
  assigned_to_wholesaler:  { label: 'Asignada a WS',     color: '#f59e0b', bg: 'var(--color-warning-bg)', emoji: '🏭' },
  added_to_bulk:           { label: 'En pedido bulk',     color: '#6366f1', bg: '#eef2ff', emoji: '📦' },
  ordered:                 { label: 'Pedida',             color: 'var(--color-success)', bg: '#ecfdf5', emoji: '✅' },
  fulfilled:               { label: 'Entregada',          color: 'var(--color-success)', bg: '#d1fae5', emoji: '🎉' },
  expired:                 { label: 'Expirada',           color: '#f87171', bg: 'var(--color-danger-bg)', emoji: '⏰' },
  cancelled:               { label: 'Cancelada',          color: 'var(--color-danger)', bg: 'var(--color-danger-bg)', emoji: '❌' },
};

export const BULK_STATUS_META = {
  draft:     { label: 'Borrador',   color: 'var(--color-text-tertiary)', bg: '#f1f5f9', emoji: '📝' },
  submitted: { label: 'Enviado',    color: 'var(--color-primary)', bg: '#eff6ff', emoji: '📨' },
  confirmed: { label: 'Confirmado', color: '#8b5cf6', bg: '#f5f3ff', emoji: '✔️' },
  shipped:   { label: 'Enviado',    color: '#f59e0b', bg: 'var(--color-warning-bg)', emoji: '🚚' },
  delivered: { label: 'Entregado',  color: 'var(--color-success)', bg: '#ecfdf5', emoji: '🎉' },
  cancelled: { label: 'Cancelado',  color: 'var(--color-danger)', bg: 'var(--color-danger-bg)', emoji: '❌' },
};

// ── Units ─────────────────────────────────────────────────────────────────────
export const ITEM_UNITS = ['vials', 'mg', 'units', 'kits', 'ampoules', 'pens'];

// ── Frequency options ─────────────────────────────────────────────────────────
export const FREQUENCIES = [
  'Once daily', 'Twice daily', 'Every other day', 'Weekly',
  'Twice weekly', 'Monthly', 'As needed', 'Custom',
];

// ── Duration options ──────────────────────────────────────────────────────────
export const DURATIONS = [
  '1 week', '2 weeks', '4 weeks', '6 weeks', '8 weeks',
  '12 weeks', '3 months', '6 months', 'Ongoing', 'Custom',
];

// ── Empty prescription factory ────────────────────────────────────────────────
// Multi-recipient model: doctor chooses any combination of:
//   - patient (direct in-app + optional WA/email)
//   - one or more wholesalers (each gets in-app inbox + optional WA/email)
export function newRxDraft(doctorId, doctorName, doctorEmail) {
  return {
    type:          RX_TYPE.PATIENT,
    doctorId,
    doctorName,
    doctorEmail,
    status:        RX_STATUS.DRAFT,

    // ── Patient ──────────────────────────────────────────────────────────────
    patient: { uid: '', name: '', email: '', phone: '' },
    shareWithPatient: false,   // explicit opt-in by doctor

    // ── Wholesalers (array — multiple allowed) ────────────────────────────────
    wholesalerIds:    [],      // string[] — for Firestore array-contains queries
    wholesalers:      [],      // { uid, name, email, phone }[] — full metadata

    // ── Legacy delivery field (kept for WholesalerBulkOrderBuilder compatibility)
    delivery: { method: DELIVERY_METHOD.DIRECT_PATIENT, wholesalerId: '', wholesalerName: '', wholesalerEmail: '' },

    items:         [],
    clinicalNotes: '',
    diagnosis:     '',
    createdAt:     null,
    updatedAt:     null,
    timeline:      [],
  };
}

// ── Empty bulk order factory ──────────────────────────────────────────────────
export function newBulkDraft(wholesalerId, wholesalerName, wholesalerEmail) {
  return {
    wholesalerId,
    wholesalerName,
    wholesalerEmail,
    status:          BULK_STATUS.DRAFT,
    prescriptionIds: [],
    items:           [],
    notes:           '',
    createdAt:       null,
    updatedAt:       null,
    timeline:        [],
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Aggregate items from multiple prescriptions into a single deduplicated list.
 * Items with the same productId/protocolId are summed.
 */
export function aggregatePrescriptionItems(prescriptions) {
  const map = new Map(); // key: type+id → aggregated item

  for (const rx of prescriptions) {
    for (const item of rx.items || []) {
      const key = `${item.type}__${item.id}`;
      if (map.has(key)) {
        const existing = map.get(key);
        existing.quantity += item.quantity || 0;
        existing.sources.push({
          prescriptionId: rx.id,
          patientName:    rx.patient?.name || null,
          doctorName:     rx.doctorName,
          quantity:       item.quantity,
        });
      } else {
        map.set(key, {
          ...item,
          quantity: item.quantity || 0,
          sources: [{
            prescriptionId: rx.id,
            patientName:    rx.patient?.name || null,
            doctorName:     rx.doctorName,
            quantity:       item.quantity,
          }],
          isOwnOrder: false,
        });
      }
    }
  }

  return Array.from(map.values());
}

// Timeline event factory
export function rxEvent(event, actorId, actorRole, note = '') {
  return { event, actorId, actorRole, note, timestamp: new Date() };
}

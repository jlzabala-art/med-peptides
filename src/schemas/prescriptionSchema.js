/**
 * prescriptionSchema.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Firestore Prescription Schema — v2
 *
 * UPGRADED from plain-object to a proper Firestore Field Contract,
 * following the same pattern as firestoreProductSchema and firestoreProtocolSchema.
 *
 * Define:
 *   - PRESCRIPTION_SCHEMA_VER      → versión del schema
 *   - PRESCRIPTION_STATUSES        → estados canónicos (Rule #28)
 *   - PRESCRIPTION_LINE_STATUSES   → estados de línea (lowercase)
 *   - PRESCRIPTION_SOURCES         → fuentes de prescripción
 *   - PRESCRIPTION_FIELD_CONTRACT  → contrato explícito de campos raíz
 *   - PRESCRIPTION_LINE_CONTRACT   → contrato de línea de prescripción
 *   - KNOWN_PRESCRIPTION_FIELDS    → set para stripping
 *   - DEPRECATED_PRESCRIPTION_FIELDS → campos legacy
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Schema version ────────────────────────────────────────────────────────────
export const PRESCRIPTION_SCHEMA_VER = 2;

// ── Canonical status vocabularies (AGENTS.md Rule #28) ───────────────────────

/**
 * Canonical prescription statuses. ALWAYS lowercase.
 * Lifecycle: draft → pending → approved → processing → en tránsito → completed
 * Exception: cancelled (can happen at any stage before completed)
 * @readonly
 */
export const PRESCRIPTION_STATUSES = Object.freeze({
  DRAFT:      'draft',
  PENDING:    'pending',
  APPROVED:   'approved',
  PROCESSING: 'processing',
  IN_TRANSIT: 'en tránsito',
  COMPLETED:  'completed',
  CANCELLED:  'cancelled',
});

export const VALID_PRESCRIPTION_STATUSES = Object.freeze(
  Object.values(PRESCRIPTION_STATUSES)
);

/**
 * Canonical prescription line statuses. ALWAYS lowercase.
 * (Previously had incorrect 'Pending'/'Approved'/'Rejected' capitalization)
 * @readonly
 */
export const PRESCRIPTION_LINE_STATUSES = Object.freeze({
  PENDING:  'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

export const VALID_PRESCRIPTION_LINE_STATUSES = Object.freeze(
  Object.values(PRESCRIPTION_LINE_STATUSES)
);

/**
 * Canonical prescription sources.
 * @readonly
 */
export const PRESCRIPTION_SOURCES = Object.freeze({
  FAGRON:           'Fagron Genomics',
  UPLOAD:           'Uploaded Document',
  ITEMS:            'Selected Items',
  PROTOCOL:         'Protocol',
  AI_REPORT:        'AI Report (24Genomics/Bloodo)',
  MANUAL:           'Manual',
  FAGRON_GENOMICS:  'fagron_genemocis',
});

export const VALID_PRESCRIPTION_SOURCES = Object.freeze(
  Object.values(PRESCRIPTION_SOURCES)
);

// ── Line Item Contract ────────────────────────────────────────────────────────

/**
 * Contrato de campo para cada elemento de `prescriptions/{id}/prescriptionLines[]`.
 */
export const PRESCRIPTION_LINE_CONTRACT = Object.freeze({
  id:                              { type: 'string',  required: false, default: '' },
  productId:                       { type: 'string',  required: true,  default: '' },
  variantId:                       { type: 'string',  required: false, default: '' },
  productName:                     { type: 'string',  required: false, default: '' },
  sku:                             { type: 'string',  required: false, default: '' },

  // ── Dosage & Formulation ─────────────────────────────────────────────────
  dosage:                          { type: 'string',  required: false, default: '' },
  dose:                            { type: 'string',  required: false, default: '' },
  doseUnit:                        { type: 'string',  required: false, default: '' },
  strength:                        { type: 'string',  required: false, default: '' },
  concentration:                   { type: 'string',  required: false, default: '' },
  concentrationAfterReconstitution:{ type: 'string',  required: false, default: '' },
  activeIngredient:                { type: 'string',  required: false, default: '' },
  dosageForm:                      { type: 'string',  required: false, default: '' },
  presentation:                    { type: 'string',  required: false, default: '' },
  route:                           { type: 'string',  required: false, default: '' },

  // ── Schedule & Duration ───────────────────────────────────────────────────
  frequency:                       { type: 'string',  required: false, default: '' },
  duration:                        { type: 'string',  required: false, default: '' },
  treatmentDays:                   { type: 'number',  required: false, default: 0 },
  totalRequiredQuantity:           { type: 'number',  required: false, default: 0 },

  // ── Vial & Reconstitution ─────────────────────────────────────────────────
  vialsRequired:                   { type: 'number',  required: false, default: 0 },
  reconstitutionRequired:          { type: 'boolean', required: false, default: false },
  reconstitutionVolume:            { type: 'string',  required: false, default: '' },
  shelfLifeAfterReconstitution:    { type: 'string',  required: false, default: '' },

  // ── Storage & Compliance ──────────────────────────────────────────────────
  storageConditions:               { type: 'string',  required: false, default: '' },
  category:                        { type: 'string',  required: false, default: '' },

  // ── Quantity & Pricing ────────────────────────────────────────────────────
  quantity:                        { type: 'number',  required: false, default: 1 },
  price:                           { type: 'number',  required: false, default: 0 },
  calculatedWaste:                 { type: 'number',  required: false, default: 0 },

  // ── Instructions ─────────────────────────────────────────────────────────
  instructions:                    { type: 'string',  required: false, default: '' },
  patientInstructions:             { type: 'string',  required: false, default: '' },
  doctorNotes:                     { type: 'string',  required: false, default: '' },
  notes:                           { type: 'string',  required: false, default: '' },
  phase:                           { type: 'string',  required: false, default: '' },

  // ── Status (CANONICAL: lowercase) ────────────────────────────────────────
  status: {
    type: 'enum',
    required: false,
    default: 'pending',
    values: VALID_PRESCRIPTION_LINE_STATUSES,
    note: 'ALWAYS lowercase: pending | approved | rejected. Never Pending/Approved/Rejected.',
  },
});

// ── Root Prescription Field Contract ─────────────────────────────────────────

/**
 * Contrato explícito de campos para `prescriptions/{prescriptionId}`.
 */
export const PRESCRIPTION_FIELD_CONTRACT = Object.freeze({
  // ── Identity ──────────────────────────────────────────────────────────────
  prescriptionId: { type: 'string',  required: false, default: '' },

  // ── Actors ────────────────────────────────────────────────────────────────
  patientId:      { type: 'string',  required: false, default: '' },
  doctorId:       { type: 'string',  required: false, default: '' },
  clinicId:       { type: 'string',  required: false, default: '' },
  prescribedBy:   { type: 'string',  required: false, default: '' },
  reviewedBy:     { type: 'string',  required: false, default: '' },

  // ── Source ────────────────────────────────────────────────────────────────
  sourceType:         { type: 'string', required: false, default: '' },  // from PRESCRIPTION_SOURCES
  sourceFileId:       { type: 'string', required: false, default: null },
  sourceReportType:   { type: 'string', required: false, default: null },
  sourceProtocolId:   { type: 'string', required: false, default: null }, // if from Protocol
  sourceProtocolName: { type: 'string', required: false, default: null },
  sourceProtocolSlug: { type: 'string', required: false, default: null },
  importSource:       { type: 'string', required: false, default: null },

  // ── Session & Program ─────────────────────────────────────────────────────
  sessionId:        { type: 'string', required: false, default: null },
  treatmentProgram: { type: 'string', required: false, default: null },
  treatmentType:    { type: 'string', required: false, default: null },

  // ── Status (CANONICAL: lowercase) ─────────────────────────────────────────
  status: {
    type: 'enum',
    required: true,
    default: 'draft',
    values: VALID_PRESCRIPTION_STATUSES,
    note: 'ALWAYS lowercase per Rule #28.',
  },

  // ── Content ───────────────────────────────────────────────────────────────
  clinicalIndication: { type: 'string',   required: false, default: '' },
  treatmentGoal:      { type: 'string',   required: false, default: '' },
  notes:              { type: 'string',   required: false, default: '' },

  // ── Line Items ────────────────────────────────────────────────────────────
  prescriptionLines: {
    type: 'object[]',
    required: false,
    default: [],
    note: 'Array of PRESCRIPTION_LINE_CONTRACT objects. productId required in each.',
  },

  // ── Supporting Data ───────────────────────────────────────────────────────
  safetyWarnings:     { type: 'string[]', required: false, default: [] },
  AIRecommendations:  { type: 'object',   required: false, default: null },
  auditTrail:         { type: 'object[]', required: false, default: [] },

  // ── Document Status ───────────────────────────────────────────────────────
  validationStatus:   { type: 'string',   required: false, default: 'ready' }, // ready | needs_review | blocked
  quotationStatus:    { type: 'string',   required: false, default: 'pending' },
  orderStatus:        { type: 'string',   required: false, default: 'pending' },
  signedDocumentUrl:  { type: 'string',   required: false, default: null },

  // ── Schema versioning ─────────────────────────────────────────────────────
  _schemaVersion: { type: 'number', required: false, auto: true, default: PRESCRIPTION_SCHEMA_VER },

  // ── Timestamps ────────────────────────────────────────────────────────────
  createdAt: { type: 'timestamp', required: false, auto: true },
  updatedAt: { type: 'timestamp', required: false, auto: true },
});

// ── Known & Deprecated Fields ─────────────────────────────────────────────────

export const KNOWN_PRESCRIPTION_FIELDS = Object.freeze(
  Object.keys(PRESCRIPTION_FIELD_CONTRACT)
);

export const KNOWN_PRESCRIPTION_LINE_FIELDS = Object.freeze(
  Object.keys(PRESCRIPTION_LINE_CONTRACT)
);

/**
 * Legacy fields deprecated in schema v2.
 */
export const DEPRECATED_PRESCRIPTION_FIELDS = Object.freeze([
  'items',          // → prescriptionLines
  'medications',    // → prescriptionLines
  'drugs',          // → prescriptionLines
  'uploadedAt',     // → createdAt
  'Ready',          // → validationStatus: 'ready' (wrong case)
  'Needs Review',   // → validationStatus: 'needs_review'
  'Blocked',        // → validationStatus: 'blocked'
]);

// ── Legacy template objects (backwards compatibility) ─────────────────────────
export const prescriptionLineSchema = Object.freeze(
  Object.fromEntries(
    Object.entries(PRESCRIPTION_LINE_CONTRACT).map(([k, v]) => [k, v.default ?? ''])
  )
);

export const prescriptionSchema = Object.freeze(
  Object.fromEntries(
    Object.entries(PRESCRIPTION_FIELD_CONTRACT).map(([k, v]) => [k, v.default ?? ''])
  )
);


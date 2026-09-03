/**
 * firestorePatientSchema.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Firestore Patient Schema — v1
 *
 * SINGLE SOURCE OF TRUTH para el modelo de datos de `users/{uid}` con role=patient.
 *
 * Define:
 *   - PATIENT_SCHEMA_VER         → versión del schema
 *   - VALID_PATIENT_STATUSES     → valores de status canónicos (Rule #28)
 *   - PATIENT_FIELD_CONTRACT     → contrato explícito de campos
 *   - KNOWN_PATIENT_FIELDS       → set válido para stripping
 *   - DEPRECATED_PATIENT_FIELDS  → campos legacy a eliminar
 *
 * REGLAS:
 *   - Zero UI imports (sin React, sin CSS).
 *   - Zero Firebase imports.
 *   - Pure JS — seguro para Node scripts, Cloud Functions y browser.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Schema version ────────────────────────────────────────────────────────────
export const PATIENT_SCHEMA_VER = 1;

// ── Allowed enum values (AGENTS.md Rule #28) ──────────────────────────────────

/**
 * Canonical patient statuses. ALWAYS lowercase.
 * Docs: unverified → active → suspended → archived
 * @readonly
 */
export const VALID_PATIENT_STATUSES = Object.freeze([
  'unverified',  // Just registered, email not confirmed
  'active',      // Verified and active patient
  'suspended',   // Temporarily blocked (non-payment, compliance)
  'archived',    // Soft-deleted / inactive
]);

/**
 * Canonical patient roles (for users collection).
 * @readonly
 */
export const VALID_PATIENT_ROLES = Object.freeze([
  'patient',
  'doctor',
  'admin',
  'supplier',
  'wholesaler',
  'clinic',
]);

// ── Field Contract ────────────────────────────────────────────────────────────

/**
 * Explicit field contract for `users/{uid}` where role === 'patient'.
 *
 * 'required: true'  → field MUST exist on every CREATE.
 * 'auto: true'      → system-managed (not user input).
 * 'pii: true'       → Personally Identifiable Information — extra care needed.
 */
export const PATIENT_FIELD_CONTRACT = Object.freeze({
  // ── Identity ─────────────────────────────────────────────────────────────
  role:             { type: 'literal',   required: true,  default: 'patient' },
  status:           { type: 'enum',      required: true,  default: 'unverified', values: VALID_PATIENT_STATUSES },

  // ── Personal Data (PII) ───────────────────────────────────────────────────
  firstName:        { type: 'string',    required: false, default: '',   pii: true },
  lastName:         { type: 'string',    required: false, default: '',   pii: true },
  name:             { type: 'string',    required: false, default: '',   pii: true, note: 'Computed: firstName + lastName. Do not write directly.' },
  email:            { type: 'string',    required: false, default: '',   pii: true },
  phone:            { type: 'string',    required: false, default: '',   pii: true },
  dateOfBirth:      { type: 'string',    required: false, default: null, pii: true }, // ISO 8601 date string
  gender:           { type: 'string',    required: false, default: null, pii: true },
  country:          { type: 'string',    required: false, default: '' },
  avatarUrl:        { type: 'string',    required: false, default: '' },

  // ── Relational IDs ────────────────────────────────────────────────────────
  linkedUserId:     { type: 'string',    required: false, default: null }, // Firebase Auth UID
  doctorIds:        { type: 'string[]',  required: false, default: [] },
  clinicIds:        { type: 'string[]',  required: false, default: [] },
  supplierIds:      { type: 'string[]',  required: false, default: [], auto: true },
  assignedManagerId:{ type: 'string',   required: false, default: null },

  // ── Clinical / Program ────────────────────────────────────────────────────
  program:          { type: 'string',    required: false, default: null },
  tags:             { type: 'string[]',  required: false, default: [] },
  notes:            { type: 'string',    required: false, default: '' },
  externalRef:      { type: 'string',    required: false, default: null }, // CRM or ERP external ID

  // ── CRM Metrics (auto-maintained) ─────────────────────────────────────────
  prescriptionCount:{ type: 'number',    required: false, default: 0,    auto: true },
  totalOrders:      { type: 'number',    required: false, default: 0,    auto: true },
  totalPrescriptions:{ type:'number',    required: false, default: 0,    auto: true },
  ltv:              { type: 'number',    required: false, default: 0,    auto: true }, // Lifetime value in USD
  revenue:          { type: 'number',    required: false, default: 0,    auto: true },
  lastOrderStatus:  { type: 'string',    required: false, default: null, auto: true },
  lastActivity:     { type: 'timestamp', required: false, default: null, auto: true },
  riskScore:        { type: 'string',    required: false, default: null },

  // ── Schema versioning ─────────────────────────────────────────────────────
  _schemaVersion:   { type: 'number',    required: false, auto: true, default: PATIENT_SCHEMA_VER },

  // ── Timestamps ────────────────────────────────────────────────────────────
  createdAt:        { type: 'timestamp', required: false, auto: true },
  updatedAt:        { type: 'timestamp', required: false, auto: true },
});

// ── Known & Deprecated Fields ─────────────────────────────────────────────────

export const KNOWN_PATIENT_FIELDS = Object.freeze(
  Object.keys(PATIENT_FIELD_CONTRACT)
);

/**
 * Legacy fields that existed in early versions.
 * WriteGuard will strip these with a deprecation warning.
 */
export const DEPRECATED_PATIENT_FIELDS = Object.freeze([
  'clinic',           // → clinicIds[]
  'clinicId',         // → clinicIds[]
  'physician',        // → doctorIds[]
  'physicianId',      // → doctorIds[]
  'doctorId',         // → doctorIds[]
  'fullName',         // → firstName + lastName
  'displayName',      // → name (computed)
  'Active',           // → status: 'active'  (wrong case from legacy UI)
  'Inactive',         // → status: 'archived'
  'New',              // → status: 'unverified'
  'Archived',         // → status: 'archived'
]);

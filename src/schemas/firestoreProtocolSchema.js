/**
 * firestoreProtocolSchema.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Firestore Protocol Schema — v1
 *
 * SINGLE SOURCE OF TRUTH para el modelo de datos de la colección `protocols`.
 *
 * Define:
 *   - VALID_PROTOCOL_STATUSES   → valores de status permitidos
 *   - PROTOCOL_FIELD_CONTRACT   → contrato explícito de campos
 *   - DEPRECATED_PROTOCOL_FIELDS → campos legacy que deben ser migrados
 *   - KNOWN_PROTOCOL_FIELDS     → set de campos válidos para stripping
 *
 * REGLAS:
 *   - Zero UI imports (sin React, sin CSS).
 *   - Zero Firebase imports.
 *   - Pure JS — seguro para Node scripts, Cloud Functions y browser.
 *   - Este archivo describe lo que DEBE estar en Firestore.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Schema version ────────────────────────────────────────────────────────────
export const PROTOCOL_SCHEMA_VER = 1;

// ── Allowed enum values (AGENTS.md Rule #28) ──────────────────────────────────

/**
 * Estados canónicos de protocolo.
 * NUNCA uses valores fuera de esta lista.
 */
export const VALID_PROTOCOL_STATUSES = Object.freeze([
  'draft',
  'active',
  'paused',
  'archived',
]);

// ── Field Contract ────────────────────────────────────────────────────────────

/**
 * Contrato explícito de campos para `protocols/{protocolId}`.
 *
 * CAMPO CANÓNICO DE NOMBRE: `name`
 *   Los campos legacy (protocol_name, title, protocol_title, displayName,
 *   canonicalName) han sido ELIMINADOS del esquema. Si llega un documento
 *   con esos campos, el write guard los bloqueará con un error.
 *
 * 'required: true'  → el campo DEBE existir en cada CREATE.
 * 'auto: true'      → el sistema gestiona el campo (no es input de usuario).
 */
export const PROTOCOL_FIELD_CONTRACT = Object.freeze({
  // ── Identity — CAMPO CANÓNICO ÚNICO DE NOMBRE ────────────────────────────
  name:             { type: 'string',    required: true,  default: '' },
  //   ↑ ÚNICA clave de nombre permitida. Nunca escribir protocol_name,
  //     title, protocol_title, displayName ni canonicalName.

  // ── Identification & routing ─────────────────────────────────────────────
  protocol_id:      { type: 'string',    required: false, default: '' },
  protocol_slug:    { type: 'string',    required: false, default: '' },

  // ── Classification (Aligned with Products) ────────────────────────────────
  status:                { type: 'enum',     required: false, default: 'draft', values: VALID_PROTOCOL_STATUSES },
  categoryId:            { type: 'string',   required: false, default: '' }, // Align with VALID_CATEGORIES
  goals:                 { type: 'string[]', required: false, default: [] },
  tags:                  { type: 'string[]', required: false, default: [] },
  target_audience:       { type: 'string',   required: false, default: '' },
  evidence_level:        { type: 'string',   required: false, default: '' },

  // ── Clinical content ─────────────────────────────────────────────────────
  description:           { type: 'string',   required: false, default: '' },
  clinical_rationale:    { type: 'string',   required: false, default: '' },
  overview_summary:      { type: 'string',   required: false, default: '' },
  expected_outcomes:     { type: 'string[]', required: false, default: [] },
  contraindications:     { type: 'string[]', required: false, default: [] },

  // ── Structure & Bill of Materials (BOM) ──────────────────────────────────
  bom:                   { type: 'object[]', required: false, default: [] }, // Array of { productId, variantId, quantity }
  phases:                { type: 'object[]', required: false, default: [] },
  peptides:              { type: 'string[]', required: false, default: [] }, // Legacy string-based list, use bom instead
  duration_weeks:        { type: 'number',   required: false, default: null },

  // ── Monitoring ───────────────────────────────────────────────────────────
  required_labs:         { type: 'string[]', required: false, default: [] },
  monitoring_cadence:    { type: 'string',   required: false, default: '' },
  check_in_weeks:        { type: 'number',   required: false, default: null },
  monitoring:            { type: 'object',   required: false, default: null },

  // ── Authorship ───────────────────────────────────────────────────────────
  author:                { type: 'object',   required: false, default: null },

  // ── Metadata (sub-object, flexible) ─────────────────────────────────────
  metadata:              { type: 'object',   required: false, default: null },
  executiveSummary:      { type: 'object',   required: false, default: null },

  // ── AI content ───────────────────────────────────────────────────────────
  aiContent:             { type: 'object',   required: false, default: null },

  // ── Schema versioning ────────────────────────────────────────────────────
  _schemaVersion:   { type: 'number',    required: false, auto: true, default: PROTOCOL_SCHEMA_VER },

  // ── Timestamps ───────────────────────────────────────────────────────────
  createdAt:        { type: 'timestamp', required: false, auto: true },
  updatedAt:        { type: 'timestamp', required: false, auto: true },
});

// ── Known field names (for stripping / detection) ─────────────────────────────

export const KNOWN_PROTOCOL_FIELDS = Object.freeze(
  Object.keys(PROTOCOL_FIELD_CONTRACT)
);

/**
 * Campos legacy PROHIBIDOS en escrituras nuevas.
 * Si se detectan, el write guard lanza un error o advierte según el modo.
 *
 * Todos estos campos han sido unificados en `name`.
 */
export const DEPRECATED_PROTOCOL_NAME_FIELDS = Object.freeze([
  'protocol_name',  // → name
  'title',          // → name
  'protocol_title', // → name
  'displayName',    // → name
  'canonicalName',  // → name
]);

/**
 * Campos legacy conocidos (no de nombre) que pueden existir en Firestore
 * pero que NO deben escribirse en documentos nuevos.
 */
export const DEPRECATED_PROTOCOL_FIELDS = Object.freeze([
  ...DEPRECATED_PROTOCOL_NAME_FIELDS,
  'goal',                 // → goals
  'primary_goal',         // → goals
  'category',             // → categoryId
  'therapeutic_category', // → categoryId
  'summary',              // → overview_summary o description
  'overview',             // → overview_summary
  'protocolName',         // → name (camelCase variant)
]);

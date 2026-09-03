/**
 * utils/clinicalSanitizer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Clinical Text Sanitizer — Atlas Clinical Platform
 *
 * Guards free-text clinical fields (doctor notes, dosage instructions,
 * medical history, biomarker annotations) against Stored XSS attacks
 * before persistence in Firestore.
 *
 * OWASP Healthcare Top 10 (A7 - XSS), NIST SP 800-111.
 * Preserves legitimate clinical formatting:
 *   - Line breaks (\n, \r\n)
 *   - Units: mg/kg, mcg/mL, IU/mL, µg
 *   - Numeric ranges: 0.5–1.5, 50-100
 *   - Common medical abbreviations: BID, TID, QD, PRN, SQ, IM, IV
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** HTML entities to escape. */
const HTML_ENTITY_MAP = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
});

/** Regex matching all characters that should be HTML-entity-escaped. */
const HTML_ESCAPE_RE = /[&<>"'`=/]/g;

/**
 * Escapes a single character to its HTML entity equivalent.
 * @param {string} char
 * @returns {string}
 */
function escapeChar(char) {
  return HTML_ENTITY_MAP[char] || char;
}

/**
 * Core sanitizer: strips HTML tags, JS protocol URLs, and event handlers,
 * then escapes all remaining HTML-significant characters.
 * Preserves line breaks and plain-text medical content.
 * @param {string} input
 * @returns {string}
 */
function stripHtml(input) {
  if (typeof input !== 'string') return input;

  return input
    // Remove script blocks entirely
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    // Remove style blocks
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    // Remove all remaining HTML tags (open, close, self-close)
    .replace(/<[^>]+>/g, '')
    // Remove javascript: and data: protocol references
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '')
    // Remove on* event handlers (e.g., onerror=, onclick=)
    .replace(/\bon\w+\s*=\s*(['"])[^'"]*\1/gi, '')
    // Normalize multiple blank lines (keep at most 2 consecutive)
    .replace(/\n{3,}/g, '\n\n')
    // Escape remaining HTML-significant characters
    .replace(HTML_ESCAPE_RE, escapeChar)
    .trim();
}

/**
 * Sanitizes a single clinical text field.
 * Returns the sanitized string or `null` if input was null/undefined.
 * @param {string|null|undefined} value
 * @param {string} [fieldName] - For logging context
 * @returns {string|null}
 */
export function sanitizeField(value, fieldName = 'field') {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'string') return value;

  const original = value;
  const sanitized = stripHtml(value);

  if (sanitized !== original) {
    // Lazy import to avoid circular dependency in tests
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { logger } = require('./logger');
      logger.warn('[ClinicalSanitizer] Potentially unsafe content stripped', {
        fieldName,
        originalLength: original.length,
        sanitizedLength: sanitized.length,
      });
    } catch {
      // logger not available in all environments (e.g., pure unit tests)
    }
  }

  return sanitized;
}

/**
 * Sanitizes all string fields in a clinical entity object.
 * Non-string values (numbers, booleans, arrays, nested objects) are
 * NOT recursively sanitized — only the top-level string fields.
 * @param {Record<string, unknown>} entity
 * @param {string[]} [fieldsToSanitize] - If provided, only sanitizes these keys.
 * @returns {Record<string, unknown>} - New object with sanitized fields.
 */
export function sanitizeEntity(entity, fieldsToSanitize = null) {
  if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
    return entity;
  }

  const result = { ...entity };
  const keys = fieldsToSanitize ?? Object.keys(result);

  for (const key of keys) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeField(result[key], key);
    }
  }

  return result;
}

/**
 * Clinical-specific field whitelist — fields known to carry free-text risk.
 * Use this to target the sanitizer precisely on high-risk fields only.
 */
export const CLINICAL_FREE_TEXT_FIELDS = Object.freeze([
  'notes',
  'instructions',
  'posology',
  'observations',
  'diagnosis',
  'clinicalHistory',
  'allergyNotes',
  'contraindications',
  'sideEffects',
  'description',
  'specialInstructions',
  'pharmacistNotes',
  'doctorNotes',
  'patientNotes',
  'reasonForVisit',
  'treatmentPlan',
  'progressNote',
  'referralNote',
  'labNotes',
  'biomarkerAnnotation',
]);

/**
 * Sanitizes only the high-risk clinical free-text fields of an entity.
 * @param {Record<string, unknown>} entity
 * @returns {Record<string, unknown>}
 */
export function sanitizeClinicalEntity(entity) {
  return sanitizeEntity(entity, CLINICAL_FREE_TEXT_FIELDS);
}

const clinicalSanitizer = {
  sanitizeField,
  sanitizeEntity,
  sanitizeClinicalEntity,
  CLINICAL_FREE_TEXT_FIELDS,
};

export default clinicalSanitizer;

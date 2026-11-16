/**
 * labelContract.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single Source of Truth for normalizing prescription label arrays and
 * resolving label display titles across read/write layers and UI consumers.
 */

/**
 * Normalizes a `pharmacyLabels` / `labels` array so it is guaranteed to contain
 * only valid non-null plain objects (preventing sparse Firestore arrays / null entries).
 *
 * @param {Array} rawLabels
 * @returns {Array<Object>}
 */
export function normalizeLabelsArray(rawLabels) {
  if (!Array.isArray(rawLabels)) return [];
  return rawLabels.filter((item) => item !== null && item !== undefined && typeof item === 'object');
}

/**
 * Resolves the canonical human-readable display title for a label part.
 * Replaces duplicated `lbl.productTitle || lbl.productName || ...` across UI modules.
 *
 * @param {Object|null|undefined} lbl
 * @param {number} [idx=0]
 * @param {string} [fallback='']
 * @returns {string}
 */
export function getLabelDisplayTitle(lbl, idx = 0, fallback = '') {
  if (!lbl || typeof lbl !== 'object') {
    return fallback || `Part ${idx + 1}`;
  }
  return (
    lbl.productTitle ||
    lbl.productName ||
    lbl.title ||
    (lbl.formula ? String(lbl.formula).slice(0, 24) : '') ||
    fallback ||
    `Part ${idx + 1}`
  );
}

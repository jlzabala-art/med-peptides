/**
 * firestoreModelGuard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical write-guard normalizers for Firestore collections (AGENTS.md Rule #28).
 * Shared by API write endpoints (/api/labels/import, /api/labels/save) and
 * database maintenance scripts (scripts/homogenizeFirestoreModel.mjs).
 */

export const RX_VALID_STATUSES = new Set([
  'draft',
  'pending',
  'approved',
  'processing',
  'en tránsito',
  'completed',
  'cancelled',
]);

export const CANONICAL_DISPENSING_FORMS = new Set([
  'nasal_spray',
  'prefilled_pen',
  'multi_part_kit',
  'transdermal_cream',
  'topical_shampoo',
  'topical_foam',
  'topical_oil',
  'topical_solution',
  'topical_ointment',
  'injectable_vial',
  'oral_capsules',
  'pellet_implant',
  'compounded_formulation',
]);

/**
 * Normalizes a prescription status string to the AGENTS.md Rule #28 taxonomy.
 * @param {string} raw
 * @returns {'draft'|'pending'|'approved'|'processing'|'en tránsito'|'completed'|'cancelled'}
 */
export function normalizeRxStatus(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s) return 'draft';
  if (s === 'active') return 'approved';
  if (s === 'proposal_pending') return 'pending';
  if (s === 'ordered') return 'processing';
  if (RX_VALID_STATUSES.has(s)) return s;
  return 'draft';
}

export function normalizeDoctorStatus(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s || s === 'active') return 'approved';
  return s;
}

export function normalizePatientStatus(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s) return 'active';
  return s;
}

export function normalizeProductStatus(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s || s === 'active') return 'published';
  return s;
}

/**
 * Resolves a canonical `dispensingForm` key from prescription metadata and items.
 * @param {Record<string, any>} data
 * @returns {string}
 */
export function resolveCanonicalDispensingForm(data = {}) {
  const raw = String(data.dispensingForm || '').trim().toLowerCase();
  const items = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.medications)
      ? data.medications
      : Array.isArray(data.products)
        ? data.products
        : [];
  const sig = `${raw} ${data.treatmentTitle || ''} ${data.title || ''} ${data.productTitle || ''} ${items
    .map((i) => `${i?.productTitle || ''} ${i?.productName || ''} ${i?.name || ''} ${i?.dosageForm || ''}`)
    .join(' ')}`.toLowerCase();

  if (/\b(nasal\s*spray|intranasal|nasal)\b/.test(sig) && !/\btrichosol\b/.test(sig)) return 'nasal_spray';
  if (raw === 'prefilled_pen' || /\b(pre-?filled\s*pen|subq\s*pen|pluma\s*precargada|multi-dose\s*pen)\b/.test(sig)) return 'prefilled_pen';
  if (items.length > 1 || /\b(4-part|3-part|multi-part|regimen|kit)\b/.test(raw)) return 'multi_part_kit';
  if (/\b(pentravan|transdermal|t-cream|liposomal cream|bioidentical)\b/.test(sig)) return 'transdermal_cream';
  if (/\b(trichowash|shampoo)\b/.test(sig)) return 'topical_shampoo';
  if (/\b(trichofoam|foam)\b/.test(sig)) return 'topical_foam';
  if (/\b(trichooil|scalp oil|oil)\b/.test(sig)) return 'topical_oil';
  if (/\b(trichosol|topical solution|lotion|dropper)\b/.test(sig)) return 'topical_solution';
  if (/\b(ointment|pomade|diltiazem)\b/.test(sig)) return 'topical_ointment';
  if (/\b(vial|lyophilized|liofilizado|subq|subcutaneous|bacteriostatic)\b/.test(sig)) return 'injectable_vial';
  if (/\b(capsule|capsules|caps|hpmc|hygrocaps|oral|tablet|tablets)\b/.test(sig)) return 'oral_capsules';
  if (/\b(pellet|pellets)\b/.test(sig)) return 'pellet_implant';
  return 'compounded_formulation';
}

function formatIsoDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Enforces canonical status, dispensingForm, and approved batch/date defaults
 * on any prescription write payload before it is persisted to Firestore.
 * Does NOT alter clinical Delivery fields (`productTitle`, `dose`, `instructions`).
 *
 * @param {Record<string, any>} payload
 * @param {Record<string, any>} [existingData]
 * @returns {Record<string, any>}
 */
export function normalizePrescriptionWritePayload(payload = {}, existingData = {}) {
  const merged = { ...existingData, ...payload };
  const next = { ...payload };

  const normalizedStatus = normalizeRxStatus(merged.status);
  next.status = normalizedStatus;
  if ('state' in payload || 'state' in existingData) {
    next.state = normalizedStatus;
  }

  const canonicalForm = resolveCanonicalDispensingForm(merged);
  if (merged.dispensingForm && merged.dispensingForm !== canonicalForm && !merged.legacyDispensingForm) {
    next.legacyDispensingForm = merged.dispensingForm;
  }
  next.dispensingForm = canonicalForm;

  if (normalizedStatus === 'approved') {
    const existingBatch = merged.batchCode || merged.dispensingBatch;
    if (!existingBatch) {
      const year = new Date().getFullYear();
      const rawCode = String(merged.code || merged.rxCode || merged.fileNumber || merged.id || 'RX')
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase()
        .slice(-6) || 'RX0001';
      const generatedBatch = `PHARM-${year}-${rawCode}`;
      next.batchCode = generatedBatch;
      next.dispensingBatch = generatedBatch;
    }

    const existingProd = merged.prodDate || merged.mfgDate;
    if (!existingProd) {
      const today = formatIsoDate(new Date());
      next.prodDate = today;
      next.mfgDate = today;
    }

    const existingExp = merged.expDate || merged.expiryDate;
    if (!existingExp) {
      const exp = formatIsoDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
      next.expDate = exp;
      next.expiryDate = exp;
    }
  }

  return next;
}

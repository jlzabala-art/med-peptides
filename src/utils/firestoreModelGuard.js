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

export const CANONICAL_PROTOCOL_CATEGORIES = Object.freeze([
  'Recovery & Tissue Repair',
  'Longevity',
  'Cognitive Support',
  'Metabolism & Weight',
  'Hormonal Support',
  'Sexual Health',
  'Immune & Inflammation',
  'Skin & Aesthetics',
]);

export const PROTOCOL_VALID_STATUSES = new Set([
  'draft',
  'active',
  'paused',
  'archived',
]);

export function normalizeProtocolStatus(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s) return 'draft';
  if (s === 'approved' || s === 'published') return 'active';
  if (s === 'inactive') return 'paused';
  if (PROTOCOL_VALID_STATUSES.has(s)) return s;
  return 'draft';
}

export function normalizeProtocolCategory(raw) {
  const s = String(raw || '').trim();
  const low = s.toLowerCase();
  if (!low) return 'Recovery & Tissue Repair';
  if (/sexual|libido/.test(low)) return 'Sexual Health';
  if (/metabol|weight|body\s*composition|energy/.test(low)) return 'Metabolism & Weight';
  if (/hormon|bhrt|testosteron|thyroid/.test(low)) return 'Hormonal Support';
  if (/cognit|neuro|brain|nootrop/.test(low)) return 'Cognitive Support';
  if (/longev|anti-?aging|telomer|mitochond/.test(low)) return 'Longevity';
  if (/immun|inflam/.test(low)) return 'Immune & Inflammation';
  if (/skin|aesthet|hair|tricho|scalp/.test(low)) return 'Skin & Aesthetics';
  if (/recover|repair|regenerat|tissue|healing/.test(low)) return 'Recovery & Tissue Repair';
  if (CANONICAL_PROTOCOL_CATEGORIES.includes(s)) return s;
  return 'Recovery & Tissue Repair';
}

export function normalizeEvidenceLevel(raw) {
  const low = String(raw || '').trim().toLowerCase();
  if (!low) return 'Tier 2 - Clinical Trial / Cohort';
  if (/tier\s*1|established|high|\brct\b/.test(low)) return 'Tier 1 - Established / RCT';
  if (/tier\s*3|emerging|preclinical|low/.test(low)) return 'Tier 3 - Emerging / Preclinical';
  return 'Tier 2 - Clinical Trial / Cohort';
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
export function resolveCanonicalDoctorCountry(payload = {}, existingData = {}) {
  const merged = { ...existingData, ...payload };
  const normalize = (raw = '') => {
    const s = String(raw || '').trim().toLowerCase();
    if (!s) return '';
    if (['uae', 'ae', 'united arab emirates', 'dubai', 'abu dhabi'].includes(s)) return 'UAE';
    if (['ksa', 'sa', 'saudi', 'saudi arabia', 'riyadh', 'jeddah'].includes(s)) return 'Saudi Arabia';
    if (['qatar', 'qa', 'doha'].includes(s)) return 'Qatar';
    if (['kuwait', 'kw'].includes(s)) return 'Kuwait';
    if (['bahrain', 'bh'].includes(s)) return 'Bahrain';
    if (['oman', 'om'].includes(s)) return 'Oman';
    if (['spain', 'españa', 'espana', 'es', 'madrid', 'barcelona'].includes(s)) return 'Spain';
    if (['uk', 'gb', 'united kingdom', 'england', 'london'].includes(s)) return 'UK';
    if (['usa', 'us', 'united states'].includes(s)) return 'USA';
    return String(raw).trim();
  };

  const fromField = normalize(
    merged.doctorCountry ||
    merged.clinicCountry ||
    merged.doctor?.country ||
    merged.country
  );
  if (fromField) return fromField;

  const phone = String(merged.doctorPhone || merged.clinicPhone || merged.patientPhone || merged.phone || '').replace(/[^\d+]/g, '');
  if (phone.startsWith('+971') || phone.startsWith('00971')) return 'UAE';
  if (phone.startsWith('+966') || phone.startsWith('00966')) return 'Saudi Arabia';
  if (phone.startsWith('+974') || phone.startsWith('00974')) return 'Qatar';
  if (phone.startsWith('+965') || phone.startsWith('00965')) return 'Kuwait';
  if (phone.startsWith('+973') || phone.startsWith('00973')) return 'Bahrain';
  if (phone.startsWith('+968') || phone.startsWith('00968')) return 'Oman';
  if (phone.startsWith('+34') || phone.startsWith('0034')) return 'Spain';
  if (phone.startsWith('+44') || phone.startsWith('0044')) return 'UK';
  if (phone.startsWith('+1')) return 'USA';

  const codeStr = String(merged.code || merged.rxCode || merged.id || '').toLowerCase();
  if (codeStr.includes('ksa')) return 'Saudi Arabia';
  if (codeStr.includes('qat') || codeStr.includes('qatar')) return 'Qatar';

  return 'UAE';
}

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

  // Always guarantee normalized doctorCountry on every Rx write/import
  next.doctorCountry = resolveCanonicalDoctorCountry(payload, existingData);

  // Ensure code is never missing when id/rxCode/fileNumber is available
  if (!merged.code && (merged.rxCode || merged.fileNumber || merged.id)) {
    next.code = String(merged.rxCode || merged.fileNumber || merged.id).replace(/^#/, '').trim();
  }

  // Sanitize aberrant unit quantities (e.g. "7500 mcg/ml" accidentally parsed as qty=7500)
  if (Array.isArray(next.items)) {
    next.items = next.items.map((item) => {
      if (!item || typeof item !== 'object') return item;
      const itemText = `${item.name || item.productName || ''} ${item.presentation || ''} ${item.form || ''}`.toLowerCase();
      const isOralCaps = /\b(caps?|capsules?|c[aá]psulas?|tablet)\b/i.test(itemText);
      const q = Number(item.quantity);
      if (!isOralCaps && Number.isFinite(q) && q > 200) {
        return { ...item, quantity: 1 };
      }
      return item;
    });
  }

  // Ensure durationDays and baseline clinical posology are never empty on import/save
  const itemsForPos = Array.isArray(next.items) ? next.items : (Array.isArray(merged.items) ? merged.items : []);
  const corpus = `${merged.code || ''} ${merged.treatmentTitle || merged.title || ''} ${canonicalForm} ${itemsForPos.map((i) => i?.name || i?.productName || '').join(' ')}`.toLowerCase();

  if (!merged.durationDays && !merged.duration && !merged.refillDays && !merged.treatmentDuration) {
    if (corpus.includes('telotest') || corpus.includes('aatel')) {
      next.durationDays = 100;
    } else if (corpus.includes('trichotest') || corpus.includes('aatri') || corpus.includes('nutrigen') || corpus.includes('acnetest') || merged.source === 'fagron') {
      next.durationDays = 90;
    } else {
      next.durationDays = 30;
    }
  }

  const hasAnyPosology = Boolean(merged.posology || merged.instructions || itemsForPos.some((i) => i?.instructions || i?.posology));
  if (!hasAnyPosology) {
    if (canonicalForm === 'nasal_spray') {
      next.posology = 'Apply 1 spray in each nostril 1-2 times daily. Wipe nozzle after use and store refrigerated (2°C-8°C).';
    } else if (canonicalForm === 'prefilled_pen') {
      next.posology = 'Attach a fresh sterile needle, dial prescribed dose, inject subcutaneously into abdomen or thigh, and hold 5-10 seconds. Refrigerate (2°C-8°C).';
    } else if (canonicalForm === 'oral_capsules') {
      next.posology = 'Take 1 oral capsule daily with a full glass of water as directed by your physician. Store in a cool, dry place.';
    } else if (canonicalForm === 'transdermal_cream') {
      next.posology = 'Apply prescribed clicks/pumps to clean, dry inner forearm or thigh and wash hands afterward.';
    } else if (canonicalForm === 'lyophilized_vial') {
      next.posology = 'Reconstitute vial gently with bacteriostatic water (never shake), draw prescribed U-100 units, inject subcutaneously, and refrigerate (2°C-8°C).';
    } else {
      next.posology = 'Administer daily as directed by your prescribing physician. Store as labeled.';
    }
  }

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

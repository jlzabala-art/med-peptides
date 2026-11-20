/**
 * clinicalDomainClassifier.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for classifying the clinical domain of a prescription
 * or formulation so non-hair formulations (hormones, nasal sprays, peptides)
 * never fall back into TrichoSol / TrichoTest or Nutrigenomics templates.
 */

export const CLINICAL_DOMAINS = Object.freeze({
  NASAL_SPRAY: 'nasal_spray',
  HORMONE_BHRT: 'hormone_bhrt',
  TRICHOLOGY: 'trichology',
  PEPTIDE_INJECTABLE: 'peptide_injectable',
  NUTRIGENOMICS: 'nutrigenomics',
  COMPOUNDING_GENERAL: 'compounding_general',
});

/**
 * Resolves the canonical clinical domain for a prescription or formulation object.
 * @param {Object|string} input
 * @returns {'nasal_spray'|'hormone_bhrt'|'trichology'|'peptide_injectable'|'nutrigenomics'|'compounding_general'}
 */
export function resolveClinicalDomain(input = {}) {
  const rx = typeof input === 'string' ? { title: input } : (input || {});
  const itemsText = Array.isArray(rx.items)
    ? rx.items.map((i) => `${i?.name || ''} ${i?.productName || ''} ${i?.dosageForm || ''} ${i?.route || ''}`).join(' ')
    : '';
  const partsText = Array.isArray(rx.parts)
    ? rx.parts.map((p) => `${p?.title || ''} ${p?.treatmentType || ''} ${p?.dispensingForm || ''} ${p?.vehicle || ''}`).join(' ')
    : '';

  const corpus = [
    rx.testType,
    rx.testName,
    rx.code,
    rx.rxCode,
    rx.treatmentType,
    rx.treatmentTitle,
    rx.treatmentProgram,
    rx.title,
    rx.productName,
    rx.medication,
    rx.dispensingForm,
    rx.dosageForm,
    rx.vehicle,
    rx.route,
    rx.posology?.regimen || (typeof rx.posology === 'string' ? rx.posology : ''),
    itemsText,
    partsText,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // 1. Intranasal sprays (e.g. Selank Nasal Spray, Semax Nasal Spray)
  if (/\b(nasal|intranasal|nostril|nasal\s+spray)\b/i.test(corpus) || (/\b(selank|semax)\b/i.test(corpus) && !/\b(subq|vial|inject)\b/i.test(corpus))) {
    return CLINICAL_DOMAINS.NASAL_SPRAY;
  }

  // 2. Explicit Trichology / TrichoTest / Scalp formulations
  if (/\b(aatri|trichotest|trichosol|trichooil|trichowash|trichofoam|minoxidil|finasteride|dutasteride|latanoprost|follicular|scalp|alopecia)\b/i.test(corpus)) {
    return CLINICAL_DOMAINS.TRICHOLOGY;
  }

  // 3. Bioidentical Hormones / BHRT / Pellets / Transdermal Creams (Pentravan, DHEA, Testosterone, Estradiol, Biest)
  if (/\b(bhrt|pentravan|transdermal|pellet|pellets|testosterone|estradiol|estriol|progesterone|biest|triest|dhea|pregnenolone|hormone)\b/i.test(corpus)) {
    return CLINICAL_DOMAINS.HORMONE_BHRT;
  }

  // 4. Nutrigenomics (24Genetics / AANUT)
  if (/\b(aanut|nutrigen|24genetics|mcm6|adora2a)\b/i.test(corpus)) {
    return CLINICAL_DOMAINS.NUTRIGENOMICS;
  }

  // 5. Injectable Peptides / Pens / Vials
  if (/\b(subq|subcutaneous|tirzepatide|semaglutide|retatrutide|cagrilintide|bpc-157|tb-500|ipamorelin|sermorelin|epitalon|mots-c|lyophilized|pre-filled\s+pen|cartridge\s+pen)\b/i.test(corpus)) {
    return CLINICAL_DOMAINS.PEPTIDE_INJECTABLE;
  }

  return CLINICAL_DOMAINS.COMPOUNDING_GENERAL;
}

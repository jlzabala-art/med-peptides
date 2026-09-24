/**
 * src/utils/socialImageResolver.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional OpenGraph & Social Preview Resolver for WhatsApp, Telegram,
 * Twitter/X, LinkedIn, and iMessage.
 *
 * WhatsApp Crawler Requirements:
 * - Image MUST be PNG or JPEG/JPG (SVG is rejected by WhatsApp mobile clients).
 * - Minimum resolution 300x300, optimal 1200x630.
 * - Absolute HTTPS URL required.
 * - Size < 300 KB recommended.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

// Specific high-res product/compound image mappings
const COMPOUND_IMAGE_MAP = {
  // Flagship Peptides
  'nad': '/assets/vials/nadplus.png',
  'nad-plus': '/assets/vials/nadplus.png',
  'nadplus': '/assets/vials/nadplus.png',
  'bpc-157': '/assets/vials/bpc157.png',
  'bpc157': '/assets/vials/bpc157.png',
  'tb-500': '/assets/vials/tb500.png',
  'tb500': '/assets/vials/tb500.png',
  'tirzepatide': '/assets/vials/tirzepatide.png',
  'semaglutide': '/assets/vials/semaglutide.png',
  'retatrutide': '/assets/vials/retatrutide.png',
  'cagrilintide': '/assets/vials/cagrilintide.png',
  'epithalon': '/assets/vials/epithalon.png',
  'aod9604': '/assets/vials/aod9604.png',
  'aod-9604': '/assets/vials/aod9604.png',
  'motsc': '/assets/vials/motsc.png',
  'mots-c': '/assets/vials/motsc.png',
  'kpv': '/assets/vials/kpv.png',
  'ss31': '/assets/vials/ss31.png',
  'ss-31': '/assets/vials/ss31.png',
  'ara290': '/assets/vials/ara290.png',
  'ara-290': '/assets/vials/ara290.png',
  'gw501516': '/assets/vials/gw501516.png',
  'slupp332': '/assets/vials/slupp332.png',
  'slup-p332': '/assets/vials/slupp332.png',
  'cjc-1295': '/assets/vials/generic-vial.png',
  'ipamorelin': '/assets/vials/generic-vial.png',
  'tesamorelin': '/assets/vials/generic-vial.png',
  'ghk-cu': '/assets/vials/generic-vial.png',
  'ghkcu': '/assets/vials/generic-vial.png',

  // Diagnostic Kits & Bloodo tests (High-Res Visual Assets)
  'bloodo-nad-test': '/images/nad_test_results.png',
  'bloodo-nad-level-test': '/images/nad_test_results.png',
  'nad-level-test': '/images/nad_test_results.png',
  'bloodo-testosterone-test': '/images/hormone_balance.png',
  'testosterone-test': '/images/hormone_balance.png',
  'bloodo-cortisol-test': '/images/stress_resilience.png',
  'cortisol-test': '/images/stress_resilience.png',
  'bloodo-hba1c-test': '/images/metabolic_flex.png',
  'hemoglobin-a1c-hba1c-test': '/images/metabolic_flex.png',
  'bloodo-omega-ratio-test': '/images/biomarkers_aging_telomere.png',
  'omega-ratio-test': '/images/biomarkers_aging_telomere.png',
  'bloodo-vitamin-d-test': '/images/vitamin_d.png',
  'vitamin-d-test': '/images/vitamin_d.png',
};

// Delivery format visual fallbacks
const FORMAT_IMAGE_MAP = {
  'prefilled_pen': '/images/clinical/pen_dual_chamber.jpg',
  'single_cartridge_pen': '/images/clinical/pen_single_cartridge.jpg',
  'pen': '/images/clinical/subq_pen.jpg',
  'cartridge': '/images/clinical/cartridge_dual_chamber.jpg',
  'nasal_spray': '/images/clinical/nasal_spray.jpg',
  'spray': '/images/clinical/nasal_spray.jpg',
  'capsules': '/images/clinical/capsules_bottle.jpg',
  'capsule': '/images/clinical/capsules_bottle.jpg',
  'tablet': '/images/clinical/capsules_bottle.jpg',
  'oral': '/images/clinical/capsules_bottle.jpg',
  'raw_powder': '/images/clinical/bulk_api_powder.jpg',
  'bulk_api': '/images/clinical/bulk_api_powder.jpg',
  'topical': '/images/clinical/topical_serum.jpg',
  'kit': '/images/clinical/kit_10_vials.jpg',
  'vial': '/images/clinical/vial_single.jpg',
};

/**
 * Resolves a related, high-quality, absolute image URL for social sharing.
 * Always returns a valid PNG/JPG (never SVG).
 */
export function resolveSocialImage(productOrSlug, format = null) {
  const slug = typeof productOrSlug === 'string' 
    ? productOrSlug.toLowerCase().trim() 
    : String(productOrSlug?.slug || productOrSlug?.id || '').toLowerCase().trim();

  // 1. Direct compound/test slug lookup
  if (COMPOUND_IMAGE_MAP[slug]) {
    return `${BASE_URL}${COMPOUND_IMAGE_MAP[slug]}`;
  }

  // 1b. Check if product object has an explicit valid image
  if (typeof productOrSlug === 'object' && productOrSlug !== null) {
    const rawImg = productOrSlug.imageUrl || productOrSlug.image || productOrSlug.thumbnail || productOrSlug.photoUrl;
    if (rawImg && typeof rawImg === 'string' && !rawImg.endsWith('.svg')) {
      return rawImg.startsWith('http') ? rawImg : `${BASE_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
    }
  }

  // 2. Normalize slug alphanumeric to check vials directory (e.g. "bpc-157" -> "bpc157")
  const cleanKey = slug.replace(/[^a-z0-9]/g, '');
  if (COMPOUND_IMAGE_MAP[cleanKey]) {
    return `${BASE_URL}${COMPOUND_IMAGE_MAP[cleanKey]}`;
  }

  // 3. Keyword matching for known families
  if (slug.includes('nad') && slug.includes('test')) {
    return `${BASE_URL}/images/nad_test_results.png`;
  }
  if (slug.includes('nad')) {
    return `${BASE_URL}/assets/vials/nadplus.png`;
  }
  if (slug.includes('bpc')) {
    return `${BASE_URL}/assets/vials/bpc157.png`;
  }
  if (slug.includes('tb-500') || slug.includes('tb500') || slug.includes('thymosin')) {
    return `${BASE_URL}/assets/vials/tb500.png`;
  }
  if (slug.includes('tirzepatide')) {
    return `${BASE_URL}/assets/vials/tirzepatide.png`;
  }
  if (slug.includes('semaglutide')) {
    return `${BASE_URL}/assets/vials/semaglutide.png`;
  }
  if (slug.includes('retatrutide')) {
    return `${BASE_URL}/assets/vials/retatrutide.png`;
  }
  if (slug.includes('epithalon')) {
    return `${BASE_URL}/assets/vials/epithalon.png`;
  }
  if (slug.includes('bloodo') || slug.includes('diagnostic')) {
    return `${BASE_URL}/images/nad_test_results.png`;
  }

  // 4. Format-specific fallback
  const fmtKey = String(format || productOrSlug?.format || productOrSlug?.presentation || '').toLowerCase();
  for (const [key, path] of Object.entries(FORMAT_IMAGE_MAP)) {
    if (fmtKey.includes(key)) {
      return `${BASE_URL}${path}`;
    }
  }

  // 5. High-quality institutional catalog fallback
  return `${BASE_URL}/og-catalog.png`;
}

/**
 * Generates attractive OpenGraph title and description for WhatsApp / social sharing.
 */
export function resolveSocialContent({ product, variant, code, recipient }) {
  // Prefer clean formatted product name over raw slug strings
  let pName = product?.name || product?.title || product?.canonicalName || variant?.productName || 'Clinical Monograph';
  if (pName.includes('-') && (product?.name || product?.title)) {
    pName = product.name || product.title;
  }
  // Remove markdown or technical artifacts if any
  pName = pName.replace(/^[#*\s]+/, '').trim();

  const isDiagnostic = 
    product?.category === 'diagnostic_test' || 
    product?.category === 'diagnostic_tests' || 
    product?.category === 'genomics_biomarkers' ||
    product?.category === 'tests' ||
    String(product?.id || '').includes('bloodo') || 
    String(product?.slug || '').includes('bloodo') || 
    String(product?.id || '').endsWith('-test') ||
    String(product?.slug || '').endsWith('-test') ||
    String(pName).toLowerCase().includes('test');

  const rawFormat = variant?.format || product?.format || product?.presentation || '';
  const dose = variant?.dose || product?.dose || product?.dosage || '';
  // Never label a blood test kit as a "Vial" even if URL has presentation=Vial
  const format = isDiagnostic ? 'CE-IVDR Capillary DBS Kit' : rawFormat;

  // ── 1. ATTRACTIVE TITLE ──
  let title = '';
  if (isDiagnostic) {
    const slugLower = String(product?.slug || product?.id || '').toLowerCase();
    const nameLower = String(pName).toLowerCase();
    if (slugLower.includes('testosterone') || slugLower.includes('testosterona') || nameLower.includes('testosterone') || nameLower.includes('testosterona')) {
      title = `⚡ Bloodo™ Testosterona+ Test (Total & Libre) | CE-IVDR Kit`;
    } else if (slugLower.includes('cortisol') || nameLower.includes('cortisol')) {
      title = `⏱️ Bloodo™ Cortisol Ritmo Circadiano (CAR) | CE-IVDR Kit`;
    } else if (slugLower.includes('nad') || nameLower.includes('nad')) {
      title = `🔬 Bloodo™ Test de Nivel NAD+ Celular | CE-IVDR Kit`;
    } else if (slugLower.includes('hba1c') || slugLower.includes('hemoglobin') || nameLower.includes('hba1c') || nameLower.includes('hemoglobina')) {
      title = `🩸 Bloodo™ HbA1c Glicación 90 Días | CE-IVDR Kit`;
    } else if (slugLower.includes('omega') || nameLower.includes('omega')) {
      title = `🛡️ Bloodo™ Ratio Omega-3/6 & Índice Omega | CE-IVDR Kit`;
    } else if (slugLower.includes('vitamin-d') || slugLower.includes('vitamina-d') || nameLower.includes('vitamina d') || nameLower.includes('vitamin d')) {
      title = `☀️ Bloodo™ Vitamina D3 [25-OH] Test | CE-IVDR Kit`;
    } else {
      title = `🔬 ${pName} | CE-IVDR Certified Diagnostic Kit`;
    }
  } else {
    const specDetails = [dose, format].filter(Boolean).join(' · ');
    title = specDetails 
      ? `${pName} (${specDetails}) — Clinical Monograph`
      : `${pName} — Clinical Technical Monograph`;
  }

  // Optional recipient personal badge for wholesale/doctor links
  if (recipient?.name && recipient.name !== 'Wholesale Partner' && recipient.name !== 'Healthcare Practitioner') {
    title = `${title} • ${recipient.name}`;
  }

  // ── 2. ATTRACTIVE SUMMARY DESCRIPTION ──
  let description = '';
  if (isDiagnostic) {
    const slugLower = String(product?.slug || product?.id || '').toLowerCase();
    const nameLower = String(pName).toLowerCase();
    if (slugLower.includes('testosterone') || slugLower.includes('testosterona') || nameLower.includes('testosterone') || nameLower.includes('testosterona')) {
      description = 'LC-MS/MS Gold Standard para cuantificar Testosterona Total, Libre, SHBG e Índice FAI por punción capilar DBS. Evalúa tu vitalidad hormonal y eje HPTA con LifeLab1.';
    } else if (slugLower.includes('cortisol') || nameLower.includes('cortisol')) {
      description = 'Curva de Cortisol Diurno y Respuesta al Despertar (CAR) por punción capilar DBS. Mide estrés neuroendocrino, fatiga suprarrenal y calidad de descanso con LifeLab1.';
    } else if (slugLower.includes('nad') || nameLower.includes('nad')) {
      description = 'Test cuantitativo CE-IVDR de NAD⁺ intracelular total y NADH por punción capilar DBS. Analítica centralizada en LifeLab1 (Vilnius) con informe clínico de longevidad.';
    } else if (slugLower.includes('hba1c') || slugLower.includes('hemoglobin') || nameLower.includes('hba1c') || nameLower.includes('hemoglobina')) {
      description = 'Microcromatografía de afinidad para medir Hemoglobina Glicada y Glucosa Media de 90 días por punción capilar DBS. Optimiza tu sensibilidad a la insulina y control metabólico.';
    } else if (slugLower.includes('omega') || nameLower.includes('omega')) {
      description = 'Perfil de ácidos grasos en membrana eritrocitaria por GC-MS. Cuantifica tu Índice Omega-3, ratio inflamatorio AA/EPA y ácidos trans con LifeLab1.';
    } else if (slugLower.includes('vitamin-d') || slugLower.includes('vitamina-d') || nameLower.includes('vitamina d') || nameLower.includes('vitamin d')) {
      description = 'Dilución isotópica LC-MS/MS para cuantificar 25-Hidroxivitamina D3 y D2 total por punción capilar DBS. Clave para inmunidad innata, expresión génica y eje VDR.';
    } else if (product?.description && product.description.length > 30) {
      description = product.description.slice(0, 160);
    } else {
      description = 'Test cuantitativo CE-IVDR por punción capilar Dried Blood Spot (DBS). Análisis centralizado en laboratorio de referencia LifeLab1 con informe clínico digital.';
    }
  } else {
    const purity = product?.purity || '≥ 99.0% (RP-HPLC & ESI-MS)';
    description = `Verified clinical specifications (${purity}), standardized reconstitution parameters, dosing titration schedules, and analytical monograph for medical practitioners.`;
  }

  return { title, description };
}

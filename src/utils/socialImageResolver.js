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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

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

  // Diagnostic Kits & Bloodo tests (Official High-Res Packaging Assets from bloodo.com)
  'bloodo-nad-test': '/images/products/bloodo/nad.jpg',
  'bloodo-nad-level-test': '/images/products/bloodo/nad.jpg',
  'nad-level-test': '/images/products/bloodo/nad.jpg',
  'bloodo-testosterone-test': '/images/products/bloodo/testosterone.jpg',
  'testosterone-test': '/images/products/bloodo/testosterone.jpg',
  'bloodo-cortisol-test': '/images/products/bloodo/cortisol.jpg',
  'cortisol-test': '/images/products/bloodo/cortisol.jpg',
  'bloodo-hba1c-test': '/images/products/bloodo/hba1c.jpg',
  'hemoglobin-a1c-hba1c-test': '/images/products/bloodo/hba1c.jpg',
  'bloodo-omega-ratio-test': '/images/products/bloodo/omega.jpg',
  'omega-ratio-test': '/images/products/bloodo/omega.jpg',
  'omega-index-test': '/images/products/bloodo/omega-index.jpg',
  'bloodo-vitamin-d-test': '/images/products/bloodo/vitamin-d.jpg',
  'vitamin-d-test': '/images/products/bloodo/vitamin-d.jpg',

  // ETERNA DX Official Genomics & Longevity Packaging Assets
  'eterna-epigenetic-age-test': '/images/products/eterna/eterna-kit-box.png',
  'eterna-longevity-platform': '/images/products/eterna/eterna-kit-box.png',
  'eterna': '/images/products/eterna/eterna-kit-box.png',

  // Colway Official Bioactive Collagen & Dermocosmetics (PNG/JPG High-Res)
  'colway-colvita': '/images/products/colway/colvita.png',
  'colvita': '/images/products/colway/colvita.png',
  'colway-collagen-vege': '/images/products/colway/vege-collagen.png',
  'collagen-vege': '/images/products/colway/vege-collagen.png',
  'colway-strengthening-shampoo': '/images/products/colway/shampoo.png',
  'strengthening-shampoo': '/images/products/colway/shampoo.png',
  'colway-strengthening-conditioner': '/images/products/colway/conditioner.png',
  'strengthening-conditioner': '/images/products/colway/conditioner.png',
  'colway-blue-diamond-cream': '/images/products/colway/blue-diamond-cream.png',
  'blue-diamond-cream': '/images/products/colway/blue-diamond-cream.png',
  'colway-blue-diamond-peeling': '/images/products/colway/blue-diamond-peeling.png',
  'blue-diamond-peeling': '/images/products/colway/blue-diamond-peeling.png',
  'colway-collagen-lip-care': '/images/products/colway/lip-care.png',
  'collagen-lip-care': '/images/products/colway/lip-care.png',
  'colway-collagen-wash-gel': '/images/products/colway/washing-gel.png',
  'collagen-wash-gel': '/images/products/colway/washing-gel.png',
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
    const rawImg = 
      productOrSlug.image_url || 
      productOrSlug.imageUrl || 
      productOrSlug.image || 
      productOrSlug.photo_url || 
      productOrSlug.photoUrl || 
      productOrSlug.thumbnail;
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
 * Differentiates cleanly between:
 * - Colway (Native Collagen & Dermocosmetics)
 * - Bloodo (CE-IVDR Capillary DBS Diagnostic Kits)
 * - Aesthetic Injectables (Dermal Matrices, Fillers, Biostimulators)
 * - Peptides & APIs (Clinical Technical Monographs)
 */
export function resolveSocialContent({ product, variant, code, recipient }) {
  // Prefer clean formatted product name over raw slug strings
  let pName = product?.name || product?.title || product?.canonicalName || variant?.productName || 'Clinical Monograph';
  if (pName.includes('-') && (product?.name || product?.title)) {
    pName = product.name || product.title;
  }
  // Remove markdown or technical artifacts if any
  pName = pName.replace(/^[#*\s]+/, '').trim();

  const brand = String(product?.brand || product?.sourceBrand || product?.supplier || product?.supplierName || '').toLowerCase();
  const cat = String(product?.category || product?.type || '').toLowerCase();
  const slugLower = String(product?.slug || product?.id || '').toLowerCase();
  const nameLower = String(pName).toLowerCase();

  const isColway = 
    brand.includes('colway') || 
    slugLower.includes('colway') || 
    String(product?.collection || '').toLowerCase().includes('colway') || 
    nameLower.includes('colway');

  const isCosmetic = 
    isColway || 
    cat === 'cosmetic' || 
    cat === 'cosmetics' || 
    cat === 'topical' || 
    cat === 'hair cosmetics' || 
    cat === 'cosmeceutical' || 
    cat === 'skin care' || 
    product?.is_cosmetic === true;

  const isBloodo = 
    brand.includes('bloodo') || 
    slugLower.includes('bloodo') || 
    nameLower.includes('bloodo') ||
    (product?.supplierId || '').toLowerCase().includes('bloodo');

  const isTeletest = 
    brand.includes('teletest') || 
    slugLower.includes('teletest') || 
    nameLower.includes('teletest') ||
    (product?.supplierId || '').toLowerCase().includes('teletest') ||
    (product?.supplierName || '').toLowerCase().includes('teletest') ||
    (product?.supplier || '').toLowerCase().includes('teletest');

  const isDiagnostic = 
    isBloodo ||
    isTeletest ||
    cat === 'diagnostic' ||
    cat === 'diagnostic_test' || 
    cat === 'diagnostic_tests' || 
    cat === 'genomics_biomarkers' || 
    cat === 'tests' || 
    slugLower.endsWith('-test') || 
    slugLower.includes('-test-') ||
    nameLower.includes('test kit') ||
    nameLower.includes('blood test') ||
    Boolean(product?.sampleType);

  const isAesthetic = 
    cat === 'aesthetic' || 
    cat === 'aesthetic_injectable' || 
    cat === 'injectable' || 
    product?.is_aesthetic === true || 
    ['juvederm', 'belotero', 'profhilo', 'radiesse', 'ellanse', 'lemon bottle'].some(b => nameLower.includes(b) || slugLower.includes(b));

  const rawFormat = variant?.format || product?.format || product?.presentation || '';
  const rawDose = variant?.dose || product?.dose || product?.dosage || '';
  const rawSize = variant?.size || product?.size || product?.volume || '';

  // ── 1. ATTRACTIVE & ACCURATE TITLE ──
  let title;

  if (isCosmetic) {
    const sizeSpec = rawSize || (rawFormat && !['bottle', 'tube', 'jar', 'vial', 'pump'].includes(rawFormat.toLowerCase()) ? rawFormat : '');
    const cleanBrand = isColway ? 'Colway®' : '';
    if (sizeSpec) {
      title = `${pName} (${sizeSpec}) — ${cleanBrand} Native Collagen & Dermocosmetics`.trim();
    } else {
      title = `${pName} — ${cleanBrand} Native Collagen & Cellular Monograph`.trim();
    }
  } else if (isDiagnostic) {
    if (slugLower.includes('eterna') || nameLower.includes('eterna')) {
      title = `🧬 ETERNA® DNA & Epigenetic Longevity Test (+700K SNPs) | ETERNA DX · Fagron Genomics`;
    } else if (isTeletest) {
      if (slugLower.includes('omega') || nameLower.includes('omega')) {
        title = `🛡️ TeleTest Analytika | Comprehensive Omega Fatty Acid Profile & Cellular Inflammation Index (Test Omega)`;
      } else if (slugLower.includes('htma') || slugLower.includes('mineral') || nameLower.includes('htma') || nameLower.includes('mineral')) {
        title = `🔬 TeleTest Analytika | Hair Tissue Mineral Analysis (HTMA - 33 Elements & Ratios)`;
      } else if (slugLower.includes('hla') || nameLower.includes('hla') || slugLower.includes('celiac') || nameLower.includes('celiac')) {
        title = `🧬 TeleTest Analytika | High-Resolution HLA & Autoimmunity Immunogenetic Screen`;
      } else if (slugLower.includes('detox') || slugLower.includes('metabolizer') || nameLower.includes('metabolizer')) {
        title = `🧬 TeleTest Analytika | Hepatic Biotransformation & Pharmacogenetic Detoxification Panel`;
      } else {
        title = `🔬 TeleTest Analytika | ${pName} — Clinical Diagnostic Monograph`;
      }
    } else if (isBloodo) {
      if (slugLower.includes('testosterone') || slugLower.includes('testosterona') || nameLower.includes('testosterone') || nameLower.includes('testosterona')) {
        title = `⚡ Bloodo™ Testosterone+ Free & Total Test | CE-IVDR Fingerstick Kit`;
      } else if (slugLower.includes('cortisol') || nameLower.includes('cortisol')) {
        title = `⏱️ Bloodo™ Diurnal Cortisol CAR Rhythm Test | CE-IVDR Kit`;
      } else if (slugLower.includes('nad') || nameLower.includes('nad')) {
        title = `🔬 Bloodo™ Intracellular NAD+ Level Test | CE-IVDR Kit`;
      } else if (slugLower.includes('hba1c') || slugLower.includes('hemoglobin') || nameLower.includes('hba1c') || nameLower.includes('hemoglobina')) {
        title = `🩸 Bloodo™ HbA1c 90-Day Glycation Test | CE-IVDR Kit`;
      } else if (slugLower.includes('omega') || nameLower.includes('omega')) {
        title = `🛡️ Bloodo™ Omega-3/6 Ratio & Omega Index Test | CE-IVDR Kit`;
      } else if (slugLower.includes('vitamin-d') || slugLower.includes('vitamina-d') || nameLower.includes('vitamina d') || nameLower.includes('vitamin d')) {
        title = `☀️ Bloodo™ Vitamin D3 [25-OH] Test | CE-IVDR Kit`;
      } else {
        title = `🔬 Bloodo™ ${pName} | CE-IVDR Capillary Blood Test Kit`;
      }
    } else {
      title = `${pName} — Clinical Diagnostic Specimen Dossier | Atlas Health Services`;
    }
  } else if (isAesthetic) {
    const spec = [rawDose, rawSize || rawFormat].filter(Boolean).join(' · ');
    title = spec ? `${pName} (${spec}) — Aesthetic Medicine Monograph` : `${pName} — Clinical Aesthetics Monograph`;
  } else {
    // Standard Peptides / API Compounds
    const specDetails = [rawFormat].filter(Boolean).join(' · ');
    title = specDetails
      ? `${pName} (${specDetails}) — Clinical Monograph`
      : `${pName} — Clinical Technical Monograph`;
  }

  // Optional recipient personal badge for wholesale/doctor links
  if (recipient?.name && recipient.name !== 'Wholesale Partner' && recipient.name !== 'Healthcare Practitioner') {
    title = `${title} • ${recipient.name}`;
  }

  // ── 2. ATTRACTIVE & ACCURATE DESCRIPTION (ENGLISH) ──
  let description;

  if (isCosmetic) {
    if (product?.short_description && product.short_description.length > 25) {
      description = product.short_description;
    } else if (product?.description && product.description.length > 30) {
      description = product.description.slice(0, 165).trim();
      if (!description.endsWith('.')) description += '...';
    } else {
      description = isColway
        ? 'Biologically active native tropocollagen, biomimetic signal peptides, and European-certified dermocosmetic formulations (EU Reg. 1223/2009).'
        : 'High-purity cellular dermocosmetic formula with biofunctional actives compliant with European Cosmetic Regulation 1223/2009.';
    }
  } else if (isDiagnostic) {
    if (slugLower.includes('eterna') || nameLower.includes('eterna')) {
      description = 'High-resolution salivary genomics and epigenetics (+700,000 SNPs). Measures cellular aging velocity, 5 health pillars, and continuous biometric wearable synchronization. ETERNA DX · Fagron Genomics.';
    } else if (isTeletest) {
      if (slugLower.includes('omega') || nameLower.includes('omega')) {
        description = 'Erythrocyte membrane fatty acid lipidomics by Capillary Gas Chromatography (GC-FID). Accurately quantifies HS-Omega-3 Index (>8%), AA/EPA cellular inflammation ratio, and trans fatty acids with clinical nutritional report.';
      } else if (slugLower.includes('htma') || slugLower.includes('mineral') || nameLower.includes('htma') || nameLower.includes('mineral')) {
        description = 'High-resolution ICP-MS/MS hair tissue mineral analysis assessing 33 elements: essential trace minerals, toxic neurotoxic metals (Pb, Hg, Cd, As), and adrenal-metabolic cellular ratios.';
      } else if (slugLower.includes('hla') || nameLower.includes('hla') || slugLower.includes('celiac') || nameLower.includes('celiac')) {
        description = 'High-resolution HLA Class I & II typing evaluating immunogenetic predisposition to Celiac disease (HLA-DQ2/DQ8), Hashimoto thyroiditis, Rheumatoid Arthritis, and systemic autoimmunity.';
      } else if (slugLower.includes('detox') || slugLower.includes('metabolizer') || nameLower.includes('metabolizer')) {
        description = 'Comprehensive 48-SNP pharmacogenetic and hepatic biotransformation panel covering Phase I (CYP450) and Phase II (UGT, GST, MTHFR) to optimize drug dosing and metabolic clearance.';
      } else {
        description = 'Accredited clinical diagnostic test by TeleTest Analytika S.A. (ISO 15189 / CE-IVD accredited central laboratory). Includes verified digital clinical report.';
      }
    } else if (isBloodo) {
      if (slugLower.includes('testosterone') || slugLower.includes('testosterona') || nameLower.includes('testosterone') || nameLower.includes('testosterona')) {
        description = 'Gold-standard LC-MS/MS quantification of Total & Free Testosterone, SHBG, and FAI Index via capillary Dried Blood Spot (DBS). Evaluates androgen axis with LifeLab1.';
      } else if (slugLower.includes('cortisol') || nameLower.includes('cortisol')) {
        description = 'Multi-point diurnal cortisol curve and Awakening Response (CAR) via capillary Dried Blood Spot (DBS). Evaluates neuroendocrine stress and adrenal fatigue with LifeLab1.';
      } else if (slugLower.includes('nad') || nameLower.includes('nad')) {
        description = 'Quantitative CE-IVDR test for intracellular NAD+ total pool and NADH via capillary Dried Blood Spot (DBS). Centralized accredited analysis at LifeLab1.';
      } else if (slugLower.includes('hba1c') || slugLower.includes('hemoglobin') || nameLower.includes('hba1c') || nameLower.includes('hemoglobina')) {
        description = 'Affinity micro-chromatography measuring 90-day Glycated Hemoglobin and mean estimated blood glucose via capillary Dried Blood Spot (DBS).';
      } else if (slugLower.includes('omega') || nameLower.includes('omega')) {
        description = 'Erythrocyte membrane fatty acid lipidomics by GC-MS. Accurately quantifies Omega-3 Index, pro-inflammatory AA/EPA ratio, and trans fatty acids with LifeLab1.';
      } else if (slugLower.includes('vitamin-d') || slugLower.includes('vitamina-d') || nameLower.includes('vitamina d') || nameLower.includes('vitamin d')) {
        description = 'Direct isotope dilution LC-MS/MS for 25-Hydroxyvitamin D3 and D2 total via capillary Dried Blood Spot (DBS) for immune and endocrine health.';
      } else {
        description = 'Quantitative CE-IVDR capillary Dried Blood Spot (DBS) test. Centralized analysis at accredited reference laboratory LifeLab1 with digital clinical report.';
      }
    } else if (product?.description && product.description.length > 30) {
      description = product.description.slice(0, 160);
    } else {
      description = 'Certified clinical diagnostic laboratory testing with standardized specimen collection and official analytical dossier.';
    }
  } else if (isAesthetic) {
    description = product?.description && product.description.length > 30
      ? product.description.slice(0, 160)
      : 'Medical-grade biocompatible dermal matrix, cross-linked hyaluronic acid, and cellular bio-stimulators for aesthetic medicine.';
  } else {
    // Default Research Peptides / APIs
    const purity = product?.purity || '≥ 99.0% (RP-HPLC & ESI-MS)';
    description = `Verified clinical specifications (${purity}), standardized reconstitution parameters, dosing titration schedules, and analytical monograph for medical practitioners.`;
  }

  return { title, description };
}

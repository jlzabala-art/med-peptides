/**
 * Unified Prescription Type Classifier
 * Evaluates prescription metadata, active compounds, vehicles, routes,
 * treatment programs, and pharmacogenomic tests to assign the canonical clinical category:
 *
 * 1. 'trichotest' - Fagron TrichoTest™, hair loss genomics, TrichoSol/TrichoFoam vehicles, topical scalp formulations
 * 2. 'nutrigen'   - Fagron NutriGen™, nutrigenomics, oral chronobiological multi-phase capsule regimens
 * 3. 'hormone'    - BHRT / TRT, bioidentical hormones, Lipoderm/Topi-Pump transdermal creams, troches, endocrine optimization
 * 4. 'peptide'    - Lyophilized SubQ peptides, vials, bioregulators, metabolic agonists (GLP-1/GIP)
 * 5. 'compounding'- General customized magistral formulations
 */

import { detectFagronGenomicsTest } from './fagronGenomicsTests';

export const PRESCRIPTION_TYPES = {
  TRICHOTEST: 'trichotest',
  NUTRIGEN: 'nutrigen',
  HORMONE: 'hormone',
  PEPTIDE: 'peptide',
  COMPOUNDING: 'compounding'
};

export const PRESCRIPTION_TYPE_CONFIG = {
  trichotest: {
    key: 'trichotest',
    brandType: 'trichotest',
    label: 'TrichoTest™',
    sublabel: 'Topical Scalp · Galenic',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff',
    badgeBorder: '#ddd6fe',
    iconName: 'Dna',
    emoji: '🧬',
    description: 'Fagron Genomics TrichoTest™ follicular DNA-guided compounded topical solution'
  },
  nutrigen: {
    key: 'nutrigen',
    brandType: 'nutrigen',
    label: 'NutriGen™',
    sublabel: 'Oral Chrono · 3 Phases',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    badgeBorder: '#a7f3d0',
    iconName: 'Dna',
    emoji: '🧬',
    description: 'Fagron Genomics NutriGen™ nutrigenomic multi-phase oral chronobiological therapy'
  },
  hormone: {
    key: 'hormone',
    brandType: 'hormone',
    label: 'Hormones · BHRT',
    sublabel: 'Endocrine · BHRT / TRT',
    badgeColor: '#ea580c',
    badgeBg: '#fff7ed',
    badgeBorder: '#ffedd5',
    iconName: 'Activity',
    emoji: '⚡',
    description: 'Bioidentical Hormone Replacement Therapy & endocrine optimization protocol'
  },
  peptide: {
    key: 'peptide',
    brandType: 'peptides',
    label: 'Peptide Protocol',
    sublabel: 'Biologics · SubQ / Vials',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    badgeBorder: '#bfdbfe',
    iconName: 'Syringe',
    emoji: '💉',
    description: 'Lyophilized subcutaneous peptides and cellular bioregulators'
  },
  compounding: {
    key: 'compounding',
    brandType: 'prescription',
    label: 'Compounding Rx',
    sublabel: 'Custom Galenic',
    badgeColor: '#475569',
    badgeBg: '#f1f5f9',
    badgeBorder: '#cbd5e1',
    iconName: 'FlaskConical',
    emoji: '💊',
    description: 'Compounded magistral medical prescription'
  }
};

/**
 * Extracts and aggregates all text signatures from a prescription object
 */
function extractSearchableSignature(rx) {
  if (!rx) return '';

  const names = [];
  const addItems = (arr) => {
    if (Array.isArray(arr)) {
      arr.forEach(i => {
        if (!i) return;
        if (i.productName) names.push(i.productName);
        if (i.name) names.push(i.name);
        if (i.title) names.push(i.title);
        if (i.activeIngredient) names.push(i.activeIngredient);
        if (i.category) names.push(i.category);
        if (i.route) names.push(i.route);
        if (i.vehicle) names.push(i.vehicle);
      });
    }
  };

  addItems(rx.prescriptionLines);
  addItems(rx.items);
  addItems(rx.compounds);
  addItems(rx.products);

  if (Array.isArray(rx.formulationBlocks)) {
    rx.formulationBlocks.forEach(b => {
      addItems(b?.items);
      addItems(b?.apis);
      if (b?.vehicle) names.push(b.vehicle);
      if (b?.title) names.push(b.title);
    });
  }

  return [
    rx.title,
    rx.productName,
    rx.treatmentProgram,
    rx.program,
    rx.treatmentType,
    rx.category,
    rx.formula,
    rx.compoundingFormula,
    rx.vehicle,
    rx.dispensingForm,
    rx.notes,
    rx.id,
    rx.prescriptionNumber,
    rx.fagron?.testName,
    rx.fagronDetails?.testName,
    names.join(' ')
  ].filter(Boolean).join(' ').toLowerCase();
}

/**
 * Classifies a prescription into one of the 5 canonical clinical categories
 * @param {Object} rx - Raw or sanitized prescription object
 * @returns {Object} Config object with { key, brandType, label, sublabel, badgeColor, badgeBg, badgeBorder, iconName, emoji, description }
 */
export function classifyPrescription(rx) {
  if (!rx) return PRESCRIPTION_TYPE_CONFIG.compounding;

  // 1. Direct explicit tags if already stored
  if (rx.clinicalCategory && PRESCRIPTION_TYPE_CONFIG[rx.clinicalCategory]) {
    return PRESCRIPTION_TYPE_CONFIG[rx.clinicalCategory];
  }

  const sig = extractSearchableSignature(rx);
  const fagronTest = detectFagronGenomicsTest(rx);

  // 2. TrichoTest™ Detection (Hair genomics / TrichoSol / TrichoFoam / Scalp Topicals)
  const isTrichoGenomics = fagronTest?.testKey === 'trichotest';
  const hasTrichoKeywords = 
    sig.includes('trichotest') ||
    sig.includes('trichosol') ||
    sig.includes('trichofoam') ||
    sig.includes('trichooil') ||
    sig.includes('trichoconcept') ||
    sig.includes('trichology') ||
    sig.includes('alopecia') ||
    (sig.includes('latanoprost') && (sig.includes('minoxidil') || sig.includes('estradiol') || sig.includes('finasteride'))) ||
    (sig.includes('minoxidil') && (sig.includes('finasteride') || sig.includes('dutasteride') || sig.includes('scalp')));

  if (isTrichoGenomics || hasTrichoKeywords) {
    return PRESCRIPTION_TYPE_CONFIG.trichotest;
  }

  // 3. NutriGen™ Detection (Nutrigenomics / Oral multi-phase chronobiology / GreenSelect / Silymarin)
  const isNutriGenGenomics = fagronTest?.testKey === 'nutrigen';
  const hasNutriGenKeywords = 
    sig.includes('nutrigen') ||
    sig.includes('greenselect') ||
    sig.includes('silymarin') ||
    (sig.includes('detox') && sig.includes('capsule')) ||
    (sig.includes('phase 1') && sig.includes('phase 2') && sig.includes('phase 3')) ||
    rx.id === 'zCXwP3MeSaid23OsGTBP';

  if (isNutriGenGenomics || hasNutriGenKeywords) {
    return PRESCRIPTION_TYPE_CONFIG.nutrigen;
  }

  // 4. Hormone Optimization / BHRT / TRT Detection
  // Keywords specific to bioidentical hormones & endocrine therapies
  const HORMONE_ACTIVES = [
    'testosterone',
    'progesterone',
    'estradiol',
    'estriol',
    'bi-est',
    'biest',
    'dhea',
    'pregnenolone',
    'hcg',
    'human chorionic gonadotropin',
    'clomiphene',
    'clomid',
    'enclomiphene',
    'anastrozole',
    'letrozole',
    'armour thyroid',
    'liothyronine',
    'levothyroxine',
    't3/t4',
    'oxandrolone',
    'nandrolone'
  ];

  const HORMONE_PROGRAMS = [
    'bhrt',
    'trt',
    'hrt',
    'hormone',
    'hormonal',
    'andropause',
    'menopause',
    'hypogonadism',
    'endocrine',
    'lipoderm',
    'topi-pump',
    'troche'
  ];

  const hasHormoneActive = HORMONE_ACTIVES.some(active => sig.includes(active));
  const hasHormoneProgram = HORMONE_PROGRAMS.some(prog => sig.includes(prog));

  if (hasHormoneActive || hasHormoneProgram) {
    return PRESCRIPTION_TYPE_CONFIG.hormone;
  }

  // 5. Peptide Protocol Detection (SubQ injectables, vials, bioregulators)
  const PEPTIDE_KEYWORDS = [
    'bpc-157',
    'bpc 157',
    'tb-500',
    'tb 500',
    'cjc-1295',
    'cjc 1295',
    'ipamorelin',
    'sermorelin',
    'tesamorelin',
    'ghk-cu',
    'ghk cu',
    'epithalon',
    'mots-c',
    'ss-31',
    'humanin',
    'kisspeptin',
    'dihexa',
    'kpv',
    'semaglutide',
    'tirzepatide',
    'retatrutide',
    'nad+',
    'selank',
    'semax',
    'peptide',
    'biologic',
    'vial',
    'lyophilized',
    'subcutaneous'
  ];

  const hasPeptideKeywords = PEPTIDE_KEYWORDS.some(kw => sig.includes(kw));
  if (hasPeptideKeywords) {
    return PRESCRIPTION_TYPE_CONFIG.peptide;
  }

  // 6. Fallback to Compounding Rx
  return PRESCRIPTION_TYPE_CONFIG.compounding;
}

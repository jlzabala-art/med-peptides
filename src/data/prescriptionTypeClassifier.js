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

import { detectFagronGenomicsTest } from './fagronGenomicsTests.js';

export const PRESCRIPTION_TYPES = {
  TRICHOTEST: 'trichotest',
  NUTRIGEN: 'nutrigen',
  HORMONE: 'hormone',
  PEPTIDE: 'peptide',
  PEPTIDE_PEN: 'peptide_pen',
  PEPTIDE_VIAL: 'peptide_vial',
  IV_INFUSION: 'iv_infusion',
  COMPOUNDING: 'compounding'
};

export const PRESCRIPTION_TYPE_CONFIG = {
  trichotest: {
    key: 'trichotest',
    archetype: 'trichotest',
    brandType: 'trichotest',
    label: 'TrichoTest™',
    sublabel: 'Topical Scalp · Galenic',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff',
    badgeBorder: '#ddd6fe',
    iconName: 'Dna',
    emoji: '🧬',
    requiresReconstitution: false,
    containerType: 'dropper_1ml',
    description: 'Fagron Genomics TrichoTest™ follicular DNA-guided compounded topical solution'
  },
  nutrigen: {
    key: 'nutrigen',
    archetype: 'nutrigen',
    brandType: 'nutrigen',
    label: 'NutriGen™',
    sublabel: 'Oral Chrono · 3 Phases',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    badgeBorder: '#a7f3d0',
    iconName: 'Dna',
    emoji: '🧬',
    requiresReconstitution: false,
    containerType: 'capsules',
    description: 'Fagron Genomics NutriGen™ nutrigenomic multi-phase oral chronobiological therapy'
  },
  hormone: {
    key: 'hormone',
    archetype: 'hormone_oral_bhrt',
    brandType: 'hormone',
    label: 'Hormones · BHRT',
    sublabel: 'Endocrine · BHRT / TRT',
    badgeColor: '#ea580c',
    badgeBg: '#fff7ed',
    badgeBorder: '#ffedd5',
    iconName: 'Activity',
    emoji: '⚡',
    requiresReconstitution: false,
    containerType: 'pentravan_or_capsules',
    description: 'Bioidentical Hormone Replacement Therapy & endocrine optimization protocol'
  },
  peptide_pen: {
    key: 'peptide_pen',
    archetype: 'peptide_pen',
    brandType: 'peptides',
    label: 'SubQ Pen Protocol',
    sublabel: 'Pre-filled SubQ Pen · Ready to Inject',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff',
    badgeBorder: '#ddd6fe',
    iconName: 'PenTool',
    emoji: '🖊️',
    requiresReconstitution: false,
    containerType: 'prefilled_pen',
    storageTemp: '2°C – 8°C',
    description: 'Pre-filled multi-dose subcutaneous peptide pen device (ready to inject, no reconstitution)'
  },
  peptide_vial: {
    key: 'peptide_vial',
    archetype: 'peptide_vial',
    brandType: 'peptides',
    label: 'Peptide Vial Protocol',
    sublabel: 'Lyophilized SubQ · Reconstitution Required',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    badgeBorder: '#bfdbfe',
    iconName: 'Syringe',
    emoji: '💉',
    requiresReconstitution: true,
    containerType: 'borosilicate_vial',
    storageTemp: '2°C – 8°C (Post-mixing)',
    description: 'Lyophilized subcutaneous peptide vial requiring reconstitution with bacteriostatic water'
  },
  peptide: {
    key: 'peptide',
    archetype: 'peptide_vial',
    brandType: 'peptides',
    label: 'Peptide Protocol',
    sublabel: 'Biologics · SubQ',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    badgeBorder: '#bfdbfe',
    iconName: 'Syringe',
    emoji: '💉',
    requiresReconstitution: true,
    containerType: 'borosilicate_vial',
    description: 'Lyophilized subcutaneous peptides and cellular bioregulators'
  },
  iv_infusion: {
    key: 'iv_infusion',
    archetype: 'iv_infusion',
    brandType: 'iv_drips',
    label: 'IV Infusion Drip',
    sublabel: 'Clinical Infusion · Controlled Rate',
    badgeColor: '#0284c7',
    badgeBg: '#f0f9ff',
    badgeBorder: '#bae6fd',
    iconName: 'Droplets',
    emoji: '💧',
    requiresReconstitution: false,
    containerType: 'infusion_bag',
    description: 'Clinical intravenous infusion protocol with controlled drip rate in saline carrier'
  },
  compounding: {
    key: 'compounding',
    archetype: 'compounding',
    brandType: 'prescription',
    label: 'Compounding Rx',
    sublabel: 'Custom Galenic',
    badgeColor: '#475569',
    badgeBg: '#f1f5f9',
    badgeBorder: '#cbd5e1',
    iconName: 'FlaskConical',
    emoji: '💊',
    requiresReconstitution: false,
    containerType: 'custom',
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

  // 2. Explicit Hormone Optimization / BHRT / TRT Detection
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
    'pentravan',
    'troche'
  ];

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

  const hasHormoneProgram = HORMONE_PROGRAMS.some(prog => sig.includes(prog));
  const hasHormoneActive = HORMONE_ACTIVES.some(active => sig.includes(active));
  const hasHairOrScalp = sig.includes('scalp') || sig.includes('hair') || sig.includes('alopecia') || sig.includes('tricho') || sig.includes('minoxidil');

  if (hasHormoneProgram || (hasHormoneActive && !hasHairOrScalp)) {
    return PRESCRIPTION_TYPE_CONFIG.hormone;
  }

  // 2. IV Infusion Detection (Clinical Infusion, Drips, Saline bag)
  const hasIvKeywords = sig.includes('iv drip') || sig.includes('infusion') || sig.includes('intravenous') || sig.includes('intravenosa') || sig.includes('goteo iv') || sig.includes('saline bag');
  if (hasIvKeywords && !sig.includes('topical') && !sig.includes('cream')) {
    return PRESCRIPTION_TYPE_CONFIG.iv_infusion;
  }

  // 3. Peptide Protocol Detection (Pre-filled Pens vs Lyophilized Vials)
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
    'cagrilintide',
    'mazdutide',
    'survodutide',
    'glp-3',
    'glp3',
    'glp-1',
    'glp1',
    'pre-filled pen',
    'prefilled pen',
    'subq pen',
    'nad+',
    'selank',
    'semax',
    'peptide',
    'biologic',
    'vial',
    'lyophilized',
    'subcutaneous'
  ];

  const hasPeptideKeywords = PEPTIDE_KEYWORDS.some(kw => sig.includes(kw)) ||
    (sig.includes('pen') && (sig.includes('30 mg') || sig.includes('15 mg') || sig.includes('10 mg') || sig.includes('5 mg') || sig.includes('subq')));
  
  if (hasPeptideKeywords) {
    const isPen = sig.includes('pre-filled pen') || sig.includes('prefilled pen') ||
      sig.includes('pluma precargada') || sig.includes('subq pen') ||
      sig.includes('ready-to-use pen') || sig.includes('solución tampón') || sig.includes('sterile buffer') ||
      (sig.includes('pen') && (sig.includes('retatrutide') || sig.includes('glp') || sig.includes('tirzepatide') || sig.includes('semaglutide') || sig.includes('cagrilintide') || sig.includes('30 mg') || sig.includes('15 mg')));

    return isPen ? PRESCRIPTION_TYPE_CONFIG.peptide_pen : PRESCRIPTION_TYPE_CONFIG.peptide_vial;
  }

  // 4. TrichoTest™ Detection (Hair genomics / TrichoSol / TrichoFoam / Scalp Topicals)
  const isTrichoGenomics = fagronTest?.testKey === 'trichotest';
  const hasTrichoKeywords = 
    sig.includes('trichotest') ||
    sig.includes('trichosol') ||
    sig.includes('trichofoam') ||
    sig.includes('trichooil') ||
    sig.includes('trichoconcept') ||
    sig.includes('trichology') ||
    sig.includes('alopecia') ||
    (sig.includes('latanoprost') && (sig.includes('minoxidil') || sig.includes('17-a') || sig.includes('17-alpha') || sig.includes('finasteride'))) ||
    (sig.includes('minoxidil') && (sig.includes('finasteride') || sig.includes('dutasteride') || sig.includes('scalp')));

  if (isTrichoGenomics || hasTrichoKeywords) {
    return PRESCRIPTION_TYPE_CONFIG.trichotest;
  }

  // 5. NutriGen™ Detection (Nutrigenomics / Oral multi-phase chronobiology / GreenSelect / Silymarin)
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

  // 6. Fallback to Compounding Rx
  return PRESCRIPTION_TYPE_CONFIG.compounding;
}

/**
 * Convenience helper to return just the canonical archetype key
 * @param {Object} rx
 * @returns {'trichotest' | 'nutrigen' | 'peptide_pen' | 'peptide_vial' | 'hormone_oral_bhrt' | 'iv_infusion' | 'compounding'}
 */
export function classifyArchetype(rx) {
  if (rx?.clinicalArchetype) return rx.clinicalArchetype;
  const config = classifyPrescription(rx);
  return config?.archetype || config?.key || 'compounding';
}

/**
 * Prescription Regimen Clinical Taxonomy & Classification Engine
 * Atlas Clinical Platform / Regenpept Standard
 * 
 * Provides standardized categories, clinical keywords, visual badges,
 * and intelligent concise title generation for all compounded prescriptions.
 */

export const PRESCRIPTION_REGIMEN_CATEGORIES = [
  {
    id: 'follicular_hair',
    name: 'Follicular & Hair Restoration',
    shortName: 'Follicular',
    shortCode: 'HAIR-RX',
    badgeColor: '#0f766e',
    badgeBg: '#f0fdfa',
    badgeBorder: '#99f6e4',
    description: 'Precision trichological therapies, 5-alpha reductase inhibitors, folliculotropics & vascular stimulants.',
    keywords: [
      'minoxidil', 'dutasteride', 'finasteride', 'trichosol', 'trichooil', 'trichowash',
      'trichofoam', 'trichoxil', 'trichoxidil', 'trichotest', 'latanoprost', 'saw palmetto',
      'prostaquinon', 'igrantine', 'siliciumax', 'silicio', 'scalp', 'alopecia', 'follicular',
      'hair', 'hair loss', 'follicle', 'cetirizine'
    ],
    defaultSuffix: 'Scalp Regimen'
  },
  {
    id: 'cellular_longevity',
    name: 'Cellular Longevity & Senescence',
    shortName: 'Longevity',
    shortCode: 'LONG-RX',
    badgeColor: '#4338ca',
    badgeBg: '#eef2ff',
    badgeBorder: '#c7d2fe',
    description: 'Telomerase activation, NAD+ replenishment, senolytics and mitochondrial longevity protocols.',
    keywords: [
      'epithalon', 'epitalon', 'telotest', 'telomere', 'mots-c', 'motsc', 'nad', 'nad+', 'nmn',
      'rapamycin', 'spermidine', 'resveratrol', 'trans-resveratrol', 'fisetin', 'quercetin',
      'longevity', 'senolytic', 'nicotinamide', 'biomarker', 'proteomics', 'grimage', 'bioage'
    ],
    defaultSuffix: 'Longevity Protocol'
  },
  {
    id: 'tissue_repair',
    name: 'Tissue Repair & Peptides',
    shortName: 'Tissue Repair',
    shortCode: 'REPAIR-RX',
    badgeColor: '#047857',
    badgeBg: '#ecfdf5',
    badgeBorder: '#a7f3d0',
    description: 'Angiogenic, wound healing, tendinous, and gastrointestinal peptide bioregulators.',
    keywords: [
      'bpc-157', 'bpc157', 'tb-500', 'tb500', 'thymosin beta', 'kpv', 'ghk-cu', 'copper peptide',
      'pentosan', 'cartilage', 'tendon', 'healing', 'gut repair', 'tissue repair', 'musculoskeletal'
    ],
    defaultSuffix: 'Tissue Repair Protocol'
  },
  {
    id: 'metabolic_weight',
    name: 'Metabolic & Body Composition',
    shortName: 'Metabolic',
    shortCode: 'META-RX',
    badgeColor: '#be123c',
    badgeBg: '#fff1f2',
    badgeBorder: '#fecdd3',
    description: 'Incretin mimetics, GLP-1/GIP agonists, insulin sensitizers and targeted lipolytics.',
    keywords: [
      'semaglutide', 'tirzepatide', 'retatrutide', 'liraglutide', 'aod-9604', 'aod9604',
      '5-amino-1mq', 'tesofensine', 'metformin', 'berberine', 'carnitine', 'l-carnitine',
      'glp-1', 'gip', 'weight management', 'metabolic', 'adipose', 'body composition'
    ],
    defaultSuffix: 'Metabolic Regimen'
  },
  {
    id: 'hormone_bhrt',
    name: 'Bioidentical Hormone Therapy (BHRT)',
    shortName: 'BHRT Hormone',
    shortCode: 'BHRT-RX',
    badgeColor: '#b45309',
    badgeBg: '#fffbeb',
    badgeBorder: '#fde68a',
    description: 'Precision transdermal and micronized sex hormone replacement (Estradiol, Progesterone, Testosterone, DHEA).',
    keywords: [
      'estradiol', 'estriol', 'progesterone', 'testosterone', 'dhea', 'dehydroepiandrosterone',
      'pregnenolone', 'hcg', 'enclomiphene', 'clomiphene', 'anastrozole', 'bhrt', 'hrt',
      'pentravan', 'bioidentical hormone', 'endocrine', 'androgen', 'estrogen'
    ],
    defaultSuffix: 'BHRT Regimen'
  },
  {
    id: 'neuro_circadian',
    name: 'Neuro & Circadian Vitality',
    shortName: 'Neuro & Sleep',
    shortCode: 'NEURO-RX',
    badgeColor: '#6d28d9',
    badgeBg: '#f5f3ff',
    badgeBorder: '#ddd6fe',
    description: 'Nootropic bioregulators, sleep architecture modulators and neuro-calming amino neurotransmitters.',
    keywords: [
      'dsip', 'selank', 'semax', 'pinealon', 'cerebrolysin', 'melatonin', 'gaba',
      'l-theanine', 'theanine', '5-htp', 'tryptophan', 'l-tryptophan', 'p5p', 'pyridoxal-5-phosphate',
      'magnesium glycinate', 'glycine', 'nootropic', 'circadian', 'sleep', 'cns rest', 'cognitive'
    ],
    defaultSuffix: 'Neuro & Sleep Regimen'
  },
  {
    id: 'dermal_skin',
    name: 'Dermatology & Skin Renewal',
    shortName: 'Dermatology',
    shortCode: 'DERM-RX',
    badgeColor: '#be185d',
    badgeBg: '#fdf2f8',
    badgeBorder: '#fbcfe8',
    description: 'Prescription dermatologicals, retinoids, collagen-stimulating actives and dermal barrier care.',
    keywords: [
      'tretinoin', 'retinol', 'retinal', 'acnetest', 'clindamycin', 'azelaic', 'niacinamide',
      'hyaluronic acid', 'hydroquinone', 'kojic', 'glycolic', 'dermatology', 'dermal', 'acne',
      'melasma', 'skin barrier', 'transdermal cream'
    ],
    defaultSuffix: 'Dermal Renewal Regimen'
  },
  {
    id: 'micronutrient_mito',
    name: 'Micronutrient & Mitochondrial Vitality',
    shortName: 'Nutraceutical',
    shortCode: 'NUTRI-RX',
    badgeColor: '#0369a1',
    badgeBg: '#f0f9ff',
    badgeBorder: '#bae6fd',
    description: 'High-potency cellular antioxidants, enzyme cofactors, methylation support and mitochondrial IV therapy.',
    keywords: [
      'vitamin c', 'ascorbic', 'nac', 'n-acetylcysteine', 'glutathione', 'taurine', 'zinc',
      'zinc sulfate', 'selenium', 'selenium yeast', 'astaxanthin', 'coq10', 'ubiquinol',
      'alpha lipoic', 'methylation', 'methylcobalamin', 'folate', 'panax ginseng', 'ginseng',
      'myers', 'infusion', 'antioxidant', 'mitochondrial'
    ],
    defaultSuffix: 'Cellular Support Formula'
  },
  {
    id: 'genomics_testing',
    name: 'Genomic & Diagnostic Testing',
    shortName: 'Genomics',
    shortCode: 'GENO-RX',
    badgeColor: '#334155',
    badgeBg: '#f8fafc',
    badgeBorder: '#e2e8f0',
    description: 'Comprehensive pharmacogenetics, DNA nutrigenomics, and epigenetic biological age profiling.',
    keywords: [
      'nutrigen', 'nutrigenomics', 'fagron nutrigen', 'tellmegen', 'dna test', 'pharmacogenetics',
      'complex diseases', 'monogenic', 'epigenetic', 'genetic panel', 'bloodo', 'teletest'
    ],
    defaultSuffix: 'Genomic Panel'
  }
];

const DEFAULT_CATEGORY = PRESCRIPTION_REGIMEN_CATEGORIES[0]; // Follicular fallback if nothing matches

/**
 * Filter list of items to isolate primary pharmacologically active ingredients
 * (stripping out bases, carriers, vitamins, and general vehicles).
 */
export function extractKeyActiveIngredients(rx) {
  const rawList = [];

  // Extract from rx.items
  if (Array.isArray(rx.items)) {
    rx.items.forEach(i => {
      const name = i.name || i.activeIngredient || i.drugName || i.productName || '';
      const isVehicle = i.isVehicleOrBase || i._isVehicleOrBase;
      if (name && !isVehicle) rawList.push(name);
    });
  }

  // Extract from rx.parts
  if (Array.isArray(rx.parts)) {
    rx.parts.forEach(p => {
      if (Array.isArray(p.apis)) {
        p.apis.forEach(a => {
          const name = a.name || a.drugName || a.activeIngredient || '';
          if (name) rawList.push(name);
        });
      }
    });
  }

  // Extract from rx.formulas
  if (Array.isArray(rx.formulas)) {
    rx.formulas.forEach(f => {
      if (Array.isArray(f.components)) {
        f.components.forEach(c => {
          const name = c.name || c.apiName || c.drugName || '';
          if (name) rawList.push(name);
        });
      }
    });
  }

  // Extract from rx.compounds or prescriptionLines
  if (Array.isArray(rx.compounds)) {
    rx.compounds.forEach(c => { if (c.name) rawList.push(c.name); });
  }
  if (Array.isArray(rx.prescriptionLines)) {
    rx.prescriptionLines.forEach(l => { if (l.name || l.drugName) rawList.push(l.name || l.drugName); });
  }

  // Deduplicate and clean up
  const cleanList = [];
  const seen = new Set();

  for (const item of rawList) {
    const rawClean = String(item).trim();
    if (!rawClean) continue;

    // Filter out common excipients and vehicles
    const lower = rawClean.toLowerCase();
    if (
      lower.includes('base') ||
      lower.includes('pentravan') ||
      lower.includes('trichosol') ||
      lower.includes('trichooil') ||
      lower.includes('trichowash') ||
      lower.includes('trichofoam') ||
      lower.includes('capsule') ||
      lower.includes('cream base') ||
      lower.includes('vehiculo') ||
      lower.includes('vehicle') ||
      lower.includes('q.s.') ||
      lower === 'water' ||
      lower === 'saline'
    ) {
      continue;
    }

    // Simplify compound names (remove dosage/magistral tags)
    let simplified = rawClean
      .replace(/\s*\(magistral\)/gi, '')
      .replace(/\s*\(man\)/gi, '')
      .replace(/\s*\(woman\)/gi, '')
      .replace(/\s*\(micronized.*?\)/gi, '')
      .replace(/\s*\(bioidentical.*?\)/gi, '')
      .replace(/\s*tm\b/gi, '™')
      .replace(/\s*fagron\b/gi, '')
      .trim();

    const checkKey = simplified.toLowerCase();
    if (!seen.has(checkKey)) {
      seen.add(checkKey);
      cleanList.push(simplified);
    }
  }

  return cleanList;
}

/**
 * Intelligently classifies a prescription and derives a short, clinical regimen title.
 * 
 * @param {Object} rx - Prescription object
 * @returns {Object} { category, categoryId, categoryShort, categoryCode, badgeColor, badgeBg, badgeBorder, regimenShortTitle, activeSummary }
 */
export function classifyPrescriptionRegimen(rx) {
  if (!rx) {
    return {
      category: DEFAULT_CATEGORY.name,
      categoryId: DEFAULT_CATEGORY.id,
      categoryShort: DEFAULT_CATEGORY.shortName,
      categoryCode: DEFAULT_CATEGORY.shortCode,
      badgeColor: DEFAULT_CATEGORY.badgeColor,
      badgeBg: DEFAULT_CATEGORY.badgeBg,
      badgeBorder: DEFAULT_CATEGORY.badgeBorder,
      regimenShortTitle: 'Personalized Compounded Regimen',
      activeSummary: ''
    };
  }

  const activeIngredients = extractKeyActiveIngredients(rx);
  const existingTitle = String(rx.treatmentTitle || rx.title || rx.treatmentProgram || '').trim();

  // Aggregate all text for context scoring
  const searchCorpus = [
    existingTitle,
    rx.treatmentType || '',
    rx.clinicalCategory || '',
    rx.diagnosis || '',
    rx.notes || '',
    activeIngredients.join(' '),
    (rx.items || []).map(i => `${i.name || ''} ${i.activeIngredient || ''}`).join(' '),
    (rx.parts || []).map(p => `${p.title || ''} ${p.vehicle || ''}`).join(' ')
  ].join(' ').toLowerCase();

  // Score each category based on keyword density
  let bestScore = -1;
  let bestCategory = DEFAULT_CATEGORY;

  for (const cat of PRESCRIPTION_REGIMEN_CATEGORIES) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (searchCorpus.includes(kw)) {
        // Higher weight for exact active compound matches
        const matchesActives = activeIngredients.some(a => a.toLowerCase().includes(kw));
        score += matchesActives ? 3 : 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }

  // Generate a concise, clinically accurate short title (2-4 words)
  let shortTitle = '';

  const isGenericTitle = !existingTitle ||
    existingTitle === 'Personalized Compounded Protocol' ||
    existingTitle === 'Personalized Compounded Regimen' ||
    existingTitle === 'Personalized Formulation' ||
    existingTitle === 'Compounded Formulation' ||
    existingTitle === 'Compounded Topical Formulation' ||
    existingTitle.toLowerCase() === 'none';

  if (!isGenericTitle && existingTitle.length <= 48 && !existingTitle.toLowerCase().includes('personalized compounded')) {
    // Keep well-defined short clinical titles intact
    shortTitle = existingTitle;
  } else if (activeIngredients.length > 0) {
    // Build short title from the top 1 or 2 primary active compounds
    const topActives = activeIngredients.slice(0, 2);

    if (bestCategory.id === 'follicular_hair') {
      const hasMinox = searchCorpus.includes('minoxidil');
      const hasDuta = searchCorpus.includes('dutasteride');
      const hasFina = searchCorpus.includes('finasteride');
      const hasLatano = searchCorpus.includes('latanoprost');
      const hasSpiro = searchCorpus.includes('spironolactone');
      const isOral = searchCorpus.includes('oral minoxidil') || searchCorpus.includes('oral dutasteride');

      if (hasMinox && hasDuta) {
        shortTitle = isOral ? 'Oral Minoxidil & Dutasteride Regimen' : 'Minoxidil & Dutasteride Scalp Regimen';
      } else if (hasMinox && hasFina) {
        shortTitle = 'Minoxidil & Finasteride Hair Regimen';
      } else if (hasLatano && (hasMinox || hasDuta)) {
        shortTitle = 'Latanoprost & Minoxidil Follicular Regimen';
      } else if (hasSpiro && hasMinox) {
        shortTitle = 'Spironolactone & Minoxidil Scalp Regimen';
      } else if (topActives.length === 1) {
        shortTitle = `${topActives[0]} Follicular Regimen`;
      } else {
        shortTitle = `${topActives.join(' & ')} Scalp Regimen`;
      }
    } else if (bestCategory.id === 'hormone_bhrt') {
      const hasE2 = searchCorpus.includes('estradiol');
      const hasE3 = searchCorpus.includes('estriol');
      const hasProg = searchCorpus.includes('progesterone');
      const hasTesto = searchCorpus.includes('testosterone');
      const hasDhea = searchCorpus.includes('dhea');

      if (hasE2 && hasE3) {
        shortTitle = 'Transdermal Bi-Est (E2/E3) Regimen';
      } else if (hasTesto && hasProg) {
        shortTitle = 'Testosterone & Progesterone BHRT';
      } else if (hasProg && !hasE2 && !hasTesto) {
        shortTitle = 'Micronized Progesterone Therapy';
      } else if (hasDhea) {
        shortTitle = 'DHEA Hormone Optimization';
      } else if (hasTesto) {
        shortTitle = 'Transdermal Testosterone Therapy';
      } else if (topActives.length > 0) {
        shortTitle = `${topActives.slice(0, 2).join(' & ')} BHRT Regimen`;
      } else {
        shortTitle = 'Bioidentical Hormone Regimen';
      }
    } else if (bestCategory.id === 'tissue_repair') {
      const hasBpc = searchCorpus.includes('bpc-157') || searchCorpus.includes('bpc157');
      const hasTb = searchCorpus.includes('tb-500') || searchCorpus.includes('tb500');
      const hasGhk = searchCorpus.includes('ghk');

      if (hasBpc && hasTb) {
        shortTitle = 'BPC-157 & TB-500 Tissue Repair';
      } else if (hasBpc) {
        shortTitle = 'BPC-157 Regenerative Protocol';
      } else if (hasGhk) {
        shortTitle = 'GHK-Cu Dermal & Tissue Repair';
      } else {
        shortTitle = `${topActives.join(' & ')} Repair Protocol`;
      }
    } else if (bestCategory.id === 'cellular_longevity') {
      const hasEpi = searchCorpus.includes('epithalon') || searchCorpus.includes('epitalon');
      const hasMotsc = searchCorpus.includes('mots-c') || searchCorpus.includes('motsc');
      const hasNad = searchCorpus.includes('nad');

      if (hasEpi && hasMotsc) {
        shortTitle = 'Epithalon & MOTS-c Longevity Regimen';
      } else if (hasNad) {
        shortTitle = 'NAD+ Cellular Bioenergetics';
      } else if (hasEpi) {
        shortTitle = 'Epithalon Telomere Activation Protocol';
      } else {
        shortTitle = `${topActives.join(' & ')} Longevity Regimen`;
      }
    } else if (bestCategory.id === 'neuro_circadian') {
      const hasDsip = searchCorpus.includes('dsip');
      const hasGaba = searchCorpus.includes('gaba');
      const hasTheanine = searchCorpus.includes('theanine');
      const hasMelatonin = searchCorpus.includes('melatonin');

      if (hasDsip) {
        shortTitle = 'DSIP Circadian Restoration Protocol';
      } else if (hasGaba && hasTheanine) {
        shortTitle = 'GABA & L-Theanine Neuro Support';
      } else if (hasMelatonin) {
        shortTitle = 'Targeted Sleep & Circadian Support';
      } else {
        shortTitle = `${topActives.join(' & ')} Neuro-Calm Formula`;
      }
    } else if (bestCategory.id === 'metabolic_weight') {
      const hasSema = searchCorpus.includes('semaglutide');
      const hasTirz = searchCorpus.includes('tirzepatide');

      if (hasTirz) {
        shortTitle = 'Tirzepatide Dual Incretin Protocol';
      } else if (hasSema) {
        shortTitle = 'Semaglutide GLP-1 Metabolic Regimen';
      } else {
        shortTitle = `${topActives.join(' & ')} Metabolic Regimen`;
      }
    } else if (bestCategory.id === 'dermal_skin') {
      shortTitle = `${topActives.join(' & ')} Dermal Protocol`;
    } else if (bestCategory.id === 'micronutrient_mito') {
      shortTitle = `${topActives.join(' & ')} Antioxidant Formula`;
    } else {
      shortTitle = `${topActives.join(' & ')} Regimen`;
    }
  } else {
    // If no ingredients could be parsed, fallback to category default
    shortTitle = bestCategory.name;
  }

  // Ensure title is clean and concise
  shortTitle = shortTitle
    .replace(/\s+/g, ' ')
    .replace(/^Personalized\s+/i, '')
    .trim();

  const activeSummary = activeIngredients.slice(0, 3).join(' · ');

  return {
    category: bestCategory.name,
    categoryId: bestCategory.id,
    categoryShort: bestCategory.shortName,
    categoryCode: bestCategory.shortCode,
    badgeColor: bestCategory.badgeColor,
    badgeBg: bestCategory.badgeBg,
    badgeBorder: bestCategory.badgeBorder,
    regimenShortTitle: shortTitle || bestCategory.name,
    activeSummary
  };
}

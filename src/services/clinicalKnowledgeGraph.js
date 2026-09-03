/**
 * clinicalKnowledgeGraph.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Clinical, Genomic & Compounding Knowledge Graph Engine.
 * 
 * Relational Graph interconnecting:
 *   [Genomic SNPs / Diagnostic Biomarkers]
 *         │
 *         ▼
 *   [Biological Pathways & Molecular Targets]
 *         │
 *         ▼
 *   [Active Ingredients & Peptide APIs]
 *         │
 *         ▼
 *   [Galenic Vehicles & Compounding Matrices]
 *         │
 *         ▼
 *   [Clinical Protocols & Therapeutic Goals]
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const GENOMIC_SNP_NODES = {
  'rs6152': {
    id: 'rs6152',
    gene: 'AR',
    label: 'Androgen Receptor Sensitivity (AR)',
    clinicalImpact: 'Heightened androgenic sensitivity in scalp follicular dermal papilla cells.',
    pathways: ['androgen_signaling', 'wnt_beta_catenin'],
    recommendedApis: ['finasteride', 'dutasteride', 'spironolactone', 'ghk-cu'],
    recommendedVehicles: ['trichoserum', 'trichosol']
  },
  'rs2180439': {
    id: 'rs2180439',
    gene: 'SRD5A2',
    label: '5-Alpha Reductase Type II Overactivity',
    clinicalImpact: 'Elevated localized conversion of Testosterone to DHT.',
    pathways: ['dht_synthesis', 'follicle_miniaturization'],
    recommendedApis: ['finasteride', 'saw_palmetto', 'alfatradiol', 'bpc-157'],
    recommendedVehicles: ['trichosol', 'trichoserum']
  },
  'rs4343': {
    id: 'rs4343',
    gene: 'ACE',
    label: 'Microvascular Perfusion & Vasoconstriction',
    clinicalImpact: 'Reduced microcapillary blood flow and VEGF signaling to follicles.',
    pathways: ['vegf_angiogenesis', 'nitric_oxide_microcirculation'],
    recommendedApis: ['minoxidil', 'bpc-157', 'adenosine', 'ghk-cu'],
    recommendedVehicles: ['trichoserum', 'trichosol']
  },
  'rs1815739': {
    id: 'rs1815739',
    gene: 'ACTN3',
    label: 'Alpha-Actinin-3 Fast-Twitch Muscle Fiber Dynamics',
    clinicalImpact: 'Determines muscular explosive recovery vs endurance adaptation.',
    pathways: ['mtor_protein_synthesis', 'satellite_cell_migration'],
    recommendedApis: ['bpc-157', 'tb-500', 'cjc-1295', 'ipamorelin'],
    recommendedVehicles: ['bacteriostatic_water']
  },
  'rs762551': {
    id: 'rs762551',
    gene: 'CYP1A2',
    label: 'Hepatic Xenobiotic & Caffeine Clearance',
    clinicalImpact: 'Altered hepatic phase I drug and peptide metabolization rate.',
    pathways: ['cytochrome_p450', 'hepatic_clearance'],
    recommendedApis: ['glutathione', 'nad+', 'nac', 'epithalon'],
    recommendedVehicles: ['bacteriostatic_water', 'pentravan']
  },
  'telomere_shortening': {
    id: 'telomere_shortening',
    gene: 'TERT / TERC',
    label: 'Telomerase Catalytic Subunit Deficiency',
    clinicalImpact: 'Accelerated biological cellular senescence and DNA methylation age.',
    pathways: ['telomerase_activation', 'dna_repair', 'sirt1_sirt6'],
    recommendedApis: ['epithalon', 'nad+', 'resveratrol', 'mots-c'],
    recommendedVehicles: ['bacteriostatic_water', 'nourivan']
  }
};

export const BIOLOGICAL_PATHWAY_NODES = {
  'wnt_beta_catenin': {
    id: 'wnt_beta_catenin',
    name: 'Wnt / β-Catenin Anagen Proliferation Axis',
    description: 'Triggers transition from telogen to anagen phase, stimulating hair germ progenitor cells.',
    synergisticApis: ['ghk-cu', 'minoxidil', 'bpc-157', 'latanoprost'],
    compatibleVehicles: ['trichoserum', 'trichosol']
  },
  'vegf_angiogenesis': {
    id: 'vegf_angiogenesis',
    name: 'VEGFR2 Angiogenic Endothelial Regeneration',
    description: 'Promotes microvascular branching, perfusion and nutrient delivery to recovering tissues.',
    synergisticApis: ['bpc-157', 'tb-500', 'ghk-cu'],
    compatibleVehicles: ['trichoserum', 'bacteriostatic_water']
  },
  'mtor_protein_synthesis': {
    id: 'mtor_protein_synthesis',
    name: 'mTORC1 / Collagen Type I & III Synthesis',
    description: 'Drives fibroblast proliferation, extracellular matrix remodeling and muscle myofiber recovery.',
    synergisticApis: ['bpc-157', 'tb-500', 'cjc-1295', 'ipamorelin'],
    compatibleVehicles: ['bacteriostatic_water', 'pentravan']
  },
  'sirt1_sirt6': {
    id: 'sirt1_sirt6',
    name: 'Sirtuin / NAD+ Deacetylation Epigenetic Axis',
    description: 'Regulates mitochondrial biogenesis, oxidative stress defense, and genomic longevity integrity.',
    synergisticApis: ['nad+', 'epithalon', 'mots-c', 'rapamycin'],
    compatibleVehicles: ['bacteriostatic_water']
  }
};

export const GALENIC_VEHICLE_NODES = {
  'trichoserum': {
    id: 'trichoserum',
    name: 'TrichoSerum™',
    technology: 'Patented TrichoTech™ Phytocomplex Formulation Matrix',
    format: 'Non-greasy Transdermal Scalp Serum',
    optimalPh: '5.0 – 6.0',
    maxSoluteCapacity: '15% w/v',
    compatibleApis: ['minoxidil', 'finasteride', 'dutasteride', 'latanoprost', 'bpc-157', 'ghk-cu', 'melatonin', 'caffeine', 'spironolactone'],
    incompatibleAgents: ['Strong oxidizing agents', 'Anionic surfactants at pH < 4.0'],
    primaryIndication: 'Hair Follicle Density, Scalp Rejuvenation & Dermal Peptide Delivery',
    storageCondition: '15°C to 25°C Room Temperature'
  },
  'trichosol': {
    id: 'trichosol',
    name: 'TrichoSol™',
    technology: 'Patented Alcohol-Free TrichoTech™ Aqueous Solution',
    format: 'Aqueous Non-irritating Spray Solution',
    optimalPh: '5.5 – 6.5',
    maxSoluteCapacity: '10% w/v',
    compatibleApis: ['minoxidil', 'finasteride', 'bpc-157', '17-a-estradiol', 'clobetasol', 'adenosine', 'zinc_pyrithione'],
    incompatibleAgents: ['Lipophilic oils without co-solvents'],
    primaryIndication: 'Sensitive Scalp Trichology Formulations',
    storageCondition: '15°C to 25°C Room Temperature'
  },
  'pentravan': {
    id: 'pentravan',
    name: 'Pentravan® Transdermal Vanishing Cream',
    technology: 'Liposomal Transdermal Drug Delivery Base (USP/NF)',
    format: 'Vanishing Emulsion Cream',
    optimalPh: '4.5 – 6.5',
    maxSoluteCapacity: '20% w/v',
    compatibleApis: ['bpc-157', 'testosterone', 'progesterone', 'estradiol', 'metformin', 'nad+', 'rapamycin'],
    incompatibleAgents: ['High concentrations of mineral acids'],
    primaryIndication: 'Hormone Optimization & Systemic Transdermal Peptides',
    storageCondition: '15°C to 25°C Room Temperature'
  },
  'nourivan': {
    id: 'nourivan',
    name: 'Nourivan™ Antiox Facial Base',
    technology: 'Antioxidant-Rich Phospholipid Protective Matrix',
    format: 'Silky Facial Cosmetic Cream',
    optimalPh: '5.0 – 6.0',
    maxSoluteCapacity: '12% w/v',
    compatibleApis: ['ghk-cu', 'hyaluronic_acid', 'argireline', 'niacinamide', 'epithalon', 'ascorbyl_tetraisopalmitate'],
    incompatibleAgents: ['Strong bases'],
    primaryIndication: 'Aesthetic Anti-Aging & Facial Cosmeceuticals',
    storageCondition: '15°C to 25°C Room Temperature'
  },
  'bacteriostatic_water': {
    id: 'bacteriostatic_water',
    name: 'Bacteriostatic Water for Injection (USP)',
    technology: '0.9% Benzyl Alcohol Preserved Sterile Diluent',
    format: 'Multi-dose Sterile Liquid',
    optimalPh: '4.5 – 7.0',
    maxSoluteCapacity: '100 mg/mL',
    compatibleApis: ['bpc-157', 'tb-500', 'semaglutide', 'tirzepatide', 'sermorelin', 'ipamorelin', 'cjc-1295', 'epithalon', 'mots-c', 'nad+'],
    incompatibleAgents: ['Lipophilic non-water soluble APIs'],
    primaryIndication: 'Subcutaneous / Intramuscular Peptide Reconstitution',
    storageCondition: '2°C to 8°C Post-Puncture (Discard after 28 days)'
  }
};

/**
 * Resolves a personalized master formulation recommendation from genomic SNPs
 */
export function resolveFormulationForGeneTest(snpList = [], primaryGoal = 'hair_regeneration') {
  const matchedApis = new Map();
  const matchedPathways = new Set();
  const recommendedVehicles = new Map();

  for (const snp of snpList) {
    const snpKey = String(snp).toLowerCase().trim();
    const node = GENOMIC_SNP_NODES[snpKey];
    if (node) {
      node.pathways.forEach(p => matchedPathways.add(p));
      node.recommendedApis.forEach(api => {
        matchedApis.set(api, (matchedApis.get(api) || 0) + 1);
      });
      node.recommendedVehicles.forEach(veh => {
        recommendedVehicles.set(veh, (recommendedVehicles.get(veh) || 0) + 1);
      });
    }
  }

  // Sort APIs and vehicles by relevance frequency
  const rankedApis = Array.from(matchedApis.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([api]) => api);

  const topVehicleId = Array.from(recommendedVehicles.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || (primaryGoal.includes('hair') ? 'trichoserum' : 'bacteriostatic_water');

  const selectedVehicle = GALENIC_VEHICLE_NODES[topVehicleId] || GALENIC_VEHICLE_NODES['trichoserum'];

  return {
    primaryGoal,
    detectedPathways: Array.from(matchedPathways).map(p => BIOLOGICAL_PATHWAY_NODES[p] || { id: p, name: p }),
    suggestedApis: rankedApis.slice(0, 4),
    recommendedVehicle: selectedVehicle,
    optimalPh: selectedVehicle.optimalPh,
    storageProtocol: selectedVehicle.storageCondition,
    compoundingNote: `Formulated in ${selectedVehicle.name} (${selectedVehicle.technology}) targeting ${matchedPathways.size} distinct molecular pathways.`
  };
}

/**
 * Finds synergistic peptide / active combinations and compatible galenic vehicles for a product
 */
export function findSynergies(productOrName) {
  const name = String(productOrName?.canonicalName || productOrName?.name || productOrName || '').toLowerCase();
  
  // Tricho / Scalp Vehicles
  if (name.includes('tricho')) {
    return {
      entityType: 'galenic_vehicle',
      vehicle: GALENIC_VEHICLE_NODES['trichoserum'],
      synergisticCompanions: [
        { name: 'Minoxidil API (USP)', suggestedDose: '5.0%', rationale: 'Potent arteriole vasodilator via potassium ATP channels' },
        { name: 'Finasteride Pure API', suggestedDose: '0.1%', rationale: 'Selective 5α-reductase type II DHT inhibitor' },
        { name: 'BPC-157 Peptide API', suggestedDose: '0.05%', rationale: 'VEGFR2 microvascular angiogenesis & dermal papilla repair' },
        { name: 'GHK-Cu Copper Tripeptide', suggestedDose: '1.0%', rationale: 'Collagen & decorin synthesis stimulating anagen elongation' }
      ],
      suggestedPh: '5.0 – 6.0',
      stabilityProtocol: 'Room Temperature (15°C - 25°C)'
    };
  }

  // Tissue Repair Peptides (BPC-157, TB-500)
  if (name.includes('bpc') || name.includes('tb-500') || name.includes('tb500')) {
    return {
      entityType: 'peptide_api',
      synergisticCompanions: [
        { name: 'TB-500 (Thymosin β4)', suggestedDose: '5mg / 2x weekly', rationale: 'G-actin sequestering promoting cell migration across injury zones' },
        { name: 'GHK-Cu (Copper Peptide)', suggestedDose: '2mg / daily', rationale: 'Upregulates fibroblast gene expression and MMP modulation' },
        { name: 'Pentravan® Transdermal Base', suggestedDose: 'Compounded 0.1%', rationale: 'For localized transdermal joint & tendon delivery' }
      ],
      compatibleVehicles: [GALENIC_VEHICLE_NODES['bacteriostatic_water'], GALENIC_VEHICLE_NODES['pentravan']],
      suggestedPh: '5.5 – 6.5',
      stabilityProtocol: 'Store reconstituted at 2°C to 8°C (Cold Chain)'
    };
  }

  // Longevity (Epithalon, NAD+)
  if (name.includes('epithalon') || name.includes('nad') || name.includes('mots')) {
    return {
      entityType: 'peptide_api',
      synergisticCompanions: [
        { name: 'NAD+ Ultra-Pure API', suggestedDose: '100mg - 250mg', rationale: 'Essential co-substrate for SIRT1 and PARP1 DNA repair enzymes' },
        { name: 'Epithalon Tetrapeptide', suggestedDose: '10mg / 10-day cycle', rationale: 'Elongates telomeres via TERT promoter upregulation' },
        { name: 'Nourivan™ Facial Base', suggestedDose: '0.1% topical', rationale: 'Topical cellular renewal and radical quenching' }
      ],
      compatibleVehicles: [GALENIC_VEHICLE_NODES['bacteriostatic_water'], GALENIC_VEHICLE_NODES['nourivan']],
      suggestedPh: '6.0 – 7.0',
      stabilityProtocol: 'Lyophilized -20°C / Reconstituted 2°C - 8°C'
    };
  }

  return {
    entityType: 'general',
    synergisticCompanions: [],
    compatibleVehicles: [GALENIC_VEHICLE_NODES['bacteriostatic_water']],
    suggestedPh: '5.0 – 7.0',
    stabilityProtocol: 'Standard Pharmaceutical Quality Protocol'
  };
}

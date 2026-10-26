/**
 * src/data/productClinicalSpecsRegistry.js
 * 
 * Clinical Analytical & INCI Specifications Registry
 * Provides authoritative technical data for:
 * 1. Colway® Bioactive Tropocollagen (EU Cosmetics EC 1223/2009 INCI Registry)
 * 2. UltraPerson™ / Ultraman (Standardized Nutraceutical Actives per Dose)
 * 3. Bloodo™ & TeleTest Diagnostics (Analytical Biomarkers, DBS Matrix, UHPLC-MS/MS, ISO 15189)
 */

import { COLWAY_PRODUCTS_INCI_REGISTRY } from './colwayInciRegistry';
import { MCG_PRODUCTS_INCI_REGISTRY } from './mcgInciRegistry';
import { CLINICAL_SUPPLEMENTS } from './clinicalSupplementsRegistry';

// ── Diagnostic Tests Clinical Analytical Registry (Bloodo, TeleTest, Eterna) ──
const DIAGNOSTIC_SPECS_DB = {
  'bloodo-nad': {
    title: 'Intracellular NAD+ / NADH Bioenergetics Panel',
    biomarkers: [
      { name: 'Total Intracellular NAD (NAD+ + NADH)', unit: 'µmol/L', target: '> 35.0 µmol/L', cv: '< 4.2%' },
      { name: 'NAD+ / NADH Redox Ratio', unit: 'Index', target: '> 3.5', cv: '< 4.8%' },
      { name: 'Whole Blood Cell Count Correlation', unit: 'Norm Factor', target: 'Normal RBC/WBC baseline', cv: '< 2.5%' }
    ],
    sampleMatrix: 'Dried Blood Spot (DBS Whatman 903) · 3 Drops Capillary Blood',
    methodology: 'Ultra-High Performance Liquid Chromatography Coupled with Tandem Mass Spectrometry (UHPLC-MS/MS)',
    accreditation: 'CE-IVDR Certified (EU 2017/746) · ISO 15189 European Reference Laboratory',
    turnaround: '48 – 72 Hours post-laboratory reception',
    precision: 'Analytical Precision CV% < 4.2% · Inter-Assay CV% < 5.0%',
    clinicalScope: 'Quantifies true intracellular cellular bioenergetics vs uninformative extracellular plasma. Evaluates baseline sirtuin cofactor availability, PARP consumption rate, and monitors response to NMN, NR, and IV/SubQ NAD+ therapy.'
  },
  'bloodo-testosterone': {
    title: 'Free & Total Testosterone LC-MS/MS Androgen Panel',
    biomarkers: [
      { name: 'Total Testosterone (Capillary)', unit: 'ng/dL', target: '450 – 850 ng/dL (Age-stratified)', cv: '< 3.8%' },
      { name: 'Calculated Free Testosterone (Vermeulen)', unit: 'pg/mL', target: '9.0 – 30.0 pg/mL', cv: '< 4.5%' },
      { name: 'SHBG (Sex Hormone-Binding Globulin)', unit: 'nmol/L', target: '20.0 – 55.0 nmol/L', cv: '< 3.9%' }
    ],
    sampleMatrix: 'Dried Blood Spot (DBS Whatman 903) · Fasting Morning Collection (08:00–10:00 AM)',
    methodology: 'Isotope-Dilution Liquid Chromatography Tandem Mass Spectrometry (ID-LC-MS/MS)',
    accreditation: 'CE-IVDR Certified · ISO 15189 European Reference Laboratory',
    turnaround: '48 – 72 Hours post-laboratory reception',
    precision: 'Gold-Standard LC-MS/MS without cross-reactivity with DHEA or synthetic 17-alkylated steroids',
    clinicalScope: 'Circadian-calibrated androgen testing bypassing immunoassay interference. Monitors endogenous HPTA axis function during secretagogue protocols (Kisspeptin, Enclomiphene) or TRT.'
  },
  'bloodo-cortisol': {
    title: 'Adrenal Diurnal CAR & Cortisol Endocrine Curve',
    biomarkers: [
      { name: 'Cortisol Awakening Response (CAR T0)', unit: 'nmol/L', target: '12.0 – 22.0 nmol/L', cv: '< 4.1%' },
      { name: 'Cortisol Awakening Peak (CAR T+30m)', unit: 'nmol/L', target: '+50–75% rise from T0', cv: '< 4.4%' },
      { name: 'Evening Cortisol Nadir (22:00h)', unit: 'nmol/L', target: '< 4.0 nmol/L', cv: '< 4.6%' }
    ],
    sampleMatrix: 'Multi-Point Capillary DBS / Salivary Collection Protocol',
    methodology: 'High-Resolution Tandem Mass Spectrometry (LC-MS/MS)',
    accreditation: 'CE-IVDR Certified · ISO 15189 European Reference Laboratory',
    turnaround: '48 – 72 Hours post-laboratory reception',
    precision: 'Zero cross-reactivity with synthetic glucocorticoids (prednisone, dexamethasone)',
    clinicalScope: 'Reveals allostatic adrenal load, sympathetic overactivation, and flattened diurnal cortisol curves indicating HPA axis dysregulation or chronic neuro-endocrine burnout.'
  },
  'bloodo-hba1c': {
    title: '90-Day Glycated Hemoglobin (HbA1c) Metabolic Index',
    biomarkers: [
      { name: 'Glycated Hemoglobin HbA1c', unit: '% / mmol/mol', target: '< 5.4% (< 36 mmol/mol)', cv: '< 2.1%' },
      { name: 'Estimated Average Glucose (eAG)', unit: 'mg/dL', target: '70 – 100 mg/dL', cv: '< 2.5%' }
    ],
    sampleMatrix: 'Dried Blood Spot (DBS Whatman 903) · 2 Drops Whole Capillary Blood',
    methodology: 'Ion-Exchange High Performance Liquid Chromatography (HPLC) / IFCC Standardized',
    accreditation: 'NGSP Certified · CE-IVDR · ISO 15189 European Reference Laboratory',
    turnaround: '48 – 72 Hours post-laboratory reception',
    precision: 'IFCC & NGSP Traceable · Analytical CV% < 2.1%',
    clinicalScope: 'Evaluates long-term microvascular glycation independent of daily acute glucose spikes. Core metabolic tracker for Incretin/GLP-1 titration (Semaglutide, Tirzepatide) and mitochondrial optimization (MOTS-c).'
  },
  'bloodo-omega': {
    title: 'Erythrocyte Membrane Omega-3/6 Lipidomic Index',
    biomarkers: [
      { name: 'Omega-3 Index (EPA + DHA % of RBC)', unit: '%', target: '≥ 8.0% (Cardioprotective)', cv: '< 3.5%' },
      { name: 'Omega-6 / Omega-3 Ratio', unit: 'Ratio', target: '3:1 – 4:1', cv: '< 3.8%' },
      { name: 'AA / EPA Inflammatory Balance Ratio', unit: 'Ratio', target: '< 3.0', cv: '< 4.0%' }
    ],
    sampleMatrix: 'Dried Blood Spot (DBS Whatman 903) · Erythrocyte Lipid Fraction',
    methodology: 'Capillary Gas Chromatography with Flame Ionization Detection (GC-FID)',
    accreditation: 'CE-IVDR · ISO 15189 European Reference Laboratory',
    turnaround: '48 – 72 Hours post-laboratory reception',
    precision: 'Quantifies 24 individual fatty acid methyl esters in red blood cell membranes',
    clinicalScope: 'Evaluates systemic membrane fluidity, eicosanoid balance, and cellular inflammation. Critical baseline prior to peptide tissue repair (BPC-157, TB-500) and neuroprotection.'
  },
  'bloodo-vitamin-d': {
    title: '25-Hydroxy Vitamin D3 / D2 High-Resolution Mass Spec',
    biomarkers: [
      { name: '25-Hydroxy Vitamin D3 [25(OH)D3]', unit: 'ng/mL', target: '50.0 – 80.0 ng/mL (Optimal)', cv: '< 3.2%' },
      { name: '25-Hydroxy Vitamin D2 [25(OH)D2]', unit: 'ng/mL', target: 'Trace / Plant-derived fraction', cv: '< 3.6%' },
      { name: 'Total 25-Hydroxy Vitamin D', unit: 'ng/mL', target: '50.0 – 80.0 ng/mL', cv: '< 3.0%' }
    ],
    sampleMatrix: 'Dried Blood Spot (DBS Whatman 903) · 2 Drops Capillary Blood',
    methodology: 'Liquid Chromatography Tandem Mass Spectrometry (LC-MS/MS with Isotopic Dilution)',
    accreditation: 'DEQAS Certified · CE-IVDR · ISO 15189 European Reference Laboratory',
    turnaround: '48 – 72 Hours post-laboratory reception',
    precision: 'Distinguishes true 25(OH)D3 from inactive 3-epi-25(OH)D3 epimers',
    clinicalScope: 'Calibrates genomic vitamin D receptor (VDR) saturation, antimicrobial peptide promoter expression (Cathelicidin LL-37), and optimizes immune responsiveness during Thymosin Alpha-1 protocols.'
  }
};

// ── UltraPerson Standardized Actives DB ──
const ULTRAPERSON_ACTIVES_DB = {
  'ultraperson-cognitive-clarity-focus': {
    title: 'Nootropic Bacopa, L-Theanine & Pine Bark Clarity Matrix',
    actives: [
      { name: 'Bacopa Monnieri Extract (55% Bacosides A/B)', amount: '320 mg', role: 'Enhances synaptic transmission & visual information processing' },
      { name: 'L-Theanine (Suntheanine® ≥98%)', amount: '150 mg', role: 'Modulates glutamate receptors; promotes calm focus (alpha waves)' },
      { name: 'Maritime Pine Bark Extract (Pycnogenol® 95% OPC)', amount: '30 mg', role: 'Microvascular cerebral perfusion & endothelial nitric oxide support' },
      { name: 'Citicoline Sodium (Cognizin®)', amount: '100 mg', role: 'Precursor to acetylcholine & phosphatidylcholine neuronal membranes' }
    ],
    capsuleSpecs: 'Delayed-Release Acid-Resistant Vegan HPMC (Size 00) · 100% Plant-Derived',
    purity: 'Non-GMO · 0% Allergens · Titanium Dioxide Free · Tested for Heavy Metals (< 0.01 ppm)',
    synergy: 'Formulated for clinical synergy with Semax and Selank nootropic protocols'
  },
  'ultraperson-cognitive-clarity': {
    title: 'Nootropic Bacopa, L-Theanine & Pine Bark Clarity Matrix',
    actives: [
      { name: 'Bacopa Monnieri Extract (55% Bacosides A/B)', amount: '320 mg', role: 'Enhances synaptic transmission & visual information processing' },
      { name: 'L-Theanine (Suntheanine® ≥98%)', amount: '150 mg', role: 'Modulates glutamate receptors; promotes calm focus (alpha waves)' },
      { name: 'Maritime Pine Bark Extract (Pycnogenol® 95% OPC)', amount: '30 mg', role: 'Microvascular cerebral perfusion & endothelial nitric oxide support' },
      { name: 'Citicoline Sodium (Cognizin®)', amount: '100 mg', role: 'Precursor to acetylcholine & phosphatidylcholine neuronal membranes' }
    ],
    capsuleSpecs: 'Delayed-Release Acid-Resistant Vegan HPMC (Size 00) · 100% Plant-Derived',
    purity: 'Non-GMO · 0% Allergens · Titanium Dioxide Free · Tested for Heavy Metals (< 0.01 ppm)',
    synergy: 'Formulated for clinical synergy with Semax and Selank nootropic protocols'
  },
  'ultraperson-energy-metabolic-vitality': {
    title: 'Mitochondrial CoQ10 & PQQ Vitality Complex',
    actives: [
      { name: 'Coenzyme Q10 (Kaneka Ubiquinone®)', amount: '200 mg', role: 'Electron transport chain Complex I/II cofactor' },
      { name: 'Pyrroloquinoline Quinone (PQQ BioPQQ®)', amount: '20 mg', role: 'PGC-1α mitochondrial biogenesis induction' },
      { name: 'Alpha Lipoic Acid (R-ALA Sodium salt)', amount: '150 mg', role: 'Mitochondrial pyruvate dehydrogenase cofactor' },
      { name: 'Acetyl-L-Carnitine HCl', amount: '250 mg', role: 'Long-chain fatty acid CPT-1 mitochondrial shuttle' }
    ],
    capsuleSpecs: 'Delayed-Release Acid-Resistant Vegan HPMC (Size 00) · 100% Plant-Derived',
    purity: 'Non-GMO · Gluten-Free · 0% Allergens · Titanium Dioxide Free · Tested for Heavy Metals (< 0.01 ppm)',
    synergy: 'Calibrated for co-administration with MOTS-c, SS-31, and NAD+ precursors'
  },
  'ultraperson-stress-resilience-emotional-balance': {
    title: 'HPA-Axis Ashwagandha & Rhodiola Resilience Matrix',
    actives: [
      { name: 'Ashwagandha Extract (KSM-66® 5% Withanolides)', amount: '300 mg', role: 'Suppresses allostatic ACTH/cortisol hypersecretion' },
      { name: 'Rhodiola Rosea (3% Rosavins, 1% Salidroside)', amount: '150 mg', role: 'Dual monoamine oxidase modulator & fatigue inhibitor' },
      { name: 'L-Theanine (Suntheanine® ≥98%)', amount: '200 mg', role: 'Antagonizes glutamate AMPA receptors; elevates alpha waves' },
      { name: 'Magnesium Bisglycinate Chelate', amount: '100 mg (elemental)', role: 'GABA-A receptor agonist & NMDA channel blocker' }
    ],
    capsuleSpecs: 'Gastrosoluble Vegan HPMC Capsule · Rapid Morning / Evening Bioavailability',
    purity: 'Non-GMO · Gluten-Free · 0% Synthetic Fillers · ISO 22000 Certified Compounding',
    synergy: 'Synergistic with Selank and DSIP circadian bioregulation'
  },
  'ultraperson-sleep-quality-restoration': {
    title: 'Circadian Glycine, Apigenin & Magnesium Sleep Formula',
    actives: [
      { name: 'Apigenin (Matricaria chamomilla 98%)', amount: '50 mg', role: 'Selective central benzodiazepine/GABA-A receptor ligand' },
      { name: 'Glycine (Pharmaceutical Grade USP)', amount: '1,500 mg', role: 'Induces nocturnal peripheral vasodilation & drops core temperature' },
      { name: 'Magnesium L-Threonate (Magtein®)', amount: '144 mg (elemental)', role: 'Crosses blood-brain barrier; enhances synaptic density' },
      { name: 'Lemon Balm Extract (Rosmarinic Acid ≥5%)', amount: '200 mg', role: 'Inhibits GABA-transaminase breakdown of endogenous GABA' }
    ],
    capsuleSpecs: 'Melatonin-Free · Preserves Endogenous Pineal Gland Rhythm · Vegan HPMC',
    purity: 'Clean Label · Zero morning grogginess or motor impairment · Non-Habit Forming',
    synergy: 'Formulated to complement DSIP and Epithalon pineal protocols'
  },
  'ultraperson-immune-strength-defense': {
    title: 'Innate Immune Zinc, Quercetin & Beta-Glucan Defense',
    actives: [
      { name: 'Yeast Beta-1,3/1,6-D-Glucan (Wellmune®)', amount: '250 mg', role: 'Binds Dectin-1 receptors on macrophages & neutrophils' },
      { name: 'Quercetin Phytosome (Quercefit® liposomal)', amount: '250 mg', role: 'Zinc ionophore; blocks intracellular viral replication' },
      { name: 'Zinc Bisglycinate (TRAACS® chelate)', amount: '25 mg (elemental)', role: 'Thymulin cofactor for CD4+/CD8+ T-cell maturation' },
      { name: 'Elderberry Fruit Extract (14% Anthocyanins)', amount: '300 mg', role: 'Inhibits viral neuraminidase attachment to mucosal cells' }
    ],
    capsuleSpecs: 'Acid-Resistant Vegan HPMC Capsule · Protects Phytosome Absorption',
    purity: '100% Vegan · Dairy-Free · Soy-Free · Non-GMO · Laboratory Tested',
    synergy: 'Pairs synergistically with Thymosin Alpha-1 (Tα1) protocols'
  },
  'ultraperson-longevity-cellular-renewal': {
    title: 'Senolytic Fisetin, Spermidine & Resveratrol Renewal',
    actives: [
      { name: 'Fisetin (Rhus succedanea 98%)', amount: '100 mg', role: 'Selectively clears senescent SASP-secreting cells' },
      { name: 'Spermidine Trihydrochloride (Wheat Germ)', amount: '5 mg', role: 'EP300 acetyltransferase inhibitor; triggers autophagy' },
      { name: 'Trans-Resveratrol (Veri-te™ fermented 98%)', amount: '250 mg', role: 'Direct allosteric activator of SIRT1 deacetylase' },
      { name: 'Calcium Alpha-Ketoglutarate (Ca-AKG)', amount: '500 mg', role: 'Demethylates genomic DNA; reduces systemic epigenetic age' }
    ],
    capsuleSpecs: 'Delayed-Release Acid-Resistant Vegan HPMC · Protects Polyamines',
    purity: 'Medical-Grade Purity · Heavy Metal Screened (< 0.005 ppm Pb/Cd/Hg/As)',
    synergy: 'Engineered for synergy with Epithalon, GHK-Cu, and FoxO4-DRI protocols'
  }
};

/**
 * Resolves technical data for any product across brands
 */
export function getProductTechnicalDetails(product, brandSlug) {
  if (!product) return null;

  const id = (product.id || '').toLowerCase();
  const slug = (product.slug || '').toLowerCase();
  const name = (product.name || product.title || '').toLowerCase();
  const brand = (brandSlug || '').toLowerCase();

  // 1. COLWAY (Cosmetics / Topicals / Oral Nutricosmetics)
  if (brand === 'colway' || id.startsWith('colway-') || slug.startsWith('colway-')) {
    // Look up in official INCI registry
    const registryKey = Object.keys(COLWAY_PRODUCTS_INCI_REGISTRY).find(k => 
      id.includes(k) || slug.includes(k) || k.includes(id) || k.includes(slug)
    );
    const inciData = registryKey ? COLWAY_PRODUCTS_INCI_REGISTRY[registryKey] : null;

    return {
      type: 'inci',
      badge: 'Official INCI · EU Cosmetics Reg. (EC) 1223/2009',
      title: 'Full INCI Ingredients & Bioactive Formulation',
      keyActives: inciData?.key_actives_summary || product.subtitle || product.description || 'Intact 3D Triple-Helix Tropocollagen, Bioactive Peptides & Natural Emollients',
      ingredients: inciData?.ingredients || [],
      applicationTip: inciData?.application_tip || null,
      clinicalFocus: inciData?.clinical_focus_dossier || null,
      compliance: 'EU CPNP Registered · ISO 22716 Cosmetics GMP · Dermatologically Tested',
      manufacturer: 'Colway sp.j. (Koleczkowo, Poland / European Union)'
    };
  }

  // 1B. MCG COSMETICS (Medical Cosmeceuticals & Follicular Trichology)
  if (brand === 'mcg' || brand === 'mcg cosmetics' || id.startsWith('mcg-') || slug.startsWith('mcg-') || slug.includes('kapigen')) {
    const registryKey = Object.keys(MCG_PRODUCTS_INCI_REGISTRY).find(k =>
      id.includes(k) || slug.includes(k) || k.includes(id) || k.includes(slug)
    );
    const inciData = registryKey ? MCG_PRODUCTS_INCI_REGISTRY[registryKey] : null;

    return {
      type: 'inci',
      badge: 'Official INCI · Medical Cosmeceutical (EC) 1223/2009',
      title: 'Full INCI Ingredients & Trichological Peptide Formulation',
      keyActives: inciData?.key_actives_summary || '5% Procapil® (Biotinyl-GHK, Oleanolic Acid, Apigenin), Biotin, Panthenol, Phytokeratin & Menthol',
      ingredients: inciData?.ingredients || [],
      applicationTip: inciData?.application_tip || null,
      clinicalFocus: inciData?.clinical_focus_dossier || null,
      compliance: 'ISO 22716 Cosmetics GMP · EU & US FDA Compliant · Dermatologically Evaluated',
      manufacturer: 'MCG Medical Cosmeceutical Group (MCG Cosmetics)'
    };
  }

  // 2. ULTRAPERSON / ULTRAMAN (Precision Clinical Nutraceuticals)
  if (brand === 'ultraperson' || brand === 'ultraman' || id.startsWith('ultraperson-') || slug.startsWith('ultraperson-')) {
    const registryKey = Object.keys(ULTRAPERSON_ACTIVES_DB).find(k =>
      id.includes(k) || slug.includes(k) || k.includes(id) || k.includes(slug)
    );
    const suppData = registryKey ? ULTRAPERSON_ACTIVES_DB[registryKey] : null;

    return {
      type: 'nutraceutical',
      badge: 'Atlas Precision Actives per Dose',
      title: suppData?.title || 'Standardized Active Clinical Compounds',
      actives: suppData?.actives || [
        { name: 'Standardized Bioactive Extract', amount: 'Clinical Dose', role: 'Targeted physiological modulation' }
      ],
      capsuleSpecs: suppData?.capsuleSpecs || 'Acid-Resistant Vegan HPMC Delayed-Release Capsule',
      purity: suppData?.purity || '0% Allergens · Non-GMO · Titanium Dioxide Free · Tested < 0.01 ppm Heavy Metals',
      synergy: suppData?.synergy || 'Formulated for synergy with targeted peptide protocols',
      compliance: 'Manufactured under European GMP / cGMP Standards',
      manufacturer: 'Atlas Clinical Compounding Network (European Union)'
    };
  }

  // 3. BLOODO (Capillary DBS Diagnostic Test Kits)
  if (brand === 'bloodo' || id.startsWith('bloodo-') || slug.startsWith('bloodo-') || name.includes('bloodo')) {
    let testKey = 'bloodo-nad';
    if (id.includes('testosterone') || name.includes('testosterone') || name.includes('testosterona')) testKey = 'bloodo-testosterone';
    else if (id.includes('cortisol') || name.includes('cortisol')) testKey = 'bloodo-cortisol';
    else if (id.includes('hba1c') || name.includes('hba1c') || name.includes('glycat')) testKey = 'bloodo-hba1c';
    else if (id.includes('omega') || name.includes('omega')) testKey = 'bloodo-omega';
    else if (id.includes('vitamin-d') || name.includes('vitamin d') || name.includes('vitamina d')) testKey = 'bloodo-vitamin-d';

    const diagData = DIAGNOSTIC_SPECS_DB[testKey] || DIAGNOSTIC_SPECS_DB['bloodo-nad'];

    return {
      type: 'diagnostic',
      badge: 'CE-IVDR Accredited · ISO 15189 European Laboratory',
      title: diagData.title,
      biomarkers: diagData.biomarkers,
      sampleMatrix: diagData.sampleMatrix,
      methodology: diagData.methodology,
      accreditation: diagData.accreditation,
      turnaround: diagData.turnaround,
      precision: diagData.precision,
      clinicalScope: diagData.clinicalScope,
      reportFormat: 'Encrypted Digital Patient Portal with Quantitative Ranges & Physician Clinical Interpretation',
      referenceLab: 'LifeLab1 European Central Laboratory (Vilnius, EU) · ISO 15189'
    };
  }

  // 4. TELETEST / ETERNA (Genomics & Clinical Laboratory)
  if (brand === 'teletest' || brand === 'eterna' || id.startsWith('teletest-') || id.startsWith('eterna-')) {
    return {
      type: 'diagnostic',
      badge: brand === 'teletest' ? 'Generalitat E08750211 · ISO 17025' : 'CAP / CLIA · Eurofins Genomics',
      title: product.name || product.title || 'Clinical Diagnostic Panel',
      biomarkers: [
        { name: 'Target Diagnostic Loci / Biomarkers', unit: 'Quantitative', target: 'Verified European Reference Range', cv: '< 3.0%' }
      ],
      sampleMatrix: brand === 'teletest' ? 'Hair Specimen (HTMA) or Buccal Swab (DNA)' : 'Saliva DNA Tube (+700k SNPs) & Serum Proteomics',
      methodology: brand === 'teletest' ? 'ICP-MS/MS (Tandem Mass Spectrometry) & qPCR' : 'Illumina Infinium +700k Microarray & High-Density Proteomics',
      accreditation: brand === 'teletest' ? 'Generalitat de Catalunya E08750211 · ISO 17025' : 'Eurofins Genomics (CAP / CLIA Accredited)',
      turnaround: brand === 'teletest' ? '5 – 7 Business Days' : '15 – 20 Business Days',
      precision: 'High-Density Analytical Specificity > 99.8%',
      clinicalScope: product.description || 'Specialized clinical assessment for genomic predisposition, organ age clocks, and trace element toxicology.',
      reportFormat: 'Digitally FNMT Signed Physician Report with Longitudinal Telemetry',
      referenceLab: brand === 'teletest' ? 'TeleTest Analytika Central Lab (Barcelona)' : 'Eurofins Genomics (Munich/Ebersberg)'
    };
  }

  // 5. LOTUSLAND PEPTIDES (Finished Lyophilized Vials & Analytical Reference Monographs)
  if (brand === 'peptides' || id.includes('peptide') || id.includes('vial') || id.includes('bpc') || id.includes('tb-500') || id.includes('ghk') || id.includes('epithalon') || id.includes('semaglutide') || id.includes('tirzepatide')) {
    const dosage = product.dosage || (product.variants && product.variants[0]?.dosage) || '10 mg';
    return {
      type: 'peptide_monograph',
      badge: 'Lotusland EU Lyophilization Hub · HPLC ≥99.0%',
      title: `${product.name || product.title || 'Peptide'} Monograph & Technical Specifications`,
      dosage: dosage,
      presentation: product.presentation || '10R Borosilicate Lyophilized Vial (Sealed Crimp Septum)',
      purity: product.purity || '≥ 99.0% (Verified by HPLC & Liquid Chromatography Mass Spectrometry)',
      endotoxin: '< 0.05 EU/mg (LAL Endotoxin Pyrogenicity Certified)',
      sequence: product.sequence || 'Certified Lot-Specific Primary Amino Acid Sequence',
      molecularWeight: product.molecularWeight || 'Mass-Verified Molecular Weight',
      casNumber: product.casNumber || 'Verified Chemical Abstract Service Monograph',
      reconstitution: product.reconstitution || 'Reconstitute gently with Bacteriostatic 0.9% Benzyl Alcohol Water. Invert slowly; do not vortex.',
      storage: 'Lyophilized powder: Stable at -20°C for 24 months. Reconstituted aqueous solution: Store at 2°C – 8°C (protect from direct light) and use within 28 days.',
      compliance: 'EU Verified Analytical Reference Standard · ISO 9001 / cGMP Lyophilization Facility',
      sourcingHub: 'Lotusland Formulations & Lyophilization Hub (European Union)'
    };
  }

  return null;
}

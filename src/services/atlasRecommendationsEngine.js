/**
 * src/services/atlasRecommendationsEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Atlas Clinical Adjuvant Intelligence Engine
 * Multi-Pillar Biochemical Recommendation Engine analyzing prescription APIs,
 * routes, dosages, and biological axes:
 * 
 *  1. Bioactive Peptides (Lotusland Research) - Lyophilized bioregulatory peptides.
 *  2. Precision Nutraceuticals (UltraPerson by PharmaPolis) - Targeted clinical oral formulations.
 *  3. Diagnostic Biomarker Panels (Bloodo Diagnostic) - Pre/Post protocol validation panels.
 *  4. Epicutaneous Barrier & ECM Support (Colway Clinical) - For topical scalp therapies.
 * 
 * Pure client-safe: Free of Node.js / firebase-admin dependencies.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function getPrescriptionAtlasRecommendations(rx) {
  if (rx?.atlasRecommendations && rx.atlasRecommendations.supplement && rx.atlasRecommendations.diagnostic) {
    return rx.atlasRecommendations;
  }

  const rawItems = Array.isArray(rx?.items) ? rx.items : [];
  const rawParts = Array.isArray(rx?.parts) ? rx.parts : [];
  const rawLines = Array.isArray(rx?.prescriptionLines) ? rx.prescriptionLines : [];
  
  // Collect all API names and texts
  const detectedApisList = [];
  rawItems.forEach(i => {
    const n = i.name || i.activeIngredient || i.drugName;
    if (n && !detectedApisList.includes(n)) detectedApisList.push(n);
  });
  rawParts.forEach(p => {
    (p.apis || []).forEach(a => {
      const n = a.name || a.activeIngredient;
      if (n && !detectedApisList.includes(n)) detectedApisList.push(n);
    });
  });
  rawLines.forEach(l => {
    const n = l.drugName || l.name || l.activeIngredient;
    if (n && !detectedApisList.includes(n)) detectedApisList.push(n);
  });

  const allText = `${rx?.treatmentTitle || ''} ${rx?.treatmentProgram || ''} ${rx?.phaseName || ''} ${rx?.treatmentType || ''} ${rx?.dosageForm || ''} ${rx?.dispensingForm || ''} ${detectedApisList.join(' ')}`.toLowerCase();

  const isOralRoute = 
    allText.includes('capsule') || 
    allText.includes('cápsula') || 
    allText.includes('oral') || 
    allText.includes('tablet') || 
    allText.includes('comprimido') ||
    String(rx?.dispensingForm || '').toLowerCase().includes('capsule') ||
    String(rx?.dispensingForm || '').toLowerCase().includes('oral');

  const hasTopicalScalp = 
    allText.includes('trichosol') || 
    allText.includes('trichooil') || 
    allText.includes('trichofoam') || 
    allText.includes('scalp') || 
    allText.includes('cuero cabelludo') || 
    allText.includes('tópica') ||
    (allText.includes('minoxidil') && !isOralRoute);

  const isTrichoTest = 
    hasTopicalScalp ||
    allText.includes('tricho') || 
    allText.includes('follic') || 
    allText.includes('alopecia') || 
    allText.includes('finasteride') || 
    allText.includes('dutasteride') ||
    allText.includes('latanoprost');

  const isMitochondrialLongevity = 
    allText.includes('ubiquinol') || 
    allText.includes('coenzyme q10') || 
    allText.includes('coq10') || 
    allText.includes('metformin') || 
    allText.includes('resveratrol') || 
    allText.includes('fisetin') || 
    allText.includes('telomere') || 
    allText.includes('telotest') || 
    allText.includes('senesc') || 
    allText.includes('carnitine') ||
    allText.includes('mitochondr') ||
    allText.includes('nad');

  const isHormonalBHRT = 
    allText.includes('testosterone') || 
    allText.includes('estradiol') || 
    allText.includes('progesterone') || 
    allText.includes('dhea') || 
    allText.includes('pentravan') || 
    allText.includes('bhrt') || 
    allText.includes('trt') || 
    allText.includes('andropause') || 
    allText.includes('menopause');

  const isNeuroSleep = 
    allText.includes('melatonin') || 
    allText.includes('theanine') || 
    allText.includes('gaba') || 
    allText.includes('sleep') || 
    allText.includes('sueño') || 
    allText.includes('insomnia') || 
    allText.includes('ashwagandha') || 
    allText.includes('cortisol') || 
    allText.includes('stress') || 
    allText.includes('semax') || 
    allText.includes('selank');

  const isTissueRepairWound = 
    allText.includes('fue') || 
    allText.includes('graft') || 
    allText.includes('prp') || 
    allText.includes('surgery') || 
    allText.includes('wound') || 
    allText.includes('injerto') || 
    allText.includes('bpc') || 
    allText.includes('cicatriz') ||
    allText.includes('diltiazem');

  // ───────────────────────────────────────────────────────────────────────────
  // PILAR 1: BIOACTIVE PEPTIDE (LOTUSLAND RESEARCH)
  // ───────────────────────────────────────────────────────────────────────────
  let peptideRec = null;

  if (isMitochondrialLongevity) {
    peptideRec = {
      brand: 'Lotusland Research',
      peptideName: 'Epithalon 10 mg / vial',
      category: 'Telomerase Catalytic Activation & Follicular Stem Cell Senescence',
      catalogCode: 'atlas-epithalon-10mg',
      matchScore: '99% Formulative Synergy',
      pharmaRationale:
        'Induces targeted heterochromatin de-condensation and transcriptional upregulation of human Telomerase Reverse Transcriptase (TERT) catalytic subunit via direct Ala-Glu-Asp-Gly peptide binding. Restores Hayflick replicative limit and mitigates mitochondrial oxidative senescence, exhibiting profound bioenergetic synergy with Ubiquinol and Krebs cycle intermediates.',
      associatedProtocol: {
        slug: 'epithalon-telomere-extension',
        title: 'Epithalon Telomere & Epigenetic Longevity Protocol',
        url: '/proto/epithalon-telomere-extension'
      }
    };
  } else if (isTissueRepairWound) {
    peptideRec = {
      brand: 'Lotusland Research',
      peptideName: 'GLOW (BPC-157 / TB-500 / GHK) 10 mg | 10 mg | 75 mg',
      category: 'Triple Angiogenic Bioregulator & Microvascular Tissue Repair',
      catalogCode: 'atlas-glow-blend',
      matchScore: '99% Graft & Tissue Synergy',
      pharmaRationale:
        'Synergistic tri-peptide complex engineered for acute microvascular stabilization and extracellular matrix remodeling. BPC-157 stimulates early growth response-1 (egr-1) and nitric oxide modulation; TB-500 accelerates endothelial actin filament migration; GHK upregulates collagen synthesis and dampens inflammatory metalloproteinases (MMP-1/2).',
      associatedProtocol: {
        slug: 'bpc-157-tb-500-protocol',
        title: 'BPC-157 & TB-500 Cellular Repair Protocol',
        url: '/proto/bpc-157-tb-500-protocol'
      }
    };
  } else if (isHormonalBHRT) {
    peptideRec = {
      brand: 'Lotusland Research',
      peptideName: 'CJC-1295 (No DAC) & Ipamorelin 5 mg / 5 mg',
      category: 'Pulsatile Pituitary GH Axis & Body Composition Bioregulator',
      catalogCode: 'atlas-cjc-ipam-blend',
      matchScore: '97% Endocrine Synergy',
      pharmaRationale:
        'Dual-action secretagogue stimulating physiological, pulsatile growth hormone and IGF-1 secretion without desensitizing pituitary somatotrophs or suppressing luteinizing hormone (LH). Synergizes profoundly with bioidentical hormone replacement therapy (BHRT) by optimizing visceral lipolysis and lean muscle protein accretion.',
      associatedProtocol: {
        slug: 'gh-rejuvenation-cjc-ipam',
        title: 'CJC-1295 & Ipamorelin Synergistic HGH Protocol',
        url: '/proto/gh-rejuvenation-cjc-ipam'
      }
    };
  } else if (isNeuroSleep) {
    peptideRec = {
      brand: 'Lotusland Research',
      peptideName: 'DSIP (Delta Sleep-Inducing Peptide) 5 mg / vial',
      category: 'Central GABAergic & Pineal Circadian Neuro-Reset',
      catalogCode: 'atlas-dsip-5mg',
      matchScore: '98% Neuro-Circadian Synergy',
      pharmaRationale:
        'Nonapeptide crossing the blood-brain barrier to restore physiological slow-wave sleep (SWS) architecture. Modulates central corticotropin-releasing factor (CRF) and monoamine turnover, blunting hypercortisolemia and stabilizing nocturnal autonomic tone.',
      associatedProtocol: {
        slug: 'dsip-circadian-deep-sleep',
        title: 'DSIP Circadian Sleep Restoration Protocol',
        url: '/proto/dsip-circadian-deep-sleep'
      }
    };
  } else if (isTrichoTest) {
    peptideRec = {
      brand: 'Lotusland Research',
      peptideName: 'GHK-Cu (Copper Tripeptide-1) 50 mg / vial',
      category: 'Dermal Papilla Proliferation & TGF-β1 Catagen Blockade',
      catalogCode: 'atlas-ghk-cu-50mg',
      matchScore: '98% Pharmacodynamic Synergy',
      pharmaRationale:
        'Potent follicular bioregulator stimulating dermal papilla fibroblast proliferation, downregulating TGF-β1 (the primary transcriptional driver of catagen transition and follicular miniaturization), and inducing VEGF/bFGF microvascular angiogenesis. Exhibits profound pharmacodynamic synergy with Minoxidil and Dutasteride/Finasteride regimens by accelerating anagen re-entry without androgenic receptor competition.',
      associatedProtocol: {
        slug: 'melanogenesis-density-protocol-zt-ghk-cu',
        title: 'Melanogenesis & Density Protocol (ZT + GHK-Cu)',
        url: '/proto/melanogenesis-density-protocol-zt-ghk-cu'
      }
    };
  } else {
    peptideRec = {
      brand: 'Lotusland Research',
      peptideName: 'BPC-157 10 mg / vial',
      category: 'Endothelial Nitric Oxide Signaling & Cytoprotection',
      catalogCode: 'atlas-bpc-157-10mg',
      matchScore: '95% Biological Synergy',
      pharmaRationale:
        'Penta-decapeptide accelerating local tissue repair through endothelial nitric oxide synthase (eNOS) upregulation and VEGFR2 phosphorylation, modulating local inflammatory cytokines and stabilizing cellular extracellular matrices.',
      associatedProtocol: {
        slug: 'bpc-157-tb-500-protocol',
        title: 'BPC-157 & TB-500 Protocol',
        url: '/proto/bpc-157-tb-500-protocol'
      }
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PILAR 2: PRECISION ORAL NUTRACEUTICAL (ULTRAPERSON BY PHARMAPOLIS)
  // ───────────────────────────────────────────────────────────────────────────
  let supplementRec = null;

  if (isMitochondrialLongevity || allText.includes('ubiquinol') || allText.includes('coq10')) {
    supplementRec = {
      brand: 'UltraPerson by PharmaPolis',
      productName: 'UltraPerson Energy & Metabolic Vitality',
      subtitle: 'Cellular ATP Synthesis & Mitochondrial Biogenesis Co-factors',
      category: 'Mitochondrial Biogenesis & Co-factor Fortification',
      matchScore: '99% Metabolic Synergy',
      regulatoryNotice: 'GMP Certified Formulation · Acid-Resistant Vegan HPMC',
      keyActives: [
        'Coenzyme Q10 (125 mg)',
        'PQQ (20 mg)',
        'Panax Ginseng (200 mg)',
        'Alpha-Lipoic Acid (150 mg)',
        'Piperine (5 mg)'
      ],
      clinicalRationale:
        'Precision rate-limiting mitochondrial co-factors. Pyrroloquinoline Quinone (PQQ) triggers CREB/PGC-1α transcription to drive de novo mitochondrial biogenesis, while Alpha-Lipoic Acid (ALA) recycles cellular Ubiquinol/CoQ10 into its active reduced antioxidant state, multiplying cellular ATP yield and neutralizing lipid peroxidation.',
      routineAdvice:
        'Take 2 capsules once daily with a morning meal and water alongside your prescribed compounded formulation.',
      catalogSlug: 'ultraperson-energy-metabolic-vitality',
      catalogUrl: '/p/ultraperson-energy-metabolic-vitality'
    };
  } else if (isHormonalBHRT || allText.includes('stress') || allText.includes('cortisol')) {
    supplementRec = {
      brand: 'UltraPerson by PharmaPolis',
      productName: 'UltraPerson Stress Resilience & Emotional Balance',
      subtitle: 'HPA Axis Adaptation & Cortisol Homeostasis Modulator',
      category: 'HPA Axis & Cortisol Balance',
      matchScore: '98% Endocrine Synergy',
      regulatoryNotice: 'GMP Certified Formulation · Acid-Resistant Vegan HPMC',
      keyActives: [
        'Ashwagandha Root (300 mg standardized withanolides)',
        'L-Theanine (200 mg)'
      ],
      clinicalRationale:
        'Elevated baseline serum cortisol competitively antagonizes peripheral androgen and estrogen receptor binding. Standardized withanolides downregulate adrenal ACTH hyper-responsiveness, stabilizing the neuro-endocrine axis to ensure maximal physiological receptor sensitivity to prescribed hormone therapies.',
      routineAdvice:
        'Take 2 capsules daily (either 1 morning + 1 late afternoon, or 2 during high-stress periods).',
      catalogSlug: 'ultraperson-stress-resilience-emotional-balance',
      catalogUrl: '/p/ultraperson-stress-resilience-emotional-balance'
    };
  } else if (isNeuroSleep) {
    supplementRec = {
      brand: 'UltraPerson by PharmaPolis',
      productName: 'UltraPerson Sleep Quality & Restoration (Melatonin-Free)',
      subtitle: 'Restorative Slow-Wave Sleep & GABAergic Delta Architecture',
      category: 'Non-Hormonal Circadian Sleep Support',
      matchScore: '99% Restorative Synergy',
      regulatoryNotice: 'GMP Certified · 100% Melatonin-Free · Non-Addictive',
      keyActives: [
        'L-Theanine (200 mg)',
        'Lemon Balm (150 mg rosmarinic acid)',
        'Magnolia Bark (70 mg honokiol/magnolol)',
        'Apigenin (50 mg)',
        'Saffron Stigma (30 mg)'
      ],
      clinicalRationale:
        'Engineered to avoid pineal melatonin receptor desensitization. Honokiol and apigenin act as positive allosteric modulators at GABA-A receptors, while rosmarinic acid inhibits GABA transaminase, extending restorative stage 3/4 slow-wave delta sleep without residual morning grogginess.',
      routineAdvice:
        'Take 2 capsules 30 to 45 minutes prior to bedtime with warm water or chamomile infusion.',
      catalogSlug: 'ultraperson-sleep-quality-restoration',
      catalogUrl: '/p/ultraperson-sleep-quality-restoration'
    };
  } else if (isTissueRepairWound || allText.includes('immune')) {
    supplementRec = {
      brand: 'UltraPerson by PharmaPolis',
      productName: 'UltraPerson Immune Strength & Defense',
      subtitle: 'Zinc Ionophore & Intracellular Phagocytic Protection',
      category: 'Innate & Adaptive Immunomodulation',
      matchScore: '98% Reparative Synergy',
      regulatoryNotice: 'GMP Certified Formulation · Acid-Resistant Vegan HPMC',
      keyActives: [
        'Quercetin Phytosome (250 mg)',
        'Vitamin C (120 mg)',
        'Zinc Picolinate (50 mg / 10 mg elemental)',
        'Elderberry Extract (60 mg)',
        'Vitamin D3 (1,000 IU)'
      ],
      clinicalRationale:
        'Quercetin acts as an intracellular zinc ionophore, facilitating zinc transport across cell membranes to activate DNA polymerase and RNA polymerase repair complexes, accelerating epithelial closure and blunting pro-inflammatory cytokine release.',
      routineAdvice:
        'Take 2 capsules once daily with a meal containing dietary lipids.',
      catalogSlug: 'ultraperson-immune-strength-defense',
      catalogUrl: '/p/ultraperson-immune-strength-defense'
    };
  } else {
    // Longevity & Sirtuin Activation (Default for General Longevity & Trichology Optimization)
    supplementRec = {
      brand: 'UltraPerson by PharmaPolis',
      productName: 'UltraPerson Longevity & Cellular Renewal',
      subtitle: 'SIRT1 Sirtuin Activation & Targeted Senolytic Clearance',
      category: 'Sirtuin Activation & Senolytic Longevity',
      matchScore: '98% Cellular Rejuvenation Synergy',
      regulatoryNotice: 'GMP Certified Formulation · Acid-Resistant Vegan HPMC',
      keyActives: [
        'Trans-Resveratrol micronized (250 mg)',
        'Fisetin (100 mg)',
        'Curcumin Phytosome (100 mg)',
        'Grape Seed OPCs (50 mg)'
      ],
      clinicalRationale:
        'Micronized trans-resveratrol acts as an allosteric activator of SIRT1, de-acetylating key repair enzymes, while the senolytic flavonoid fisetin selectively induces apoptosis in senescent cells that secrete damaging inflammatory SASP cytokines, preserving peribulbar and vascular stem cell niches.',
      routineAdvice:
        'Take 2 capsules once daily in the morning with food.',
      catalogSlug: 'ultraperson-longevity-cellular-renewal',
      catalogUrl: '/p/ultraperson-longevity-cellular-renewal'
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PILAR 3: DIAGNOSTIC BIOMARKER MONITORING (BLOODO DIAGNOSTIC SUITE)
  // ───────────────────────────────────────────────────────────────────────────
  let diagnosticRec = null;

  if (isMitochondrialLongevity || allText.includes('ubiquinol')) {
    diagnosticRec = {
      brand: 'Bloodo Diagnostic Suite',
      testName: 'Bloodo NAD+ & Cellular Bioenergetics Panel',
      subtitle: 'Intracellular Co-factor Balance & Mitochondrial Redox Quantification',
      category: 'Mitochondrial Biomarker Calibration',
      matchScore: '99% Analytical Synergy',
      biomarkersTested: [
        'Intracellular NAD+ / NADH Ratio',
        'Plasma Reduced Ubiquinol vs Oxidized CoQ10',
        'Lactate-to-Pyruvate Index',
        'Serum Fructosamine & Fasting Insulin',
        'Homocysteine (Methylation Efficiency)'
      ],
      clinicalRationale:
        'Quantitative blood analytics to establish baseline mitochondrial efficiency and assess clinical uptake at 60 days. Calibrates therapeutic response, confirming cellular redox shift without metabolic bottleneck.',
      sampleMethod: 'Peripheral venous blood draw · Cold-chain plasma preservation',
      timingRecommendation: 'Baseline Draw (Day 0) and Mid-Protocol Follow-up (Day 60)',
      catalogSlug: 'bloodo-nad-plus-panel',
      catalogUrl: '/p/bloodo-nad-plus-panel'
    };
  } else if (isHormonalBHRT) {
    diagnosticRec = {
      brand: 'Bloodo Diagnostic Suite',
      testName: 'Bloodo Comprehensive Steroid & Hormone Metabolome',
      subtitle: 'LC-MS/MS Precision Endocrine Profiling',
      category: 'Endocrine Calibration & Safety Monitoring',
      matchScore: '99% Endocrine Precision',
      biomarkersTested: [
        'Total & Free Testosterone (Equilibrium Dialysis)',
        'Ultrasensitive Estradiol (E2)',
        'Sex Hormone Binding Globulin (SHBG)',
        'DHEA-Sulfate & Progesterone',
        'Total & Free PSA (Prostate Safety)',
        'Complete Lipid Subfractions'
      ],
      clinicalRationale:
        'High-resolution mass spectrometry profiling to establish therapeutic hormone levels within optimal clinical windows, preventing supra-physiological aromatization and guiding safe dose titration.',
      sampleMethod: 'Fasting venous blood draw (morning 8:00 AM–10:00 AM)',
      timingRecommendation: 'Pre-treatment baseline and follow-up at 4 and 12 weeks',
      catalogSlug: 'bloodo-steroid-hormone-panel',
      catalogUrl: '/p/bloodo-steroid-hormone-panel'
    };
  } else if (isNeuroSleep) {
    diagnosticRec = {
      brand: 'Bloodo Diagnostic Suite',
      testName: 'Bloodo Neuro-Adrenal & Circadian Cortisol Panel',
      subtitle: '4-Point Diurnal Cortisol Curve & Neurotransmitter Metabolites',
      category: 'Circadian Axis & Neuro-Endocrine Assessment',
      matchScore: '97% Chronobiological Synergy',
      biomarkersTested: [
        'Diurnal Cortisol Curve (Morning, Midday, Afternoon, Bedtime)',
        'Cortisol Awakening Response (CAR)',
        'DHEA/Cortisol Adrenal Ratio',
        'Platelet Serotonin & Urinary GABA Metabolites'
      ],
      clinicalRationale:
        'Identifies circadian phase shifts, flattened diurnal curves, or nocturnal hypercortisolemia to tailor chronobiological dosing intervals.',
      sampleMethod: 'Salivary 4-point collection + venous plasma neurotransmitter profile',
      timingRecommendation: 'Baseline assessment prior to initiating peptide/nutraceutical therapy',
      catalogSlug: 'bloodo-neuro-adrenal-panel',
      catalogUrl: '/p/bloodo-neuro-adrenal-panel'
    };
  } else if (isTissueRepairWound) {
    diagnosticRec = {
      brand: 'Bloodo Diagnostic Suite',
      testName: 'Bloodo High-Sensitivity Cytokine & Tissue Repair Panel',
      subtitle: 'Microvascular Inflammation & Extracellular Reparative Velocity',
      category: 'Inflammatory Cascade & Recovery Monitoring',
      matchScore: '98% Recovery Tracking',
      biomarkersTested: [
        'High-Sensitivity C-Reactive Protein (hs-CRP)',
        'Interleukin-6 (IL-6)',
        'Tumor Necrosis Factor-alpha (TNF-α)',
        'Fibrinogen & D-Dimer',
        'Serum Ferritin (Acute Phase Reactant)'
      ],
      clinicalRationale:
        'Quantifies microvascular endothelial inflammation and tracks systemic resolution of tissue injury throughout peptide and compounding therapy.',
      sampleMethod: 'Peripheral venous blood sample',
      timingRecommendation: 'Baseline and post-reparative cycle (Day 30/60)',
      catalogSlug: 'bloodo-inflammation-panel',
      catalogUrl: '/p/bloodo-inflammation-panel'
    };
  } else if (isTrichoTest) {
    diagnosticRec = {
      brand: 'Bloodo Diagnostic Suite',
      testName: 'Bloodo Androgenic & Microvascular Follicular Panel',
      subtitle: 'Comprehensive Systemic Alopecia Biomarker Screen',
      category: 'Follicular Microenvironment & Androgen Screen',
      matchScore: '98% Follicular Calibration',
      biomarkersTested: [
        'Free & Total Dihydrotestosterone (DHT)',
        'Serum Ferritin (Optimal follicular threshold > 70 ng/mL)',
        'Zinc Plasmatic Concentration',
        '25-Hydroxy Vitamin D3',
        'Thyroid Stimulating Hormone (TSH & Free T4)',
        'Dehydroepiandrosterone Sulfate (DHEA-S)'
      ],
      clinicalRationale:
        'Evaluates metabolic and androgenic co-factors driving follicular miniaturization, ensuring that topical DHT blockade is complemented by optimal systemic nutrient stores.',
      sampleMethod: 'Fasting venous blood draw',
      timingRecommendation: 'Baseline pre-treatment screen and 90-day progress check',
      catalogSlug: 'bloodo-androgenic-hair-panel',
      catalogUrl: '/p/bloodo-androgenic-hair-panel'
    };
  } else {
    diagnosticRec = {
      brand: 'Bloodo Diagnostic Suite',
      testName: 'Bloodo Longevity & Epigenetic Biomarker Screen',
      subtitle: 'DNA Methylation Phenotypic Aging & Cellular Health',
      category: 'Epigenetic Clock & Cellular Longevity',
      matchScore: '96% General Health Synergy',
      biomarkersTested: [
        'High-Sensitivity CRP',
        'Fasting Insulin & HOMA-IR',
        'ApoB / ApoA-1 Lipoprotein Ratio',
        'Telomere Length Quantification',
        'Serum Uric Acid & Microalbumin'
      ],
      clinicalRationale:
        'Holistic biomarker map to quantify cellular aging pace and monitor organismal improvement across therapy cycles.',
      sampleMethod: 'Fasting venous blood sample',
      timingRecommendation: 'Annual check or 90-day post-protocol assessment',
      catalogSlug: 'bloodo-epigenetic-aging-panel',
      catalogUrl: '/p/bloodo-epigenetic-aging-panel'
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PILAR 4 (OPTIONAL TOPICAL): COLWAY HAIR STRENGTHENING SYSTEM
  // Strictly only included if patient is actually using a topical scalp vehicle!
  // ───────────────────────────────────────────────────────────────────────────
  let colwayRec = null;
  if (hasTopicalScalp) {
    const hasMinoxidil = allText.includes('minoxidil');
    const has5Ar = allText.includes('finasteride') || allText.includes('dutasteride');
    const hasCortico = allText.includes('clobetasol') || allText.includes('betamethason') || allText.includes('hydrocortison');

    let clinicalRationale = '';
    if (hasCortico) {
      clinicalRationale = 'Topical corticosteroids carry a recognized clinical risk of follicular epidermal atrophy with repeated application. Colway native biologically active collagen provides transdermal bio-scaffolding to sustain dermal matrix thickness without compromising anti-inflammatory efficacy.';
    } else if (hasMinoxidil && has5Ar) {
      clinicalRationale = 'Combined topical Minoxidil and 5α-reductase inhibitors in vehicle (TrichoSol) frequently provoke epicutaneous lipid depletion, subclinical erythema, and cuticular micro-flaking. Colway Strengthening System utilizes native biologically active tropocollagen, micronized diosmin, and Baicapil™ 2% to preserve follicular Collagen XVII anchorage, calm the epidermal barrier, and optimize drug absorption.';
    } else if (hasMinoxidil) {
      clinicalRationale = 'Chronic topical Minoxidil application routinely induces scalp desquamation, localized pruritus, and barrier disruption. Colway Strengthening System delivers native tropocollagen and microcirculatory flavonoids (diosmin) to decongest the follicular ostium and preserve cutaneous balance between applications.';
    } else {
      clinicalRationale = 'Precision pharmacogenetic follicular therapies require an optimal peribulbar extracellular matrix. Colway biologically active collagen and plant flavonoids reinforce infundibular anchoring and cuticle elasticity, preventing topical vehicle intolerance.';
    }

    colwayRec = {
      brand: 'Colway Laboratories',
      productName: 'Colway Hair Strengthening System (2-Step Routine)',
      category: 'Scalp Barrier Integrity & Peribulbar ECM Preservation',
      regulatoryNotice: 'EU Reg. 1223/2009 Compliant · CPNP Registered',
      matchScore: '99% Topical Adjuvant Synergy',
      clinicalRationale,
      routineAdvice: 'Apply Colway Strengthening Shampoo 3–4 times weekly to purify follicular ostia prior to TrichoSol application. Follow with Colway Strengthening Conditioner on mid-lengths and ends to seal cuticular scales and lock in native moisture.',
      catalogSlug: 'colway-strengthening-shampoo',
      catalogUrl: '/p/colway-strengthening-shampoo'
    };
  }

  return {
    isTrichoTest,
    isOralRoute,
    hasTopicalScalp,
    detectedApis: detectedApisList.length > 0 ? detectedApisList : ['Personalized Compounded Formulation'],
    peptide: peptideRec,
    supplement: supplementRec,
    diagnostic: diagnosticRec,
    colway: colwayRec
  };
}

/**
 * Backward compatible alias for peptide match
 */
export function getPrescriptionLotuslandMatch(rx) {
  const recs = getPrescriptionAtlasRecommendations(rx);
  return recs.peptide;
}

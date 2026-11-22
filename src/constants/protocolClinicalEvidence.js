/**
 * protocolClinicalEvidence.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Evidence-Based Clinical Enrichment for `/proto` & `/proto/[slug]`.
 * Strictly separates Tier 1 Human RCTs (GLP-1/GIP, Tesamorelin) from
 * Tier 3/4 Consensus & Preclinical peptides (BPC-157, TB-500, Epitalon)
 * and provides curated PubMed citations, exclusion criteria, and lab windows.
 */

const EVIDENCE_PROFILES = [
  {
    id: 'retatrutide',
    match: /retatrutide|ly3437943/i,
    evidenceTier: 'Tier 2 - Clinical Trial',
    evidenceGradeLabel: 'Phase 2 RCT (Tier 2)',
    indicationScope: {
      primaryTier: 'Tier 2 (Phase 2 Obesity / MASLD RCT)',
      offLabelTier: 'Tier 3 (Metabolic Longevity)',
      note: 'Glucagon agonism accelerates energy expenditure; lean-mass safeguards are mandatory.',
    },
    citations: [
      { pmid: '37366315', title: 'Triple-Hormone-Receptor Agonist Retatrutide for Obesity — Phase 2 Trial', journal: 'NEJM', year: 2023 },
    ],
    contraindications: [
      'Personal/family history of Medullary Thyroid Carcinoma (MTC) or MEN-2',
      'History of acute or chronic pancreatitis',
      'Pregnancy, breastfeeding, or severe gastroparesis',
    ],
    biomarkers: ['HbA1c (W0, W12)', 'Fasting Insulin & HOMA-IR (W0, W12)', 'Lipase / Amylase (Baseline)', 'DEXA / BIA Lean Mass & Grip Strength (W0, W12)', 'ALT / AST & eGFR'],
    coInterventions: [
      'Protein Target: 1.2–1.6 g/kg/day (ideal/adjusted BW; 25–40 g/meal leucine threshold)',
      'Progressive Resistance Training: ≥ 2–3 structured sessions/week to prevent 25–40% lean mass loss',
      'Body Composition Tracking: Baseline & W12 DEXA or multi-frequency BIA (never rely on scale weight alone)',
    ],
    stoppingRules: [
      'Pause & evaluate immediately for suspected pancreatitis (lipase/amylase > 3× ULN or severe epigastric pain)',
      'Hold escalation if DEXA/BIA shows > 25% of weight loss from skeletal muscle without strength recovery',
      'De-escalate for persistent Grade ≥ 2 gastroparesis or resting HR elevation > 15 bpm',
    ],
    regulatoryPosture: {
      status: 'Investigational / Phase 3 (Non-FDA Approved)',
      coaRequired: true,
      coldChain: true,
      wadaProhibited: false,
      wadaNote: 'Monitor WADA metabolic modulator updates for competitive athletes.',
    },
    washoutGuidance: 'Gradual 4-week step titration; monitor GI tolerance and lean mass preservation (DEXA).',
  },
  {
    id: 'tirzepatide',
    match: /tirzepatide|glp-1.*gip|gip.*glp-1/i,
    evidenceTier: 'Tier 1 - Human RCT',
    evidenceGradeLabel: 'High Evidence (Tier 1 RCT)',
    indicationScope: {
      primaryTier: 'Tier 1 (FDA-Approved Obesity & T2DM)',
      offLabelTier: 'Tier 2–3 (Cardiometabolic Prevention)',
      note: 'Supported by SURMOUNT-1 / SURPASS-2 & T-REx resistance-training co-intervention data.',
    },
    citations: [
      { pmid: '35658024', title: 'Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1)', journal: 'NEJM', year: 2022 },
      { pmid: '34170647', title: 'Tirzepatide versus Semaglutide Once Weekly in Type 2 Diabetes (SURPASS-2)', journal: 'NEJM', year: 2021 },
    ],
    contraindications: [
      'Personal/family history of Medullary Thyroid Carcinoma (MTC) or MEN-2',
      'History of pancreatitis or hypersensitivity to tirzepatide',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['HbA1c & Fasting Glucose (W0, W12)', 'Fasting Insulin / HOMA-IR', 'DEXA / BIA Fat-Free Mass & Grip Strength (W0, W12)', 'Lipid Panel, hs-CRP & eGFR'],
    coInterventions: [
      'Protein Target: 1.2–1.6 g/kg/day (25–40 g high-quality protein per meal; use clear isolates if early satiety limits intake)',
      'Progressive Resistance Training: 2–3 sessions/week (T-REx protocol standard to preserve/increase strength)',
      'Hydration & Electrolytes: ≥ 2.5 L/day to protect eGFR during rapid caloric deficit',
    ],
    stoppingRules: [
      'Discontinue immediately on clinical/biochemical signs of acute pancreatitis (lipase/amylase > 3× ULN)',
      'Pause dose escalation if lean mass accounts for > 25–30% of weight lost on follow-up DEXA/BIA',
      'Hold/reduce dose for intractable vomiting, dehydration, or worsening diabetic retinopathy',
    ],
    regulatoryPosture: {
      status: 'FDA-Approved Molecule (Compounded variants subject to 503A/503B rules)',
      coaRequired: true,
      coldChain: true,
      wadaProhibited: false,
      wadaNote: 'Not WADA-prohibited; verify local compounding compliance.',
    },
    washoutGuidance: '4-week titration steps (2.5 mg → 5 mg → 7.5+ mg) to minimize GI adverse events.',
  },
  {
    id: 'semaglutide',
    match: /semaglutide/i,
    evidenceTier: 'Tier 1 - Human RCT',
    evidenceGradeLabel: 'High Evidence (Tier 1 RCT)',
    indicationScope: {
      primaryTier: 'Tier 1 (FDA-Approved Obesity, T2DM & MACE Reduction)',
      offLabelTier: 'Tier 2 (Visceral Adiposity / Cardiometabolic)',
      note: 'High-quality weight loss requires pairing with resistance training and protein pacing.',
    },
    citations: [
      { pmid: '33567185', title: 'Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1)', journal: 'NEJM', year: 2021 },
    ],
    contraindications: [
      'Personal/family history of Medullary Thyroid Carcinoma (MTC) or MEN-2',
      'History of pancreatitis or diabetic retinopathy complications',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['HbA1c (W0, W12)', 'Fasting Glucose & Insulin', 'DEXA / BIA Lean Mass (W0, W12)', 'Lipid Panel & eGFR'],
    coInterventions: [
      'Protein Target: 1.2–1.6 g/kg/day (25–40 g/meal)',
      'Progressive Resistance Training: ≥ 2–3 sessions/week targeting major muscle groups',
      'Body Composition Tracking: DEXA or BIA at W0 & W12',
    ],
    stoppingRules: [
      'Discontinue for acute pancreatitis, severe gastroparesis, or acute kidney injury from dehydration',
      'Pause escalation if lean-tissue loss accelerates or severe fatigue/anorexia develops',
    ],
    regulatoryPosture: {
      status: 'FDA-Approved Molecule (Compounded variants subject to 503A/503B rules)',
      coaRequired: true,
      coldChain: true,
      wadaProhibited: false,
      wadaNote: 'Permitted under WADA rules; verify compounding pharmacy CoA.',
    },
    washoutGuidance: '4-week step-up titration (0.25 mg → 0.5 mg → 1.0 mg).',
  },
  {
    id: 'tesamorelin',
    match: /tesamorelin/i,
    evidenceTier: 'Tier 1 - Human RCT',
    evidenceGradeLabel: 'High Evidence (Tier 1 RCT)',
    indicationScope: {
      primaryTier: 'Tier 1 (Visceral Adipose Tissue Reduction)',
      offLabelTier: 'Tier 3 (Body Recomposition / Longevity)',
      note: 'Tier 1 RCT evidence applies to visceral adiposity; off-label longevity stacks remain Tier 3.',
    },
    citations: [
      { pmid: '20647205', title: 'Effects of Tesamorelin on Visceral Adipose Tissue & Metabolic Markers', journal: 'NEJM', year: 2010 },
    ],
    contraindications: [
      'Active malignancy or history of pituitary/hypothalamic tumor',
      'Elevated baseline IGF-1 above age-adjusted upper limit',
      'Pregnancy or uncontrolled proliferative diabetic retinopathy',
    ],
    biomarkers: ['IGF-1 Z-Score (W0, W6, W12)', 'Fasting Glucose & HbA1c', 'Visceral Adipose / Waist Circumference'],
    coInterventions: [
      'Combine with Zone 2 aerobic + resistance training to maximize visceral lipid mobilization',
    ],
    stoppingRules: [
      'Stop or reduce dose if IGF-1 exceeds age-adjusted upper-normal quartile (Z-score > +2.0)',
      'Discontinue for worsening fasting glucose/HbA1c, persistent arthralgia, or carpal tunnel symptoms',
    ],
    regulatoryPosture: {
      status: 'FDA-Approved Molecule (Egrifta® VAT indication; off-label in longevity)',
      coaRequired: true,
      coldChain: true,
      wadaProhibited: true,
      wadaNote: 'WADA Prohibited (S2 Peptide Hormones / GHRH Analogue).',
    },
    washoutGuidance: 'Cycle 12 weeks ON / 4 weeks OFF; keep IGF-1 within physiological upper-normal quartile.',
  },
  {
    id: 'gh-axis',
    match: /cjc|ipamorelin|sermorelin|ghrp/i,
    evidenceTier: 'Tier 2 - Clinical Trial',
    evidenceGradeLabel: 'Clinical Data (Tier 2)',
    indicationScope: {
      primaryTier: 'Tier 2 (GH/IGF-1 Axis Secretion)',
      offLabelTier: 'Tier 3 (Combined CJC-1295 + Ipamorelin Stacks)',
      note: 'Individual PK/PD trials exist; fixed-dose combinations lack large multi-year RCTs.',
    },
    citations: [
      { pmid: '16571593', title: 'Pulsatile GH & IGF-1 Elevation Following CJC-1295 Administration', journal: 'JCEM', year: 2006 },
    ],
    contraindications: [
      'Active malignancy or unexplained elevated IGF-1',
      'Uncontrolled diabetes mellitus or severe carpal tunnel symptoms',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['IGF-1 Serum Level (W0, W6, W12)', 'Fasting Glucose & Insulin', 'HbA1c'],
    coInterventions: [
      'Administer fasted (≥ 2h post-meal) at bedtime to align with physiological nocturnal GH pulsatility',
    ],
    stoppingRules: [
      'Hold/stop if IGF-1 rises above age-adjusted upper-normal quartile at W6',
      'Discontinue if peripheral edema, carpal tunnel paresthesia, or fasting hyperglycemia emerges',
    ],
    regulatoryPosture: {
      status: 'Compounded / FDA Category 2 Scrutiny (Jurisdiction-dependent)',
      coaRequired: true,
      coldChain: true,
      wadaProhibited: true,
      wadaNote: 'WADA Prohibited (S2 Growth Hormone Secretagogues).',
    },
    washoutGuidance: '5 days ON / 2 days OFF or 8–12 weeks ON / 4 weeks OFF to prevent somatotroph desensitization.',
  },
  {
    id: 'mitochondrial',
    match: /nad|ss-31|elamipretide|mots-c|motsc/i,
    evidenceTier: 'Tier 2 - Clinical Trial',
    evidenceGradeLabel: 'Translational / Clinical (Tier 2)',
    indicationScope: {
      primaryTier: 'Tier 2 (Elamipretide Mitochondrial Myopathy / Cellular Redox)',
      offLabelTier: 'Tier 3 (Sequenced Longevity Protocols)',
      note: 'Clinical advisory consensus mandates Repair → Optimize → Fuel sequencing rather than simultaneous stacking.',
    },
    citations: [
      { pmid: '32409585', title: 'Elamipretide (SS-31) in Mitochondrial Myopathy (MMPOWER/TAZPOWER)', journal: 'Genet Med', year: 2020 },
      { pmid: '25738459', title: 'MOTS-c Regulates Insulin Sensitivity and Metabolic Homeostasis via AMPK', journal: 'Cell Metab', year: 2015 },
    ],
    contraindications: [
      'Severe renal impairment (verify clearance)',
      'Active acute infection or hemodynamic instability',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['Fasting Lactate / Pyruvate', 'hs-CRP & Fasting Glucose', 'CBC & Comprehensive Metabolic Panel (W0, W8)', 'Epigenetic Clock / DunedinPACE (Annual Optional)'],
    sequencingPhases: [
      'Phase 1 — Structural Repair: SS-31 (Elamipretide) to stabilize inner mitochondrial cardiolipin & reduce ROS',
      'Phase 2 — Metabolic Optimization: MOTS-c (exercise mimetic / AMPK activation) after membrane stabilization',
      'Phase 3 — Cellular Fuel: NAD+ replenishment once mitochondrial electron flux can process load safely',
    ],
    stoppingRules: [
      'Suspend NAD+ / MOTS-c if patient experiences paradoxical fatigue ("mitochondrial crash") or lactate elevation; revert to Phase 1 SS-31',
      'Discontinue for acute flushing/hypotension (IV NAD+) or unexplained eGFR decline',
    ],
    regulatoryPosture: {
      status: 'Investigational / Compounded (Strict Cold-Chain & Purity CoA Required)',
      coaRequired: true,
      coldChain: true,
      wadaProhibited: false,
      wadaNote: 'MOTS-c & metabolic modulators may face sporting federation scrutiny; verify athlete status.',
    },
    washoutGuidance: 'Follow Repair → Optimize → Fuel sequence over 8–12 weeks with W0/W8 biomarker re-assessment.',
  },
  {
    id: 'immune',
    match: /thymosin.*alpha|ta-1|ta1|ll-37/i,
    evidenceTier: 'Tier 2 - Clinical Trial',
    evidenceGradeLabel: 'Clinical Immunology (Tier 2)',
    indicationScope: {
      primaryTier: 'Tier 2 (Viral / Immunomodulatory Clinical Studies)',
      offLabelTier: 'Tier 3 (Longevity Immunosenescence)',
      note: 'Requires autoimmune flare screening and lymphocyte subset monitoring.',
    },
    citations: [
      { pmid: '23426829', title: 'Thymosin Alpha-1 Immunomodulatory Mechanisms & Clinical Applications', journal: 'Ann N Y Acad Sci', year: 2012 },
    ],
    contraindications: [
      'Organ transplant recipients on active calcineurin/immunosuppressive therapy',
      'Active uncontrolled autoimmune flare without specialist oversight',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['CBC with Differential & Lymphocyte Subsets', 'hs-CRP & ESR (W0, W4, W8)', 'Hepatic Panel (ALT/AST)'],
    stoppingRules: [
      'Discontinue immediately if autoimmune flare, unexplained fever, or ALT/AST > 2× ULN occurs',
      'Re-evaluate at Week 4–6; stop if inflammatory markers (hs-CRP/ESR) worsen',
    ],
    regulatoryPosture: {
      status: 'Approved ex-US (Zadaxin®) / Compounded under FDA Category 2 review in US',
      coaRequired: true,
      coldChain: true,
      wadaProhibited: false,
      wadaNote: 'Not on WADA prohibited list; confirm purity & endotoxin CoA.',
    },
    washoutGuidance: '4–8 week immunomodulatory course with inflammatory marker re-evaluation.',
  },
  {
    id: 'repair',
    match: /bpc-157|bpc157|tb-500|tb500|kpv|ghk/i,
    evidenceTier: 'Tier 4 - Preclinical / Mechanistic',
    evidenceGradeLabel: 'Emerging / Preclinical (Tier 4)',
    indicationScope: {
      primaryTier: 'Tier 4 (Preclinical / Mechanistic Tissue Repair)',
      offLabelTier: 'Tier 4 (Clinical Practice Consensus)',
      note: 'Robust human RCTs are lacking; strictly requires verified single-API CoA and malignancy screening.',
    },
    citations: [
      { pmid: '29596566', title: 'Stable Gastric Pentadecapeptide BPC 157 in Tissue & Tendon Healing Pathways', journal: 'Curr Pharm Des', year: 2018 },
    ],
    contraindications: [
      'Active malignancy (due to VEGF/angiogenic signaling pathway)',
      'Active proliferative retinopathy',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['hs-CRP & ESR (W0, W6)', 'CBC & Comprehensive Metabolic Panel', 'Functional Joint / Pain Score (VAS/WOMAC)'],
    stoppingRules: [
      'Mandatory W4–W6 objective re-evaluation: discontinue if no measurable improvement in VAS pain or functional mobility',
      'Stop immediately if new suspicious vascular/neoplastic lesion or retinopathy symptom appears',
    ],
    regulatoryPosture: {
      status: 'Non-FDA Approved / Category 2 Enforcement Discretion Gray Zone',
      coaRequired: true,
      coldChain: true,
      wadaProhibited: true,
      wadaNote: 'WADA Prohibited (S0 Non-Approved Substances — BPC-157 & TB-500 explicitly banned).',
    },
    washoutGuidance: '4–8 week targeted repair course followed by 4-week washout.',
  },
  {
    id: 'longevity-epigenetic',
    match: /epitalon|epithalon|selank|semax/i,
    evidenceTier: 'Tier 3 - Clinical Consensus',
    evidenceGradeLabel: 'Observational / Consensus (Tier 3)',
    indicationScope: {
      primaryTier: 'Tier 3 (Observational Longevity / Neuro-Cognitive Consensus)',
      offLabelTier: 'Tier 3 (Periodic Epigenetic Pulse)',
      note: 'Administered as short discrete pulse courses rather than continuous daily dosing.',
    },
    citations: [
      { pmid: '12937682', title: 'Epitalon Peptide Induction of Telomerase Activity in Human Somatic Cells', journal: 'Bull Exp Biol Med', year: 2003 },
    ],
    contraindications: [
      'Active malignancy',
      'Severe hepatic/renal insufficiency',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['CBC & Metabolic Panel', 'Circadian Sleep Quality / Melatonin Profile', 'Epigenetic Clock / Telomere Length (Annual Optional)'],
    stoppingRules: [
      'Do not exceed 20 consecutive days per pulse; enforce ≥ 4–6 month washout between courses',
      'Discontinue for persistent insomnia, paradoxical agitation, or abnormal CBC/CMP changes',
    ],
    regulatoryPosture: {
      status: 'Investigational / Compounded (Strict Cold-Chain Stability Required)',
      coaRequired: true,
      coldChain: true,
      wadaProhibited: false,
      wadaNote: 'Verify sports-federation rules for Selank/Semax in tested athletes.',
    },
    washoutGuidance: '10–20 day periodic pulse cycle repeated every 6 months.',
  },
];

export function resolveProtocolClinicalEvidence(proto = {}) {
  const corpus = [
    proto.slug,
    proto.cleanSlug,
    proto.protocol_slug,
    proto.name,
    proto.cleanName,
    proto.title,
    ...(Array.isArray(proto.peptides) ? proto.peptides : []),
    ...(Array.isArray(proto.compounds) ? proto.compounds.map((c) => c?.name || c?.slug || c) : []),
    ...(Array.isArray(proto.bom) ? proto.bom.map((b) => b?.name || b?.productName || b?.sku) : []),
  ]
    .filter(Boolean)
    .join(' ');

  const matched = EVIDENCE_PROFILES.find((p) => p.match.test(corpus));
  if (matched) {
    return matched;
  }

  return {
    id: 'clinical-consensus',
    evidenceTier: 'Tier 3 - Clinical Consensus',
    evidenceGradeLabel: 'Clinical Consensus (Tier 3)',
    indicationScope: {
      primaryTier: 'Tier 3 (Clinical Advisory Consensus)',
      offLabelTier: 'Tier 3 (Physician-Supervised Protocol)',
      note: 'Individualized physician oversight and verified single-API CoA required.',
    },
    citations: [],
    contraindications: [
      'Known hypersensitivity to any formulation excipient',
      'Active malignancy or uncontrolled systemic illness',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['CBC & Comprehensive Metabolic Panel (W0, W8)', 'hs-CRP'],
    stoppingRules: [
      'Discontinue for unexpected hypersensitivity, systemic adverse reaction, or clinically significant lab shift at W8',
    ],
    regulatoryPosture: {
      status: 'Physician-Supervised Compounded / Clinical Protocol',
      coaRequired: true,
      coldChain: true,
      wadaProhibited: false,
      wadaNote: 'Verify athlete anti-doping status prior to prescribing.',
    },
    washoutGuidance: 'Physician-supervised cycle with Week 0 and Week 8 laboratory review.',
  };
}

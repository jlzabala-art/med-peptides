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
    citations: [
      { pmid: '37366315', title: 'Triple-Hormone-Receptor Agonist Retatrutide for Obesity — Phase 2 Trial', journal: 'NEJM', year: 2023 },
    ],
    contraindications: [
      'Personal/family history of Medullary Thyroid Carcinoma (MTC) or MEN-2',
      'History of acute or chronic pancreatitis',
      'Pregnancy, breastfeeding, or severe gastroparesis',
    ],
    biomarkers: ['HbA1c (W0, W12)', 'Fasting Insulin & HOMA-IR (W0, W12)', 'Lipase / Amylase (Baseline)', 'ALT / AST & Lipid Panel', 'eGFR / Creatinine'],
    washoutGuidance: 'Gradual 4-week step titration; monitor GI tolerance and lean mass preservation (DEXA).',
  },
  {
    id: 'tirzepatide',
    match: /tirzepatide|glp-1.*gip|gip.*glp-1/i,
    evidenceTier: 'Tier 1 - Human RCT',
    evidenceGradeLabel: 'High Evidence (Tier 1 RCT)',
    citations: [
      { pmid: '35658024', title: 'Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1)', journal: 'NEJM', year: 2022 },
      { pmid: '34170647', title: 'Tirzepatide versus Semaglutide Once Weekly in Type 2 Diabetes (SURPASS-2)', journal: 'NEJM', year: 2021 },
    ],
    contraindications: [
      'Personal/family history of Medullary Thyroid Carcinoma (MTC) or MEN-2',
      'History of pancreatitis or hypersensitivity to tirzepatide',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['HbA1c & Fasting Glucose (W0, W12)', 'Fasting Insulin / HOMA-IR', 'Lipid Panel & hs-CRP', 'eGFR & Liver Enzymes'],
    washoutGuidance: '4-week titration steps (2.5 mg → 5 mg → 7.5+ mg) to minimize GI adverse events.',
  },
  {
    id: 'semaglutide',
    match: /semaglutide/i,
    evidenceTier: 'Tier 1 - Human RCT',
    evidenceGradeLabel: 'High Evidence (Tier 1 RCT)',
    citations: [
      { pmid: '33567185', title: 'Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1)', journal: 'NEJM', year: 2021 },
    ],
    contraindications: [
      'Personal/family history of Medullary Thyroid Carcinoma (MTC) or MEN-2',
      'History of pancreatitis or diabetic retinopathy complications',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['HbA1c (W0, W12)', 'Fasting Glucose & Insulin', 'Lipid Panel', 'eGFR'],
    washoutGuidance: '4-week step-up titration (0.25 mg → 0.5 mg → 1.0 mg).',
  },
  {
    id: 'tesamorelin',
    match: /tesamorelin/i,
    evidenceTier: 'Tier 1 - Human RCT',
    evidenceGradeLabel: 'High Evidence (Tier 1 RCT)',
    citations: [
      { pmid: '20647205', title: 'Effects of Tesamorelin on Visceral Adipose Tissue & Metabolic Markers', journal: 'NEJM', year: 2010 },
    ],
    contraindications: [
      'Active malignancy or history of pituitary/hypothalamic tumor',
      'Elevated baseline IGF-1 above age-adjusted upper limit',
      'Pregnancy or uncontrolled proliferative diabetic retinopathy',
    ],
    biomarkers: ['IGF-1 Z-Score (W0, W6, W12)', 'Fasting Glucose & HbA1c', 'Visceral Adipose / Waist Circumference'],
    washoutGuidance: 'Cycle 12 weeks ON / 4 weeks OFF; keep IGF-1 within physiological upper-normal quartile.',
  },
  {
    id: 'gh-axis',
    match: /cjc|ipamorelin|sermorelin|ghrp/i,
    evidenceTier: 'Tier 2 - Clinical Trial',
    evidenceGradeLabel: 'Clinical Data (Tier 2)',
    citations: [
      { pmid: '16571593', title: 'Pulsatile GH & IGF-1 Elevation Following CJC-1295 Administration', journal: 'JCEM', year: 2006 },
    ],
    contraindications: [
      'Active malignancy or unexplained elevated IGF-1',
      'Uncontrolled diabetes mellitus or severe carpal tunnel symptoms',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['IGF-1 Serum Level (W0, W6, W12)', 'Fasting Glucose & Insulin', 'HbA1c'],
    washoutGuidance: '5 days ON / 2 days OFF or 8–12 weeks ON / 4 weeks OFF to prevent somatotroph desensitization.',
  },
  {
    id: 'mitochondrial',
    match: /nad|ss-31|elamipretide|mots-c|motsc/i,
    evidenceTier: 'Tier 2 - Clinical Trial',
    evidenceGradeLabel: 'Translational / Clinical (Tier 2)',
    citations: [
      { pmid: '32409585', title: 'Elamipretide (SS-31) in Mitochondrial Myopathy (MMPOWER/TAZPOWER)', journal: 'Genet Med', year: 2020 },
      { pmid: '25738459', title: 'MOTS-c Regulates Insulin Sensitivity and Metabolic Homeostasis via AMPK', journal: 'Cell Metab', year: 2015 },
    ],
    contraindications: [
      'Severe renal impairment (verify clearance)',
      'Active acute infection or hemodynamic instability',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['Fasting Lactate / Pyruvate', 'hs-CRP & Fasting Glucose', 'CBC & Comprehensive Metabolic Panel (W0, W8)'],
    washoutGuidance: '8-week metabolic cycle followed by biomarker re-assessment.',
  },
  {
    id: 'immune',
    match: /thymosin.*alpha|ta-1|ta1|ll-37/i,
    evidenceTier: 'Tier 2 - Clinical Trial',
    evidenceGradeLabel: 'Clinical Immunology (Tier 2)',
    citations: [
      { pmid: '23426829', title: 'Thymosin Alpha-1 Immunomodulatory Mechanisms & Clinical Applications', journal: 'Ann N Y Acad Sci', year: 2012 },
    ],
    contraindications: [
      'Organ transplant recipients on active calcineurin/immunosuppressive therapy',
      'Active uncontrolled autoimmune flare without specialist oversight',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['CBC with Differential & Lymphocyte Subsets', 'hs-CRP & ESR (W0, W4, W8)', 'Hepatic Panel (ALT/AST)'],
    washoutGuidance: '4–8 week immunomodulatory course with inflammatory marker re-evaluation.',
  },
  {
    id: 'repair',
    match: /bpc-157|bpc157|tb-500|tb500|kpv|ghk/i,
    evidenceTier: 'Tier 4 - Preclinical / Mechanistic',
    evidenceGradeLabel: 'Emerging / Preclinical (Tier 4)',
    citations: [
      { pmid: '29596566', title: 'Stable Gastric Pentadecapeptide BPC 157 in Tissue & Tendon Healing Pathways', journal: 'Curr Pharm Des', year: 2018 },
    ],
    contraindications: [
      'Active malignancy (due to VEGF/angiogenic signaling pathway)',
      'Active proliferative retinopathy',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['hs-CRP & ESR (W0, W6)', 'CBC & Comprehensive Metabolic Panel', 'Functional Joint / Pain Score'],
    washoutGuidance: '4–8 week targeted repair course followed by 4-week washout.',
  },
  {
    id: 'longevity-epigenetic',
    match: /epitalon|epithalon|selank|semax/i,
    evidenceTier: 'Tier 3 - Clinical Consensus',
    evidenceGradeLabel: 'Observational / Consensus (Tier 3)',
    citations: [
      { pmid: '12937682', title: 'Epitalon Peptide Induction of Telomerase Activity in Human Somatic Cells', journal: 'Bull Exp Biol Med', year: 2003 },
    ],
    contraindications: [
      'Active malignancy',
      'Severe hepatic/renal insufficiency',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['CBC & Metabolic Panel', 'Circadian Sleep Quality / Melatonin Profile', 'Telomere / Epigenetic Clock (Optional)'],
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
    citations: [],
    contraindications: [
      'Known hypersensitivity to any formulation excipient',
      'Active malignancy or uncontrolled systemic illness',
      'Pregnancy or breastfeeding',
    ],
    biomarkers: ['CBC & Comprehensive Metabolic Panel (W0, W8)', 'hs-CRP'],
    washoutGuidance: 'Physician-supervised cycle with Week 0 and Week 8 laboratory review.',
  };
}

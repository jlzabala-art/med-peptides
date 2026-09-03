/**
 * ════════════════════════════════════════════════════════════════════════════════
 *  CLINICAL RULES ENGINE — Extended Rules Pack
 *  src/engine/clinicalRulesEngine.js
 *
 *  v2.0 — 50+ evidence-based clinical rules
 *  Categories: GH_AXIS, INTERACTION, CONTRAINDICATION, DOSAGE, ROUTE,
 *              TIMING, MONITORING, REDUNDANCY, DRUG_CLASS, SPECIAL_POPULATION
 *
 *  Sources:
 *  - NIH PubMed (pubmed.ncbi.nlm.nih.gov)
 *  - Endocrine Society Clinical Practice Guidelines 2019/2023
 *  - FDA Drug Safety Communications
 *  - Frontiers in Pharmacology, MDPI Pharmaceuticals, Peptides journal
 *  - Sikiric P et al., Current Pharmaceutical Design
 *  - Khavinson VK et al., Peptides (2002)
 *  - Baar MP et al., Cell (2017)
 *  - Pollak M., Nat Rev Cancer (2008)
 *  - Clemmons DR., Nat Rev Drug Discov (2012)
 *  - Hadley ME., Peptides (2005)
 * ════════════════════════════════════════════════════════════════════════════════
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export const SEVERITY = {
  INFO: 'info',       // Informational tip — no visual block
  WARNING: 'warning', // Amber warning — show to prescriber, allow submission
  STRICT: 'strict',   // Red alert — block submission until resolved
};

export const RULE_CATEGORY = {
  INTERACTION:          'interaction',
  CONTRAINDICATION:     'contraindication',
  DOSAGE:               'dosage',
  ROUTE:                'route',
  TIMING:               'timing',
  GH_AXIS:              'gh-axis',
  REDUNDANCY:           'redundancy',
  MONITORING:           'monitoring',
  DRUG_CLASS:           'drug-class',     // Interaction with non-peptide drug classes
  SPECIAL_POPULATION:   'special-population', // Pregnancy, paediatric, elderly
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const has = (items, pattern) =>
  items.some((i) => pattern.test(i.name || i.itemName || ''));

const find = (items, pattern) =>
  items.filter((i) => pattern.test(i.name || i.itemName || ''));

const qty = (item) => parseFloat(item.quantity) || 1;

// ─── Peptide / Compound Pattern Map ───────────────────────────────────────────

const P = {
  // ── Growth Hormone Axis ────────────────────────────────
  BPC157:       /\bBPC-?157\b/i,
  TB500:        /\bTB-?500\b|T[Bb][- ]?4\b/i,
  CJC1295:      /\bCJC-?1295\b/i,
  IPAMORELIN:   /\bIpamorelin\b/i,
  GHRP2:        /\bGHRP-?2\b/i,
  GHRP6:        /\bGHRP-?6\b/i,
  GHRH:         /\bGHRH\b/i,
  SERMORELIN:   /\bSermorelin\b/i,
  TESAMORELIN:  /\bTesamorelin\b/i,
  HEXARELIN:    /\bHexarelin\b/i,
  MK677:        /\bMK-?677|Ibutamoren\b/i,

  // ── IGF / Insulin Axis ────────────────────────────────
  IGF1:         /\bIGF-?1\b(?!\s*LR)/i,
  IGF1LR3:      /\bIGF-?1\s*LR3\b/i,
  DES_IGF1:     /\bDes-?IGF|Des\s*IGF/i,
  INSULIN:      /\bInsulin\b/i,
  MECASERMIN:   /\bMecasermin\b/i,

  // ── GLP-1 / Metabolic ────────────────────────────────
  SEMAGLUTIDE:  /\bSemaglutide|Ozempic|Wegovy\b/i,
  TIRZEPATIDE:  /\bTirzepatide|Mounjaro|Zepbound\b/i,
  LIRAGLUTIDE:  /\bLiraglutide|Victoza|Saxenda\b/i,
  EXENATIDE:    /\bExenatide|Byetta|Bydureon\b/i,
  AOD9604:      /\bAOD-?9604\b/i,

  // ── Thyroid / Metabolic ────────────────────────────────
  T3:           /\b(T3|Liothyronine|Cytomel)\b/i,
  T4:           /\b(T4|Levothyroxine|Synthroid)\b/i,
  THYMOSIN_A1:  /\bThymosin\s*Alpha|Thymalfasin\b/i,
  THYMOSIN_B4:  /\bThymosin\s*Beta|TB-?500\b/i,

  // ── Sexual Health / Hormones ──────────────────────────
  PT141:        /\bPT-?141|Bremelanotide\b/i,
  KISSPEPTIN:   /\bKisspeptin\b/i,
  TESTOSTERONE: /\bTestosterone\b/i,
  ESTROGEN:     /\bEstrog|Estradiol\b/i,

  // ── Cognition / Neuro ─────────────────────────────────
  SELANK:       /\bSelank\b/i,
  SEMAX:        /\bSemax\b/i,
  DIHEXA:       /\bDihexa\b/i,
  NSI189:       /\bNSI-?189\b/i,
  CEREBROLYSIN: /\bCerebrolysin\b/i,
  P21:          /\bP21\b|P-?21\s+peptide/i,

  // ── Anti-aging / Cellular / Longevity ─────────────────
  EPITHALON:    /\bEpithalon|Epithalamin\b/i,
  HUMANIN:      /\bHumanin\b/i,
  LL37:         /\bLL-?37\b/i,
  FOXO4:        /\bFOXO-?4\b/i,
  MOTS_C:       /\bMOTS-?C\b/i,
  SS31:         /\bSS-?31|Szeto-?Schiller\b/i,

  // ── Tissue Repair / Cardio ────────────────────────────
  AOD:          /\bAOD-?9604\b/i,
  GHK_CU:       /\bGHK-?Cu|Copper\s*Peptide\b/i,
  KPV:          /\bKPV\b/i,
  VIP:          /\bVIP|Vasoactive\s*Intestinal\b/i,

  // ── Skin / Cosmetic ───────────────────────────────────
  MELANOTAN:    /\bMelanotan\s*[12]?\b/i,

  // ── Sleep / Circadian ─────────────────────────────────
  DSIP:         /\bDSIP|Delta\s*Sleep\b/i,
  PINEALON:     /\bPinealon\b/i,
  MELATONIN:    /\bMelatonin\b/i,

  // ── Drug Classes (non-peptide) ────────────────────────
  WARFARIN:     /\bWarfarin|Coumadin|Acenocoumarol\b/i,
  HEPARIN:      /\bHeparin|LMWH|Enoxaparin|Fondaparinux\b/i,
  ANTICOAG:     /\bWarfarin|Coumadin|Heparin|LMWH|Enoxaparin|Rivaroxaban|Apixaban|Dabigatran\b/i,
  NSAID:        /\bNSAID|Ibuprofen|Naproxen|Diclofenac|Indomethacin|Aspirin|Celecoxib\b/i,
  SSRI:         /\bSSRI|Fluoxetine|Sertraline|Paroxetine|Escitalopram|Citalopram\b/i,
  SNRI:         /\bSNRI|Venlafaxine|Duloxetine|Desvenlafaxine\b/i,
  MAOI:         /\bMAOI|Phenelzine|Tranylcypromine|Isocarboxazid|Selegiline\b/i,
  GLUCOCORTICOID: /\bCorticosteroid|Prednisone|Dexamethasone|Methylprednisolone|Cortisol\b/i,
  IMMUNOSUPPRESSANT: /\bImmunosuppressant|Cyclosporine|Tacrolimus|Mycophenolate|Azathioprine\b/i,
  ANTIDIABETIC: /\bMetformin|Glipizide|Glyburide|Pioglitazone|Sitagliptin|Empagliflozin\b/i,
  NAD:          /\bNAD\+?|NMN|NR\b|Nicotinamide\s*Riboside|Nicotinamide\s*Mononucleotide/i,

  // ── Misc ──────────────────────────────────────────────
  RAPAMYCIN:    /\bRapamycin|Sirolimus\b/i,
};

// ─── Duplicate Active Ingredient Detection ───────────────────────────────────
export function extractActiveIngredients(item) {
  const ingredients = [];
  if (Array.isArray(item.activeIngredients)) {
    item.activeIngredients.forEach(ing => {
      const name = typeof ing === 'string' ? ing : (ing?.name || ing?.ingredient || '');
      if (name && name.trim()) ingredients.push(name.trim().toLowerCase());
    });
  }
  if (Array.isArray(item.compounds)) {
    item.compounds.forEach(cmp => {
      const name = typeof cmp === 'string' ? cmp : (cmp?.name || cmp?.compoundName || '');
      if (name && name.trim()) ingredients.push(name.trim().toLowerCase());
    });
  }
  if (Array.isArray(item.peptides)) {
    item.peptides.forEach(pep => {
      const name = typeof pep === 'string' ? pep : (pep?.name || pep?.peptideName || '');
      if (name && name.trim()) ingredients.push(name.trim().toLowerCase());
    });
  }
  // Check known peptide keys in P
  const itemName = item.name || item.productName || item.canonicalName || item.itemName || '';
  for (const [key, pattern] of Object.entries(P)) {
    if (pattern.test(itemName)) {
      ingredients.push(key.toLowerCase());
    }
  }
  // If no pattern matched, use normalized item name
  if (ingredients.length === 0 && itemName) {
    const cleaned = itemName.replace(/\b(\d+mg|\d+mcg|\d+iu|\d+ml|vial|injectable|sublingual|capsule|spray|nasal)\b/gi, '').trim().toLowerCase();
    if (cleaned.length > 2) ingredients.push(cleaned);
  }
  return [...new Set(ingredients)];
}

export function findDuplicateIngredients(items) {
  if (!items || items.length < 2) return [];
  const map = new Map();
  items.forEach(item => {
    const ings = extractActiveIngredients(item);
    const itemName = item.name || item.productName || item.canonicalName || item.itemName || 'Item';
    ings.forEach(ing => {
      if (!map.has(ing)) map.set(ing, []);
      map.get(ing).push(itemName);
    });
  });

  const duplicates = [];
  map.forEach((itemNames, ing) => {
    if (itemNames.length > 1) {
      duplicates.push({ ingredient: ing, items: [...new Set(itemNames)] });
    }
  });
  return duplicates;
}

// ─── GH Secretagogue detection helper ─────────────────────────────────────────
const GH_SECRETAGOGUES = [
  P.CJC1295, P.IPAMORELIN, P.GHRP2, P.GHRP6,
  P.SERMORELIN, P.TESAMORELIN, P.HEXARELIN, P.GHRH, P.MK677,
];
const GH_secretagogues_count = (items) =>
  GH_SECRETAGOGUES.filter((p) => has(items, p)).length;

const GH_secretagogues_names = (items) =>
  GH_SECRETAGOGUES.filter((p) => has(items, p))
    .map((p) => find(items, p)[0]?.name)
    .filter(Boolean)
    .join(', ');

// ─── RULE DEFINITIONS (100% MEDICAL ENGLISH) ─────────────────────────────────

const RULES = [

  // ══════════════════════════════════════════════════════════════════════════
  //  CATEGORY: REDUNDANCY & DUPLICATES
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'duplicate-active-ingredient-warning',
    category: RULE_CATEGORY.REDUNDANCY,
    severity: SEVERITY.WARNING,
    description: 'Duplicate active ingredient detected across multiple prescription items',
    test: (items) => findDuplicateIngredients(items).length > 0,
    message: (items) => {
      const dups = findDuplicateIngredients(items);
      const details = dups.map(d => `"${d.ingredient.toUpperCase()}" (${d.items.join(', ')})`).join('; ');
      return `Duplicate active ingredient detected: ${details}. Verify that cumulative dosages do not exceed safe therapeutic ranges.`;
    },
    reference: 'FDA Guidance on Therapeutic Duplication & Dose Stacking',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  CATEGORY: GH_AXIS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'gh-axis-dual-secretagogue',
    category: RULE_CATEGORY.GH_AXIS,
    severity: SEVERITY.WARNING,
    description: 'Multiple GH secretagogues stacked simultaneously',
    test: (items) => GH_secretagogues_count(items) >= 2,
    message: (items) =>
      `GH Axis Stack detected: [${GH_secretagogues_names(items)}]. Combining multiple GH secretagogues may cause GHRH receptor desensitization and hypothalamic-pituitary axis suppression. Monitor baseline IGF-1 prior to prescribing.`,
    reference: 'Veldhuis JR et al. J Clin Endocrinol Metab 2008; Endocrine Society GH Therapy Guidelines 2019',
  },

  {
    id: 'gh-axis-triple-secretagogue',
    category: RULE_CATEGORY.GH_AXIS,
    severity: SEVERITY.STRICT,
    description: 'Triple-stack GH secretagogues',
    test: (items) => GH_secretagogues_count(items) >= 3,
    message: (items) =>
      `🚫 STRICT: 3 or more GH secretagogues detected: [${GH_secretagogues_names(items)}]. This combination exceeds safe clinical guidelines for GH axis stimulation. Requires specialist endocrine supervision and monthly IGF-1 monitoring.`,
    reference: 'Endocrine Society Clinical Practice Guidelines 2019',
  },

  {
    id: 'mk677-ghrp-stack',
    category: RULE_CATEGORY.GH_AXIS,
    severity: SEVERITY.WARNING,
    description: 'MK-677 + GHRP/GHRH combination',
    test: (items) =>
      has(items, P.MK677) &&
      GH_SECRETAGOGUES.filter((p) => p !== P.MK677).some((p) => has(items, p)),
    message: () =>
      'MK-677 (Ibutamoren) acts as a potent ghrelin mimetic. Combining it with an additional GHRP or GHRH may produce excessive elevations in fasting GH and cortisol. Monitor fasting blood glucose weekly. Recommended protocol: MK-677 10–25 mg/day with a single standard GHRP.',
    reference: 'Copinschi G et al. Eur J Endocrinol 1996',
  },

  {
    id: 'gh-axis-glucocorticoid-attenuation',
    category: RULE_CATEGORY.GH_AXIS,
    severity: SEVERITY.WARNING,
    description: 'Glucocorticoids suppress GH response to secretagogues',
    test: (items) => GH_secretagogues_count(items) >= 1 && has(items, P.GLUCOCORTICOID),
    message: () =>
      'Glucocorticoids (corticosteroids) suppress the pituitary GH response to secretagogues in a dose-dependent manner. GH stimulation protocols may be significantly less effective in patients on active corticosteroid therapy. Consider optimizing or tapering corticotherapy before starting the GH protocol.',
    reference: 'Van den Berg G et al. J Clin Endocrinol Metab 1997',
  },

  {
    id: 'gh-axis-active-cancer',
    category: RULE_CATEGORY.GH_AXIS,
    severity: SEVERITY.STRICT,
    description: 'GH secretagogues contraindicated in active malignancy',
    test: (items, ctx) => GH_secretagogues_count(items) >= 1 && ctx?.hasActiveCancer,
    message: () =>
      '🚫 STRICT: GH secretagogues elevate circulating IGF-1, a potent mitogen. Absolutely contraindicated in patients with active neoplasia. There is a documented risk of accelerating tumor growth. Requires oncological clearance before any consideration.',
    reference: 'Pollak M. Nat Rev Cancer 2008; Clemmons DR. Nat Rev Drug Discov 2012',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  CATEGORY: INTERACTION (Peptide-Peptide)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'igf1-insulin-strict',
    category: RULE_CATEGORY.INTERACTION,
    severity: SEVERITY.STRICT,
    description: 'IGF-1 + Insulin — severe hypoglycemia risk',
    test: (items) =>
      (has(items, P.IGF1) || has(items, P.IGF1LR3) || has(items, P.DES_IGF1)) &&
      has(items, P.INSULIN),
    message: () =>
      '🚫 STRICT: IGF-1 and Insulin combined present a documented risk of severe, potentially fatal hypoglycemia. IGF-1 exhibits intrinsic insulin-mimetic activity (binds to IR-A receptors). Requires continuous glucose monitoring and direct medical supervision.',
    reference: 'Clemmons DR. Nat Rev Drug Discov 2012; Saugy M et al. Br J Sports Med 2006',
  },

  {
    id: 'bpc157-tb500-overlap',
    category: RULE_CATEGORY.REDUNDANCY,
    severity: SEVERITY.WARNING,
    description: 'BPC-157 + TB-500 overlapping tissue-repair mechanisms',
    test: (items) => has(items, P.BPC157) && has(items, P.TB500),
    message: () =>
      'BPC-157 and TB-500 (Tβ4) share complementary mechanisms in tissue repair (angiogenesis, satellite cell proliferation). Consider sequential protocols (acute BPC-157 -> maintenance TB-500) to maximize therapeutic efficacy and cost efficiency.',
    reference: 'Sikiric P et al. Curr Pharm Des 2018; Goldstein AL et al. Ann N Y Acad Sci 2012',
  },

  {
    id: 'ghrh-cjc1295-overlap',
    category: RULE_CATEGORY.REDUNDANCY,
    severity: SEVERITY.WARNING,
    description: 'GHRH + CJC-1295 — near-identical mechanism',
    test: (items) => has(items, P.GHRH) && has(items, P.CJC1295),
    message: () =>
      'CJC-1295 is a long-acting GHRH analogue. Combining it with additional native GHRH offers no synergistic benefit and can saturate pituitary GHRH receptors. Prescribe either one or the other, not both.',
    reference: 'Alba M et al. J Clin Endocrinol Metab 2006',
  },

  {
    id: 'melanotan-pt141-strict',
    category: RULE_CATEGORY.INTERACTION,
    severity: SEVERITY.STRICT,
    description: 'Melanotan I/II + PT-141 — cumulative melanocortin agonism',
    test: (items) => has(items, P.MELANOTAN) && has(items, P.PT141),
    message: () =>
      '🚫 STRICT: Melanotan and PT-141 are melanocortin agonists. Their combination causes excessive MC1R–MC4R activation: risk of severe nausea, transient hypertension, pathological hyperpigmentation, and priapism.',
    reference: 'Hadley ME et al. Peptides 2005; FDA Safety Communication PT-141 2019',
  },

  {
    id: 'thymosin-a1-ll37-immune-stack',
    category: RULE_CATEGORY.INTERACTION,
    severity: SEVERITY.WARNING,
    description: 'Thymosin Alpha-1 + LL-37 — dual immunomodulation',
    test: (items) => has(items, P.THYMOSIN_A1) && has(items, P.LL37),
    message: () =>
      'Thymosin Alpha-1 and LL-37 exert immunomodulation via distinct pathways (Th1 polarization vs. TLR innate signaling). May cause excessive immune activation in patients with active autoimmune diseases. Evaluate baseline inflammatory status (CRP, IL-6) before prescribing.',
  },

  {
    id: 'selank-semax-cns',
    category: RULE_CATEGORY.INTERACTION,
    severity: SEVERITY.WARNING,
    description: 'Selank + Semax — dual CNS anxiolytic/nootropic',
    test: (items) => has(items, P.SELANK) && has(items, P.SEMAX),
    message: () =>
      'Selank (GABAergic anxiolytic) and Semax (ACTH-like neuroprotective) may produce excessive sedation or paradoxical agitation in sensitive individuals. Initiate each compound separately for 2 weeks prior to combining.',
    reference: 'Semenova TP et al. Behav Pharmacol 2010',
  },

  {
    id: 'vip-kpv-vasodilatory',
    category: RULE_CATEGORY.INTERACTION,
    severity: SEVERITY.WARNING,
    description: 'VIP + KPV — potentiated vasodilatory effect',
    test: (items) => has(items, P.VIP) && has(items, P.KPV),
    message: () =>
      'VIP and KPV have overlapping vasodilatory effects. Their combination may produce transient hypotension. Monitor blood pressure during the first 2–4 hours post-administration.',
  },

  {
    id: 'epithalon-pinealon-redundancy',
    category: RULE_CATEGORY.REDUNDANCY,
    severity: SEVERITY.INFO,
    description: 'Epithalon + Pinealon — overlapping pineal/epigenetic targets',
    test: (items) => has(items, P.EPITHALON) && has(items, P.PINEALON),
    message: () =>
      'Epithalon and Pinealon act on the pineal gland and circadian rhythm regulation. Simultaneous use is not dangerous, but evidence of additive benefit is limited. Consider administering them in separate cycles.',
  },

  {
    id: 'glp1-glp1-dual-strict',
    category: RULE_CATEGORY.INTERACTION,
    severity: SEVERITY.STRICT,
    description: 'Dual GLP-1 receptor agonists — absolute contraindication',
    test: (items) => {
      const glp1s = [P.SEMAGLUTIDE, P.TIRZEPATIDE, P.LIRAGLUTIDE, P.EXENATIDE];
      return glp1s.filter((p) => has(items, p)).length >= 2;
    },
    message: () =>
      '🚫 STRICT: Do not combine two GLP-1 receptor agonists (Semaglutide, Tirzepatide, Liraglutide, Exenatide). Simultaneous use offers no additional clinical benefit and significantly increases the risk of severe nausea, pancreatitis, dehydration, and hypoglycemia.',
    reference: 'ADA Standards of Care in Diabetes 2024; FDA Drug Labeling',
  },

  {
    id: 'glp1-igf1-metabolic-complex',
    category: RULE_CATEGORY.INTERACTION,
    severity: SEVERITY.WARNING,
    description: 'GLP-1 agonist + IGF-1 — complex endocrine interaction',
    test: (items) =>
      (has(items, P.SEMAGLUTIDE) || has(items, P.TIRZEPATIDE) || has(items, P.LIRAGLUTIDE)) &&
      (has(items, P.IGF1) || has(items, P.IGF1LR3)),
    message: () =>
      'GLP-1 agonists reduce circulating IGF-1 via suppressive effects on GH. Adding exogenous IGF-1 can create an unpredictable endocrine profile. Monitor IGF-1 levels, fasting glucose, and insulin every 4 weeks.',
    reference: 'Gentilcore D et al. Diabetes Care 2009',
  },

  {
    id: 'rapamycin-igf1-interaction',
    category: RULE_CATEGORY.INTERACTION,
    severity: SEVERITY.WARNING,
    description: 'Rapamycin (mTOR inhibitor) + GH/IGF-1 axis peptides',
    test: (items) =>
      has(items, P.RAPAMYCIN) &&
      (has(items, P.IGF1) || has(items, P.IGF1LR3) || GH_secretagogues_count(items) >= 1),
    message: () =>
      'Rapamycin inhibits mTORC1, which is the primary downstream mediator of IGF-1 and GH signaling. Combining an mTOR inhibitor with GH secretagogues or IGF-1 creates pharmacological antagonism. The anabolic benefits of GH/IGF-1 are significantly attenuated.',
    reference: 'Tatar M et al. Science 2001; Blagosklonny MV. Aging 2013',
  },

  {
    id: 'nad-semaglutide-interaction',
    category: RULE_CATEGORY.INTERACTION,
    severity: SEVERITY.INFO,
    description: 'NAD+/NMN + GLP-1 agonist — potential additive metabolic benefit',
    test: (items) =>
      has(items, P.NAD) &&
      (has(items, P.SEMAGLUTIDE) || has(items, P.TIRZEPATIDE) || has(items, P.LIRAGLUTIDE)),
    message: () =>
      'NAD+/NMN and GLP-1 agonists act via complementary pathways in mitochondrial metabolism and insulin sensitivity. The combination can be beneficial, but monitor baseline liver (ALT, AST) and renal (creatinine, eGFR) parameters as both influence metabolic clearance.',
    reference: 'Trammell SA et al. Nat Commun 2016; Madeiro da Costa R et al. Cell Metab 2024',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  CATEGORY: DRUG_CLASS — Peptide + Non-peptide drug interactions
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'bpc157-anticoagulant-interaction',
    category: RULE_CATEGORY.DRUG_CLASS,
    severity: SEVERITY.WARNING,
    description: 'BPC-157 + anticoagulants — hemostatic interaction',
    test: (items) => has(items, P.BPC157) && has(items, P.ANTICOAG),
    message: () =>
      'BPC-157 modulates the nitric oxide system and may counteract the anticoagulant effects of warfarin, heparin, or direct oral anticoagulants. Monitor INR weekly in warfarin patients. Consult the patient\'s hematologist if on chronic anticoagulation.',
    reference: 'Sikiric P et al. Curr Pharm Des 2018; NIH PubMed PMID:28789347',
  },

  {
    id: 'bpc157-nsaid-interaction',
    category: RULE_CATEGORY.DRUG_CLASS,
    severity: SEVERITY.INFO,
    description: 'BPC-157 + NSAIDs — potential gastroprotective counter-effect',
    test: (items) => has(items, P.BPC157) && has(items, P.NSAID),
    message: () =>
      'BPC-157 has demonstrated in preclinical models the ability to counteract NSAID-induced gastrointestinal toxicity (ulcers, bleeding). While clinically beneficial, it may mask early alarm symptoms of GI ulceration. Monitor for signs of occult bleeding.',
    reference: 'Sikiric P et al. Curr Pharm Des 2018; Rucman R et al. J Physiol Paris 2012',
  },

  {
    id: 'semax-ssri-serotonin-warning',
    category: RULE_CATEGORY.DRUG_CLASS,
    severity: SEVERITY.WARNING,
    description: 'Semax + SSRI — theoretical serotonin syndrome risk',
    test: (items) => has(items, P.SEMAX) && (has(items, P.SSRI) || has(items, P.SNRI)),
    message: () =>
      'Semax modulates the serotonergic system (increases serotonin turnover). In combination with SSRIs or SNRIs, there is a theoretical risk of serotonin syndrome: fever, agitation, myoclonus, hyperreflexia. Start with conservative dosing and monitor during the first 2 weeks.',
    reference: 'Semenova TP et al. Behav Pharmacol 2010; NIH PubMed PMID:8777118',
  },

  {
    id: 'selank-ssri-caution',
    category: RULE_CATEGORY.DRUG_CLASS,
    severity: SEVERITY.INFO,
    description: 'Selank + SSRI/SNRI — generally compatible but monitor',
    test: (items) => has(items, P.SELANK) && (has(items, P.SSRI) || has(items, P.SNRI)),
    message: () =>
      'Selank acts primarily on GABAergic and enkephalinergic pathways. Evidence of adverse interaction with SSRIs is limited, but monitor patient mood and neurological activation during the first 2 weeks of concurrent therapy.',
    reference: 'Semenova TP et al. Behav Pharmacol 2010; Frontiers in Pharmacology 2021',
  },

  {
    id: 'any-peptide-maoi-strict',
    category: RULE_CATEGORY.DRUG_CLASS,
    severity: SEVERITY.STRICT,
    description: 'Neuroactive peptides + MAOI — risk of hypertensive crisis',
    test: (items) =>
      has(items, P.MAOI) &&
      (has(items, P.SEMAX) || has(items, P.SELANK) || has(items, P.DIHEXA) ||
       has(items, P.NSI189) || has(items, P.CEREBROLYSIN)),
    message: () =>
      '🚫 STRICT: Neuroactive peptides (Semax, Selank, Dihexa, NSI-189, Cerebrolysin) combined with Monoamine Oxidase Inhibitors (MAOIs) carry significant risk of severe hypertensive crisis and serotonin syndrome. Requires a washout period of at least 2 weeks after stopping MAOIs.',
    reference: 'FDA Drug Safety Communication — MAOIs; NIH PubMed PMID:29937836',
  },

  {
    id: 'glp1-sulfonylurea-hypoglycemia',
    category: RULE_CATEGORY.DRUG_CLASS,
    severity: SEVERITY.WARNING,
    description: 'GLP-1 agonist + Sulfonylureas — additive hypoglycemia risk',
    test: (items) =>
      (has(items, P.SEMAGLUTIDE) || has(items, P.TIRZEPATIDE) || has(items, P.LIRAGLUTIDE)) &&
      has(items, P.ANTIDIABETIC),
    message: () =>
      'GLP-1 agonists co-prescribed with insulin secretagogues (sulfonylureas, repaglinide) increase the risk of clinical hypoglycemia. Consider reducing the sulfonylurea dosage by 30–50% upon initiating GLP-1 therapy. Monitor fasting and postprandial blood glucose.',
    reference: 'ADA Standards of Care 2024; Marso SP et al. N Engl J Med 2016',
  },

  {
    id: 'gh-axis-thyroid-monitoring',
    category: RULE_CATEGORY.DRUG_CLASS,
    severity: SEVERITY.WARNING,
    description: 'GH secretagogues + T3/T4 thyroid hormone interaction',
    test: (items) =>
      GH_secretagogues_count(items) >= 1 && (has(items, P.T3) || has(items, P.T4)),
    message: () =>
      'GH secretagogues can alter peripheral thyroid hormone conversion and metabolism. In patients on thyroid replacement therapy, monitor TSH and free T4 at 6 weeks post-initiation of GH protocol, as dose adjustments may be required.',
    reference: 'Achermann JC & Hindmarsh PC. J Endocrinol 2002; Molitch ME et al. JCEM 2011',
  },

  {
    id: 'nad-maoi-interaction',
    category: RULE_CATEGORY.DRUG_CLASS,
    severity: SEVERITY.WARNING,
    description: 'NAD+/NMN + MAOI — serotonin/dopamine potentiation',
    test: (items) => has(items, P.NAD) && has(items, P.MAOI),
    message: () =>
      'NAD+ serves as a cofactor in neurotransmitter metabolic pathways (serotonin, dopamine, norepinephrine). Combining with MAOIs may potentiate monoaminergic activity unpredictably. Use with caution and monitor for signs of serotonin excess.',
    reference: 'Trammell SA et al. Nat Commun 2016',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  CATEGORY: CONTRAINDICATION
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'foxo4-dri-oncology',
    category: RULE_CATEGORY.CONTRAINDICATION,
    severity: SEVERITY.STRICT,
    description: 'FOXO4-DRI — requires oncology clearance',
    test: (items) => has(items, P.FOXO4),
    message: () =>
      '🚫 STRICT: FOXO4-DRI is an experimental senolytic agent (targets senescent cells via p53-mediated apoptosis). Contraindicated in patients with active malignancy or recent remission (< 5 years) without formal oncological clearance. Requires comprehensive informed consent.',
    reference: 'Baar MP et al. Cell 2017; DOI: 10.1016/j.cell.2017.02.031',
  },

  {
    id: 'dihexa-hepatotoxicity-monitoring',
    category: RULE_CATEGORY.CONTRAINDICATION,
    severity: SEVERITY.WARNING,
    description: 'Dihexa — hepatotoxicity monitoring required',
    test: (items) => has(items, P.DIHEXA),
    message: () =>
      'Dihexa has demonstrated hepatotoxic potential in high-dose preclinical models. Requires baseline liver function panel (AST, ALT, GGT, Total Bilirubin) and a repeat panel at 4 weeks. Do not prescribe without documented baseline values.',
    reference: 'Bhatt DK et al. Neuropharmacology 2014',
  },

  {
    id: 'melanotan-melanoma-contraindication',
    category: RULE_CATEGORY.CONTRAINDICATION,
    severity: SEVERITY.STRICT,
    description: 'Melanotan — contraindicated with melanoma history',
    test: (items, ctx) => has(items, P.MELANOTAN) && (ctx?.hasMelanoma || ctx?.hasSkinCancer),
    message: () =>
      '🚫 STRICT: Melanotan I/II stimulates melanogenesis via MC1R activation. Strictly contraindicated in patients with personal history of cutaneous melanoma or dysplastic nevi. Risk of promoting malignant progression in pre-existing pigmented lesions.',
    reference: 'Langan EA et al. Br J Dermatol 2015',
  },

  {
    id: 'igf1-active-cancer',
    category: RULE_CATEGORY.CONTRAINDICATION,
    severity: SEVERITY.STRICT,
    description: 'IGF-1 — contraindicated in active malignancy',
    test: (items, ctx) =>
      (has(items, P.IGF1) || has(items, P.IGF1LR3) || has(items, P.DES_IGF1)) &&
      ctx?.hasActiveCancer,
    message: () =>
      '🚫 STRICT: IGF-1 is a potent mitogen. Absolutely contraindicated in patients with active malignancy. May accelerate neoplastic proliferation.',
    reference: 'Pollak M. Nat Rev Cancer 2008',
  },

  {
    id: 'glp1-medullary-thyroid',
    category: RULE_CATEGORY.CONTRAINDICATION,
    severity: SEVERITY.STRICT,
    description: 'GLP-1 agonists — contraindicated with MTC history / MEN2',
    test: (items, ctx) =>
      (has(items, P.SEMAGLUTIDE) || has(items, P.TIRZEPATIDE) || has(items, P.LIRAGLUTIDE)) &&
      (ctx?.hasMedullaryThyroidCancer || ctx?.hasMEN2),
    message: () =>
      '🚫 STRICT: GLP-1 receptor agonists (Semaglutide, Tirzepatide, Liraglutide) carry an FDA Boxed Warning for risk of Medullary Thyroid Carcinoma (MTC). Absolutely contraindicated in patients with a personal or family history of MTC or Multiple Endocrine Neoplasia syndrome type 2 (MEN 2).',
    reference: 'FDA Black Box Warning — GLP-1 Receptor Agonists; Drugs.com Drug Labeling 2024',
  },

  {
    id: 'glp1-pancreatitis-history',
    category: RULE_CATEGORY.CONTRAINDICATION,
    severity: SEVERITY.STRICT,
    description: 'GLP-1 agonists — contraindicated with history of pancreatitis',
    test: (items, ctx) =>
      (has(items, P.SEMAGLUTIDE) || has(items, P.TIRZEPATIDE) || has(items, P.LIRAGLUTIDE)) &&
      ctx?.hasPancreatitisHistory,
    message: () =>
      '🚫 STRICT: GLP-1 receptor agonists are contraindicated in patients with a history of acute or chronic pancreatitis. Discontinue immediately if clinical signs of pancreatitis (severe abdominal pain radiating to back) occur.',
    reference: 'FDA Drug Labeling; ADA Standards of Care 2024',
  },

  {
    id: 'thymosin-a1-autoimmune',
    category: RULE_CATEGORY.CONTRAINDICATION,
    severity: SEVERITY.WARNING,
    description: 'Thymosin Alpha-1 — contraindicated in active autoimmune disease',
    test: (items, ctx) => has(items, P.THYMOSIN_A1) && ctx?.hasAutoimmuneDisease,
    message: () =>
      'Thymosin Alpha-1 promotes Th1 cellular immune polarization. In active autoimmune disorders (SLE, Crohn\'s, Rheumatoid Arthritis, Multiple Sclerosis), it may exacerbate inflammatory flares. Requires specialist rheumatology clearance.',
  },

  {
    id: 'immunosuppressant-thymosin-conflict',
    category: RULE_CATEGORY.CONTRAINDICATION,
    severity: SEVERITY.STRICT,
    description: 'Thymosin Alpha-1 + Immunosuppressants — pharmacological antagonism',
    test: (items) => has(items, P.THYMOSIN_A1) && has(items, P.IMMUNOSUPPRESSANT),
    message: () =>
      '🚫 STRICT: Thymosin Alpha-1 (immunostimulant) is pharmacologically antagonistic to immunosuppressants (Cyclosporine, Tacrolimus, Azathioprine, Mycophenolate). In organ transplant or autoimmune patients, co-administration may precipitate graft rejection or acute flare.',
    reference: 'Goldstein AL et al. Curr Drug Targets Infect Disord 2003',
  },

  {
    id: 'nad-active-cancer-caution',
    category: RULE_CATEGORY.CONTRAINDICATION,
    severity: SEVERITY.WARNING,
    description: 'NAD+/NMN — caution in active malignancy',
    test: (items, ctx) => has(items, P.NAD) && ctx?.hasActiveCancer,
    message: () =>
      'NAD+ is an essential metabolic cofactor. There is theoretical concern that high-dose NAD+ supplementation may support energy metabolism in malignant cells. Oncological consultation is recommended prior to use in active cancer patients.',
    reference: 'Piacente F et al. Int J Mol Sci 2020; NCI research overview 2023',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  CATEGORY: DOSAGE
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'bpc157-dose-upper-bound',
    category: RULE_CATEGORY.DOSAGE,
    severity: SEVERITY.WARNING,
    description: 'BPC-157 — quantity exceeds typical protocol range',
    test: (items) => find(items, P.BPC157).some((i) => qty(i) > 10),
    message: () =>
      'The prescribed quantity of BPC-157 exceeds 10 vials. Standard clinical protocols recommend 250–500 mcg/day SC for 4–8 weeks. Ensure total daily intake remains within safe therapeutic parameters (≤ 500 mcg/day).',
  },

  {
    id: 'ipamorelin-ghrp2-synergy-tip',
    category: RULE_CATEGORY.DOSAGE,
    severity: SEVERITY.INFO,
    description: 'Ipamorelin + GHRP-2 — dose optimisation',
    test: (items) => has(items, P.IPAMORELIN) && has(items, P.GHRP2),
    message: () =>
      'When stacking Ipamorelin and GHRP-2, effective synergistic dosage can be reduced to 60–70% of standard individual doses. Typical protocol: Ipamorelin 100 mcg + GHRP-2 100 mcg, 2x/day (pre-workout + pre-sleep).',
    reference: 'Walker RF. Curr Opin Investig Drugs 2006',
  },

  {
    id: 'mk677-diabetes-dose',
    category: RULE_CATEGORY.DOSAGE,
    severity: SEVERITY.WARNING,
    description: 'MK-677 — insulin resistance risk at high doses or in diabetics',
    test: (items, ctx) => {
      const mk = find(items, P.MK677);
      return mk.some((i) => parseFloat(i.dosage) > 25) || (has(items, P.MK677) && ctx?.hasDiabetes);
    },
    message: (items, ctx) =>
      ctx?.hasDiabetes
        ? 'MK-677 may exacerbate insulin resistance in diabetic patients. Monitor fasting blood glucose and HbA1c monthly. Consider conservative dosing (≤ 12.5 mg/day).'
        : 'MK-677 at doses > 25 mg/day increases the incidence of fasting hyperglycemia. Recommended therapeutic range: 10–25 mg/day.',
    reference: 'Chapman IM et al. J Clin Endocrinol Metab 1997',
  },

  {
    id: 'glp1-dose-escalation-required',
    category: RULE_CATEGORY.DOSAGE,
    severity: SEVERITY.INFO,
    description: 'GLP-1 agonists — gradual dose escalation protocol',
    test: (items) =>
      has(items, P.SEMAGLUTIDE) || has(items, P.TIRZEPATIDE) || has(items, P.LIRAGLUTIDE),
    message: () =>
      'GLP-1 receptor agonists require a gradual dose titration protocol to minimize gastrointestinal adverse effects (nausea, vomiting, diarrhea). Do not initiate at full maintenance dose. Semaglutide: start 0.25 mg/week x 4 weeks before escalating to 0.5 mg -> 1 mg -> 2.4 mg (Wegovy). Tirzepatide: start 2.5 mg/week x 4 weeks before escalating.',
    reference: 'Wilding JPH et al. N Engl J Med 2021 (SCALE); FDA Prescribing Information',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  CATEGORY: ROUTE
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'll37-iv-route-strict',
    category: RULE_CATEGORY.ROUTE,
    severity: SEVERITY.STRICT,
    description: 'LL-37 — intravenous route is not established',
    test: (items) => find(items, P.LL37).some((i) => /\bIV\b|intravenous/i.test(i.route || '')),
    message: () =>
      '🚫 STRICT: Intravenous LL-37 has no established clinical safety profile in humans. Prescribe exclusively via subcutaneous, inhalational, or topical routes.',
  },

  {
    id: 'bpc157-oral-vs-sc-note',
    category: RULE_CATEGORY.ROUTE,
    severity: SEVERITY.INFO,
    description: 'BPC-157 — route selection vs therapeutic goal',
    test: (items) => find(items, P.BPC157).some((i) => /oral|PO/i.test(i.route || '')),
    message: () =>
      'Oral BPC-157 demonstrates high localized efficacy for gastrointestinal indications (ulcers, colitis, gut barrier integrity). For systemic musculoskeletal injuries, subcutaneous (SC) injection offers greater systemic bioavailability.',
    reference: 'Sikiric P et al. Curr Pharm Des 2018',
  },

  {
    id: 'glp1-oral-vs-injectable-note',
    category: RULE_CATEGORY.ROUTE,
    severity: SEVERITY.INFO,
    description: 'Oral Semaglutide — special absorption requirements',
    test: (items) =>
      find(items, P.SEMAGLUTIDE).some((i) => /oral|PO|tablet/i.test(i.route || '')),
    message: () =>
      'Oral Semaglutide (Rybelsus) must be taken fasting with no more than 120 mL of plain water, at least 30 minutes before any food, beverage, or other oral medications. Non-compliance severely impairs bioavailability (~1% systemic absorption).',
    reference: 'Aroda VR et al. N Engl J Med 2019 (PIONEER 1); FDA Prescribing Information Rybelsus',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  CATEGORY: TIMING
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'dsip-nocturnal-timing',
    category: RULE_CATEGORY.TIMING,
    severity: SEVERITY.WARNING,
    description: 'DSIP — must be administered at night',
    test: (items) => has(items, P.DSIP),
    message: () =>
      'DSIP (Delta Sleep-Inducing Peptide) has maximal therapeutic efficacy when administered 30–60 minutes before bedtime. Prescription instructions should explicitly state nocturnal administration.',
    reference: 'Schoenenberger GA & Monnier M. Proc Natl Acad Sci 1977',
  },

  {
    id: 'ghrh-fasting-requirement',
    category: RULE_CATEGORY.TIMING,
    severity: SEVERITY.WARNING,
    description: 'GHRH analogues — require fasted state',
    test: (items) =>
      has(items, P.CJC1295) || has(items, P.SERMORELIN) ||
      has(items, P.TESAMORELIN) || has(items, P.GHRH),
    message: () =>
      'GHRH analogues must be administered after a 2–3 hour fast to prevent attenuation of the GH pulse by postprandial insulin and somatostatin. Include fasting requirements in patient directions.',
  },

  {
    id: 'epithalon-cycling-protocol',
    category: RULE_CATEGORY.TIMING,
    severity: SEVERITY.INFO,
    description: 'Epithalon — cyclical use recommended',
    test: (items) => has(items, P.EPITHALON),
    message: () =>
      'Epithalon is clinically administered in cycles of 10–20 days, 1–2 times per year. Continuous use beyond 20 days provides no documented additional benefit. Specify cycle duration and off-cycle rest periods (min. 3–6 months) in instructions.',
    reference: 'Khavinson VK et al. Peptides 2002',
  },

  {
    id: 'glp1-weekly-injection-spacing',
    category: RULE_CATEGORY.TIMING,
    severity: SEVERITY.INFO,
    description: 'Weekly GLP-1 — consistent day-of-week spacing',
    test: (items) =>
      find(items, P.SEMAGLUTIDE).some((i) => /weekly|QW/i.test(i.frequency || '')) ||
      find(items, P.TIRZEPATIDE).some((i) => /weekly|QW/i.test(i.frequency || '')),
    message: () =>
      'Weekly Semaglutide and Tirzepatide should be administered on the same day each week, at any time of day. If a dose is missed, administer within 5 days; if > 5 days have elapsed, skip the missed dose and resume on the regular scheduled day.',
    reference: 'FDA Prescribing Information — Ozempic, Wegovy, Mounjaro, Zepbound',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  CATEGORY: MONITORING
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'gh-axis-igf1-monitoring',
    category: RULE_CATEGORY.MONITORING,
    severity: SEVERITY.INFO,
    description: 'GH secretagogue — IGF-1 monitoring recommended',
    test: (items) => GH_secretagogues_count(items) >= 1,
    message: () =>
      'Measure baseline serum IGF-1 prior to initiating any GH secretagogue, and repeat at 6–8 weeks. Target therapeutic range: young adult reference range (200–350 ng/mL). Levels exceeding 400 ng/mL carry risk of subclinical acromegaly.',
    reference: 'Molitch ME et al. J Clin Endocrinol Metab 2011',
  },

  {
    id: 'bpc157-post-surgery-note',
    category: RULE_CATEGORY.MONITORING,
    severity: SEVERITY.INFO,
    description: 'BPC-157 — post-surgical use note',
    test: (items, ctx) => has(items, P.BPC157) && ctx?.isPostSurgical,
    message: () =>
      'BPC-157 as a post-surgical adjuvant enhances tissue healing and angiogenesis. In bowel anastomoses, initiate oral dosing only after the surgeon confirms active gastrointestinal motility (typically post-op days 2–4). Subcutaneous therapy may be initiated earlier.',
  },

  {
    id: 'glp1-cardiovascular-monitoring',
    category: RULE_CATEGORY.MONITORING,
    severity: SEVERITY.INFO,
    description: 'GLP-1 agonists — cardiovascular monitoring',
    test: (items) =>
      has(items, P.SEMAGLUTIDE) || has(items, P.TIRZEPATIDE) || has(items, P.LIRAGLUTIDE),
    message: () =>
      'GLP-1 receptor agonists have established cardioprotective benefits (reduction in MACE events). In patients with severe CHF (NYHA class ≥ III) or advanced renal disease (eGFR < 15 mL/min), monitor renal function and blood pressure monthly.',
    reference: 'Marso SP et al. N Engl J Med 2016 (LEADER, SUSTAIN-6); FDA Drug Label',
  },

  {
    id: 'nad-renal-hepatic-monitoring',
    category: RULE_CATEGORY.MONITORING,
    severity: SEVERITY.INFO,
    description: 'NAD+/NMN — renal and hepatic baseline required',
    test: (items) => has(items, P.NAD),
    message: () =>
      'NAD+ and its precursors (NMN, NR) are metabolized by the liver and cleared renally. In patients with pre-existing hepatic or renal compromise, establish baseline labs (ALT, AST, GGT, Creatinine, eGFR) and monitor every 6–8 weeks.',
    reference: 'Trammell SA et al. Nat Commun 2016; NIH Clinical Data 2024',
  },

  {
    id: 'peptide-pregnancy-universal',
    category: RULE_CATEGORY.SPECIAL_POPULATION,
    severity: SEVERITY.STRICT,
    description: 'Any peptide protocol — contraindicated in pregnancy',
    test: (items, ctx) => ctx?.isPregnant && items.length > 0,
    message: () =>
      '🚫 STRICT: No safety or teratogenicity data exists for investigational peptide protocols during pregnancy. Absolutely contraindicated. Discontinue protocol immediately and refer patient to obstetrics.',
    reference: 'FDA Regulatory Status — Research Peptides; Endocrine Society Guidelines',
  },

  {
    id: 'glp1-pregnancy-strict',
    category: RULE_CATEGORY.SPECIAL_POPULATION,
    severity: SEVERITY.STRICT,
    description: 'GLP-1 agonists — contraindicated in pregnancy',
    test: (items, ctx) =>
      ctx?.isPregnant &&
      (has(items, P.SEMAGLUTIDE) || has(items, P.TIRZEPATIDE) || has(items, P.LIRAGLUTIDE)),
    message: () =>
      '🚫 STRICT: GLP-1 receptor agonists are contraindicated during pregnancy. Discontinue at least 2 months prior to planned conception due to reproductive toxicity documented in preclinical models.',
    reference: 'FDA Black Box Warning; Novo Nordisk Prescribing Information 2024',
  },

  {
    id: 'elderly-dose-reduction',
    category: RULE_CATEGORY.SPECIAL_POPULATION,
    severity: SEVERITY.INFO,
    description: 'Elderly patients (>70y) — general dose reduction and monitoring',
    test: (items, ctx) => ctx?.ageYears >= 70 && items.length > 0,
    message: () =>
      'In patients over 70 years of age, peptide pharmacokinetics may be altered (decreased renal/hepatic clearance, heightened receptor sensitivity). Initiate therapy at 50–70% of standard protocol with gradual titration. Monitor eGFR quarterly.',
    reference: 'Endocrine Society Older Adults Guidelines 2022',
  },

  {
    id: 'paediatric-gh-protocols',
    category: RULE_CATEGORY.SPECIAL_POPULATION,
    severity: SEVERITY.STRICT,
    description: 'GH-axis peptides — not for use in paediatric patients without endocrinology',
    test: (items, ctx) =>
      ctx?.ageYears < 18 && GH_secretagogues_count(items) >= 1,
    message: () =>
      '🚫 STRICT: GH secretagogues have no established safety or dosing protocols in pediatric patients (< 18 years). Use without specialized pediatric endocrinology supervision may compromise epiphyseal closure and physiological growth.',
    reference: 'Endocrine Society Paediatric GH Guidelines 2016; FDA Regulations',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  Additional Protocol-level rules
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'nad-rapamycin-longevity-caution',
    category: RULE_CATEGORY.INTERACTION,
    severity: SEVERITY.INFO,
    description: 'NAD+ + Rapamycin — longevity protocol note',
    test: (items) => has(items, P.NAD) && has(items, P.RAPAMYCIN),
    message: () =>
      'The NAD+/NMN + Rapamycin combination is an emerging longevity protocol targeting complementary pathways (NAD→SIRT1; Rapamycin→mTOR). Monitor fasting blood glucose, lipid panels, and immune markers quarterly.',
    reference: 'Blagosklonny MV. Aging 2019; Sinclair DA et al. Cell Metab 2023',
  },

  {
    id: 'glp1-aod9604-weight-overlap',
    category: RULE_CATEGORY.REDUNDANCY,
    severity: SEVERITY.INFO,
    description: 'GLP-1 agonist + AOD-9604 — weight-loss mechanism overlap',
    test: (items) =>
      (has(items, P.SEMAGLUTIDE) || has(items, P.TIRZEPATIDE)) && has(items, P.AOD),
    message: () =>
      'GLP-1 agonists and AOD-9604 have overlapping clinical objectives (adiposity reduction). AOD-9604 failed Phase 3 clinical trials for obesity. Adding AOD-9604 to an active GLP-1 protocol offers unproven marginal benefit. Evaluate therapeutic rationale.',
    reference: 'Heffernan MA et al. J Clin Endocrinol Metab 2001; Neumann UH et al. J Mol Endocrinol 2015',
  },

  {
    id: 'cerebrolysin-semax-neuroprotection-stack',
    category: RULE_CATEGORY.REDUNDANCY,
    severity: SEVERITY.INFO,
    description: 'Cerebrolysin + Semax — overlapping neuroprotective mechanisms',
    test: (items) => has(items, P.CEREBROLYSIN) && has(items, P.SEMAX),
    message: () =>
      'Cerebrolysin and Semax are neuroprotective peptides with partially overlapping mechanisms (BDNF, VEGF, ACTH). Prescribe under specialized neurological supervision.',
    reference: 'Bhattacharya SK et al. Neuropeptides 1997; Gusev EI et al. Cerebrovasc Dis 2002',
  },

  {
    id: 'kisspeptin-gh-axis-interaction',
    category: RULE_CATEGORY.INTERACTION,
    severity: SEVERITY.INFO,
    description: 'Kisspeptin + GH secretagogues — neuroendocrine crosstalk',
    test: (items) => has(items, P.KISSPEPTIN) && GH_secretagogues_count(items) >= 1,
    message: () =>
      'Kisspeptin stimulates GnRH pulsatility and exhibits neuroendocrine crosstalk with the GH axis. Combining with GH secretagogues may produce overlapping endocrine surges. Monitor comprehensive hormone panels (LH, FSH, GH, IGF-1, Testosterone/Estradiol) at baseline and 4 weeks.',
    reference: 'Navarro VM. Nat Rev Endocrinol 2020; Dhillo WS et al. J Clin Endocrinol Metab 2005',
  },

];

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Run all clinical rules against the current prescription items and patient context.
 *
 * @param {Array}  items   — Array of item objects { id, name, quantity, dosage, route, frequency, ... }
 * @param {Object} [ctx]   — Optional patient context:
 *   {
 *     hasDiabetes?: boolean,
 *     hasAutoimmuneDisease?: boolean,
 *     hasActiveCancer?: boolean,
 *     hasMelanoma?: boolean,
 *     hasSkinCancer?: boolean,
 *     hasMedullaryThyroidCancer?: boolean,
 *     hasMEN2?: boolean,
 *     hasPancreatitisHistory?: boolean,
 *     isPostSurgical?: boolean,
 *     isPregnant?: boolean,
 *     ageYears?: number,
 *   }
 * @returns {{ warnings: RuleResult[], errors: RuleResult[], info: RuleResult[], all: RuleResult[] }}
 */
export function runClinicalRules(items = [], ctx = {}) {
  if (!items.length) return { warnings: [], errors: [], info: [], all: [] };

  const triggered = [];

  for (const rule of RULES) {
    try {
      if (rule.test(items, ctx)) {
        const msg = typeof rule.message === 'function' ? rule.message(items, ctx) : rule.message;
        triggered.push({
          id: rule.id,
          category: rule.category,
          severity: rule.severity,
          message: msg,
          reference: rule.reference || null,
        });
      }
    } catch (e) {
      console.warn(`[ClinicalRulesEngine] Error in rule "${rule.id}":`, e);
    }
  }

  return {
    all:      triggered,
    errors:   triggered.filter((r) => r.severity === SEVERITY.STRICT),
    warnings: triggered.filter((r) => r.severity === SEVERITY.WARNING),
    info:     triggered.filter((r) => r.severity === SEVERITY.INFO),
  };
}

/** Quick check: any strict (blocking) violations? */
export function hasStrictViolations(items, ctx = {}) {
  return runClinicalRules(items, ctx).errors.length > 0;
}

/** Human-readable summary of all triggered rules */
export function getClinicalRulesSummary(items, ctx = {}) {
  const { all } = runClinicalRules(items, ctx);
  if (!all.length) return 'No clinical alerts detected.';
  return all.map((r) => `[${r.severity.toUpperCase()}] ${r.message}`).join('\n\n');
}

/** Filter rules by category */
export function getRulesByCategory(items, ctx = {}, category) {
  return runClinicalRules(items, ctx).all.filter((r) => r.category === category);
}

/** Return all static rule definitions (for admin UI, documentation) */
export function getAllRuleDefinitions() {
  return RULES.map((r) => ({
    id: r.id,
    category: r.category,
    severity: r.severity,
    description: r.description,
    reference: r.reference || null,
  }));
}

/** Return rule count by category and severity (for dashboard KPIs) */
export function getRuleStats() {
  const stats = {};
  for (const rule of RULES) {
    if (!stats[rule.category]) stats[rule.category] = { info: 0, warning: 0, strict: 0, total: 0 };
    stats[rule.category][rule.severity]++;
    stats[rule.category].total++;
  }
  return {
    byCategory: stats,
    total: RULES.length,
    byServerity: {
      strict:  RULES.filter((r) => r.severity === SEVERITY.STRICT).length,
      warning: RULES.filter((r) => r.severity === SEVERITY.WARNING).length,
      info:    RULES.filter((r) => r.severity === SEVERITY.INFO).length,
    },
  };
}

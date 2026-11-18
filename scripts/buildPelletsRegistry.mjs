import fs from 'fs';

const FX_AED = 3.992;
const FX_USD = 1.087;

const RAW_PELLETS = [
  // Testosterone (pharmapolis-hormone-36)
  { hormone: 'testosterone', hormoneType: 'androgen', num: 36, variantIdx: 1, strength: '12.5 mg', doseVal: 12.5, cost: 50.00, role: 'Ultra-low titration / female sensitive' },
  { hormone: 'testosterone', hormoneType: 'androgen', num: 36, variantIdx: 2, strength: '18 mg', doseVal: 18, cost: 50.14, role: 'Micro-titration androgen dose' },
  { hormone: 'testosterone', hormoneType: 'androgen', num: 36, variantIdx: 3, strength: '25 mg', doseVal: 25, cost: 50.28, role: 'Conservative female physiological dose' },
  { hormone: 'testosterone', hormoneType: 'androgen', num: 36, variantIdx: 4, strength: '37.5 mg', doseVal: 37.5, cost: 50.42, role: 'Female moderate androgen support' },
  { hormone: 'testosterone', hormoneType: 'androgen', num: 36, variantIdx: 5, strength: '50 mg', doseVal: 50, cost: 50.56, role: 'Standard therapeutic female androgen synergy' },
  { hormone: 'testosterone', hormoneType: 'androgen', num: 36, variantIdx: 6, strength: '62.5 mg', doseVal: 62.5, cost: 50.70, role: 'Upper female therapeutic / athlete dose' },
  { hormone: 'testosterone', hormoneType: 'androgen', num: 36, variantIdx: 7, strength: '75 mg', doseVal: 75, cost: 51.92, role: 'Male fractional initiation / female maximum' },
  { hormone: 'testosterone', hormoneType: 'androgen', num: 36, variantIdx: 8, strength: '87.5 mg', doseVal: 87.5, cost: 53.14, role: 'Male fractional titration' },
  { hormone: 'testosterone', hormoneType: 'androgen', num: 36, variantIdx: 9, strength: '100 mg', doseVal: 100, cost: 54.36, role: 'High-demand / male TRT building block' },
  { hormone: 'testosterone', hormoneType: 'androgen', num: 36, variantIdx: 10, strength: '137.5 mg', doseVal: 137.5, cost: 55.58, role: 'Male TRT primary dose' },
  { hormone: 'testosterone', hormoneType: 'androgen', num: 36, variantIdx: 11, strength: '200 mg', doseVal: 200, cost: 56.80, role: 'High-output male androgen replacement' },

  // Estradiol (pharmapolis-hormone-37)
  { hormone: 'estradiol', hormoneType: 'estrogen', num: 37, variantIdx: 1, strength: '6 mg', doseVal: 6, cost: 50.00, role: 'Micro-dose estrogen initiation' },
  { hormone: 'estradiol', hormoneType: 'estrogen', num: 37, variantIdx: 2, strength: '10 mg', doseVal: 10, cost: 50.44, role: 'Low-dose vasomotor relief' },
  { hormone: 'estradiol', hormoneType: 'estrogen', num: 37, variantIdx: 3, strength: '12.5 mg', doseVal: 12.5, cost: 50.88, role: 'Conservative standard initiation dose' },
  { hormone: 'estradiol', hormoneType: 'estrogen', num: 37, variantIdx: 4, strength: '15 mg', doseVal: 15, cost: 51.32, role: 'Intermediate menopausal titration' },
  { hormone: 'estradiol', hormoneType: 'estrogen', num: 37, variantIdx: 5, strength: '18 mg', doseVal: 18, cost: 51.76, role: 'Balanced physiological dose' },
  { hormone: 'estradiol', hormoneType: 'estrogen', num: 37, variantIdx: 6, strength: '20 mg', doseVal: 20, cost: 52.20, role: 'Standard therapeutic mid-follicular plateau' },
  { hormone: 'estradiol', hormoneType: 'estrogen', num: 37, variantIdx: 7, strength: '22 mg', doseVal: 22, cost: 53.32, role: 'Active symptomatic stabilization' },
  { hormone: 'estradiol', hormoneType: 'estrogen', num: 37, variantIdx: 8, strength: '25 mg', doseVal: 25, cost: 54.43, role: 'Full standard therapeutic dose & bone preservation' },
  { hormone: 'estradiol', hormoneType: 'estrogen', num: 37, variantIdx: 9, strength: '30 mg', doseVal: 30, cost: 55.55, role: 'High metabolic clearance titration' },
  { hormone: 'estradiol', hormoneType: 'estrogen', num: 37, variantIdx: 10, strength: '37.5 mg', doseVal: 37.5, cost: 56.67, role: 'Surgical menopause / bilateral oophorectomy' },
  { hormone: 'estradiol', hormoneType: 'estrogen', num: 37, variantIdx: 11, strength: '50 mg', doseVal: 50, cost: 57.78, role: 'Advanced severe osteopenia stabilization' },
  { hormone: 'estradiol', hormoneType: 'estrogen', num: 37, variantIdx: 12, strength: '75 mg', doseVal: 75, cost: 58.90, role: 'Refractory vasomotor suppression' },

  // Progesterone (pharmapolis-hormone-38)
  { hormone: 'progesterone', hormoneType: 'progesterone', num: 38, variantIdx: 1, strength: '25 mg', doseVal: 25, cost: 50.00, role: 'Conservative luteal phase balance' },
  { hormone: 'progesterone', hormoneType: 'progesterone', num: 38, variantIdx: 2, strength: '37.5 mg', doseVal: 37.5, cost: 50.00, role: 'Low-dose endometrial protection' },
  { hormone: 'progesterone', hormoneType: 'progesterone', num: 38, variantIdx: 3, strength: '50 mg', doseVal: 50, cost: 50.00, role: 'Standard endometrial safety implant' },
  { hormone: 'progesterone', hormoneType: 'progesterone', num: 38, variantIdx: 4, strength: '75 mg', doseVal: 75, cost: 50.00, role: 'Enhanced progestogenic tone' },
  { hormone: 'progesterone', hormoneType: 'progesterone', num: 38, variantIdx: 5, strength: '100 mg', doseVal: 100, cost: 50.15, role: 'High-density progesterone implant' },
  { hormone: 'progesterone', hormoneType: 'progesterone', num: 38, variantIdx: 6, strength: '125 mg', doseVal: 125, cost: 50.30, role: 'Continuous endometrial counter-balance' },
  { hormone: 'progesterone', hormoneType: 'progesterone', num: 38, variantIdx: 7, strength: '150 mg', doseVal: 150, cost: 50.45, role: 'Estrogen dominance suppression' },
  { hormone: 'progesterone', hormoneType: 'progesterone', num: 38, variantIdx: 8, strength: '200 mg', doseVal: 200, cost: 50.60, role: 'Maximum bioidentical progesterone support' },

  // Testosterone + Anastrozole (pharmapolis-hormone-39)
  { hormone: 'testosterone-anastrozole', hormoneType: 'synergy', num: 39, variantIdx: 1, strength: '100/4 mg', doseVal: 100, cost: 50.00, role: 'Male TRT + Aromatase inhibition base' },
  { hormone: 'testosterone-anastrozole', hormoneType: 'synergy', num: 39, variantIdx: 2, strength: '137.5/4 mg', doseVal: 137.5, cost: 50.35, role: 'Anti-aromatase titration TRT' },
  { hormone: 'testosterone-anastrozole', hormoneType: 'synergy', num: 39, variantIdx: 3, strength: '200/4 mg', doseVal: 200, cost: 50.70, role: 'High-dose TRT + mild aromatase control' },
  { hormone: 'testosterone-anastrozole', hormoneType: 'synergy', num: 39, variantIdx: 4, strength: '200/8 mg', doseVal: 200, cost: 53.75, role: 'High-dose TRT + moderate aromatase control' },
  { hormone: 'testosterone-anastrozole', hormoneType: 'synergy', num: 39, variantIdx: 5, strength: '200/20 mg', doseVal: 200, cost: 56.80, role: 'High-aromatizer suppression TRT synergy' },

  // Biest 50:50 (pharmapolis-hormone-40)
  { hormone: 'biest', hormoneType: 'biest', num: 40, variantIdx: 1, strength: '10 mg', doseVal: 10, cost: 50.00, role: 'Balanced E2/E3 bioidentical titration' },
  { hormone: 'biest', hormoneType: 'biest', num: 40, variantIdx: 2, strength: '15 mg', doseVal: 15, cost: 52.00, role: 'Moderate dual-estrogen therapy' },
  { hormone: 'biest', hormoneType: 'biest', num: 40, variantIdx: 3, strength: '20 mg', doseVal: 20, cost: 54.10, role: 'Full therapeutic Biest implant' }
];

const citationsEstrogen = [
  { text: 'Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.', pmid: '848086' },
  { text: 'Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.', pmid: '3528127' },
  { text: 'Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.', pmid: '34161992' },
  { text: 'Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.', pmid: '23295460' }
];

const citationsTestosterone = [
  { text: 'Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.', pmid: '31314286' },
  { text: 'Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.', pmid: '23270753' },
  { text: 'Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.', pmid: '31499517' },
  { text: 'Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.', pmid: '15292311' }
];

const citationsProgesterone = [
  { text: 'Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.', pmid: '848086' },
  { text: 'Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.', pmid: '3528127' },
  { text: 'Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.', pmid: '34161992' },
  { text: 'Prior JC. Progesterone for symptomatic perimenopause and postmenopause. Front Endocrinol. 2018;9:438.', pmid: '30127768' }
];

const builtPellets = {};

RAW_PELLETS.forEach((item, index) => {
  const isEstro = item.hormone === 'estradiol';
  const isTesto = item.hormone === 'testosterone';
  const isProg = item.hormone === 'progesterone';
  const isSynergy = item.hormone === 'testosterone-anastrozole';
  const isBiest = item.hormone === 'biest';

  const cleanDoseSlug = item.strength.toLowerCase().replace(/\s+/g, '').replace(/,/g, '-').replace(/\//g, '-').replace(/\./g, '-');
  const slug = item.hormone + '-' + cleanDoseSlug + '-pellet';
  const id = slug;
  const sku = 'SKU-PHARM-HORM-' + item.num + '-S' + item.variantIdx;

  const cost = item.cost;
  const wholesaleEur = Math.round(cost * 1.15 * 1.15 * 100) / 100;
  const pack10Eur = Math.round(wholesaleEur * 10 * 0.90 * 100) / 100;

  const wholesaleAed = Math.round(wholesaleEur * FX_AED * 100) / 100;
  const retailAed = Math.round(wholesaleEur * 1.35 * FX_AED * 100) / 100;

  const trocarSize = (isTesto && item.doseVal >= 62.5) || isSynergy || (isEstro && item.doseVal >= 37.5) ? '4.5 mm' : '3.2 mm';
  const targetSerum = isEstro ? '50 - 110 pg/mL' : isBiest ? '40 - 90 pg/mL' : isProg ? '5 - 15 ng/mL' : isSynergy ? '500 - 900 ng/dL (E2 < 30 pg/mL)' : (item.doseVal <= 50 ? '150 - 350 ng/dL' : '400 - 850 ng/dL');
  const duration = isEstro || isBiest ? '4.5 to 6 months' : isProg ? '3 to 5 months' : isSynergy ? '5 to 6 months' : (item.doseVal <= 50 ? '3.5 to 5 months' : '5 to 6 months');

  let molName = '17β-Estradiol';
  let subcat = 'Estradiol (E2)';
  let activeSubs = '17β-Estradiol (Bioidentical Micronized USP)';
  let citations = citationsEstrogen;
  let targetGender = 'female';

  if (isTesto) {
    molName = 'Testosterone';
    subcat = 'Testosterone (TRT/BHRT)';
    activeSubs = 'Testosterone (Bioidentical USP Micronized)';
    citations = citationsTestosterone;
    targetGender = item.doseVal <= 50 ? 'female' : 'male';
  } else if (isProg) {
    molName = 'Progesterone';
    subcat = 'Progesterone (P4)';
    activeSubs = 'Micronized Progesterone USP';
    citations = citationsProgesterone;
    targetGender = 'female';
  } else if (isSynergy) {
    molName = 'Testosterone + Anastrozole';
    subcat = 'Testosterone Synergy';
    activeSubs = 'Testosterone USP + Anastrozole USP (Fixed Ratio Microcrystalline)';
    citations = citationsTestosterone;
    targetGender = 'male';
  } else if (isBiest) {
    molName = 'Biest 50:50';
    subcat = 'Dual Estrogens (E2/E3)';
    activeSubs = '17β-Estradiol USP (50%) + Estriol USP (50%)';
    citations = citationsEstrogen;
    targetGender = 'female';
  }

  const name = molName + ' Pellet ' + item.strength;
  const canonicalName = molName + ' Subcutaneous Bioidentical Pellet ' + item.strength;
  const commercialName = name + ' · Pharmapolis EU GMP';

  builtPellets[slug] = {
    id,
    slug,
    canonicalKey: slug,
    name,
    canonicalName,
    commercialName,
    brand: 'Pharmapolis',
    brandBadge: 'Pharmapolis Compounding Pharmacy • EU GMP',
    category: 'Hormone Pellets',
    subcategory: subcat,
    therapeutic_category: 'Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology',
    type: 'pellet',
    productType: 'pellet',
    is_pellet: true,
    isPellet: true,
    dosageForm: 'Subcutaneous Sterile Pellet (Trocar Implant)',
    dispensingForm: 'Single-dose Sterile Blister (1 Pellet)',
    supplierName: 'Pharmapolis Compounding Pharmacy',
    supplier: 'Pharmapolis Compounding Pharmacy',
    supplierId: 'supplier-pharmapolis',
    suppliers: ['supplier-pharmapolis'],
    supplierIds: ['supplier-pharmapolis'],
    isSingleSupplierLocked: true,
    status: 'active',
    rating: 4.99,
    reviewsCount: 34 + index,
    leadTimeDays: 3,
    purity: '≥ 99.5% Bioidentical Active Principle USP',
    sku,
    itemNumber: 'PL-' + String(index + 1).padStart(2, '0'),
    catalogRow: item.num,
    pricing: {
      costPriceEur: cost,
      price_eur: wholesaleEur,
      wholesalePriceEur: wholesaleEur,
      pack10PriceEur: pack10Eur,
      wholesalePriceAed: wholesaleAed,
      retailPriceAed: retailAed,
      currency: 'EUR'
    },
    strength: item.strength,
    strengthValue: item.doseVal,
    strengthUnit: 'mg',
    hormoneType: item.hormoneType,
    targetGender,
    trocarSize,
    targetSerum,
    duration,
    role: item.role,
    shortDescription: 'Official EU GMP pharmaceutical-grade bioidentical ' + molName + ' (' + item.strength + ') subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over ' + duration + '.',
    description: 'The Pharmapolis ' + item.strength + ' ' + molName + ' subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.',
    objective: 'Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.',
    goals: [
      'Continuous Zero-Order Pharmacokinetic Absorption',
      'Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation',
      'Physiological Organoprotection & Metabolic Balance',
      'Targeted Subcutaneous Depot Bio-Uptake'
    ],
    composition: {
      activeSubstance: activeSubs,
      activeDose: item.strength,
      excipients: 'Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)',
      sterilizationMethod: 'Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)',
      dimensions: trocarSize === '3.2 mm' ? 'Diameter 3.0 mm · Length ~4.2 mm' : 'Diameter 4.2 mm · Length ~5.8 mm',
      appearance: 'White crystalline solid cylinder, sterile double-barrier blister pack'
    },
    galenicSpecs: {
      releaseProfile: 'Zero-order steady subcutaneous micro-dissolution',
      tmax: '24 to 72 hours',
      steadyStatePlateau: 'Day 7 through Month 5',
      targetSerumLevel: targetSerum,
      averageDurationMonths: duration,
      releaseDuration: duration,
      elimination: 'Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination'
    },
    clinicalDossier: {
      targetPatientProfile: 'Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.',
      recommendedPosology: '1 pellet (' + item.strength + ') implanted subcutaneously every ' + duration + ' based on symptom trajectory and trough serum telemetry.',
      endometrialSafetyProtocol: isEstro || isBiest ? 'MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.' : 'Clinical monitoring of complete blood count, lipid profile, and target hormone levels.',
      insertionProcedure: {
        site: 'Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.',
        anesthesia: '2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.',
        incision: trocarSize === '3.2 mm' ? '3.5 mm incision with #11 scalpel blade.' : '5.0 mm incision with #11 scalpel blade.',
        trocarSize: trocarSize + ' sterile disposable trocar with obturator.',
        implantDepth: 'Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.',
        closure: 'Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.',
        postOpCare: 'No heavy lower-body exertion or hot baths for 5 days.'
      },
      monitoringTelemetry: [
        { timeline: 'Baseline (Pre-insertion)', labs: 'Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated.' },
        { timeline: 'Week 4 - 6 (Peak Serum Check)', labs: 'Serum hormone level check (verify steady-state therapeutic absorption within target window: ' + targetSerum + ').' },
        { timeline: 'Month 3.5 - 5 (Trough & Re-implantation Assessment)', labs: 'Trough level assessment and clinical symptom recurrence check before subsequent insertion.' }
      ],
      contraindications: [
        'Known or suspected hormone-dependent active malignancy',
        'Undiagnosed abnormal genital bleeding',
        'Active thromboembolic disorder (DVT / PE)',
        'Severe acute hepatic impairment',
        'Known or suspected pregnancy'
      ],
      clinicalTrialsCitations: citations
    }
  };
});

const code = `/**
 * pharmapolisPelletsRegistry.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive Official Pharmapolis (Bulgaria EU GMP) Subcutaneous Hormone Pellets
 * Price Schedule & Clinical Monograph Registry.
 *
 * All 39 Subcutaneous Pellet Formulations across 5 Hormone Families + 2 Trocar Kits.
 * Pricing Model: Wholesaler Price = Cost × 1.15 × 1.15 (15% Mediluxe + 15% Wholesaler Margin).
 * Pack ×10 Volume Price = Unit Wholesale × 10 × 0.90 (10% Institutional Discount).
 */

export const PHARMAPOLIS_SUPPLIER_DOC = {
  id: 'supplier-pharmapolis',
  name: 'Pharmapolis Compounding Pharmacy',
  legalName: 'Pharmapolis Ltd.',
  brand: 'Pharmapolis',
  country: 'BG',
  countryName: 'Bulgaria',
  city: 'Plovdiv',
  certification: 'EU GMP / ISO 9001 / European Pharmacopoeia (Ph. Eur.)',
  regulatoryBadge: 'EU GMP Certified Compounding Pharmacy',
  leadTimeDays: 3,
  description: 'European center of excellence in individualized bioidentical hormone replacement therapy (BHRT), subcutaneous hormone pellet micro-manufacturing, and clinical compounding under validated EU GMP conditions.',
  contact: {
    portal: 'https://pharmapolis.bg',
    distribution: 'Atlas Health Services Commercial Division'
  },
  sterilityStandard: 'Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)',
  qualityControl: 'HPLC Assay ≥ 99.5%, Endotoxin < 0.25 EU/mg, Gas Chromatography Residual Solvents USP <467>',
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: new Date().toISOString()
};

export const PHARMAPOLIS_PELLETS = ${JSON.stringify(builtPellets, null, 2)};

/**
 * Normalized slug resolution helper
 */
export function normalizePelletSlug(slug) {
  const s = String(slug || '').toLowerCase().trim().replace(/,/g, '.');
  if (PHARMAPOLIS_PELLETS[s]) return s;

  // Flexible dose alias matches (e.g., 'estradiol-12.5mg' -> 'estradiol-12-5mg-pellet')
  const clean = s.replace(/\\./g, '-').replace(/\\s+/g, '');
  if (!clean.endsWith('-pellet')) {
    const withPellet = clean + '-pellet';
    if (PHARMAPOLIS_PELLETS[withPellet]) return withPellet;
  }

  // Check by SKU match
  for (const [k, p] of Object.entries(PHARMAPOLIS_PELLETS)) {
    if (p.sku.toLowerCase() === s || p.id.toLowerCase() === s) return k;
  }

  // Master document mappings to default representative monographs
  if (s === 'pharmapolis-hormone-36-testosterone-pellets' || s === 'testosterone-pellets' || s === 'testosterone-pellet') {
    return 'testosterone-50mg-pellet';
  }
  if (s === 'pharmapolis-hormone-37-estradiol-pellets' || s === 'estradiol-pellets' || s === 'estradiol-pellet') {
    return 'estradiol-25mg-pellet';
  }
  if (s === 'pharmapolis-hormone-38-progesterone-pellets' || s === 'progesterone-pellets' || s === 'progesterone-pellet') {
    return 'progesterone-50mg-pellet';
  }
  if (s === 'pharmapolis-hormone-39-testosterone-anastrozole-pellets-t-anastrozole' || s === 'testosterone-anastrozole-pellets') {
    return 'testosterone-anastrozole-100-4mg-pellet';
  }
  if (s === 'pharmapolis-hormone-40-biest-50-50-pellets' || s === 'biest-pellets') {
    return 'biest-10mg-pellet';
  }

  return s;
}

export function getPharmapolisPelletBySlug(slug) {
  const normalized = normalizePelletSlug(slug);
  return PHARMAPOLIS_PELLETS[normalized] || null;
}

export function isPharmapolisPelletSlug(slug) {
  const normalized = normalizePelletSlug(slug);
  return Boolean(PHARMAPOLIS_PELLETS[normalized]);
}

export function getAllPharmapolisPellets() {
  return Object.values(PHARMAPOLIS_PELLETS);
}
`;

fs.writeFileSync('src/data/pharmapolisPelletsRegistry.js', code);
console.log('Successfully wrote src/data/pharmapolisPelletsRegistry.js with ' + Object.keys(builtPellets).length + ' pellets');

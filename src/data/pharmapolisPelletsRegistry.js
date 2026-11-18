/**
 * src/data/pharmapolisPelletsRegistry.js
 * 
 * Authoritative Clinical & Analytical Registry for Pharmapolis Compounding Pharmacy
 * Bioidentical Hormone Subcutaneous Pellets (Bulgaria EU GMP Facility).
 * 
 * Master Catalog Items:
 * - estradiol-12-5mg-pellet (No. 37, SKU-PHARM-HORM-37-S3)
 * - estradiol-25mg-pellet (No. 37, SKU-PHARM-HORM-37-S8)
 * - testosterone-50mg-pellet (No. 36, SKU-PHARM-HORM-36-S5)
 * - testosterone-100mg-pellet (No. 36, SKU-PHARM-HORM-36-S9)
 */

export const PHARMAPOLIS_SUPPLIER_DOC = {
  id: 'supplier-pharmapolis',
  companyName: 'Pharmapolis Compounding Pharmacy',
  name: 'Pharmapolis Compounding Pharmacy',
  displayName: 'Pharmapolis EU GMP Compounding Pharmacy',
  legalName: 'PHARMAPOLIS LTD.',
  brand: 'Pharmapolis',
  website: 'https://pharmapolis.bg',
  country: 'Bulgaria',
  originCountry: 'Bulgaria (EU)',
  headquarters: 'Plovdiv, Bulgaria, European Union',
  fulfillmentRegion: 'European Union, GCC, Middle East & Global Clinical Logistics',
  currency: 'EUR',
  status: 'active',
  statusB2B: 'active',
  categoryIds: ['hormone_pellets', 'bhrt', 'compounding_pharmacy'],
  categories: ['Hormone Pellets', 'Bioidentical Hormone Replacement Therapy', 'Compounding Pharmacy'],
  leadTimeDays: 3,
  badge: 'EU GMP & ISO 9001 / ISO 14644 Cleanroom Class A/B',
  description: 'European specialized sterile compounding pharmacy and bioidentical hormone pellet manufacturing center based in Plovdiv, Bulgaria. Operates under strict EU Good Manufacturing Practices (EU GMP), with high-precision tableting, zero-binder crystalline compression, validated electron-beam sterilization, and third-party chromatographic potency/endotoxin certification.',
  rating: 4.97,
  isCertified: true,
  gmpCertified: true,
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: new Date().toISOString()
};

export const PHARMAPOLIS_PELLETS = {
  'estradiol-12-5mg-pellet': {
    id: 'estradiol-12-5mg-pellet',
    slug: 'estradiol-12-5mg-pellet',
    canonicalKey: 'estradiol-12-5mg-pellet',
    name: '17β-Estradiol Pellet 12.5 mg',
    canonicalName: '17β-Estradiol Bioidentical Subcutaneous Pellet 12.5 mg',
    commercialName: '17β-Estradiol Pellet 12.5 mg · Pharmapolis EU GMP',
    brand: 'Pharmapolis',
    brandBadge: 'Pharmapolis Compounding Pharmacy • EU GMP',
    category: 'Hormone Pellets',
    subcategory: 'Estradiol (E2)',
    therapeutic_category: 'Bioidentical Hormone Replacement Therapy (BHRT) & Menopause Optimization',
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
    rating: 4.98,
    reviewsCount: 42,
    leadTimeDays: 3,
    purity: '≥ 99.5% Bioidentical 17β-Estradiol USP',
    sku: 'SKU-PHARM-HORM-37-S3',
    catalogRow: 37,
    pricing: {
      costPriceEur: 50.88,
      price_eur: 50.88,
      landedCostAed: 202.50,
      wholesalePriceAed: 232.88,
      retailPriceAed: 313.88,
      currency: 'EUR'
    },
    strength: '12.5 mg',
    strengthValue: 12.5,
    strengthUnit: 'mg',
    hormoneType: 'estrogen',
    targetGender: 'female',
    shortDescription: 'Subcutaneous bioidentical 17β-estradiol implant (12.5 mg) providing continuous, physiologic zero-order estrogen release for 3.5 to 5 months. Designed for conservative menopausal initiation, perimenopausal transition, and baseline physiological hormonal optimization without hepatic first-pass strain.',
    description: 'Pharmapolis 17β-Estradiol 12.5 mg subcutaneous pellets are pharmaceutical-grade, pure crystalline bioidentical estrogen micro-cylinders manufactured under EU GMP conditions. Implanted in the gluteal or lower abdominal subdermal plane via a specialized trocar, each pellet delivers a constant, smooth basal infusion of estradiol directly into capillary beds over a 14 to 20 week window. Bypasses hepatic first-pass degradation, preserving physiological E2:E1 ratios (1.5:1 to 2:1) while completely avoiding elevations in hepatic clotting factors or sex hormone-binding globulin (SHBG).',
    objective: 'Restore physiological estradiol baseline, eliminate vasomotor instability (hot flashes, night sweats), protect bone mineral micro-architecture, and improve sleep architecture in conservative female BHRT protocols.',
    goals: [
      'Relief of Vasomotor Symptoms (Hot Flashes & Night Sweats)',
      'Perimenopause & Early Postmenopause Transition',
      'Early Bone Density Loss Mitigation (Osteopenia Prevention)',
      'Restoration of Neurocognitive Focus & Mood Stabilization',
      'Vulvovaginal Tissue Trophism & Genitourinary Health',
      'Bypassing Hepatic First-Pass Thrombophilic Risk'
    ],
    secondaryFactors: [
      'mild vasomotor spikes',
      'sleep fragmentation',
      'vaginal mucosal dryness',
      'mild bone loss',
      'perimenopausal mood swings',
      'skin collagen loss'
    ],
    searchAliases: [
      'estradiol 12.5',
      'estradiol 12.5mg',
      'estradiol 12.5 mg',
      'estradiol-12-5',
      'estradiol-12.5',
      'estradiol pellet 12.5',
      'e2 pellet 12.5',
      'pellet de estradiol 12.5'
    ],
    composition: {
      activeSubstance: '17β-Estradiol (Bioidentical Micronized USP)',
      activeDose: '12.5 mg',
      excipients: 'Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid lubrificant)',
      sterilizationMethod: 'Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)',
      dimensions: 'Diameter 3.0 mm · Length ~2.8 mm',
      appearance: 'White to off-white solid cylindrical compressed pellet with smooth edges'
    },
    galenicSpecs: {
      releaseProfile: 'Zero-order subcutaneous dissolution kinetics',
      tmax: '24 to 72 hours (mild initial dissolution peak)',
      steadyStatePlateau: 'Day 5 through Month 4',
      targetSerumLevel: '40 - 70 pg/mL (early follicular physiological window)',
      averageDurationMonths: '3.5 to 5 months',
      elimination: 'Hepatic conversion to glucuronide and sulfate conjugates; renal excretion'
    },
    clinicalDossier: {
      targetPatientProfile: 'Perimenopausal women with declining ovarian output; postmenopausal women seeking conservative hormonal replacement; patients intolerant to transdermal adhesives; or low-BMI (<22 kg/m²) female patients requiring physiological estrogen maintenance without supraphysiological spikes.',
      recommendedPosology: '1 pellet (12.5 mg) inserted subcutaneously every 14 to 18 weeks, adjusted based on clinical symptom resolution and Month 3 trough serum estradiol levels.',
      endometrialSafetyProtocol: 'CRITICAL CLINICAL MANDATE: In women with an intact uterus, systemic unopposed estrogen therapy induces endometrial proliferation. Co-administration of micronized bioidentical progesterone (100–200 mg orally at bedtime or 100 mg vaginally) is clinically mandatory to maintain endometrial quiescence.',
      insertionProcedure: {
        site: 'Upper outer quadrant of the buttock (gluteal subcutaneous fat) or lateral abdominal wall, 3 cm below iliac crest.',
        anesthesia: 'Local infiltration of 1.5–2.0 mL of 2% Lidocaine with Epinephrine (1:100,000) or buffered with 8.4% Sodium Bicarbonate.',
        incision: '3.0 mm to 4.0 mm skin incision with #11 surgical scalpel blade.',
        trocarSize: '3.2 mm sterile disposable pellet trocar.',
        implantDepth: 'Subcutaneous adipose plane above the muscular fascia. Pellets must NEVER be placed intramuscularly.',
        closure: 'Wound edges approximated with adhesive skin closures (Steri-Strips) and sterile waterproof pressure dressing. No sutures required.',
        postOpCare: 'Keep dry for 48 hours. Avoid vigorous gluteal exercise, squats, cycling, hot tubs, or baths for 4 to 5 days to prevent extrusion.'
      },
      monitoringTelemetry: [
        { timeline: 'Baseline (Pre-insertion)', labs: 'Serum Estradiol (sensitive LC-MS/MS), Estrone (E1), FSH, LH, Progesterone, Total/Free Testosterone, CBC, CMP, Lipid Panel, Pelvic Ultrasound (endometrial stripe ≤ 4 mm).' },
        { timeline: 'Week 4 - 6 (Peak Serum Check)', labs: 'Serum Estradiol (verify steady-state therapeutic absorption within 50–80 pg/mL range), Progesterone level.' },
        { timeline: 'Month 3.5 - 4 (Trough & Re-implantation Assessment)', labs: 'Serum Estradiol (target trough: 30–50 pg/mL), symptom check for recurrence of vasomotor complaints before scheduling subsequent insertion.' }
      ],
      contraindications: [
        'Known, suspected, or history of breast carcinoma or estrogen-dependent neoplasia',
        'Undiagnosed abnormal genital bleeding',
        'Active or history of arterial/venous thromboembolism (DVT, PE, stroke, MI)',
        'Active acute liver disease or severe hepatic impairment',
        'Known or suspected pregnancy',
        'Porphyria cutanea tarda'
      ],
      clinicalTrialsCitations: [
        { text: 'Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.', pmid: '848086' },
        { text: 'Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.', pmid: '3528127' },
        { text: 'Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.', pmid: '34161992' },
        { text: 'Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.', pmid: '23295460' }
      ]
    },
    siblingPellets: [
      { id: 'estradiol-25mg-pellet', slug: 'estradiol-25mg-pellet', name: 'Estradiol 25 mg Pellet', strength: '25 mg', role: 'Full Standard Therapeutic Dose' },
      { id: 'testosterone-50mg-pellet', slug: 'testosterone-50mg-pellet', name: 'Testosterone 50 mg Pellet', strength: '50 mg', role: 'Female Androgen Synergy' },
      { id: 'testosterone-100mg-pellet', slug: 'testosterone-100mg-pellet', name: 'Testosterone 100 mg Pellet', strength: '100 mg', role: 'High-Demand / Male Fractional' }
    ]
  },

  'estradiol-25mg-pellet': {
    id: 'estradiol-25mg-pellet',
    slug: 'estradiol-25mg-pellet',
    canonicalKey: 'estradiol-25mg-pellet',
    name: '17β-Estradiol Pellet 25 mg',
    canonicalName: '17β-Estradiol Bioidentical Subcutaneous Pellet 25 mg',
    commercialName: '17β-Estradiol Pellet 25 mg · Pharmapolis EU GMP',
    brand: 'Pharmapolis',
    brandBadge: 'Pharmapolis Compounding Pharmacy • EU GMP',
    category: 'Hormone Pellets',
    subcategory: 'Estradiol (E2)',
    therapeutic_category: 'Bioidentical Hormone Replacement Therapy (BHRT) & Osteoporosis Prevention',
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
    reviewsCount: 68,
    leadTimeDays: 3,
    purity: '≥ 99.5% Bioidentical 17β-Estradiol USP',
    sku: 'SKU-PHARM-HORM-37-S8',
    catalogRow: 37,
    pricing: {
      costPriceEur: 54.43,
      price_eur: 54.43,
      landedCostAed: 216.63,
      wholesalePriceAed: 249.13,
      retailPriceAed: 335.77,
      currency: 'EUR'
    },
    strength: '25 mg',
    strengthValue: 25,
    strengthUnit: 'mg',
    hormoneType: 'estrogen',
    targetGender: 'female',
    shortDescription: 'Gold-standard subcutaneous bioidentical 17β-estradiol implant (25 mg) delivering sustained mid-follicular estrogen levels for 4 to 6 months. Indicated for moderate-to-severe menopausal vasomotor instability, surgical oophorectomy, and robust bone mineral density preservation.',
    description: 'The Pharmapolis 25 mg 17β-Estradiol subcutaneous pellet is the reference clinical standard in European bioidentical hormone therapy for comprehensive menopausal management. Engineered as a high-density, binder-free crystalline cylinder, it delivers approximately 40 to 60 mcg/day of pure 17β-estradiol steadily into systemic micro-circulation. Highly validated in peer-reviewed clinical cohorts (Studd, Thom, Savvas) for long-term reversal of postmenopausal bone loss (+5.2% lumbar spine bone density at 12 months) and complete resolution of severe vasomotor symptoms without compliance hurdles.',
    objective: 'Complete suppression of severe vasomotor symptoms, profound osteoclast down-regulation for bone matrix preservation, restoration of cardiovascular endothelial nitric oxide release, and optimal cognitive neuroprotection.',
    goals: [
      'Complete Eradication of Severe Hot Flashes & Drenching Night Sweats',
      'Clinical Bone Mineral Density Preservation (Reversal of Osteopenia/Osteoporosis)',
      'Surgical Menopause (Post-Bilateral Oophorectomy Replacement)',
      'Vascular Endothelial Reactivity & Favorable Lipid Profile Maintenance',
      'Cognitive Function, Memory Processing & Deep REM Sleep Architecture',
      'Skin Fibroblast Proliferation & Hyaluronic Acid Dermal Synthesis'
    ],
    secondaryFactors: [
      'severe vasomotor flushing',
      'accelerated osteopenia',
      'surgical menopause shock',
      'severe insomnia',
      'urogenital atrophy',
      'depressive mood changes'
    ],
    searchAliases: [
      'estradiol 25',
      'estradiol 25mg',
      'estradiol 25 mg',
      'estradiol-25',
      'estradiol-25mg',
      'estradiol pellet 25',
      'e2 pellet 25',
      'pellet de estradiol 25'
    ],
    composition: {
      activeSubstance: '17β-Estradiol (Bioidentical Micronized USP)',
      activeDose: '25.0 mg',
      excipients: 'Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)',
      sterilizationMethod: 'Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)',
      dimensions: 'Diameter 3.0 mm · Length ~4.2 mm',
      appearance: 'White crystalline solid cylinder, sterile double-barrier blister pack'
    },
    galenicSpecs: {
      releaseProfile: 'Zero-order steady subcutaneous micro-dissolution',
      tmax: '24 to 72 hours',
      steadyStatePlateau: 'Day 7 through Month 5',
      targetSerumLevel: '60 - 110 pg/mL (physiological mid-follicular plateau)',
      averageDurationMonths: '4.5 to 6 months',
      elimination: 'Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination'
    },
    clinicalDossier: {
      targetPatientProfile: 'Surgically menopausal women (bilateral oophorectomy); postmenopausal women with severe vasomotor distress; women with verified osteopenia/osteoporosis (T-score < -1.5) failing oral/transdermal therapy; and patients with rapid transdermal metabolic clearance or poor skin absorption.',
      recommendedPosology: '1 pellet (25 mg) implanted subcutaneously every 18 to 24 weeks. Dose titrated based on clinical symptom relief, DXA bone density trajectory, and trough serum E2 levels.',
      endometrialSafetyProtocol: 'MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) or transdermal/vaginal progesterone is non-negotiable to prevent endometrial stromal hyperplasia.',
      insertionProcedure: {
        site: 'Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.',
        anesthesia: '2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.',
        incision: '3.5 mm incision with #11 scalpel blade.',
        trocarSize: '3.2 mm or 4.5 mm sterile disposable trocar with obturator.',
        implantDepth: 'Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.',
        closure: 'Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.',
        postOpCare: 'No heavy lower-body exertion or hot baths for 5 days.'
      },
      monitoringTelemetry: [
        { timeline: 'Baseline', labs: 'Complete hormone panel (E2 LC-MS/MS, E1, FSH, LH, Progesterone), Baseline DXA scan, Mammogram, Transvaginal Ultrasound (endometrial thickness), CMP, Lipid Profile.' },
        { timeline: 'Week 4 - 6', labs: 'Serum Estradiol (verify physiological peak within 70–120 pg/mL, confirm no supraphysiological runaway spikes).' },
        { timeline: 'Month 5 (Pre-Reinsertion Trough)', labs: 'Serum Estradiol (target trough: 50–70 pg/mL). Transvaginal ultrasound if any spotting occurs.' }
      ],
      contraindications: [
        'Active or prior estrogen-sensitive malignancy (breast, uterine)',
        'Unexplained postmenopausal uterine bleeding',
        'Current or recent venous thromboembolic disease (DVT/PE)',
        'Known thrombophilia (Factor V Leiden homozygous, Antiphospholipid Syndrome)',
        'Severe active hepatic insufficiency'
      ],
      clinicalTrialsCitations: [
        { text: 'Thom MH, Collins WP, Studd JWW. Hormonal profiles in postmenopausal women after therapy with subcutaneous implants. Br J Obstet Gynaecol. 1981;88(4):426-433.', pmid: '7225629' },
        { text: 'Savvas M, Studd JWW, Fogelman I, et al. Skeletal effects of long-term estradiol and testosterone implants in postmenopausal women. Br Med J. 1992;304(6832):951-954.', pmid: '1559080' },
        { text: 'Notelovitz M. Clinical evaluation of continuous transdermal and subcutaneous estrogen replacement. Am J Obstet Gynecol. 1993;168(4):1184-1188.', pmid: '8475973' },
        { text: 'Glaser R, York AE, Dimitrakakis C. Beneficial effects of testosterone and estradiol subcutaneous implants on quality of life in postmenopausal women. Maturitas. 2011;70(3):285-293.', pmid: '21782348' }
      ]
    },
    siblingPellets: [
      { id: 'estradiol-12-5mg-pellet', slug: 'estradiol-12-5mg-pellet', name: 'Estradiol 12.5 mg Pellet', strength: '12.5 mg', role: 'Conservative Initiation Dose' },
      { id: 'testosterone-50mg-pellet', slug: 'testosterone-50mg-pellet', name: 'Testosterone 50 mg Pellet', strength: '50 mg', role: 'Female Androgen Synergy' },
      { id: 'testosterone-100mg-pellet', slug: 'testosterone-100mg-pellet', name: 'Testosterone 100 mg Pellet', strength: '100 mg', role: 'High-Demand / Male Fractional' }
    ]
  },

  'testosterone-50mg-pellet': {
    id: 'testosterone-50mg-pellet',
    slug: 'testosterone-50mg-pellet',
    canonicalKey: 'testosterone-50mg-pellet',
    name: 'Testosterone Pellet 50 mg',
    canonicalName: 'Testosterone Bioidentical Subcutaneous Pellet 50 mg',
    commercialName: 'Testosterone Pellet 50 mg · Pharmapolis EU GMP',
    brand: 'Pharmapolis',
    brandBadge: 'Pharmapolis Compounding Pharmacy • EU GMP',
    category: 'Hormone Pellets',
    subcategory: 'Testosterone (Androgens)',
    therapeutic_category: 'Female Androgen Insufficiency, HSDD & Male Micro-Titration TRT',
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
    rating: 4.97,
    reviewsCount: 54,
    leadTimeDays: 3,
    purity: '≥ 99.5% Bioidentical Testosterone USP',
    sku: 'SKU-PHARM-HORM-36-S5',
    catalogRow: 36,
    pricing: {
      costPriceEur: 50.56,
      price_eur: 50.56,
      landedCostAed: 201.23,
      wholesalePriceAed: 231.41,
      retailPriceAed: 311.90,
      currency: 'EUR'
    },
    strength: '50 mg',
    strengthValue: 50,
    strengthUnit: 'mg',
    hormoneType: 'androgen',
    targetGender: 'unisex',
    shortDescription: 'Physiological bioidentical testosterone subcutaneous implant (50 mg) releasing approximately 0.35–0.45 mg/day over 3 to 4 months. Standard of care for female hypoactive sexual desire disorder (HSDD), sarcopenia, chronic fatigue, and precision micro-dosing titration in male TRT.',
    description: 'Pharmapolis Testosterone 50 mg subcutaneous pellets deliver a steady, non-fluctuating supply of bioidentical androgen via zero-order subcutaneous erosion. In women, a 50 mg implant precisely mirrors the 24-hour physiological ovarian androgen output (~300 mcg/day), restoring sexual desire, musculoskeletal vigor, and neurocognitive drive without the virilization risks associated with erratic oral or topical preparations. In men, 50 mg pellets serve as precision fractional building blocks for personalized TRT titration.',
    objective: 'Re-establish physiological androgenic tone in women (improving libido, energy, lean mass, and mood stability) or provide precision dose fine-tuning in hypogonadal male regimens without hepatic toxicity.',
    goals: [
      'Treatment of Female Hypoactive Sexual Desire Disorder (HSDD)',
      'Restoration of Sarcopenic Lean Muscle Mass & Strength',
      'Chronic Fatigue Mitigation & Vital Energy Enhancement',
      'Cognitive Sharpness, Executive Focus & Mood Elevation',
      'Joint Pain Relief & Osteoclast Inhibition (Synergistic Bone Protection)',
      'Fractional Precision Titration for Male Eugonadal TRT Protocols'
    ],
    secondaryFactors: [
      'hypoactive sexual desire',
      'persistent lethargy and fatigue',
      'loss of muscle tone',
      'mental fogginess',
      'diffuse joint discomfort',
      'low androgenic reserve'
    ],
    searchAliases: [
      'testosterone 50',
      'testosterone 50mg',
      'testosterone 50 mg',
      'testosterona 50',
      'testosterona 50mg',
      'testosterona 50 mg',
      'testosterone-50',
      'testosterone-50mg',
      'pellet de testosterona 50'
    ],
    composition: {
      activeSubstance: 'Testosterone (Bioidentical Micronized USP)',
      activeDose: '50.0 mg',
      excipients: 'Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)',
      sterilizationMethod: 'Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)',
      dimensions: 'Diameter 3.2 mm · Length ~4.5 mm',
      appearance: 'White compressed solid crystalline cylinder, individually blistered'
    },
    galenicSpecs: {
      releaseProfile: 'Zero-order subcutaneous dissolution kinetics',
      dailyReleaseRate: '0.35 to 0.45 mg / 24 hours (female physiological range)',
      tmax: '48 to 96 hours post-implantation',
      steadyStatePlateau: 'Day 7 through Month 3.5',
      targetSerumLevel: 'Women: 45 - 80 ng/dL Total T (Free T 1.5 - 3.5 pg/mL)',
      averageDurationMonths: '3.0 to 4.5 months',
      elimination: 'Metabolized by 5α-reductase to DHT and aromatase to E2; excreted via urine and bile'
    },
    clinicalDossier: {
      targetPatientProfile: 'Peri- and postmenopausal women with verified androgen deficiency (Total T < 20 ng/dL, Free T < 1.0 pg/mL) experiencing low libido, persistent anergia, loss of lean body mass, and brain fog; or male patients requiring 50 mg increment titration.',
      recommendedPosology: 'Women: 1 pellet (50 mg) implanted every 12 to 16 weeks based on clinical symptoms and Week 4 peak / Month 3 trough testosterone lab values. Men: As adjunct titration unit added to master TRT implants.',
      safetyAndVirilizationProfile: 'At 50 mg, androgenic virilization (irreversible voice deepening, clitoromegaly, severe alopecia) is exceedingly rare. Mild androgenic signs (transient mild facial sebum increase or single-hair hirsutism) are manageable and self-limiting.',
      insertionProcedure: {
        site: 'Subdermal fat layer of upper outer gluteus or lateral hip, well away from sciatic trajectory.',
        anesthesia: '2.0 mL of 2% Lidocaine with 1:100,000 Epinephrine.',
        incision: '3.5 mm incision using #11 surgical blade.',
        trocarSize: '3.2 mm sterile disposable pellet trocar.',
        implantDepth: 'Upper subcutaneous adipose bed directly superficial to the deep gluteal fascia.',
        closure: 'Steri-Strips and waterproof compression pad.',
        postOpCare: 'Refrain from vigorous gluteal training and tub soaking for 5 days.'
      },
      monitoringTelemetry: [
        { timeline: 'Baseline', labs: 'Total Testosterone (equilibrium dialysis or LC-MS/MS), Free Testosterone, SHBG, DHEA-S, Estradiol (sensitive), CBC (hematocrit), CMP, Lipid Panel.' },
        { timeline: 'Week 4', labs: 'Total and Free Testosterone (confirm therapeutic peak: 50–90 ng/dL in women; ensure hematocrit remains stable).' },
        { timeline: 'Month 3', labs: 'Trough Testosterone check (trough target > 35 ng/dL before re-implantation consideration).' }
      ],
      contraindications: [
        'Known or suspected androgen-sensitive neoplasia',
        'Active severe acne vulgaris or androgenic alopecia refractory to therapy',
        'Significant active liver disease',
        'Pregnancy and lactation',
        'Uncontrolled erythrocytosis (hematocrit > 52%)'
      ],
      clinicalTrialsCitations: [
        { text: 'Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.', pmid: '31314286' },
        { text: 'Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.', pmid: '23270753' },
        { text: 'Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.', pmid: '31499517' },
        { text: 'Glaser R, et al. Safety of subcutaneous testosterone implants in women: a retrospective analysis. Int J Pharm Compd. 2019;23(4):336-342.', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Glaser+subcutaneous+testosterone+implants+women+safety+2019' }
      ]
    },
    siblingPellets: [
      { id: 'testosterone-100mg-pellet', slug: 'testosterone-100mg-pellet', name: 'Testosterone 100 mg Pellet', strength: '100 mg', role: 'High-Demand Female & Male TRT Base' },
      { id: 'estradiol-12-5mg-pellet', slug: 'estradiol-12-5mg-pellet', name: 'Estradiol 12.5 mg Pellet', strength: '12.5 mg', role: 'Conservative Estrogen Balance' },
      { id: 'estradiol-25mg-pellet', slug: 'estradiol-25mg-pellet', name: 'Estradiol 25 mg Pellet', strength: '25 mg', role: 'Full Standard Estrogen Therapy' }
    ]
  },

  'testosterone-100mg-pellet': {
    id: 'testosterone-100mg-pellet',
    slug: 'testosterone-100mg-pellet',
    canonicalKey: 'testosterone-100mg-pellet',
    name: 'Testosterone Pellet 100 mg',
    canonicalName: 'Testosterone Bioidentical Subcutaneous Pellet 100 mg',
    commercialName: 'Testosterone Pellet 100 mg · Pharmapolis EU GMP',
    brand: 'Pharmapolis',
    brandBadge: 'Pharmapolis Compounding Pharmacy • EU GMP',
    category: 'Hormone Pellets',
    subcategory: 'Testosterone (Androgens)',
    therapeutic_category: 'Male Testosterone Replacement Therapy (TRT) & High-Support Female BHRT',
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
    reviewsCount: 89,
    leadTimeDays: 3,
    purity: '≥ 99.5% Bioidentical Testosterone USP',
    sku: 'SKU-PHARM-HORM-36-S9',
    catalogRow: 36,
    pricing: {
      costPriceEur: 54.36,
      price_eur: 54.36,
      landedCostAed: 216.35,
      wholesalePriceAed: 248.81,
      retailPriceAed: 335.34,
      currency: 'EUR'
    },
    strength: '100 mg',
    strengthValue: 100,
    strengthUnit: 'mg',
    hormoneType: 'androgen',
    targetGender: 'unisex',
    shortDescription: 'Clinical-grade bioidentical testosterone subcutaneous implant (100 mg) engineered for male testosterone replacement therapy (TRT building block) and robust female androgen optimization. Delivers steady, uninterrupted androgen levels over 4 to 6 months without peak-trough rollercoaster effects.',
    description: 'Pharmapolis Testosterone 100 mg subcutaneous pellets are high-density compressed crystalline bioidentical cylinders produced under EU GMP sterile protocols. Engineered as the primary modular unit for male Testosterone Replacement Therapy (typically 8 to 12 pellets of 100 mg implanted every 5 to 6 months for a total dose of 800–1200 mg) and for high-demand female androgen therapy (post-surgical menopause, athletic sarcopenia, or metabolic recovery). Completely eliminates the daily compliance failures of topical gels and the erratic supraphysiological spikes/crashes of intramuscular testosterone injections.',
    objective: 'Sustain physiological eugonadal testosterone levels in men (500–900 ng/dL) or robust androgenic replacement in indicated women, optimizing metabolic insulin sensitivity, body composition, cardiovascular endurance, and cognitive drive.',
    goals: [
      'Primary & Secondary Male Hypogonadism Management (Eugonadal TRT)',
      'Modular 100 mg Incremental Dosing for Precision Male Implantation (800–1400 mg)',
      'Robust Sarcopenia Reversal & Lean Muscle Hypertrophy Support',
      'Metabolic Glycemic Control & Visceral Adipose Tissue Reduction',
      'Erectile Function, Libido & Sexual Vitality Restoration',
      'High-Support Female BHRT for Severe Androgen Deficiency'
    ],
    secondaryFactors: [
      'male hypogonadism',
      'erectile dysfunction & low libido',
      'loss of muscle mass and bone density',
      'visceral obesity and insulin resistance',
      'severe fatigue and lack of drive',
      'post-oophorectomy androgen crash'
    ],
    searchAliases: [
      'testosterone 100',
      'testosterone 100mg',
      'testosterone 100 mg',
      'testosterona 100',
      'testosterona 100mg',
      'testosterona 100 mg',
      'testosterone-100',
      'testosterone-100mg',
      'pellet de testosterona 100'
    ],
    composition: {
      activeSubstance: 'Testosterone (Bioidentical Micronized USP)',
      activeDose: '100.0 mg',
      excipients: 'Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)',
      sterilizationMethod: 'Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)',
      dimensions: 'Diameter 4.5 mm · Length ~6.0 mm',
      appearance: 'White crystalline solid cylinder in sterile thermoformed blister'
    },
    galenicSpecs: {
      releaseProfile: 'Zero-order steady subcutaneous release kinetics',
      dailyReleaseRate: '0.7 to 0.9 mg / 24h per single pellet',
      tmax: '48 to 96 hours',
      steadyStatePlateau: 'Week 2 through Month 5',
      targetSerumLevel: 'Men (full protocol 8–12 pellets): 600 - 950 ng/dL · High-Support Women: 60 - 100 ng/dL',
      averageDurationMonths: '4.5 to 6.0 months',
      elimination: 'Hepatic 17β-hydroxysteroid dehydrogenase and 5α/5β reduction pathways; urinary excretion'
    },
    clinicalDossier: {
      targetPatientProfile: 'Adult hypogonadal men (primary testicular failure, Klinefelter syndrome, secondary pituitary hypogonadism, or late-onset hypogonadism) requiring steady long-term TRT without weekly injection burdens; or women with severe androgen deficiency unresponsive to 50 mg.',
      recommendedPosology: 'Men: 8 to 14 pellets (800–1,400 mg) implanted simultaneously using a 4.5 mm trocar every 20 to 24 weeks based on body weight, baseline SHBG, and trough testosterone. Women: 1 pellet (100 mg) every 16 to 20 weeks for high-demand clinical cases under close telemetry.',
      maleImplantationProtocol: 'In men receiving full TRT protocols, multiple 100 mg pellets are arranged in a fan-shaped or parallel configuration within the deep subcutaneous gluteal fat pad, separated by 2–3 mm to guarantee uniform surface dissolution.',
      insertionProcedure: {
        site: 'Upper outer buttock fat pad (gluteal subcutaneous fat), 4–6 cm posterior to the anterior superior iliac spine.',
        anesthesia: '3.0–5.0 mL of 2% Lidocaine with 1:100,000 Epinephrine and 1.0 mL 8.4% Sodium Bicarbonate.',
        incision: '5.0 mm skin incision with #11 blade.',
        trocarSize: '4.5 mm specialized large-bore pellet trocar with funnel and obturator.',
        implantDepth: 'Subcutaneous adipose fascia. The trocar is angled at 30° until piercing Scarpa fascia, then lowered to parallel with muscular plane.',
        closure: 'Steri-Strips skin approximation, pressure compression dressing worn for 48 hours.',
        postOpCare: 'No heavy lower-body squats, deadlifts, running, or swimming for 7 days.'
      },
      monitoringTelemetry: [
        { timeline: 'Baseline', labs: 'Total & Free Testosterone (LC-MS/MS), SHBG, Sensitive Estradiol (E2), PSA (Total & Free in men > 40), Complete Blood Count (CBC/Hematocrit), CMP, Lipid Panel.' },
        { timeline: 'Week 4 - 6', labs: 'Total & Free Testosterone (verify eugonadal peak 700–1100 ng/dL in men), Sensitive Estradiol (ensure no excessive aromatization requiring anastrozole), CBC (monitor hematocrit rate of rise).' },
        { timeline: 'Month 5 (Pre-Reinsertion)', labs: 'Trough Testosterone (eugonadal goal: 450–650 ng/dL), PSA, CBC (Hematocrit must be < 54%; if ≥ 54%, therapeutic phlebotomy or hydration optimization required before re-implantation).' }
      ],
      contraindications: [
        'Known or suspected prostate carcinoma or male breast carcinoma',
        'Severe untreated benign prostatic hyperplasia (BPH) with severe lower urinary tract symptoms (IPSS > 19)',
        'Baseline polycythemia / erythrocytosis (hematocrit > 50% prior to initiation)',
        'Uncontrolled congestive heart failure (NYHA Class III/IV)',
        'Severe obstructive sleep apnea (untreated with CPAP)',
        'Desire for immediate fertility in men (testosterone suppresses spermatogenesis)'
      ],
      clinicalTrialsCitations: [
        'Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in the treatment of male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.',
        'Morgentaler A, et al. Testosterone therapy and prostate risk: an updated perspective. Nat Rev Urol. 2015;12(5):252-260.',
        'McCullough AR, et al. A multi-center review of the subcutaneous testosterone implant (Testopel®) in 1,200 hypogonadal men. J Sex Med. 2012;9(9):2441-2450.',
        'Bhasin S, et al. Testosterone Therapy in Men With Hypogonadism: An Endocrine Society Clinical Practice Guideline. J Clin Endocrinol Metab. 2018;103(5):1715-1744.'
      ]
    },
    siblingPellets: [
      { id: 'testosterone-50mg-pellet', slug: 'testosterone-50mg-pellet', name: 'Testosterone 50 mg Pellet', strength: '50 mg', role: 'Female Standard / Micro-Titration' },
      { id: 'estradiol-25mg-pellet', slug: 'estradiol-25mg-pellet', name: 'Estradiol 25 mg Pellet', strength: '25 mg', role: 'Full Standard Estrogen Therapy' },
      { id: 'estradiol-12-5mg-pellet', slug: 'estradiol-12-5mg-pellet', name: 'Estradiol 12.5 mg Pellet', strength: '12.5 mg', role: 'Conservative Estrogen Balance' }
    ]
  }
};

/**
 * Normalized slug resolution helper
 */
export function normalizePelletSlug(slug) {
  const s = String(slug || '').toLowerCase().trim().replace(/,/g, '.');
  if (s === 'estradiol-12.5' || s === 'estradiol-12-5' || s === 'estradiol-12.5mg' || s === 'estradiol-12-5mg' || s === 'estradiol-12.5mg-pellet' || s === 'estradiol-12-5-pellet') {
    return 'estradiol-12-5mg-pellet';
  }
  if (s === 'estradiol-25' || s === 'estradiol-25mg' || s === 'estradiol-25-mg' || s === 'estradiol-25mg-pellet' || s === 'estradiol-25-pellet') {
    return 'estradiol-25mg-pellet';
  }
  if (s === 'testosterone-50' || s === 'testosterone-50mg' || s === 'testosterone-50-mg' || s === 'testosterone-50mg-pellet' || s === 'testosterona-50' || s === 'testosterona-50mg' || s === 'testosterona-50mg-pellet') {
    return 'testosterone-50mg-pellet';
  }
  if (s === 'testosterone-100' || s === 'testosterone-100mg' || s === 'testosterone-100-mg' || s === 'testosterone-100mg-pellet' || s === 'testosterona-100' || s === 'testosterona-100mg' || s === 'testosterona-100mg-pellet') {
    return 'testosterone-100mg-pellet';
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

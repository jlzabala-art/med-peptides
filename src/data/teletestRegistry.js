/**
 * src/data/teletestRegistry.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Clinical Registry for TeleTest Analytika® Diagnostic Panels.
 * European Reference Laboratory authorized by Generalitat de Catalunya (E08750211)
 * and ISO 17025 accredited (Barcelona, EU).
 *
 * Golden Standard: English by default as per platform standards.
 * Pure data isolation — zero cross-contamination with peptides or other brands.
 */

export const TELETEST_PRODUCTS = {
  'teletest-mineralograma-cabello-htma': {
    id: 'teletest-mineralograma-cabello-htma',
    slug: 'teletest-mineralograma-cabello-htma',
    canonicalKey: 'teletest-mineralograma-cabello-htma',
    name: 'TeleTest™ Hair Tissue Mineral Analysis (HTMA)',
    canonicalName: 'TeleTest™ Hair Tissue Mineral Analysis (HTMA)',
    brand: 'TeleTest Analytika®',
    brandSlug: 'teletest',
    category: 'Clinical Diagnostics & Toxicology',
    subcategory: 'Hair Tissue Mineral Analysis (HTMA)',
    therapeutic_category: 'Trace Elements & Heavy Metals Toxicology',
    type: 'diagnostic',
    productType: 'diagnostic',
    is_diagnostic: true,
    isDiagnostic: true,
    price: 145.00,
    currency: 'EUR',
    currencySymbol: '€',
    status: 'active',
    rating: 4.9,
    reviewsCount: 42,
    leadTimeDays: 5,
    turnaround: '5 – 7 Business Days',
    sampleMatrix: 'Scalp Hair (Proximal 3 cm from occiput, 0.5g)',
    sampleType: 'Hair Specimen',
    methodology: 'ICP-MS/MS (Tandem Mass Spectrometry) & ICP-OES',
    accreditation: 'Generalitat de Catalunya E08750211 · ISO 17025 Accredited',
    referenceLab: 'TeleTest Analytika Central Reference Laboratory (Barcelona, EU)',
    laboratoryCode: 'Generalitat E08750211',
    image: '/images/products/teletest/mineralograma-cabello.svg',
    imageUrl: '/images/products/teletest/mineralograma-cabello.svg',
    sampleReportUrl: '/docs/teletest-report-htma.pdf',
    badge: 'ISO 17025 European Reference Laboratory',
    supplierName: 'TeleTest Analytika',
    supplier: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    suppliers: ['supplier-teletest'],
    supplierIds: ['supplier-teletest'],
    isSingleSupplierLocked: true,
    shortDescription:
      'Quantitative 90-day intracellular mineral profile and toxic heavy metals screen across 36+ elements and 4 physiological ratios via tandem mass spectrometry (ICP-MS/MS).',
    description:
      'Comprehensive clinical Hair Tissue Mineral Analysis (HTMA) providing a precise retrospective 90-day metabolic biopsy of intracellular trace elements and toxic heavy metal bioaccumulation. Unlike serum blood tests which only reflect transient homeostasis of the last 24–48 hours, hair fibers sequester metabolic minerals and environmental toxic loads as they keratinize, providing an unadulterated timeline of chronic tissue storage.',
    clinicalIndications: [
      'Chronic fatigue syndrome and unexplained mitochondrial exhaustion',
      'Suspected heavy metal toxicity (mercury, lead, cadmium, arsenic, aluminum, nickel)',
      'Adrenal and thyroid endocrine dysfunction reflected in Ca/Mg and Na/K ratios',
      'Subclinical mineral deficiencies unresponsive to standard oral supplementation',
      'Neurological brain fog, mood volatility, and chronic oxidative stress'
    ],
    whatTestTellsYou: [
      'Exact concentrations of 15 essential nutritional minerals (Ca, Mg, Na, K, Zn, Cu, Fe, Mn, Cr, Se, Mo, P, B, Co, V)',
      'Quantification of 21 toxic and environmental heavy metals (Hg, Pb, Cd, As, Al, Ni, Sb, Ba, Be, Bi, Pt, Tl, Th, U, Sn, Ti, Ag, Sr, Ge, Rb, Zr)',
      '4 Core Physiological Ratios: Ca/Mg (Insulin/Blood Sugar Sensitivity), Na/K (Adrenal Vitality), Zn/Cu (Hormonal Balance & Neurotransmitters), Fe/Cu (Cellular Energy & Detoxification)',
      'Metabolic oxidation rate classification (Fast vs. Slow Oxidizer) for customized nutritional guidance'
    ],
    kitContents: [
      'Clinical hair specimen collection scale / balance (0.5g precision)',
      'Sterile surgical-grade specimen envelope',
      'Barcoded patient laboratory requisition form',
      'Illustrated step-by-step sample collection guide',
      'Pre-addressed, prepaid courier return envelope to Barcelona Central Laboratory'
    ],
    collectionProtocol: [
      { step: 1, title: 'Wash & Dry', desc: 'Wash hair with standard shampoo and dry thoroughly. Do not apply leave-in treatments, dyes, or styling products on the day of collection.' },
      { step: 2, title: 'Sample Collection', desc: 'Cut 0.5g of hair from 4–5 small spots across the posterior occipital region as close to the scalp as possible. Retain only the proximal 2.5–3 cm.' },
      { step: 3, title: 'Scale Verification', desc: 'Place hair into the included cardboard balance to ensure sufficient mass (0.5g) for duplicate ICP-MS/MS verification.' },
      { step: 4, title: 'Dispatch to Lab', desc: 'Seal hair inside the specimen envelope, complete the barcoded requisition form, and dispatch via the prepaid courier mailer.' }
    ],
    variants: [
      {
        id: 'var-teletest-htma-std',
        name: 'Complete Kit & ICP-MS/MS Laboratory Analysis',
        strength: 'Complete Kit & ICP-MS/MS Laboratory Analysis',
        dose: 'Complete Kit & ICP-MS/MS Laboratory Analysis',
        presentation: 'Clinical Collection Kit + Lab Testing',
        price: 145.00,
        retailPrice: 175.00,
        wholesalePrice: 125.00,
        inStock: true,
        supplierId: 'supplier-teletest',
        supplierName: 'TeleTest Analytika'
      }
    ]
  },

  'teletest-test-omega': {
    id: 'teletest-test-omega',
    slug: 'teletest-test-omega',
    canonicalKey: 'teletest-test-omega',
    name: 'TeleTest™ Omega-3 Index & Complete Fatty Acids Profile',
    canonicalName: 'TeleTest™ Omega-3 Index & Complete Fatty Acids Profile',
    brand: 'TeleTest Analytika®',
    brandSlug: 'teletest',
    category: 'Clinical Diagnostics & Metabolic Health',
    subcategory: 'Omega Fatty Acids & Inflammatory Index',
    therapeutic_category: 'Cardiovascular Risk & Cellular Lipid Membrane Fluidity',
    type: 'diagnostic',
    productType: 'diagnostic',
    is_diagnostic: true,
    isDiagnostic: true,
    price: 115.00,
    currency: 'EUR',
    currencySymbol: '€',
    status: 'active',
    rating: 4.9,
    reviewsCount: 36,
    leadTimeDays: 5,
    turnaround: '5 – 7 Business Days',
    sampleMatrix: 'Dried Blood Spot (DBS finger-prick collection, 2 blood drops)',
    sampleType: 'Dried Blood Spot (DBS)',
    methodology: 'Capillary Gas Chromatography with Flame Ionization Detection (GC-FID)',
    accreditation: 'Generalitat de Catalunya E08750211 · ISO 17025 Accredited',
    referenceLab: 'TeleTest Analytika Central Reference Laboratory (Barcelona, EU)',
    laboratoryCode: 'Generalitat E08750211',
    image: '/images/products/teletest/omega-test.svg',
    imageUrl: '/images/products/teletest/omega-test.svg',
    sampleReportUrl: '/docs/teletest-report-omega.pdf',
    badge: 'ISO 17025 European Reference Laboratory',
    supplierName: 'TeleTest Analytika',
    supplier: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    suppliers: ['supplier-teletest'],
    supplierIds: ['supplier-teletest'],
    isSingleSupplierLocked: true,
    shortDescription:
      'Gold-standard erythrocyte membrane HS-Omega-3 Index®, AA:EPA inflammatory ratio, and comprehensive 26-fatty acid quantification via capillary gas chromatography (GC-FID).',
    description:
      'Clinical cellular membrane fatty acid analysis quantifying the percentage of EPA (Eicosapentaenoic Acid) and DHA (Docosahexaenoic Acid) incorporated into red blood cell membranes. Evaluates the authoritative Arachidonic Acid (AA) to EPA ratio to measure systemic silent inflammation and cardiovascular protection.',
    clinicalIndications: [
      'Cardiovascular risk stratification and vascular endothelial inflammation assessment',
      'Evaluating systemic baseline inflammation in metabolic and autoimmune syndromes',
      'Optimizing EPA/DHA therapeutic dosing and verifying supplement bioavailability',
      'Neuro-cognitive health, brain membrane fluidity, and psychiatric resilience',
      'Pre- and post-protocol monitoring for anti-aging and lipid longevity pathways'
    ],
    whatTestTellsYou: [
      'HS-Omega-3 Index®: The definitive erythrocyte percentage of EPA + DHA (Target >8.0% for maximum cardioprotection)',
      'Arachidonic Acid to EPA (AA:EPA) Ratio: The primary clinical marker of cellular silent inflammation (Optimal 1.5–3.0)',
      'Total Omega-6 to Omega-3 Balance: Assessing dietary lipid pro-inflammatory skew',
      'Trans-Fatty Acid Index: Tracking industrial trans fats incorporating into cellular membranes',
      'Complete Profile of 26 Saturated, Monounsaturated, and Polyunsaturated Fatty Acids'
    ],
    kitContents: [
      '2 Safety automated single-use lancets',
      'Whatman 903 protein-saver Dried Blood Spot (DBS) collection card',
      'Antiseptic prep wipes and sterile adhesive bandage',
      'Moisture-barrier desiccant transport pouch',
      'Pre-addressed, prepaid courier return envelope to Barcelona Central Laboratory'
    ],
    collectionProtocol: [
      { step: 1, title: 'Warm & Sanitize', desc: 'Wash hands in warm water to stimulate peripheral capillary perfusion. Cleanse the side of the ring or middle finger with the antiseptic wipe.' },
      { step: 2, title: 'Lancet Activation', desc: 'Twist off the lancet protective cap, place firmly against fingertip, and press trigger until it clicks.' },
      { step: 3, title: 'Spot Inoculation', desc: 'Allow 2 large free-falling blood drops to saturate both marked circles on the collection card without touching the paper directly.' },
      { step: 4, title: 'Dry & Dispatch', desc: 'Air-dry the card for 30 minutes at room temperature, seal inside the desiccant pouch, and return via the prepaid courier mailer.' }
    ],
    variants: [
      {
        id: 'var-teletest-omega-std',
        name: 'Complete Kit & GC-FID Laboratory Analysis',
        strength: 'Complete Kit & GC-FID Laboratory Analysis',
        dose: 'Complete Kit & GC-FID Laboratory Analysis',
        presentation: 'Clinical Collection Kit + Lab Testing',
        price: 115.00,
        retailPrice: 140.00,
        wholesalePrice: 98.00,
        inStock: true,
        supplierId: 'supplier-teletest',
        supplierName: 'TeleTest Analytika'
      }
    ]
  },

  'teletest-saliva-metabolizer-detox': {
    id: 'teletest-saliva-metabolizer-detox',
    slug: 'teletest-saliva-metabolizer-detox',
    canonicalKey: 'teletest-saliva-metabolizer-detox',
    name: 'TeleTest™ Saliva Metabolizer & Hepatic Detox Pharmacogenetics',
    canonicalName: 'TeleTest™ Saliva Metabolizer & Hepatic Detox Pharmacogenetics',
    brand: 'TeleTest Analytika®',
    brandSlug: 'teletest',
    category: 'Clinical Diagnostics & Pharmacogenetics',
    subcategory: 'Hepatic Detox & Drug Metabolism',
    therapeutic_category: 'Phase I & II Hepatic Biotransformation & Pharmacogenetics',
    type: 'diagnostic',
    productType: 'diagnostic',
    is_diagnostic: true,
    isDiagnostic: true,
    price: 175.00,
    currency: 'EUR',
    currencySymbol: '€',
    status: 'active',
    rating: 4.8,
    reviewsCount: 29,
    leadTimeDays: 7,
    turnaround: '7 – 10 Business Days',
    sampleMatrix: 'Buccal Swab / Saliva DNA Collection (Non-invasive)',
    sampleType: 'Buccal Swab (Saliva DNA)',
    methodology: 'High-Throughput Real-Time Multiplex PCR & Microarray Genotyping',
    accreditation: 'Generalitat de Catalunya E08750211 · ISO 17025 Accredited',
    referenceLab: 'TeleTest Analytika Central Reference Laboratory (Barcelona, EU)',
    laboratoryCode: 'Generalitat E08750211',
    image: '/images/products/teletest/metabolizer-detox.svg',
    imageUrl: '/images/products/teletest/metabolizer-detox.svg',
    sampleReportUrl: '/docs/teletest-report-metabolizer.pdf',
    badge: 'ISO 17025 European Reference Laboratory',
    supplierName: 'TeleTest Analytika',
    supplier: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    suppliers: ['supplier-teletest'],
    supplierIds: ['supplier-teletest'],
    isSingleSupplierLocked: true,
    shortDescription:
      'Pharmacogenetic analysis of Phase I Cytochrome P450 and Phase II conjugation enzymes to assess individual drug metabolism rates, toxic bioaccumulation risks, and liver clearance.',
    description:
      'Advanced molecular pharmacogenetic panel analyzing single nucleotide polymorphisms (SNPs) across essential Phase I (CYP1A2, CYP2C9, CYP2C19, CYP2D6, CYP3A4/5) and Phase II (GSTM1, GSTT1, GSTP1, NAT2, SOD2, COMT) detoxification genes. Classifies your personal metabolic phenotype (Poor, Intermediate, Normal, or Ultra-Rapid Metabolizer) to prevent adverse drug reactions and guide customized clinical therapies.',
    clinicalIndications: [
      'Recurrent adverse drug reactions, atypical drug sensitivities, or therapeutic resistance',
      'Personalizing prescription dosages for cardiovascular, psychiatric, and pain medications',
      'Multiple Chemical Sensitivity (MCS), persistent toxic overload, or impaired toxin elimination',
      'Nutritional nutrigenomics optimization and glutathione conjugation assessment',
      'Pre-treatment safety planning prior to starting long-term medical protocols'
    ],
    whatTestTellsYou: [
      'Phase I Oxidation Phenotypes (CYP1A2, CYP2C9, CYP2C19, CYP2D6, CYP3A4/3A5): Pinpointing rapid vs. slow biotransformation',
      'Phase II Conjugation Efficiency (GST Glutathione-S-Transferases, NAT2 Acetylation, COMT Methylation): Assessing ability to neutralize toxic reactive intermediates',
      'Superoxide Dismutase (SOD2) & Catalase Antioxidant Defense: Intracellular reactive oxygen species (ROS) mitigation capacity',
      'Actionable CPIC-aligned Clinical Guidance for over 150 therapeutic medications and xenobiotics'
    ],
    kitContents: [
      'Sterile oral mucosal buccal swab with DNA stabilization buffer',
      'Leak-proof specimen transport tube with unique barcode ID',
      'Barcoded laboratory test requisition document',
      'Step-by-step patient collection instructions',
      'Pre-addressed, prepaid courier return envelope to Barcelona Central Laboratory'
    ],
    collectionProtocol: [
      { step: 1, title: 'Pre-Collection Fast', desc: 'Rinse mouth with plain water 30 minutes before collection. Do not eat, drink, smoke, or chew gum for 30 minutes prior to sampling.' },
      { step: 2, title: 'Buccal Swab', desc: 'Firmly rub the sterile swab against the inside of both cheeks for 60 seconds (30 seconds per cheek) to collect epithelial cells.' },
      { step: 3, title: 'Stabilization Tube', desc: 'Insert swab into the buffer preservation vial, snap the shaft at the breakpoint line, and screw the cap on tightly.' },
      { step: 4, title: 'Ship to Barcelona Lab', desc: 'Place tube in the biohazard protective bag and ship immediately using the prepaid express mailer.' }
    ],
    variants: [
      {
        id: 'var-teletest-metabolizer-std',
        name: 'Complete Kit & Real-Time PCR Laboratory Analysis',
        strength: 'Complete Kit & Real-Time PCR Laboratory Analysis',
        dose: 'Complete Kit & Real-Time PCR Laboratory Analysis',
        presentation: 'Clinical Collection Kit + Lab Testing',
        price: 175.00,
        retailPrice: 210.00,
        wholesalePrice: 148.00,
        inStock: true,
        supplierId: 'supplier-teletest',
        supplierName: 'TeleTest Analytika'
      }
    ]
  },

  'teletest-gnt-hla-autoinmunidad': {
    id: 'teletest-gnt-hla-autoinmunidad',
    slug: 'teletest-gnt-hla-autoinmunidad',
    canonicalKey: 'teletest-gnt-hla-autoinmunidad',
    name: 'TeleTest™ HLA Autoimmunity Genetic Panel',
    canonicalName: 'TeleTest™ HLA Autoimmunity Genetic Panel',
    brand: 'TeleTest Analytika®',
    brandSlug: 'teletest',
    category: 'Clinical Diagnostics & Immunogenetics',
    subcategory: 'HLA Typing & Autoimmune Predisposition',
    therapeutic_category: 'Major Histocompatibility Complex (MHC) Immunogenetics',
    type: 'diagnostic',
    productType: 'diagnostic',
    is_diagnostic: true,
    isDiagnostic: true,
    price: 180.00,
    currency: 'EUR',
    currencySymbol: '€',
    status: 'active',
    rating: 4.9,
    reviewsCount: 31,
    leadTimeDays: 7,
    turnaround: '7 – 10 Business Days',
    sampleMatrix: 'Buccal Swab / Saliva DNA (or Peripheral Blood)',
    sampleType: 'Buccal Swab (DNA)',
    methodology: 'High-Resolution PCR-SSO (Sequence-Specific Oligonucleotides) & Multiplex PCR',
    accreditation: 'Generalitat de Catalunya E08750211 · ISO 17025 Accredited',
    referenceLab: 'TeleTest Analytika Central Reference Laboratory (Barcelona, EU)',
    laboratoryCode: 'Generalitat E08750211',
    image: '/images/products/teletest/hla-autoinmunidad.svg',
    imageUrl: '/images/products/teletest/hla-autoinmunidad.svg',
    sampleReportUrl: '/docs/teletest-report-hla-autoimmunity.pdf',
    badge: 'ISO 17025 European Reference Laboratory',
    supplierName: 'TeleTest Analytika',
    supplier: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    suppliers: ['supplier-teletest'],
    supplierIds: ['supplier-teletest'],
    isSingleSupplierLocked: true,
    shortDescription:
      'High-resolution molecular typing of Human Leukocyte Antigen (HLA Class I & II) alleles to evaluate lifelong genetic predisposition to major systemic autoimmune pathologies.',
    description:
      'Authoritative immunogenetic diagnostic assay resolving HLA Class I (HLA-B*27, HLA-B*51) and HLA Class II (HLA-DRB1, HLA-DQB1, HLA-DQA1) alleles. Major Histocompatibility Complex (MHC) molecules govern immune discrimination between self and non-self peptides; specific genetic variants convey marked relative risk for conditions such as Ankylosing Spondylitis, Rheumatoid Arthritis, Hashimoto Thyroiditis, and Type 1 Diabetes.',
    clinicalIndications: [
      'Differential diagnosis for inflammatory axial back pain and joint stiffness (HLA-B27 screening)',
      'Unexplained chronic systemic inflammation, elevated CRP/ESR with negative standard autoantibodies',
      'Strong family history of autoimmune diseases (Hashimoto, Vitiligo, Lupus, Spondylitis)',
      'Determining underlying genetic immunotype in complex multi-system clinical presentations',
      'Guiding proactive functional and anti-inflammatory lifestyle protocols before tissue damage occurs'
    ],
    whatTestTellsYou: [
      'HLA-B*27 Status: High-confidence molecular determination for Ankylosing Spondylitis, Psoriatic Arthritis, and Reactive Arthritis',
      'HLA-B*51 Status: Susceptibility assessment for Behçet Disease and systemic vasculitis',
      'HLA-DRB1 Shared Epitope: Risk stratification for severe erosive Rheumatoid Arthritis (*04:01, *04:04, *01:01)',
      'HLA-DQ / HLA-DR Alleles: Associated risk scores for Type 1 Diabetes and Autoimmune Thyroiditis (Hashimoto / Graves)',
      'Physician-interpretable relative risk ratios and clear genetic susceptibility classifications'
    ],
    kitContents: [
      '2 Sterile oral buccal swabs with DNA stabilization buffer',
      'Protective tamper-evident barcoded transport container',
      'Barcoded clinical immunogenetics requisition sheet',
      'Illustrated patient sample collection manual',
      'Pre-addressed, prepaid courier return envelope to Barcelona Central Laboratory'
    ],
    collectionProtocol: [
      { step: 1, title: 'Pre-Collection Fast', desc: 'Ensure no food, drink, tobacco, or dental hygiene products are consumed for 30 minutes prior to sampling.' },
      { step: 2, title: 'Buccal Swab Extraction', desc: 'Vigorously swab the inner cheek mucosa for 60 seconds to dislodge sufficient epithelial DNA.' },
      { step: 3, title: 'Preservation Insertion', desc: 'Submerge the swab head into the provided DNA preservation reagent and break the plastic shaft.' },
      { step: 4, title: 'Return Mailing', desc: 'Secure the container inside the prepaid clinical mailer and deposit at your nearest courier drop-off.' }
    ],
    variants: [
      {
        id: 'var-teletest-hla-std',
        name: 'Complete Kit & PCR-SSO Molecular Typing',
        strength: 'Complete Kit & PCR-SSO Molecular Typing',
        dose: 'Complete Kit & PCR-SSO Molecular Typing',
        presentation: 'Clinical Collection Kit + Lab Testing',
        price: 180.00,
        retailPrice: 220.00,
        wholesalePrice: 152.00,
        inStock: true,
        supplierId: 'supplier-teletest',
        supplierName: 'TeleTest Analytika'
      }
    ]
  },

  'teletest-estudio-genetico-celiaca': {
    id: 'teletest-estudio-genetico-celiaca',
    slug: 'teletest-estudio-genetico-celiaca',
    canonicalKey: 'teletest-estudio-genetico-celiaca',
    name: 'TeleTest™ Celiac Disease Genetic Panel (HLA-DQ2 & HLA-DQ8)',
    canonicalName: 'TeleTest™ Celiac Disease Genetic Panel (HLA-DQ2 & HLA-DQ8)',
    brand: 'TeleTest Analytika®',
    brandSlug: 'teletest',
    category: 'Clinical Diagnostics & Immunogenetics',
    subcategory: 'Celiac Predisposition & HLA-DQ Typing',
    therapeutic_category: 'Autoimmune Enteropathy & Gluten Hypersensitivity',
    type: 'diagnostic',
    productType: 'diagnostic',
    is_diagnostic: true,
    isDiagnostic: true,
    price: 160.00,
    currency: 'EUR',
    currencySymbol: '€',
    status: 'active',
    rating: 4.9,
    reviewsCount: 48,
    leadTimeDays: 5,
    turnaround: '5 – 7 Business Days',
    sampleMatrix: 'Buccal Swab / Saliva DNA Collection (Non-invasive)',
    sampleType: 'Buccal Swab (DNA)',
    methodology: 'High-Resolution Real-Time Multiplex Allele-Specific PCR',
    accreditation: 'Generalitat de Catalunya E08750211 · ISO 17025 Accredited',
    referenceLab: 'TeleTest Analytika Central Reference Laboratory (Barcelona, EU)',
    laboratoryCode: 'Generalitat E08750211',
    image: '/images/products/teletest/celiac-genetics.svg',
    imageUrl: '/images/products/teletest/celiac-genetics.svg',
    sampleReportUrl: '/docs/teletest-report-celiac.pdf',
    badge: 'ISO 17025 European Reference Laboratory',
    supplierName: 'TeleTest Analytika',
    supplier: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    suppliers: ['supplier-teletest'],
    supplierIds: ['supplier-teletest'],
    isSingleSupplierLocked: true,
    shortDescription:
      'High-resolution HLA-DQ2.5, HLA-DQ2.2, and HLA-DQ8 heterodimer genotyping providing >99% Negative Predictive Value (NPV) to authoritatively rule out Celiac Disease regardless of current diet.',
    description:
      'Gold-standard molecular genetic panel for Celiac Disease susceptibility. Identifies the specific HLA Class II heterodimers DQ2.5 (encoded by DQA1*05:01 and DQB1*02:01 in cis or trans configuration), DQ2.2 (encoded by DQA1*02:01 and DQB1*02:02), and DQ8 (encoded by DQA1*03:01 and DQB1*03:02). The absence of these alleles provides a >99% Negative Predictive Value, ruling out celiac disease for life without requiring uncomfortable gluten challenges.',
    clinicalIndications: [
      'Patients already on a gluten-free diet where serology (anti-tTG, anti-DGP, EMA) would yield false-negative results',
      'Symptomatic patients with ambiguous, borderline, or discordant serological and intestinal biopsy findings',
      'First-degree relatives of biopsy-confirmed celiac patients for definitive lifelong risk exclusion',
      'Individuals with related autoimmune conditions (Type 1 Diabetes, Autoimmune Thyroiditis, Down syndrome)',
      'Definitively confirming whether gluten avoidance is medically mandated or non-celiac gluten sensitivity'
    ],
    whatTestTellsYou: [
      'Definitive Lifelong Risk Rule-Out: A negative result (no DQ2 or DQ8) rules out celiac disease with >99% clinical certainty',
      'DQ2.5 Heterodimer in Cis or Trans Configuration: Identifying the highest-affinity gluten peptide-binding heterodimer',
      'DQ2.2 & DQ8 Heterodimer Typing: Accurately calculating gene dose effects (homozygous DQB1*02 carries up to 5x higher relative risk)',
      'Diet-Independent Validity: Can be taken at any time, whether consuming gluten or strictly gluten-free for years',
      'Complete Certified Diagnostic Report with clear clinical likelihood score'
    ],
    kitContents: [
      '2 Sterile oral buccal swabs with DNA stabilization buffer',
      'Specimen transport tube with barcode tracking label',
      'Barcoded laboratory requisition sheet',
      'Easy-to-follow illustrated patient collection instructions',
      'Pre-addressed, prepaid courier return envelope to Barcelona Central Laboratory'
    ],
    collectionProtocol: [
      { step: 1, title: 'Mouth Cleanse', desc: 'Rinse mouth with water 30 minutes prior to sampling. Fast from all foods and beverages for 30 minutes.' },
      { step: 2, title: 'Cell Collection', desc: 'Scrape the inside of both cheeks vigorously with the swab head for 60 seconds to gather buccal mucosa cells.' },
      { step: 3, title: 'Reagent Tube', desc: 'Place swab head into the preservative vial, snap off the upper stick, and cap tightly.' },
      { step: 4, title: 'Prepaid Return', desc: 'Insert specimen tube and requisition into the prepaid padded envelope and ship directly to the Barcelona laboratory.' }
    ],
    variants: [
      {
        id: 'var-teletest-celiac-std',
        name: 'Complete Kit & Real-Time PCR Genotyping',
        strength: 'Complete Kit & Real-Time PCR Genotyping',
        dose: 'Complete Kit & Real-Time PCR Genotyping',
        presentation: 'Clinical Collection Kit + Lab Testing',
        price: 160.00,
        retailPrice: 195.00,
        wholesalePrice: 135.00,
        inStock: true,
        supplierId: 'supplier-teletest',
        supplierName: 'TeleTest Analytika'
      }
    ]
  }
};

/**
 * Resolves a TeleTest product by its slug or id.
 */
export function getTeletestProductBySlug(slug) {
  if (!slug) return null;
  const clean = String(slug).toLowerCase().trim();
  
  if (TELETEST_PRODUCTS[clean]) {
    return TELETEST_PRODUCTS[clean];
  }
  
  for (const item of Object.values(TELETEST_PRODUCTS)) {
    if (item.id === clean || item.slug === clean || item.canonicalKey === clean) {
      return item;
    }
  }

  // Fallback alias resolution
  if (clean.includes('htma') || clean.includes('mineralograma') || clean.includes('cabello')) {
    return TELETEST_PRODUCTS['teletest-mineralograma-cabello-htma'];
  }
  if (clean.includes('omega') && clean.includes('teletest')) {
    return TELETEST_PRODUCTS['teletest-test-omega'];
  }
  if (clean.includes('metabolizer') || (clean.includes('detox') && clean.includes('teletest'))) {
    return TELETEST_PRODUCTS['teletest-saliva-metabolizer-detox'];
  }
  if (clean.includes('hla') && clean.includes('teletest')) {
    return TELETEST_PRODUCTS['teletest-gnt-hla-autoinmunidad'];
  }
  if ((clean.includes('celiac') || clean.includes('celiaca')) && clean.includes('teletest')) {
    return TELETEST_PRODUCTS['teletest-estudio-genetico-celiaca'];
  }

  return null;
}

/**
 * Returns all active TeleTest products as an array.
 */
export function getTeletestCatalog() {
  return Object.values(TELETEST_PRODUCTS);
}

/**
 * Checks whether a given slug belongs to the TeleTest suite.
 */
export function isTeletestSlug(slug) {
  if (!slug) return false;
  const clean = String(slug).toLowerCase().trim();
  return Boolean(
    clean.startsWith('teletest-') ||
    clean.includes('teletest') ||
    clean === 'htma' ||
    clean === 'mineralograma-cabello'
  );
}

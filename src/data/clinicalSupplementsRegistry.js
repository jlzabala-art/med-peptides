/**
 * src/data/clinicalSupplementsRegistry.js
 * Comprehensive Clinical Nutraceutical Registry for UltraPerson™
 * Precision compounded oral formulations in acid-resistant vegan HPMC capsules.
 */

export const CLINICAL_SUPPLEMENTS = {
  'ultraperson-energy-metabolic-vitality': {
    id: 'ultraperson-energy-metabolic-vitality',
    slug: 'ultraperson-energy-metabolic-vitality',
    canonicalKey: 'ultraperson-energy-metabolic-vitality',
    name: 'UltraPerson Energy & Metabolic Vitality',
    canonicalName: 'UltraPerson Energy & Metabolic Vitality',
    brand: 'UltraPerson™ Precision',
    category: 'Precision Nutraceuticals',
    therapeutic_category: 'Mitochondrial Biogenesis & Co-factor Fortification',
    type: 'supplement',
    productType: 'supplement',
    is_supplement: true,
    isSupplement: true,
    dosageForm: 'Oral Route (Acid-Resistant Vegan HPMC Capsules)',
    dispensingForm: 'Delayed-Release Acid-Resistant Vegetable Capsules',
    supplierName: 'Pharmapolis Compounding Pharmacy',
    supplier: 'Pharmapolis Compounding Pharmacy',
    supplierId: 'supplier-pharmapolis',
    suppliers: ['supplier-pharmapolis'],
    supplierIds: ['supplier-pharmapolis'],
    isSingleSupplierLocked: true,
    status: 'active',
    rating: 4.9,
    reviewsCount: 38,
    leadTimeDays: 2,
    purity: 'EU GMP Pharmacopeia Grade',
    description:
      'Compounded rate-limiting mitochondrial co-factor matrix engineered to stimulate de novo mitochondrial biogenesis and multiply cellular ATP yield. CoQ10 (Ubiquinol precursor) and Pyrroloquinoline Quinone (PQQ) activate the CREB/PGC-1α transcriptional axis, while Alpha-Lipoic Acid (ALA) continuously recycles cellular antioxidants and piperine enhances systemic bioavailability.',
    shortDescription:
      'Cellular ATP Synthesis & Mitochondrial Biogenesis Co-factors (CoQ10 + PQQ + Ginseng + ALA + Piperine).',
    activeIngredients: [
      { name: 'Coenzyme Q10 (Ubiquinone USP)', dose: '125 mg', target: 'Mitochondrial Complex I & II Electron Transport' },
      { name: 'Pyrroloquinoline Quinone (PQQ)', dose: '20 mg', target: 'CREB / PGC-1α Mitochondrial Biogenesis' },
      { name: 'Panax Ginseng Root Extract (Standardized Ginsenosides)', dose: '200 mg', target: 'Adrenal Adaptation & Cellular Bioenergetics' },
      { name: 'Alpha-Lipoic Acid (R/S-ALA)', dose: '150 mg', target: 'Endogenous Antioxidant Recycling & Pyruvate Dehydrogenase' },
      { name: 'Piperine (Bioperine® 95%)', dose: '5 mg', target: 'Intestinal Thermonutrient Absorption Maximizer' }
    ],
    mechanism:
      'Pyrroloquinoline Quinone (PQQ) binds intracellular signaling kinases to stimulate cAMP-response element-binding protein (CREB) and peroxisome proliferator-activated receptor-gamma coactivator-1alpha (PGC-1α), driving the transcription of nuclear respiratory factors (NRF-1/2) for mitochondrial renewal. CoQ10 ensures optimal electron flux along complexes I–III of the respiratory chain, while Alpha-Lipoic Acid restores intracellular glutathione and reduced ubiquinol pools.',
    dosingInstructions:
      'Take 2 capsules once daily in the morning with breakfast and water alongside your prescribed compounded protocol. Duration: 1 to 3 months.',
    vehicle: 'Acid-resistant vegan HPMC capsules. Gluten-free, lactose-free, sugar-free, colorant-free, and allergen-free.',
    storage: 'Store in a cool, dry place away from direct sunlight (15°C–25°C). Keep bottle tightly sealed.',
    batchCode: 'AS-PHA-LT60-2610',
    lotNumber: '2610-UP01',
    mfgDate: '04-10-2026',
    expDate: '03-10-2027',
    variants: [
      {
        id: 'var-up-energy-60',
        name: '60 Capsules (2 daily / 30 Days)',
        strength: '60 Capsules (2 daily / 30 Days)',
        dose: '60 Capsules (2 daily / 30 Days)',
        presentation: 'bottle_(60_acid-resistant_hpmc_caps)',
        format: 'bottle',
        supplierId: 'supplier-pharmapolis',
        supplierName: 'Pharmapolis Compounding Pharmacy',
        supplier: 'Pharmapolis Compounding Pharmacy',
        stock: 'in_stock',
        price: 85,
        currency: 'EUR',
        batchCode: 'AS-PHA-LT60-2610',
        lotNumber: '2610-UP01',
        leadTimeDays: 2
      },
      {
        id: 'var-up-energy-120',
        name: '120 Capsules (2 daily / 60 Days)',
        strength: '120 Capsules (2 daily / 60 Days)',
        dose: '120 Capsules (2 daily / 60 Days)',
        presentation: 'bottle_(120_acid-resistant_hpmc_caps)',
        format: 'bottle',
        supplierId: 'supplier-pharmapolis',
        supplierName: 'Pharmapolis Compounding Pharmacy',
        supplier: 'Pharmapolis Compounding Pharmacy',
        stock: 'in_stock',
        price: 155,
        currency: 'EUR',
        batchCode: 'AS-PHA-LT120-2610',
        lotNumber: '2610-UP02',
        leadTimeDays: 2
      }
    ],
    formats: [
      { id: 'bottle', name: 'Bottle (Acid-Resistant Vegan Capsules)', description: 'Protected enterically against gastric degradation' }
    ],
    strengths: [
      { id: 'st-60', name: '60 Capsules (2 daily / 30 Days)' },
      { id: 'st-120', name: '120 Capsules (2 daily / 60 Days)' }
    ]
  },

  'ultraperson-stress-resilience-emotional-balance': {
    id: 'ultraperson-stress-resilience-emotional-balance',
    slug: 'ultraperson-stress-resilience-emotional-balance',
    canonicalKey: 'ultraperson-stress-resilience-emotional-balance',
    name: 'UltraPerson Stress Resilience & Emotional Balance',
    canonicalName: 'UltraPerson Stress Resilience & Emotional Balance',
    brand: 'UltraPerson™ Precision',
    category: 'Precision Nutraceuticals',
    therapeutic_category: 'HPA Axis Adaptation & Cortisol Homeostasis',
    type: 'supplement',
    productType: 'supplement',
    is_supplement: true,
    isSupplement: true,
    dosageForm: 'Oral Route (Acid-Resistant Vegan HPMC Capsules)',
    supplierName: 'Pharmapolis Compounding Pharmacy',
    supplierId: 'supplier-pharmapolis',
    suppliers: ['supplier-pharmapolis'],
    supplierIds: ['supplier-pharmapolis'],
    isSingleSupplierLocked: true,
    status: 'active',
    activeIngredients: [
      { name: 'KSM-66® Ashwagandha Root (Standardized Withanolides)', dose: '300 mg', target: 'Hypothalamic-Pituitary-Adrenal (HPA) Axis' },
      { name: 'Pure L-Theanine (Suntheanine®)', dose: '200 mg', target: 'GABAergic Neurotransmission & Alpha-Wave Induction' }
    ],
    dosingInstructions: 'Take 2 capsules daily (1 in the morning and 1 in the late afternoon, or 2 during high-stress periods).',
    batchCode: 'AS-PHA-ST60-2610',
    lotNumber: '2610-UP03',
    mfgDate: '04-10-2026',
    expDate: '03-10-2027',
    variants: [
      {
        id: 'var-up-stress-60',
        name: '60 Capsules (2 daily / 30 Days)',
        strength: '60 Capsules (2 daily / 30 Days)',
        dose: '60 Capsules (2 daily / 30 Days)',
        presentation: 'bottle_(60_acid-resistant_hpmc_caps)',
        format: 'bottle',
        supplierId: 'supplier-pharmapolis',
        supplierName: 'Pharmapolis Compounding Pharmacy',
        stock: 'in_stock',
        price: 75,
        currency: 'EUR',
        batchCode: 'AS-PHA-ST60-2610'
      }
    ]
  },

  'ultraperson-sleep-quality-restoration': {
    id: 'ultraperson-sleep-quality-restoration',
    slug: 'ultraperson-sleep-quality-restoration',
    canonicalKey: 'ultraperson-sleep-quality-restoration',
    name: 'UltraPerson Sleep Quality & Restoration (Melatonin-Free)',
    canonicalName: 'UltraPerson Sleep Quality & Restoration (Melatonin-Free)',
    brand: 'UltraPerson™ Precision',
    category: 'Precision Nutraceuticals',
    therapeutic_category: 'Non-Hormonal Circadian Sleep Support & GABA Modulation',
    type: 'supplement',
    productType: 'supplement',
    is_supplement: true,
    isSupplement: true,
    dosageForm: 'Oral Route (Acid-Resistant Vegan HPMC Capsules)',
    supplierName: 'Pharmapolis Compounding Pharmacy',
    supplierId: 'supplier-pharmapolis',
    suppliers: ['supplier-pharmapolis'],
    supplierIds: ['supplier-pharmapolis'],
    isSingleSupplierLocked: true,
    status: 'active',
    activeIngredients: [
      { name: 'Pure L-Theanine', dose: '200 mg', target: 'Glutamate Receptor Antagonism' },
      { name: 'Lemon Balm Extract (Rosmarinic Acid)', dose: '150 mg', target: 'GABA Transaminase Inhibition' },
      { name: 'Magnolia Bark Extract (Honokiol/Magnolol)', dose: '70 mg', target: 'GABA-A Positive Allosteric Modulation' },
      { name: 'Apigenin (from Chamomile Extract)', dose: '50 mg', target: 'Central Benzodiazepine Site Binding' },
      { name: 'Saffron Stigma Extract (Affron®)', dose: '30 mg', target: 'Serotonergic SWS Phase Stabilization' }
    ],
    dosingInstructions: 'Take 2 capsules 30 to 45 minutes prior to bedtime with warm water.',
    batchCode: 'AS-PHA-SL60-2610',
    lotNumber: '2610-UP04',
    mfgDate: '04-10-2026',
    expDate: '03-10-2027',
    variants: [
      {
        id: 'var-up-sleep-60',
        name: '60 Capsules (2 daily / 30 Days)',
        strength: '60 Capsules (2 daily / 30 Days)',
        dose: '60 Capsules (2 daily / 30 Days)',
        presentation: 'bottle_(60_acid-resistant_hpmc_caps)',
        format: 'bottle',
        supplierId: 'supplier-pharmapolis',
        supplierName: 'Pharmapolis Compounding Pharmacy',
        stock: 'in_stock',
        price: 79,
        currency: 'EUR',
        batchCode: 'AS-PHA-SL60-2610'
      }
    ]
  },

  'ultraperson-immune-strength-defense': {
    id: 'ultraperson-immune-strength-defense',
    slug: 'ultraperson-immune-strength-defense',
    canonicalKey: 'ultraperson-immune-strength-defense',
    name: 'UltraPerson Immune Strength & Defense',
    canonicalName: 'UltraPerson Immune Strength & Defense',
    brand: 'UltraPerson™ Precision',
    category: 'Precision Nutraceuticals',
    therapeutic_category: 'Innate & Adaptive Immunomodulation',
    type: 'supplement',
    productType: 'supplement',
    is_supplement: true,
    isSupplement: true,
    dosageForm: 'Oral Route (Acid-Resistant Vegan HPMC Capsules)',
    supplierName: 'Pharmapolis Compounding Pharmacy',
    supplierId: 'supplier-pharmapolis',
    suppliers: ['supplier-pharmapolis'],
    supplierIds: ['supplier-pharmapolis'],
    isSingleSupplierLocked: true,
    status: 'active',
    activeIngredients: [
      { name: 'Quercetin Phytosome', dose: '250 mg', target: 'Intracellular Zinc Ionophore' },
      { name: 'Buffered Vitamin C (Sodium Ascorbate)', dose: '120 mg', target: 'Phagocytic Neutrophil Protection' },
      { name: 'Zinc Picolinate (High Bioavailability)', dose: '50 mg (10 mg Zn)', target: 'RNA Polymerase Complex Regulation' },
      { name: 'Elderberry Extract (Sambucus nigra)', dose: '60 mg', target: 'Viral Hemagglutinin Inhibition' },
      { name: 'Vitamin D3 (Cholecalciferol)', dose: '1,000 IU', target: 'Cathelicidin & Defensin Synthesis' }
    ],
    dosingInstructions: 'Take 2 capsules once daily with a meal containing dietary lipids.',
    batchCode: 'AS-PHA-IM60-2610',
    lotNumber: '2610-UP05',
    mfgDate: '04-10-2026',
    expDate: '03-10-2027',
    variants: [
      {
        id: 'var-up-immune-60',
        name: '60 Capsules (2 daily / 30 Days)',
        strength: '60 Capsules (2 daily / 30 Days)',
        dose: '60 Capsules (2 daily / 30 Days)',
        presentation: 'bottle_(60_acid-resistant_hpmc_caps)',
        format: 'bottle',
        supplierId: 'supplier-pharmapolis',
        supplierName: 'Pharmapolis Compounding Pharmacy',
        stock: 'in_stock',
        price: 72,
        currency: 'EUR',
        batchCode: 'AS-PHA-IM60-2610'
      }
    ]
  },

  'ultraperson-longevity-cellular-renewal': {
    id: 'ultraperson-longevity-cellular-renewal',
    slug: 'ultraperson-longevity-cellular-renewal',
    canonicalKey: 'ultraperson-longevity-cellular-renewal',
    name: 'UltraPerson Longevity & Cellular Renewal',
    canonicalName: 'UltraPerson Longevity & Cellular Renewal',
    brand: 'UltraPerson™ Precision',
    category: 'Precision Nutraceuticals',
    therapeutic_category: 'Sirtuin Activation & Senolytic Longevity',
    type: 'supplement',
    productType: 'supplement',
    is_supplement: true,
    isSupplement: true,
    dosageForm: 'Oral Route (Acid-Resistant Vegan HPMC Capsules)',
    supplierName: 'Pharmapolis Compounding Pharmacy',
    supplierId: 'supplier-pharmapolis',
    suppliers: ['supplier-pharmapolis'],
    supplierIds: ['supplier-pharmapolis'],
    isSingleSupplierLocked: true,
    status: 'active',
    activeIngredients: [
      { name: 'Trans-Resveratrol (Micronized)', dose: '250 mg', target: 'SIRT1 Sirtuin Deacetylation' },
      { name: 'Fisetin (from Rhus succedanea)', dose: '100 mg', target: 'Targeted Senolysis & SASP Suppression' },
      { name: 'Curcumin Phytosome (Meriva®)', dose: '100 mg', target: 'NF-κB Inflammatory Axis Modulation' },
      { name: 'Grape Seed Proanthocyanidins (OPCs)', dose: '50 mg', target: 'Vascular Endothelial Protection' }
    ],
    dosingInstructions: 'Take 2 capsules once daily in the morning with food.',
    batchCode: 'AS-PHA-LN60-2610',
    lotNumber: '2610-UP06',
    mfgDate: '04-10-2026',
    expDate: '03-10-2027',
    variants: [
      {
        id: 'var-up-longevity-60',
        name: '60 Capsules (2 daily / 30 Days)',
        strength: '60 Capsules (2 daily / 30 Days)',
        dose: '60 Capsules (2 daily / 30 Days)',
        presentation: 'bottle_(60_acid-resistant_hpmc_caps)',
        format: 'bottle',
        supplierId: 'supplier-pharmapolis',
        supplierName: 'Pharmapolis Compounding Pharmacy',
        stock: 'in_stock',
        price: 89,
        currency: 'EUR',
        batchCode: 'AS-PHA-LN60-2610'
      }
    ]
  },

  'ultraperson-cognitive-clarity-focus': {
    id: 'ultraperson-cognitive-clarity-focus',
    slug: 'ultraperson-cognitive-clarity-focus',
    canonicalKey: 'ultraperson-cognitive-clarity-focus',
    name: 'UltraPerson Cognitive Clarity & Focus',
    canonicalName: 'UltraPerson Cognitive Clarity & Focus',
    brand: 'UltraPerson™ Precision',
    category: 'Precision Nutraceuticals',
    therapeutic_category: 'Nootropic Synaptic Plasticity & Neuro-Metabolic Focus',
    type: 'supplement',
    productType: 'supplement',
    is_supplement: true,
    isSupplement: true,
    dosageForm: 'Oral Route (Acid-Resistant Vegan HPMC Capsules)',
    dispensingForm: 'Delayed-Release Acid-Resistant Vegetable Capsules',
    supplierName: 'Atlas Compounding Network',
    supplier: 'Atlas Compounding Network',
    supplierId: 'supplier-atlas-compounding',
    status: 'active',
    rating: 4.9,
    reviewsCount: 42,
    leadTimeDays: 2,
    purity: 'EU GMP Pharmacopeia Grade',
    description:
      'Sharpens mental performance, executive attention, and working memory. Formulated in delayed-release acid-resistant vegan HPMC capsules Delivering standardized Bacopa monnieri (55% bacosides), L-Theanine (Suntheanine®), Pycnogenol® pine bark extract, and Citicoline for optimal acetylcholine synthesis and cerebral microcirculation.',
    shortDescription:
      'Nootropic & Focus Matrix (Bacopa Monnieri 320mg + L-Theanine 150mg + Citicoline 100mg + Pycnogenol® 30mg).',
    activeIngredients: [
      { name: 'Bacopa Monnieri Extract (55% Bacosides A/B)', dose: '320 mg', target: 'Synaptic Plasticity & Cholinergic Transmission' },
      { name: 'L-Theanine (Suntheanine® ≥98%)', dose: '150 mg', target: 'Alpha Wave Induction & Calm Focus' },
      { name: 'Citicoline Sodium (Cognizin®)', dose: '100 mg', target: 'Acetylcholine & Neuronal Membrane Synthesis' },
      { name: 'Maritime Pine Bark Extract (Pycnogenol® 95% OPC)', dose: '30 mg', target: 'Cerebral Microvascular Perfusion & Nitric Oxide' }
    ],
    mechanism:
      'Bacopa bacosides facilitate protein kinase activity in hippocampal neurons and enhance synaptic receptor density. L-Theanine antagonizes excitotoxic glutamate pathways and elevates alpha-band brain waves (8–12 Hz), while Citicoline donates choline for immediate acetylcholine neurotransmitter production and neuroprotection.',
    dosingInstructions:
      'Take 2 capsules once daily in the morning with water alongside breakfast. Protocol duration: 3 months (180 capsules total).',
    vehicle: 'Acid-resistant vegan HPMC capsules. 0% allergens, non-GMO, titanium dioxide free.',
    variants: [
      {
        id: 'var-up-cog-180',
        name: '180 Capsules (2 daily / 90 Days)',
        strength: '180 Capsules (2 daily / 90 Days)',
        dose: '180 Capsules (2 daily / 90 Days)',
        presentation: 'bottle_(180_acid-resistant_hpmc_caps)',
        format: 'bottle',
        supplierId: 'supplier-atlas-compounding',
        supplierName: 'Atlas Compounding Network',
        stock: 'in_stock',
        price: 52.55,
        currency: 'EUR',
        batchCode: 'AS-PHA-CG180-2610'
      }
    ]
  },

  'colway-colvita': {
    id: 'colway-colvita',
    slug: 'colway-colvita',
    canonicalKey: 'colway-colvita',
    name: 'Colvita Bioactive Native Collagen & Marine Algae',
    canonicalName: 'Colvita Bioactive Native Collagen & Marine Algae',
    brand: 'Colway',
    vendor: 'Colway',
    supplier: 'Colway',
    supplierName: 'Colway',
    supplierId: 'supplier-colway',
    suppliers: ['supplier-colway'],
    supplierIds: ['supplier-colway'],
    isSingleSupplierLocked: true,
    status: 'published',
    category: 'nutricosmetics',
    therapeutic_category: 'Cellular ECM & Bioactive Tropocollagen Nutricosmetic',
    type: 'supplement',
    productType: 'supplement',
    is_supplement: true,
    isSupplement: true,
    dosageForm: 'Oral Route (100% Fish Gelatin Capsules)',
    dispensingForm: 'Oral Bioactive Capsules',
    leadTimeDays: 3,
    purity: 'Lyophilized Native Biologically Active Tropocollagen (Triple Helix Preserved)',
    rating: 4.95,
    reviewsCount: 78,
    cost: 28,
    price: 64,
    wholesale_price: 42,
    retail_price: 64,
    unit_price: 64,
    image: '/images/products/colway/colvita.png',
    images: ['/images/products/colway/colvita.png'],
    description:
      'Colvita is the legendary flagship nutricosmetic and dietary supplement developed by Colway Laboratories. Unlike conventional hydrolyzed collagens on the market that are denatured into broken peptide fragments, Colvita utilizes pure biologically active freeze-dried fish tropocollagen obtained through gentle low-temperature sublimation drying. This preserves the intact triple-helix spatial structure and high cellular bioavailability. Formulated synergistically with micronized marine bladderwrack algae (Fucus vesiculosus), a rich source of organic iodine, magnesium, calcium, and amino acids, and natural vitamin E (D-alpha-tocopheryl acetate) to stimulate fibroblast neo-collagenesis and protect cellular membranes against oxidative degradation.',
    shortDescription:
      'Pure Bioactive Freeze-Dried Fish Tropocollagen (Triple Helix) + Fucus vesiculosus Sea Algae + Natural Vitamin E in 100% fish gelatin capsules.',
    mechanism:
      'Freeze-dried native fish tropocollagen supplies complete signal peptides and essential amino acids (glycine, proline, hydroxyproline, and hydroxylysine) with rapid mucosal absorption. These bio-peptides trigger signal cascades in dermal and synovial fibroblasts, upregulating endogenous type I and type III collagen synthesis. Bladderwrack algae (Fucus vesiculosus) provides bio-available trace minerals and organic iodine supporting thyroid hormone synthesis and cellular metabolism, while D-alpha-tocopheryl vitamin E halts lipid peroxidation and guards newly formed extracellular matrix fibrils from oxidative cross-linking.',
    dosingInstructions:
      'Take 2 capsules daily, during or immediately after a meal with a full glass of water. Recommended course: 2 to 3 months (60–90 days).',
    activeIngredients: [
      {
        name: 'Lyophilized Native Fish Tropocollagen',
        dose: '240 mg (per 2 capsules)',
        inci_name: 'Freeze-Dried Marine Tropocollagen',
        target: 'Fibroblast Neo-Collagenesis & ECM Matrix Density',
        role: 'Preserves biologically active triple helix; delivers intact signaling peptides directly to dermal, joint, and follicular connective tissues.'
      },
      {
        name: 'Bladderwrack Sea Algae (Fucus vesiculosus Extract)',
        dose: '300 mg (per 2 capsules)',
        inci_name: 'Fucus Vesiculosus Powder',
        target: 'Cellular Mineralization & Thyroid Axis Synergy',
        role: 'Rich in organic iodine, trace minerals (potassium, calcium, magnesium, selenium, zinc), and polysaccharides, enhancing metabolic rate and extracellular collagen cross-linking.'
      },
      {
        name: 'Natural Vitamin E (D-alpha-Tocopheryl Acetate)',
        dose: '24 mg / 200% NRV (per 2 capsules)',
        inci_name: 'D-alpha-Tocopheryl Acetate',
        target: 'Cell Membrane Lipid Protection & Antioxidant Shield',
        role: 'Potent lipophilic antioxidant that scavenges free radicals, defends cell membrane polyunsaturated lipids, and protects newly synthesized collagen fibers.'
      }
    ],
    variants: [
      {
        id: 'colway-colvita-var-60',
        productId: 'colway-colvita',
        productName: 'Colvita Bioactive Native Collagen',
        name: 'Colvita - 60 Capsules (30-Day Supply)',
        sku: 'SKU-COLWAY-COLVITA-60',
        format: 'Capsules',
        dosage: '60 Capsules',
        size: '60 Capsules Box (Blister Packs)',
        pricing: {
          master: { perUnit: 28, currency: 'USD' },
          wholesale: { perUnit: 42, currency: 'USD' },
          clinic: { perUnit: 49, currency: 'USD' },
          retail: { perUnit: 64, currency: 'USD' }
        },
        cost: 28,
        price: 64,
        unit_price: 64,
        stock: { available: 50, allocated: 0, reserved: 0 },
        supplierId: 'supplier-colway',
        supplierName: 'Colway',
        supplier: 'Colway',
        status: 'published',
        volume: '60 Capsules'
      },
      {
        id: 'colway-colvita-var-120',
        productId: 'colway-colvita',
        productName: 'Colvita Bioactive Native Collagen',
        name: 'Colvita - 120 Capsules (60-Day Supply)',
        sku: 'SKU-COLWAY-COLVITA-120',
        format: 'Capsules',
        dosage: '120 Capsules',
        size: '120 Capsules Box (Blister Packs)',
        pricing: {
          master: { perUnit: 50, currency: 'USD' },
          wholesale: { perUnit: 74, currency: 'USD' },
          clinic: { perUnit: 86, currency: 'USD' },
          retail: { perUnit: 112, currency: 'USD' }
        },
        cost: 50,
        price: 112,
        unit_price: 112,
        stock: { available: 45, allocated: 0, reserved: 0 },
        supplierId: 'supplier-colway',
        supplierName: 'Colway',
        supplier: 'Colway',
        status: 'published',
        volume: '120 Capsules'
      }
    ],
    formats: [
      { id: 'bottle-60', name: '60 Capsules Bottle (30-Day Protocol)', description: '2 capsules daily' },
      { id: 'bottle-120', name: '120 Capsules Bottle (60-Day Protocol)', description: '2 capsules daily' }
    ],
    strengths: [
      { id: 'st-60', name: '60 Capsules (30 Days)' },
      { id: 'st-120', name: '120 Capsules (60 Days)' }
    ]
  },
  'eterna-epigenetic-age-test': {
    id: 'eterna-epigenetic-age-test',
    slug: 'eterna-epigenetic-age-test',
    canonicalKey: 'eterna-epigenetic-age-test',
    name: 'ETERNA® DNA & Epigenetic Longevity Test',
    canonicalName: 'ETERNA® DNA & Epigenetic Longevity Test',
    brand: 'ETERNA DX',
    category: 'Genomics & Longevity Diagnostics',
    therapeutic_category: 'Multi-Omics DNA & Biological Age Epigenetics',
    type: 'diagnostic',
    productType: 'diagnostic',
    is_diagnostic: true,
    isDiagnostic: true,
    dosageForm: 'Saliva Swab Collection Kit',
    dispensingForm: 'CE-IVDR Certified Saliva Stabilization Tube',
    supplierName: 'ETERNA Diagnostics S.L.',
    supplier: 'ETERNA Diagnostics S.L.',
    supplierId: 'supplier-eternadx',
    suppliers: ['supplier-eternadx'],
    supplierIds: ['supplier-eternadx'],
    isSingleSupplierLocked: true,
    status: 'published',
    batchCode: 'AS-ETR-EUR01-2610',
    lotNumber: '2610-ETR01',
    description: 'High-resolution saliva-based DNA and epigenetic longevity profiling (+700,000 SNPs). Measures cellular biological age, rate of aging, organ system breakdown, and bi-directional wearable telemetry sync.',
    variants: [
      {
        id: 'var-eterna-kit-1',
        name: 'Single Individual Kit',
        strength: '1 test / kit',
        dose: '1 test / kit',
        supplierId: 'supplier-eternadx',
        supplierName: 'ETERNA Diagnostics S.L.',
        status: 'published'
      }
    ]
  },
  'eterna-longevity-platform': {
    id: 'eterna-longevity-platform',
    slug: 'eterna-epigenetic-age-test',
    canonicalKey: 'eterna-epigenetic-age-test',
    name: 'ETERNA® DNA & Epigenetic Longevity Test',
    canonicalName: 'ETERNA® DNA & Epigenetic Longevity Test',
    brand: 'ETERNA DX',
    category: 'Genomics & Longevity Diagnostics',
    therapeutic_category: 'Multi-Omics DNA & Biological Age Epigenetics',
    type: 'diagnostic',
    productType: 'diagnostic',
    is_diagnostic: true,
    isDiagnostic: true,
    dosageForm: 'Saliva Swab Collection Kit',
    dispensingForm: 'CE-IVDR Certified Saliva Stabilization Tube',
    supplierName: 'ETERNA Diagnostics S.L.',
    supplier: 'ETERNA Diagnostics S.L.',
    supplierId: 'supplier-eternadx',
    suppliers: ['supplier-eternadx'],
    supplierIds: ['supplier-eternadx'],
    isSingleSupplierLocked: true,
    status: 'published',
    batchCode: 'AS-ETR-EUR01-2610',
    lotNumber: '2610-ETR01',
    description: 'High-resolution saliva-based DNA and epigenetic longevity profiling (+700,000 SNPs). Measures cellular biological age, rate of aging, organ system breakdown, and bi-directional wearable telemetry sync.',
    variants: [
      {
        id: 'var-eterna-kit-1',
        name: 'Single Individual Kit',
        strength: '1 test / kit',
        dose: '1 test / kit',
        supplierId: 'supplier-eternadx',
        supplierName: 'ETERNA Diagnostics S.L.',
        status: 'published'
      }
    ]
  },
  'eternadx-genetic-test': {
    id: 'eternadx-genetic-test',
    slug: 'eterna-epigenetic-age-test',
    canonicalKey: 'eterna-epigenetic-age-test',
    name: 'ETERNA® DNA & Epigenetic Longevity Test',
    canonicalName: 'ETERNA® DNA & Epigenetic Longevity Test',
    brand: 'ETERNA DX',
    category: 'Genomics & Longevity Diagnostics',
    therapeutic_category: 'Multi-Omics DNA & Biological Age Epigenetics',
    type: 'diagnostic',
    productType: 'diagnostic',
    is_diagnostic: true,
    isDiagnostic: true,
    dosageForm: 'Saliva Swab Collection Kit',
    dispensingForm: 'CE-IVDR Certified Saliva Stabilization Tube',
    supplierName: 'ETERNA Diagnostics S.L.',
    supplier: 'ETERNA Diagnostics S.L.',
    supplierId: 'supplier-eternadx',
    suppliers: ['supplier-eternadx'],
    supplierIds: ['supplier-eternadx'],
    isSingleSupplierLocked: true,
    status: 'published',
    batchCode: 'AS-ETR-EUR01-2610',
    lotNumber: '2610-ETR01',
    description: 'High-resolution saliva-based DNA and epigenetic longevity profiling (+700,000 SNPs). Measures cellular biological age, rate of aging, organ system breakdown, and bi-directional wearable telemetry sync.',
    variants: [
      {
        id: 'var-eterna-kit-1',
        name: 'Single Individual Kit',
        strength: '1 test / kit',
        dose: '1 test / kit',
        supplierId: 'supplier-eternadx',
        supplierName: 'ETERNA Diagnostics S.L.',
        status: 'published'
      }
    ]
  }
};

export function getClinicalSupplementBySlug(slug) {
  if (!slug) return null;
  const clean = String(slug).toLowerCase().trim();
  return CLINICAL_SUPPLEMENTS[clean] || null;
}

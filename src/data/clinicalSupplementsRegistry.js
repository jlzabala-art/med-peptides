/**
 * src/data/clinicalSupplementsRegistry.js
 * Comprehensive Clinical Nutraceutical Registry for UltraPerson by PharmaPolis
 * Precision compounded oral formulations in acid-resistant vegan HPMC capsules.
 */

export const CLINICAL_SUPPLEMENTS = {
  'ultraperson-energy-metabolic-vitality': {
    id: 'ultraperson-energy-metabolic-vitality',
    slug: 'ultraperson-energy-metabolic-vitality',
    canonicalKey: 'ultraperson-energy-metabolic-vitality',
    name: 'UltraPerson Energy & Metabolic Vitality',
    canonicalName: 'UltraPerson Energy & Metabolic Vitality',
    brand: 'UltraPerson by PharmaPolis',
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
    brand: 'UltraPerson by PharmaPolis',
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
    brand: 'UltraPerson by PharmaPolis',
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
    brand: 'UltraPerson by PharmaPolis',
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
    brand: 'UltraPerson by PharmaPolis',
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

  'colway-colvita': {
    id: 'colway-colvita',
    slug: 'colway-colvita',
    canonicalKey: 'colway-colvita',
    name: 'Colvita Bioactive Native Collagen & Marine Algae',
    canonicalName: 'Colvita Bioactive Native Collagen & Marine Algae',
    polish_name: 'Colvita (Liofilizowany Kolagen Rybi + Algi Morskie + Witamina E)',
    brand: 'Colway',
    vendor: 'Colway',
    supplier: 'Colway',
    supplierName: 'Colway',
    supplierId: 'supplier-colway',
    suppliers: ['supplier-colway'],
    supplierIds: ['supplier-colway'],
    isSingleSupplierLocked: true,
    status: 'published',
    category: 'Dietary Supplement',
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

  'colway-trichology': {
    id: 'colway-trichology',
    slug: 'colway-trichology',
    canonicalKey: 'colway-trichology',
    name: 'Colway Trichology Hair Strengthening System (2-Step Synergistic Routine)',
    canonicalName: 'Colway Trichology Hair Strengthening System',
    brand: 'Colway',
    vendor: 'Colway',
    supplier: 'Colway',
    supplierName: 'Colway',
    supplierId: 'supplier-colway',
    suppliers: ['supplier-colway'],
    supplierIds: ['supplier-colway'],
    isSingleSupplierLocked: true,
    status: 'published',
    category: 'cosmetics',
    therapeutic_category: 'Follicular Stem Cell Activation & Anti-Miniaturisation Hair System',
    type: 'cosmetic',
    productType: 'cosmetic',
    is_cosmetic: true,
    is_trichology: true,
    leadTimeDays: 2,
    purity: 'Medical Grade Trichology Cosmeceutical',
    rating: 4.96,
    reviewsCount: 64,
    cost: 32,
    price: 68,
    wholesale_price: 44,
    retail_price: 68,
    unit_price: 68,
    image: '/images/products/colway/colway-trichology-banner.jpg',
    images: [
      '/images/products/colway/colway-trichology-banner.jpg',
      '/images/products/colway/shampoo.png',
      '/images/products/colway/conditioner.png'
    ],
    description:
      'Colway Trichology Hair Strengthening System is a complete 2-step synergistic cosmeceutical therapy specifically formulated to arrest follicular miniaturisation, stimulate dormant stem cells at the dermal papilla, and repair damaged hair shafts. Combining the Strengthening Shampoo (densifying, sulphate-free, with diosmin and caffeine) and Strengthening Conditioner (cuticle sealing, with native fish tropocollagen and bio-silica), this system delivers the clinically validated Baicapil™ 2% complex (Scutellaria Baicalensis, Soy & Wheat Sprouts), Kerascalp™ (Phyllanthus Emblica Collagen XVII booster), and biomimetic Hydrafeel® 3.',
    shortDescription:
      'Synergistic 2-Step Trichological System (Shampoo 250mL + Conditioner 200mL) with Baicapil™ 2%, Native Tropocollagen, Kerascalp™ & Bio-Silica for Follicular Stem Cell Activation.',
    application_protocol: {
      frequency: '3–4× / Week',
      duration_of_use: 'Minimum 12 Weeks',
      steps: [
        {
          step: 1,
          phase: 'STEP 1: SHAMPOO',
          instruction: 'Apply Colway Strengthening Shampoo to wet scalp. Massage gently for 2–3 minutes to promote microvascular flow and allow diosmin and caffeine to penetrate dermal papilla cells. Rinse thoroughly.',
          duration: '2–3 min'
        },
        {
          step: 2,
          phase: 'STEP 2: CONDITIONER',
          instruction: 'Apply Colway Strengthening Conditioner from roots to ends. Leave in contact for 3–5 minutes for trans-epidermal Baicapil™ delivery and cuticle sealing. Rinse with cool water (≤38°C).',
          duration: '3–5 min',
          temp: '≤38°C'
        }
      ],
      professional_notes: [
        'Synergistic duo routine indicated for androgenetic alopecia, telogen effluvium, post-COVID shedding, and fragile follicular anchoring.',
        'Sulphate-free, paraben-free, silicone-free, and safe for color-treated hair.',
        'Integrates with injectable or oral GHK-Cu, PRP scalp sessions, and microneedling protocols.'
      ]
    },
    active_complexes: [
      {
        name: 'Baicapil™ 2%',
        description: 'Synergistic botanical complex (Scutellaria Baicalensis, Soy & Wheat Sprouts) clinically proven to stimulate hair growth, lengthen anagen phase, and increase density by up to 60.6%.'
      },
      {
        name: 'Kerascalp™',
        description: 'Phyllanthus Emblica (Amla) fruit extract upregulating Collagen XVII expression in follicle stem cells to prevent miniaturisation and graying.'
      },
      {
        name: 'Native Freshwater Fish Tropocollagen',
        description: 'Intact triple-helix collagen molecules that provide structural extracellular matrix scaffolding to the perifollicular sheath.'
      },
      {
        name: 'Hydrafeel® 3',
        description: 'Polyglyceryl-3 PCA biomimetic moisture active providing cuticular hydration, lipid bilayer repair, and shielding against thermal oxidation.'
      }
    ],
    variants: [
      {
        id: 'colway-trichology-var-duo',
        productId: 'colway-trichology',
        productName: 'Colway Trichology Hair Strengthening System',
        name: 'Colway Trichology Complete Duo System (Shampoo 250mL + Conditioner 200mL)',
        sku: 'SKU-COLWAY-TRICHOLOGY-DUO',
        format: 'Complete 2-Step System',
        dosage: 'Duo Pack (250mL + 200mL)',
        size: 'Duo Pack (250mL + 200mL)',
        pricing: {
          master: { perUnit: 32, currency: 'USD' },
          wholesale: { perUnit: 44, currency: 'USD' },
          clinic: { perUnit: 52, currency: 'USD' },
          retail: { perUnit: 68, currency: 'USD' }
        },
        cost: 32,
        price: 68,
        unit_price: 68,
        stock: { available: 50, allocated: 0, reserved: 0 },
        supplierId: 'supplier-colway',
        supplierName: 'Colway',
        supplier: 'Colway',
        hasCoa: true,
        hasGmp: true,
        status: 'published',
        volume: '450 mL Total'
      }
    ],
    formats: [
      { id: 'duo-system', name: 'Complete 2-Step System (Shampoo + Conditioner)', description: 'Full synergistic 90-day clinical regimen' }
    ],
    strengths: [
      { id: 'st-duo', name: 'Duo Pack (250mL + 200mL)' }
    ]
  }
};

export function getClinicalSupplementBySlug(slug) {
  if (!slug) return null;
  const clean = String(slug).toLowerCase().trim();
  return CLINICAL_SUPPLEMENTS[clean] || null;
}

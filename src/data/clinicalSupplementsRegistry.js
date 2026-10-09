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
  }
};

export function getClinicalSupplementBySlug(slug) {
  if (!slug) return null;
  const clean = String(slug).toLowerCase().trim();
  return CLINICAL_SUPPLEMENTS[clean] || null;
}

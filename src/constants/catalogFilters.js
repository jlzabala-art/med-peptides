export const GOALS = [
  { id: 'weight_loss_glp1', label: 'Weight Loss / GLP-1', dbKeys: ['metabolic_weight', 'metabolic & weight', 'weight_loss', 'fat_loss', 'glp1', 'glp-1'] },
  { id: 'metabolic_health', label: 'Metabolic Health', dbKeys: ['metabolic_weight', 'metabolic & weight', 'metabolism', 'blood_sugar', 'diabetes'] },
  { id: 'anti_aging_longevity', label: 'Anti-Aging & Longevity', dbKeys: ['longevity_anti_aging', 'longevity & anti-aging', 'longevity', 'anti_aging'] },
  { id: 'recovery_healing', label: 'Recovery & Healing', dbKeys: ['recovery_repair', 'recovery & repair', 'recovery', 'healing', 'joint_health', 'inflammation'] },
  { id: 'cognitive_mood', label: 'Cognitive & Mood', dbKeys: ['cognitive_mood', 'cognitive & mood', 'focus', 'memory', 'brain_health', 'sleep_circadian', 'sleep'] },
  { id: 'hormonal_optimization', label: 'Hormonal Optimization', dbKeys: ['hormonal_optimization', 'hormones', 'libido'] },
  { id: 'fertility', label: 'Fertility', dbKeys: ['fertility', 'reproduction'] },
  { id: 'immune_support', label: 'Immune Support', dbKeys: ['immune_support', 'immunity'] },
  { id: 'skin_hair_aesthetics', label: 'Skin / Hair / Aesthetics', dbKeys: ['skin_hair', 'skin & hair', 'skin', 'hair', 'aesthetics', 'beauty'] },
  { id: 'performance_muscle', label: 'Performance / Muscle', dbKeys: ['performance_muscle', 'performance & muscle', 'muscle_growth', 'stamina', 'energy'] },
  { id: 'biomarkers', label: 'Biomarkers', dbKeys: ['biomarkers', 'testing'] },
  { id: 'genomics', label: 'Genomics', dbKeys: ['genomics', 'dna'] },
  { id: 'general_wellness', label: 'General Wellness', dbKeys: ['general_wellness', 'wellness'] }
];

export const PRODUCT_TYPES = [
  { id: 'lyophilized_peptide', label: 'Lyophilized Peptides' },
  { id: 'api_peptide', label: 'API Peptides' },
  { id: 'api_supplement', label: 'API Supplements' },
  { id: 'dna_testing_kit', label: 'DNA Testing Kits' },
  { id: 'biomarker_testing_kit', label: 'Biomarker Testing Kits' },
  { id: 'pellet', label: 'Pellets' },
  { id: 'injectable', label: 'Injectables' },
  { id: 'capsule_tablet', label: 'Capsules / Tablets' },
  { id: 'medical_device', label: 'Medical Devices' },
  { id: 'consumable', label: 'Consumables' },
  { id: 'service', label: 'Services' }
];

export const COMMERCIAL_STATUSES = [
  { id: 'inStock', label: 'In Stock' },
  { id: 'outOfStock', label: 'Out of Stock' },
  { id: 'priceMissing', label: 'Price Missing' },
  { id: 'supplierMissing', label: 'Supplier Missing' },
  { id: 'singleSourceRisk', label: 'Single Source Risk' }
];

export const REGULATORY_STATUSES = [
  { id: 'registered', label: 'Registered' },
  { id: 'coaAvailable', label: 'COA Available' },
  { id: 'missingCOA', label: 'Missing COA' },
  { id: 'regulatoryRisk', label: 'Regulatory Risk' },
  { id: 'researchUseOnly', label: 'Research Use Only' }
];

export const TYPE_LABELS = PRODUCT_TYPES.reduce((acc, t) => { acc[t.id] = t.label; return acc; }, {});
export const GOAL_LABELS = GOALS.reduce((acc, g) => { acc[g.id] = g.label; return acc; }, {});

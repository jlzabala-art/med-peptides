/**
 * pharmapolisLabelsMap.js
 * Comprehensive registry mapping prescriptions to high-resolution (7.5 x 4.5 cm / 1500 x 900 px)
 * Pharmapolis compounding bottle labels with front, back QR, and front+micro-QR variants.
 */

export const PHARMAPOLIS_LABELS_REGISTRY = [
  // ── 51857: Amna Sultan Mohamed Ahmed Alotaiba ──
  {
    id: '51857-phase-1',
    prescriptionMatches: ['51857', 'RX-51857', 'RX-51857-A', 'RXG-51857-AMNA'],
    patientMatches: ['amna sultan', 'amna alotaiba'],
    phaseNumber: 1,
    patientName: 'Amna Sultan Mohamed Ahmed Alotaiba',
    fileNumber: '51857',
    productName: 'Morning Formula | With Breakfast',
    productTitle: 'Morning Formula | With Breakfast',
    subTitle: 'Phase 1: Morning Formula | With Breakfast',
    dosageForm: 'Oral Route (Vegetable Capsules)',
    volume: '60 Caps, 2 Months Treatment',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Ubiquinol (Kaneka® CoQ10) 250 mg + Saw Palmetto Extract 250 mg',
    apis: [
      { name: 'Ubiquinol (Kaneka® CoQ10)', dose: '250 mg', dosage: '250 mg', activeIngredient: 'Ubiquinol (Kaneka® CoQ10)' },
      { name: 'Saw Palmetto Extract', dose: '250 mg', dosage: '250 mg', activeIngredient: 'Saw Palmetto Extract' }
    ],
    vehicle: { name: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.', volume: '60 capsules' },
    directions: 'Take 1 capsule once daily with breakfast.',
    warnings: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives. Duration: 2 months.',
    prodDate: '04-10-2026',
    expDate: '04-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Plastic Surgery Clinic, Dubai',
    batchCode: 'PHARM-2026-UBISWP',
    lote: '2609-AMN1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_51857_morning_90caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51857_morning_90caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51857_morning_90caps_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/51857'
  },
  {
    id: '51857-phase-2',
    prescriptionMatches: ['51857', 'RX-51857', 'RX-51857-B', 'RXG-51857-AMNA'],
    patientMatches: ['amna sultan', 'amna alotaiba'],
    phaseNumber: 2,
    patientName: 'Amna Sultan Mohamed Ahmed Alotaiba',
    fileNumber: '51857',
    productName: 'Metabolic & Lipid Optimization Evening Formula',
    productTitle: 'Metabolic & Lipid Optimization Evening Formula - 120 capsules',
    subTitle: 'Phase 2: Metabolic & Lipid Formula | With Lunch and Dinner',
    dosageForm: 'Oral Route (Vegetable Capsules)',
    volume: '120 Capsules, 1 Month Treatment',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Red Yeast Rice Extract 600 mg + Berberine HCl 500 mg + Citrus Bergamot Extract 500 mg + Chromium Picolinate 100 mcg',
    apis: [
      { name: 'Red Yeast Rice Extract (Monascus purpureus)', dose: '600 mg', dosage: '600 mg', activeIngredient: 'Monascus purpureus (Citrinin-Free Monacolin K)' },
      { name: 'Berberine HCl', dose: '500 mg', dosage: '500 mg', activeIngredient: 'Berberine Hydrochloride 98%' },
      { name: 'Citrus Bergamot Extract', dose: '500 mg', dosage: '500 mg', activeIngredient: 'Bergamot Polyphenolic Fraction (BPF)' },
      { name: 'Chromium Picolinate', dose: '100 mcg', dosage: '100 mcg', activeIngredient: 'Chromium Tripicolinate' }
    ],
    vehicle: { name: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.', volume: '120 capsules' },
    directions: 'Take 2 capsules with lunch and 2 capsules with dinner.',
    warnings: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives. Duration: 1 month.',
    prodDate: '04-10-2026',
    expDate: '04-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Plastic Surgery Clinic, Dubai',
    batchCode: 'PHARM-2026-RYR',
    lote: '2609-AMN2',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_51857_metabolic_90caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51857_metabolic_90caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51857_metabolic_90caps_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/51857'
  },

  // ── 50957: Alan Maclean Rutledge ──
  {
    id: '50957-phase-1',
    prescriptionMatches: ['50957', 'RX-50957', '50957-A', 'RX-50957-A', 'RX-PHARM-2026-50957'],
    patientMatches: ['alan maclean', 'rutledge'],
    phaseNumber: 1,
    patientName: 'Alan Maclean Rutledge',
    fileNumber: '50957-A',
    productName: 'Proteolytic & Systemic Anti-Inflammatory Formula',
    productTitle: 'Proteolytic Formula - 270 acid-resistant vegetable capsules',
    subTitle: 'Phase 1: Proteolytic & Anti-Inflammatory Protocol',
    dosageForm: 'Oral Route (Enteric Capsules)',
    volume: '270 Capsules (3 Months)',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Nattokinase 2,000 FU (100 mg) + Serrapeptase 40,000 SPU (20 mg)',
    apis: [
      { name: 'Nattokinase', dose: '2,000 FU (100 mg)', dosage: '100 mg (2,000 FU)', activeIngredient: 'Nattokinase' },
      { name: 'Serrapeptase', dose: '40,000 SPU (20 mg)', dosage: '20 mg (40,000 SPU)', activeIngredient: 'Serrapeptase' }
    ],
    vehicle: { name: 'Acid-Resistant Vegetable Enteric Capsule Base', volume: '270 capsules' },
    directions: 'Week 1: 1 cap daily morning on empty stomach. From Week 2 onwards: 1 cap 3 times daily (morning, 5:00 PM, bedtime on empty stomach).',
    warnings: 'Acid-resistant vegetable capsules. Discontinue 3 days before blood tests. Keep out of reach of children.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic · Dubai Healthcare City, Dubai, UAE',
    batchCode: 'PHARM-2026-NATSER',
    lote: '2609-NAT',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_50957_proteolytic_270caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_50957_proteolytic_270caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_50957_proteolytic_270caps_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/RX-50957-A'
  },
  {
    id: '50957-phase-2',
    prescriptionMatches: ['50957-B', 'RX-50957-B'],
    patientMatches: ['alan maclean', 'rutledge'],
    phaseNumber: 2,
    patientName: 'Alan Maclean Rutledge',
    fileNumber: '50957-B',
    productName: 'Mitochondrial & Cellular Detox Formula',
    productTitle: 'Liver & Mitochondrial Support - 90 vegetable capsules',
    subTitle: 'Phase 2: Liver & Mitochondrial Support Protocol',
    dosageForm: 'Oral Route (Vegetable Capsules)',
    volume: '90 Capsules (3 Months)',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Alpha-Lipoic Acid 200 mg + Ubiquinol 100 mg + Pyrroloquinoline Quinone (PQQ) 10 mg',
    apis: [
      { name: 'Alpha-Lipoic Acid', dose: '200 mg', dosage: '200 mg', activeIngredient: 'Alpha-Lipoic Acid' },
      { name: 'PQQ (Pyrroloquinoline Quinone)', dose: '10 mg', dosage: '10 mg', activeIngredient: 'Pyrroloquinoline Quinone' },
      { name: 'Ubiquinol', dose: '100 mg', dosage: '100 mg', activeIngredient: 'Ubiquinol' }
    ],
    vehicle: { name: 'Hypoallergenic Vegetable Capsule Base', volume: '90 capsules' },
    directions: 'Take 1 capsule daily in the morning with food for 3 months.',
    warnings: 'Gluten-free, lactose-free, dairy-free. Hypoallergenic vegetable capsules. Keep out of reach of children.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic · Dubai Healthcare City, Dubai, UAE',
    batchCode: 'PHARM-2026-ALAUPI',
    lote: '2609-MITO',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_50957_mitochondrial_90caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_50957_mitochondrial_90caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_50957_mitochondrial_90caps_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/RX-50957-B'
  },

  // ── 51812: Abdulla Sultan Mohamed Ahmed Alotaiba ──
  {
    id: '51812-phase-1',
    prescriptionMatches: ['51812', 'RX-51812', 'RX-51812-A'],
    patientMatches: ['abdulla sultan', 'abdulla alotaiba'],
    phaseNumber: 1,
    patientName: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
    fileNumber: '51812',
    productName: 'Morning Metabolic & Energy Formula',
    productTitle: 'Morning Methylation & Mitochondrial Formula - 180 capsules',
    subTitle: 'Phase 1: Morning Mitochondrial & Hepatic Clearance',
    dosageForm: 'Oral Route (Plant-Based Capsules)',
    volume: '180 Capsules (2 Months)',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'B12 500 mcg + P5P 25 mg + B2 10 mg + TMG 500 mg + Ubiquinol 200 mg + Resveratrol 250 mg + NAC 600 mg',
    apis: [
      { name: 'Methylcobalamin (Vitamin B12)', dose: '500 mcg', dosage: '500 mcg' },
      { name: 'Pyridoxal-5’-Phosphate (Active Vitamin B6)', dose: '25 mg', dosage: '25 mg' },
      { name: 'Riboflavin-5\'-Phosphate Sodium (Active Vitamin B2)', dose: '10 mg', dosage: '10 mg' },
      { name: 'Trimethylglycine (TMG / Betaine Anhydrous)', dose: '500 mg', dosage: '500 mg' },
      { name: 'Ubiquinol (Kaneka Ubiquinol)', dose: '200 mg', dosage: '200 mg' },
      { name: 'Trans-Resveratrol', dose: '250 mg', dosage: '250 mg' },
      { name: 'N-Acetyl-L-Cysteine (NAC)', dose: '600 mg', dosage: '600 mg' }
    ],
    vehicle: { name: 'Vegetable capsules. Gluten-free, lactose-free, sugar-free, without artificial additives.', volume: '180 capsules' },
    directions: 'Take 3 capsules in the morning after breakfast.',
    warnings: 'May cause harmless bright yellow urine discoloration. Take with adequate water and food.',
    prodDate: '04-10-2026',
    expDate: '04-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic Day Surgery Center, Dubai',
    batchCode: 'PHARM-2026-METH90',
    lote: '2609-ABD1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_51812_morning_90caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51812_morning_90caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51812_morning_90caps_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/51812'
  },
  {
    id: '51812-phase-2',
    prescriptionMatches: ['51812', 'RX-51812', 'RX-51812-B'],
    patientMatches: ['abdulla sultan', 'abdulla alotaiba'],
    phaseNumber: 2,
    patientName: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
    fileNumber: '51812',
    productName: 'Night Restorative & Longevity Formula',
    productTitle: 'Before Bed Neuromuscular Formula - 120 capsules',
    subTitle: 'Phase 2: Evening Cellular Repair Protocol',
    dosageForm: 'Oral Route (Plant-Based Capsules)',
    volume: '120 Capsules (2 Months)',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Magnesium Bisglycinate 2,840 mg + Glycine 1,000 mg + L-Theanine 200 mg',
    apis: [
      { name: 'Magnesium Bisglycinate', dose: '2,840 mg', dosage: '2,840 mg', activeIngredient: 'Magnesium Bisglycinate Chelate' },
      { name: 'Glycine', dose: '1,000 mg', dosage: '1,000 mg', activeIngredient: 'Free-Form Glycine USP' },
      { name: 'L-Theanine', dose: '200 mg', dosage: '200 mg', activeIngredient: 'Suntheanine® L-Theanine' }
    ],
    vehicle: { name: 'Vegetable capsules. Gluten-free, lactose-free, sugar-free, without artificial additives.', volume: '120 capsules' },
    directions: 'Take 2 capsules 30-60 minutes before bedtime.',
    warnings: 'Non-habit forming. Promotes restorative slow-wave sleep architecture. Store tightly sealed.',
    prodDate: '04-10-2026',
    expDate: '04-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic Day Surgery Center, Dubai',
    batchCode: 'PHARM-2026-REST90',
    lote: '2609-ABD2',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_51812_night_90caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51812_night_90caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51812_night_90caps_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/51812'
  },

  // ── 51861: Basma Haitham K Bouzo ──
  {
    id: '51861-prep-1',
    prescriptionMatches: ['51861', 'RX-51861', '51861-A', 'RX-51861-A'],
    patientMatches: ['basma haitham', 'bouzo'],
    phaseNumber: 1,
    patientName: 'Basma Haitham K Bouzo',
    fileNumber: '51861-A',
    productName: 'Testosterone Micronized Transdermal Cream',
    productTitle: 'Testosterone Transdermal Cream 2 mg/mL - 90 mL',
    subTitle: 'Bioidentical Hormone Replacement Therapy (BHRT) · Morning',
    dosageForm: 'Topical Transdermal Cream (Pentravan®)',
    volume: '90 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Testosterone Micronized USP 2 mg/mL in Pentravan® Liposomal Vehicle Base 1 mL',
    apis: [
      { name: 'Testosterone Micronized USP', dose: '2 mg / mL', dosage: '2 mg / mL' }
    ],
    vehicle: { name: 'Pentravan® Liposomal Transdermal Cream Base', volume: '90 mL' },
    directions: 'Apply 1 pump (1 mL = 2 mg) every morning to clean, hairless skin of the inner forearm or lower abdomen.',
    warnings: 'For topical transdermal use only. Wash hands with soap after application. Avoid contact with children and pets.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Plastic Surgery Clinic, Dubai',
    batchCode: 'PHARM-2026-TEST90',
    lote: '2609-BAS1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_51861_testosterone_90ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51861_testosterone_90ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51861_testosterone_90ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/RX-51861-A'
  },
  {
    id: '51861-prep-2',
    prescriptionMatches: ['51861', 'RX-51861', '51861-B', 'RX-51861-B'],
    patientMatches: ['basma haitham', 'bouzo'],
    phaseNumber: 2,
    patientName: 'Basma Haitham K Bouzo',
    fileNumber: '51861-B',
    productName: '17β-Estradiol Micronized Transdermal Cream',
    productTitle: '17β-Estradiol Transdermal Cream 2 mg/mL - 90 mL',
    subTitle: 'Bioidentical Hormone Replacement Therapy (BHRT) · Evening',
    dosageForm: 'Topical Transdermal Cream (Pentravan®)',
    volume: '90 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: '17β-Estradiol Micronized USP 2 mg/mL in Pentravan® Liposomal Vehicle Base 1 mL',
    apis: [
      { name: '17β-Estradiol Micronized USP', dose: '2 mg / mL', dosage: '2 mg / mL' }
    ],
    vehicle: { name: 'Pentravan® Liposomal Transdermal Cream Base', volume: '90 mL' },
    directions: 'Apply 1 pump (1 mL = 2 mg) every evening at bedtime to clean skin of the inner thigh or upper arm.',
    warnings: 'For topical transdermal use only. Do not apply directly to breasts or mucous membranes. Wash hands after use.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Plastic Surgery Clinic, Dubai',
    batchCode: 'PHARM-2026-ESTR90',
    lote: '2609-BAS2',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_51861_estradiol_90ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51861_estradiol_90ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51861_estradiol_90ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/RX-51861-B'
  },

  // ── 51245: Aamer Reza Habib ──
  {
    id: '51245-prep-1',
    prescriptionMatches: ['51245', 'RX-51245'],
    patientMatches: ['aamer reza', 'habib', 'aamer'],
    phaseNumber: 1,
    patientName: 'Aamer Reza Habib',
    fileNumber: '51245',
    productName: 'Diltiazem 2% & Lidocaine 2% Compounded Topical Ointment',
    productTitle: 'Diltiazem 2% + Lidocaine 2% Pomade - 30 g',
    subTitle: 'Custom Galenic Pomade · Fragrance & Alcohol Free Hypoallergenic Base (30 g)',
    dosageForm: 'Topical Pomade / Ointment',
    volume: '30 g',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Diltiazem Hydrochloride USP 2% (0.6 g) + Lidocaine Hydrochloride USP 2% (0.6 g) in Hypoallergenic Ointment Base (Fragrance & Alcohol Free) q.s. 30 g',
    apis: [
      { name: 'Diltiazem Hydrochloride USP', dose: '2% (0.6 g)', dosage: '2% (0.6 g)' },
      { name: 'Lidocaine Hydrochloride USP', dose: '2% (0.6 g)', dosage: '2% (0.6 g)' }
    ],
    vehicle: { name: 'Hypoallergenic Non-Irritating Ointment Base (Fragrance & Alcohol Free, q.s. 30 g)', volume: '30 g' },
    directions: 'Apply a pea-sized amount to the affected area twice daily (morning and evening) for 2 months.',
    warnings: 'For topical / perianal use only. Wash hands after application. Keep out of reach of children.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store at room temperature (15°C - 25°C)',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic Day Surgery Center, Dubai',
    batchCode: 'PHARM-2026-DL30G',
    lote: '2609-HAB1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_51245_diltiazem_30g_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51245_diltiazem_30g_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51245_diltiazem_30g_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/RX-51245'
  },

  // ── 6F8QZC: Eldose Babu (Fagron TrichoTest™ - Official Signed Medical Prescription) ──
  {
    id: '6f8qzc-prep-1',
    prescriptionMatches: ['6F8QZC', 'RX-6F8QZC', '6f8qzc2qv5YFkfiEKCyO', 'BOX03071AATRI'],
    patientMatches: ['eldose', 'babu'],
    phaseNumber: 1,
    patientName: 'Eldose Babu',
    fileNumber: 'RX-6F8QZC',
    productName: 'Personalized Follicular Therapy (TrichoFoam™ 100 mL)',
    productTitle: 'Minoxidil 4% + Dutasteride 0.25% + IGrantine-F1 0.5% Foam - 100 mL',
    subTitle: 'TrichoTest™ Pharmacogenetic Prescription (Dr. Çağatay Sezgin, MD, FISHRS)',
    dosageForm: 'Topical Scalp Foam (TrichoFoam™)',
    volume: '100 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Minoxidil 4% + Dutasteride 0.25% + IGrantine-F1™ 0.5% in TrichoFoam™ 100 mL',
    apis: [
      { name: 'Minoxidil', dose: '4% Topical', dosage: '4% Topical' },
      { name: 'Dutasteride', dose: '0.25% Topical', dosage: '0.25% Topical' },
      { name: 'IGrantine-F1™', dose: '0.5% Topical', dosage: '0.5% Topical' }
    ],
    vehicle: { name: 'TrichoFoam™ Lipophilic Topical Foam Base', volume: '100 mL' },
    directions: 'Apply 2 pumps daily at bedtime onto dry scalp with gentle massage. Leave on overnight; wash scalp next morning if desired. Wash hands after use.',
    warnings: 'For topical scalp use only. Avoid contact with eyes and mucous membranes. Keep out of reach of children.',
    prodDate: '19-11-2025',
    expDate: '19-11-2026',
    storage: 'Store at room temperature (15°C - 25°C) away from direct sunlight',
    doctorName: 'Dr. Çağatay Sezgin, MD, FISHRS',
    doctorLicense: 'DHA 00208953-005',
    clinicName: 'Hortman Clinics · Jumeirah 1, Dubai',
    batchCode: 'PHARM-2026-TF100',
    lote: '2609-ELD1',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/RX-6F8QZC'
  },

  // ── Mohammed Ahmad Aishehhi: BOX03483AATRI ──
  {
    id: 'box03483-trichotest',
    prescriptionMatches: ['BOX03483AATRI', 'BOX03483', 'TRICHOTEST-03483'],
    patientMatches: ['mohammed ahmad', 'aishehhi'],
    phaseNumber: 1,
    patientName: 'Mohammed Ahmad Aishehhi',
    fileNumber: 'BOX03483AATRI',
    productName: 'TrichoSol 100ml',
    productTitle: 'TrichoSol 100ml',
    subTitle: 'Targeted Anti-Androgenic & Vasodilatory Complex',
    dosageForm: 'Topical Scalp Solution (TrichoSol™)',
    volume: '100 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Minoxidil 4% + Spironolactone 1% + Arginine 1.5% in TrichoSol™ 100 mL',
    apis: [
      { name: 'Minoxidil', dose: '4%', dosage: '4%', activeIngredient: 'Minoxidil' },
      { name: 'Spironolactone', dose: '1%', dosage: '1%', activeIngredient: 'Spironolactone' },
      { name: 'Arginine', dose: '1.5%', dosage: '1.5%', activeIngredient: 'Arginine' }
    ],
    vehicle: { name: 'TrichoSol™ (Alcohol-Free Hydrophilic Compounding Vehicle, 100 mL)', volume: '100 mL' },
    directions: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
    warnings: 'For topical scalp use only. Leave on scalp as long as possible. Wash scalp the next day.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-TRI100',
    lote: '2609-MHD1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_box03483_trichotest_100ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_box03483_trichotest_100ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_box03483_trichotest_100ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/BOX03483AATRI'
  },

  // ── Haya Hassen Al-Haidose: BOX01399AATRI ──
  {
    id: 'box01399-trichosol-part1',
    prescriptionMatches: ['BOX01399AATRI', 'BOX01399', 'RX-BOX01399AATRI', 'TRICHOTEST-01399', '29763404111'],
    patientMatches: ['haya', 'hassen', 'haidose', 'al-haidose'],
    phaseNumber: 1,
    partLabel: 'Part 1: Topical Treatment (100 mL)',
    patientName: 'Haya Hassen Al-Haidose',
    fileNumber: 'BOX01399AATRI',
    productName: 'TrichoSol 100ml',
    productTitle: 'TrichoSol 100ml',
    subTitle: 'Targeted Follicular Regeneration & 5αR Modulation Complex (Part 1)',
    dosageForm: 'Topical Scalp Solution (TrichoSol™)',
    volume: '100 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: '17-α Estradiol 0.05% + IGrantine-F1 TM 0.5% in TrichoSol™ 100 mL',
    apis: [
      { name: '17-α Estradiol', dose: '0.05%', dosage: '0.05%', activeIngredient: '17-α Estradiol (Alfatradiol)' },
      { name: 'IGrantine-F1 TM', dose: '0.5%', dosage: '0.5%', activeIngredient: 'IGrantine-F1™' }
    ],
    vehicle: { name: 'TrichoSol™ (Alcohol-Free Hydrophilic Compounding Vehicle, 100 mL)', volume: '100 mL' },
    directions: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
    warnings: 'For topical scalp use only. Leave on scalp as long as possible. Wash scalp the next day.',
    prodDate: '29-05-2024',
    expDate: '28-05-2025',
    storage: 'Store at room temperature away from direct light',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2024-TRI-BOX01399',
    lote: '2405-HAY1',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/BOX01399AATRI'
  },
  {
    id: 'box01399-trichowash-part2',
    prescriptionMatches: ['BOX01399AATRI', 'BOX01399', 'RX-BOX01399AATRI', 'TRICHOTEST-01399', '29763404111'],
    patientMatches: ['haya', 'hassen', 'haidose', 'al-haidose'],
    phaseNumber: 2,
    partLabel: 'Part 2: Scalp Care & Hygiene (250 mL)',
    patientName: 'Haya Hassen Al-Haidose',
    fileNumber: 'BOX01399AATRI',
    productName: 'TrichoWash 250ml',
    productTitle: 'TrichoWash 250ml',
    subTitle: 'Trichological Scalp Cleansing & Sebomodulating Shampoo (Part 2)',
    dosageForm: 'Topical Scalp Wash / Shampoo (TrichoWash™)',
    volume: '250 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Zinc acetate 0.5% + D-Panthenol 0.5% in TrichoWash™ 250 mL',
    apis: [
      { name: 'Zinc acetate', dose: '0.5%', dosage: '0.5%', activeIngredient: 'Zinc Acetate (USP)' },
      { name: 'D-Panthenol', dose: '0.5%', dosage: '0.5%', activeIngredient: 'D-Panthenol (Pro-Vitamin B5)' }
    ],
    vehicle: { name: 'TrichoWash™ (Sulfate-Free Dermocompatible Cleansing Base, 250 mL)', volume: '250 mL' },
    directions: 'Massage for 2 minutes and rinse.',
    warnings: 'For topical scalp wash only. Rinse thoroughly with water. Avoid eye contact.',
    prodDate: '29-05-2024',
    expDate: '28-05-2025',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2024-WASH-BOX01399',
    lote: '2405-HAY2',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/BOX01399AATRI'
  },

  // ── Julien Boiteux: BOX03529AATRI ──
  {
    id: 'box03529-trichotest-part1',
    prescriptionMatches: ['BOX03529AATRI', 'BOX03529', 'RX-BOX03529AATRI', 'RX-20261001-16AD'],
    patientMatches: ['julien', 'boiteux'],
    phaseNumber: 1,
    patientName: 'Julien Boiteux',
    fileNumber: 'BOX03529AATRI',
    productName: 'TrichoSol 100ml',
    productTitle: 'TrichoSol 100ml',
    subTitle: 'Targeted Anti-Androgenic & Vasodilatory Complex (Phase 1)',
    dosageForm: 'Topical Scalp Solution (TrichoSol™)',
    volume: '100 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Minoxidil 4% + Spironolactone 1% + Arginine 1.5% in TrichoSol™ 100 mL',
    apis: [
      { name: 'Minoxidil', dose: '4%', dosage: '4%', activeIngredient: 'Minoxidil' },
      { name: 'Spironolactone', dose: '1%', dosage: '1%', activeIngredient: 'Spironolactone' },
      { name: 'L-Arginine', dose: '1.5%', dosage: '1.5%', activeIngredient: 'L-Arginine' }
    ],
    vehicle: { name: 'TrichoSol™ (Alcohol-Free Hydrophilic Compounding Vehicle, 100 mL)', volume: '100 mL' },
    directions: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
    warnings: 'For topical scalp use only. Leave on scalp as long as possible. Wash scalp the next day.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-TRI-BOX03529',
    lote: '2609-JB1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_box03529_trichosol_100ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_box03529_trichosol_100ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_box03529_trichosol_100ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/BOX03529AATRI'
  },
  {
    id: 'box03529-trichotest-part2',
    prescriptionMatches: ['BOX03529AATRI', 'BOX03529', 'RX-BOX03529AATRI', 'RX-20261001-16AD'],
    patientMatches: ['julien', 'boiteux'],
    phaseNumber: 2,
    patientName: 'Julien Boiteux',
    fileNumber: 'BOX03529AATRI',
    productName: 'TrichoOil 30ml',
    productTitle: 'TrichoOil 30ml',
    subTitle: 'Scalp Care & Lipid Conditioning (Phase 2)',
    dosageForm: 'Topical Scalp Oil (TrichoOil™)',
    volume: '30 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Ginseng 2% + Ginkgo biloba 2.5% + Vitamin E (Tocopherol) 5% in TrichoOil™ 30 mL',
    apis: [
      { name: 'Ginseng', dose: '2%', dosage: '2%', activeIngredient: 'Panax Ginseng Extract' },
      { name: 'Ginkgo biloba', dose: '2.5%', dosage: '2.5%', activeIngredient: 'Ginkgo biloba Extract' },
      { name: 'Vitamin E (Tocopherol)', dose: '5%', dosage: '5%', activeIngredient: 'Alpha-Tocopherol' }
    ],
    vehicle: { name: 'TrichoOil™ (100% Natural Scalp Compounding Vehicle, 30 mL)', volume: '30 mL' },
    directions: '1-2 times / week, massage for 3-5 minutes and leave it on for 10 min before washing your hair.',
    warnings: 'For topical scalp use only. Store away from direct sunlight.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-OIL-BOX03529',
    lote: '2609-JB2',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_box03529_trichooil_30ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_box03529_trichooil_30ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_box03529_trichooil_30ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/BOX03529AATRI'
  },

  // ── Mangesh Sakharkar: RX-MS-0903 ──
  {
    id: 'mangesh-oral',
    prescriptionMatches: ['RX-MS-0903', 'MS-0903', 'MANGESH'],
    patientMatches: ['mangesh', 'sakharkar'],
    phaseNumber: 1,
    patientName: 'Mangesh Sakharkar',
    fileNumber: 'RX-MS-0903',
    productName: 'Oral Follicular Longevity Formula',
    productTitle: 'Oral Treatment - 90 Capsules (3 Months)',
    subTitle: 'Systemic Micro-Circulation & Trace Element Support',
    dosageForm: 'Oral Route (Plant-Based Capsules)',
    volume: '90 Capsules (3 Months)',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Oral Minoxidil (man) 3.5 mg + Selenium yeast 80 mg',
    directions: 'Take 1 capsule per day with food. 90 capsules for 3 months course.',
    warnings: 'Take with food. Do not exceed prescribed dose. Keep out of reach of children.',
    prodDate: '03-09-2026',
    expDate: '03-09-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-MS-OR1',
    lote: '2609-MS2',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_mangesh_oral_90caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_mangesh_oral_90caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_mangesh_oral_90caps_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/RX-MS-0903'
  },
  {
    id: 'mangesh-trichosol',
    prescriptionMatches: ['RX-MS-0903', 'MS-0903', 'MANGESH'],
    patientMatches: ['mangesh', 'sakharkar'],
    phaseNumber: 2,
    patientName: 'Mangesh Sakharkar',
    fileNumber: 'RX-MS-0903',
    productName: 'Triple-Action Topical Scalp Serum',
    productTitle: 'TrichoSol - 100 ml',
    subTitle: 'High-Concentration Anti-DHT & Prostaglandin Formulation',
    dosageForm: 'Topical Scalp Solution (TrichoSol™)',
    volume: '100 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Latanoprost 0.005 % + Dutasteride 0.25 % + TrichoXidil 4 %',
    directions: 'Apply at night before bedtime. Leave on scalp overnight. Wash next day. Massage gently.',
    warnings: 'For topical use only. Avoid contact with eyes and mucous membranes.',
    prodDate: '03-09-2026',
    expDate: '03-09-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-MS-TR1',
    lote: '2609-MS1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_mangesh_trichosol_100ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_mangesh_trichosol_100ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_mangesh_trichosol_100ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/RX-MS-0903'
  },

  // ── Matthew Taylor: RX-MT-0903 ──
  {
    id: 'matthew-trichooil',
    prescriptionMatches: ['RX-MT-0903', 'MT-0903', 'MATTHEW'],
    patientMatches: ['matthew', 'taylor'],
    phaseNumber: 1,
    patientName: 'Matthew Taylor',
    fileNumber: 'RX-MT-0903',
    productName: 'Tocopherol Lipidic Nourishing Scalp Oil',
    productTitle: 'TrichoOil - 30ml',
    subTitle: 'Follicular Protective Scalp Elixir',
    dosageForm: 'Lipidic Scalp Oil (TrichoOil™)',
    volume: '30 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Vitamin E (Tocoferol) 5 % in TrichoOil vehicle',
    apis: [
      { name: 'Vitamin E (Tocopherol)', dose: '5%', dosage: '5%', activeIngredient: 'Alpha-Tocopherol' }
    ],
    vehicle: { name: 'TrichoOil™ (100% Natural Scalp Compounding Vehicle, 30 mL)', volume: '30 mL' },
    directions: '1-2 times / week, massage 3-5 min, leave 10 min before washing.',
    warnings: 'For topical scalp use only. Store away from direct sunlight.',
    prodDate: '03-09-2026',
    expDate: '03-09-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-MT-OIL',
    lote: '2609-MT2',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_matthew_trichooil_30ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_matthew_trichooil_30ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_matthew_trichooil_30ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/RX-MT-0903'
  },
  {
    id: 'matthew-trichosol',
    prescriptionMatches: ['RX-MT-0903', 'MT-0903', 'MATTHEW'],
    patientMatches: ['matthew', 'taylor'],
    phaseNumber: 2,
    patientName: 'Matthew Taylor',
    fileNumber: 'RX-MT-0903',
    productName: 'Follicular Regrowth Precision Solution',
    productTitle: 'TrichoSol - 100ml',
    subTitle: 'Dual Prostaglandin & 5AR Targeted Therapy',
    dosageForm: 'Topical Scalp Solution (TrichoSol™)',
    volume: '100 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Latanoprost Fagron 0.005 % + Dutasteride 0.25 %',
    apis: [
      { name: 'Latanoprost', dose: '0.005%', dosage: '0.005%', activeIngredient: 'Latanoprost' },
      { name: 'Dutasteride', dose: '0.25%', dosage: '0.25%', activeIngredient: 'Dutasteride' }
    ],
    vehicle: { name: 'TrichoSol™ (Alcohol-Free Hydrophilic Compounding Vehicle, 100 mL)', volume: '100 mL' },
    directions: 'Apply at night before bedtime. Leave on scalp overnight. Wash next day. Massage gently.',
    warnings: 'For topical use only. Avoid contact with eyes and mucous membranes.',
    prodDate: '03-09-2026',
    expDate: '03-09-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-MT-TR1',
    lote: '2609-MT1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_matthew_trichosol_100ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_matthew_trichosol_100ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_matthew_trichosol_100ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/RX-MT-0903'
  },

  // ── Saeed Musallam ──
  {
    id: 'saeed-night-formula',
    prescriptionMatches: ['RX-20261002-N5BH', 'RX-20261002-IKE7'],
    patientMatches: ['saeed musallam', 'saeed almazrouei'],
    phaseNumber: 1,
    patientName: 'Saeed Musallam Mefleh Khamis Almazrouei',
    fileNumber: 'BOX03492AANUT',
    productName: 'Night Metabolic & Longevity Formula',
    productTitle: 'Night Formula - 270 capsules',
    subTitle: 'Phase 3: Systemic Metabolic & Antioxidant Consolidation',
    dosageForm: 'Oral Route (Plant-Based Capsules)',
    volume: '270 Capsules (3 Months)',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'P5P (Pyridoxal-5-Phosphate) 25 mg + Magnesium Glycinate 500 mg + L-Theanine 200 mg + Glycine 1000 mg + 5-HTP 50 mg + Apigenin 50 mg',
    directions: 'Take 3 capsules per dose nightly 30-60 minutes before bedtime.',
    warnings: 'May cause drowsiness. Do not drive or operate machinery after consumption. Keep out of reach of children.',
    prodDate: '18-08-2026',
    expDate: '18-08-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-NF270',
    lote: '2608-NF',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_saeed_night_formula_270caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_saeed_night_formula_270caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_saeed_night_formula_270caps_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/BOX03492AANUT?view=patient'
  },

  // ── Noura Majed Mohamed Alfuttaim ──
  {
    id: 'noura-evening-formula',
    prescriptionMatches: ['RX-NMMA-2', 'rx_nmma_2', 'NMMA', '51812-N'],
    patientMatches: ['noura majed', 'alfuttaim'],
    phaseNumber: 1,
    patientName: 'Noura Majed Mohamed Alfuttaim',
    fileNumber: 'RX-NMMA-2',
    productName: 'Personalized Evening Formula',
    productTitle: 'Personalized Evening Formula - 90 capsules',
    subTitle: 'Targeted Metabolic & Neuro-Restorative Sleep Architecture',
    dosageForm: 'Oral Route (Plant-Based Capsules)',
    volume: '90 Capsules (1 Month)',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Ashwagandha 600mg + Citrus 500mg + Mg Glycinate 400mg + Tryptophan 400mg + Theanine 200mg + GABA 200mg + P5P 20mg + Melatonin 5mg + L-Methylfolate 400mcg',
    apis: [
      { name: 'Ashwagandha (KSM-66)', dose: '600 mg' },
      { name: 'Citrus sinensis extract', dose: '500 mg' },
      { name: 'Magnesium Glycinate', dose: '400 mg' },
      { name: 'L-Tryptophan', dose: '400 mg' },
      { name: 'L-Theanine', dose: '200 mg' },
      { name: 'GABA', dose: '200 mg' },
      { name: 'Pyridoxal-5-Phosphate (P5P)', dose: '20 mg' },
      { name: 'Melatonin', dose: '5 mg' },
      { name: 'L-Methylfolate', dose: '400 mcg' }
    ],
    vehicle: { name: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free.', volume: '90 capsules' },
    directions: 'Take 3 capsules 30-45 minutes before bedtime with water for 1 month.',
    warnings: 'Promotes restorative slow-wave sleep. Keep tightly closed in a cool dry place.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic, Dubai',
    batchCode: 'PHARM-2026-NMMA-EVE',
    lote: '2609-NOU1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_NOURA_MAJED_MOHAMED_ALFUTTAIM_nmma_evening_formula_90caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_NOURA_MAJED_MOHAMED_ALFUTTAIM_nmma_evening_formula_90caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_NOURA_MAJED_MOHAMED_ALFUTTAIM_nmma_evening_formula_90caps_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/rx_nmma_2'
  },

  // ── Daria Grek ──
  {
    id: 'daria-trichosol',
    prescriptionMatches: ['RX-20261001-SW8B', 'CfOwJCEFcnwmww0TjtZ5', 'SW8B'],
    patientMatches: ['daria', 'grek'],
    phaseNumber: 1,
    patientName: 'Daria Grek',
    fileNumber: 'SW8B',
    productName: 'TrichoSol 100ml',
    productTitle: 'TrichoSol 100ml',
    subTitle: 'Targeted Anti-Androgenic & Vasodilatory Complex (Phase 1)',
    dosageForm: 'Topical Scalp Solution (TrichoSol™)',
    volume: '100 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Minoxidil 3% + Spironolactone 2.5% + Arginine 1.5% in TrichoSol™ 100 mL',
    apis: [
      { name: 'Minoxidil', dose: '3%' },
      { name: 'Spironolactone', dose: '2.5%' },
      { name: 'Arginine', dose: '1.5%' }
    ],
    vehicle: { name: 'TrichoSol™ (Alcohol-Free Hydrophilic Compounding Vehicle, 100 mL)', volume: '100 mL' },
    directions: 'Apply at night before bedtime. Leave on scalp as long as possible. Wash next day.',
    warnings: 'For topical scalp use only. Keep out of reach of children.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-DG-TR1',
    lote: '2609-DG1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_DARIA_GREK_daria_trichosol_100ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_DARIA_GREK_daria_trichosol_100ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_DARIA_GREK_daria_trichosol_100ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/CfOwJCEFcnwmww0TjtZ5'
  },
  {
    id: 'daria-capsules',
    prescriptionMatches: ['RX-20261001-SW8B', 'CfOwJCEFcnwmww0TjtZ5', 'SW8B'],
    patientMatches: ['daria', 'grek'],
    phaseNumber: 2,
    patientName: 'Daria Grek',
    fileNumber: 'SW8B',
    productName: 'Oral Hair Vitality Formula',
    productTitle: 'Oral Hair Vitality Formula - 90 capsules',
    subTitle: 'Systemic Follicular Micronutrient & Antioxidant Complex (Phase 2)',
    dosageForm: 'Oral Route (Plant-Based Capsules)',
    volume: '90 Capsules (3 Months)',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Turmeric 200mg + CoQ10 45mg + NAC 138mg + Biotin 1000mcg + Zinc 12mg + Iron 50mg',
    apis: [
      { name: 'Turmeric Dry Extract', dose: '200 mg' },
      { name: 'Coenzyme Q10', dose: '45 mg' },
      { name: 'N-Acetyl-L-Cysteine', dose: '138 mg' },
      { name: 'Biotin', dose: '1,000 mcg' },
      { name: 'Zinc', dose: '12 mg' },
      { name: 'Iron Bisglycinate', dose: '50 mg' }
    ],
    vehicle: { name: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.', volume: '90 capsules' },
    directions: 'Take 1 capsule 3 times daily with meals for 3 months.',
    warnings: 'Oral dietary supplement. Store in a cool dry place.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-DG-CAP',
    lote: '2609-DG2',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_DARIA_GREK_daria_capsules_90caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_DARIA_GREK_daria_capsules_90caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_DARIA_GREK_daria_capsules_90caps_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/CfOwJCEFcnwmww0TjtZ5'
  },
  {
    id: 'daria-trichooil',
    prescriptionMatches: ['RX-20261001-SW8B', 'CfOwJCEFcnwmww0TjtZ5', 'SW8B'],
    patientMatches: ['daria', 'grek'],
    phaseNumber: 3,
    patientName: 'Daria Grek',
    fileNumber: 'SW8B',
    productName: 'TrichoOil 30ml',
    productTitle: 'TrichoOil 30ml',
    subTitle: 'Scalp Care & Lipid Conditioning (Phase 3)',
    dosageForm: 'Topical Scalp Oil (TrichoOil™)',
    volume: '30 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Ginseng 2.5% + Ginkgo biloba 1% + Vitamin E (Tocopherol) 5% in TrichoOil™ 30 mL',
    apis: [
      { name: 'Ginseng', dose: '2.5%' },
      { name: 'Ginkgo biloba', dose: '1%' },
      { name: 'Vitamin E (Tocopherol)', dose: '5%' }
    ],
    vehicle: { name: 'TrichoOil™ (100% Natural Scalp Compounding Vehicle, 30 mL)', volume: '30 mL' },
    directions: '1-2 times / week, massage 3-5 min, leave 10 min before washing your hair.',
    warnings: 'For topical scalp use only. Store away from direct sunlight.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-DG-OIL',
    lote: '2609-DG3',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_DARIA_GREK_daria_trichooil_30ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_DARIA_GREK_daria_trichooil_30ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_DARIA_GREK_daria_trichooil_30ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/CfOwJCEFcnwmww0TjtZ5'
  },
  {
    id: 'daria-trichowash',
    prescriptionMatches: ['RX-20261001-SW8B', 'CfOwJCEFcnwmww0TjtZ5', 'SW8B'],
    patientMatches: ['daria', 'grek'],
    phaseNumber: 4,
    patientName: 'Daria Grek',
    fileNumber: 'SW8B',
    productName: 'TrichoWash 250ml',
    productTitle: 'TrichoWash 250ml',
    subTitle: 'Scalp Cleansing & Barrier Conditioning (Phase 4)',
    dosageForm: 'Topical Scalp Wash (TrichoWash™)',
    volume: '250 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Salicylic Acid 2% + Ketoconazole 2% in TrichoWash™ Cleansing Shampoo Base 250 mL',
    apis: [
      { name: 'Salicylic Acid', dose: '2%' },
      { name: 'Ketoconazole', dose: '2%' }
    ],
    vehicle: { name: 'TrichoWash™ Cleansing Base', volume: '250 mL' },
    directions: 'Apply to wet scalp 2-3 times weekly, lather, leave for 2-3 minutes, rinse thoroughly.',
    warnings: 'For external scalp wash only. Avoid contact with eyes.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-DG-WASH',
    lote: '2609-DG4',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_DARIA_GREK_daria_trichowash_250ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_DARIA_GREK_daria_trichowash_250ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_DARIA_GREK_daria_trichowash_250ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/CfOwJCEFcnwmww0TjtZ5'
  },

  // ── Ghada Abdulaziz Ishaq ──
  {
    id: 'ghada-estradiol',
    prescriptionMatches: ['RX-51253', '51253', '51253-A'],
    patientMatches: ['ghada abdulaziz', 'ishaq'],
    phaseNumber: 1,
    patientName: 'Ghada Abdulaziz Ishaq',
    fileNumber: '51253',
    productName: 'Formula Estradiol (Transdermal)',
    productTitle: 'Formula Estradiol (Transdermal) - 60 mL',
    subTitle: 'Bioidentical Transdermal Estrogen Therapy (Phase 1)',
    dosageForm: 'Transdermal Cream (Pentravan®)',
    volume: '60 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: '17β-Estradiol Micronized Bioidentical 1 mg/mL in Pentravan® Base 1 mL',
    apis: [
      { name: 'Estradiol (micronized, bioidentical)', dose: '1 mg/mL' }
    ],
    vehicle: { name: 'Pentravan® Liposomal Vehicle Base', volume: '60 mL' },
    directions: 'Apply 1 mL transdermally before bedtime to clean, dry, hairless skin of inner thigh.',
    warnings: 'For transdermal use only. Do not apply to breasts. Wash hands after application.',
    prodDate: '06-10-2026',
    expDate: '05-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic · Dubai Healthcare City',
    batchCode: 'PHARM-2026-GHA-EST',
    lote: '2609-GHA1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_GHADA_ABDULAZIZ_ISHAQ_51253_estradiol_60ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_GHADA_ABDULAZIZ_ISHAQ_51253_estradiol_60ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_GHADA_ABDULAZIZ_ISHAQ_51253_estradiol_60ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/RX-51253'
  },
  {
    id: 'ghada-dhea',
    prescriptionMatches: ['RX-51253-B', '51253-B', '51253'],
    patientMatches: ['ghada abdulaziz', 'ishaq'],
    phaseNumber: 2,
    patientName: 'Ghada Abdulaziz Ishaq',
    fileNumber: '51253',
    productName: 'Dehydroepiandrosterone (DHEA) 5 mg',
    productTitle: 'Dehydroepiandrosterone (DHEA) 5 mg - 60 capsules',
    subTitle: 'Adrenal Androgen Precursor Protocol (Phase 2)',
    dosageForm: 'Oral Route (Plant-Based Capsules)',
    volume: '60 Capsules (2 Months)',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Dehydroepiandrosterone (DHEA) USP 5 mg in vegetable capsules',
    apis: [
      { name: 'Dehydroepiandrosterone (DHEA)', dose: '5 mg' }
    ],
    vehicle: { name: 'Vegetable capsules. Gluten-free, lactose-free.', volume: '60 capsules' },
    directions: 'Take 1 capsule once daily in the morning with breakfast with water.',
    warnings: 'Oral route only. Keep out of reach of children. Store tightly closed.',
    prodDate: '06-10-2026',
    expDate: '05-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic · Dubai Healthcare City',
    batchCode: 'PHARM-2026-GHA-DHEA',
    lote: '2609-GHA2',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_GHADA_ABDULAZIZ_ISHAQ_51253_dhea_60caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_GHADA_ABDULAZIZ_ISHAQ_51253_dhea_60caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_GHADA_ABDULAZIZ_ISHAQ_51253_dhea_60caps_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/RX-51253-B'
  },

  // ── Reem F M Alghanim ──
  {
    id: 'reem-hormone-cream',
    prescriptionMatches: ['RX-RFMA-2', 'rx_rfma_2', '51855'],
    patientMatches: ['reem', 'alghanim'],
    phaseNumber: 1,
    patientName: 'Reem F M Alghanim',
    fileNumber: '51855',
    productName: 'Bioidentical Hormone Cream',
    productTitle: 'Bioidentical Hormone Cream - 60 mL',
    subTitle: 'Dual Androgen & Estrogen Precision Cream (Micronized Base)',
    dosageForm: 'Transdermal Cream (Pentravan®)',
    volume: '60 mL (2 Months)',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Testosterone Micronized 1 mg + Estradiol Micronized 2 mg in Pentravan® Base',
    apis: [
      { name: 'Testosterone (Micronized)', dose: '1 mg/mL' },
      { name: 'Estradiol (Micronized)', dose: '2 mg/mL' }
    ],
    vehicle: { name: 'Pentravan® Liposomal Micronized Base', volume: '60 mL' },
    directions: 'Apply 1 pump (1 mL) once daily in morning to clean skin of inner forearm or thigh.',
    warnings: 'For transdermal use only. Wash hands thoroughly after application.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic, Dubai',
    batchCode: 'PHARM-2026-RFMA-CRM',
    lote: '2609-RFM1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_REEM_F_M_ALGHANIM_rfma_hormone_cream_60ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_REEM_F_M_ALGHANIM_rfma_hormone_cream_60ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_REEM_F_M_ALGHANIM_rfma_hormone_cream_60ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/rx_rfma_2'
  },

  // ── George Mills ──
  {
    id: 'george-trichosol',
    prescriptionMatches: ['RX-518134', '518134'],
    patientMatches: ['george', 'mills'],
    phaseNumber: 1,
    patientName: 'George Mills',
    fileNumber: '518134',
    productName: 'TrichoSol 100ml',
    productTitle: 'TrichoSol 100ml',
    subTitle: 'Targeted Vasodilatory & 5-AR Follicular Solution',
    dosageForm: 'Topical Scalp Solution (TrichoSol™)',
    volume: '100 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Minoxidil 5% + Finasteride 0.1% in TrichoSol™ 100 mL',
    apis: [
      { name: 'Minoxidil', dose: '5%' },
      { name: 'Finasteride', dose: '0.1%' }
    ],
    vehicle: { name: 'TrichoSol™ 100 mL (Patented hydrophilic vehicle for scalp retention)', volume: '100 mL' },
    directions: 'Apply 1 mL once daily at night before bedtime to scalp. Wash next day.',
    warnings: 'For topical scalp use only. Keep out of reach of children.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-GM-TRI',
    lote: '2609-GM1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_GEORGE_MILLS_518134_trichosol_100ml_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_GEORGE_MILLS_518134_trichosol_100ml_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_GEORGE_MILLS_518134_trichosol_100ml_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/RX-518134'
  },

  // ── Sara Khalid Al-Meadadi ──
  {
    id: 'sara-pentravan',
    prescriptionMatches: ['BOX03049AATEL', 'BOX03049', 'RX-TELOTEST-BOX03049AATEL'],
    patientMatches: ['sara khalid', 'al-meadadi'],
    phaseNumber: 1,
    patientName: 'Sara Khalid Al-Meadadi',
    fileNumber: 'BOX03049AATEL',
    productName: 'Cellular Longevity Transdermal Cream (Pentravan)',
    productTitle: 'Cellular Longevity Transdermal Cream (Pentravan) - 30 g',
    subTitle: 'Cellular Longevity & Mitochondrial Support (Phase 1)',
    dosageForm: 'Transdermal Cream (Pentravan®)',
    volume: '30 g',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Metformin 88 mg + Testosterone 3 mg + Astaxanthin 17 mg in Pentravan® Base 30 g',
    apis: [
      { name: 'Metformin', dose: '88 mg' },
      { name: 'Testosterone', dose: '3 mg' },
      { name: 'Astaxanthin', dose: '17 mg' }
    ],
    vehicle: { name: 'Pentravan® Liposomal Transdermal Vehicle Base', volume: '30 g' },
    directions: 'Apply 1 dose daily to clean inner thigh or forearm skin as directed.',
    warnings: 'For transdermal use only. Wash hands after application.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-SKA-PEN',
    lote: '2609-SKA1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_SARA_KHALID_AL_MEADADI_box03049_pentravan_30g_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_SARA_KHALID_AL_MEADADI_box03049_pentravan_30g_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_SARA_KHALID_AL_MEADADI_box03049_pentravan_30g_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/BOX03049AATEL'
  },
  {
    id: 'sara-capsules',
    prescriptionMatches: ['BOX03049AATEL', 'BOX03049', 'RX-TELOTEST-BOX03049AATEL'],
    patientMatches: ['sara khalid', 'al-meadadi'],
    phaseNumber: 2,
    patientName: 'Sara Khalid Al-Meadadi',
    fileNumber: 'BOX03049AATEL',
    productName: 'Mitochondrial & Telomere Oral Formula',
    productTitle: 'Mitochondrial & Telomere Oral Formula - 90 capsules',
    subTitle: 'Cellular Longevity & Telomere Support (Phase 2)',
    dosageForm: 'Oral Route (Plant-Based Capsules)',
    volume: '90 Capsules (3 Months)',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Turmeric Dry Extract 200 mg + CoQ10 45 mg + N-Acetyl-L-Cysteine 138 mg',
    apis: [
      { name: 'Turmeric Dry Extract', dose: '200 mg' },
      { name: 'Coenzyme Q10', dose: '45 mg' },
      { name: 'N-Acetyl-L-Cysteine', dose: '138 mg' }
    ],
    vehicle: { name: 'Vegetable capsules. Gluten-free, lactose-free.', volume: '90 capsules' },
    directions: 'Take 1 capsule 3 times daily with meals for 3 months.',
    warnings: 'Oral dietary supplement. Store in a cool dry place.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-SKA-CAP',
    lote: '2609-SKA2',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_SARA_KHALID_AL_MEADADI_box03049_capsules_90caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_SARA_KHALID_AL_MEADADI_box03049_capsules_90caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_SARA_KHALID_AL_MEADADI_box03049_capsules_90caps_BACK_QR.png',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/BOX03049AATEL'
  },

  // ── Tausifuzzaman Khaleequzza: BOX03535AATRI (Fagron TrichoTest™ Multi-Vehicle Protocol) ──
  {
    id: 'box03535-trichosol-part1',
    prescriptionMatches: ['BOX03535AATRI', 'BOX03535', 'RX-BOX03535AATRI', 'TRICHOTEST-03535'],
    patientMatches: ['tausifuzzaman', 'khaleequzza'],
    phaseNumber: 1,
    patientName: 'Tausifuzzaman Khaleequzza',
    fileNumber: 'BOX03535AATRI',
    productName: 'Precision Compounded Topical Solution in TrichoSol™',
    productTitle: 'Precision Compounded Topical Solution in TrichoSol™',
    subTitle: 'Phase 1: Targeted 5α-Reductase & PGD2 Follicular Therapy (100 mL)',
    dosageForm: 'Topical Scalp Solution',
    volume: '100 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Prostaquinon™ 3% (30 mg/mL) + Spironolactone 1% (10 mg/mL) + IGrantine-F1™ 0.25% (2.5 mg/mL)',
    apis: [
      { name: 'Prostaquinon™', drugName: 'Prostaquinon™', activeIngredient: 'Prostaquinon™', dose: '3% (30 mg/mL)', dosage: '3% (30 mg/mL)', strength: '3% (30 mg/mL)' },
      { name: 'Spironolactone', drugName: 'Spironolactone', activeIngredient: 'Spironolactone', dose: '1% (10 mg/mL)', dosage: '1% (10 mg/mL)', strength: '1% (10 mg/mL)' },
      { name: 'IGrantine-F1™', drugName: 'IGrantine-F1™', activeIngredient: 'IGrantine-F1™', dose: '0.25% (2.5 mg/mL)', dosage: '0.25% (2.5 mg/mL)', strength: '0.25% (2.5 mg/mL)' }
    ],
    vehicle: 'TrichoSol™ (Alcohol-Free Hydrophilic Compounding Vehicle, 100 mL)',
    directions: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
    warnings: 'For topical scalp use only. Keep out of reach of children.',
    prodDate: '16-06-2026',
    expDate: '16-06-2027',
    storage: 'Store at room temperature (15°C - 25°C)',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: '',
    batchCode: 'PHARM-2026-5AATRI',
    lote: '2606-TK1',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/BOX03535AATRI'
  },
  {
    id: 'box03535-trichooil-part2',
    prescriptionMatches: ['BOX03535AATRI', 'BOX03535', 'RX-BOX03535AATRI', 'TRICHOTEST-03535'],
    patientMatches: ['tausifuzzaman', 'khaleequzza'],
    phaseNumber: 2,
    patientName: 'Tausifuzzaman Khaleequzza',
    fileNumber: 'BOX03535AATRI',
    productName: 'Scalp Care & Hygiene Pre-Wash Nutrient in TrichoOil™',
    productTitle: 'Scalp Care & Hygiene Pre-Wash Nutrient in TrichoOil™',
    subTitle: 'Phase 2: Scalp Care & Lipid Conditioning (30 mL)',
    dosageForm: 'Topical Scalp Oil',
    volume: '30 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Vitamin E (Tocopherol) 3.5% (35 mg/mL)',
    apis: [
      { name: 'Vitamin E (Tocopherol)', drugName: 'Vitamin E (Tocopherol)', activeIngredient: 'Vitamin E (Tocopherol)', dose: '3.5% (35 mg/mL)', dosage: '3.5% (35 mg/mL)', strength: '3.5% (35 mg/mL)' }
    ],
    vehicle: 'TrichoOil™ (100% Natural Scalp Compounding Vehicle, 30 mL)',
    directions: '1-2 times / week, massage for 3-5 minutes and leave it on for 10 min before washing your hair.',
    warnings: 'For topical scalp use only. Keep out of reach of children.',
    prodDate: '16-06-2026',
    expDate: '16-06-2027',
    storage: 'Store at room temperature (15°C - 25°C)',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: '',
    batchCode: 'PHARM-2026-5AATRI',
    lote: '2606-TK2',
    targetRxUrl: 'https://www.atlashealth-services.com/rx/BOX03535AATRI'
  },

  // ── Fatima Yousef Al-mohannadi (Qatar / The Masters Medical Center Doha) ──
  {
    id: 'fatima-almohannadi-trichowash',
    prescriptionMatches: ['51890', 'RX-51890', 'BOX03088AATRI', 'BOX03088', 'RX-BOX03088AATRI', 'RX-QA-MASTERS-FATIMA', 'FATIMA-ALMOHANNADI'],
    patientMatches: ['fatima', 'yousef', 'al-mohannadi', 'mohannadi'],
    phaseNumber: 1,
    partLabel: 'Refill #1 · Scalp Hygiene & Cleansing Base (250 mL)',
    patientName: 'Fatima Yousef Al-mohannadi',
    fileNumber: 'BOX03088AATRI',
    productName: 'Shampoo TrichoWash 250ml',
    productTitle: 'Shampoo TrichoWash 250ml',
    subTitle: 'Refill #1 · Trichological Dermocompatible Scalp Wash (TrichoWash™)',
    dosageForm: 'Topical Scalp Wash / Shampoo (TrichoWash™)',
    volume: '250 mL',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    pharmacyName: 'Pharmapolis Compounding Pharmacy',
    pharmacyEmail: 'pharmapolisplovdiv@gmail.com',
    formula: 'Fagron TrichoWash™ 250 mL Sulfate-Free Dermocompatible Cleansing Base',
    vehicle: { name: 'TrichoWash™ (Sulfate-Free Dermocompatible Scalp Wash, 250 mL)', volume: '250 mL' },
    directions: 'Directions for use: Massage for 2 minutes and rinse.',
    warnings: 'For topical scalp wash only. Rinse thoroughly with water. Avoid contact with eyes.',
    prodDate: '23-07-2026',
    expDate: '23-01-2027',
    storage: 'Store at room temperature.',
    doctorName: 'Dr. Raffanie Lucenio',
    doctorLicense: 'QCHP Registered',
    clinicName: 'The Masters Medical Center (Doha, Qatar)',
    country: 'Qatar',
    countryCode: 'QA',
    countryFlag: '🇶🇦',
    batchCode: 'PHARM-2026-WASH-FATIMA',
    lote: '2607-FAT1',
    isRefill: true,
    refillNumber: 1,
    targetRxUrl: 'https://www.atlashealth-services.com/rx/BOX03088AATRI'
  },
  {
    id: 'fatima-almohannadi-capsules',
    prescriptionMatches: ['51890', 'RX-51890', 'BOX03088AATRI', 'BOX03088', 'RX-BOX03088AATRI', 'RX-QA-MASTERS-FATIMA', 'FATIMA-ALMOHANNADI'],
    patientMatches: ['fatima', 'yousef', 'al-mohannadi', 'mohannadi'],
    phaseNumber: 2,
    partLabel: 'Refill #1 · Oral Trichology Capsules (60 Caps)',
    patientName: 'Fatima Yousef Al-mohannadi',
    fileNumber: 'BOX03088AATRI',
    productName: 'Oral Trichology Maintenance Capsules',
    productTitle: 'Oral Trichology Maintenance Capsules',
    subTitle: 'Refill #1 · Oral Regimen Supplementation',
    dosageForm: 'Oral Route (Vegetable Capsules)',
    volume: '60 Capsules',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    pharmacyName: 'Pharmapolis Compounding Pharmacy',
    pharmacyEmail: 'pharmapolisplovdiv@gmail.com',
    formula: 'Clinical Trichology Synergistic Micronutrient Blend',
    directions: 'Directions: Take one capsule daily.',
    warnings: 'Keep out of reach of children. Store in a cool dry place.',
    prodDate: '23-07-2026',
    expDate: '23-07-2027',
    storage: 'Store at room temperature.',
    doctorName: 'Dr. Raffanie Lucenio',
    doctorLicense: 'QCHP Registered',
    clinicName: 'The Masters Medical Center (Doha, Qatar)',
    country: 'Qatar',
    countryCode: 'QA',
    countryFlag: '🇶🇦',
    batchCode: 'PHARM-2026-CAPS-FATIMA',
    lote: '2607-FAT2',
    isRefill: true,
    refillNumber: 1,
    targetRxUrl: 'https://www.atlashealth-services.com/rx/BOX03088AATRI'
  }
];

export const PHARMAPOLIS_LABELS_MAP = PHARMAPOLIS_LABELS_REGISTRY;

/**
 * Extracts verified, authoritative clinical parameters from a live prescription object (Firestore single source of truth).
 */
export function getAuthoritativeClinicalData(rx) {
  if (!rx) return {};

  let patientName = '';
  if (rx.patient && typeof rx.patient === 'object') {
    patientName = rx.patient.name || rx.patient.fullName || rx.patient.displayName || '';
  } else if (typeof rx.patient === 'string') {
    patientName = rx.patient;
  }
  if (!patientName) {
    patientName = rx.patientName || rx.patient_name || '';
  }

  const fileNumber = rx.fileNumber || rx.code || rx.prescriptionNumber || rx.boxId || rx.id || '51857';

  let doctorName = '';
  let doctorLicense = '';
  let clinicName = '';

  // Direct lookup from verified PHARMAPOLIS_LABELS_REGISTRY by fileNumber or prescriptionMatches
  const cleanCode = String(fileNumber || rx.code || rx.id || rx.prescriptionNumber || '').replace(/^RX-/i, '').trim().toLowerCase();
  const labelMatch = (PHARMAPOLIS_LABELS_REGISTRY || []).find(l => {
    if (!l) return false;
    const lFile = String(l.fileNumber || '').replace(/^RX-/i, '').trim().toLowerCase();
    if (lFile && (lFile === cleanCode || cleanCode.startsWith(lFile))) return true;
    if (Array.isArray(l.prescriptionMatches)) {
      if (l.prescriptionMatches.some(m => String(m).replace(/^RX-/i, '').trim().toLowerCase() === cleanCode)) return true;
    }
    return false;
  });

  if (labelMatch) {
    if (!patientName || patientName.startsWith('Patient PT-') || patientName === 'Patient') {
      patientName = labelMatch.patientName || patientName;
    }
    if (!doctorName || doctorName === 'Licensed Clinical Practice') {
      doctorName = labelMatch.doctorName || doctorName;
    }
    if (!doctorLicense || doctorLicense === 'DHA Registered') {
      doctorLicense = labelMatch.doctorLicense || doctorLicense;
    }
    if (!clinicName || clinicName === 'Licensed Clinical Practice') {
      clinicName = labelMatch.clinicName || clinicName;
    }
  }

  const rawDoctor = (rx.treatingDoctor && typeof rx.treatingDoctor === 'object' && !String(rx.treatingDoctor.name || '').includes('Miguel Ángel') ? rx.treatingDoctor : (typeof rx.treatingDoctor === 'string' && !rx.treatingDoctor.includes('Miguel Ángel') ? { name: rx.treatingDoctor } : null)) ||
    (rx.doctor && typeof rx.doctor === 'object' && !String(rx.doctor.name || '').includes('Miguel Ángel') ? rx.doctor : null) ||
    (rx.patientDoctor && !rx.patientDoctor.isInternalOnly && !String(rx.patientDoctor.name || '').includes('Miguel Ángel') ? rx.patientDoctor : null);

  if (rawDoctor) {
    doctorName = doctorName || rawDoctor.name || '';
    doctorLicense = doctorLicense || rawDoctor.license || rawDoctor.licenseNumber || '';
    clinicName = clinicName || rawDoctor.clinic || rawDoctor.clinicName || '';
  }

  if (!doctorName) {
    const candidate = rx.doctorName || rx.prescribingDoctor || rx.physician || '';
    if (!String(candidate).includes('Miguel Ángel') && !String(candidate).includes('Aranda') && candidate !== 'Licensed Clinical Practice') {
      doctorName = candidate;
    }
  }

  if (!clinicName) {
    clinicName = rx.treatingClinic?.name || rx.clinicName || (rx.clinic && !rx.clinic.includes('Mediluxe') ? rx.clinic : '') || '';
  }

  // Production doctors (Dr. Miguel Ángel López Aranda & Dra. Haydee Camacho Gamboa) are strictly internal and must NEVER appear on patient labels
  if (String(doctorName).toLowerCase().includes('miguel ángel') || 
      String(doctorName).toLowerCase().includes('miguel angel') || 
      String(doctorName).toLowerCase().includes('aranda') ||
      String(doctorName).toLowerCase().includes('camacho') ||
      String(doctorName).toLowerCase().includes('haydee')) {
    doctorName = '';
  }

  // Dr. Çağatay Sezgin for Hortman Clinics & Eldose Babu (TrichoTest official physician)
  const isSezgin = String(doctorName).toLowerCase().includes('sezgin') ||
                   String(doctorName).toLowerCase().includes('cagatay') ||
                   String(rx.id || '').toLowerCase().includes('6f8qzc') ||
                   String(rx.code || '').toUpperCase().includes('6F8QZC') ||
                   String(rx.prescriptionCode || '').toUpperCase().includes('6F8QZC') ||
                   String(rx.boxId || rx.fileNumber || rx.code || '').toUpperCase().includes('BOX03529') ||
                   String(rx.boxId || rx.fileNumber || rx.code || '').toUpperCase().includes('BOX03483') ||
                   String(patientName || '').toLowerCase().includes('julien') ||
                   String(patientName || '').toLowerCase().includes('eldose') ||
                   String(clinicName || '').toLowerCase().includes('hortman');

  if (isSezgin) {
    const isEldose = String(patientName || '').toLowerCase().includes('eldose') || String(rx.id || '').toLowerCase().includes('6f8qzc');
    doctorName = isEldose ? 'Dr. Çağatay Sezgin, MD, FISHRS' : 'Dr. Sezgin Cagatay';
    doctorLicense = isEldose ? 'DHA 00208953-005' : 'DHA-00013060-006';
    // Dr. Sezgin takes tests under his personal name only; clinicName on labels is optional and omitted by default
    clinicName = '';
  }

  const isHaytham = !isSezgin && (
                    String(doctorName).toLowerCase().includes('haytham') || 
                    String(doctorName).toLowerCase().includes('heytham') ||
                    String(rx.id || '').includes('zCXwP3MeSaid23OsGTBP') ||
                    String(rx.code || '').includes('zCXwP3MeSaid23OsGTBP'));

  if (isHaytham) {
    doctorName = 'Dr. Haytham Salem';
    doctorLicense = doctorLicense || 'DHA-P-0319842';
    clinicName = clinicName || 'Arthregen Clinic / Med Art Clinic Day Surgery Center';
  }

  // Dr. Marina Cordeiro Fernandes for NOVA Clinic & Alan Maclean Rutledge (50957) & Abdulla Alotaiba (51812)
  const isMarina = !isSezgin && !isHaytham && (
    String(doctorName).toLowerCase().includes('marina') ||
    String(doctorName).toLowerCase().includes('cordeiro') ||
    String(rx.id || '').includes('50957') ||
    String(rx.code || '').includes('50957') ||
    String(rx.prescriptionCode || '').includes('50957') ||
    String(fileNumber || '').includes('50957') ||
    String(rx.id || '').includes('51812') ||
    String(rx.code || '').includes('51812') ||
    String(rx.prescriptionCode || '').includes('51812') ||
    String(fileNumber || '').includes('51812') ||
    String(patientName || '').toLowerCase().includes('rutledge') ||
    String(patientName || '').toLowerCase().includes('alotaiba') ||
    String(patientName || '').toLowerCase().includes('abdulla') ||
    String(clinicName || '').toLowerCase().includes('nova') ||
    String(rx.clinic || rx.clinicName || '').toLowerCase().includes('nova')
  );

  if (isMarina) {
    doctorName = (doctorName && doctorName !== 'Licensed Clinical Practice') ? doctorName : 'Dr. Marina Cordeiro Fernandes';
    doctorLicense = (doctorLicense && doctorLicense !== 'DHA Registered') ? doctorLicense : 'DHA-91105367';
    clinicName = (clinicName && clinicName !== 'Licensed Clinical Practice') ? clinicName : 'NOVA Clinic · Dubai Healthcare City, Dubai, UAE';
  }

  if (!clinicName && !isSezgin) {
    clinicName = 'Licensed Clinical Practice';
  }

  if (!doctorLicense) {
    doctorLicense = rx.treatingDoctor?.license || rx.doctorLicense || (isSezgin ? 'DHA 00208953-005' : (isHaytham ? 'DHA-P-0319842' : (isMarina ? 'DHA-91105367' : 'DHA Registered')));
  }

  // QR encoded URL on bottles points directly to patient portal
  const targetRxUrl = `https://www.atlashealth-services.com/rx/${fileNumber}?view=patient`;

  return {
    patientName: patientName ? patientName.trim() : null,
    fileNumber: fileNumber ? fileNumber.trim() : null,
    doctorName: doctorName ? doctorName.trim() : null,
    doctorLicense: doctorLicense ? doctorLicense.trim() : null,
    // By default, do NOT display clinicName on printed compounding labels (only doctorName + license)
    clinicName: '',
    sourceClinicName: clinicName !== undefined && clinicName !== null ? String(clinicName).trim() : '',
    targetRxUrl
  };
}

/**
 * Helper: Identifies whether an ingredient entry represents a compounding vehicle/base rather than an active API.
 */
function isVehicleIngredient(item) {
  if (!item || typeof item !== 'object') return false;
  if (item.isVehicle || item.isVehicleOrBase || item._isVehicleOrBase || item.itemType === 'vehicle_base') {
    return true;
  }
  const n = String(item.drugName || item.drug || item.name || item.productName || item.activeIngredient || '').toLowerCase();
  const f = String(item.dosageForm || item.form || item.category || '').toLowerCase();
  return (
    f.includes('vehicle') ||
    n.includes('vehicle') ||
    n.includes('vehículo') ||
    n.includes('trichosol') ||
    n.includes('trichooil') ||
    n.includes('trichofoam') ||
    n.includes('pentravan') ||
    n.includes('pomade base') ||
    n.includes('ointment base') ||
    n.includes('capsule base')
  );
}

/**
 * Helper: Identifies placeholder strings that should never be treated as real active ingredients.
 */
function isPlaceholderIngredientName(name) {
  const n = String(name || '').trim().toLowerCase();
  return (
    !n ||
    n === 'api' ||
    n === 'active api' ||
    n === 'active ingredient' ||
    n === 'active compounded formulation' ||
    n === 'personalized compounded active formula' ||
    n === 'compounded pharmaceutical protocol'
  );
}

/**
 * Helper: Extracts and normalizes non-vehicle active pharmaceutical ingredients from any block or prescription object.
 */
function extractCleanApisFromSource(source) {
  if (!source || typeof source !== 'object') return [];
  const rawList =
    (Array.isArray(source.apis) && source.apis.length > 0 ? source.apis : null) ||
    (Array.isArray(source.items) && source.items.length > 0 ? source.items : null) ||
    (Array.isArray(source.activeIngredients) && source.activeIngredients.length > 0 ? source.activeIngredients : null) ||
    (Array.isArray(source.ingredients) && source.ingredients.length > 0 ? source.ingredients : null) ||
    (Array.isArray(source.compounds) && source.compounds.length > 0 ? source.compounds : null) ||
    (Array.isArray(source.prescriptionLines) && source.prescriptionLines.length > 0 ? source.prescriptionLines : null) ||
    [];

  const cleaned = [];
  for (const item of rawList) {
    if (!item) continue;
    if (typeof item === 'string') {
      const trimmed = item.replace(/^[•*-]\s*/, '').trim();
      if (!isPlaceholderIngredientName(trimmed) && !/trichosol|trichooil|pentravan|vehicle|vehículo/i.test(trimmed)) {
        cleaned.push({
          name: trimmed.replace(/\s*\bTM\b/g, '™'),
          drugName: trimmed.replace(/\s*\bTM\b/g, '™'),
          activeIngredient: trimmed.replace(/\s*\bTM\b/g, '™'),
          dose: '',
          dosage: '',
          strength: '',
          isVehicleOrBase: false
        });
      }
      continue;
    }

    if (isVehicleIngredient(item)) continue;

    let rawName = String(item.drugName || item.drug || item.name || item.productName || item.activeIngredient || item.api || '').trim();
    if (isPlaceholderIngredientName(rawName)) continue;

    rawName = rawName.replace(/\s*\bTM\b/g, '™');
    let rawDose = String(item.dosage || item.dose || item.strength || item.concentration || '').trim();
    if (rawDose === '—' || rawDose === '-') rawDose = '';

    cleaned.push({
      ...item,
      name: rawName,
      drugName: rawName,
      activeIngredient: item.activeIngredient ? String(item.activeIngredient).replace(/\s*\bTM\b/g, '™') : rawName,
      dose: rawDose,
      dosage: rawDose,
      strength: rawDose,
      isVehicleOrBase: false
    });
  }

  return cleaned;
}

/**
 * Helper: Extracts compounding vehicle from block/rx or infers the proper galenic vehicle from clinical cues.
 */
function extractVehicleFromSource(block, rx, volumeStr = '', dosageFormStr = '', directionsStr = '', titleStr = '') {
  const directVeh = block?.vehicle || block?.vehicleBase || block?.compoundingVehicle;
  const directVehName = typeof directVeh === 'string' ? directVeh.trim() : (directVeh?.name || directVeh?.activeIngredient || '').trim();

  const rawList = block?.items || block?.apis || block?.ingredients || block?.prescriptionLines || [];
  const vehItem = Array.isArray(rawList) ? rawList.find(it => isVehicleIngredient(it)) : null;
  const vehItemName = vehItem ? String(vehItem.name || vehItem.drugName || vehItem.activeIngredient || '').trim() : '';

  const corpus = `${directVehName} ${vehItemName} ${dosageFormStr} ${directionsStr} ${titleStr} ${rx?.dispensingForm || ''}`.toLowerCase();
  const volClean = String(volumeStr || block?.volume || rx?.volume || '').trim();

  // 1. Direct custom vehicle if explicitly provided
  if (directVehName && !/vegetable capsules/i.test(directVehName) && !/galenic compounding/i.test(directVehName)) {
    return directVehName;
  }
  if (vehItemName) {
    return vehItemName;
  }

  // 2. Specific topical bases (TrichoSol, TrichoWash, TrichoOil, Pentravan, Pomades)
  if (corpus.includes('trichosol')) {
    return `TrichoSol™ (Alcohol-Free Hydrophilic Compounding Vehicle${volClean && !volClean.toLowerCase().includes('cap') ? `, ${volClean}` : ', 100 mL'})`;
  }
  if (corpus.includes('trichooil')) {
    return `TrichoOil™ (100% Natural Scalp Compounding Vehicle${volClean && !volClean.toLowerCase().includes('cap') ? `, ${volClean}` : ', 30 mL'})`;
  }
  if (corpus.includes('trichowash')) {
    return `TrichoWash™ (Sulfate-Free Dermocompatible Scalp Wash${volClean && !volClean.toLowerCase().includes('cap') ? `, ${volClean}` : ', 250 mL'})`;
  }
  if (corpus.includes('pentravan') || corpus.includes('estradiol') || corpus.includes('testosterone') || corpus.includes('progesterone') || corpus.includes('bhrt')) {
    return 'Pentravan® Liposomal Transdermal Cream Vehicle';
  }
  if (corpus.includes('pomade') || corpus.includes('pomada') || corpus.includes('ointment') || corpus.includes('diltiazem')) {
    return 'Hypoallergenic Non-Irritating Base (Fragrance & Alcohol Free, q.s. 30 g)';
  }

  // 3. Oral capsules & ingestion (Strictly prior to generic topical cues to prevent anti-hair loss oral capsules becoming TrichoSol!)
  const isOralCue = /\b(oral|capsule|c[aá]psula|tablet|comprimido|take|swallow|ingest|tome|ingerir|with water|with food|with breakfast|with lunch|with dinner|on empty stomach)\b/i.test(corpus) ||
    /caps/i.test(volClean);
  if (isOralCue) {
    if (corpus.includes('nattokinase') || corpus.includes('serrapeptase') || corpus.includes('enteric')) {
      return 'Acid-Resistant Vegetable Enteric Capsule Base';
    }
    return 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.';
  }

  // 4. Topical solution / Scalp applications
  const isTopicalCue = /\b(scalp|shampoo|topical|apply|massage|wash|lotion|solution|drops|cream|gel|oil|serum)\b/i.test(corpus);
  if (isTopicalCue) {
    if (/\b(oil|massage|washing your hair|pre-wash)\b/i.test(corpus)) {
      return `TrichoOil™ (100% Natural Scalp Compounding Vehicle${volClean && !volClean.toLowerCase().includes('cap') ? `, ${volClean}` : ', 30 mL'})`;
    }
    return `TrichoSol™ (Alcohol-Free Hydrophilic Compounding Vehicle${volClean && !volClean.toLowerCase().includes('cap') ? `, ${volClean}` : ', 100 mL'})`;
  }

  const rxVeh = typeof rx?.vehicle === 'string' ? rx.vehicle : rx?.vehicle?.name;
  if (rxVeh) return rxVeh;

  return 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.';
}

/**
 * Finds all Pharmapolis label records associated with a given prescription object.
 * Guaranteed to return full clinical data, self-healing any stale/incomplete saved labels, and unique QR codes.
 */
export function getPharmapolisLabelsForPrescription(rx, explicitFormulations = null) {
  if (!rx) return [];

  const rxId = String(rx.id || '').trim().toUpperCase();
  const rxNum = String(rx.prescriptionNumber || '').trim().toUpperCase();
  const rxCode = String(rx.code || rx.prescriptionCode || '').trim().toUpperCase();
  const fileNum = String(rx.fileNumber || '').trim().toUpperCase();
  const boxId = String(rx.boxId || rx.fagron?.boxId || '').trim().toUpperCase();
  const rxGroupId = String(rx.rxGroupId || '').trim().toUpperCase();
  const patientName = String(rx.patient?.name || rx.patientName || '').toLowerCase();

  const auth = getAuthoritativeClinicalData(rx);

  const matches = PHARMAPOLIS_LABELS_REGISTRY.filter(item => {
    // Cross-patient safety guard: if prescription has a patient name, do not match a registry item intended for someone else
    if (patientName && item.patientName) {
      const pFirst = patientName.trim().split(/\s+/)[0]?.toLowerCase();
      const iFirst = String(item.patientName).trim().split(/\s+/)[0]?.toLowerCase();
      if (pFirst && iFirst && pFirst.length >= 3 && iFirst.length >= 3 && pFirst !== iFirst && !patientName.includes(iFirst) && !String(item.patientName).toLowerCase().includes(pFirst)) {
        return false;
      }
    }
    if (patientName && item.patientMatches && item.patientMatches.length > 0) {
      const patientMatchesThisItem = item.patientMatches.some(p => patientName.includes(p));
      if (!patientMatchesThisItem) return false;
    }

    const codeMatch = item.prescriptionMatches.some(m => {
      const mu = m.toUpperCase();
      return (
        rxId === mu ||
        rxId.includes(mu) ||
        rxNum === mu ||
        rxNum.includes(mu) ||
        rxCode === mu ||
        fileNum === mu ||
        boxId === mu ||
        rxGroupId.includes(mu)
      );
    });
    if (codeMatch) return true;

    if (patientName && item.patientMatches.some(p => patientName.includes(p))) {
      return true;
    }

    return false;
  });

  // Helper to format date cleanly as DD-MM-YYYY
  const formatIsoDate = (d, fallback = '05-10-2026') => {
    if (!d) return fallback;
    if (typeof d === 'object' && (d._seconds || d.seconds)) {
      const s = d._seconds ?? d.seconds;
      const dt = new Date(s * 1000);
      return `${String(dt.getDate()).padStart(2, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${dt.getFullYear()}`;
    }
    if (typeof d === 'string') {
      const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return `${m[3]}-${m[2]}-${m[1]}`;
      const dClean = d.replace(/T.*$/, '');
      if (dClean.includes('/')) return dClean.replace(/\//g, '-');
      return dClean;
    }
    return fallback;
  };

  const rxGeneticOrPrescriptionDate = rx.fagron?.reportDate || 
                                     rx.fagronDetails?.reportDate || 
                                     rx.geneticResultDate || 
                                     rx.reportDate || 
                                     rx.prescriptionDate || 
                                     rx.mfgDate || 
                                     rx.prodDate || 
                                     rx.dateIssued || 
                                     rx.issuedDate || 
                                     rx.date;
  const rxProdDate = formatIsoDate(rxGeneticOrPrescriptionDate, '05-10-2026');

  // Compute 1-year default expiry if not explicitly set
  const computeDefaultExpiry = (prodDateStr) => {
    if (!prodDateStr) return '04-10-2027';
    const m = prodDateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m) {
      const day = m[1];
      const month = m[2];
      const year = parseInt(m[3], 10) + 1;
      return `${day}-${month}-${year}`;
    }
    return '04-10-2027';
  };

  const rxExpDate = formatIsoDate(rx.expDate || rx.expiryDate, computeDefaultExpiry(rxProdDate));

  // Build authoritative derived labels first (used directly or to self-heal incomplete saved pharmacyLabels)
  let derivedLabels = [];

  if (explicitFormulations && Array.isArray(explicitFormulations) && explicitFormulations.length >= 1) {
    derivedLabels = explicitFormulations.map((form, fIdx) => {
      const phaseNum = form.index || (fIdx + 1);
      const partCode = form.extra?.partCode ? String(form.extra.partCode).toUpperCase() : null;

      const regMatch = matches.find(m => 
        partCode && m.prescriptionMatches.some(pm => pm.toUpperCase() === partCode)
      ) || matches.find(m => 
        m.phaseNumber === phaseNum
      ) || matches.find(m => {
        if (!form.apis || !Array.isArray(form.apis) || !m.apis || !Array.isArray(m.apis)) return false;
        return m.apis.some(ma => {
          const maName = (ma.name || ma.activeIngredient || '').toLowerCase().trim();
          return form.apis.some(fa => {
            const faName = (fa.name || fa.activeIngredient || '').toLowerCase().trim();
            if (!maName || !faName) return false;
            if (maName === faName) return true;
            const cleanM = maName.replace(/\(.*?\)/g, '').trim();
            const cleanF = faName.replace(/\(.*?\)/g, '').trim();
            if (cleanM === cleanF) return true;
            return cleanM.startsWith(cleanF) || cleanF.startsWith(cleanM);
          });
        });
      }) || matches.find(m => 
        m.productName && form.title && m.productName.toLowerCase().includes(form.title.toLowerCase().slice(0, 10))
      );

      const cleanFormApis = extractCleanApisFromSource(form);
      let formulaText = form.formula || '';
      if (!formulaText && cleanFormApis.length > 0) {
        formulaText = cleanFormApis
          .map(a => `${a.name || a.activeIngredient || ''} ${a.dosage || a.dose || ''}`.trim())
          .filter(Boolean)
          .join(' + ');
      }

      if (regMatch) {
        return {
          ...regMatch,
          phaseNumber: phaseNum,
          patientName: auth.patientName || regMatch.patientName,
          doctorName: (auth.doctorName && !auth.doctorName.toLowerCase().includes('miguel')) ? auth.doctorName : regMatch.doctorName,
          doctorLicense: auth.doctorLicense || regMatch.doctorLicense,
          clinicName: '',
          showClinicOnLabel: false,
          fileNumber: auth.fileNumber || regMatch.fileNumber,
          targetRxUrl: auth.targetRxUrl || regMatch.targetRxUrl,
          apis: cleanFormApis.length > 0 ? cleanFormApis : (regMatch.apis || extractCleanApisFromSource(rx)),
          formula: formulaText || regMatch.formula || '',
          vehicle: regMatch.vehicle || form?.vehicle || null,
          prodDate: rxProdDate || regMatch.prodDate,
          expDate: rxExpDate || regMatch.expDate
        };
      }

      const pName = form.title || form.treatmentTitle || form.productName || form.name || rx.formulaName || `Phase ${phaseNum} Compounded Protocol`;
      const pForm = form.route || form.dosageForm || (form.volume?.includes('Cap') ? 'Oral Route (Plant-Based Capsules)' : (form.volume?.includes('g') ? 'Topical Pomade / Ointment' : 'Topical Solution'));
      const pVol = form.volume || (form.volume?.includes('g') ? '30 g' : '100 mL');

      const directionsText = form.posology?.regimen || form.instructions || form.directions || (form.posology?.steps ? form.posology.steps.map(s => s.text || s).join(' ') : (rx.posology?.notes || 'Take / apply as directed by prescribing physician.'));
      const warningsText = form.warnings || rx.posology?.notes || 'For patient use as prescribed. Keep out of reach of children.';
      const resolvedVehicle = extractVehicleFromSource(form, rx, pVol, pForm, directionsText, pName);

      return {
        id: `${rx.id || 'rx'}-phase-${phaseNum}`,
        phaseNumber: phaseNum,
        patientName: auth.patientName || 'Patient Record',
        fileNumber: auth.fileNumber || '51857',
        productName: pName,
        productTitle: pName,
        subTitle: form.subtitle || `Phase ${phaseNum}: Clinical Protocol Administration`,
        dosageForm: pForm,
        volume: pVol,
        dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
        pharmacy: 'Pharmapolis Compounding Pharmacy',
        formula: formulaText,
        apis: cleanFormApis.length > 0 ? cleanFormApis : extractCleanApisFromSource(rx),
        vehicle: resolvedVehicle,
        directions: directionsText,
        warnings: warningsText,
        prodDate: rxProdDate,
        expDate: rxExpDate,
        storage: form.storage || rx.storage || 'Store at room temperature',
        doctorName: auth.doctorName || 'Dr. Marina Cordeiro Fernandes',
        doctorLicense: auth.doctorLicense || 'DHA Registered',
        clinicName: '',
        showClinicOnLabel: false,
        batchCode: `PHARM-2026-${String(auth.fileNumber || 'B948').slice(-6).toUpperCase()}`,
        lote: `2609-P${String(phaseNum)}`,
        targetRxUrl: auth.targetRxUrl
      };
    });
  } else if (matches.length > 0) {
    derivedLabels = matches.map(m => ({
      ...m,
      patientName: auth.patientName || m.patientName,
      doctorName: auth.doctorName || m.doctorName,
      doctorLicense: auth.doctorLicense || m.doctorLicense,
      clinicName: '',
      showClinicOnLabel: false,
      fileNumber: auth.fileNumber || m.fileNumber,
      targetRxUrl: auth.targetRxUrl || m.targetRxUrl,
      pharmacy: rx.pharmacyName || rx.pharmacy || rx.dispensingPharmacy || m.pharmacy || 'Pharmapolis Compounding Pharmacy',
      pharmacyName: rx.pharmacyName || rx.pharmacy || rx.dispensingPharmacy || m.pharmacyName || m.pharmacy || 'Pharmapolis Compounding Pharmacy',
      pharmacyAddress: rx.pharmacyAddress || rx.dispensingPharmacyAddress || m.pharmacyAddress || '1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria',
      expDate: rx.expDate || rx.expiryDate || m.expDate || rxExpDate,
      labelMarkdown: rx.labelMarkdown || m.labelMarkdown || null,
      apis: m.apis || extractCleanApisFromSource(rx),
      formula: m.formula || ''
    }));
  } else {
    // Fallback: dynamically construct label items from multi-part blocks (parts, formulationBlocks, phases, formulations)
    // IMPORTANT: Never treat rx.items / rx.prescriptionLines directly as separate bottles unless grouped by formulationIndex!
    let rawBlocks = null;
    if (Array.isArray(rx.parts) && rx.parts.length > 0) {
      rawBlocks = rx.parts;
    } else if (Array.isArray(rx.formulationBlocks) && rx.formulationBlocks.length > 0) {
      rawBlocks = rx.formulationBlocks;
    } else if (Array.isArray(rx.phases) && rx.phases.length > 0) {
      rawBlocks = rx.phases;
    } else if (Array.isArray(rx.treatmentPhases) && rx.treatmentPhases.length > 0) {
      rawBlocks = rx.treatmentPhases;
    } else if (Array.isArray(rx.formulations) && rx.formulations.length > 0) {
      rawBlocks = rx.formulations;
    } else if (Array.isArray(rx.compoundedProducts) && rx.compoundedProducts.length > 0) {
      rawBlocks = rx.compoundedProducts;
    } else {
      const flatLines = rx.items || rx.prescriptionLines || rx.compounds || rx.products || [];
      if (Array.isArray(flatLines) && flatLines.length > 0) {
        const distinctBlockIndices = Array.from(new Set(flatLines.map(l => l?.formulationIndex || l?.phaseNumber).filter(Boolean)));
        if (distinctBlockIndices.length > 1) {
          rawBlocks = distinctBlockIndices.map((bIdx, i) => {
            const groupLines = flatLines.filter(l => (l?.formulationIndex || l?.phaseNumber) === bIdx);
            const firstLine = groupLines[0] || {};
            return {
              phaseNumber: i + 1,
              title: firstLine.formulationBlock || `Phase ${i + 1} Compounded Protocol`,
              dispensingForm: firstLine.dosageForm || rx.dispensingForm,
              volume: firstLine.blockVolume || firstLine.presentation || rx.volume,
              posology: firstLine.patientInstructions || firstLine.instructions,
              items: groupLines
            };
          });
        } else {
          rawBlocks = [rx];
        }
      } else {
        rawBlocks = [rx];
      }
    }

    derivedLabels = rawBlocks.map((p, idx) => {
      const phaseNum = p.phaseNumber || p.index || (idx + 1);
      let blockApis = extractCleanApisFromSource(p);
      if (blockApis.length === 0 && rawBlocks.length === 1) {
        blockApis = extractCleanApisFromSource(rx);
      } else if (blockApis.length === 0 && Array.isArray(rx.items)) {
        const filteredByPhase = rx.items.filter(it => (it.formulationIndex || it.phaseNumber) === phaseNum);
        blockApis = extractCleanApisFromSource({ items: filteredByPhase });
      }

      // Directions text
      const rawPos = p.instructions || p.directions || p.sig || (typeof p.posology === 'string' ? p.posology : (p.posology?.summary || p.posology?.instructions || p.posology?.regimen)) || p.regimen || (Array.isArray(rx.posology?.steps) ? rx.posology.steps[idx] : null) || (typeof rx.posology === 'string' ? rx.posology : (rx.posology?.summary || rx.posology?.instructions || rx.posology?.regimen)) || rx.instructions || 'Take / apply as directed by prescribing physician.';
      const directionsText = String(rawPos).replace(/^phase\s*\d+\s*:\s*/i, '').trim();

      // Product Title
      const pName = p.productTitle || p.productName || p.title || p.phaseTitle || p.treatmentType || p.phaseName || (rawBlocks.length === 1 ? (rx.treatmentType || rx.title || rx.medicationName) : null) || `Phase ${phaseNum} Compounded Protocol`;

      // Route & Volume Detection (Strict hierarchy: Hormone/Transdermal vs Pomade vs Oral vs Topical)
      const blockSpecificText = `${pName} ${p.dispensingForm || ''} ${p.dosageForm || ''} ${p.vehicle?.name || p.vehicle || ''} ${directionsText}`.toLowerCase();
      const globalText = `${blockSpecificText} ${rawBlocks.length === 1 ? `${rx.dispensingForm || ''} ${rx.treatmentType || ''}` : ''}`.toLowerCase();

      const isHormoneCue = /\b(estradiol|testosterone|progesterone|bhrt|transdermal|pentravan)\b/i.test(globalText);
      const isPomadeCue = !isHormoneCue && /\b(pomade|pomada|ointment|ung[uü]ento|diltiazem)\b/i.test(globalText);
      const isOralCue = !isHormoneCue && !isPomadeCue && (
        /\b(oral|capsule|c[aá]psula|comprimido|tablet|swallow|ingest|tome|ingerir|with water|with food|with breakfast|with lunch|with dinner|on empty stomach)\b/i.test(globalText) ||
        /\btake\s+\d+\s*(?:cap|c[aá]psula|pill|tablet|dose)/i.test(globalText)
      );
      const isTopicalCue = !isHormoneCue && !isPomadeCue && !isOralCue && /\b(scalp|shampoo|topical|apply|massage|wash|lotion|solution|drops|gel|oil|trichosol|trichooil|trichowash)\b/i.test(globalText);
      const isScalpWash = isTopicalCue && (
        /\b(shampoo|cleanser|cleansing|trichowash)\b/i.test(`${pName} ${p.dosageForm || ''}`) ||
        (/\bwash\b/i.test(`${pName} ${p.dosageForm || ''}`) && !/leave.*wash/i.test(directionsText)) ||
        /\b(?:massage\s+for\s+\d+\s*min.*rinse|rinse\s+thoroughly)\b/i.test(directionsText)
      );

      const explicitVol = p.volume || p.netContent || p.size || p.packaging?.volume || p.vehicle?.volume || (rawBlocks.length === 1 ? rx.volume : null);
      let pVol = explicitVol ? String(explicitVol).trim() : null;
      if (!pVol) {
        if (p.quantity || p.count) {
          pVol = `${p.quantity || p.count} ${isOralCue ? 'Capsules' : (isPomadeCue ? 'g' : 'mL')}`;
        } else if (isOralCue) {
          pVol = rx.duration?.includes('90') || rx.duration?.includes('3') ? '90 Capsules (3 Months)' : '60 Capsules (2 Months)';
        } else if (isHormoneCue) {
          pVol = '90 mL (3 Months)';
        } else if (isPomadeCue) {
          pVol = '30 g';
        } else if (isScalpWash) {
          pVol = '250 mL';
        } else if (isTopicalCue) {
          const isOil = /\boil\b/i.test(blockSpecificText) || (/\b(massage|washing your hair)\b/i.test(blockSpecificText) && !blockSpecificText.includes('rinse'));
          pVol = isOil ? '30 mL' : (blockSpecificText.includes('wash') || blockSpecificText.includes('250') ? '250 mL' : '100 mL');
        } else {
          pVol = '90 Capsules (3 Months)';
        }
      }

      // Dosage Form
      let pForm = p.dosageForm || p.dispensingForm || p.format || p.presentation || p.form || p.route;
      if (!pForm || (pForm === 'Topical Scalp Solution' && isOralCue)) {
        if (isOralCue) pForm = rx.dispensingForm || 'Oral Route (Plant-Based Capsules)';
        else if (isHormoneCue) pForm = 'Topical Transdermal Cream (Pentravan®)';
        else if (isPomadeCue) pForm = 'Topical Compounded Pomade / Ointment';
        else if (isTopicalCue) pForm = /\boil\b/i.test(blockSpecificText) ? 'Topical Scalp Oil' : (isScalpWash ? 'Topical Scalp Wash / Shampoo (TrichoWash™)' : 'Topical Scalp Solution (TrichoSol™)');
        else pForm = rx.dispensingForm || 'Compounded Pharmaceutical Protocol';
      }

      // Formula text
      let formulaText = p.formula || p.composition || '';
      if (!formulaText && blockApis.length > 0) {
        formulaText = blockApis
          .map(a => `${a.name || a.drugName || a.activeIngredient || ''} ${a.dosage || a.dose || a.strength || ''}`.trim())
          .filter(Boolean)
          .join(' + ');
      }

      const resolvedVehicle = extractVehicleFromSource(p, rx, pVol, pForm, directionsText, pName);
      
      let warningsText = p.warnings || p.cautions || (rawBlocks.length === 1 ? rx.warnings : null);
      if (!warningsText) {
        if (isOralCue) {
          warningsText = 'Take with water. Store in a cool, dry place. Keep out of reach of children.';
        } else if (isHormoneCue) {
          warningsText = 'For transdermal / topical use only. Wash hands after application. Keep out of reach of children.';
        } else if (isPomadeCue) {
          warningsText = 'For topical / perianal use only. Keep out of reach of children.';
        } else if (isScalpWash) {
          warningsText = 'For topical scalp wash only. Rinse thoroughly with water. Avoid contact with eyes.';
        } else if (isTopicalCue) {
          warningsText = 'For topical scalp use only. Keep out of reach of children.';
        } else {
          warningsText = 'For patient use as prescribed. Keep out of reach of children.';
        }
      }
      const activeIngredientsList = blockApis.map(a => `${a.name || a.drugName || a.activeIngredient || 'API'} ${a.dose || a.dosage || a.strength || ''}`.trim());

      return {
        id: `${rx.id || 'rx'}-label-${idx}`,
        phaseNumber: phaseNum,
        patientName: auth.patientName || 'Patient Record',
        fileNumber: auth.fileNumber || '51857',
        rxCode: rx.code || rx.prescriptionNumber || rx.id || auth.fileNumber,
        productName: pName,
        productTitle: pName,
        subTitle: p.subTitle || `Phase ${phaseNum}: Clinical Protocol Administration`,
        dosageForm: pForm,
        volume: pVol,
        dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
        pharmacy: 'Pharmapolis Compounding Pharmacy',
        pharmacyName: 'Pharmapolis Compounding Pharmacy',
        pharmacyAddress: rx.pharmacyAddress || rx.dispensingPharmacyAddress || '1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria',
        formula: formulaText,
        apis: blockApis,
        activeIngredientsList,
        vehicle: resolvedVehicle,
        directions: directionsText,
        warnings: warningsText,
        prodDate: rxProdDate,
        expDate: rx.expDate || rx.expiryDate || rxExpDate,
        labelMarkdown: rx.labelMarkdown || p.labelMarkdown || null,
        storage: p.storage || rx.storage || 'Store at room temperature (15°C - 25°C)',
        doctorName: auth.doctorName || 'Dr. Marina Cordeiro Fernandes',
        doctorLicense: auth.doctorLicense || 'DHA Registered',
        clinicName: '',
        showClinicOnLabel: false,
        batchCode: `PHARM-2026-${String(auth.fileNumber || 'B948').slice(-6).toUpperCase()}`,
        lote: `2609-P${String(idx + 1)}`,
        targetRxUrl: auth.targetRxUrl
      };
    });
  }

  // ⚡ Priority 0 (Self-Healing): Authoritative saved Firestore pharmacyLabels merged with derived clinical data
  if (Array.isArray(rx.pharmacyLabels) && rx.pharmacyLabels.length > 0) {
    const fallbackUrl = `https://www.atlashealth-services.com/rx/${encodeURIComponent(rx.prescriptionNumber || rx.code || rx.id || 'RX')}`;

    return rx.pharmacyLabels.map((lbl, idx) => {
      const derived = derivedLabels[idx] || derivedLabels[0] || {};
      const phaseNum = lbl.phaseNumber || derived.phaseNumber || (idx + 1);

      // 1. Self-heal Active Ingredients (apis & formula) if saved label had empty or placeholder ingredients
      const savedCleanApis = extractCleanApisFromSource(lbl);
      const derivedCleanApis = extractCleanApisFromSource(derived);
      const hasValidSavedApis = savedCleanApis.length > 0;
      const effectiveApis = hasValidSavedApis ? savedCleanApis : derivedCleanApis;

      const activeIngredientsList = effectiveApis.length > 0
        ? effectiveApis.map(a => `${a.name || a.drugName || a.activeIngredient || 'API'} ${a.dose || a.dosage || a.strength || ''}`.trim())
        : (Array.isArray(lbl.activeIngredientsList) && lbl.activeIngredientsList.filter(x => !isPlaceholderIngredientName(x)).length > 0
            ? lbl.activeIngredientsList.filter(x => !isPlaceholderIngredientName(x))
            : (derived.activeIngredientsList || []));

      const effectiveFormula = (lbl.formula && !isPlaceholderIngredientName(lbl.formula))
        ? lbl.formula
        : (derived.formula || activeIngredientsList.join(' + '));

      // 2. Detect if this formulation is actually Topical / Scalp / Non-Oral
      const effectiveDirections = lbl.directions || lbl.instructions || derived.directions || '';
      const isDerivedTopical = /\b(scalp|hair|shampoo|topical|apply|massage|wash|lotion|solution|drops|cream|gel|oil|pomade|ointment|trichosol|trichooil|pentravan)\b/i.test(
        `${derived.productTitle || ''} ${derived.dosageForm || ''} ${derived.vehicle?.name || derived.vehicle || ''} ${effectiveDirections}`
      );

      // 3. Self-heal Product Title if saved title is generic "Phase X Compounded Protocol"
      const isGenericSavedTitle = !lbl.productTitle || /^phase\s*\d+\s*compounded\s*protocol$/i.test(String(lbl.productTitle).trim()) || String(lbl.productTitle).trim().toLowerCase() === 'compounded pharmaceutical protocol';
      const effectiveTitle = (!isGenericSavedTitle ? lbl.productTitle : (derived.productTitle || lbl.productTitle || lbl.productName)) || 'Compounded Pharmaceutical Protocol';

      // 4. Self-heal Volume if saved volume was corrupted by the old "90 Capsules (3 Months)" bug on a topical product
      const isCorruptedCapsuleVol = isDerivedTopical && /capsules/i.test(String(lbl.volume || ''));
      const effectiveVolume = (!isCorruptedCapsuleVol && (lbl.volume || lbl.netContent || lbl.size))
        ? (lbl.volume || lbl.netContent || lbl.size)
        : (derived.volume || rx.volume || '100 mL');

      // 5. Self-heal Dosage Form if saved dosageForm was defaulted to "Oral Route (Plant-Based Capsules)" on a topical product
      const isCorruptedOralForm = isDerivedTopical && /oral|capsule/i.test(String(lbl.dosageForm || ''));
      const effectiveDosageForm = (!isCorruptedOralForm && lbl.dosageForm)
        ? lbl.dosageForm
        : (derived.dosageForm || lbl.dosageForm || 'Topical Scalp Solution');

      // 6. Self-heal Vehicle if saved vehicle is missing or defaulted to "Vegetable capsules..." on a topical product
      const rawSavedVeh = typeof lbl.vehicle === 'string' ? lbl.vehicle : (lbl.vehicle?.name || lbl.compoundingVehicle || '');
      const isCorruptedCapsuleVeh = isDerivedTopical && (!rawSavedVeh || /vegetable capsules/i.test(rawSavedVeh));
      const effectiveVehicle = (!isCorruptedCapsuleVeh && rawSavedVeh)
        ? rawSavedVeh
        : (derived.vehicle || extractVehicleFromSource(derived, rx, effectiveVolume, effectiveDosageForm, effectiveDirections, effectiveTitle));

      // 7. Clean Doctor License (prevent duplicate "License: License: ...")
      const rawLicense = lbl.doctorLicense || auth.doctorLicense || rx.doctorLicense || derived.doctorLicense || 'DHA-91105367';
      const cleanLicense = String(rawLicense).replace(/^license\s*:\s*/i, '').trim();

      // 8. If core clinical fields were self-healed, clear stale labelMarkdown so editor regenerates it cleanly
      const wasHealed = !hasValidSavedApis || isCorruptedCapsuleVol || isCorruptedOralForm || isCorruptedCapsuleVeh || isGenericSavedTitle;
      const effectiveMarkdown = wasHealed ? null : (lbl.labelMarkdown || rx.labelMarkdown || null);

      return {
        ...derived,
        ...lbl,
        id: lbl.id || derived.id || `pharm-label-${idx + 1}`,
        phaseNumber: phaseNum,
        patientName: (lbl.patientName || rx.patientName || rx.patient?.name || auth.patientName || 'PATIENT RECORD').toUpperCase(),
        fileNumber: lbl.fileNumber || rx.fileNumber || rx.code || rx.prescriptionNumber || rx.id || '51857',
        rxCode: lbl.rxCode || rx.code || rx.prescriptionNumber || rx.id,
        doctorName: lbl.doctorName !== undefined && lbl.doctorName !== null ? lbl.doctorName : (auth.doctorName || rx.doctorName || derived.doctorName || 'Dr. Marina Cordeiro Fernandes'),
        clinicName: lbl.showClinicOnLabel === true ? String(lbl.clinicName || '').trim() : '',
        showClinicOnLabel: lbl.showClinicOnLabel === true,
        doctorLicense: cleanLicense,
        batchCode: lbl.batchCode || rx.batchCode || rx.dispensingBatch || derived.batchCode || 'PHARM-2026-B948',
        lote: lbl.lote || rx.lote || derived.lote || '2609-PLV',
        volume: effectiveVolume,
        dosageForm: effectiveDosageForm,
        productTitle: effectiveTitle,
        productName: effectiveTitle,
        vehicle: effectiveVehicle,
        formula: effectiveFormula,
        apis: effectiveApis,
        activeIngredientsList,
        directions: effectiveDirections,
        prodDate: formatIsoDate(
          lbl.prodDate || 
          lbl.mfgDate || 
          rx.fagron?.reportDate || 
          rx.fagronDetails?.reportDate || 
          rx.geneticResultDate || 
          rx.reportDate || 
          rx.prescriptionDate || 
          rx.mfgDate || 
          rx.prodDate || 
          rx.dateIssued || 
          rx.issuedDate || 
          rx.date, 
          '05-10-2026'
        ),
        expDate: formatIsoDate(lbl.expDate || rx.expDate || rx.expiryDate || derived.expDate, '04-10-2027'),
        storage: lbl.storage || rx.storage || derived.storage || 'Store at room temperature (15°C - 25°C)',
        warnings: lbl.warnings || rx.warnings || derived.warnings || 'For external / patient use only. Keep out of reach of children.',
        labelMarkdown: effectiveMarkdown,
        targetRxUrl: lbl.targetRxUrl || derived.targetRxUrl || fallbackUrl
      };
    });
  }

  return derivedLabels;
}

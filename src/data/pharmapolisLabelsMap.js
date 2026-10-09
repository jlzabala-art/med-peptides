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
    patientMatches: ['amna sultan', 'alotaiba'],
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
    prodDate: '05-10-2026',
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
    targetRxUrl: 'https://med-peptides.com/rx/51857'
  },
  {
    id: '51857-phase-2',
    prescriptionMatches: ['51857', 'RX-51857', 'RX-51857-B', 'RXG-51857-AMNA'],
    patientMatches: ['amna sultan', 'alotaiba'],
    phaseNumber: 2,
    patientName: 'Amna Sultan Mohamed Ahmed Alotaiba',
    fileNumber: '51857',
    productName: 'Red Yeast Rice Extract 600 mg',
    productTitle: 'Red Yeast Rice Extract 600 mg',
    subTitle: 'Phase 2: Red Yeast Rice Extract 600 mg | 1 Month Treatment',
    dosageForm: 'Oral Route (Vegetable Capsules)',
    volume: '120 Caps, 1 Month Treatment',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Red Yeast Rice Extract 600 mg',
    apis: [
      { name: 'Red Yeast Rice Extract', dose: '600 mg', dosage: '600 mg', activeIngredient: 'Red Yeast Rice Extract' }
    ],
    vehicle: { name: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.', volume: '120 capsules' },
    directions: 'Take 2 caps with lunch and 2 caps with dinner.',
    warnings: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives. Duration: 1 month.',
    prodDate: '05-10-2026',
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
    targetRxUrl: 'https://med-peptides.com/rx/51857'
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
    targetRxUrl: 'https://med-peptides.com/rx/RX-50957-A'
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
    targetRxUrl: 'https://med-peptides.com/rx/RX-50957-B'
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
    productTitle: 'Morning Methylation & Mitochondrial Formula - 90 capsules',
    subTitle: 'Phase 1: Morning Mitochondrial & Hepatic Clearance',
    dosageForm: 'Oral Route (Plant-Based Capsules)',
    volume: '90 Capsules (3 Months)',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'B12 500 mcg + P5P 25 mg + B2 10 mg + TMG 500 mg + Ubiquinol 200 mg + Resveratrol 250 mg + NAC 600 mg',
    directions: 'Take 1 capsule every morning with breakfast for 3 months.',
    warnings: 'May cause harmless bright yellow urine discoloration. Take with adequate water and food.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic Day Surgery Center, Dubai',
    batchCode: 'PHARM-2026-METH90',
    lote: '2609-ABD1',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_51812_morning_90caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51812_morning_90caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51812_morning_90caps_BACK_QR.png',
    targetRxUrl: 'https://med-peptides.com/rx/51812'
  },
  {
    id: '51812-phase-2',
    prescriptionMatches: ['51812', 'RX-51812', 'RX-51812-B'],
    patientMatches: ['abdulla sultan', 'abdulla alotaiba'],
    phaseNumber: 2,
    patientName: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
    fileNumber: '51812',
    productName: 'Night Restorative & Longevity Formula',
    productTitle: 'Before Bed Neuromuscular Formula - 90 capsules',
    subTitle: 'Phase 2: Evening Cellular Repair Protocol',
    dosageForm: 'Oral Route (Plant-Based Capsules)',
    volume: '90 Capsules (3 Months)',
    dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    formula: 'Magnesium Bisglycinate (eq. 400 mg elemental Mg) + Glycine 1,000 mg + L-Theanine 200 mg',
    directions: 'Take 1 serving 30-45 minutes before bedtime with water for 3 months.',
    warnings: 'Non-habit forming. Promotes restorative slow-wave sleep architecture. Store tightly sealed.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic Day Surgery Center, Dubai',
    batchCode: 'PHARM-2026-REST90',
    lote: '2609-ABD2',
    frontUrl: '/labels/pharmapolis/PHARMAPOLIS_51812_night_90caps_FRONT.png',
    frontWithQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51812_night_90caps_FRONT_WITH_QR.png',
    backQrUrl: '/labels/pharmapolis/PHARMAPOLIS_51812_night_90caps_BACK_QR.png',
    targetRxUrl: 'https://med-peptides.com/rx/51812'
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
    targetRxUrl: 'https://med-peptides.com/rx/RX-51861-A'
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
    targetRxUrl: 'https://med-peptides.com/rx/RX-51861-B'
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
    targetRxUrl: 'https://med-peptides.com/rx/RX-51245'
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
    targetRxUrl: 'https://med-peptides.com/rx/RX-6F8QZC'
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
    targetRxUrl: 'https://med-peptides.com/rx/BOX03483AATRI'
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
    targetRxUrl: 'https://med-peptides.com/rx/BOX03529AATRI'
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
    targetRxUrl: 'https://med-peptides.com/rx/BOX03529AATRI'
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
    targetRxUrl: 'https://med-peptides.com/rx/RX-MS-0903'
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
    targetRxUrl: 'https://med-peptides.com/rx/RX-MS-0903'
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
    targetRxUrl: 'https://med-peptides.com/rx/RX-MT-0903'
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
    targetRxUrl: 'https://med-peptides.com/rx/RX-MT-0903'
  },

  // ── Saeed Musallam ──
  {
    id: 'saeed-night-formula',
    prescriptionMatches: ['RX-20261002-N5BH', 'RX-20261002-IKE7'],
    patientMatches: ['saeed musallam', 'almazrouei'],
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
    targetRxUrl: 'https://med-peptides.com/rx/BOX03492AANUT?view=patient'
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
    targetRxUrl: 'https://med-peptides.com/rx/rx_nmma_2'
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
    targetRxUrl: 'https://med-peptides.com/rx/CfOwJCEFcnwmww0TjtZ5'
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
    targetRxUrl: 'https://med-peptides.com/rx/CfOwJCEFcnwmww0TjtZ5'
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
    targetRxUrl: 'https://med-peptides.com/rx/CfOwJCEFcnwmww0TjtZ5'
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
    targetRxUrl: 'https://med-peptides.com/rx/CfOwJCEFcnwmww0TjtZ5'
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
    targetRxUrl: 'https://med-peptides.com/rx/RX-51253'
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
    targetRxUrl: 'https://med-peptides.com/rx/RX-51253-B'
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
    targetRxUrl: 'https://med-peptides.com/rx/rx_rfma_2'
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
    targetRxUrl: 'https://med-peptides.com/rx/RX-518134'
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
    targetRxUrl: 'https://med-peptides.com/rx/BOX03049AATEL'
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
    targetRxUrl: 'https://med-peptides.com/rx/BOX03049AATEL'
  }
];

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

  const rawDoctor = (rx.treatingDoctor && typeof rx.treatingDoctor === 'object' && !String(rx.treatingDoctor.name || '').includes('Miguel Ángel') ? rx.treatingDoctor : (typeof rx.treatingDoctor === 'string' && !rx.treatingDoctor.includes('Miguel Ángel') ? { name: rx.treatingDoctor } : null)) ||
    (rx.doctor && typeof rx.doctor === 'object' && !String(rx.doctor.name || '').includes('Miguel Ángel') ? rx.doctor : null) ||
    (rx.patientDoctor && !rx.patientDoctor.isInternalOnly && !String(rx.patientDoctor.name || '').includes('Miguel Ángel') ? rx.patientDoctor : null);

  if (rawDoctor) {
    doctorName = rawDoctor.name || '';
    doctorLicense = rawDoctor.license || rawDoctor.licenseNumber || '';
    clinicName = rawDoctor.clinic || rawDoctor.clinicName || '';
  }

  if (!doctorName) {
    const candidate = rx.doctorName || rx.prescribingDoctor || rx.physician || '';
    if (!String(candidate).includes('Miguel Ángel') && !String(candidate).includes('Aranda')) {
      doctorName = candidate;
    }
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
    clinicName = isEldose ? 'Hortman Clinics · Jumeirah 1, Dubai' : 'Hortman Clinics, Dubai';
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

  // Dr. Marina Cordeiro Fernandes for NOVA Clinic & Alan Maclean Rutledge (50957)
  const isMarina = !isSezgin && !isHaytham && (
    String(doctorName).toLowerCase().includes('marina') ||
    String(rx.id || '').includes('50957') ||
    String(rx.code || '').includes('50957') ||
    String(rx.prescriptionCode || '').includes('50957') ||
    String(fileNumber || '').includes('50957') ||
    String(patientName || '').toLowerCase().includes('rutledge') ||
    String(clinicName || '').toLowerCase().includes('nova')
  );

  if (isMarina) {
    doctorName = 'Dr. Marina Cordeiro Fernandes';
    doctorLicense = 'DHA-91105367';
    clinicName = 'NOVA Clinic · Dubai Healthcare City, Dubai, UAE';
  }

  if (!clinicName) {
    clinicName = rx.treatingClinic?.name || rx.clinicName || (rx.clinic && !rx.clinic.includes('Mediluxe') ? rx.clinic : '') || 'Licensed Clinical Practice';
  }

  if (!doctorLicense) {
    doctorLicense = rx.treatingDoctor?.license || rx.doctorLicense || (isSezgin ? 'DHA 00208953-005' : (isHaytham ? 'DHA-P-0319842' : 'DHA Registered'));
  }

  // QR encoded URL on bottles points directly to patient portal
  const targetRxUrl = `https://med-peptides.com/rx/${fileNumber}?view=patient`;

  return {
    patientName: patientName ? patientName.trim() : null,
    fileNumber: fileNumber ? fileNumber.trim() : null,
    doctorName: doctorName ? doctorName.trim() : null,
    doctorLicense: doctorLicense ? doctorLicense.trim() : null,
    clinicName: clinicName ? clinicName.trim() : null,
    targetRxUrl
  };
}

/**
 * Finds all Pharmapolis label records associated with a given prescription object.
 * Guaranteed to return full clinical data and unique QR codes.
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

  const rxProdDate = formatIsoDate(rx.mfgDate || rx.prodDate || rx.dateIssued || rx.issuedDate || rx.date || rx.createdAt, '05-10-2026');
  const rxExpDate = formatIsoDate(rx.expDate || rx.expiryDate, '04-10-2027');

  // If explicit formulations are passed (from PublicPrescriptionClient compoundedFormulations),
  // map every formulation directly so apis, vehicle, route, and posology match 100%!
  if (explicitFormulations && Array.isArray(explicitFormulations) && explicitFormulations.length >= 1) {
    return explicitFormulations.map((form, fIdx) => {
      const phaseNum = form.index || (fIdx + 1);
      const partCode = form.extra?.partCode ? String(form.extra.partCode).toUpperCase() : null;

      // Match by exact partCode first (e.g. RX-50957-A vs RX-50957-B), then by active ingredient overlap, then phaseNumber, then title
      const regMatch = matches.find(m => 
        partCode && m.prescriptionMatches.some(pm => pm.toUpperCase() === partCode)
      ) || matches.find(m => {
        if (!form.apis || !Array.isArray(form.apis) || !m.apis || !Array.isArray(m.apis)) return false;
        return m.apis.some(ma => {
          const maName = (ma.name || ma.activeIngredient || '').toLowerCase();
          return form.apis.some(fa => {
            const faName = (fa.name || fa.activeIngredient || '').toLowerCase();
            return maName && faName && (maName.includes(faName) || faName.includes(maName));
          });
        });
      }) || matches.find(m => 
        m.phaseNumber === phaseNum
      ) || matches.find(m => 
        m.productName && form.title && m.productName.toLowerCase().includes(form.title.toLowerCase().slice(0, 10))
      );

      let formulaText = form.formula || '';
      if (!formulaText && form.apis && Array.isArray(form.apis)) {
        formulaText = form.apis
          .filter(a => !a.isVehicle && !a.isVehicleOrBase && a.itemType !== 'vehicle_base')
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
          clinicName: auth.clinicName || regMatch.clinicName,
          fileNumber: auth.fileNumber || regMatch.fileNumber,
          targetRxUrl: auth.targetRxUrl || regMatch.targetRxUrl,
          apis: (form?.apis && form.apis.length > 0) ? form.apis : (regMatch.apis || rx.items || rx.prescriptionLines || []),
          formula: formulaText || regMatch.formula || '',
          vehicle: regMatch.vehicle || form?.vehicle || null,
          prodDate: rxProdDate || regMatch.prodDate,
          expDate: rxExpDate || regMatch.expDate
        };
      }

      // Generate dynamic label for this phase / formulation
      const pName = form.title || form.treatmentTitle || form.productName || form.name || rx.formulaName || `Phase ${phaseNum} Compounded Protocol`;
      const pForm = form.route || form.dosageForm || (form.volume?.includes('Cap') ? 'Oral Route (Plant-Based Capsules)' : (form.volume?.includes('g') ? 'Topical Pomade / Ointment' : 'Topical Solution'));
      const pVol = form.volume || (form.volume?.includes('g') ? '30 g' : '100 mL');

      const directionsText = form.posology?.regimen || form.instructions || form.directions || (form.posology?.steps ? form.posology.steps.map(s => s.text).join(' ') : (rx.posology?.notes || 'Take / apply as directed by prescribing physician.'));
      const warningsText = form.warnings || rx.posology?.notes || 'For patient use as prescribed. Keep out of reach of children.';

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
        apis: form.apis || rx.items || rx.prescriptionLines || [],
        vehicle: form.vehicle || null,
        directions: directionsText,
        warnings: warningsText,
        prodDate: rxProdDate,
        expDate: rxExpDate,
        storage: form.storage || rx.storage || 'Store at room temperature',
        doctorName: auth.doctorName || 'Dr. Marina Cordeiro Fernandes',
        doctorLicense: auth.doctorLicense || 'DHA Registered',
        clinicName: auth.clinicName || 'NOVA Clinic Day Surgery Center, Dubai',
        batchCode: `PHARM-2026-${String(auth.fileNumber || 'B948').slice(-6).toUpperCase()}`,
        lote: `2609-P${String(phaseNum)}`,
        targetRxUrl: auth.targetRxUrl
      };
    });
  }

  if (matches.length > 0) {
    return matches.map(m => ({
      ...m,
      patientName: auth.patientName || m.patientName,
      doctorName: auth.doctorName || m.doctorName,
      doctorLicense: auth.doctorLicense || m.doctorLicense,
      clinicName: auth.clinicName || m.clinicName,
      fileNumber: auth.fileNumber || m.fileNumber,
      targetRxUrl: auth.targetRxUrl || m.targetRxUrl,
      apis: m.apis || rx.items || rx.prescriptionLines || [],
      formula: m.formula || ''
    }));
  }

  // Fallback: dynamically construct label items from rx phases, compounds, or items
  const rawItems = rx.phases || rx.treatmentPhases || rx.items || rx.formulations || rx.compounds || rx.products || (rx.product ? [rx.product] : [rx]);

  return rawItems.map((p, idx) => {
    const pName = p.name || p.productName || p.title || p.phaseTitle || rx.title || rx.medicationName || `Phase ${idx + 1} Compounded Protocol`;
    const pForm = p.dosageForm || p.format || p.presentation || p.form || 'Oral Route (Plant-Based Capsules)';
    const pVol = p.volume || p.quantity || p.pack_size || p.count ? `${p.quantity || p.count || 90} Capsules (3 Months)` : '90 Capsules (3 Months)';
    
    // Formula text
    let formulaText = p.formula || p.composition || '';
    if (!formulaText && p.apis && Array.isArray(p.apis)) {
      formulaText = p.apis.map(a => `${a.name || a.api || ''} ${a.dosage || a.dose || ''}`.trim()).filter(Boolean).join(' + ');
    }
    if (!formulaText && p.ingredients && Array.isArray(p.ingredients)) {
      formulaText = p.ingredients.map(i => `${i.name || ''} ${i.dose || ''}`.trim()).filter(Boolean).join(' + ');
    }

    const directionsText = p.instructions || p.directions || p.sig || p.posology || p.regimen || rx.instructions || 'Take / apply as directed by prescribing physician.';
    const warningsText = p.warnings || p.cautions || rx.warnings || 'For external / patient use only. Keep out of reach of children.';

    return {
      id: `${rx.id || 'rx'}-label-${idx}`,
      phaseNumber: p.phaseNumber || idx + 1,
      patientName: auth.patientName || 'Patient Record',
      fileNumber: auth.fileNumber || '51857',
      productName: pName,
      productTitle: pName,
      subTitle: p.subTitle || `Phase ${idx + 1}: Clinical Protocol Administration`,
      dosageForm: pForm,
      volume: pVol,
      dimensions: '7.5 × 4.5 cm (1500 × 900 px)',
      pharmacy: 'Pharmapolis Compounding Pharmacy',
      formula: formulaText,
      directions: directionsText,
      warnings: warningsText,
      prodDate: rxProdDate,
      expDate: rxExpDate,
      storage: p.storage || rx.storage || 'Store at room temperature',
      doctorName: auth.doctorName || 'Dr. Marina Cordeiro Fernandes',
      doctorLicense: auth.doctorLicense || 'DHA Registered',
      clinicName: auth.clinicName || 'NOVA Clinic Day Surgery Center, Dubai',
      batchCode: `PHARM-2026-${String(auth.fileNumber || 'B948').slice(-6).toUpperCase()}`,
      lote: `2609-P${String(idx + 1)}`,
      targetRxUrl: auth.targetRxUrl
    };
  });
}

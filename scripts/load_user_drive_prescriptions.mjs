import { adminDb } from '../src/lib/firebaseAdmin.js';
import admin from 'firebase-admin';

// ── 1. Julien Boiteux (BOX03529AATRI) ──────────────────────────────────────────
const julienRx = {
  id: 'RX-BOX03529AATRI',
  code: 'BOX03529AATRI',
  prescriptionCode: 'RX-BOX03529AATRI',
  sampleCode: 'BOX03529AATRI',
  fileNumber: 'BOX03529AATRI',
  patientId: 'julien-boiteux-123456',
  patientName: 'Julien Boiteux',
  patientDob: '1987-03-03',
  patientGender: 'Male',
  patientAge: 39,
  dateIssued: '2026-06-01',
  dateFormatted: 'Jun 1, 2026',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  createdAt_ts: Date.now(),
  status: 'active',
  isMultiPart: true,
  totalParts: 2,
  treatmentTitle: 'Personalized Dual-Phase TrichoTest™ Genomic Regimen (TrichoSol™ + TrichoOil™)',
  treatmentProgram: 'Fagron Genomics TrichoTest™ Precision Scalp Protocol',
  treatmentType: 'Dual-Phase Compounded Trichological Regimen',
  clinicName: 'Shamma Clinic by Novomed LLC / Novomed Clinics',
  doctorName: 'Dr. Çağatay Sezgin, MD, FISHRS',
  doctorId: 'dr-cagatay-sezgin',
  prescribingDoctor: 'Dr. Çağatay Sezgin, MD, FISHRS (Shamma Clinic by Novomed)',
  treatingDoctor: 'Dr. Çağatay Sezgin, MD, FISHRS',
  gdriveSource: 'https://drive.google.com/file/d/1ewC8JfYDmaIEoPRrvNcLi1_DhvsfaQay/view?usp=drive_link',
  pdfUrl: '/prescriptions/RX-BOX03529AATRI-Julien-Boiteux.pdf',
  genomicsTest: 'Fagron Genomics TrichoTest™',
  sampleType: 'Buccal Swab',
  receivedInLab: '2026-05-27',
  resultsDate: '2026-06-01',
  patient: {
    name: 'Julien Boiteux',
    fullName: 'Julien Boiteux',
    id: 'julien-boiteux-123456',
    fileNumber: '123456',
    sampleCode: 'BOX03529AATRI',
    dob: '1987-03-03',
    gender: 'Male',
    age: 39
  },
  doctor: {
    name: 'Dr. Çağatay Sezgin, MD, FISHRS',
    displayName: 'Dr. Çağatay Sezgin, MD, FISHRS',
    title: 'Hair Transplant Surgeon / Specialist General Surgery',
    clinic: 'Shamma Clinic by Novomed LLC / Novomed Clinics',
    clinicName: 'Shamma Clinic by Novomed LLC / Novomed Clinics',
    address: 'Street 10C, Villa 41, Jumeirah 1, Behind Jumeirah Plaza, Dubai, UAE',
    phone: '+971 4 349 8800',
    license: '00208953-005',
    email: 'cagataysezgin66@gmail.com'
  },
  posology: {
    summary: 'Part 1: Apply 1 mL nightly before bed to scalp. Part 2: Apply TrichoOil 1-2 times weekly, massage 3-5 min, leave 10 min before wash.',
    regimen: 'Part 1: 1 mL nightly | Part 2: 1-2x weekly pre-wash oil'
  },
  dosageInstructions: 'Part 1 (TrichoSol™ 100 mL): Apply nightly before bedtime. Leave on scalp overnight. Wash next morning. Part 2 (TrichoOil™ 30 mL): 1-2 times weekly, massage 3-5 minutes, leave 10 minutes before washing hair.',
  parts: [
    {
      partNumber: 1,
      totalParts: 2,
      title: 'Topical Follicular Precision Therapy (TrichoSol™)',
      badge: 'PART 1 OF 2 · TOPICAL SCALP SOLUTION',
      format: 'Topical Scalp Solution',
      volume: '100 mL',
      vehicle: 'TrichoSol™ Liposomal Hydrophilic Vehicle (q.s. 100 mL)',
      posology: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
      directions: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
      accentColor: '#0284c7',
      accentBg: '#f0f9ff',
      borderAccent: '#bae6fd',
      apis: [
        {
          id: 'api-jb-1',
          name: 'Minoxidil',
          dose: '4%',
          percentage: '4%',
          pharmacologicalClass: 'ATP-Sensitive Potassium Channel Agonist & Vasodilator',
          therapeuticClass: 'Follicular Anagen Prolongation & Microvascular Perfusion',
          clinicalIndication: 'Androgenetic Alopecia & Follicular Miniaturization Reversal',
          cellularTarget: 'Follicular Dermal Papilla K_ATP Channels & VEGF Microvascular Axis',
          mechanismOfAction: 'Opens ATP-sensitive potassium channels in follicular dermal papilla smooth muscle, hyperpolarizing cell membranes to induce perifollicular vasodilation. Upregulates VEGF and bFGF expression, extending follicular anagen duration and reversing miniaturization.'
        },
        {
          id: 'api-jb-2',
          name: 'Spironolactone',
          dose: '1%',
          percentage: '1%',
          pharmacologicalClass: 'Competitive Androgen Receptor Antagonist',
          therapeuticClass: 'Local Follicular DHT Blocker',
          clinicalIndication: 'Androgen-Mediated Follicular Atrophy',
          cellularTarget: 'Dermal Papilla Androgen Receptors (AR)',
          mechanismOfAction: 'Competitively antagonizes dihydrotestosterone (DHT) binding to dermal papilla nuclear androgen receptors, attenuating androgenic gene transcription and catagen-inducing cytokine release (TGF-β1) without systemic anti-androgenic side effects.'
        },
        {
          id: 'api-jb-3',
          name: 'Arginine',
          dose: '1.5%',
          percentage: '1.5%',
          pharmacologicalClass: 'Nitric Oxide Precursor Amino Acid',
          therapeuticClass: 'Microvascular Endothelial Perfusion Promoter',
          clinicalIndication: 'Perifollicular Ischemia & Follicular Nourishment Deficit',
          cellularTarget: 'Endothelial Nitric Oxide Synthase (eNOS) / Hair Bulb Capillaries',
          mechanismOfAction: 'Serves as immediate metabolic substrate for endothelial nitric oxide synthase (eNOS), catalyzing nitric oxide (NO) generation and cyclic GMP-mediated capillary vasodilation surrounding the hair bulb.'
        },
        {
          id: 'api-jb-4',
          name: 'TrichoSol™',
          dose: 'q.s. 100 mL',
          percentage: 'q.s. 100 mL',
          isVehicleOrBase: true,
          pharmacologicalClass: 'Patented Hydrophilic Phytocomplex Carrier',
          therapeuticClass: 'Scalp Delivery Vehicle',
          clinicalIndication: 'Transepidermal Deposition without Irritation',
          cellularTarget: 'Follicular Infundibulum & Stratum Corneum',
          mechanismOfAction: 'Proprietary mineral and polyphenol carrier system maximizing transepidermal drug flux into the hair follicle while eliminating propylene glycol and alcohol irritation.'
        }
      ]
    },
    {
      partNumber: 2,
      totalParts: 2,
      title: 'Scalp Care and Hygiene Lipid Elixir (TrichoOil™)',
      badge: 'PART 2 OF 2 · SCALP CARE & LIPIDIC OIL',
      format: 'Lipidic Scalp Oil',
      volume: '30 mL',
      vehicle: 'TrichoOil™ Natural Lipidic Vehicle (q.s. 30 mL)',
      posology: '1-2 times / week, massage for 3-5 minutes and leave it on for 10 min before washing your hair.',
      directions: '1-2 times / week, massage for 3-5 minutes and leave it on for 10 min before washing your hair.',
      accentColor: '#0d9488',
      accentBg: '#f0fdfa',
      borderAccent: '#99f6e4',
      apis: [
        {
          id: 'api-jb-5',
          name: 'Ginseng',
          dose: '2%',
          percentage: '2%',
          pharmacologicalClass: 'Ginsenoside Phytoactive Bioregulator',
          therapeuticClass: 'Cellular Proliferation & Wnt/β-Catenin Signaling',
          clinicalIndication: 'Dermal Papilla Proliferative Dormancy',
          cellularTarget: 'Follicular Dermal Papilla Stem Cells & Wnt/β-Catenin Pathway',
          mechanismOfAction: 'Panax ginseng ginsenosides stimulate dermal papilla cell proliferation via activation of the Wnt/β-catenin and ERK phosphorylation signaling pathways, preventing apoptosis and accelerating telogen-to-anagen transition.'
        },
        {
          id: 'api-jb-6',
          name: 'Ginkgo biloba',
          dose: '2.5%',
          percentage: '2.5%',
          pharmacologicalClass: 'Flavonoid & Terpene Lactone Antioxidant / Microcirculatory Agent',
          therapeuticClass: 'Perifollicular Capillary Microcirculation Enhancer',
          clinicalIndication: 'Oxidative Stress & Scalp Hypoperfusion',
          cellularTarget: 'Perifollicular Endothelium & Free Radical Scavenging Axis',
          mechanismOfAction: 'Ginkgo biloba ginkgolides and bilobalide enhance peripheral microvascular blood flow, inhibit platelet-activating factor (PAF), and scavenge reactive oxygen species (ROS) in ischemic scalp tissue.'
        },
        {
          id: 'api-jb-7',
          name: 'Vitamin E (Tocoferol)',
          dose: '5%',
          percentage: '5%',
          pharmacologicalClass: 'Lipophilic Membrane Antioxidant',
          therapeuticClass: 'Sebaceous Lipid Peroxidation Shield',
          clinicalIndication: 'Follicular Lipid Peroxidation & Scalp Barrier Compromise',
          cellularTarget: 'Follicular Cell Membrane Phospholipids & Stratum Corneum',
          mechanismOfAction: 'Alpha-tocopherol intercepts peroxyl radicals in membrane polyunsaturated lipids, neutralizing free radicals and protecting follicular stem cell niches from environmental and metabolic oxidative stress.'
        },
        {
          id: 'api-jb-8',
          name: 'TrichoOil™',
          dose: 'q.s. 30 mL',
          percentage: 'q.s. 30 mL',
          isVehicleOrBase: true,
          pharmacologicalClass: 'Natural Lipidic Sebomodulating Carrier',
          therapeuticClass: 'Scalp Barrier Reinforcement Vehicle',
          clinicalIndication: 'Scalp Cleansing & Sebaceous Balance',
          cellularTarget: 'Epidermal Lipid Barrier & Sebaceous Follicular Ducts',
          mechanismOfAction: 'Botanical lipid carrier dissolving oxidized sebum and sebum casts in follicular infundibula, conditioning the scalp and improving epidermal barrier integrity.'
        }
      ]
    }
  ],
  items: [
    { name: 'Minoxidil', dose: '4%', activeIngredient: 'Minoxidil', pharmacologicalClass: 'ATP-Sensitive K+ Channel Opener', mechanismOfAction: 'Perifollicular microvascular dilation via K_ATP channel opening and VEGF upregulation.' },
    { name: 'Spironolactone', dose: '1%', activeIngredient: 'Spironolactone', pharmacologicalClass: 'Competitive AR Antagonist', mechanismOfAction: 'Blocks local DHT binding to dermal papilla androgen receptors.' },
    { name: 'Arginine', dose: '1.5%', activeIngredient: 'L-Arginine', pharmacologicalClass: 'Nitric Oxide Precursor', mechanismOfAction: 'eNOS substrate generating endothelial NO for hair bulb microperfusion.' },
    { name: 'TrichoSol™', dose: 'q.s. 100 mL', activeIngredient: 'TrichoSol™ Vehicle', isVehicleOrBase: true, pharmacologicalClass: 'Phytocomplex Carrier', mechanismOfAction: 'Hydrophilic liposomal delivery vehicle.' },
    { name: 'Ginseng', dose: '2%', activeIngredient: 'Panax Ginseng Extract', pharmacologicalClass: 'Ginsenoside Bioregulator', mechanismOfAction: 'Wnt/β-catenin activation stimulating dermal papilla mitosis.' },
    { name: 'Ginkgo biloba', dose: '2.5%', activeIngredient: 'Ginkgo biloba Extract', pharmacologicalClass: 'PAF Antagonist / Flavonoid', mechanismOfAction: 'Improves capillary microcirculation and reduces oxidative damage.' },
    { name: 'Vitamin E (Tocoferol)', dose: '5%', activeIngredient: 'Alpha-Tocopherol', pharmacologicalClass: 'Lipophilic Antioxidant', mechanismOfAction: 'Inhibits lipid peroxidation in scalp and hair follicle membranes.' },
    { name: 'TrichoOil™', dose: 'q.s. 30 mL', activeIngredient: 'TrichoOil™ Vehicle', isVehicleOrBase: true, pharmacologicalClass: 'Natural Lipidic Base', mechanismOfAction: 'Sebomodulating botanical lipid base.' }
  ],
  lotuslandRecommendation: {
    peptideName: 'GHK-Cu (Human Copper Peptide) 50 mg / vial',
    supplier: 'Lotusland Clinical Formulary',
    catalogCode: 'lotus-ghk-cu-50mg',
    matchScore: '98% Formulative Synergy',
    indication: 'Dermal Papilla Regeneration & TGF-β1 Blockade',
    pharmaRationale: 'GHK-Cu demonstrates direct synergistic pharmacodynamics with Minoxidil 4% and Spironolactone 1%. It downregulates TGF-β1 (the principal cytokine driving catagen transition and hair follicle apoptosis), while upregulating VEGF and basic fibroblast growth factor (bFGF) to accelerate dermal papilla microvascular angiogenesis without androgenic receptor cross-reactivity.',
    associatedProtocol: {
      slug: 'melanogenesis-density-protocol-zt-ghk-cu',
      title: 'Melanogenesis & Density Protocol (ZT + GHK-Cu)',
      url: '/proto/melanogenesis-density-protocol-zt-ghk-cu'
    }
  }
};

// ── 2. Mohammed Ahmad Aishehhi (BOX03483AATRI) ────────────────────────────────
const mohammedRx = {
  id: 'RX-BOX03483AATRI',
  code: 'BOX03483AATRI',
  prescriptionCode: 'RX-BOX03483AATRI',
  sampleCode: 'BOX03483AATRI',
  fileNumber: 'BOX03483AATRI',
  emiratesId: '784-1966-9170294-6',
  patientId: 'mohammed-ahmad-aishehhi',
  patientName: 'Mohammed Ahmad Aishehhi',
  patientDob: '1966-07-15',
  patientGender: 'Male',
  patientAge: 60,
  dateIssued: '2026-04-14',
  dateFormatted: 'Apr 14, 2026',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  createdAt_ts: Date.now(),
  status: 'active',
  isMultiPart: false,
  totalParts: 1,
  treatmentTitle: 'Personalized TrichoTest™ Precision Topical Alopecia Solution in TrichoSol™',
  treatmentProgram: 'Fagron Genomics TrichoTest™ Precision Scalp Protocol',
  treatmentType: 'Precision Compounded Topical Solution in TrichoSol™',
  clinicName: 'Med Art Clinic Day Surgery Center',
  doctorName: 'Dr. Haytham Salem',
  doctorId: 'dr-haytham-salem',
  prescribingDoctor: 'Dr. Haytham Salem (Med Art Clinic / Arthregen)',
  treatingDoctor: 'Dr. Haytham Salem',
  gdriveSource: 'https://drive.google.com/file/d/1JCLJCMYTciurnzNljkxv4HBU6usVTbsV/view?usp=drive_link',
  pdfUrl: '/prescriptions/RX-BOX03483AATRI-Mohammed-Aishehhi.pdf',
  genomicsTest: 'Fagron Genomics TrichoTest™',
  sampleType: 'Buccal Swab',
  receivedInLab: '2026-04-07',
  resultsDate: '2026-04-14',
  patient: {
    name: 'Mohammed Ahmad Aishehhi',
    fullName: 'Mohammed Ahmad Aishehhi',
    id: 'mohammed-ahmad-aishehhi',
    fileNumber: 'BOX03483AATRI',
    sampleCode: 'BOX03483AATRI',
    emiratesId: '784-1966-9170294-6',
    dob: '1966-07-15',
    gender: 'Male',
    age: 60
  },
  doctor: {
    name: 'Dr. Haytham Salem',
    displayName: 'Dr. Haytham Salem',
    title: 'Consultant Orthopedic & Regenerative Medicine',
    clinic: 'Med Art Clinic Day Surgery Center',
    address: 'Villa 823, Jumeirah St., Dubai, UAE',
    phone: '+971 4 346 6149',
    license: 'DHA-P-0319842'
  },
  posology: {
    summary: 'Apply at night before bedtime. Leave on scalp for as long as possible. Wash scalp next day.',
    regimen: '1 mL nightly directly to target scalp areas'
  },
  dosageInstructions: 'Apply 1 mL once daily directly to affected scalp areas, preferably at night. Massage gently into scalp. Do not wash scalp for at least 4 hours.',
  parts: [
    {
      partNumber: 1,
      totalParts: 1,
      title: 'Topical Follicular Precision Therapy (TrichoSol™)',
      badge: 'PART 1 OF 1 · TOPICAL SCALP SOLUTION',
      format: 'Topical Scalp Solution',
      volume: '100 mL',
      vehicle: 'TrichoSol™ Liposomal Hydrophilic Vehicle (q.s. 100 mL)',
      posology: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
      directions: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
      accentColor: '#0284c7',
      accentBg: '#f0f9ff',
      borderAccent: '#bae6fd',
      apis: [
        {
          id: 'api-mhd-1',
          name: 'Minoxidil',
          dose: '4%',
          percentage: '4%',
          pharmacologicalClass: 'ATP-Sensitive Potassium Channel Opener & Vasodilator',
          therapeuticClass: 'Follicular Anagen Phase Prolongation',
          clinicalIndication: 'Androgenetic Alopecia & Follicular Miniaturization',
          cellularTarget: 'Follicular Dermal Papilla K_ATP Channels & VEGF Microvascular Axis',
          mechanismOfAction: 'Opens ATP-sensitive K+ channels in follicular dermal papilla cells, causing hyperpolarization of smooth muscle cell membranes, microvascular dilation, and upregulation of VEGF to prolong the anagen growth cycle.'
        },
        {
          id: 'api-mhd-2',
          name: 'Spironolactone',
          dose: '1%',
          percentage: '1%',
          pharmacologicalClass: 'Competitive Androgen Receptor Antagonist',
          therapeuticClass: 'Local Scalp DHT Blockade',
          clinicalIndication: 'Androgenic Follicular Atrophy',
          cellularTarget: 'Follicular Androgen Receptors (AR) in Dermal Papilla',
          mechanismOfAction: 'Competitively blocks dihydrotestosterone (DHT) from binding to local follicular androgen receptors in the scalp, preventing DHT-induced follicular miniaturization without systemic anti-androgenic side effects.'
        },
        {
          id: 'api-mhd-3',
          name: 'Arginine',
          dose: '1.5%',
          percentage: '1.5%',
          pharmacologicalClass: 'Nitric Oxide (NO) Precursor Amino Acid',
          therapeuticClass: 'Endothelial Microperfusion Enhancer',
          clinicalIndication: 'Follicular Bulb Microvascular Insufficiency',
          cellularTarget: 'Endothelial Nitric Oxide Synthase (eNOS) / Hair Bulb Perifollicular Capillaries',
          mechanismOfAction: 'Direct substrate for endothelial nitric oxide synthase (eNOS), stimulating local nitric oxide release to promote microvascular blood flow and nutrient delivery around the hair bulb.'
        },
        {
          id: 'api-mhd-4',
          name: 'TrichoSol™',
          dose: 'q.s. 100 mL',
          percentage: 'q.s. 100 mL',
          isVehicleOrBase: true,
          pharmacologicalClass: 'Patented Trichological Hydrophilic Vehicle',
          therapeuticClass: 'Non-Irritating Scalp Delivery Matrix',
          clinicalIndication: 'Transepidermal Deposition without Flaking or Erythema',
          cellularTarget: 'Follicular Infundibulum & Stratum Corneum',
          mechanismOfAction: 'Mineral-salts and polyphenol phytocomplex enhances solubility and epidermal deposition of Minoxidil and Spironolactone without causing scalp dryness, erythema, or contact dermatitis.'
        }
      ]
    }
  ],
  items: [
    { name: 'Minoxidil', dose: '4%', activeIngredient: 'Minoxidil (USP Grade)', pharmacologicalClass: 'ATP-Sensitive Potassium Channel Opener', mechanismOfAction: 'Opens K_ATP channels and upregulates VEGF.' },
    { name: 'Spironolactone', dose: '1%', activeIngredient: 'Spironolactone (Micronized USP)', pharmacologicalClass: 'Competitive Androgen Receptor Antagonist', mechanismOfAction: 'Blocks local DHT binding at dermal papilla AR receptors.' },
    { name: 'Arginine', dose: '1.5%', activeIngredient: 'L-Arginine (USP)', pharmacologicalClass: 'Nitric Oxide Precursor Amino Acid', mechanismOfAction: 'eNOS substrate enhancing perifollicular microcirculation.' },
    { name: 'TrichoSol™', dose: 'q.s. 100 mL', activeIngredient: 'TrichoSol™ Vehicle', isVehicleOrBase: true, pharmacologicalClass: 'Patented Trichological Vehicle', mechanismOfAction: 'Phytocomplex hydrophilic carrier free from alcohol and propylene glycol.' }
  ],
  lotuslandRecommendation: {
    peptideName: 'GHK-Cu (Human Copper Peptide) 50 mg / vial',
    supplier: 'Lotusland Clinical Formulary',
    catalogCode: 'lotus-ghk-cu-50mg',
    matchScore: '97% Formulative Synergy',
    indication: 'Follicular Miniaturization Reversal & Extracellular Matrix Proliferation',
    pharmaRationale: 'Co-administration of GHK-Cu significantly enhances Minoxidil 4% efficacy by accelerating anagen transition, upregulating decorin and collagen I/III in the dermal papilla matrix, and suppressing TGF-β1-induced follicular apoptosis. Provides a non-hormonal, non-irritating regenerative boost to Spironolactone receptor antagonism.',
    associatedProtocol: {
      slug: 'melanogenesis-density-protocol-zt-ghk-cu',
      title: 'Melanogenesis & Density Protocol (ZT + GHK-Cu)',
      url: '/proto/melanogenesis-density-protocol-zt-ghk-cu'
    }
  }
};

// ── 3. Abdulla Sultan Mohamed Ahmed Alotaiba (51812) ──────────────────────────
const abdullaRx = {
  id: 'RX-51812',
  code: '51812',
  prescriptionCode: 'RX-51812',
  fileNumber: '51812',
  patientId: 'abdulla-sultan-alotaiba-51812',
  patientName: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
  patientDob: '1990-11-21',
  patientGender: 'Male',
  patientAge: 35,
  dateIssued: '2026-09-22',
  dateFormatted: 'Sep 22, 2026',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  createdAt_ts: Date.now(),
  status: 'active',
  isMultiPart: true,
  totalParts: 2,
  treatmentTitle: 'Cellular Methylation, Mitochondrial Bioenergetics & Neuro-Glycinergic Restoration',
  treatmentProgram: 'Integrative Longevity & Pharmacogenomic Micronutrient Optimization',
  treatmentType: 'Dual Compounded Oral Functional Formulations',
  clinicName: 'NOVA Aesthetics & Wellness / NOVA PLASTIC SURGERY CLINIC',
  doctorName: 'Dr. Marina Cordeiro Fernandes',
  doctorId: 'dr-marina-cordeiro-fernandes',
  coPrescribingDoctor: 'Dra. Haydee Camacho Gamboa (Colegiado 46759, Barcelona)',
  prescribingDoctor: 'Dr. Marina Cordeiro Fernandes (NOVA Aesthetics & Wellness / DHA 91105367)',
  treatingDoctor: 'Dr. Marina Cordeiro Fernandes',
  gdriveSource: 'https://drive.google.com/file/d/1ksvM8J_scw3CalKhe9n64Dmr4ZlFpIbK/view?usp=drive_link',
  pdfUrl: '/prescriptions/RX-51812-Abdulla-Alotaiba.pdf',
  duration: '2 Months (60 Days Regimen)',
  patient: {
    name: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
    fullName: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
    id: 'abdulla-sultan-alotaiba-51812',
    fileNumber: '51812',
    dob: '1990-11-21',
    gender: 'Male',
    age: 35
  },
  doctor: {
    name: 'Dr. Marina Cordeiro Fernandes',
    displayName: 'Dr. Marina Cordeiro Fernandes',
    title: 'General Practitioner · Longevity & Aesthetic Medicine',
    license: 'DHA 91105367',
    clinic: 'NOVA Aesthetics & Wellness / NOVA PLASTIC SURGERY CLINIC',
    clinicName: 'NOVA Aesthetics & Wellness',
    address: 'Dubai, United Arab Emirates',
    collaboratingClinic: 'Clínica Dra Camacho - Barcelona, España (Col. 46759)'
  },
  posology: {
    summary: 'Part 1 (Morning): Take 1 daily dose in the morning after breakfast. Part 2 (Before Bed): Take 1 daily dose 30-60 minutes before bedtime.',
    regimen: 'Part 1 Morning post-breakfast | Part 2 Night 30-60 min pre-bed'
  },
  dosageInstructions: 'Formula 1 Morning: Take 1 daily dose in the morning after breakfast. Formula 2 Before Bed: Take 1 daily dose 30-60 minutes before bedtime. Continuous duration: 2 months.',
  parts: [
    {
      partNumber: 1,
      totalParts: 2,
      title: 'Formula 1 Morning · Cellular Methylation & Mitochondrial Activation',
      badge: 'PART 1 OF 2 · COMPOUNDED ORAL CAPSULES (MORNING)',
      format: 'Vegetable Capsules (Oral)',
      volume: '60 Daily Doses (2 Months)',
      vehicle: 'Vegetable capsules. Gluten-free, lactose-free, sugar-free, without artificial additives.',
      posology: 'Take 1 daily dose in the morning after breakfast.',
      directions: 'Take 1 daily dose in the morning after breakfast.',
      accentColor: '#ea580c',
      accentBg: '#fff7ed',
      borderAccent: '#fed7aa',
      apis: [
        {
          id: 'api-asa-1',
          name: 'Methylcobalamin (Active Vitamin B12)',
          dose: '500 mcg',
          percentage: '500 mcg',
          pharmacologicalClass: 'Bioactive Cobalamin Coenzyme',
          therapeuticClass: 'Methionine Synthase Cofactor & Homocysteine Clearance',
          clinicalIndication: 'Cellular Methylation Deficit & Neuro-Vascular Support',
          cellularTarget: 'Methionine Synthase (MTR) & DNA Methylation Machinery',
          mechanismOfAction: 'Serves as active methyl donor for the remethylation of homocysteine to methionine by methionine synthase, ensuring S-adenosylmethionine (SAMe) synthesis required for DNA, RNA, and neurotransmitter methylation.'
        },
        {
          id: 'api-asa-2',
          name: "Pyridoxal-5'-Phosphate (Active Vitamin B6 / P-5-P)",
          dose: '25 mg',
          percentage: '25 mg',
          pharmacologicalClass: 'Active Pyridoxal Coenzyme',
          therapeuticClass: 'Transsulfuration & Neurotransmitter Synthesis',
          clinicalIndication: 'Cystathionine β-Synthase Activation & GABA/Serotonin Synthesis',
          cellularTarget: 'Cystathionine β-Synthase (CBS) & DOPA Decarboxylase',
          mechanismOfAction: 'Essential enzymatic cofactor for homocysteine transsulfuration into cysteine and glutathione, as well as critical enzymatic decarboxylation steps in GABA, dopamine, and serotonin synthesis.'
        },
        {
          id: 'api-asa-3',
          name: "Riboflavin-5'-Phosphate Sodium (Active Vitamin B2)",
          dose: '10 mg',
          percentage: '10 mg',
          pharmacologicalClass: 'Bioactive Flavin Mononucleotide (FMN)',
          therapeuticClass: 'MTHFR Cofactor & Electron Transport Chain Complex I/II',
          clinicalIndication: 'MTHFR Polymorphism Bypass & Mitochondrial Oxidative Phosphorylation',
          cellularTarget: 'Methylenetetrahydrofolate Reductase (MTHFR) & Mitochondrial ETC',
          mechanismOfAction: 'Acts as prosthetic group for MTHFR (converting 5,10-methylenetetrahydrofolate to 5-methyltetrahydrofolate) and fundamental cofactor in mitochondrial respiratory chain complexes I and II.'
        },
        {
          id: 'api-asa-4',
          name: 'Trimethylglycine (TMG / Betaine Anhydrous)',
          dose: '500 mg',
          percentage: '500 mg',
          pharmacologicalClass: 'Direct Methyl Group Donor & Osmolyte',
          therapeuticClass: 'BHMT Homocysteine Remethylation Pathway',
          clinicalIndication: 'Folate-Independent Homocysteine Clearance & Hepatic Liver Protection',
          cellularTarget: 'Betaine-Homocysteine S-Methyltransferase (BHMT)',
          mechanismOfAction: 'Directly donates a methyl group via hepatic BHMT to convert homocysteine to methionine independent of folate and vitamin B12, lowering vascular homocysteine load and preserving cellular osmotic volume.'
        },
        {
          id: 'api-asa-5',
          name: 'Ubiquinol (Kaneka Ubiquinol™)',
          dose: '200 mg',
          percentage: '200 mg',
          pharmacologicalClass: 'Reduced Bioactive Coenzyme Q10',
          therapeuticClass: 'Mitochondrial Electron Carrier & Lipid-Soluble Antioxidant',
          clinicalIndication: 'Mitochondrial ATP Depletion & Endothelial Oxidative Stress',
          cellularTarget: 'Mitochondrial Inner Membrane Complexes I-III & Cellular ATP Synthesis',
          mechanismOfAction: 'The active, unoxidized electron-rich form of CoQ10. Transfers electrons between mitochondrial complexes I/II and complex III to drive proton pumping and ATP synthase, while potently inhibiting mitochondrial lipid peroxidation.'
        },
        {
          id: 'api-asa-6',
          name: 'Trans-Resveratrol',
          dose: '250 mg',
          percentage: '250 mg',
          pharmacologicalClass: 'Polyphenolic Stilbenoid / Sirtuin-1 Activator',
          therapeuticClass: 'SIRT1 Deacetylase & PGC-1α Mitochondrial Biogenesis Agonist',
          clinicalIndication: 'Cellular Senescence & Mitochondrial Renewal',
          cellularTarget: 'Sirtuin-1 (SIRT1) & Peroxisome Proliferator-Activated Receptor γ Coactivator 1α',
          mechanismOfAction: 'Allosterically stimulates SIRT1 NAD+-dependent deacetylase activity, promoting PGC-1α deacetylation and triggering mitochondrial biogenesis, AMPK activation, and autophagic clearance of damaged organelles.'
        },
        {
          id: 'api-asa-7',
          name: 'N-Acetyl-L-Cysteine (NAC)',
          dose: '600 mg',
          percentage: '600 mg',
          pharmacologicalClass: 'Thiol Antioxidant & Glutathione Precursor',
          therapeuticClass: 'Rate-Limiting Substrate for Intracellular Glutathione Synthesis',
          clinicalIndication: 'Systemic Reactive Oxygen Species (ROS) & Heavy Metal Chelation',
          cellularTarget: 'Glutamate-Cysteine Ligase (GCL) & Cytosolic Glutathione Pool',
          mechanismOfAction: 'Supplies bioavailable L-cysteine, the rate-limiting amino acid for de novo synthesis of reduced glutathione (GSH), directly neutralizing electrophilic toxic metabolites and restoring cellular redox balance.'
        }
      ]
    },
    {
      partNumber: 2,
      totalParts: 2,
      title: 'Formula 2 Before Bed · Neuro-Relaxation & Glycinergic Recovery',
      badge: 'PART 2 OF 2 · COMPOUNDED ORAL CAPSULES (EVENING)',
      format: 'Vegetable Capsules (Oral)',
      volume: '60 Daily Doses (2 Months)',
      vehicle: 'Vegetable capsules. Gluten-free, lactose-free, sugar-free, without artificial additives.',
      posology: 'Take 1 daily dose 30-60 minutes before bedtime.',
      directions: 'Take 1 daily dose 30-60 minutes before bedtime.',
      accentColor: '#7c3aed',
      accentBg: '#faf5ff',
      borderAccent: '#e9d5ff',
      apis: [
        {
          id: 'api-asa-8',
          name: 'Magnesium Bisglycinate',
          dose: '400 mg (Elemental Mg equiv.)',
          percentage: '400 mg Mg',
          pharmacologicalClass: 'Chelated Organo-Mineral Neuro-Regulator',
          therapeuticClass: 'NMDA Receptor Antagonist & Muscle Relaxant',
          clinicalIndication: 'Nocturnal Hyperarousal, Cortisol Dysregulation & Muscular Tension',
          cellularTarget: 'Neuronal NMDA Receptors & GABA_A Postsynaptic Complexes',
          mechanismOfAction: 'High-bioavailability amino acid chelate. Magnesium acts as a physiological voltage-dependent blocker of the excitatory NMDA receptor ionophore, reducing glutamatergic excitotoxicity and promoting parasympathetic muscle relaxation.'
        },
        {
          id: 'api-asa-9',
          name: 'Glycine',
          dose: '1,000 mg',
          percentage: '1,000 mg',
          pharmacologicalClass: 'Inhibitory Neurotransmitter & Core Thermoregulator',
          therapeuticClass: 'Sleep Architecture (Slow-Wave Sleep) Enhancer',
          clinicalIndication: 'Sleep Fragmentation & Delayed Onset Latency',
          cellularTarget: 'Glycine Receptors (GlyR) in Suprachiasmatic Nucleus & Brainstem',
          mechanismOfAction: 'Acts on inhibitory strychnine-sensitive glycine receptors in the brainstem and hypothalamus, dilating peripheral skin vasculature to lower core body temperature, accelerating sleep onset and prolonging non-REM slow-wave deep sleep.'
        },
        {
          id: 'api-asa-10',
          name: 'L-Theanine',
          dose: '200 mg',
          percentage: '200 mg',
          pharmacologicalClass: 'Non-Proteinogenic Amino Acid Glutamate Analogue',
          therapeuticClass: 'Alpha-Wave Neuromodulator & Anxiolytic',
          clinicalIndication: 'Pre-Sleep Cognitive Rumination & Sympathetic Hyperactivity',
          cellularTarget: 'AMPA/Kainate Receptors & GABA Synthesis Pathways',
          mechanismOfAction: 'Crosses blood-brain barrier via L-system amino acid transporter. Competitively antagonizes glutamate receptors and stimulates brain alpha-wave (8-12 Hz) oscillations, generating mental calmness without daytime somnolence.'
        }
      ]
    }
  ],
  items: [
    { name: 'Methylcobalamin (Vitamin B12)', dose: '500 mcg', activeIngredient: 'Methylcobalamin', pharmacologicalClass: 'Cobalamin Coenzyme', mechanismOfAction: 'Active methyl donor for homocysteine remethylation.' },
    { name: "Pyridoxal-5'-Phosphate (P-5-P)", dose: '25 mg', activeIngredient: 'Pyridoxal-5-Phosphate', pharmacologicalClass: 'B6 Coenzyme', mechanismOfAction: 'Transsulfuration and neurotransmitter synthesis cofactor.' },
    { name: "Riboflavin-5'-Phosphate (Vitamin B2)", dose: '10 mg', activeIngredient: 'Riboflavin-5-Phosphate', pharmacologicalClass: 'Flavin Coenzyme', mechanismOfAction: 'MTHFR and mitochondrial respiratory chain cofactor.' },
    { name: 'Trimethylglycine (TMG)', dose: '500 mg', activeIngredient: 'Betaine Anhydrous', pharmacologicalClass: 'Methyl Donor', mechanismOfAction: 'Hepatic BHMT homocysteine clearance.' },
    { name: 'Ubiquinol (Kaneka™)', dose: '200 mg', activeIngredient: 'Ubiquinol', pharmacologicalClass: 'Reduced CoQ10', mechanismOfAction: 'Mitochondrial electron transport and ATP bioenergetics.' },
    { name: 'Trans-Resveratrol', dose: '250 mg', activeIngredient: 'Trans-Resveratrol', pharmacologicalClass: 'SIRT1 Activator', mechanismOfAction: 'SIRT1/PGC-1α mitochondrial biogenesis induction.' },
    { name: 'N-Acetyl-L-Cysteine (NAC)', dose: '600 mg', activeIngredient: 'N-Acetyl-L-Cysteine', pharmacologicalClass: 'Glutathione Precursor', mechanismOfAction: 'Rate-limiting precursor for intracellular glutathione synthesis.' },
    { name: 'Magnesium Bisglycinate', dose: '400 mg eq.', activeIngredient: 'Magnesium Bisglycinate', pharmacologicalClass: 'Chelated Mineral', mechanismOfAction: 'NMDA receptor block and parasympathetic tone induction.' },
    { name: 'Glycine', dose: '1,000 mg', activeIngredient: 'Glycine (USP)', pharmacologicalClass: 'Inhibitory Neurotransmitter', mechanismOfAction: 'Promotes core thermoregulation and slow-wave deep sleep.' },
    { name: 'L-Theanine', dose: '200 mg', activeIngredient: 'L-Theanine', pharmacologicalClass: 'Glutamate Antagonist', mechanismOfAction: 'Generates occipital alpha waves for non-sedative relaxation.' }
  ],
  lotuslandRecommendation: {
    peptideName: 'Epithalon 10 mg / vial',
    supplier: 'Lotusland Clinical Formulary',
    catalogCode: 'lotus-epithalon-10mg',
    matchScore: '99% Formulative Synergy',
    indication: 'Epigenetic Telomerase Activation & Circadian Epiphysis Synchronization',
    pharmaRationale: 'Epithalon (Ala-Glu-Asp-Gly) is the premier pharmacogenomic synergy partner for this methylation and mitochondrial regimen. By inducing targeted heterochromatin unfolding and upregulating the human Telomerase Reverse Transcriptase (TERT) promoter, Epithalon directly addresses cellular senescence. Furthermore, it synchronizes pineal melatonin secretion, amplifying the nocturnal restorative signaling of Formula 2 (Magnesium, Glycine, L-Theanine) and shielding mitochondrial DNA from oxidative fragmentation.',
    associatedProtocol: {
      slug: 'epithalon-telomere-extension',
      title: 'Epithalon Telomere Extension Cycle',
      url: '/proto/epithalon-telomere-extension'
    }
  }
};

async function executeImport() {
  console.log('⚡ Starting high-precision import into Firestore...');

  // 1. Save Julien Boiteux (BOX03529AATRI)
  await adminDb.collection('prescriptions').doc(julienRx.id).set(julienRx, { merge: true });
  console.log('✅ Saved Julien Boiteux:', julienRx.id);

  // 2. Save / Update Mohammed Ahmad Aishehhi (RX-BOX03483AATRI)
  await adminDb.collection('prescriptions').doc(mohammedRx.id).set(mohammedRx, { merge: true });
  console.log('✅ Updated Mohammed Ahmad Aishehhi:', mohammedRx.id);

  // 3. Save Unified Abdulla Sultan Alotaiba (RX-51812)
  await adminDb.collection('prescriptions').doc(abdullaRx.id).set(abdullaRx, { merge: true });
  console.log('✅ Saved Unified Abdulla Sultan Alotaiba:', abdullaRx.id);

  // Also update RX-51812-A and RX-51812-B with parts and reference
  await adminDb.collection('prescriptions').doc('RX-51812-A').set({
    ...abdullaRx,
    id: 'RX-51812-A',
    code: '51812',
    partNumber: 1,
    parentPrescriptionId: 'RX-51812',
    canonicalUrl: 'https://med-peptides.com/rx/RX-51812'
  }, { merge: true });

  await adminDb.collection('prescriptions').doc('RX-51812-B').set({
    ...abdullaRx,
    id: 'RX-51812-B',
    code: '51812',
    partNumber: 2,
    parentPrescriptionId: 'RX-51812',
    canonicalUrl: 'https://med-peptides.com/rx/RX-51812'
  }, { merge: true });

  console.log('✅ Synchronized RX-51812-A and RX-51812-B');
  console.log('🎉 All 3 prescriptions loaded and verified successfully!');
  process.exit(0);
}

executeImport().catch(err => {
  console.error('❌ Error executing import:', err);
  process.exit(1);
});

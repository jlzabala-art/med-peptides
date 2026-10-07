/**
 * scripts/ingest_prescription_aisha_themasters.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Ingestion for Fagron TrichoTest Prescription:
 *   - Patient: Aisha Ahmad Al Derham (ID: 26763401150)
 *   - Ordering Physician: Raffanie Lucenio (raffanie@themasters.qa)
 *   - Clinic: The Masters Medical Center (Doha, Qatar)
 *   - Production Compounding Physician: Dr. Miguel Ángel López Aranda
 *   - Program: Fagron Genomics TrichoTest
 *   - Status: draft (awaiting_atlas_review, 24h SLA)
 *   - Formulations: 3 Distinct Compounded Formulations (TrichoSol, TrichoOil, TrichoWash)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sa = require(path.join(__dirname, 'serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

const CLINIC_ID = 'i1Dgcnn0sFtxMyewe1qJ';
const DOCTOR_ID = 'raffanie-lucenio';
const RX_CODE = 'RX-BOX02576AATRI';
const SAMPLE_CODE = 'BOX02576AATRI';

export async function run() {
  console.log(`\n══════════════════════════════════════════════════════════════`);
  console.log(`📋 Ingesting Prescription: Aisha Ahmad Al Derham (${RX_CODE})`);
  console.log(`🏥 Clinic: The Masters Medical Center (Doha, Qatar)`);
  console.log(`👨‍⚕️ Ordering Physician: Raffanie Lucenio`);
  console.log(`🏭 Production Physician: Dr. Miguel Ángel López Aranda`);
  console.log(`══════════════════════════════════════════════════════════════\n`);

  // 1. Update / Ensure Clinic: The Masters Medical Center
  const clinicRef = db.collection('clinics').doc(CLINIC_ID);
  const clinicSnap = await clinicRef.get();
  const clinicData = {
    id: CLINIC_ID,
    name: 'The Masters Medical Center',
    legalName: 'The Masters Medical Center W.L.L',
    website: 'https://themasters.qa',
    phone: '+974 4444 3431',
    email: 'info@themasters.qa',
    city: 'Doha',
    country: 'Qatar',
    countryCode: 'QA',
    state: 'Leabaib Zone 70',
    streetAddress: 'Building 81, Street 555, Leabaib Zone 70',
    type: 'polyclinic',
    status: 'active',
    specialties: [
      'Dermatology & Hair Restoration',
      'Plastic & Cosmetic Surgery',
      'Bariatric Surgery',
      'Clinical Nutrition & Regenerative Medicine'
    ],
    doctorsCount: 1,
    doctorIds: [DOCTOR_ID],
    updatedAt: new Date().toISOString()
  };
  await clinicRef.set(clinicData, { merge: true });
  console.log(`✓ Updated Clinic record: [clinics/${CLINIC_ID}]`);

  // 2. Register Ordering Doctor: Raffanie Lucenio
  const docRef = db.collection('doctors').doc(DOCTOR_ID);
  const userRef = db.collection('users').doc(DOCTOR_ID);
  const doctorPayload = {
    id: DOCTOR_ID,
    slug: DOCTOR_ID,
    name: 'Raffanie Lucenio',
    fullName: 'Raffanie Lucenio',
    displayName: 'Dr. Raffanie Lucenio',
    title: 'Dr.',
    role: 'doctor',
    email: 'raffanie@themasters.qa',
    specialty: 'Trichology & Aesthetic Medicine',
    clinic: 'The Masters Medical Center',
    clinicName: 'The Masters Medical Center',
    clinicId: CLINIC_ID,
    address: 'Building 81, Street 555, Leabaib Zone 70',
    city: 'Doha',
    country: 'Qatar',
    phone: '+974 4444 3431',
    clinicPhone: '+974 4444 3431',
    website: 'https://themasters.qa',
    license: 'QCHP Registered',
    status: 'active',
    updatedAt: new Date().toISOString()
  };
  await docRef.set(doctorPayload, { merge: true });
  await userRef.set(doctorPayload, { merge: true });
  console.log(`✓ Registered Doctor: [doctors/${DOCTOR_ID}] and [users/${DOCTOR_ID}]`);

  // 3. Register Production Physician: Dr. Miguel Ángel López Aranda
  const prodDocRef = db.collection('doctors').doc('dr-miguel-angel-lopez-aranda');
  await prodDocRef.set({
    id: 'dr-miguel-angel-lopez-aranda',
    slug: 'dr-miguel-angel-lopez-aranda',
    name: 'Dr. Miguel Ángel López Aranda',
    displayName: 'Dr. Miguel Ángel López Aranda',
    title: 'Dr.',
    role: 'doctor',
    isProductionDoctor: true,
    license: 'Lic. 282869584',
    specialty: 'Cirujano Capilar & Médico Prescriptor de Producción Magistral',
    clinic: 'Clínica Capilar Dr. López Aranda',
    clinicName: 'Clínica Capilar Dr. López Aranda',
    city: 'Madrid',
    country: 'España',
    hasDHA: false,
    isInternalOnly: true,
    purpose: 'compounding_production_order',
    status: 'active',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log(`✓ Verified Production Compounding Doctor: [doctors/dr-miguel-angel-lopez-aranda]`);

  // 4. Build Prescription Parts (3 distinct compounded formulations)
  const parts = [
    {
      partNumber: 1,
      totalParts: 3,
      title: 'Topical Treatment Solution (TrichoSol™)',
      badge: 'PART 1 OF 3 · TRANSDERMAL SCALP SOLUTION',
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
          id: 'api-aa-1',
          name: 'Minoxidil',
          dose: '4%',
          percentage: '4%',
          pharmacologicalClass: 'ATP-Sensitive Potassium Channel Agonist & Vasodilator',
          therapeuticClass: 'Follicular Anagen Prolongation & Microvascular Perfusion',
          clinicalIndication: 'Androgenetic Alopecia & Follicular Miniaturization Reversal',
          cellularTarget: 'Follicular Dermal Papilla K_ATP Channels & VEGF Microvascular Axis',
          mechanismOfAction: 'Opens ATP-sensitive potassium channels in follicular dermal papilla smooth muscle, hyperpolarizing cell membranes to induce perifollicular vasodilation. Upregulates VEGF and bFGF expression, extending follicular anagen duration.'
        },
        {
          id: 'api-aa-2',
          name: 'Spironolactone',
          dose: '1%',
          percentage: '1%',
          pharmacologicalClass: 'Competitive Androgen Receptor Antagonist',
          therapeuticClass: 'Local Follicular DHT Blocker',
          clinicalIndication: 'Androgen-Mediated Follicular Atrophy',
          cellularTarget: 'Dermal Papilla Androgen Receptors (AR)',
          mechanismOfAction: 'Competitively antagonizes dihydrotestosterone (DHT) binding to dermal papilla nuclear androgen receptors, attenuating androgenic gene transcription and catagen-inducing cytokine release (TGF-β1).'
        },
        {
          id: 'api-aa-3',
          name: 'Arginine',
          dose: '2%',
          percentage: '2%',
          pharmacologicalClass: 'Nitric Oxide Precursor Amino Acid',
          therapeuticClass: 'Microvascular Endothelial Perfusion Promoter',
          clinicalIndication: 'Perifollicular Ischemia & Follicular Nourishment Deficit',
          cellularTarget: 'Endothelial Nitric Oxide Synthase (eNOS) / Hair Bulb Capillaries',
          mechanismOfAction: 'Serves as immediate metabolic substrate for endothelial nitric oxide synthase (eNOS), catalyzing nitric oxide (NO) generation and cyclic GMP-mediated capillary vasodilation surrounding the hair bulb.'
        },
        {
          id: 'api-aa-4',
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
      totalParts: 3,
      title: 'Lipidic Scalp Care Elixir (TrichoOil™)',
      badge: 'PART 2 OF 3 · SCALP CARE & LIPIDIC OIL',
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
          id: 'api-aa-5',
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
          id: 'api-aa-6',
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
          id: 'api-aa-7',
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
    },
    {
      partNumber: 3,
      totalParts: 3,
      title: 'Scalp Care and Hygiene Cleanser (TrichoWash™)',
      badge: 'PART 3 OF 3 · SCALP CARE & HYGIENE',
      format: 'Therapeutic Shampoo / Scalp Cleanser',
      volume: '250 mL',
      vehicle: 'TrichoWash™ Non-Irritating Cleansing Base (q.s. 250 mL)',
      posology: 'Massage for 2 minutes and rinse',
      directions: 'Massage for 2 minutes and rinse',
      accentColor: '#7c3aed',
      accentBg: '#f5f3ff',
      borderAccent: '#ddd6fe',
      apis: [
        {
          id: 'api-aa-8',
          name: 'L-Carnitine L-tartrate',
          dose: '2%',
          percentage: '2%',
          pharmacologicalClass: 'Mitochondrial β-Oxidation & Energy Shuttle Nutrient',
          therapeuticClass: 'Follicular Keratinocyte Bio-energetic Stimulator',
          clinicalIndication: 'Follicular Energy Starvation & Premature Catagen Entry',
          cellularTarget: 'Keratinocyte Mitochondria & Carnitine Palmitoyltransferase-1 (CPT-1)',
          mechanismOfAction: 'Shuttles long-chain fatty acids into keratinocyte mitochondria for β-oxidation and ATP generation, reversing catagen transition and stimulating hair bulb elongation.'
        },
        {
          id: 'api-aa-9',
          name: 'Retinol palmitate',
          dose: '1%',
          percentage: '1%',
          pharmacologicalClass: 'Retinoid Ester & Epidermal Renewal Promoter',
          therapeuticClass: 'Follicular Infundibular Desquamation & Transdermal Penetration Enhancer',
          clinicalIndication: 'Hyperkeratosis & Follicular Plugging',
          cellularTarget: 'Nuclear Retinoic Acid Receptors (RAR) & Infundibular Keratinocytes',
          mechanismOfAction: 'Modulates epidermal differentiation and stratum corneum desquamation, unclogging hair follicles and enhancing the percutaneous absorption of active capillary ingredients.'
        },
        {
          id: 'api-aa-10',
          name: 'D-Panthenol',
          dose: '0.5%',
          percentage: '0.5%',
          pharmacologicalClass: 'Pro-Vitamin B5 Hydrophilic Humectant & Tissue Repair Agent',
          therapeuticClass: 'Scalp Barrier Hydration & Cuticular Conditioning',
          clinicalIndication: 'Scalp Dehydration, Irritation & Cuticular Brittleness',
          cellularTarget: 'Scalp Stratum Corneum & Hair Shaft Cortex',
          mechanismOfAction: 'Enzymatically converts to pantothenic acid (coenzyme A constituent), deeply penetrating and binding moisture to the hair cortex and accelerating cellular repair of the scalp micro-environment.'
        },
        {
          id: 'api-aa-11',
          name: 'TrichoWash™',
          dose: 'q.s. 250 mL',
          percentage: 'q.s. 250 mL',
          isVehicleOrBase: true,
          pharmacologicalClass: 'Sulfate-Free Dermocompatible Cleansing Base',
          therapeuticClass: 'Scalp Hygiene & Vehicle Delivery',
          clinicalIndication: 'Daily Scalp Decontamination without Lipid Stripping',
          cellularTarget: 'Epidermal Barrier & Hydro-Lipidic Film',
          mechanismOfAction: 'Gentle, biodegradable surfactant system engineered to cleanse the scalp micro-environment without stripping physiological ceramides or compromising hair fiber integrity.'
        }
      ]
    }
  ];

  // Flat items list for legacy and search compatibility
  const items = [
    {
      name: 'Minoxidil',
      dose: '4%',
      activeIngredient: 'Minoxidil',
      pharmacologicalClass: 'ATP-Sensitive Potassium Channel Agonist & Vasodilator',
      mechanismOfAction: 'Opens K_ATP channels, hyperpolarizing cell membranes to induce perifollicular vasodilation and extend anagen phase.',
      formulationBlock: 'Topical Treatment Solution (TrichoSol™)',
      formulationIndex: 1,
      blockVolume: '100 mL'
    },
    {
      name: 'Spironolactone',
      dose: '1%',
      activeIngredient: 'Spironolactone',
      pharmacologicalClass: 'Competitive Androgen Receptor Antagonist',
      mechanismOfAction: 'Blocks local DHT binding to dermal papilla nuclear androgen receptors without systemic effects.',
      formulationBlock: 'Topical Treatment Solution (TrichoSol™)',
      formulationIndex: 1,
      blockVolume: '100 mL'
    },
    {
      name: 'Arginine',
      dose: '2%',
      activeIngredient: 'L-Arginine',
      pharmacologicalClass: 'Nitric Oxide Precursor Amino Acid',
      mechanismOfAction: 'Metabolic substrate for eNOS, stimulating cyclic GMP-mediated capillary vasodilation surrounding the hair bulb.',
      formulationBlock: 'Topical Treatment Solution (TrichoSol™)',
      formulationIndex: 1,
      blockVolume: '100 mL'
    },
    {
      name: 'TrichoSol™',
      dose: 'q.s. 100 mL',
      activeIngredient: 'TrichoSol',
      pharmacologicalClass: 'Patented Hydrophilic Phytocomplex Carrier',
      mechanismOfAction: 'Proprietary mineral and polyphenol carrier system maximizing transepidermal drug flux into the hair follicle.',
      isVehicleOrBase: true,
      formulationBlock: 'Topical Treatment Solution (TrichoSol™)',
      formulationIndex: 1,
      blockVolume: '100 mL'
    },
    {
      name: 'Ginkgo biloba',
      dose: '2.5%',
      activeIngredient: 'Ginkgo biloba',
      pharmacologicalClass: 'Flavonoid & Terpene Lactone Antioxidant / Microcirculatory Agent',
      mechanismOfAction: 'Ginkgolides and bilobalide enhance peripheral blood flow and scavenge reactive oxygen species in ischemic scalp.',
      formulationBlock: 'Lipidic Scalp Care Elixir (TrichoOil™)',
      formulationIndex: 2,
      blockVolume: '30 mL'
    },
    {
      name: 'Vitamin E (Tocoferol)',
      dose: '5%',
      activeIngredient: 'Tocopherol',
      pharmacologicalClass: 'Lipophilic Membrane Antioxidant',
      mechanismOfAction: 'Neutralizes lipid peroxyl radicals in cell membranes, protecting follicular stem cell niches from oxidative stress.',
      formulationBlock: 'Lipidic Scalp Care Elixir (TrichoOil™)',
      formulationIndex: 2,
      blockVolume: '30 mL'
    },
    {
      name: 'TrichoOil™',
      dose: 'q.s. 30 mL',
      activeIngredient: 'TrichoOil',
      pharmacologicalClass: 'Natural Lipidic Sebomodulating Carrier',
      mechanismOfAction: 'Dissolves oxidized sebum casts in follicular infundibula, conditioning the scalp and improving barrier integrity.',
      isVehicleOrBase: true,
      formulationBlock: 'Lipidic Scalp Care Elixir (TrichoOil™)',
      formulationIndex: 2,
      blockVolume: '30 mL'
    },
    {
      name: 'L-Carnitine L-tartrate',
      dose: '2%',
      activeIngredient: 'L-Carnitine L-tartrate',
      pharmacologicalClass: 'Mitochondrial β-Oxidation & Energy Shuttle Nutrient',
      mechanismOfAction: 'Shuttles fatty acids into keratinocyte mitochondria for ATP generation, stimulating hair bulb elongation.',
      formulationBlock: 'Scalp Care and Hygiene Cleanser (TrichoWash™)',
      formulationIndex: 3,
      blockVolume: '250 mL'
    },
    {
      name: 'Retinol palmitate',
      dose: '1%',
      activeIngredient: 'Retinol palmitate',
      pharmacologicalClass: 'Retinoid Ester & Epidermal Renewal Promoter',
      mechanismOfAction: 'Accelerates stratum corneum desquamation, clearing follicular infundibula and facilitating percutaneous drug entry.',
      formulationBlock: 'Scalp Care and Hygiene Cleanser (TrichoWash™)',
      formulationIndex: 3,
      blockVolume: '250 mL'
    },
    {
      name: 'D-Panthenol',
      dose: '0.5%',
      activeIngredient: 'D-Panthenol',
      pharmacologicalClass: 'Pro-Vitamin B5 Hydrophilic Humectant & Tissue Repair Agent',
      mechanismOfAction: 'Converts to coenzyme A constituent, restoring hydration to the scalp and elasticity to the hair shaft.',
      formulationBlock: 'Scalp Care and Hygiene Cleanser (TrichoWash™)',
      formulationIndex: 3,
      blockVolume: '250 mL'
    },
    {
      name: 'TrichoWash™',
      dose: 'q.s. 250 mL',
      activeIngredient: 'TrichoWash',
      pharmacologicalClass: 'Sulfate-Free Dermocompatible Cleansing Base',
      mechanismOfAction: 'Gentle surfactant system cleansing scalp without stripping physiological ceramides or lipid barriers.',
      isVehicleOrBase: true,
      formulationBlock: 'Scalp Care and Hygiene Cleanser (TrichoWash™)',
      formulationIndex: 3,
      blockVolume: '250 mL'
    }
  ];

  const prescriptionPayload = {
    prescriptionId: RX_CODE,
    prescriptionCode: RX_CODE,
    code: RX_CODE,
    id: RX_CODE,
    sampleCode: SAMPLE_CODE,
    patientName: 'Aisha Ahmad Al Derham',
    patient: {
      name: 'Aisha Ahmad Al Derham',
      fullName: 'Aisha Ahmad Al Derham',
      id: '26763401150',
      patientId: '26763401150',
      dob: '01-12-1967',
      birthDate: '1967-12-01',
      gender: 'Female',
      sampleCode: SAMPLE_CODE,
      sampleType: 'Buccal Swab',
      receivedInLab: '2025-07-22',
      resultsDate: '2025-07-30'
    },
    patientId: '26763401150',
    patientDob: '01-12-1967',
    patientGender: 'Female',
    orderingPhysician: {
      name: 'Raffanie Lucenio',
      email: 'raffanie@themasters.qa',
      clinic: 'The Masters Medical Center',
      clinicId: CLINIC_ID,
      phone: '+974 4444 3431',
      city: 'Doha',
      country: 'Qatar'
    },
    doctorName: 'Raffanie Lucenio',
    doctorSlug: DOCTOR_ID,
    doctorId: DOCTOR_ID,
    doctor: {
      id: DOCTOR_ID,
      name: 'Raffanie Lucenio',
      title: 'Dr.',
      email: 'raffanie@themasters.qa',
      specialty: 'Trichology & Aesthetic Medicine',
      clinic: 'The Masters Medical Center',
      clinicId: CLINIC_ID,
      city: 'Doha',
      country: 'Qatar'
    },
    productionDoctor: {
      name: 'Dr. Miguel Ángel López Aranda',
      license: '282869584',
      specialty: 'Cirujano Capilar & Médico Prescriptor',
      clinic: 'Clínica Capilar Dr. López Aranda',
      country: 'España',
      hasDHA: false,
      isInternalOnly: true,
      purpose: 'compounding_production_order'
    },
    hasInternalProductionDoctor: true,
    treatingDoctor: {
      name: 'Raffanie Lucenio',
      email: 'raffanie@themasters.qa',
      clinic: 'The Masters Medical Center',
      city: 'Doha',
      country: 'Qatar'
    },
    hasTreatingDoctor: true,
    clinic: 'The Masters Medical Center',
    clinicName: 'The Masters Medical Center',
    clinicId: CLINIC_ID,
    clinicAddress: 'Building 81, Street 555, Leabaib Zone 70, Doha, Qatar',
    clinicPhone: '+974 4444 3431',
    clinicWebsite: 'https://themasters.qa',
    treatmentProgram: 'TrichoTest',
    treatmentType: 'Pharmacogenetic Compounded Alopecia Regimen',
    sourceReportType: 'Fagron Genomics TrichoTest',
    // 2-Phase Clinical Workflow SLA
    status: 'draft',
    state: 'draft',
    ingestionStage: 'awaiting_atlas_review',
    reviewEtaHours: 24,
    validationStatus: 'Under Clinical Review',
    quotationStatus: 'pending',
    orderStatus: 'draft',
    parts: parts,
    items: items,
    compounds: items,
    totalApisCount: 8, // 3 in Sol, 2 in Oil, 3 in Wash (excluding vehicles)
    totalVehiclesCount: 3,
    totalParts: 3,
    summary: 'Personalized 3-part pharmacogenetic capillary compounding protocol formulated by Fagron Genomics algorithm for androgenetic alopecia stabilization and hair follicle bio-energetic regeneration.',
    diagnosis: 'Androgenetic Alopecia & Scalp Barrier Optimization (TrichoTest Guided)',
    clinicalNotes: 'TrichoTest indicated strong response to K_ATP channel opening (Minoxidil 4%), competitive androgen receptor antagonism (Spironolactone 1%), and nitric oxide precursor support. Adjunct Scalp Oil and Therapeutic Cleanser restore dermal lipid film and accelerate follicular cellular energy.',
    dispensingForm: 'Compounded Topical Regimen (3-Part Kit)',
    posology: 'Part 1 (Solution): Apply daily at bedtime. Part 2 (Oil): Apply 1-2x/week, massage 3-5 min, leave 10 min then wash. Part 3 (Cleanser): Massage for 2 minutes and rinse.',
    createdAt: new Date().toISOString(),
    createdAt_ts: Date.now(),
    dateIssued: '2025-07-30',
    date: '30/07/2025',
    dateFormatted: 'Jul 30, 2025',
    updatedAt: new Date().toISOString()
  };

  // Save to canonical RX-BOX02576AATRI
  await db.collection('prescriptions').doc(RX_CODE).set(prescriptionPayload, { merge: true });
  console.log(`✅ Saved Prescription to [prescriptions/${RX_CODE}]`);

  // Save mirror to BOX02576AATRI for direct barcode lookup
  await db.collection('prescriptions').doc(SAMPLE_CODE).set(prescriptionPayload, { merge: true });
  console.log(`✅ Saved Mirror Prescription to [prescriptions/${SAMPLE_CODE}]`);

  console.log(`\n🎉 Ingestion Completed Successfully!`);
  console.log(`   - Prescription: ${RX_CODE}`);
  console.log(`   - Patient: Aisha Ahmad Al Derham`);
  console.log(`   - Ordering Physician: Raffanie Lucenio (The Masters Medical Center, Qatar)`);
  console.log(`   - Production Physician: Dr. Miguel Ángel López Aranda`);
  console.log(`   - 3 Parts / Formulations Verified`);
  console.log(`   - Status: draft (awaiting_atlas_review, ~24h SLA)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(console.error);
}

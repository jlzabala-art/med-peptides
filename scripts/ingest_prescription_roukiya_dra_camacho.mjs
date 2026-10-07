/**
 * scripts/ingest_prescription_roukiya_dra_camacho.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Ingestion for BHRT Prescription:
 *   - Patient: Roukiya M M AlMurjan (DOB: 30/08/1972 · Age: 53)
 *   - Prescribing Physician: Dra. Haydee Camacho Gamboa (COMB 46759)
 *   - Clinic: Clínica Dra. Camacho (Barcelona, España)
 *   - Regimen: Morning Formula – Estradiol (Transdermal) 1 mg in Pentravan®
 *   - Diagnosis: N95.1 – Menopausal and Perimenopausal Disorder
 *   - Dispense: 2-month supply (60 mL)
 *   - Status: draft (awaiting_atlas_review, ~24h SLA)
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

const CLINIC_ID = 'clinica-dra-camacho-barcelona';
const DOCTOR_ID = 'dra-haydee-camacho-gamboa';
const RX_CODE = 'RX-RMMA-2';
const RX_DOC_ID = 'rx_rmma_2';

export async function run() {
  console.log(`\n══════════════════════════════════════════════════════════════`);
  console.log(`🌸 Ingesting BHRT Prescription: Roukiya M M AlMurjan (${RX_CODE})`);
  console.log(`🏥 Clinic: Clínica Dra. Camacho (Barcelona, España)`);
  console.log(`👩‍⚕️ Prescribing Physician: Dra. Haydee Camacho Gamboa (COMB 46759)`);
  console.log(`══════════════════════════════════════════════════════════════\n`);

  // 1. Ensure Clinic: Clínica Dra. Camacho
  const clinicRef = db.collection('clinics').doc(CLINIC_ID);
  const clinicData = {
    id: CLINIC_ID,
    name: 'Clínica Dra. Camacho',
    legalName: 'Clínica Dra. Camacho - Medicina Estética, Longevidad y BHRT',
    website: 'https://dracamacho.com',
    phone: '+34 606 767 420',
    email: 'info@dracamacho.com',
    city: 'Barcelona',
    country: 'España',
    countryCode: 'ES',
    streetAddress: "Carrer d'Aribau 162-166, Entresuelo O, 08036 Barcelona",
    type: 'medical_clinic',
    status: 'active',
    specialties: [
      'Terapia Hormonal Bioidéntica (BHRT)',
      'Medicina Antienvejecimiento & Longevidad',
      'Medicina Estética Avanzada',
      'Salud Femenina y Manejo Menopáusico'
    ],
    doctorsCount: 1,
    doctorIds: [DOCTOR_ID],
    updatedAt: new Date().toISOString()
  };
  await clinicRef.set(clinicData, { merge: true });
  console.log(`✓ Updated Clinic record: [clinics/${CLINIC_ID}]`);

  // 2. Register Prescribing Doctor: Dra. Haydee Camacho Gamboa
  const docRef = db.collection('doctors').doc(DOCTOR_ID);
  const userRef = db.collection('users').doc(DOCTOR_ID);
  const doctorPayload = {
    id: DOCTOR_ID,
    slug: DOCTOR_ID,
    name: 'Dra. Haydee Camacho Gamboa',
    fullName: 'Dra. Haydee Camacho Gamboa',
    displayName: 'Dra. Haydee Camacho Gamboa',
    title: 'Dra.',
    role: 'doctor',
    email: 'info@dracamacho.com',
    specialty: 'Terapia Hormonal Bioidéntica (BHRT) & Medicina Antienvejecimiento',
    clinic: 'Clínica Dra. Camacho',
    clinicName: 'Clínica Dra. Camacho',
    clinicId: CLINIC_ID,
    address: "Carrer d'Aribau 162-166, Entresuelo O",
    city: 'Barcelona',
    country: 'España',
    phone: '+34 606 767 420',
    clinicPhone: '+34 606 767 420',
    website: 'https://dracamacho.com',
    license: 'COMB 46759',
    authority: 'COMB',
    status: 'active',
    updatedAt: new Date().toISOString()
  };
  await docRef.set(doctorPayload, { merge: true });
  await userRef.set(doctorPayload, { merge: true });
  console.log(`✓ Registered Doctor: [doctors/${DOCTOR_ID}] and [users/${DOCTOR_ID}]`);

  // 3. Build Formulation Parts (Transdermal BHRT Estradiol in Pentravan)
  const parts = [
    {
      partNumber: 1,
      totalParts: 1,
      title: 'Morning Formula – Estradiol Transdermal Cream (Pentravan®)',
      badge: 'PART 1 OF 1 · TRANSDERMAL BHRT',
      format: 'Transdermal Liposomal Cream (Airless Metering Pump)',
      volume: '60 mL',
      vehicle: 'Pentravan® Liposomal HRT Vehicle (q.s.p. 1 mL / 60 mL total)',
      posology: 'Apply 1 mL (1 pump) every morning to clean, dry, hairless skin. Recommended sites: inner thigh, lower abdomen, or behind the knee.',
      directions: 'Apply 1 mL (1 pump) every morning to clean, dry, hairless skin. Rotate sites daily and avoid washing for 2 hours.',
      accentColor: '#ec4899',
      accentBg: '#fdf2f8',
      borderAccent: '#fbcfe8',
      apis: [
        {
          id: 'api-estradiol-1',
          name: 'Estradiol (micronized, bioidentical)',
          dose: '1 mg / mL',
          concentration: '1 mg/mL',
          percentage: '0.1%',
          pharmacologicalClass: 'Bioidentical Estrogen / Nuclear ER-alpha & ER-beta Agonist',
          therapeuticClass: 'Systemic Endocrine Hormone Replacement (BHRT)',
          clinicalIndication: 'Menopausal & Perimenopausal Disorder (ICD-10 N95.1)',
          cellularTarget: 'Nuclear Estrogen Receptors (ERα / ERβ) & GPER1',
          mechanismOfAction: 'Micronized 17-beta-estradiol bioidentical to endogenous ovarian hormone. Transdermal liposomal delivery avoids hepatic first-pass metabolism, reducing thromboembolic and hepatic risk while restoring physiological premenopausal circulating estradiol levels.'
        },
        {
          id: 'api-pentravan-base',
          name: 'Pentravan® Base',
          dose: 'q.s.p. 1 mL (60 mL total)',
          isVehicleOrBase: true,
          pharmacologicalClass: 'Patented Liposomal Transdermal Carrier',
          therapeuticClass: 'BHRT Penetration Enhancing Base',
          clinicalIndication: 'Transdermal Delivery without Systemic Gut-Hepatic Degradation',
          cellularTarget: 'Stratum Corneum & Subcutaneous Capillary Beds',
          mechanismOfAction: 'Vanishing liposomal cream formulation with physiological lipids designed to drive lipophilic bioidentical hormones across the stratum corneum for steady sustained release.'
        }
      ]
    }
  ];

  const items = [
    {
      name: 'Estradiol (micronized, bioidentical)',
      dose: '1 mg',
      dosage: '1 mg',
      activeIngredient: '17β-Estradiol',
      pharmacologicalClass: 'Bioidentical Estrogen',
      mechanismOfAction: 'Physiological ERα/ERβ agonist replacing diminished ovarian estrogen, relieving vasomotor symptoms and preserving bone mineral density.',
      formulationBlock: 'Morning Formula – Estradiol Transdermal Cream',
      formulationIndex: 1,
      blockVolume: '60 mL'
    },
    {
      name: 'Pentravan® Base',
      dose: 'q.s.p. 1 mL',
      dosage: 'q.s.p. 1 mL',
      activeIngredient: 'Pentravan',
      isVehicleOrBase: true,
      pharmacologicalClass: 'Liposomal Transdermal Vehicle',
      mechanismOfAction: 'Facilitates controlled cutaneous absorption of micronized steroid hormones.',
      formulationBlock: 'Morning Formula – Estradiol Transdermal Cream',
      formulationIndex: 1,
      blockVolume: '60 mL'
    }
  ];

  const prescriptionPayload = {
    prescriptionId: RX_DOC_ID,
    prescriptionCode: RX_CODE,
    code: RX_CODE,
    id: RX_DOC_ID,
    patientName: 'Roukiya M M AlMurjan',
    patient: {
      name: 'Roukiya M M AlMurjan',
      fullName: 'Roukiya M M AlMurjan',
      id: 'pat_roukiya_almurjan',
      patientId: 'pat_roukiya_almurjan',
      dob: '30/08/1972',
      birthDate: '1972-08-30',
      age: 53,
      gender: 'Female'
    },
    patientId: 'pat_roukiya_almurjan',
    patientDob: '30/08/1972',
    patientAge: 53,
    patientGender: 'Female',
    orderingPhysician: {
      name: 'Dra. Haydee Camacho Gamboa',
      license: 'COMB 46759',
      authority: 'COMB',
      email: 'info@dracamacho.com',
      clinic: 'Clínica Dra. Camacho',
      clinicId: CLINIC_ID,
      phone: '+34 606 767 420',
      city: 'Barcelona',
      country: 'España'
    },
    doctorName: 'Dra. Haydee Camacho Gamboa',
    doctorSlug: DOCTOR_ID,
    doctorId: DOCTOR_ID,
    doctorLicense: 'COMB 46759',
    doctorAuthority: 'COMB',
    doctor: {
      id: DOCTOR_ID,
      name: 'Dra. Haydee Camacho Gamboa',
      title: 'Dra.',
      email: 'info@dracamacho.com',
      license: 'COMB 46759',
      specialty: 'Terapia Hormonal Bioidéntica (BHRT) & Medicina Antienvejecimiento',
      clinic: 'Clínica Dra. Camacho',
      clinicId: CLINIC_ID,
      city: 'Barcelona',
      country: 'España'
    },
    treatingDoctor: {
      name: 'Dra. Haydee Camacho Gamboa',
      clinic: 'Clínica Dra. Camacho',
      email: 'info@dracamacho.com',
      phone: '+34 606 767 420',
      city: 'Barcelona',
      country: 'España'
    },
    hasTreatingDoctor: true,
    clinic: 'Clínica Dra. Camacho',
    clinicName: 'Clínica Dra. Camacho',
    clinicId: CLINIC_ID,
    clinicAddress: "Carrer d'Aribau 162-166, Entresuelo O, 08036 Barcelona",
    clinicPhone: '+34 606 767 420',
    clinicWebsite: 'https://dracamacho.com',
    treatmentProgram: 'Bioidentical Hormone Therapy (BHRT)',
    treatmentType: 'BHRT Compounded Transdermal Cream',
    treatmentTitle: 'Morning Formula – Estradiol (Transdermal)',
    diagnosis: 'N95.1 – Menopausal and Perimenopausal Disorder',
    duration: '2 months',
    dispense: '2-month supply (60 mL airless metering pump)',
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
    totalApisCount: 1,
    totalVehiclesCount: 1,
    totalParts: 1,
    summary: 'Bioidentical Hormone Replacement Therapy (BHRT) formulation with micronized 17-beta-estradiol (1 mg/mL) in liposomal Pentravan® base for physiological estrogen replenishment.',
    clinicalNotes: 'Indicated for vasomotor symptoms, sleep disruption, and prevention of bone mineral density decline in peri/post-menopause. Formulated in liposomal Pentravan to bypass first-pass hepatic metabolism and prevent prothrombotic hepatic induction.',
    dispensingForm: 'Transdermal Liposomal Cream (Airless Pump 60 mL)',
    posology: 'Apply 1 mL (1 pump) every morning to clean, dry, hairless skin. Inner thigh, lower abdomen, or behind the knee.',
    applicationSites: 'Inner thigh, lower abdomen, or behind the knee.',
    clinicalInstructions: [
      'Apply 1 mL (1 pump) every morning to clean, dry, hairless skin.',
      'Recommended sites: inner thigh, lower abdomen, or behind the knee.',
      'Avoid washing the area for at least 2 hours after application.',
      'Rotate sites daily to minimize skin sensitization and optimize absorption.',
      'Avoid direct skin contact with others after application to prevent cross-contamination.'
    ],
    dateIssued: '2026-06-22',
    date: '22/06/2026',
    dateFormatted: 'Jun 22, 2026',
    createdAt: new Date().toISOString(),
    createdAt_ts: Date.now(),
    updatedAt: new Date().toISOString()
  };

  // Save to rx_rmma_2
  await db.collection('prescriptions').doc(RX_DOC_ID).set(prescriptionPayload, { merge: true });
  console.log(`✅ Saved / Updated Prescription in [prescriptions/${RX_DOC_ID}]`);

  // Also save to RX-RMMA-2
  await db.collection('prescriptions').doc(RX_CODE).set(prescriptionPayload, { merge: true });
  console.log(`✅ Saved Mirror Prescription in [prescriptions/${RX_CODE}]`);

  console.log(`\n🎉 Ingestion Completed Successfully!`);
  console.log(`   - Prescription: ${RX_CODE}`);
  console.log(`   - Patient: Roukiya M M AlMurjan (Age 53, DOB 30/08/1972)`);
  console.log(`   - Prescribing Physician: Dra. Haydee Camacho Gamboa (COMB 46759)`);
  console.log(`   - Clinic: Clínica Dra. Camacho (Barcelona, España)`);
  console.log(`   - Formulation: Estradiol 1 mg in Pentravan® (60 mL - 2-Month Supply)`);
  console.log(`   - Status: draft (awaiting_atlas_review, ~24h SLA)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(console.error);
}

/**
 * scripts/import_qatar_prescriptions.mjs
 *
 * Ingests/updates the Qatar TrichoTest prescriptions & lab results:
 * - Doctor: Dr. Raffanie Lucenio (raffanie-lucenio, The Masters Medical Center, Doha, Qatar)
 * - Dates: Test Completion Date (Genetic results date)
 *   1. BOX03051AATRI - Azza Awad Al-mejali (Results Date: 02-02-2026)
 *   2. BOX03055AATRI - Salwa Saeed Alkubaisi (Results Date: 11-11-2025)
 *   3. BOX02571AATRI - Maryam Mohammed Al-Sulaiti (Results Date: 09-07-2025)
 *   4. BOX02566AATRI - Sara Khalid Al-meadadi (Results Date: 14-05-2025)
 *   5. BOX02550AATRI - Aisha Mohammed Alsulaiti (Results Date: 22-11-2024)
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sa = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../serviceAccount-target.json'), 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(sa)
  });
}

const db = admin.firestore();

const QATAR_DOCTOR = {
  id: 'raffanie-lucenio',
  name: 'Dr. Raffanie Lucenio',
  fullName: 'Dr. Raffanie Lucenio',
  title: 'Consultant Dermatologist & Trichologist',
  email: 'raffanie@themasters.qa',
  contactEmail: 'raffanie@themasters.qa',
  clinicId: 'the-masters-medical-center',
  clinicName: 'The Masters Medical Center',
  specialty: 'Dermatology, Trichology & Aesthetic Medicine',
  city: 'Doha',
  country: 'Qatar',
  countryCode: 'QA',
  status: 'approved',
  wholeseller: 'YDL',
  wholesalerId: 'clinic-ydl-dubai'
};

const QATAR_CLINIC = {
  id: 'the-masters-medical-center',
  name: 'The Masters Medical Center',
  legalName: 'The Masters Medical Center W.L.L.',
  code: 'MASTERS-QA',
  email: 'raffanie@themasters.qa',
  supervisingDoctor: 'Dr. Raffanie Lucenio',
  supervisingDoctorId: 'raffanie-lucenio',
  city: 'Doha',
  country: 'Qatar',
  countryCode: 'QA',
  type: 'dermatology_trichology_center',
  wholeseller: 'YDL',
  wholesalerId: 'clinic-ydl-dubai',
  wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
  status: 'active'
};

const QATAR_TESTS = [
  // 1. Azza Awad Al-mejali
  {
    code: 'BOX03051AATRI',
    patient: {
      id: 'patient-azza-awad-al-mejali',
      name: 'Azza Awad Al-mejali',
      dob: '28-12-1970',
      gender: 'Female',
      patientId: '27063402779'
    },
    dates: {
      receivedDateSlash: '28-01-2026',
      receivedDateISO: '2026-01-28T09:00:00.000Z',
      testEndDateSlash: '02-02-2026',
      testEndDateISO: '2026-02-02T10:30:00.000Z'
    },
    formulations: [
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Targeted Micronutrient & Oral Bioactive Complex',
        dispensingForm: 'Oral Vegetarian Capsules',
        volume: '90 capsules (3-month supply)',
        posology: '1 capsule per day, 90 capsules for 3 months',
        customsTariffCode: '2106.90.98',
        customsDescription: 'Food supplement antioxidant vitamin capsules — Non-medicinal',
        ingredients: [
          { name: 'Oral Minoxidil (woman)', dose: '1 mg' },
          { name: 'Astaxanthin', dose: '10 mg' },
          { name: 'Vitamin B12 (Cyanocobalamin)', dose: '1000 mcg' }
        ]
      },
      {
        treatmentType: 'Topical treatment',
        treatmentProgram: 'Customized Dermocosmetic Follicular Solution in TrichoSol',
        dispensingForm: 'Topical Solution Dispenser',
        volume: '100 mL',
        vehicle: 'TrichoSol™ 100mL',
        posology: 'Apply at night before bedtime. Leave solution on scalp as long as possible. Wash scalp next day.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Topical scalp restorative lotion preparation — Non-medicinal cosmetic',
        ingredients: [
          { name: 'Latanoprost Fagron', dose: '0.005 %' },
          { name: 'Melatonin', dose: '0.1 %' },
          { name: 'L-Carnitine L-tartrate', dose: '2 %' },
          { name: 'TrichoSol™ Base', dose: 'c.s.p 100 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene (Oil)',
        treatmentProgram: 'Nutritional Lipid Scalp Conditioning Drops in TrichoOil',
        dispensingForm: 'Dropper Bottle',
        volume: '30 mL',
        vehicle: 'TrichoOil™ 30mL',
        posology: '1-2 times / week, massage 3-5 minutes and leave on 10 min before washing.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Scalp conditioning cosmetic botanical oil blend — Non-medicinal',
        ingredients: [
          { name: 'Vitamin E (Tocopherol)', dose: '5 %' },
          { name: 'TrichoOil™ Base', dose: 'c.s.p 30 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene (Cleanser)',
        treatmentProgram: 'Bioactive Scalp Cleansing Wash in TrichoWash',
        dispensingForm: 'Shampoo Dispenser',
        volume: '250 mL',
        vehicle: 'TrichoWash™ 250mL',
        posology: 'Massage for 2 minutes and rinse thoroughly.',
        customsTariffCode: '3305.10.00',
        customsDescription: 'Dermatological hair and scalp shampoo cleanser — Non-medicinal',
        ingredients: [
          { name: 'Arginine', dose: '1.5 %' },
          { name: 'Retinol palmitate', dose: '1 %' },
          { name: 'D-Panthenol', dose: '0.5 %' },
          { name: 'TrichoWash™ Base', dose: 'c.s.p 250 mL', isVehicle: true }
        ]
      }
    ]
  },

  // 2. Salwa Saeed Alkubaisi
  {
    code: 'BOX03055AATRI',
    patient: {
      id: 'patient-salwa-saeed-alkubaisi',
      name: 'Salwa Saeed Alkubaisi',
      dob: '28-05-1986',
      gender: 'Female',
      patientId: '28663402905'
    },
    dates: {
      receivedDateSlash: '06-11-2025',
      receivedDateISO: '2025-11-06T09:00:00.000Z',
      testEndDateSlash: '11-11-2025',
      testEndDateISO: '2025-11-11T11:00:00.000Z'
    },
    formulations: [
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Targeted Micronutrient & Antioxidant Mineral Complex',
        dispensingForm: 'Oral Vegetarian Capsules',
        volume: '90 capsules (3-month supply)',
        posology: '1 capsule per day, 90 capsules for 3 months',
        customsTariffCode: '2106.90.98',
        customsDescription: 'Food supplement antioxidant mineral capsules — Non-medicinal',
        ingredients: [
          { name: 'Oral Minoxidil (woman)', dose: '1 mg' },
          { name: 'Zinc sulfate', dose: '50 mg' },
          { name: 'Selenium yeast', dose: '80 mg' },
          { name: 'Oral Finasteride (woman)', dose: '4.25 mg' },
          { name: 'Vitamin B12 (Cyanocobalamin)', dose: '1000 mcg' }
        ]
      },
      {
        treatmentType: 'Topical treatment',
        treatmentProgram: 'Customized Dermocosmetic Scalp Restorative Solution in TrichoSol',
        dispensingForm: 'Topical Solution Dispenser',
        volume: '100 mL',
        vehicle: 'TrichoSol™ 100mL',
        posology: 'Apply at night before bedtime. Leave solution on scalp as long as possible. Wash scalp next day.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Topical scalp restorative lotion preparation — Non-medicinal cosmetic',
        ingredients: [
          { name: 'Latanoprost Fagron', dose: '0.005 %' },
          { name: 'Spironolactone', dose: '1 %' },
          { name: 'Arginine', dose: '1.5 %' },
          { name: 'TrichoSol™ Base', dose: 'c.s.p 100 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene (Oil)',
        treatmentProgram: 'Nutritional Lipid Scalp Conditioning Drops in TrichoOil',
        dispensingForm: 'Dropper Bottle',
        volume: '30 mL',
        vehicle: 'TrichoOil™ 30mL',
        posology: '1-2 times / week, massage 3-5 minutes and leave on 10 min before washing.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Scalp conditioning cosmetic botanical oil blend — Non-medicinal',
        ingredients: [
          { name: 'Ginkgo biloba', dose: '2 %' },
          { name: 'Vitamin E (Tocopherol)', dose: '5 %' },
          { name: 'TrichoOil™ Base', dose: 'c.s.p 30 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene (Cleanser)',
        treatmentProgram: 'Bioactive Dandruff & Scalp Wash in TrichoWash',
        dispensingForm: 'Shampoo Dispenser',
        volume: '250 mL',
        vehicle: 'TrichoWash™ 250mL',
        posology: 'Massage for 2 minutes and rinse thoroughly.',
        customsTariffCode: '3305.10.00',
        customsDescription: 'Dermatological hair and scalp shampoo cleanser — Non-medicinal',
        ingredients: [
          { name: 'Zinc Pyrithione', dose: '2 %' },
          { name: 'D-Panthenol', dose: '0.5 %' },
          { name: 'TrichoWash™ Base', dose: 'c.s.p 250 mL', isVehicle: true }
        ]
      }
    ]
  },

  // 3. Maryam Mohammed Al-Sulaiti
  {
    code: 'BOX02571AATRI',
    patient: {
      id: 'patient-maryam-mohammed-al-sulaiti',
      name: 'Maryam Mohammed Al-Sulaiti',
      dob: '05-02-1989',
      gender: 'Female',
      patientId: '28963402049'
    },
    dates: {
      receivedDateSlash: '01-07-2025',
      receivedDateISO: '2025-07-01T09:00:00.000Z',
      testEndDateSlash: '09-07-2025',
      testEndDateISO: '2025-07-09T10:00:00.000Z'
    },
    formulations: [
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Targeted Antioxidant & Saw Palmetto Botanical Complex',
        dispensingForm: 'Oral Vegetarian Capsules',
        volume: '90 capsules (3-month supply)',
        posology: '1 capsule per day, 90 capsules for 3 months',
        customsTariffCode: '2106.90.98',
        customsDescription: 'Dietary antioxidant herbal and mineral capsules — Non-medicinal',
        ingredients: [
          { name: 'Astaxanthin', dose: '10 mg' },
          { name: 'Saw Palmetto', dose: '200 mg' },
          { name: 'Vitamin B12 (Cyanocobalamin)', dose: '1000 mcg' },
          { name: 'Selenium yeast', dose: '100 mg' }
        ]
      },
      {
        treatmentType: 'Topical treatment',
        treatmentProgram: 'Customized Dermocosmetic Scalp Restorative Foam in TrichoFoam',
        dispensingForm: 'Topical Foam Dispenser',
        volume: '100 mL',
        vehicle: 'TrichoFoam™ 100mL',
        posology: 'Apply at night before bedtime with gentle massage on scalp. Wash scalp next day.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Topical scalp restorative cosmetic foam — Non-medicinal preparation',
        ingredients: [
          { name: 'Finasteride', dose: '0.25 %' },
          { name: 'D-Panthenol', dose: '0.5 %' },
          { name: 'TrichoFoam™ Base', dose: 'c.s.p 100 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene (Oil)',
        treatmentProgram: 'Retinol Scalp Conditioning Drops in TrichoOil',
        dispensingForm: 'Dropper Bottle',
        volume: '30 mL',
        vehicle: 'TrichoOil™ 30mL',
        posology: '1-2 times / week, massage 3-5 minutes and leave on 10 min before washing.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Scalp conditioning cosmetic botanical oil blend — Non-medicinal',
        ingredients: [
          { name: 'Retinol palmitate', dose: '1 %' },
          { name: 'TrichoOil™ Base', dose: 'c.s.p 30 mL', isVehicle: true }
        ]
      }
    ]
  },

  // 4. Sara Khalid Al-meadadi
  {
    code: 'BOX02566AATRI',
    patient: {
      id: 'patient-sara-khalid-al-meadadi',
      name: 'Sara Khalid Al-meadadi',
      dob: '13-08-1987',
      gender: 'Female',
      patientId: '28763401812'
    },
    dates: {
      receivedDateSlash: '08-05-2025',
      receivedDateISO: '2025-05-08T09:00:00.000Z',
      testEndDateSlash: '14-05-2025',
      testEndDateISO: '2025-05-14T11:00:00.000Z'
    },
    formulations: [
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Targeted Keratin Bio-Silica & Zinc Capsule Complex',
        dispensingForm: 'Oral Vegetarian Capsules',
        volume: '90 capsules (3-month supply)',
        posology: '1 capsule per day, 90 capsules for 3 months',
        customsTariffCode: '2106.90.98',
        customsDescription: 'Dietary organic silica & zinc food supplement capsules — Non-medicinal',
        ingredients: [
          { name: 'Zinc sulfate', dose: '50 mg' },
          { name: 'Oral SiliciuMax TM', dose: '250 mg' },
          { name: 'Vitamin B12 (Cyanocobalamin)', dose: '1000 mcg' },
          { name: 'Cystine', dose: '100 mg' }
        ]
      },
      {
        treatmentType: 'Topical treatment',
        treatmentProgram: 'Customized Dermocosmetic Scalp Restorative Solution in TrichoSol',
        dispensingForm: 'Topical Solution Dispenser',
        volume: '100 mL',
        vehicle: 'TrichoSol™ 100mL',
        posology: 'Apply at night before bedtime. Leave solution on scalp as long as possible. Wash scalp next day.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Topical scalp restorative lotion preparation — Non-medicinal cosmetic',
        ingredients: [
          { name: 'Minoxidil', dose: '5 %' },
          { name: 'Dutasteride', dose: '0.25 %' },
          { name: 'Arginine', dose: '1.5 %' },
          { name: 'TrichoSol™ Base', dose: 'c.s.p 100 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene (Oil)',
        treatmentProgram: 'Nutritional Lipid Scalp Conditioning Drops in TrichoOil',
        dispensingForm: 'Dropper Bottle',
        volume: '30 mL',
        vehicle: 'TrichoOil™ 30mL',
        posology: '1-2 times / week, massage 3-5 minutes and leave on 10 min before washing.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Scalp conditioning cosmetic botanical oil blend — Non-medicinal',
        ingredients: [
          { name: 'Ginkgo biloba', dose: '2 %' },
          { name: 'Vitamin E (Tocopherol)', dose: '5 %' },
          { name: 'TrichoOil™ Base', dose: 'c.s.p 30 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene (Cleanser)',
        treatmentProgram: 'Provitamin B5 Scalp Wash in TrichoWash',
        dispensingForm: 'Shampoo Dispenser',
        volume: '250 mL',
        vehicle: 'TrichoWash™ 250mL',
        posology: 'Massage for 2 minutes and rinse thoroughly.',
        customsTariffCode: '3305.10.00',
        customsDescription: 'Dermatological hair and scalp shampoo cleanser — Non-medicinal',
        ingredients: [
          { name: 'D-Panthenol', dose: '0.5 %' },
          { name: 'TrichoWash™ Base', dose: 'c.s.p 250 mL', isVehicle: true }
        ]
      }
    ]
  },

  // 5. Aisha Mohammed Alsulaiti
  {
    code: 'BOX02550AATRI',
    patient: {
      id: 'patient-aisha-mohammed-alsulaiti',
      name: 'Aisha Mohammed Alsulaiti',
      dob: '24-03-1982',
      gender: 'Female',
      patientId: '28263402782'
    },
    dates: {
      receivedDateSlash: '15-11-2024',
      receivedDateISO: '2024-11-15T09:00:00.000Z',
      testEndDateSlash: '22-11-2024',
      testEndDateISO: '2024-11-22T10:00:00.000Z'
    },
    formulations: [
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Targeted Herbal & Micronutrient Antioxidant Complex',
        dispensingForm: 'Oral Vegetarian Capsules',
        volume: '90 capsules (3-month supply)',
        posology: '1 capsule per day, 90 capsules for 3 months',
        customsTariffCode: '2106.90.98',
        customsDescription: 'Food supplement antioxidant capsules — Non-medicinal',
        ingredients: [
          { name: 'Selenium yeast', dose: '80 mg' },
          { name: 'Saw Palmetto', dose: '200 mg' },
          { name: 'Vitamin B12 (Cyanocobalamin)', dose: '1000 mcg' }
        ]
      },
      {
        treatmentType: 'Topical treatment',
        treatmentProgram: 'Customized Dermocosmetic Scalp Restorative Solution in TrichoSol',
        dispensingForm: 'Topical Solution Dispenser',
        volume: '100 mL',
        vehicle: 'TrichoSol™ 100mL',
        posology: 'Apply at night before bedtime. Leave solution on scalp as long as possible. Wash scalp next day.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Topical scalp restorative cosmetic lotion — Non-medicinal',
        ingredients: [
          { name: 'Minoxidil', dose: '4 %' },
          { name: 'Spironolactone', dose: '1 %' },
          { name: 'IGrantine-F1 TM', dose: '0.25 %' },
          { name: 'TrichoSol™ Base', dose: 'c.s.p 100 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene (Cleanser)',
        treatmentProgram: 'Provitamin B5 Scalp Wash in TrichoWash',
        dispensingForm: 'Shampoo Dispenser',
        volume: '250 mL',
        vehicle: 'TrichoWash™ 250mL',
        posology: 'Massage for 2 minutes and rinse thoroughly.',
        customsTariffCode: '3305.10.00',
        customsDescription: 'Dermatological hair and scalp shampoo cleanser — Non-medicinal',
        ingredients: [
          { name: 'D-Panthenol', dose: '0.5 %' },
          { name: 'TrichoWash™ Base', dose: 'c.s.p 250 mL', isVehicle: true }
        ]
      }
    ]
  }
];

async function run() {
  console.log('🚀 [Qatar Import] Registering Doctor & Clinic for Qatar...');

  // 1. Doctor & Clinic
  await db.collection('physicians').doc(QATAR_DOCTOR.id).set({
    ...QATAR_DOCTOR,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log(`   ✅ Qatar Doctor upserted: ${QATAR_DOCTOR.name} (${QATAR_DOCTOR.email})`);

  await db.collection('clinics').doc(QATAR_CLINIC.id).set({
    ...QATAR_CLINIC,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log(`   ✅ Qatar Clinic upserted: ${QATAR_CLINIC.name} (Doha, Qatar)`);

  // 2. Ingest all tests
  for (const t of QATAR_TESTS) {
    console.log(`\n📦 Ingesting ${t.code} for ${t.patient.name} (Test End Date: ${t.dates.testEndDateSlash})...`);

    // A. Patient
    await db.collection('patients').doc(t.patient.id).set({
      id: t.patient.id,
      name: t.patient.name,
      fullName: t.patient.name,
      dob: t.patient.dob,
      dateOfBirth: t.patient.dob,
      gender: t.patient.gender,
      patientId: t.patient.patientId,
      sampleCode: t.code,
      sampleType: 'Buccal Swab',
      country: 'Qatar',
      countryCode: 'QA',
      city: 'Doha',
      doctorId: QATAR_DOCTOR.id,
      doctorName: QATAR_DOCTOR.name,
      doctorEmail: QATAR_DOCTOR.email,
      clinicId: QATAR_CLINIC.id,
      clinicName: QATAR_CLINIC.name,
      wholeseller: 'YDL',
      wholesalerId: 'clinic-ydl-dubai',
      status: 'active',
      activePrescriptionId: `RX-${t.code}`,
      prescriptions: [`RX-${t.code}`],
      labResults: [t.code],
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`   ✓ Patient record: ${t.patient.id}`);

    // B. Lab Result
    await db.collection('lab_results').doc(t.code).set({
      id: t.code,
      code: t.code,
      sampleCode: t.code,
      testCode: t.code,
      testType: 'TrichoTest',
      testName: 'Fagron TrichoTest™ Pharmacogenetic Hair Loss DNA Analysis',
      category: 'genomics',
      biomarkerCategory: 'trichology_pharmacogenetics',
      dates: {
        receivedDate: t.dates.receivedDateSlash,
        receivedTimestamp: t.dates.receivedDateISO,
        resultsDate: t.dates.testEndDateSlash,
        resultsTimestamp: t.dates.testEndDateISO,
        testEndDate: t.dates.testEndDateSlash,
        testEndTimestamp: t.dates.testEndDateISO
      },
      patient: {
        id: t.patient.id,
        name: t.patient.name,
        fullName: t.patient.name,
        dob: t.patient.dob,
        gender: t.patient.gender,
        patientId: t.patient.patientId
      },
      patientName: t.patient.name,
      patientId: t.patient.id,
      patientDob: t.patient.dob,
      doctor: {
        id: QATAR_DOCTOR.id,
        name: QATAR_DOCTOR.name,
        email: QATAR_DOCTOR.email,
        specialty: QATAR_DOCTOR.specialty,
        clinicName: QATAR_CLINIC.name,
        clinicId: QATAR_CLINIC.id
      },
      doctorName: QATAR_DOCTOR.name,
      doctorId: QATAR_DOCTOR.id,
      doctorEmail: QATAR_DOCTOR.email,
      clinicName: QATAR_CLINIC.name,
      clinicId: QATAR_CLINIC.id,
      wholeseller: 'YDL',
      wholesalerId: 'clinic-ydl-dubai',
      country: 'Qatar',
      countryCode: 'QA',
      laboratory: {
        name: 'Fagron Genomics S.L.U.',
        address: 'C/ de les Cosidores, 150, 08226 Terrassa, Barcelona (Spain)',
        country: 'Spain',
        standards: 'Regulation (EU) 2017/746 / CE-IVD',
        license: 'SRN: ES-MF-000001092'
      },
      formulations: t.formulations,
      status: 'completed',
      createdAt: t.dates.testEndDateISO,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`   ✓ Lab result doc: ${t.code}`);

    // C. Prescription Record
    const rxId = `RX-${t.code}`;
    await db.collection('prescriptions').doc(rxId).set({
      id: rxId,
      code: rxId,
      prescriptionCode: rxId,
      sampleCode: t.code,
      protocolNumber: t.code,
      protocolCode: t.code,
      date: t.dates.testEndDateSlash,
      prescriptionDate: t.dates.testEndDateSlash,
      resultsDate: t.dates.testEndDateISO,
      dateIssued: t.dates.testEndDateISO,
      mfgDate: t.dates.testEndDateISO,
      prodDate: t.dates.testEndDateISO,
      patientName: t.patient.name,
      patientId: t.patient.id,
      patient: {
        name: t.patient.name,
        dob: t.patient.dob,
        gender: t.patient.gender,
        patientId: t.patient.patientId
      },
      doctorName: QATAR_DOCTOR.name,
      doctorId: QATAR_DOCTOR.id,
      doctorEmail: QATAR_DOCTOR.email,
      doctorSpecialty: QATAR_DOCTOR.specialty,
      doctor: {
        name: QATAR_DOCTOR.name,
        id: QATAR_DOCTOR.id,
        email: QATAR_DOCTOR.email,
        clinicName: QATAR_CLINIC.name,
        clinicId: QATAR_CLINIC.id
      },
      clinicName: QATAR_CLINIC.name,
      clinicId: QATAR_CLINIC.id,
      wholesalerId: 'clinic-ydl-dubai',
      wholeseller: 'YDL',
      wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
      country: 'Qatar',
      countryCode: 'QA',
      treatmentProgram: 'Fagron TrichoTest',
      treatmentTitle: 'TrichoTest™ Personalized Pharmacogenetic Hair Restoration Protocol',
      regimenCategory: 'Follicular Trichology & Hair Restoration',
      regimenCategoryId: 'trichology_rx',
      regimenCategoryCode: 'TRICHO-RX',
      regimenShortTitle: 'TrichoTest',
      regimenCategoryShort: 'Compounded Trichology & Nutraceutical',
      formulations: t.formulations,
      status: 'approved',
      validationStatus: 'Ready',
      importSource: 'fagron_genomics_qatar',
      sourceType: 'fagron_genomics',
      createdAt: t.dates.testEndDateISO,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`   ✓ Prescription doc: ${rxId} with End Date ${t.dates.testEndDateSlash}`);
  }

  console.log('\n✨ [Import Complete] All Qatar prescriptions and lab results successfully synchronized in Firestore.');
}

run().catch(err => {
  console.error('❌ Error during Qatar import:', err);
  process.exit(1);
});

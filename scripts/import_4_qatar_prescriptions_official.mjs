/**
 * scripts/import_4_qatar_prescriptions_official.mjs
 *
 * Imports the 4 Qatar TrichoTest prescriptions provided by the user:
 * 1. Turky Bakhit S A Al-shahwani (BOX02574AATRI) - Test End Date: 09-07-2025
 * 2. Aisha Mohammed Alsulaiti (BOX02550AATRI) - Test End Date: 22-11-2024
 * 3. Maryam Mohammed Al-Sulaiti (BOX02571AATRI) - Test End Date: 09-07-2025
 * 4. Abdulrahman Darwish Fakhro (BOX03054AATRI) - Test End Date: 03-10-2025
 *
 * Doctor: Dr. Raffanie Lucenio (raffanie-lucenio)
 * Clinic: The Masters Medical Center (Doha, Qatar)
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

const QATAR_OFFICIAL_4 = [
  // 1. Turky Bakhit S A Al-shahwani
  {
    code: 'BOX02574AATRI',
    patient: {
      id: 'patient-turky-bakhit-al-shahwani',
      name: 'Turky Bakhit S A Al-shahwani',
      dob: '15-10-1994',
      gender: 'Male',
      patientId: '29463404129',
      age: 30
    },
    dates: {
      receivedDateSlash: '01-07-2025',
      receivedDateISO: '2025-07-01T09:00:00.000Z',
      testEndDateSlash: '09-07-2025',
      testEndDateISO: '2025-07-09T14:34:31.000Z'
    },
    formulations: [
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Targeted Micronutrient & Folate Co-Factor Complex',
        dispensingForm: 'Oral Vegetarian Capsules',
        volume: '90 capsules (3-month supply)',
        posology: '1 capsule per day, 90 capsules for 3 months',
        customsTariffCode: '2106.90.98',
        customsDescription: 'Food supplement antioxidant vitamin capsules — Non-medicinal',
        ingredients: [
          { name: 'Vitamin B12 (Cyanocobalamin)', dose: '1000 mcg', score: '100%' },
          { name: 'Vitamin B9 (Folate)', dose: '4 mg', score: '67%' }
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
        customsDescription: 'Topical scalp restorative cosmetic lotion — Non-medicinal preparation',
        ingredients: [
          { name: 'Prostaquinon TM', dose: '3 %', score: '50%' },
          { name: 'Spironolactone', dose: '1 %', score: '65%' },
          { name: 'IGrantine-F1 TM', dose: '0.25 %', score: '67%' },
          { name: 'TrichoSol™ Base', dose: 'c.s.p 100 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene',
        treatmentProgram: 'Nutritional Lipid Scalp Conditioning Drops in TrichoOil',
        dispensingForm: 'Dropper Bottle',
        volume: '30 mL',
        vehicle: 'TrichoOil™ 30mL',
        posology: '1-2 times / week, massage for 3-5 minutes and leave on 10 min before washing hair.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Scalp conditioning cosmetic botanical oil blend — Non-medicinal',
        ingredients: [
          { name: 'Vitamin E (Tocopherol)', dose: '5 %', score: '100%' },
          { name: 'TrichoOil™ Base', dose: 'c.s.p 30 mL', isVehicle: true }
        ]
      }
    ]
  },

  // 2. Aisha Mohammed Alsulaiti
  {
    code: 'BOX02550AATRI',
    patient: {
      id: 'patient-aisha-mohammed-alsulaiti',
      name: 'Aisha Mohammed Alsulaiti',
      dob: '24-03-1982',
      gender: 'Female',
      patientId: '28263402782',
      age: 42
    },
    dates: {
      receivedDateSlash: '15-11-2024',
      receivedDateISO: '2024-11-15T09:00:00.000Z',
      testEndDateSlash: '22-11-2024',
      testEndDateISO: '2024-11-22T14:18:29.000Z'
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
          { name: 'Selenium yeast', dose: '80 mg', score: '57%' },
          { name: 'Saw Palmetto', dose: '200 mg', score: '53%' },
          { name: 'Vitamin B12 (Cyanocobalamin)', dose: '1000 mcg', score: '100%' }
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
          { name: 'Minoxidil', dose: '4 %', score: '66%' },
          { name: 'Spironolactone', dose: '1 %', score: '100%' },
          { name: 'IGrantine-F1 TM', dose: '0.25 %', score: '67%' },
          { name: 'TrichoSol™ Base', dose: 'c.s.p 100 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene',
        treatmentProgram: 'Provitamin B5 Scalp Wash in TrichoWash',
        dispensingForm: 'Shampoo Dispenser',
        volume: '250 mL',
        vehicle: 'TrichoWash™ 250mL',
        posology: 'Massage for 2 minutes and rinse thoroughly.',
        customsTariffCode: '3305.10.00',
        customsDescription: 'Dermatological hair and scalp shampoo cleanser — Non-medicinal',
        ingredients: [
          { name: 'D-Panthenol', dose: '0.5 %', score: '100%' },
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
      patientId: '28963402049',
      age: 36
    },
    dates: {
      receivedDateSlash: '01-07-2025',
      receivedDateISO: '2025-07-01T09:00:00.000Z',
      testEndDateSlash: '09-07-2025',
      testEndDateISO: '2025-07-09T14:40:11.000Z'
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
          { name: 'Astaxanthin', dose: '10 mg', score: '67%' },
          { name: 'Saw Palmetto', dose: '200 mg', score: '53%' },
          { name: 'Vitamin B12 (Cyanocobalamin)', dose: '1000 mcg', score: '100%' },
          { name: 'Selenium yeast', dose: '100 mg', score: '100%' }
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
          { name: 'Finasteride', dose: '0.25 %', score: '86%' },
          { name: 'D-Panthenol', dose: '0.5 %', score: '100%' },
          { name: 'TrichoFoam™ Base', dose: 'c.s.p 100 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene',
        treatmentProgram: 'Retinol Scalp Conditioning Drops in TrichoOil',
        dispensingForm: 'Dropper Bottle',
        volume: '30 mL',
        vehicle: 'TrichoOil™ 30mL',
        posology: '1-2 times / week, massage 3-5 minutes and leave on 10 min before washing.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Scalp conditioning cosmetic botanical oil blend — Non-medicinal',
        ingredients: [
          { name: 'Retinol palmitate', dose: '1 %', score: '67%' },
          { name: 'TrichoOil™ Base', dose: 'c.s.p 30 mL', isVehicle: true }
        ]
      }
    ]
  },

  // 4. Abdulrahman Darwish Fakhro
  {
    code: 'BOX03054AATRI',
    patient: {
      id: 'patient-abdulrahman-darwish-fakhro',
      name: 'Abdulrahman Darwish Fakhro',
      dob: '31-03-1985',
      gender: 'Male',
      patientId: '28563401784',
      age: 40
    },
    dates: {
      receivedDateSlash: '24-09-2025',
      receivedDateISO: '2025-09-24T09:00:00.000Z',
      testEndDateSlash: '03-10-2025',
      testEndDateISO: '2025-10-03T14:50:06.000Z'
    },
    formulations: [
      {
        treatmentType: 'Topical treatment',
        treatmentProgram: 'Customized Dermocosmetic Scalp Restorative Solution in TrichoSol',
        dispensingForm: 'Topical Solution Dispenser',
        volume: '100 mL',
        vehicle: 'TrichoSol™ 100mL',
        posology: 'Apply at night before bedtime. Leave solution on scalp as long as possible. Wash scalp next day.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Topical scalp restorative cosmetic lotion — Non-medicinal preparation',
        ingredients: [
          { name: 'Latanoprost Fagron', dose: '0.005 %', score: '78%' },
          { name: 'Spironolactone', dose: '1 %', score: '100%' },
          { name: 'TrichoXidil', dose: '4 %', score: '67%' },
          { name: 'TrichoSol™ Base', dose: 'c.s.p 100 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Targeted Micronutrient & Folate Co-Factor Complex',
        dispensingForm: 'Oral Vegetarian Capsules',
        volume: '90 capsules (3-month supply)',
        posology: '1 capsule per day, 90 capsules for 3 months',
        customsTariffCode: '2106.90.98',
        customsDescription: 'Food supplement antioxidant vitamin capsules — Non-medicinal',
        ingredients: [
          { name: 'Vitamin B12 (Cyanocobalamin)', dose: '1000 mcg', score: '100%' },
          { name: 'Vitamin B9 (Folate)', dose: '4 mg', score: '67%' }
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
          { name: 'Vitamin E (Tocopherol)', dose: '5 %', score: '100%' },
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
          { name: 'Retinol palmitate', dose: '1 %', score: '67%' },
          { name: 'D-Panthenol', dose: '0.5 %', score: '70%' },
          { name: 'TrichoWash™ Base', dose: 'c.s.p 250 mL', isVehicle: true }
        ]
      }
    ]
  }
];

async function run() {
  console.log('🚀 [Qatar Official Import] Ingesting the 4 official Qatar prescriptions...');

  // Upsert Doctor & Clinic
  await db.collection('physicians').doc(QATAR_DOCTOR.id).set({
    ...QATAR_DOCTOR,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log(`   ✅ Qatar Doctor: ${QATAR_DOCTOR.name} (${QATAR_DOCTOR.email})`);

  await db.collection('clinics').doc(QATAR_CLINIC.id).set({
    ...QATAR_CLINIC,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log(`   ✅ Qatar Clinic: ${QATAR_CLINIC.name} (Doha, Qatar)`);

  for (const t of QATAR_OFFICIAL_4) {
    console.log(`\n📦 Importing ${t.code} - ${t.patient.name} (Test End Date: ${t.dates.testEndDateSlash})...`);

    // 1. Patient
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
    console.log(`   ✓ Patient: ${t.patient.name} (${t.patient.id})`);

    // 2. Lab Result
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
    console.log(`   ✓ Lab Result: ${t.code} with Results Date ${t.dates.testEndDateSlash}`);

    // 3. Prescription
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
    console.log(`   ✓ Prescription: ${rxId} with Date ${t.dates.testEndDateSlash}`);

    // 4. Order Record
    const orderId = `ORD-${t.code}`;
    await db.collection('orders').doc(orderId).set({
      id: orderId,
      orderNumber: orderId,
      sampleCode: t.code,
      prescriptionId: rxId,
      patientId: t.patient.id,
      patientName: t.patient.name,
      doctorName: QATAR_DOCTOR.name,
      clinicName: QATAR_CLINIC.name,
      clinicId: QATAR_CLINIC.id,
      wholeseller: 'YDL',
      country: 'Qatar',
      countryCode: 'QA',
      date: t.dates.testEndDateSlash,
      createdAt: t.dates.testEndDateISO,
      currency: 'USD',
      total: 485.00,
      paymentStatus: 'pending_invoice',
      customsCompliance: {
        hsTariffCode: '3822.00.00',
        declarationCategory: 'Non-medicinal biochemical assessment & cosmetic formulations',
        customsDeclaration: 'Individualized Capillary Trichological Assessment Service & Cosmetic Formulation Substrate (Non-medicinal, non-hazardous)',
        intendedUse: 'Laboratory cellular evaluation & topical cosmetic hygiene'
      },
      items: [
        {
          sku: 'DX-TRICHO-GEN-01',
          title: 'Fagron TrichoTest™ Laboratory Evaluation & Pharmacogenetic Processing',
          customsDescription: 'Capillary Genetic & Biomarker Laboratory Diagnostic Service (HS 3822.00.00)',
          quantity: 1,
          unitPrice: 220.00,
          amount: 220.00,
          isMedicinal: false
        },
        {
          sku: 'CP-TRICHO-TOP-100',
          title: 'Customized Dermocosmetic Scalp Restorative Solution (100 mL)',
          customsDescription: 'Topical Dermocosmetic Hair Care Preparation — Scalp Lotion (HS 3305.90.00)',
          quantity: 1,
          unitPrice: 115.00,
          amount: 115.00,
          isMedicinal: false
        },
        {
          sku: 'CP-TRICHO-ORAL-90',
          title: 'Targeted Micronutrient & Antioxidant Dietary Supplement Complex (90 Vegan Capsules)',
          customsDescription: 'Food Supplement Antioxidant Capsules (HS 2106.90.98)',
          quantity: 1,
          unitPrice: 85.00,
          amount: 85.00,
          isMedicinal: false
        },
        {
          sku: 'CP-TRICHO-CARE-SET',
          title: 'Bioactive Scalp Cleansing & Conditioning Set',
          customsDescription: 'Scalp Cleansing Shampoo & Botanical Oil Cosmetic Set (HS 3305.10.00 / 3305.90.00)',
          quantity: 1,
          unitPrice: 65.00,
          amount: 65.00,
          isMedicinal: false
        }
      ],
      status: 'draft',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`   ✓ Order: ${orderId}`);
  }

  console.log('\n✨ [Success] All 4 Qatar prescriptions & lab results imported with accurate test completion dates!');
}

run().catch(err => {
  console.error('❌ Failed to import:', err);
  process.exit(1);
});

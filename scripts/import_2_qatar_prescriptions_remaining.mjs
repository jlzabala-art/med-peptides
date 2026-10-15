/**
 * scripts/import_2_qatar_prescriptions_remaining.mjs
 *
 * Ingests the remaining 2 Qatar TrichoTest prescriptions for Dr. Raffanie Lucenio:
 * 1. Mohammed Yousuf Al-khulaifi (BOX03044AATRI) - Test End Date: 03-10-2025
 * 2. Moza Ahmad Almatwi (BOX03041AATRI) - Test End Date: 26-11-2025
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
  licenseNumber: 'QA-MOPH-DERM-4891',
  role: 'doctor',
  wholesellerId: 'ydl',
  wholesellerName: 'YDL Trading & Distribution',
  address: 'The Masters Medical Center, Lusail Expressway, Marina District, Building 14, Doha, Qatar',
  phone: '+974 4488 9900'
};

const QATAR_PATIENTS_REMAINING = [
  // 1. Mohammed Yousuf Al-khulaifi
  {
    code: 'BOX03044AATRI',
    patient: {
      id: 'patient-mohammed-yousuf-al-khulaifi',
      name: 'Mohammed Yousuf Al-khulaifi',
      dob: '13-10-1996',
      gender: 'Male',
      patientId: '29663403906',
      age: 29
    },
    dates: {
      receivedDateSlash: '24-09-2025',
      receivedDateISO: '2025-09-24T09:00:00.000Z',
      testEndDateSlash: '03-10-2025',
      testEndDateISO: '2025-10-03T14:35:10.000Z'
    },
    formulations: [
      {
        treatmentType: 'Topical treatment',
        treatmentProgram: 'Customized Scalp Restorative Solution in TrichoSol',
        dispensingForm: 'Topical Solution Dispenser',
        volume: '100 mL',
        vehicle: 'TrichoSol™ 100mL',
        posology: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Topical scalp restorative cosmetic lotion — Non-medicinal preparation',
        ingredients: [
          { name: 'Ketoconazole', dose: '2 %', score: '100%' },
          { name: 'Minoxidil', dose: '4 %', score: '80%' },
          { name: 'Spironolactone', dose: '1 %', score: '100%' },
          { name: 'TrichoSol™ Base', dose: 'c.s.p 100 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Targeted Antioxidant & Micronutrient Vitality Complex',
        dispensingForm: 'Oral Vegetarian Capsules',
        volume: '90 capsules (3-month supply)',
        posology: '1 capsule per day, 90 capsules for 3 months',
        customsTariffCode: '2106.90.98',
        customsDescription: 'Food supplement antioxidant capsules — Non-medicinal preparation',
        ingredients: [
          { name: 'Zinc sulfate', dose: '50 mg' },
          { name: 'Astaxanthin', dose: '10 mg' },
          { name: 'Caffeine', dose: '23 mg', score: '50%' },
          { name: 'Oral SiliciuMax TM', dose: '250 mg', score: '67%' },
          { name: 'Vitamin B9 (Folate)', dose: '4 mg' }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene',
        treatmentProgram: 'Botanical Scalp Conditioning Drops in TrichoOil',
        dispensingForm: 'Dropper Bottle',
        volume: '30 mL',
        vehicle: 'TrichoOil™ 30mL',
        posology: '1-2 times / week, massage for 3-5 minutes and leave it on for 10 min before washing your hair.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Scalp conditioning cosmetic botanical oil blend — Non-medicinal',
        ingredients: [
          { name: 'Clotrimazole', dose: '1 %', score: '100%' },
          { name: 'Ginseng', dose: '2.5 %', score: '60%' },
          { name: 'Ginkgo biloba', dose: '3 %', score: '100%' },
          { name: 'TrichoOil™ Base', dose: 'c.s.p 30 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene',
        treatmentProgram: 'Antidandruff Restorative Cleanser in TrichoWash',
        dispensingForm: 'Shampoo Dispenser',
        volume: '250 mL',
        vehicle: 'TrichoWash™ 250mL',
        posology: 'Massage for 2 minutes and rinse',
        customsTariffCode: '3305.10.00',
        customsDescription: 'Dermatological hair and scalp shampoo cleanser — Non-medicinal',
        ingredients: [
          { name: 'Cyclopirox olamine', dose: '1.5 %', score: '100%' },
          { name: 'Arginine', dose: '2 %', score: '100%' },
          { name: 'Retinol palmitate', dose: '1 %' },
          { name: 'TrichoWash™ Base', dose: 'c.s.p 250 mL', isVehicle: true }
        ]
      }
    ]
  },

  // 2. Moza Ahmad Almatwi
  {
    code: 'BOX03041AATRI',
    patient: {
      id: 'patient-moza-ahmad-almatwi',
      name: 'Moza Ahmad Almatwi',
      dob: '18-05-2005',
      gender: 'Female',
      patientId: '30563402169',
      age: 20
    },
    dates: {
      receivedDateSlash: '24-11-2025',
      receivedDateISO: '2025-11-24T09:00:00.000Z',
      testEndDateSlash: '26-11-2025',
      testEndDateISO: '2025-11-26T14:48:22.000Z'
    },
    formulations: [
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Targeted Anti-Alopecic Low-Dose Oral Formulation (Woman)',
        dispensingForm: 'Oral Vegetarian Capsules',
        volume: '90 capsules (3-month supply)',
        posology: '1 capsule per day, 90 capsules for 3 months',
        customsTariffCode: '2106.90.98',
        customsDescription: 'Food supplement dietary capsules — Non-medicinal preparation',
        ingredients: [
          { name: 'Oral Minoxidil (woman)', dose: '1 mg', score: '76%' },
          { name: 'Oral Dutasteride', dose: '0.5 mg', score: '75%' },
          { name: 'Vitamin B9 (Folate)', dose: '4 mg' }
        ]
      },
      {
        treatmentType: 'Topical treatment',
        treatmentProgram: 'Customized Scalp Restorative Solution in TrichoSol',
        dispensingForm: 'Topical Solution Dispenser',
        volume: '100 mL',
        vehicle: 'TrichoSol™ 100mL',
        posology: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Topical scalp restorative cosmetic lotion — Non-medicinal preparation',
        ingredients: [
          { name: 'Melatonin', dose: '0.1 %', score: '50%' },
          { name: 'Arginine', dose: '1.5 %', score: '57%' },
          { name: 'IGrantine-F1 TM', dose: '0.25 %', score: '67%' },
          { name: 'TrichoSol™ Base', dose: 'c.s.p 100 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene',
        treatmentProgram: 'Antioxidant Botanical Scalp Conditioning Drops in TrichoOil',
        dispensingForm: 'Dropper Bottle',
        volume: '30 mL',
        vehicle: 'TrichoOil™ 30mL',
        posology: '1-2 times / week, massage for 3-5 minutes and leave it on for 10 min before washing your hair.',
        customsTariffCode: '3305.90.00',
        customsDescription: 'Scalp conditioning cosmetic botanical oil blend — Non-medicinal',
        ingredients: [
          { name: 'Ginkgo biloba', dose: '2 %', score: '50%' },
          { name: 'Vitamin E (Tocopherol)', dose: '5 %' },
          { name: 'TrichoOil™ Base', dose: 'c.s.p 30 mL', isVehicle: true }
        ]
      },
      {
        treatmentType: 'Scalp care and hygiene',
        treatmentProgram: 'Gentle Provitamin B5 Scalp Wash in TrichoWash',
        dispensingForm: 'Shampoo Dispenser',
        volume: '250 mL',
        vehicle: 'TrichoWash™ 250mL',
        posology: 'Massage for 2 minutes and rinse',
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
  console.log('--- Ingesting Remaining 2 Qatar Prescriptions for Dr. Raffanie Lucenio ---');

  for (const item of QATAR_PATIENTS_REMAINING) {
    const { code, patient, dates, formulations } = item;
    const rxId = `RX-${code}`;
    const orderId = `ORD-${code}`;
    const testEndDateObj = new Date(dates.testEndDateISO);
    const receivedDateObj = new Date(dates.receivedDateISO);

    console.log(`\nProcessing: ${patient.name} (${code}) | Results Date: ${dates.testEndDateSlash}`);

    // 1. Upsert Patient
    await db.collection('patients').doc(patient.id).set({
      id: patient.id,
      fullName: patient.name,
      name: patient.name,
      patientId: patient.patientId,
      dateOfBirth: patient.dob,
      gender: patient.gender,
      age: patient.age,
      city: 'Doha',
      country: 'Qatar',
      countryCode: 'QA',
      doctorRef: QATAR_DOCTOR.id,
      doctorName: QATAR_DOCTOR.name,
      clinicRef: QATAR_DOCTOR.clinicId,
      clinicName: QATAR_DOCTOR.clinicName,
      wholesellerId: QATAR_DOCTOR.wholesellerId,
      primarySampleCode: code,
      activeSampleCode: code,
      sampleCodes: admin.firestore.FieldValue.arrayUnion(code),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`  ✓ Patient record updated: ${patient.id}`);

    // 2. Upsert Lab Result
    await db.collection('lab_results').doc(code).set({
      code,
      sampleCode: code,
      protocolNumber: code,
      testName: 'Fagron TrichoTest™',
      testType: 'trichotest',
      category: 'genomics',
      patientId: patient.id,
      patientName: patient.name,
      patientGender: patient.gender,
      patientDob: patient.dob,
      patientAge: patient.age,
      doctorId: QATAR_DOCTOR.id,
      doctorName: QATAR_DOCTOR.name,
      doctorTitle: QATAR_DOCTOR.title,
      doctorEmail: QATAR_DOCTOR.email,
      doctorPhone: QATAR_DOCTOR.phone,
      doctorAddress: QATAR_DOCTOR.address,
      clinicId: QATAR_DOCTOR.clinicId,
      clinicName: QATAR_DOCTOR.clinicName,
      wholesellerId: QATAR_DOCTOR.wholesellerId,
      country: 'Qatar',
      countryCode: 'QA',
      city: 'Doha',
      status: 'completed',
      sampleType: 'Buccal Swab',
      laboratory: 'Fagron Genomics, S.L.U.',
      receivedDate: dates.receivedDateSlash,
      receivedAt: receivedDateObj,
      testEndDate: dates.testEndDateSlash,
      completedDate: dates.testEndDateSlash,
      completedAt: testEndDateObj,
      publishedAt: testEndDateObj,
      prescriptionRef: rxId,
      orderRef: orderId,
      formulations,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`  ✓ Lab Result registered: ${code}`);

    // 3. Upsert Prescription
    await db.collection('prescriptions').doc(rxId).set({
      id: rxId,
      rxId,
      code,
      sampleCode: code,
      protocolNumber: code,
      testName: 'Fagron TrichoTest™ Personalized Compounding Protocol',
      patientId: patient.id,
      patientName: patient.name,
      patientDob: patient.dob,
      patientGender: patient.gender,
      doctorId: QATAR_DOCTOR.id,
      doctorName: QATAR_DOCTOR.name,
      doctorEmail: QATAR_DOCTOR.email,
      doctorSpecialty: QATAR_DOCTOR.specialty,
      doctorLicense: QATAR_DOCTOR.licenseNumber,
      doctorAddress: QATAR_DOCTOR.address,
      doctorPhone: QATAR_DOCTOR.phone,
      clinicId: QATAR_DOCTOR.clinicId,
      clinicName: QATAR_DOCTOR.clinicName,
      wholesellerId: QATAR_DOCTOR.wholesellerId,
      country: 'Qatar',
      countryCode: 'QA',
      status: 'approved',
      testEndDate: dates.testEndDateSlash,
      completedAt: dates.testEndDateISO,
      authorizedAt: testEndDateObj,
      createdAt: testEndDateObj,
      compoundedFormulations: formulations,
      treatmentPhases: formulations.map((f, i) => ({
        phaseId: `phase-${i + 1}`,
        title: f.treatmentProgram,
        treatmentType: f.treatmentType,
        posology: f.posology,
        duration: f.treatmentType.includes('Oral') ? '90 Days' : '3 Months',
        customsTariffCode: f.customsTariffCode,
        customsDescription: f.customsDescription,
        ingredients: f.ingredients
      })),
      price: 485,
      currency: 'USD',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`  ✓ Prescription saved: ${rxId}`);

    // 4. Upsert Order (Customs safe non-medication line items)
    await db.collection('orders').doc(orderId).set({
      id: orderId,
      orderId,
      rxId,
      sampleCode: code,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: QATAR_DOCTOR.id,
      doctorName: QATAR_DOCTOR.name,
      clinicId: QATAR_DOCTOR.clinicId,
      clinicName: QATAR_DOCTOR.clinicName,
      wholesellerId: QATAR_DOCTOR.wholesellerId,
      destinationCountry: 'Qatar',
      destinationCity: 'Doha',
      shippingAddress: QATAR_DOCTOR.address,
      status: 'processing',
      totalAmount: 485,
      currency: 'USD',
      testEndDate: dates.testEndDateSlash,
      completedAt: dates.testEndDateISO,
      createdAt: testEndDateObj,
      items: formulations.map((f, i) => ({
        itemId: `${code}-item-${i + 1}`,
        name: f.treatmentProgram,
        type: f.treatmentType,
        customsTariffCode: f.customsTariffCode,
        customsDescription: f.customsDescription,
        quantity: 1,
        volume: f.volume || '1 unit'
      })),
      customsDeclaration: {
        isMedicinal: false,
        nonMedicinalCertified: true,
        primaryTariffCode: '3305.90.00',
        statement: 'Certified non-medicinal cosmetic dermocosmetic restorative preparations and dietary antioxidant food cofactors for personal topical use.'
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`  ✓ Order registered: ${orderId}`);
  }

  console.log('\n=== ALL QATAR PRESCRIPTIONS INGESTION COMPLETED SUCCESSFULLY ===');
}

run().catch(err => {
  console.error('Fatal error during import:', err);
  process.exit(1);
});

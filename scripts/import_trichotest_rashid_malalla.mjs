/**
 * scripts/import_trichotest_rashid_malalla.mjs
 *
 * Ingests TrichoTest report BOX03484AATRI for Rashid Shahin Malalla:
 * - Patient: Rashid Shahin Malalla (DOB: 20-07-1987, ID: 784-1987-9206413-5)
 * - Doctor: Dr. Sezgin Cagatay (Hortman Clinics, adriana.barac@hortmanclinics.com)
 * - Date: 14-04-2026 (Fin de test / Genetic results date)
 * - Collections: patients, physicians, clinics, lab_results, prescriptions, orders
 * - Customs & Gateway Compliant non-medication descriptions (HS 3822.00 / 3305.90)
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const saPath = path.resolve(__dirname, '../serviceAccount-target.json');
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(sa)
  });
}

const db = admin.firestore();

async function run() {
  console.log('🚀 [TrichoTest Ingestion] Processing report BOX03484AATRI for Rashid Shahin Malalla...');

  const sampleCode = 'BOX03484AATRI';
  const rxCode = `RX-${sampleCode}`;
  const orderId = `ORD-${sampleCode}`;
  const patientId = 'patient-rashid-shahin-malalla';
  const doctorId = 'z3aUIMaYsPViG1JgM95r';
  const clinicId = 'hortman-clinics';

  const testEndDateSlash = '14-04-2026';
  const testEndDateISO = '2026-04-14T09:00:00.000Z';
  const receivedDateSlash = '07-04-2026';
  const receivedDateISO = '2026-04-07T08:30:00.000Z';

  // 1. Upsert Doctor & Clinic
  await db.collection('physicians').doc(doctorId).set({
    id: doctorId,
    name: 'Dr. Sezgin Cagatay',
    fullName: 'Dr. Çağatay Sezgin (Dr. Sezgin Cagatay)',
    title: 'Consultant Hair Transplant Surgeon & Trichologist',
    email: 'adriana.barac@hortmanclinics.com',
    contactEmail: 'adriana.barac@hortmanclinics.com',
    clinicId: clinicId,
    clinicName: 'Hortman Clinics',
    specialty: 'Trichology, Hair Restoration & Regenerative Medicine',
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    status: 'approved',
    wholeseller: 'YDL',
    wholesalerId: 'clinic-ydl-dubai',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('   ✅ Doctor record upserted: Dr. Sezgin Cagatay');

  await db.collection('clinics').doc(clinicId).set({
    id: clinicId,
    name: 'Hortman Clinics',
    legalName: 'Hortman Clinics FZ-LLC',
    code: 'HORTMAN',
    email: 'adriana.barac@hortmanclinics.com',
    supervisingDoctor: 'Dr. Sezgin Cagatay',
    supervisingDoctorId: doctorId,
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    type: 'trichology_aesthetic_clinic',
    wholeseller: 'YDL',
    wholesalerId: 'clinic-ydl-dubai',
    wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
    status: 'active',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('   ✅ Clinic record upserted: Hortman Clinics');

  // 2. Upsert Patient
  await db.collection('patients').doc(patientId).set({
    id: patientId,
    name: 'Rashid Shahin Malalla',
    fullName: 'Rashid Shahin Malalla',
    patientId: '784-1987-9206413-5',
    emiratesId: '784-1987-9206413-5',
    gender: 'Male',
    dob: '1987-07-20',
    dateOfBirth: '20-07-1987',
    age: 38,
    sampleType: 'Buccal Swab',
    sampleCode: sampleCode,
    doctorId: doctorId,
    doctorName: 'Dr. Sezgin Cagatay',
    clinicId: clinicId,
    clinicName: 'Hortman Clinics',
    wholeseller: 'YDL',
    status: 'active',
    activePrescriptionId: rxCode,
    prescriptions: [rxCode],
    labResults: [sampleCode],
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('   ✅ Patient record upserted: Rashid Shahin Malalla');

  // 3. Formulations & Items with Customs-Safe Descriptions
  const formulations = [
    {
      treatmentType: 'Topical treatment',
      treatmentProgram: 'Customized Dermocosmetic Scalp Restorative Solution (TrichoFoam)',
      dispensingForm: 'Topical Foam Dispenser',
      volume: '100 mL',
      vehicle: 'TrichoFoam™ 100mL',
      posology: 'Apply at night before bedtime with a gentle massage on scalp. Wash scalp the next day.',
      customsTariffCode: '3305.90.00',
      customsDescription: 'Topical cosmetic scalp restoration foam formulation — Non-medicinal preparation',
      ingredients: [
        { name: 'Minoxidil', dose: '4 %', rawActive: 'Minoxidil', score: '53%' },
        { name: 'Dutasteride', dose: '0.25 %', rawActive: 'Dutasteride', score: '100%' },
        { name: 'Arginine', dose: '1.5 %', rawActive: 'L-Arginine', score: '67%' },
        { name: 'TrichoFoam™ Base', dose: 'c.s.p 100 mL', isVehicle: true }
      ]
    },
    {
      treatmentType: 'Oral treatment',
      treatmentProgram: 'Targeted Micronutrient & Antioxidant Complex (90 Vegan Capsules)',
      dispensingForm: 'Oral Vegetarian Capsules',
      volume: '90 capsules (3-month supply)',
      posology: '1 capsule per day with morning meal (90 capsules for 3 months)',
      customsTariffCode: '2106.90.98',
      customsDescription: 'Food supplement / Dietary antioxidant vitamin and mineral capsules — Non-medicinal',
      ingredients: [
        { name: 'Zinc sulfate', dose: '50 mg', score: '100%' },
        { name: 'Astaxanthin', dose: '10 mg', score: '67%' },
        { name: 'Caffeine', dose: '23 mg', score: '50%' },
        { name: 'Vitamin B12 (Cyanocobalamin)', dose: '1000 mcg', score: '100%' },
        { name: 'Vitamin B9 (Folate)', dose: '4 mg', score: '67%' }
      ]
    },
    {
      treatmentType: 'Scalp care and hygiene (Oil)',
      treatmentProgram: 'Nutritional Lipid Scalp Conditioning Drops (TrichoOil)',
      dispensingForm: 'Dropper Bottle',
      volume: '30 mL',
      vehicle: 'TrichoOil™ 30mL',
      posology: '1-2 times / week, massage for 3-5 minutes and leave on for 10 min before washing hair.',
      customsTariffCode: '3305.90.00',
      customsDescription: 'Scalp conditioning cosmetic botanical oil blend — Non-medicinal',
      ingredients: [
        { name: 'Ginseng', dose: '2 %', score: '50%' },
        { name: 'Ginkgo biloba', dose: '2.5 %', score: '67%' },
        { name: 'Vitamin E (Tocopherol)', dose: '5 %', score: '100%' },
        { name: 'TrichoOil™ Base', dose: 'c.s.p 30 mL', isVehicle: true }
      ]
    },
    {
      treatmentType: 'Scalp care and hygiene (Cleanser)',
      treatmentProgram: 'Bioactive Follicular Cleanser & Scalp Wash (TrichoWash)',
      dispensingForm: 'Shampoo Dispenser',
      volume: '250 mL',
      vehicle: 'TrichoWash™ 250mL',
      posology: 'Massage gently into wet scalp for 2 minutes and rinse thoroughly.',
      customsTariffCode: '3305.10.00',
      customsDescription: 'Dermatological hair and scalp shampoo cleanser — Non-medicinal',
      ingredients: [
        { name: 'L-Carnitine L-tartrate', dose: '2 %', score: '50%' },
        { name: 'TrichoWash™ Base', dose: 'c.s.p 250 mL', isVehicle: true }
      ]
    }
  ];

  // 4. Lab Results Document
  await db.collection('lab_results').doc(sampleCode).set({
    id: sampleCode,
    code: sampleCode,
    sampleCode: sampleCode,
    testCode: sampleCode,
    testType: 'TrichoTest',
    testName: 'Fagron TrichoTest™ Pharmacogenetic Hair Loss DNA Analysis',
    category: 'genomics',
    biomarkerCategory: 'trichology_pharmacogenetics',
    dates: {
      receivedDate: receivedDateSlash,
      receivedTimestamp: receivedDateISO,
      resultsDate: testEndDateSlash,
      resultsTimestamp: testEndDateISO,
      testEndDate: testEndDateSlash,
      testEndTimestamp: testEndDateISO
    },
    sampleDetails: {
      sampleType: 'Buccal Swab (Oral Mucosa)',
      sampleCode: sampleCode,
      collectionMethod: 'Non-invasive buccal swab',
      receivedAtLab: receivedDateSlash,
      completedAtLab: testEndDateSlash
    },
    patient: {
      id: patientId,
      name: 'Rashid Shahin Malalla',
      fullName: 'Rashid Shahin Malalla',
      dob: '20-07-1987',
      dateOfBirth: '20-07-1987',
      gender: 'Male',
      age: 38,
      patientId: '784-1987-9206413-5'
    },
    patientName: 'Rashid Shahin Malalla',
    patientId: patientId,
    patientDob: '20-07-1987',
    doctor: {
      id: doctorId,
      name: 'Dr. Sezgin Cagatay',
      email: 'adriana.barac@hortmanclinics.com',
      specialty: 'Trichology & Hair Restoration',
      clinicName: 'Hortman Clinics',
      clinicId: clinicId
    },
    doctorName: 'Dr. Sezgin Cagatay',
    doctorId: doctorId,
    doctorEmail: 'adriana.barac@hortmanclinics.com',
    clinicName: 'Hortman Clinics',
    clinicId: clinicId,
    wholeseller: 'YDL',
    wholesalerId: 'clinic-ydl-dubai',
    laboratory: {
      name: 'Fagron Genomics S.L.U.',
      address: 'C/ de les Cosidores, 150, 08226 Terrassa, Barcelona (Spain)',
      country: 'Spain',
      standards: 'Regulation (EU) 2017/746 / CE-IVD',
      license: 'SRN: ES-MF-000001092'
    },
    keyFindings: {
      algorithmRecommendations: 'Pharmacogenetic scoring identified high responsiveness to 5α-reductase inhibition (Dutasteride 100%), microvascular circulation stimulants (Arginine 67%, Ginkgo biloba 67%), and antioxidant co-factors (Vit B12 100%, Vit E 100%, Zinc 100%).',
      blockedDrugs: 'Finasteride and Saw Palmetto showed lower efficacy/blocked response relative to Dutasteride.',
      status: 'Completed',
      sampleQuality: 'Valid / High-Integrity DNA'
    },
    activeScores: {
      'Dutasteride': 100,
      'Vitamin B12': 100,
      'Vitamin E': 100,
      'Zinc sulfate': 100,
      'Arginine': 67,
      'Ginkgo biloba': 67,
      'Vitamin B9': 67,
      'Astaxanthin': 67,
      'IGrantine-F1': 67,
      'Latanoprost': 56,
      'Minoxidil': 53,
      'Ginseng': 50,
      'Caffeine': 50,
      'L-Carnitine L-tartrate': 50
    },
    formulations: formulations,
    status: 'completed',
    createdAt: testEndDateISO,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log(`   ✅ Lab result saved: ${sampleCode} (Test End Date: ${testEndDateSlash})`);

  // 5. Prescription Document
  await db.collection('prescriptions').doc(rxCode).set({
    id: rxCode,
    code: rxCode,
    prescriptionCode: rxCode,
    sampleCode: sampleCode,
    protocolNumber: sampleCode,
    protocolCode: sampleCode,
    date: testEndDateSlash,
    prescriptionDate: testEndDateSlash,
    resultsDate: testEndDateISO,
    dateIssued: testEndDateISO,
    mfgDate: testEndDateISO,
    prodDate: testEndDateISO,
    patientName: 'Rashid Shahin Malalla',
    patientId: patientId,
    patient: {
      name: 'Rashid Shahin Malalla',
      dob: '20-07-1987',
      gender: 'Male',
      age: 38,
      patientId: '784-1987-9206413-5'
    },
    doctorName: 'Dr. Sezgin Cagatay',
    doctorId: doctorId,
    doctorEmail: 'adriana.barac@hortmanclinics.com',
    doctorSpecialty: 'Trichology & Hair Restoration',
    doctor: {
      name: 'Dr. Sezgin Cagatay',
      id: doctorId,
      email: 'adriana.barac@hortmanclinics.com',
      clinicName: 'Hortman Clinics',
      clinicId: clinicId
    },
    clinicName: 'Hortman Clinics',
    clinicId: clinicId,
    wholesalerId: 'clinic-ydl-dubai',
    wholeseller: 'YDL',
    wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
    treatmentProgram: 'Fagron TrichoTest',
    treatmentTitle: 'TrichoTest™ Personalized Pharmacogenetic Hair Restoration Protocol',
    regimenCategory: 'Follicular Trichology & Hair Restoration',
    regimenCategoryId: 'trichology_rx',
    regimenCategoryCode: 'TRICHO-RX',
    regimenShortTitle: 'TrichoTest',
    regimenCategoryShort: 'Compounded Trichology & Nutraceutical',
    activeIngredientsSummary: 'Dutasteride 0.25% · Minoxidil 4% · Arginine 1.5% · Zinc · Astaxanthin',
    formulations: formulations,
    status: 'approved',
    validationStatus: 'Ready',
    importSource: 'fagron_genomics',
    sourceType: 'fagron_genomics',
    createdAt: testEndDateISO,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log(`   ✅ Prescription saved: ${rxCode} with date ${testEndDateSlash}`);

  // 6. Order / Commercial Record with Customs & Payment Compliant Descriptions
  await db.collection('orders').doc(orderId).set({
    id: orderId,
    orderNumber: orderId,
    sampleCode: sampleCode,
    prescriptionId: rxCode,
    patientId: patientId,
    patientName: 'Rashid Shahin Malalla',
    doctorName: 'Dr. Sezgin Cagatay',
    clinicName: 'Hortman Clinics',
    clinicId: clinicId,
    wholeseller: 'YDL',
    date: testEndDateSlash,
    createdAt: testEndDateISO,
    currency: 'USD',
    subtotal: 485.00,
    shipping: 0.00,
    total: 485.00,
    paymentStatus: 'pending_invoice',
    customsCompliance: {
      hsTariffCode: '3822.00.00',
      declarationCategory: 'Non-medicinal biochemical assessment and dermocosmetic formulations',
      customsDeclaration: 'Individualized Capillary Trichological Assessment Service & Cosmetic Formulation Substrate (Non-hazardous, non-infectious, not for therapeutic human injection)',
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
        sku: 'CP-TRICHO-FOAM-100',
        title: 'Customized Dermocosmetic Scalp Restorative Solution in TrichoFoam (100 mL)',
        customsDescription: 'Topical Dermocosmetic Hair Care Preparation — Scalp Lotion (HS 3305.90.00)',
        quantity: 1,
        unitPrice: 115.00,
        amount: 115.00,
        isMedicinal: false
      },
      {
        sku: 'CP-TRICHO-CAPS-90',
        title: 'Targeted Micronutrient & Antioxidant Dietary Supplement Complex (90 Vegan Capsules)',
        customsDescription: 'Food Supplement Antioxidant Capsules (HS 2106.90.98)',
        quantity: 1,
        unitPrice: 85.00,
        amount: 85.00,
        isMedicinal: false
      },
      {
        sku: 'CP-TRICHO-CARE-SET',
        title: 'Bioactive Scalp Cleansing & Conditioning Set (TrichoWash 250mL + TrichoOil 30mL)',
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
  console.log(`   ✅ Order & Customs-safe invoice saved: ${orderId} ($485.00 USD)`);

  console.log('\n✨ [Phase 1 Complete] Ingestion finished successfully for Rashid Shahin Malalla.');
}

run().catch(err => {
  console.error('❌ Ingestion failed:', err);
  process.exit(1);
});

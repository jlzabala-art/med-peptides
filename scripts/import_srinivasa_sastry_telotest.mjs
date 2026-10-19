/**
 * scripts/import_srinivasa_sastry_telotest.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Imports the Fagron TeloTest™ report for Srinivasa Sastry into Atlas / Med-Peptides:
 * - Patient: Srinivasa Sastry (DOB: 30-08-1967, Age: 59, Male)
 * - Customer Code / Sample: BOX03542AATEL
 * - Clinic: My London Skin Clinic (IdDU1oK1VuAVVYrGz6E7)
 * - Assigned Doctor: Dr. Sobia Mirza (dr-sobia)
 * - Reception Date: 07-10-2026 (2026-10-07)
 * - Results / Delivery Date: 14-10-2026 (2026-10-14)
 * - TeloTest Results: 0.59 kb, Chronological Age: 59, Estimated Bio Age: 56 ± 1 (Aging: -3, Young)
 * - Prescription formulation: 100 oral capsules (Hygrocaps), 1 daily morning
 *   Ingredients: Oral Ginkgo Biloba 175mg, Oral Astaxanthin 9mg, Oral Coenzyme Q10 35mg,
 *                Cyanocobalamin (B12) 1mg, Folic Acid (B9) 1mg.
 * ─────────────────────────────────────────────────────────────────────────────
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
    credential: admin.credential.cert(sa),
    storageBucket: 'med-peptides-app.firebasestorage.app'
  });
}

const db = admin.firestore();

async function importReport() {
  console.log('🚀 [Import TeloTest Report] Starting import for Srinivasa Sastry (BOX03542AATEL)...');

  const patientId = 'patient-srinivasa-sastry';
  const sampleCode = 'BOX03542AATEL';
  const labId = `LAB-${sampleCode}`;
  const rxId = `RX-${sampleCode}`;

  const clinicId = 'IdDU1oK1VuAVVYrGz6E7';
  const clinicName = 'My London Skin Clinic';
  const wholesalerId = 'clinic-ydl-dubai';
  const wholeseller = 'YDL (York Diagnostic Laboratories DMCC)';

  const doctorId = 'dr-sobia';
  const doctorName = 'Dr. Sobia Mirza';
  const doctorEmail = 'accounts@mylondonskinclinic.com';
  const doctorSpecialty = 'Aesthetic Medicine & Regenerative Biology';

  // Dates
  const receptionDate = '2026-10-07';
  const resultsDateISO = '2026-10-14';
  const resultsDateSlash = '14/10/2026';
  const resultsTimestamp = new Date('2026-10-14T00:00:00.000Z');
  const deliveryDateISO = '2026-10-14';
  const refillDateISO = '2027-01-22'; // 100 days after Oct 14, 2026

  // 1. Save Patient
  const patientData = {
    id: patientId,
    name: 'Srinivasa Sastry',
    fullName: 'Srinivasa Sastry',
    dob: '1967-08-30',
    dateOfBirth: '30-08-1967',
    gender: 'Male',
    age: 59,
    heightCm: 181,
    weightKg: 74,
    stress: 'Nothing',
    activity: '60 min, high intensity, almost every day',
    fagronPatientId: sampleCode,
    sampleCode: sampleCode,
    sampleType: 'Oral mucosa buccal swab',
    clinicId: clinicId,
    clinicName: clinicName,
    doctorId: doctorId,
    doctorName: doctorName,
    doctorEmail: doctorEmail,
    wholesalerId: wholesalerId,
    wholeseller: wholeseller,
    status: 'active',
    createdAt: resultsTimestamp,
    updatedAt: new Date().toISOString()
  };

  await db.collection('patients').doc(patientId).set(patientData, { merge: true });
  console.log(`✅ [1/3] Patient saved: ${patientId} (${patientData.name})`);

  // 2. Save Lab Result
  const labData = {
    id: labId,
    code: sampleCode,
    sampleCode: sampleCode,
    protocolNumber: sampleCode,
    patientCode: patientId,
    patientName: 'Srinivasa Sastry',
    patientId: patientId,
    patient: {
      name: 'Srinivasa Sastry',
      dob: '30-08-1967',
      gender: 'Male',
      age: 59,
      height: '181 cm',
      weight: '74 Kg',
      stress: 'Nothing',
      activity: '60 min, high intensity, almost every day'
    },
    doctorId: doctorId,
    doctorName: doctorName,
    doctorEmail: doctorEmail,
    doctorSpecialty: doctorSpecialty,
    clinicId: clinicId,
    clinicName: clinicName,
    wholesalerId: wholesalerId,
    wholeseller: wholeseller,
    testName: 'Fagron TeloTest™ Genetic Telomeric Length & Biological Age Report',
    testType: 'telotest_genomics',
    shortName: 'TeloTest™ DNA Telomere Length',
    sampleType: 'Oral Mucosa Swab (Absolute qPCR)',
    date: resultsDateISO,
    resultsDate: resultsDateISO,
    analysisDate: resultsDateISO,
    reportDate: resultsDateISO,
    receiptDate: receptionDate,
    deliveryDate: deliveryDateISO,
    value: 0.59,
    unit: 'kb',
    realAge: 59,
    estimatedBiologicalAge: 56,
    agingDelta: -3,
    classification: 'Young',
    keyFindings: {
      telomereLength: '0.59 kb',
      realAge: '59 years',
      estimatedBiologicalAge: '56 ± 1 years',
      agingDelta: '-3 years',
      status: 'Young',
      interpretation: 'Your biological age is less than your real age, at the cellular level you are fine. Keep your lifestyle healthy. If you want to rejuvenate at the cellular level, try to increase foods with anti-inflammatory and antioxidant properties.'
    },
    therapeuticRecommendations: {
      api: ['Metformin'],
      phytochemical: ['Turmeric dry extract', 'Oral Green Tea (GreenSelect)', 'Oral Ginkgo Biloba'],
      antioxidant: ['Oral Coenzyme Q10', 'Oral Astaxanthin', 'Resveratrol'],
      vitamin: ['Cyanocobalamin (Vitamin B12)', 'Folic Acid (Vitamin B9)', 'Oral Vitamin C'],
      mineral: ['SiliciuMax TM']
    },
    laboratory: {
      name: 'Fagron Genomics S.L.U.',
      address: 'C/ de les Cosidores, 150, 08226 Terrassa, Barcelona (Spain)',
      country: 'Spain',
      standards: 'Regulation (EU) 2017/746 / CE-IVD',
      license: 'SRN: ES-MF-000001092'
    },
    status: 'completed',
    createdAt: resultsTimestamp,
    updatedAt: new Date().toISOString()
  };

  await db.collection('lab_results').doc(labId).set(labData, { merge: true });
  console.log(`✅ [2/3] Lab Result saved: ${labId}`);

  // 3. Save Prescription
  const items = [
    {
      id: 'item_1_0',
      name: 'Oral Ginkgo Biloba',
      productName: 'Oral Ginkgo Biloba',
      dose: '175 mg',
      dosage: '175 mg',
      concentration: '175 mg',
      activeIngredient: 'Ginkgo Biloba extract',
      isVehicleOrBase: false,
      productId: 'ginkgo-biloba',
      status: 'pending',
      formulationBlock: 'Oral treatment',
      formulationIndex: 1,
      posology: 'One capsule daily in the morning',
      zoho_item_id: '1183263000031455151',
      zoho_sku: '',
      zoho_rate: 65,
      zoho_purchase_rate: 0
    },
    {
      id: 'item_1_1',
      name: 'Oral Astaxanthin',
      productName: 'Oral Astaxanthin',
      dose: '9 mg',
      dosage: '9 mg',
      concentration: '9 mg',
      activeIngredient: 'Astaxanthin',
      isVehicleOrBase: false,
      productId: 'astaxanthin',
      status: 'pending',
      formulationBlock: 'Oral treatment',
      formulationIndex: 1,
      posology: 'One capsule daily in the morning',
      zoho_item_id: '',
      zoho_sku: '',
      zoho_rate: 25,
      zoho_purchase_rate: 0
    },
    {
      id: 'item_1_2',
      name: 'Oral Coenzyme Q10',
      productName: 'Oral Coenzyme Q10',
      dose: '35 mg',
      dosage: '35 mg',
      concentration: '35 mg',
      activeIngredient: 'Coenzyme Q10 (Ubiquinone)',
      isVehicleOrBase: false,
      productId: 'coenzyme-q10',
      status: 'pending',
      formulationBlock: 'Oral treatment',
      formulationIndex: 1,
      posology: 'One capsule daily in the morning',
      zoho_item_id: '',
      zoho_sku: '',
      zoho_rate: 25,
      zoho_purchase_rate: 0
    },
    {
      id: 'item_1_3',
      name: 'Cyanocobalamin (Vitamin B12)',
      productName: 'Cyanocobalamin (Vitamin B12)',
      dose: '1 mg',
      dosage: '1 mg',
      concentration: '1 mg',
      activeIngredient: 'Cyanocobalamin (Vitamin B12)',
      isVehicleOrBase: false,
      productId: 'api-cyanocobalamin-b12',
      status: 'pending',
      formulationBlock: 'Oral treatment',
      formulationIndex: 1,
      posology: 'One capsule daily in the morning',
      zoho_item_id: '',
      zoho_sku: 'API-VIT-B12-CYANO',
      zoho_rate: 15,
      zoho_purchase_rate: 0
    },
    {
      id: 'item_1_4',
      name: 'Folic Acid (Vitamin B9)',
      productName: 'Folic Acid (Vitamin B9)',
      dose: '1 mg',
      dosage: '1 mg',
      concentration: '1 mg',
      activeIngredient: 'Folic Acid (Vitamin B9)',
      isVehicleOrBase: false,
      productId: 'api-folic-acid-b9',
      status: 'pending',
      formulationBlock: 'Oral treatment',
      formulationIndex: 1,
      posology: 'One capsule daily in the morning',
      zoho_item_id: '',
      zoho_sku: 'API-VIT-B9-FOLIC',
      zoho_rate: 15,
      zoho_purchase_rate: 0
    }
  ];

  const formulations = [
    {
      part: 1,
      treatmentType: 'Oral treatment',
      treatmentProgram: 'Oral capsule (Hygrocaps)',
      volume: '100 capsules',
      dispensingForm: 'Oral Capsule (Hygrocaps)',
      posology: 'One capsule daily in the morning. (recommended Hygrocaps capsules)',
      ingredients: [
        { name: 'Oral Ginkgo Biloba', dose: '175 mg' },
        { name: 'Oral Astaxanthin', dose: '9 mg' },
        { name: 'Oral Coenzyme Q10', dose: '35 mg' },
        { name: 'Cyanocobalamin (Vitamin B12)', dose: '1 mg' },
        { name: 'Folic Acid (Vitamin B9)', dose: '1 mg' }
      ]
    }
  ];

  const rxPayload = {
    id: rxId,
    code: rxId,
    prescriptionCode: rxId,
    sampleCode: sampleCode,
    protocolNumber: sampleCode,
    protocolCode: sampleCode,
    date: resultsDateSlash,
    prescriptionDate: resultsDateSlash,
    dateIssued: resultsDateISO,
    resultsDate: resultsDateISO,
    deliveryDate: deliveryDateISO,
    startDate: resultsDateISO,
    refillDate: refillDateISO,
    mfgDate: resultsDateISO,
    prodDate: resultsDateISO,
    patientName: 'Srinivasa Sastry',
    patientId: patientId,
    patient: {
      name: 'Srinivasa Sastry',
      dob: '30-08-1967',
      gender: 'Male',
      age: 59,
      fileNumber: sampleCode
    },
    doctorName: doctorName,
    doctorId: doctorId,
    doctorSlug: doctorId,
    prescribingDoctor: doctorName,
    treatingDoctor: doctorName,
    doctorEmail: doctorEmail,
    doctorSpecialty: doctorSpecialty,
    doctor: {
      name: doctorName,
      id: doctorId,
      slug: doctorId,
      email: doctorEmail,
      clinicName: clinicName,
      clinicId: clinicId,
      licenseNumber: 'DHA Registered'
    },
    clinicName: clinicName,
    clinicId: clinicId,
    clinic: `${clinicName} · Unit 139 Gate Avenue, Zone D, DIFC, Dubai, UAE`,
    wholesalerId: wholesalerId,
    wholeseller: wholeseller,
    wholesellerName: wholeseller,
    clinicalCategory: 'telotest',
    treatmentProgram: 'Fagron TeloTest',
    treatmentTitle: 'TeloTest™ Personalized Cellular Longevity Protocol',
    treatmentType: 'Oral treatment',
    dispensingForm: 'Oral capsule (Hygrocaps)',
    posology: 'One capsule daily in the morning (100 capsules, Hygrocaps)',
    duration: '100 days',
    isMultiPart: false,
    totalParts: 1,
    partNumber: 1,
    regimenCategory: 'Micronutrient & Mitochondrial Vitality',
    regimenCategoryId: 'micronutrient_mito',
    regimenCategoryCode: 'NUTRI-RX',
    regimenShortTitle: 'TeloTest',
    regimenCategoryShort: 'Nutraceutical',
    activeIngredientsSummary: 'Oral Ginkgo Biloba · Oral Astaxanthin · Oral Coenzyme Q10 · Cyanocobalamin · Folic Acid',
    telomereData: {
      bioAge: 56,
      teloLength: '0,59',
      realAge: 59,
      aging: -3,
      classification: 'Young'
    },
    items: items,
    prescriptionLines: items,
    formulations: formulations,
    treatmentBlocks: formulations,
    treatmentParts: formulations,
    status: 'approved',
    validationStatus: 'Ready',
    quotationStatus: 'Pending',
    orderStatus: 'Pending',
    isAtlasRegistered: true,
    importSource: 'fagron_genomics_report',
    sourceType: 'fagron_genomics',
    createdAt: resultsTimestamp,
    updatedAt: new Date().toISOString()
  };

  await db.collection('prescriptions').doc(rxId).set(rxPayload, { merge: true });
  console.log(`✅ [3/3] Prescription saved: ${rxId} with date ${resultsDateSlash}`);

  // 4. Update Doctor & Clinic stats count
  await db.collection('doctors').doc(doctorId).update({
    prescriptionCount: admin.firestore.FieldValue.increment(1),
    patientCount: admin.firestore.FieldValue.increment(1),
    updatedAt: new Date().toISOString()
  }).catch(err => console.warn('Note on doctor update:', err.message));

  await db.collection('clinics').doc(clinicId).update({
    patientsCount: admin.firestore.FieldValue.increment(1),
    updatedAt: new Date().toISOString()
  }).catch(err => console.warn('Note on clinic update:', err.message));

  console.log(`\n🎉 [Import Complete] Report successfully imported for Srinivasa Sastry in My London Skin Clinic, assigned to Dr. Sobia Mirza!`);
}

importReport().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error during import:', err);
  process.exit(1);
});

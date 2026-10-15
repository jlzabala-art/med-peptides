// Ingestion script for Haya Hassen Al-Haidose (Fagron Genomics TrichoTest™ BOX01399AATRI)
import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const sa = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

async function ingest() {
  console.log('🚀 Starting ingestion for Haya Hassen Al-Haidose (BOX01399AATRI)...');

  const PATIENT_ID = 'xFGvxSMg9bgPu9KbCqzm';
  const RX_ID = 'RX-BOX01399AATRI';
  const CODE = 'BOX01399AATRI';
  const now = new Date().toISOString();

  // 1. Update or enrich the patient record
  const patientData = {
    name: 'Haya Hassen Al-Haidose',
    fullName: 'Haya Hassen Al-Haidose',
    gender: 'Female',
    dob: '1997-04-11',
    dateOfBirth: '11-04-1997',
    age: 29,
    nationalId: '29763404111',
    patientId: '29763404111',
    sampleCode: CODE,
    fileNumber: CODE,
    sampleType: 'Buccal Swab',
    testType: 'Fagron Genomics TrichoTest™',
    labReceivedDate: '2024-05-23',
    labResultsDate: '2024-05-29',
    clinic: 'Hortman Clinics, Dubai',
    clinicName: 'Hortman Clinics, Dubai',
    doctorId: 'dr-sezgin-cagatay',
    doctorName: 'Dr. Sezgin Cagatay',
    status: 'active',
    primaryGoal: 'Genetic Hair Loss & Follicular Regeneration',
    prescriptions: [RX_ID],
    activePrescriptionId: RX_ID,
    source: 'Fagron Genomics TrichoTest™ Document Ingest',
    updatedAt: now
  };

  await db.collection('patients').doc(PATIENT_ID).set(patientData, { merge: true });
  console.log(`✅ Patient document updated: patients/${PATIENT_ID}`);

  // Also ensure patient alias by slug exists for easy lookup
  await db.collection('patients').doc('haya-hassen-al-haidose').set({
    ...patientData,
    id: 'haya-hassen-al-haidose',
    primaryPatientDocId: PATIENT_ID
  }, { merge: true });

  // 2. Build multi-part prescription phases
  const phases = [
    {
      phaseIndex: 1,
      partNumber: 1,
      phaseName: 'Topical Treatment Solution (TrichoSol™ 100 mL)',
      title: 'Topical treatment',
      productTitle: 'TrichoSol 100ml',
      productName: 'TrichoSol 100ml',
      subTitle: 'Targeted Follicular Regeneration & 5αR Modulation Complex',
      dosageForm: 'Topical Scalp Solution (TrichoSol™)',
      volume: '100 mL',
      formula: '17-α Estradiol 0.05% + IGrantine-F1 TM 0.5% in TrichoSol™ 100 mL',
      directions: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
      posology: {
        regimen: 'Apply at night before bedtime.',
        duration: 'Leave on scalp as long as possible. Wash scalp next day.',
        timing: 'Night before bedtime',
        notes: 'TrichoSol™ patented hydrophilic matrix maximizes active penetration with zero propylene glycol and low alcohol, preventing scalp irritation.'
      },
      apis: [
        {
          name: '17-α Estradiol',
          dose: '0.05%',
          dosage: '0.05% (0.5 mg/mL)',
          activeIngredient: '17-α Estradiol (Alfatradiol)',
          pharmacologicalClass: '5α-Reductase Modulator & Estrogen Stereoisomer',
          therapeuticClass: 'Follicular Miniaturization Reversal',
          mechanism: 'Accelerates the conversion of testosterone into estrogens via aromatase stimulation and inhibits local 5α-reductase, preventing hair follicle miniaturization without systemic feminizing effects.',
          cellularTarget: 'Dermal Papilla 5α-Reductase & Aromatase',
          zoho_item_name: '17-alpha Estradiol 0.05%',
          zoho_sku: 'estradiol_17a_0-05pct'
        },
        {
          name: 'IGrantine-F1 TM',
          dose: '0.5%',
          dosage: '0.5% (5 mg/mL)',
          activeIngredient: 'IGrantine-F1™ (Biotech Hair Growth Factor Complex)',
          pharmacologicalClass: 'Biomimetic Follicular Peptide Complex',
          therapeuticClass: 'Follicular Anagen Induction & Matrix Stimulation',
          mechanism: 'Upregulates Wnt/β-catenin signaling in dermal papilla cells, increasing vascular endothelial growth factor (VEGF) synthesis to prolong the active anagen hair growth phase.',
          cellularTarget: 'Follicular Wnt/β-Catenin Signaling Pathway',
          zoho_item_name: 'IGrantine-F1 TM 0.5%',
          zoho_sku: 'igrantine_f1_0-5pct'
        },
        {
          name: 'TrichoSol™',
          dose: 'q.s. 100 mL',
          dosage: '100 mL',
          activeIngredient: 'TrichoSol™ Hydrophilic Phytocomplex Carrier (Fagron)',
          pharmacologicalClass: 'Patented Trichological Hydrophilic Matrix',
          therapeuticClass: 'Non-Irritating Scalp Delivery Matrix',
          mechanism: 'Mineral and polyphenol phytocomplex enhances solubility and epidermal deposition of compounding APIs without causing flaking or contact dermatitis.',
          isVehicleOrBase: true,
          zoho_item_id: '1183263000013841021',
          zoho_item_name: 'TrichoSol 100 mL',
          zoho_sku: 'trichosol_100-ml',
          zoho_rate: 300
        }
      ]
    },
    {
      phaseIndex: 2,
      partNumber: 2,
      phaseName: 'Scalp Care and Hygiene Cleanser (TrichoWash™ 250 mL)',
      title: 'Scalp care and hygiene',
      productTitle: 'TrichoWash 250ml',
      productName: 'TrichoWash 250ml',
      subTitle: 'Trichological Scalp Cleansing & Sebomodulating Shampoo',
      dosageForm: 'Topical Scalp Wash / Shampoo (TrichoWash™)',
      volume: '250 mL',
      formula: 'Zinc acetate 0.5% + D-Panthenol 0.5% in TrichoWash™ 250 mL',
      directions: 'Massage for 2 minutes and rinse.',
      posology: {
        regimen: 'Massage for 2 minutes and rinse.',
        timing: 'During shower / hair wash routine',
        notes: 'Sulfate-free cleanser base removes impurities and scalp sebum while protecting physiological barrier ceramides.'
      },
      apis: [
        {
          name: 'Zinc acetate',
          dose: '0.5%',
          dosage: '0.5% (5 mg/mL)',
          activeIngredient: 'Zinc Acetate (USP)',
          pharmacologicalClass: 'Scalp Sebum Regulator & Anti-inflammatory Mineral',
          therapeuticClass: 'Scalp Microbiome & Sebaceous Normalization',
          mechanism: 'Inhibits local 5α-reductase, normalizes sebum production in hyperactive sebaceous glands, and down-regulates pro-inflammatory cytokines around the follicular infundibulum.',
          cellularTarget: 'Infra-infundibular Sebaceous Glands & 5α-Reductase',
          zoho_item_name: 'Zinc Acetate 0.5%',
          zoho_sku: 'zinc_acetate_0-5pct'
        },
        {
          name: 'D-Panthenol',
          dose: '0.5%',
          dosage: '0.5% (5 mg/mL)',
          activeIngredient: 'D-Panthenol (Pro-Vitamin B5)',
          pharmacologicalClass: 'Pro-Vitamin B5 Hydrophilic Humectant & Cuticle Restorative',
          therapeuticClass: 'Hair Shaft Hydration & Tensile Strength',
          mechanism: 'Converts enzymatically to pantothenic acid (coenzyme A constituent), deeply penetrating the hair cuticle and stratum corneum to retain moisture and improve elasticity.',
          cellularTarget: 'Hair Cuticle Keratin & Scalp Epidermis',
          zoho_item_name: 'D-Panthenol 0.5%',
          zoho_sku: 'd_panthenol_0-5pct'
        },
        {
          name: 'TrichoWash™',
          dose: 'q.s. 250 mL',
          dosage: '250 mL',
          activeIngredient: 'TrichoWash™ Sulfate-Free Cleanser Base (Fagron)',
          pharmacologicalClass: 'Dermocompatible Cleansing Base',
          therapeuticClass: 'Gentle Trichological Cleanser',
          mechanism: 'Non-irritating surfactant system cleanses scalp debris and excess DHT-laden sebum without stripping barrier lipids.',
          isVehicleOrBase: true,
          zoho_item_name: 'TrichoWash 250 mL',
          zoho_sku: 'trichowash_250-ml'
        }
      ]
    }
  ];

  // 3. Build flattened items with formulation indexes
  const items = [
    {
      id: 'api-haya-1',
      name: '17-α Estradiol',
      dose: '0.05%',
      dosage: '0.05% (0.5 mg/mL)',
      activeIngredient: '17-α Estradiol (Alfatradiol)',
      category: '5α-Reductase Modulator & Estrogen Stereoisomer',
      therapeuticClass: 'Follicular Miniaturization Reversal',
      mechanism: 'Accelerates conversion of testosterone into estrogens via aromatase stimulation and inhibits local 5α-reductase, preventing hair follicle miniaturization without systemic feminizing effects.',
      cellularTarget: 'Dermal Papilla 5α-Reductase & Aromatase',
      formulationBlock: 'Topical Treatment Solution (TrichoSol™)',
      formulationIndex: 1,
      blockVolume: '100 mL',
      zoho_item_name: '17-alpha Estradiol 0.05%',
      zoho_sku: 'estradiol_17a_0-05pct'
    },
    {
      id: 'api-haya-2',
      name: 'IGrantine-F1 TM',
      dose: '0.5%',
      dosage: '0.5% (5 mg/mL)',
      activeIngredient: 'IGrantine-F1™ (Biotech Hair Growth Factor Complex)',
      category: 'Biomimetic Follicular Peptide Complex',
      therapeuticClass: 'Follicular Anagen Induction & Matrix Stimulation',
      mechanism: 'Upregulates Wnt/β-catenin signaling in dermal papilla cells, increasing vascular endothelial growth factor (VEGF) synthesis to prolong the active anagen hair growth phase.',
      cellularTarget: 'Follicular Wnt/β-Catenin Signaling Pathway',
      formulationBlock: 'Topical Treatment Solution (TrichoSol™)',
      formulationIndex: 1,
      blockVolume: '100 mL',
      zoho_item_name: 'IGrantine-F1 TM 0.5%',
      zoho_sku: 'igrantine_f1_0-5pct'
    },
    {
      id: 'api-haya-3',
      name: 'TrichoSol™',
      dose: 'q.s. 100 mL',
      dosage: '100 mL',
      activeIngredient: 'TrichoSol™ Hydrophilic Phytocomplex Carrier (Fagron)',
      category: 'Patented Trichological Hydrophilic Matrix',
      therapeuticClass: 'Non-Irritating Scalp Delivery Matrix',
      mechanism: 'Mineral and polyphenol phytocomplex enhances solubility and epidermal deposition of compounding APIs without causing flaking or contact dermatitis.',
      isVehicleOrBase: true,
      formulationBlock: 'Topical Treatment Solution (TrichoSol™)',
      formulationIndex: 1,
      blockVolume: '100 mL',
      zoho_item_id: '1183263000013841021',
      zoho_item_name: 'TrichoSol 100 mL',
      zoho_sku: 'trichosol_100-ml',
      zoho_rate: 300
    },
    {
      id: 'api-haya-4',
      name: 'Zinc acetate',
      dose: '0.5%',
      dosage: '0.5% (5 mg/mL)',
      activeIngredient: 'Zinc Acetate (USP)',
      category: 'Scalp Sebum Regulator & Anti-inflammatory Mineral',
      therapeuticClass: 'Scalp Microbiome & Sebaceous Normalization',
      mechanism: 'Inhibits local 5α-reductase, normalizes sebum production in hyperactive sebaceous glands, and down-regulates pro-inflammatory cytokines around the follicular infundibulum.',
      cellularTarget: 'Infra-infundibular Sebaceous Glands & 5α-Reductase',
      formulationBlock: 'Scalp Care and Hygiene Cleanser (TrichoWash™)',
      formulationIndex: 2,
      blockVolume: '250 mL',
      zoho_item_name: 'Zinc Acetate 0.5%',
      zoho_sku: 'zinc_acetate_0-5pct'
    },
    {
      id: 'api-haya-5',
      name: 'D-Panthenol',
      dose: '0.5%',
      dosage: '0.5% (5 mg/mL)',
      activeIngredient: 'D-Panthenol (Pro-Vitamin B5)',
      category: 'Pro-Vitamin B5 Hydrophilic Humectant & Cuticle Restorative',
      therapeuticClass: 'Hair Shaft Hydration & Tensile Strength',
      mechanism: 'Converts enzymatically to pantothenic acid (coenzyme A constituent), deeply penetrating the hair cuticle and stratum corneum to retain moisture and improve elasticity.',
      cellularTarget: 'Hair Cuticle Keratin & Scalp Epidermis',
      formulationBlock: 'Scalp Care and Hygiene Cleanser (TrichoWash™)',
      formulationIndex: 2,
      blockVolume: '250 mL',
      zoho_item_name: 'D-Panthenol 0.5%',
      zoho_sku: 'd_panthenol_0-5pct'
    },
    {
      id: 'api-haya-6',
      name: 'TrichoWash™',
      dose: 'q.s. 250 mL',
      dosage: '250 mL',
      activeIngredient: 'TrichoWash™ Sulfate-Free Cleanser Base (Fagron)',
      category: 'Dermocompatible Cleansing Base',
      therapeuticClass: 'Gentle Trichological Cleanser',
      mechanism: 'Non-irritating surfactant system cleanses scalp debris and excess DHT-laden sebum without stripping barrier lipids.',
      isVehicleOrBase: true,
      formulationBlock: 'Scalp Care and Hygiene Cleanser (TrichoWash™)',
      formulationIndex: 2,
      blockVolume: '250 mL',
      zoho_item_name: 'TrichoWash 250 mL',
      zoho_sku: 'trichowash_250-ml'
    }
  ];

  const prescriptionLines = [
    { drugName: '17-α Estradiol', strength: '0.05% (0.5 mg/mL)', instructions: 'Apply at night to scalp before bedtime (TrichoSol™ 100 mL)' },
    { drugName: 'IGrantine-F1 TM', strength: '0.5% (5 mg/mL)', instructions: 'Apply at night to scalp before bedtime (TrichoSol™ 100 mL)' },
    { drugName: 'TrichoSol™ Vehicle', strength: 'q.s. 100 mL', instructions: 'Hydrophilic vehicle (Fagron Genomics)' },
    { drugName: 'Zinc acetate', strength: '0.5% (5 mg/mL)', instructions: 'Massage for 2 minutes and rinse (TrichoWash™ 250 mL)' },
    { drugName: 'D-Panthenol', strength: '0.5% (5 mg/mL)', instructions: 'Massage for 2 minutes and rinse (TrichoWash™ 250 mL)' },
    { drugName: 'TrichoWash™ Base', strength: 'q.s. 250 mL', instructions: 'Sulfate-free scalp cleanser base (Fagron Genomics)' }
  ];

  // 4. Construct complete prescription document
  const rxPayload = {
    id: RX_ID,
    prescriptionCode: RX_ID,
    prescriptionNumber: RX_ID,
    code: CODE,
    fileNumber: CODE,
    sampleId: CODE,
    sampleCode: CODE,
    nationalId: '29763404111',
    patientId: PATIENT_ID,
    patientName: 'Haya Hassen Al-Haidose',
    patientDob: '1997-04-11',
    patientAge: 29,
    patientGender: 'Female',
    patient: {
      id: PATIENT_ID,
      name: 'Haya Hassen Al-Haidose',
      fullName: 'Haya Hassen Al-Haidose',
      dob: '1997-04-11',
      dateOfBirth: '11-04-1997',
      age: 29,
      gender: 'Female',
      nationalId: '29763404111',
      fileNumber: CODE,
      sampleCode: CODE
    },
    doctorName: 'Dr. Sezgin Cagatay',
    prescribingDoctor: 'Dr. Sezgin Cagatay (Hortman Clinics, Dubai)',
    doctorLicense: 'DHA-00013060-006',
    clinic: 'Hortman Clinics, Dubai',
    clinicName: 'Hortman Clinics, Dubai',
    treatingDoctor: {
      name: 'Dr. Sezgin Cagatay',
      displayName: 'Dr. Sezgin Cagatay',
      title: 'Dr. Sezgin Cagatay',
      clinic: 'Hortman Clinics, Dubai',
      license: 'DHA-00013060-006'
    },
    doctor: {
      id: 'dr-sezgin-cagatay',
      name: 'Dr. Sezgin Cagatay',
      displayName: 'Dr. Sezgin Cagatay',
      title: 'Dr. Sezgin Cagatay',
      email: 'sezgin@hortmanclinics.com',
      specialty: 'Hair Restoration Surgery & Clinical Trichology',
      clinic: 'Hortman Clinics, Dubai',
      clinicName: 'Hortman Clinics, Dubai',
      license: 'DHA-00013060-006',
      city: 'Dubai',
      country: 'United Arab Emirates',
      address: 'Hortman Clinics, Villa 823, Jumeirah St., Dubai, UAE',
      phone: '+971 4 566 2615'
    },
    status: 'approved',
    approvalStatus: 'approved',
    intakeState: 'verified_active',
    isAtlasRegistered: true,
    atlasRegistration: {
      registeredAt: now,
      registeredBy: 'Atlas System Ingestion',
      status: 'registered',
      reviewSatisfied: true,
      notes: 'Official Fagron Genomics TrichoTest™ report ingested from signed documentation BOX01399AATRI'
    },
    isMultiPart: true,
    totalParts: 2,
    partNumber: 1,
    date: '29/05/2024',
    prescriptionDate: '2024-05-29',
    labReceivedDate: '2024-05-23',
    labResultsDate: '2024-05-29',
    sampleType: 'Buccal Swab',
    genomicsTest: 'Fagron Genomics TrichoTest™',
    treatmentProgram: 'Fagron Genomics TrichoTest™ Precision Scalp Protocol',
    treatmentTitle: 'TrichoSol™ 100mL (Topical) + TrichoWash™ 250mL (Scalp Hygiene)',
    formula: 'Part 1: 17-α Estradiol 0.05% + IGrantine-F1 0.5% in TrichoSol™ 100 mL | Part 2: Zinc acetate 0.5% + D-Panthenol 0.5% in TrichoWash™ 250 mL',
    dosageInstructions: 'Part 1: Apply 1 mL topically to scalp at night before bedtime. Part 2: Massage TrichoWash into scalp for 2 minutes and rinse.',
    posology: {
      summary: 'Part 1: Apply at night before bedtime. Leave on scalp as long as possible. Part 2: Massage 2 minutes and rinse.',
      timing: 'Bedtime (Topical) / Shower (Wash)',
      notes: 'TrichoSol™ and TrichoWash™ formulations engineered specifically based on patient genetic polymorphisms.'
    },
    clinicalWarnings: [
      'For topical scalp use only. Do not ingest.',
      'Avoid contact with eyes, broken skin, or mucous membranes.',
      'Leave topical solution on scalp for as long as possible before washing the next day.'
    ],
    specialCompoundingRequirements: [
      'TrichoSol™ patented hydrophilic vehicle (Fagron Genomics)',
      'TrichoWash™ gentle trichological cleanser base (Fagron Genomics)',
      'Alcohol-free, propylene glycol-free vehicles to prevent contact dermatitis'
    ],
    phases,
    items,
    prescriptionLines,
    batchCode: 'PHARM-2024-TRI-BOX01399',
    batchNumber: 'PHARM-2024-TRI-BOX01399',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    canonicalUrl: `https://www.atlashealth-services.com/rx/${CODE}`,
    publicUrl: `https://www.atlashealth-services.com/rx/${CODE}`,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  // Write primary doc: prescriptions/RX-BOX01399AATRI
  await db.collection('prescriptions').doc(RX_ID).set(rxPayload, { merge: true });
  console.log(`✅ Prescription written: prescriptions/${RX_ID}`);

  console.log('🎉 Successfully completed ingestion for Haya Hassen Al-Haidose (BOX01399AATRI)!');
  process.exit(0);
}

ingest().catch((err) => {
  console.error('❌ Error during ingestion:', err);
  process.exit(1);
});

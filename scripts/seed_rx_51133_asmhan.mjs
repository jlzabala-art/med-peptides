/**
 * scripts/seed_rx_51133_asmhan.mjs
 *
 * Seeds the prescription for:
 *   Patient: Asmhan Khalfan Mohammed Khalifa Bu Sari Al Suwaid
 *   File Number: 51133
 *   Formula: Sleep & Stress Support
 *   Date: 02/10/2026
 *
 * Treating Doctor: Dr. Marina Cordeiro Fernandes (DHA 91105367) – NOVA Plastic Surgery Clinic
 * Reviewing Doctor: Dra. Haydee Camacho Gamboa (Colegiado 46759) – Clínica Dra Camacho, Barcelona/España
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

async function run() {
  console.log('🚀 Seeding prescription RX-51133 (Asmhan Khalfan – Sleep & Stress Support)...');

  // ── 1. Patient Profile ───────────────────────────────────────────────────────
  const patientId = '5HSLXaZOHDi78iGzxUEy'; // Existing patient doc in Firestore
  const patientData = {
    id: patientId,
    fileNumber: '51133',
    name: 'Asmhan Khalfan Mohammed Khalifa Bu Sari Al Suwaid',
    fullName: 'Asmhan Khalfan Mohammed Khalifa Bu Sari Al Suwaid',
    dob: '1980-07-01',
    age: 46,
    gender: 'Female',
    status: 'active',
    primaryGoal: 'Sleep & Stress Support',
    doctorId: 'dr-marina-cordeiro-fernandes',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    supervisingDoctor: 'Dra. Haydee Camacho Gamboa',
    clinic: 'NOVA Clinic',
    clinicName: 'NOVA Clinic',
    source: 'clinical_prescription_import',
    updatedAt: new Date().toISOString()
  };

  // Update existing patient doc with fileNumber and new prescription reference
  await db.collection('patients').doc(patientId).set({
    ...patientData,
    prescriptions: admin.firestore.FieldValue.arrayUnion('RX-51133'),
    activePrescriptionId: 'RX-51133'
  }, { merge: true });
  console.log('✓ Patient updated: Asmhan Khalfan Mohammed Khalifa Bu Sari Al Suwaid (fileNumber: 51133)');

  // ── 2. Prescription Document ─────────────────────────────────────────────────
  const rxDoc = {
    prescriptionCode: 'RX-51133',
    prescriptionNumber: 'RX-51133',
    code: '51133',
    fileNumber: '51133',
    status: 'approved',
    validationStatus: 'Ready',
    quotationStatus: 'Pending',
    orderStatus: 'Pending',
    sourceType: 'clinical_prescription',
    source: 'nova_clinic',
    importSource: 'manual_clinical_import',
    isAtlasRegistered: true,
    isPublicIntake: false,
    isMultiPart: false,

    // Clinical Dates
    date: '02/10/2026',
    prescriptionDate: '2026-10-02',

    // Patient Identification
    patientId: patientId,
    patientName: 'Asmhan Khalfan Mohammed Khalifa Bu Sari Al Suwaid',
    patientDob: '1980-07-01',
    patientGender: 'Female',
    patient: {
      id: patientId,
      name: 'Asmhan Khalfan Mohammed Khalifa Bu Sari Al Suwaid',
      fullName: 'Asmhan Khalfan Mohammed Khalifa Bu Sari Al Suwaid',
      fileNumber: '51133',
      dob: '1980-07-01',
      age: 46,
      gender: 'Female'
    },

    // Treating Doctor (Prescribing Physician)
    doctorId: 'dr-marina-cordeiro-fernandes',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    prescribingDoctor: 'Dr. Marina Cordeiro Fernandes',
    treatingDoctor: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinic: 'NOVA Clinic',
    clinicName: 'NOVA Clinic',
    doctor: {
      id: 'dr-marina-cordeiro-fernandes',
      name: 'Dr. Marina Cordeiro Fernandes',
      title: 'General Practitioner · Aesthetic & Longevity Medicine',
      license: 'DHA-91105367',
      dhaLicense: '91105367',
      clinic: 'NOVA Plastic Surgery Clinic',
      clinicName: 'NOVA Plastic Surgery Clinic',
      city: 'Dubai',
      country: 'United Arab Emirates'
    },

    // Reviewing / Supervising Doctor (Pharmacological & Safety Review)
    supervisingDoctor: 'Dra. Haydee Camacho Gamboa (Col. 46759 COMB)',
    reviewingDoctor: {
      name: 'Dra. Haydee Camacho Gamboa',
      title: 'Pharmacological and Safety Review',
      license: 'Colegiado 46759',
      clinic: 'Clínica Dra Camacho',
      city: 'Barcelona',
      country: 'España'
    },

    // Formula & Treatment
    formula: 'Magnesium Glycinate 400 mg + Vitamin B6 (P5P) 10 mg + L-Theanine 200 mg + GABA 400 mg + Zinc (Bisglycinate) 15 mg + Melatonin (Slow Release) 5 mg',
    formulaName: 'Formula Sleep & Stress Support',
    treatmentProgram: 'Personalized Compounded Nutriceutical Protocol',
    treatmentType: 'Sleep & Stress Support Formula (Vegetarian Capsules)',
    dosageForm: 'Vegetarian Capsules',
    dispensingForm: 'Vegetarian Capsules',
    duration: '3 months',
    quantity: '90 capsules (3 Months)',
    volume: '90 capsules (3 Months)',

    // Posology
    dosageInstructions: 'Take 1 dose orally before bedtime.',
    posology: {
      regimen: 'Take 1 dose orally before bedtime.',
      timing: 'Before bedtime (evening)',
      notes: 'Vegetarian capsules. Gluten-free, lactose-free, additive-free, and dye-free. Duration: 3 months.'
    },

    // Characteristics & Warnings
    characteristics: 'Gluten-free, lactose-free, additive-free, and dye-free.',
    clinicalWarnings: [
      'Store in a cool, dry place away from direct sunlight.',
      'Melatonin may cause drowsiness — do not drive or operate machinery after taking.',
      'Notify your treating physician if pregnant or planning conception.'
    ],
    specialCompoundingRequirements: [
      'Vegetarian capsules (HPMC)',
      'Magnesium as Glycinate chelate (highly bioavailable)',
      'Vitamin B6 as Pyridoxal-5-Phosphate (P5P — active coenzyme form)',
      'GABA Pharmaceutical Grade',
      'Zinc as Zinc Bisglycinate (elemental zinc 15 mg)',
      'Melatonin Slow Release formulation',
      'Gluten-free, lactose-free, additive-free, dye-free excipients'
    ],

    // Prescription Lines (summary view)
    prescriptionLines: [
      { drugName: 'Magnesium Glycinate', strength: '400 mg', instructions: '1 dose before bedtime' },
      { drugName: 'Vitamin B6 (as P5P)', strength: '10 mg', instructions: '1 dose before bedtime' },
      { drugName: 'L-Theanine', strength: '200 mg', instructions: '1 dose before bedtime' },
      { drugName: 'GABA (Pharmaceutical Grade)', strength: '400 mg', instructions: '1 dose before bedtime' },
      { drugName: 'Zinc (as Zinc Bisglycinate)', strength: '15 mg elemental zinc', instructions: '1 dose before bedtime' },
      { drugName: 'Melatonin (Slow Release)', strength: '5 mg', instructions: '1 dose before bedtime' }
    ],

    // Detailed Items (API-level clinical data)
    items: [
      {
        id: 'api-51133-1',
        name: 'Magnesium Glycinate',
        activeIngredient: 'Magnesium (as Magnesium Bisglycinate Chelate)',
        dose: '400 mg',
        dosage: '400 mg',
        category: 'Essential Mineral Chelate',
        therapeuticClass: 'GABA-Receptor Positive Modulation & Neuromuscular Relaxation',
        mechanism: 'Magnesium acts as a physiological calcium channel blocker and positive allosteric modulator of GABA-A receptors, promoting neuronal inhibition, reducing cortisol-driven excitatory tone, and facilitating parasympathetic dominance for sleep onset.',
        cellularTarget: 'GABA-A Receptors & NMDA Glutamate Receptor Antagonism',
        instructions: 'Take 1 dose orally before bedtime'
      },
      {
        id: 'api-51133-2',
        name: 'Vitamin B6 (as P5P)',
        activeIngredient: 'Pyridoxal-5-Phosphate (P5P — Active Coenzyme Form of Vitamin B6)',
        dose: '10 mg',
        dosage: '10 mg',
        category: 'Active Coenzyme B-Vitamin',
        therapeuticClass: 'Neurotransmitter Biosynthesis Co-Factor',
        mechanism: 'P5P is the metabolically active coenzyme form of vitamin B6, serving as an essential co-factor for glutamic acid decarboxylase (GAD), the rate-limiting enzyme that converts glutamate to GABA, and for aromatic L-amino acid decarboxylase (AADC) which converts 5-HTP to serotonin and subsequently to melatonin.',
        cellularTarget: 'GAD (Glutamic Acid Decarboxylase) & AADC (Aromatic L-Amino Acid Decarboxylase)',
        instructions: 'Take 1 dose orally before bedtime'
      },
      {
        id: 'api-51133-3',
        name: 'L-Theanine',
        activeIngredient: 'L-Theanine (γ-glutamylethylamide)',
        dose: '200 mg',
        dosage: '200 mg',
        category: 'Amino Acid Anxiolytic',
        therapeuticClass: 'Alpha-Wave Induction & Glutamate Modulation',
        mechanism: 'L-Theanine crosses the blood-brain barrier and promotes dose-dependent increases in alpha-wave EEG activity (8–13 Hz), indicative of calm wakefulness. It modulates glutamate and GABA neurotransmission, increases brain serotonin and dopamine concentrations, and reduces cortisol and sympathetic nervous system arousal.',
        cellularTarget: 'Central Glutamate/GABA Neurotransmitter Systems & Alpha-Wave Neural Oscillation',
        instructions: 'Take 1 dose orally before bedtime'
      },
      {
        id: 'api-51133-4',
        name: 'GABA (Pharmaceutical Grade)',
        activeIngredient: 'Gamma-Aminobutyric Acid (GABA — Pharmaceutical Grade)',
        dose: '400 mg',
        dosage: '400 mg',
        category: 'Inhibitory Neurotransmitter',
        therapeuticClass: 'Central Nervous System Inhibition & Anxiolysis',
        mechanism: 'GABA is the principal inhibitory neurotransmitter in the mammalian CNS. Supplemental GABA has been shown to increase alpha-wave production and decrease beta-wave activity within 60 minutes of oral administration, promoting subjective relaxation, reducing anxiety biomarkers (salivary cortisol, chromogranin A), and facilitating sleep onset latency reduction.',
        cellularTarget: 'GABA-A & GABA-B Receptors in Cortex, Thalamus & Limbic System',
        instructions: 'Take 1 dose orally before bedtime'
      },
      {
        id: 'api-51133-5',
        name: 'Zinc (as Zinc Bisglycinate)',
        activeIngredient: 'Zinc (as Zinc Bisglycinate — 15 mg elemental zinc)',
        dose: '15 mg elemental zinc',
        dosage: '15 mg elemental zinc',
        category: 'Essential Trace Mineral Chelate',
        therapeuticClass: 'Melatonin Synthesis Co-Factor & Immune Modulation',
        mechanism: 'Zinc is an essential co-factor for over 300 enzymatic reactions, including those involved in melatonin synthesis and tryptophan metabolism. Zinc modulates NMDA receptor activity, supports GABAergic neurotransmission, and plays a critical role in the hypothalamic-pituitary-adrenal (HPA) axis regulation, reducing excessive cortisol output.',
        cellularTarget: 'NMDA Receptors & Pineal Melatonin Synthesis Enzymes (AANAT/ASMT)',
        instructions: 'Take 1 dose orally before bedtime'
      },
      {
        id: 'api-51133-6',
        name: 'Melatonin (Slow Release)',
        activeIngredient: 'Melatonin (N-acetyl-5-methoxytryptamine — Slow Release / Extended Release formulation)',
        dose: '5 mg',
        dosage: '5 mg',
        category: 'Endogenous Chronobiotic Hormone',
        therapeuticClass: 'Circadian Rhythm Entrainment & Sleep Architecture Optimization',
        mechanism: 'Melatonin is the endogenous chronobiotic hormone secreted by the pineal gland in response to darkness. It acts primarily on MT1 and MT2 melatonin receptors in the suprachiasmatic nucleus (SCN) to entrain circadian rhythms, reduce sleep onset latency, and improve overall sleep architecture. The slow-release formulation mimics the physiological 6–8 hour secretion curve, maintaining plasma levels through the biological night to reduce nocturnal awakenings.',
        cellularTarget: 'MT1 & MT2 Melatonin Receptors in Suprachiasmatic Nucleus (SCN)',
        instructions: 'Take 1 dose orally before bedtime'
      }
    ],

    // URLs & References
    pdfUrl: '/prescriptions/RX-51133-Asmhan-Al-Suwaid.png',
    imageUrl: '/prescriptions/RX-51133-Asmhan-Al-Suwaid.png',
    canonicalUrl: 'https://www.atlashealth-services.com/rx/RX-51133',
    publicUrl: 'https://www.atlashealth-services.com/rx/RX-51133',

    // Timestamps
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  // Write prescription with document ID 'RX-51133'
  await db.collection('prescriptions').doc('RX-51133').set(rxDoc, { merge: true });
  console.log('✓ Prescription RX-51133 written to Firestore (doc ID: RX-51133)');

  // Write alias with doc ID '51133' for fileNumber lookup
  await db.collection('prescriptions').doc('51133').set({
    ...rxDoc,
    prescriptionCode: '51133',
    canonicalUrl: 'https://www.atlashealth-services.com/rx/51133',
    publicUrl: 'https://www.atlashealth-services.com/rx/51133'
  }, { merge: true });
  console.log('✓ Prescription alias 51133 written to Firestore (doc ID: 51133)');

  console.log('\n✅ PRESCRIPTION RX-51133 (Asmhan Khalfan – Sleep & Stress Support) SUCCESSFULLY INGESTED!');
  console.log('   → Public URL: https://www.atlashealth-services.com/rx/RX-51133');
  console.log('   → Alias URL:  https://www.atlashealth-services.com/rx/51133');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});

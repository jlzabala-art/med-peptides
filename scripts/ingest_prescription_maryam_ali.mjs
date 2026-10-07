/**
 * scripts/ingest_prescription_maryam_ali.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Ingestion for Sleep & Circadian Prescription:
 *   - Patient: Maryam A M Ali (File Number: 51036 · DOB: 04/08/1952 · Age: 73)
 *   - Prescribing Physician: Dra. Haydee Camacho Gamboa (COMB 46759)
 *   - Clinic: Clínica Dra. Camacho (Barcelona, España)
 *   - Formulations (2 Parts):
 *       Part 1: Personalized Evening Formula (Mg Glycinate, Tryptophan, P5P, Theanine, GABA, Valerian)
 *       Part 2: Personalized Extended-Release Melatonin 1 mg
 *   - Duration: 2 months (60 daily doses)
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
const RX_CODE = 'RX-51036';
const FILE_NUMBER = '51036';

export async function run() {
  console.log(`\n══════════════════════════════════════════════════════════════`);
  console.log(`🌙 Ingesting Sleep Regimen: Maryam A M Ali (${RX_CODE})`);
  console.log(`🏥 Clinic: Clínica Dra. Camacho (Barcelona, España)`);
  console.log(`👩‍⚕️ Prescribing Physician: Dra. Haydee Camacho Gamboa (COMB 46759)`);
  console.log(`══════════════════════════════════════════════════════════════\n`);

  // Build Prescription Parts
  const parts = [
    {
      partNumber: 1,
      totalParts: 2,
      title: 'Personalized Evening Neuro-Relaxation Formula',
      badge: 'PART 1 OF 2 · GABAERGIC SLEEP INDUCTION',
      format: 'Vegetable Capsules (HPMC, Clean Label)',
      volume: '60 Daily Doses (2-Month Supply)',
      posology: 'Take 1 dose 30-60 minutes before bedtime.',
      directions: 'Take 1 dose 30-60 minutes before bedtime with a glass of water.',
      accentColor: '#4f46e5',
      accentBg: '#eef2ff',
      borderAccent: '#c7d2fe',
      clinicalPurpose: 'Promotes relaxation of the nervous system, supports GABAergic transmission, reduces nighttime mental overactivity, and encourages deep restorative slow-wave sleep.',
      apis: [
        {
          id: 'api-mg-glycinate',
          name: 'Magnesium Glycinate',
          dose: '400 mg',
          percentage: '400 mg',
          pharmacologicalClass: 'Chelated Mineral / NMDA Receptor Modulator',
          therapeuticClass: 'Neuromuscular Relaxation & GABA Support',
          clinicalIndication: 'Nocturnal Muscle Tension & Central Hyperarousal',
          cellularTarget: 'NMDA Receptor Glycine Co-agonist Site & Muscle End-Plates',
          mechanismOfAction: 'Blocks excitatory NMDA receptors, relaxes vascular and muscular smooth muscle, and acts as essential enzymatic cofactor in GABAergic and serotonergic synthesis.'
        },
        {
          id: 'api-tryptophan',
          name: 'L-Tryptophan',
          dose: '500 mg',
          percentage: '500 mg',
          pharmacologicalClass: 'Essential Amino Acid / Neurotransmitter Precursor',
          therapeuticClass: 'Serotonin & Melatonin Biosynthetic Substrate',
          clinicalIndication: 'Sleep Architecture Disruption & Mood Stabilization',
          cellularTarget: 'Tryptophan Hydroxylase (TPH) / Pineal-Raphe Nuclei Axis',
          mechanismOfAction: 'Passes blood-brain barrier to serve as rate-limiting substrate for 5-HTP, serotonin, and subsequent nocturnal melatonin synthesis.'
        },
        {
          id: 'api-p5p',
          name: 'Pyridoxal-5-Phosphate (P5P)',
          dose: '20 mg',
          percentage: '20 mg',
          pharmacologicalClass: 'Active Bioavailable Co-Enzymatic Vitamin B6',
          therapeuticClass: 'Decarboxylation Enzyme Co-factor',
          clinicalIndication: 'Neurotransmitter Enzymatic Cofactor Deficit',
          cellularTarget: 'Aromatic L-Amino Acid Decarboxylase (AADC) & GAD Enzymes',
          mechanismOfAction: 'Active co-enzymatic form of Vitamin B6 catalyzing decarboxylation of L-tryptophan into serotonin and glutamate into inhibitory GABA.'
        },
        {
          id: 'api-theanine',
          name: 'L-Theanine',
          dose: '300 mg',
          percentage: '300 mg',
          pharmacologicalClass: 'Glutamate Analog Phyto-Nutrient',
          therapeuticClass: 'Central Alpha-Wave EEG Induction',
          clinicalIndication: 'Pre-somnolent Mental Hyperactivity & Rumination',
          cellularTarget: 'NMDA/AMPA Glutamate Receptors & Cortical GABAergic Interneurons',
          mechanismOfAction: 'Antagonizes central glutamate receptors and promotes occipital alpha-band brain wave activity (8–12 Hz), generating calm alertness transitioning to physiological somnolence.'
        },
        {
          id: 'api-gaba',
          name: 'GABA (Pharmaceutical Grade)',
          dose: '250 mg',
          percentage: '250 mg',
          pharmacologicalClass: 'Primary Inhibitory Neurotransmitter',
          therapeuticClass: 'Central Autonomic Tone Down-Regulation',
          clinicalIndication: 'Sympathetic Hyperdrive & Sleep Initiation Latency',
          cellularTarget: 'GABA-A Receptor Ligand-Gated Chloride Channels',
          mechanismOfAction: 'Activates postsynaptic GABA-A receptors, inducing intracellular chloride influx, membrane hyperpolarization, and inhibition of action potential firing.'
        },
        {
          id: 'api-valerian',
          name: 'Valerian Root Extract (Standardized)',
          dose: '300 mg',
          percentage: '300 mg',
          pharmacologicalClass: 'Valerenic Acid Phyto-Complex',
          therapeuticClass: 'GABA Catabolism Inhibitor & Adenosine Receptor Agonist',
          clinicalIndication: 'Sleep Fragmentation & Delayed Sleep Phase',
          cellularTarget: 'GABA Transaminase (GABA-T) & Adenosine A1 Receptors',
          mechanismOfAction: 'Valerenic acid allosterically modulates GABA-A beta-3 subunits and inhibits GABA breakdown, raising physiological synaptic GABA levels.'
        }
      ]
    },
    {
      partNumber: 2,
      totalParts: 2,
      title: 'Personalized Extended-Release Melatonin',
      badge: 'PART 2 OF 2 · CIRCADIAN RHYTHM REGULATION',
      format: 'Extended-Release Vegetable Capsule (Modified Dissolution)',
      volume: '60 Capsules (2-Month Supply)',
      posology: 'Take 1 dose 1-2 hours before bedtime.',
      directions: 'Take 1 capsule with water 1 to 2 hours before planned bedtime.',
      accentColor: '#0284c7',
      accentBg: '#f0f9ff',
      borderAccent: '#bae6fd',
      clinicalPurpose: 'Regulates circadian phase and supports continuous sleep maintenance throughout the night. Formulated to mimic the physiological 6-8 hour nocturnal melatonin secretion curve without high-dose desensitization.',
      apis: [
        {
          id: 'api-melatonin-xr',
          name: 'Melatonin (Extended-Release)',
          dose: '1 mg',
          percentage: '1 mg',
          pharmacologicalClass: 'Pineal Indoleamine Neuro-Hormone / Circadian Chronobiotic',
          therapeuticClass: 'Suprachiasmatic Nucleus Circadian Phase Resetter',
          clinicalIndication: 'Age-Related Pineal Calcification & Sleep Fragmentation (ICD-10 G47.0)',
          cellularTarget: 'High-Affinity Gi-Protein Coupled Melatonin MT1 & MT2 Receptors',
          mechanismOfAction: 'Activates MT1 receptors in hypothalamic suprachiasmatic nucleus (SCN) to suppress neuronal firing and trigger sleep initiation; binds MT2 receptors to shift circadian phase. Extended-release delivery prevents middle-of-the-night awakening.'
        }
      ]
    }
  ];

  // Flat items array for legacy and analytics compatibility
  const items = [
    {
      name: 'Magnesium Glycinate',
      dose: '400 mg',
      activeIngredient: 'Magnesium Glycinate',
      pharmacologicalClass: 'Chelated Mineral / NMDA Antagonist',
      formulationBlock: 'Personalized Evening Neuro-Relaxation Formula',
      formulationIndex: 1
    },
    {
      name: 'L-Tryptophan',
      dose: '500 mg',
      activeIngredient: 'L-Tryptophan',
      pharmacologicalClass: 'Serotonin/Melatonin Precursor',
      formulationBlock: 'Personalized Evening Neuro-Relaxation Formula',
      formulationIndex: 1
    },
    {
      name: 'Pyridoxal-5-Phosphate (P5P)',
      dose: '20 mg',
      activeIngredient: 'P5P',
      pharmacologicalClass: 'Active Co-Enzyme B6',
      formulationBlock: 'Personalized Evening Neuro-Relaxation Formula',
      formulationIndex: 1
    },
    {
      name: 'L-Theanine',
      dose: '300 mg',
      activeIngredient: 'L-Theanine',
      pharmacologicalClass: 'Alpha-Wave EEG Inducer',
      formulationBlock: 'Personalized Evening Neuro-Relaxation Formula',
      formulationIndex: 1
    },
    {
      name: 'GABA (Pharmaceutical Grade)',
      dose: '250 mg',
      activeIngredient: 'GABA',
      pharmacologicalClass: 'Inhibitory Neurotransmitter',
      formulationBlock: 'Personalized Evening Neuro-Relaxation Formula',
      formulationIndex: 1
    },
    {
      name: 'Valerian Root Extract',
      dose: '300 mg',
      activeIngredient: 'Valerenic Acid Extract',
      pharmacologicalClass: 'GABA-T Inhibitor',
      formulationBlock: 'Personalized Evening Neuro-Relaxation Formula',
      formulationIndex: 1
    },
    {
      name: 'Melatonin (Extended-Release)',
      dose: '1 mg',
      activeIngredient: 'Melatonin XR',
      pharmacologicalClass: 'Chronobiotic MT1/MT2 Agonist',
      formulationBlock: 'Personalized Extended-Release Melatonin',
      formulationIndex: 2
    }
  ];

  const prescriptionPayload = {
    prescriptionId: RX_CODE,
    prescriptionCode: RX_CODE,
    code: RX_CODE,
    id: RX_CODE,
    fileNumber: FILE_NUMBER,
    patientName: 'Maryam A M Ali',
    patient: {
      name: 'Maryam A M Ali',
      fullName: 'Maryam A M Ali',
      id: 'pat_51036_maryam_ali',
      patientId: FILE_NUMBER,
      fileNumber: FILE_NUMBER,
      dob: '04/08/1952',
      birthDate: '1952-08-04',
      age: 73,
      gender: 'Female'
    },
    patientId: FILE_NUMBER,
    patientDob: '04/08/1952',
    patientAge: 73,
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
    treatmentProgram: 'Neuro-Endocrine Sleep & Circadian Restoration',
    treatmentType: 'Personalized Compounded Circadian Neuro-Nutraceuticals',
    treatmentTitle: 'Personalized Evening Formula & Extended-Release Melatonin',
    diagnosis: 'G47.0 – Insomnia / Age-Related Circadian Phase Disruption',
    duration: '2 months',
    dispense: '2-month supply (60 daily doses Part 1 + 60 capsules Part 2)',
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
    totalApisCount: 7,
    totalParts: 2,
    summary: 'Dual-phase neuro-endocrine sleep restoration protocol: Evening GABAergic and amino acid formula for autonomic down-regulation paired with micro-encapsulated physiological extended-release melatonin (1 mg) for sustained nocturnal sleep maintenance.',
    clinicalNotes: 'Non-habit forming botanical and micronutrient formulation. Replaces addictive GABA-A sedative-hypnotics. Extended-release melatonin mimics physiological nocturnal secretion profile in patients over 65 years with age-related pineal calcification.',
    dispensingForm: 'Compounded Oral Regimen (Vegetable Capsules)',
    posology: 'Part 1 (Evening Formula): 1 dose 30-60 min before bed. Part 2 (Melatonin XR): 1 capsule 1-2 hours before bed.',
    dateIssued: '2026-07-02',
    date: '02/07/2026',
    dateFormatted: 'Jul 2, 2026',
    createdAt: new Date().toISOString(),
    createdAt_ts: Date.now(),
    updatedAt: new Date().toISOString()
  };

  // Save to RX-51036
  await db.collection('prescriptions').doc(RX_CODE).set(prescriptionPayload, { merge: true });
  console.log(`✅ Saved Prescription to [prescriptions/${RX_CODE}]`);

  // Mirror to 51036 for barcode or file number direct lookup
  await db.collection('prescriptions').doc(FILE_NUMBER).set(prescriptionPayload, { merge: true });
  console.log(`✅ Saved Mirror Prescription to [prescriptions/${FILE_NUMBER}]`);

  console.log(`\n🎉 Ingestion Completed Successfully!`);
  console.log(`   - Prescription: ${RX_CODE}`);
  console.log(`   - Patient: Maryam A M Ali (File #51036 · Age 73)`);
  console.log(`   - Prescribing Physician: Dra. Haydee Camacho Gamboa (COMB 46759)`);
  console.log(`   - Clinic: Clínica Dra. Camacho (Barcelona, España)`);
  console.log(`   - 2 Parts: Evening Neuro Formula (6 APIs) + Extended-Release Melatonin 1 mg`);
  console.log(`   - Status: draft (awaiting_atlas_review, ~24h SLA)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(console.error);
}

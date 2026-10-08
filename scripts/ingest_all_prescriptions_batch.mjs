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
  console.log('🚀 Starting batch prescription ingestion...');

  // 1. Register Dr. Marina Cordeiro Fernandes in physicians
  const drMarinaRef = db.collection('physicians').doc('dr-marina-cordeiro-fernandes');
  await drMarinaRef.set({
    id: 'dr-marina-cordeiro-fernandes',
    name: 'Dr. Marina Cordeiro Fernandes',
    fullName: 'Dr. Marina Cordeiro Fernandes',
    title: 'General Practitioner · Aesthetic & Longevity Medicine',
    license: 'DHA-91105367',
    dhaLicense: '91105367',
    clinic: 'NOVA Clinic / NOVA Plastic Surgery Clinic',
    clinicName: 'NOVA Clinic',
    address: 'Al Wasl Road, Jumeirah, Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    phone: '+971 4 384 5666',
    specialty: 'Functional & Anti-Aging Medicine · Personalized Compounding',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('✓ Doctor registered: Dr. Marina Cordeiro Fernandes');

  // =========================================================================
  // CASE 1: Amna Sultan Mohamed Ahmed Alotaiba (File 51857)
  // =========================================================================
  const patientAmna = {
    id: 'amna-alotaiba',
    fileNumber: '51857',
    name: 'Amna Sultan Mohamed Ahmed Alotaiba',
    fullName: 'Amna Sultan Mohamed Ahmed Alotaiba',
    dob: '2001-06-14',
    age: 25,
    gender: 'Female',
    nationality: 'UAE',
    status: 'active',
    primaryGoal: 'Cardiometabolic Optimization & Androgen Balance',
    doctorId: 'dr-marina-cordeiro-fernandes',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    supervisingDoctor: 'Dra. Haydee Camacho Gamboa',
    clinic: 'NOVA Clinic',
    clinicName: 'NOVA Clinic',
    prescriptions: ['RX-51857-A', 'RX-51857-B'],
    activePrescriptionId: 'RX-51857-A',
    source: 'clinical_prescription_import',
    updatedAt: new Date().toISOString()
  };
  await db.collection('patients').doc('amna-alotaiba').set(patientAmna, { merge: true });

  const rxAmnaA = {
    prescriptionCode: 'RX-51857-A',
    prescriptionNumber: 'RX-51857-A',
    code: '51857',
    fileNumber: '51857',
    rxGroupId: 'RXG-51857-AMNA',
    partNumber: 1,
    totalParts: 2,
    isMultiPart: true,
    phaseName: 'Phase 1: Morning Mitochondrial & Androgenic Balance Formula',
    treatmentProgram: 'Personalized Compounded Nutriceutical Protocol',
    treatmentType: 'Compounded Acid-Resistant Vegetable Capsules',
    dosageForm: 'Acid-Resistant Vegetable Capsules',
    dispensingForm: 'Acid-Resistant Delayed-Release Vegetable Capsules',
    status: 'active',
    intakeState: 'verified_active',
    isAtlasRegistered: true,
    isPublicIntake: false,
    date: '23/09/2026',
    duration: '2 months',
    quantity: '60 capsules (2 Months)',
    volume: '60 capsules (2 Months)',
    pdfUrl: '/prescriptions/RX-51857-Amna-Alotaiba.png',
    imageUrl: '/prescriptions/RX-51857-Amna-Alotaiba.png',
    gdriveSource: 'https://drive.google.com/file/d/1ZDOYu7kXUcy65AJE-X9pVnFHKYSH5PJs/view?usp=drive_link',
    canonicalUrl: 'https://med-peptides.com/rx/RX-51857-A',
    publicUrl: 'https://med-peptides.com/rx/RX-51857-A',
    patientId: 'amna-alotaiba',
    patientName: 'Amna Sultan Mohamed Ahmed Alotaiba',
    patientDob: '2001-06-14',
    patientGender: 'Female',
    patient: {
      id: 'amna-alotaiba',
      name: 'Amna Sultan Mohamed Ahmed Alotaiba',
      fullName: 'Amna Sultan Mohamed Ahmed Alotaiba',
      fileNumber: '51857',
      dob: '2001-06-14',
      age: 25,
      gender: 'Female',
      nationality: 'UAE'
    },
    doctorId: 'dr-marina-cordeiro-fernandes',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    prescribingDoctor: 'Dr. Marina Cordeiro Fernandes',
    treatingDoctor: 'Dr. Marina Cordeiro Fernandes',
    supervisingDoctor: 'Dra. Haydee Camacho Gamboa (Col. 46759 COMB)',
    clinic: 'NOVA Clinic',
    clinicName: 'NOVA Clinic',
    doctor: {
      id: 'dr-marina-cordeiro-fernandes',
      name: 'Dr. Marina Cordeiro Fernandes',
      title: 'General Practitioner · Aesthetic & Longevity Medicine',
      license: 'DHA-91105367',
      clinic: 'NOVA Clinic',
      city: 'Dubai',
      country: 'United Arab Emirates'
    },
    formula: 'Ubiquinol 250 mg + Saw Palmetto Extract 250 mg',
    dosageInstructions: 'Take 1 dose once daily with breakfast for 2 months.',
    posology: {
      regimen: 'Take 1 dose once daily with breakfast.',
      timing: 'Morning with breakfast',
      notes: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives. Duration: 2 months.'
    },
    clinicalWarnings: [
      'Store in a cool, dry place away from direct sunlight.',
      'Discontinue 3 days prior to scheduled elective surgical procedures.',
      'Notify your treating physician if pregnant or planning conception.'
    ],
    specialCompoundingRequirements: [
      'Acid-resistant / delayed-release vegetable capsules',
      'Standardized Saw Palmetto lipidic extract (45-85% fatty acids)',
      'Bio-identical reduced Ubiquinol (Kaneka QH™ standard)',
      'Hypoallergenic excipients: zero gluten, zero lactose, zero artificial colorants'
    ],
    prescriptionLines: [
      { drugName: 'Ubiquinol', strength: '250 mg', instructions: '1 cap daily morning with breakfast' },
      { drugName: 'Saw Palmetto', strength: '250 mg', instructions: '1 cap daily morning with breakfast' }
    ],
    items: [
      {
        id: 'api-amna-1',
        name: 'Ubiquinol',
        activeIngredient: 'Ubiquinol (Reduced Active Form of Coenzyme Q10)',
        dose: '250 mg',
        dosage: '250 mg',
        category: 'Mitochondrial Bioenergetic Antioxidant',
        therapeuticClass: 'Cellular Respiration & Electron Transport Chain Support',
        mechanism: 'Direct electron donor in mitochondrial complex I/II to ATP synthesis; potent lipophilic antioxidant preventing oxidative damage to cellular and mitochondrial membranes.',
        cellularTarget: 'Mitochondrial Inner Membrane / Complex I & II'
      },
      {
        id: 'api-amna-2',
        name: 'Saw Palmetto Extract',
        activeIngredient: 'Serenoa repens Lipidic Extract (standardized 45-85% free fatty acids & phytosterols)',
        dose: '250 mg',
        dosage: '250 mg',
        category: 'Phytotherapeutic Anti-Androgen',
        therapeuticClass: '5α-Reductase Enzymatic Modulation',
        mechanism: 'Non-competitively inhibits type I and type II 5α-reductase isozymes, preventing the conversion of testosterone to dihydrotestosterone (DHT) and modulating nuclear androgen receptor binding.',
        cellularTarget: '5α-Reductase Isozymes & Androgen Receptor Signaling'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const rxAmnaB = {
    prescriptionCode: 'RX-51857-B',
    prescriptionNumber: 'RX-51857-B',
    code: '51857',
    fileNumber: '51857',
    rxGroupId: 'RXG-51857-AMNA',
    partNumber: 2,
    totalParts: 2,
    isMultiPart: true,
    phaseName: 'Phase 2: Metabolic & Lipid Optimization Evening Formula',
    treatmentProgram: 'Personalized Compounded Nutriceutical Protocol',
    treatmentType: 'Compounded Acid-Resistant Vegetable Capsules',
    dosageForm: 'Acid-Resistant Vegetable Capsules',
    dispensingForm: 'Acid-Resistant Delayed-Release Vegetable Capsules',
    status: 'active',
    intakeState: 'verified_active',
    isAtlasRegistered: true,
    isPublicIntake: false,
    date: '23/09/2026',
    duration: '2 months',
    quantity: '120 capsules (2 Months)',
    volume: '120 capsules (2 Months)',
    pdfUrl: '/prescriptions/RX-51857-Amna-Alotaiba.png',
    imageUrl: '/prescriptions/RX-51857-Amna-Alotaiba.png',
    gdriveSource: 'https://drive.google.com/file/d/1ZDOYu7kXUcy65AJE-X9pVnFHKYSH5PJs/view?usp=drive_link',
    canonicalUrl: 'https://med-peptides.com/rx/RX-51857-B',
    publicUrl: 'https://med-peptides.com/rx/RX-51857-B',
    patientId: 'amna-alotaiba',
    patientName: 'Amna Sultan Mohamed Ahmed Alotaiba',
    patientDob: '2001-06-14',
    patientGender: 'Female',
    patient: {
      id: 'amna-alotaiba',
      name: 'Amna Sultan Mohamed Ahmed Alotaiba',
      fullName: 'Amna Sultan Mohamed Ahmed Alotaiba',
      fileNumber: '51857',
      dob: '2001-06-14',
      age: 25,
      gender: 'Female',
      nationality: 'UAE'
    },
    doctorId: 'dr-marina-cordeiro-fernandes',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    prescribingDoctor: 'Dr. Marina Cordeiro Fernandes',
    treatingDoctor: 'Dr. Marina Cordeiro Fernandes',
    supervisingDoctor: 'Dra. Haydee Camacho Gamboa (Col. 46759 COMB)',
    clinic: 'NOVA Clinic',
    clinicName: 'NOVA Clinic',
    doctor: {
      id: 'dr-marina-cordeiro-fernandes',
      name: 'Dr. Marina Cordeiro Fernandes',
      title: 'General Practitioner · Aesthetic & Longevity Medicine',
      license: 'DHA-91105367',
      clinic: 'NOVA Clinic',
      city: 'Dubai',
      country: 'United Arab Emirates'
    },
    formula: 'Red Yeast Rice 600 mg + Berberine 500 mg + Citrus Bergamot 500 mg + Chromium Picolinate 100 mcg',
    dosageInstructions: 'Take 1 dose with lunch and 1 dose with dinner for 2 months.',
    posology: {
      regimen: 'Take 1 dose with lunch and 1 dose with dinner.',
      timing: 'With lunch and with dinner (twice daily)',
      notes: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives. Duration: 2 months.'
    },
    clinicalWarnings: [
      'Do not consume with excessive grapefruit juice.',
      'Monitor baseline and 12-week hepatic liver transaminases (ALT/AST) and lipid profile.',
      'Do not use during pregnancy or lactation.'
    ],
    specialCompoundingRequirements: [
      'Acid-resistant / delayed-release vegetable capsules',
      'Red Yeast Rice verified Citrinin-free (< 1 ppm) Monacolin K standard',
      'Berberine HCl highly purified (HPLC ≥ 98%)',
      'Bergavit® standardized Citrus Bergamot flavonoid polyphenols',
      'Hypoallergenic excipients: zero gluten, zero lactose, zero dairy'
    ],
    prescriptionLines: [
      { drugName: 'Red Yeast Rice', strength: '600 mg', instructions: '1 dose with lunch and 1 dose with dinner' },
      { drugName: 'Berberine HCl', strength: '500 mg', instructions: '1 dose with lunch and 1 dose with dinner' },
      { drugName: 'Citrus Bergamot', strength: '500 mg', instructions: '1 dose with lunch and 1 dose with dinner' },
      { drugName: 'Chromium Picolinate', strength: '100 mcg', instructions: '1 dose with lunch and 1 dose with dinner' }
    ],
    items: [
      {
        id: 'api-amna-3',
        name: 'Red Yeast Rice',
        activeIngredient: 'Monascus purpureus Extract (Standardized Monacolin K, Citrinin-free)',
        dose: '600 mg',
        dosage: '600 mg',
        category: 'Natural HMG-CoA Reductase Inhibitor',
        therapeuticClass: 'Hepatic Cholesterol Biosynthesis Regulation',
        mechanism: 'Reversibly inhibits 3-hydroxy-3-methylglutaryl-coenzyme A (HMG-CoA) reductase in the rate-limiting step of hepatic de novo cholesterol synthesis, lowering apo-B and LDL particles.',
        cellularTarget: 'Hepatic HMG-CoA Reductase'
      },
      {
        id: 'api-amna-4',
        name: 'Berberine HCl',
        activeIngredient: 'Berberine Hydrochloride (HPLC ≥ 98%)',
        dose: '500 mg',
        dosage: '500 mg',
        category: 'AMPK Activator & Insulin Sensitizer',
        therapeuticClass: 'Glycemic & PCSK9 Regulation',
        mechanism: 'Activates AMP-activated protein kinase (AMPK), promotes GLUT4 translocation, downregulates PCSK9 expression to upregulate hepatic LDL receptor recycling.',
        cellularTarget: 'AMPK / PCSK9 / Hepatic LDL Receptors'
      },
      {
        id: 'api-amna-5',
        name: 'Citrus Bergamot Extract',
        activeIngredient: 'Citrus bergamia Risso (Bergavit® standardized neoeriocitrin, naringin, neohesperidin)',
        dose: '500 mg',
        dosage: '500 mg',
        category: 'Vascular Endothelial Polyphenol Complex',
        therapeuticClass: 'Cardiovascular Protection & LDL Oxidation Defense',
        mechanism: 'Scavenges reactive oxygen species (ROS), prevents oxidative modification of LDL particles, and enhances endothelial nitric oxide synthase (eNOS) activation.',
        cellularTarget: 'Vascular Endothelium & Oxidative Lipoprotein Substrates'
      },
      {
        id: 'api-amna-6',
        name: 'Chromium Picolinate',
        activeIngredient: 'Chromium (III) Picolinate',
        dose: '100 mcg',
        dosage: '100 mcg',
        category: 'Trace Mineral Co-factor',
        therapeuticClass: 'Insulin Receptor Kinase Co-Factor',
        mechanism: 'Augments insulin signaling by potentiating chromodulin (low-molecular-weight chromium-binding substance) binding to insulin receptor tyrosine kinase domain.',
        cellularTarget: 'Insulin Receptor Tyrosine Kinase'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('prescriptions').doc('RX-51857-A').set(rxAmnaA, { merge: true });
  await db.collection('prescriptions').doc('RX-51857-B').set(rxAmnaB, { merge: true });
  // Alias for main file code
  await db.collection('prescriptions').doc('RX-51857').set({
    ...rxAmnaA,
    prescriptionCode: 'RX-51857',
    code: '51857',
    fileNumber: '51857',
    canonicalUrl: 'https://med-peptides.com/rx/RX-51857'
  }, { merge: true });
  console.log('✓ Amna Alotaiba (51857) RX-51857-A & B ingested');

  // =========================================================================
  // CASE 2: Abdulla Sultan Mohamed Ahmed Alotaiba (File 51812)
  // =========================================================================
  const patientAbdulla = {
    id: 'abdulla-alotaiba',
    fileNumber: '51812',
    name: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
    fullName: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
    dob: '1990-11-21',
    age: 35,
    gender: 'Male',
    nationality: 'UAE',
    status: 'active',
    primaryGoal: 'Methylation Pathway Optimization & Neuromuscular Recovery',
    doctorId: 'dr-marina-cordeiro-fernandes',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    supervisingDoctor: 'Dra. Haydee Camacho Gamboa',
    clinic: 'NOVA Clinic',
    clinicName: 'NOVA Clinic',
    prescriptions: ['RX-51812-A', 'RX-51812-B'],
    activePrescriptionId: 'RX-51812-A',
    source: 'clinical_prescription_import',
    updatedAt: new Date().toISOString()
  };
  await db.collection('patients').doc('abdulla-alotaiba').set(patientAbdulla, { merge: true });

  const rxAbdullaA = {
    prescriptionCode: 'RX-51812-A',
    prescriptionNumber: 'RX-51812-A',
    code: '51812',
    fileNumber: '51812',
    rxGroupId: 'RXG-51812-ABDULLA',
    partNumber: 1,
    totalParts: 2,
    isMultiPart: true,
    phaseName: 'Phase 1: Morning Methylation & Mitochondrial Formula',
    treatmentProgram: 'Compounded Advanced Nutriceutical Protocol',
    treatmentType: 'Compounded Vegetable Capsules',
    dosageForm: 'Vegetable Capsules',
    dispensingForm: 'Vegetable Delayed-Release Capsules',
    status: 'active',
    intakeState: 'verified_active',
    isAtlasRegistered: true,
    isPublicIntake: false,
    date: '15/09/2026',
    duration: '3 months',
    quantity: '90 vegetable capsules',
    volume: '90 capsules',
    pdfUrl: '/prescriptions/RX-51812-Abdulla-Alotaiba.png',
    imageUrl: '/prescriptions/RX-51812-Abdulla-Alotaiba.png',
    gdriveSource: 'https://drive.google.com/file/d/1ksvM8J_scw3CalKhe9n64Dmr4ZlFpIbK/view?usp=drive_link',
    canonicalUrl: 'https://med-peptides.com/rx/RX-51812-A',
    publicUrl: 'https://med-peptides.com/rx/RX-51812-A',
    patientId: 'abdulla-alotaiba',
    patientName: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
    patientDob: '1990-11-21',
    patientGender: 'Male',
    patient: {
      id: 'abdulla-alotaiba',
      name: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
      fullName: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
      fileNumber: '51812',
      dob: '1990-11-21',
      age: 35,
      gender: 'Male',
      nationality: 'UAE'
    },
    doctorId: 'dr-marina-cordeiro-fernandes',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    prescribingDoctor: 'Dr. Marina Cordeiro Fernandes',
    treatingDoctor: 'Dr. Marina Cordeiro Fernandes',
    supervisingDoctor: 'Dra. Haydee Camacho Gamboa (Col. 46759 COMB)',
    clinic: 'NOVA Clinic',
    clinicName: 'NOVA Clinic',
    doctor: {
      id: 'dr-marina-cordeiro-fernandes',
      name: 'Dr. Marina Cordeiro Fernandes',
      title: 'General Practitioner · Aesthetic & Longevity Medicine',
      license: 'DHA-91105367',
      clinic: 'NOVA Clinic',
      city: 'Dubai',
      country: 'United Arab Emirates'
    },
    formula: 'B12 500 mcg + P5P 25 mg + B2 10 mg + TMG 500 mg + Ubiquinol 200 mg + Resveratrol 250 mg + NAC 600 mg',
    dosageInstructions: 'Take 1 capsule every morning with breakfast for 3 months.',
    posology: {
      regimen: '1 capsule daily in the morning with breakfast.',
      timing: 'Morning with food',
      notes: 'B-vitamin co-factors and ubiquinol provide sustained bioenergetic activation throughout daytime hours.'
    },
    clinicalWarnings: [
      'May impart a harmless bright yellow discoloration to urine (due to riboflavin B2).',
      'Take with adequate water and food.',
      'Discontinue 3 days prior to blood tests evaluating serum B12 or homocysteine.'
    ],
    specialCompoundingRequirements: [
      'Acid-resistant vegetable capsules',
      'Methylated / coenzymated active vitamin forms (Methyl B12, P5P, R5P)',
      'High-grade Trans-Resveratrol (≥ 98% purity)',
      'Gluten-free, lactose-free, hypoallergenic excipients'
    ],
    prescriptionLines: [
      { drugName: 'Methylcobalamin (B12)', strength: '500 mcg', instructions: '1 cap daily morning with breakfast' },
      { drugName: 'Pyridoxal-5-Phosphate (P5P)', strength: '25 mg', instructions: '1 cap daily morning with breakfast' },
      { drugName: 'Riboflavin-5-Phosphate (B2)', strength: '10 mg', instructions: '1 cap daily morning with breakfast' },
      { drugName: 'Trimethylglycine (TMG)', strength: '500 mg', instructions: '1 cap daily morning with breakfast' },
      { drugName: 'Ubiquinol', strength: '200 mg', instructions: '1 cap daily morning with breakfast' },
      { drugName: 'Trans-Resveratrol', strength: '250 mg', instructions: '1 cap daily morning with breakfast' },
      { drugName: 'N-Acetylcysteine (NAC)', strength: '600 mg', instructions: '1 cap daily morning with breakfast' }
    ],
    items: [
      {
        id: 'api-abd-1',
        name: 'Methylcobalamin (B12)',
        activeIngredient: 'Methylcobalamin',
        dose: '500 mcg',
        dosage: '500 mcg',
        category: 'Active Coenzyme B-Vitamin',
        therapeuticClass: 'One-Carbon Methylation & Methionine Synthase Co-Factor',
        mechanism: 'Essential methyl donor for methionine synthase converting homocysteine to methionine, supporting myelin synthesis and DNA methylation.',
        cellularTarget: 'Methionine Synthase (MTR) / Cytoplasm'
      },
      {
        id: 'api-abd-2',
        name: 'Pyridoxal-5-Phosphate (P5P)',
        activeIngredient: 'Pyridoxal-5-Phosphate (Active Vitamin B6)',
        dose: '25 mg',
        dosage: '25 mg',
        category: 'Bioactive Vitamin Coenzyme',
        therapeuticClass: 'Transsulfuration & Neurotransmitter Synthesis',
        mechanism: 'Directly enters transsulfuration pathway (CBS enzyme) directing homocysteine toward cystathionine and glutathione; catalyzes synthesis of GABA, dopamine, and serotonin.',
        cellularTarget: 'Cystathionine β-Synthase (CBS) & Aromatic L-Amino Acid Decarboxylase'
      },
      {
        id: 'api-abd-3',
        name: 'Riboflavin-5-Phosphate (B2)',
        activeIngredient: 'Riboflavin-5-Phosphate Monosodium',
        dose: '10 mg',
        dosage: '10 mg',
        category: 'Flavoprotein Co-factor',
        therapeuticClass: 'MTHFR Redox Co-factor (FAD Precursor)',
        mechanism: 'Precursor of Flavin Adenine Dinucleotide (FAD), the obligate redox co-factor for Methylenetetrahydrofolate Reductase (MTHFR).',
        cellularTarget: 'MTHFR Catalytic Domain & Mitochondrial ETC Complex I/II'
      },
      {
        id: 'api-abd-4',
        name: 'Trimethylglycine (TMG / Betaine)',
        activeIngredient: 'Betaine Anhydrous (Trimethylglycine)',
        dose: '500 mg',
        dosage: '500 mg',
        category: 'Osmolyte & Alternative Methyl Donor',
        therapeuticClass: 'Hepatic BHMT Homocysteine Remethylation',
        mechanism: 'Substrate for Betaine-Homocysteine S-Methyltransferase (BHMT), bypassing folate/B12-dependent pathways to lower serum homocysteine.',
        cellularTarget: 'Hepatic BHMT & Renal Cellular Osmoregulation'
      },
      {
        id: 'api-abd-5',
        name: 'Ubiquinol',
        activeIngredient: 'Ubiquinol (Reduced Kaneka CoQ10)',
        dose: '200 mg',
        dosage: '200 mg',
        category: 'Mitochondrial Bioenergetic Antioxidant',
        therapeuticClass: 'Cellular ATP Generation & Lipid Membrane Protection',
        mechanism: 'Optimizes proton gradient across inner mitochondrial membrane for complex V ATP synthesis; prevents lipid peroxidation.',
        cellularTarget: 'Mitochondrial Inner Membrane'
      },
      {
        id: 'api-abd-6',
        name: 'Trans-Resveratrol',
        activeIngredient: 'Polygonum cuspidatum standardized Trans-Resveratrol (≥ 98%)',
        dose: '250 mg',
        dosage: '250 mg',
        category: 'Polyphenolic Stilbenoid',
        therapeuticClass: 'SIRT1 Activator & Mitochondrial Biogenesis',
        mechanism: 'Allosterically activates NAD+-dependent deacetylase Sirtuin 1 (SIRT1), driving PGC-1α deacetylation and mitochondrial biogenesis.',
        cellularTarget: 'SIRT1 / PGC-1α Signaling Axis'
      },
      {
        id: 'api-abd-7',
        name: 'N-Acetylcysteine (NAC)',
        activeIngredient: 'N-Acetyl-L-Cysteine',
        dose: '600 mg',
        dosage: '600 mg',
        category: 'Intracellular Antioxidant Precursor',
        therapeuticClass: 'Glutathione Rate-Limiting Substrate',
        mechanism: 'Provides bioavailable L-cysteine for glutamate-cysteine ligase (GCL), driving de novo cellular and mitochondrial reduced glutathione (GSH) synthesis.',
        cellularTarget: 'Intracellular Glutathione Synthesis Pool'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const rxAbdullaB = {
    prescriptionCode: 'RX-51812-B',
    prescriptionNumber: 'RX-51812-B',
    code: '51812',
    fileNumber: '51812',
    rxGroupId: 'RXG-51812-ABDULLA',
    partNumber: 2,
    totalParts: 2,
    isMultiPart: true,
    phaseName: 'Phase 2: Before Bed Neuromuscular & Rest Formula',
    treatmentProgram: 'Compounded Advanced Nutriceutical Protocol',
    treatmentType: 'Compounded Vegetable Capsules',
    dosageForm: 'Vegetable Capsules',
    dispensingForm: 'Vegetable Capsules',
    status: 'active',
    intakeState: 'verified_active',
    isAtlasRegistered: true,
    isPublicIntake: false,
    date: '15/09/2026',
    duration: '3 months',
    quantity: '90 vegetable capsules',
    volume: '90 capsules',
    pdfUrl: '/prescriptions/RX-51812-Abdulla-Alotaiba.png',
    imageUrl: '/prescriptions/RX-51812-Abdulla-Alotaiba.png',
    gdriveSource: 'https://drive.google.com/file/d/1ksvM8J_scw3CalKhe9n64Dmr4ZlFpIbK/view?usp=drive_link',
    canonicalUrl: 'https://med-peptides.com/rx/RX-51812-B',
    publicUrl: 'https://med-peptides.com/rx/RX-51812-B',
    patientId: 'abdulla-alotaiba',
    patientName: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
    patientDob: '1990-11-21',
    patientGender: 'Male',
    patient: {
      id: 'abdulla-alotaiba',
      name: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
      fullName: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
      fileNumber: '51812',
      dob: '1990-11-21',
      age: 35,
      gender: 'Male',
      nationality: 'UAE'
    },
    doctorId: 'dr-marina-cordeiro-fernandes',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    prescribingDoctor: 'Dr. Marina Cordeiro Fernandes',
    treatingDoctor: 'Dr. Marina Cordeiro Fernandes',
    supervisingDoctor: 'Dra. Haydee Camacho Gamboa (Col. 46759 COMB)',
    clinic: 'NOVA Clinic',
    clinicName: 'NOVA Clinic',
    doctor: {
      id: 'dr-marina-cordeiro-fernandes',
      name: 'Dr. Marina Cordeiro Fernandes',
      title: 'General Practitioner · Aesthetic & Longevity Medicine',
      license: 'DHA-91105367',
      clinic: 'NOVA Clinic',
      city: 'Dubai',
      country: 'United Arab Emirates'
    },
    formula: 'Magnesium Bisglycinate (eq. 400 mg elemental Mg) + Glycine 1,000 mg + L-Theanine 200 mg',
    dosageInstructions: 'Take 1 serving (capsules) 30-45 minutes before bedtime with water for 3 months.',
    posology: {
      regimen: '1 serving daily at night before sleep.',
      timing: 'Night 30-45 min before sleep',
      notes: 'Promotes restorative slow-wave sleep architecture and nocturnal autonomic parasympathetic tone.'
    },
    clinicalWarnings: [
      'Do not operate heavy machinery immediately following bedtime administration.',
      'Safe for daily ongoing use without habituation.'
    ],
    specialCompoundingRequirements: [
      'Fully-reacted TRAACS® Magnesium Bisglycinate Chelate (non-buffered)',
      'USP Pharmaceutical Grade free-form Glycine',
      'Suntheanine® L-Theanine (100% pure L-isomer)',
      'Zero gluten, zero lactose, zero magnesium stearate'
    ],
    prescriptionLines: [
      { drugName: 'Magnesium Bisglycinate', strength: 'eq. 400 mg Mg', instructions: '1 serving at bedtime' },
      { drugName: 'Glycine', strength: '1,000 mg', instructions: '1 serving at bedtime' },
      { drugName: 'L-Theanine', strength: '200 mg', instructions: '1 serving at bedtime' }
    ],
    items: [
      {
        id: 'api-abd-8',
        name: 'Magnesium Bisglycinate',
        activeIngredient: 'Magnesium Bisglycinate Chelate (TRAACS® non-buffered, supplying 400 mg elemental Mg)',
        dose: 'eq. 400 mg elemental Mg',
        dosage: '400 mg Mg',
        category: 'Chelated Essential Mineral',
        therapeuticClass: 'Neuromuscular Relaxation & NMDA Receptor Antagonism',
        mechanism: 'Acts as natural physiological blocker of NMDA receptor ion channels, relaxing skeletal and vascular smooth muscle; co-factor for >300 enzymatic reactions.',
        cellularTarget: 'NMDA Receptor Ion Channels & Postsynaptic Calcium Flux'
      },
      {
        id: 'api-abd-9',
        name: 'Glycine',
        activeIngredient: 'Glycine (Aminoacetic acid USP grade)',
        dose: '1,000 mg',
        dosage: '1,000 mg',
        category: 'Inhibitory Neurotransmitter & Collagen Building Block',
        therapeuticClass: 'Sleep Architecture & Core Body Temperature Thermoregulation',
        mechanism: 'Acts on Glycine Receptors (GlyR) in suprachiasmatic nucleus (SCN) to facilitate cutaneous vasodilation, lowering core temperature and promoting rapid deep NREM sleep onset.',
        cellularTarget: 'Hypothalamic SCN Glycine Receptors (GlyR)'
      },
      {
        id: 'api-abd-10',
        name: 'L-Theanine',
        activeIngredient: 'L-Theanine (γ-glutamylethylamide, Suntheanine®)',
        dose: '200 mg',
        dosage: '200 mg',
        category: 'Neuroactive Amino Acid',
        therapeuticClass: 'Alpha-Brainwave Induction & Cortical Calming',
        mechanism: 'Crosses blood-brain barrier; competitively antagonizes glutamate receptors and stimulates GABA synthesis, inducing relaxed alpha-band EEG brainwave activity without sedation.',
        cellularTarget: 'Cortical Glutamate/GABA Receptors & Occipital Alpha Wave Oscillations'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('prescriptions').doc('RX-51812-A').set(rxAbdullaA, { merge: true });
  await db.collection('prescriptions').doc('RX-51812-B').set(rxAbdullaB, { merge: true });
  await db.collection('prescriptions').doc('RX-51812').set({
    ...rxAbdullaA,
    prescriptionCode: 'RX-51812',
    code: '51812',
    fileNumber: '51812',
    canonicalUrl: 'https://med-peptides.com/rx/RX-51812'
  }, { merge: true });
  console.log('✓ Abdulla Alotaiba (51812) RX-51812-A & B ingested');

  // =========================================================================
  // CASE 3: Basma Haitham K Bouzo (File 51861)
  // =========================================================================
  const patientBasma = {
    id: 'basma-bouzo',
    fileNumber: '51861',
    name: 'Basma Haitham K Bouzo',
    fullName: 'Basma Haitham K Bouzo',
    dob: '1984-06-05',
    age: 42,
    gender: 'Female',
    diagnosis: 'ICD-10 N95.9 — Perimenopausal and Postmenopausal Disorder',
    status: 'active',
    primaryGoal: 'Bioidentical Hormone Replacement Therapy (BHRT) Optimization',
    doctorId: 'dr-marina-cordeiro-fernandes',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    supervisingDoctor: 'Dra. Haydee Camacho Gamboa',
    clinic: 'NOVA Clinic / NOVA Plastic Surgery Clinic',
    clinicName: 'NOVA Clinic',
    prescriptions: ['RX-51861-A', 'RX-51861-B'],
    activePrescriptionId: 'RX-51861-A',
    source: 'clinical_prescription_import',
    updatedAt: new Date().toISOString()
  };
  await db.collection('patients').doc('basma-bouzo').set(patientBasma, { merge: true });

  const rxBasmaA = {
    prescriptionCode: 'RX-51861-A',
    prescriptionNumber: 'RX-51861-A',
    code: '51861',
    fileNumber: '51861',
    rxGroupId: 'RXG-51861-BASMA',
    partNumber: 1,
    totalParts: 2,
    isMultiPart: true,
    phaseName: 'Phase 1: Morning Testosterone Transdermal Cream (BHRT)',
    treatmentProgram: 'Bioidentical Hormone Replacement Therapy (BHRT)',
    treatmentType: 'Compounded Transdermal Liposomal Cream',
    dosageForm: 'Transdermal Cream (Pentravan®)',
    dispensingForm: 'Airless Metered Dispenser (Pentravan® Base)',
    status: 'active',
    intakeState: 'verified_active',
    isAtlasRegistered: true,
    isPublicIntake: false,
    date: '15/09/2026',
    duration: '90 days (3 months)',
    quantity: '90 mL airless metered pump dispenser (1 mL/dose = 90 doses)',
    volume: '90 mL',
    icd10: 'N95.9',
    diagnosis: 'ICD-10 N95.9 — Perimenopausal and Postmenopausal Disorder',
    pdfUrl: '/prescriptions/RX-51861-Basma-Bouzo.png',
    imageUrl: '/prescriptions/RX-51861-Basma-Bouzo.png',
    gdriveSource: 'https://drive.google.com/file/d/11OZyjDzE65266e-UBcS9lx5XrAgPho3h/view?usp=drive_link',
    canonicalUrl: 'https://med-peptides.com/rx/RX-51861-A',
    publicUrl: 'https://med-peptides.com/rx/RX-51861-A',
    patientId: 'basma-bouzo',
    patientName: 'Basma Haitham K Bouzo',
    patientDob: '1984-06-05',
    patientGender: 'Female',
    patient: {
      id: 'basma-bouzo',
      name: 'Basma Haitham K Bouzo',
      fullName: 'Basma Haitham K Bouzo',
      fileNumber: '51861',
      dob: '1984-06-05',
      age: 42,
      gender: 'Female',
      diagnosis: 'ICD-10 N95.9'
    },
    doctorId: 'dr-marina-cordeiro-fernandes',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    prescribingDoctor: 'Dr. Marina Cordeiro Fernandes',
    treatingDoctor: 'Dr. Marina Cordeiro Fernandes',
    supervisingDoctor: 'Dra. Haydee Camacho Gamboa (Col. 46759 COMB)',
    clinic: 'NOVA Clinic / NOVA Plastic Surgery Clinic',
    clinicName: 'NOVA Clinic',
    doctor: {
      id: 'dr-marina-cordeiro-fernandes',
      name: 'Dr. Marina Cordeiro Fernandes',
      title: 'General Practitioner · Aesthetic & Longevity Medicine',
      license: 'DHA-91105367',
      clinic: 'NOVA Clinic',
      city: 'Dubai',
      country: 'United Arab Emirates'
    },
    formula: 'Testosterone Micronized USP 2 mg / mL in Pentravan® Transdermal Base 1 mL',
    dosageInstructions: 'Apply 1 pump (1 mL = 2 mg) every morning to clean, hairless skin of the inner forearm or lower abdomen.',
    posology: {
      regimen: '1 pump (1 mL) applied topically every morning.',
      timing: 'Morning upon waking',
      notes: 'Apply to thin, clean skin. Rotate application sites (inner forearm, lower abdomen). Allow 5 minutes to absorb before dressing.'
    },
    clinicalWarnings: [
      'Avoid contact with children or pets at the application site until fully absorbed.',
      'Wash hands thoroughly with soap and water after application.',
      'Periodic serum hormone surveillance required (total/free testosterone, estradiol, SHBG at 6-8 weeks).'
    ],
    specialCompoundingRequirements: [
      'Pentravan® vanishing liposomal transdermal matrix (Fagron standard)',
      'Micronized USP Pharmaceutical Grade Bioidentical Testosterone',
      'Airless calibrated pump dispensing precisely 1.0 mL per actuation',
      'No mineral oils, non-comedogenic, rapid stratum corneum penetration'
    ],
    prescriptionLines: [
      { drugName: 'Testosterone Micronized USP', strength: '2 mg / mL', instructions: 'Apply 1 pump (1 mL) topically in the morning' },
      { drugName: 'Pentravan® Transdermal Base', strength: 'q.s. 1 mL', instructions: 'Liposomal cream matrix' }
    ],
    items: [
      {
        id: 'api-basma-1',
        name: 'Testosterone Micronized USP',
        activeIngredient: 'Bioidentical Testosterone (Micronized USP)',
        dose: '2 mg / mL',
        dosage: '2 mg',
        category: 'Bioidentical Androgen',
        therapeuticClass: 'BHRT / Neuromuscular & Libido Restoration',
        mechanism: 'Binds with high affinity to intracellular androgen receptors (AR), translocating to nucleus to upregulate structural protein synthesis, preserve lean muscle mass, enhance bone mineral density, and support dopamine-mediated libido and cognitive vitality in females.',
        cellularTarget: 'Nuclear Androgen Receptor (AR) & Cortical Dopaminergic Pathways'
      },
      {
        id: 'api-basma-2',
        name: 'Pentravan® Vehicle Base',
        activeIngredient: 'Pentravan® Liposomal Transdermal Matrix (Fagron)',
        dose: 'q.s. 1 mL',
        dosage: '1 mL',
        category: 'Pharmaceutical Liposomal Transdermal Vehicle',
        therapeuticClass: 'Stratum Corneum Penetration Enhancer',
        mechanism: 'Liposomal phospholipid bilayer mimics intercellular stratum corneum lipid bilayers, enabling rapid transdermal transport without dermal irritation.',
        cellularTarget: 'Epidermal Barrier Intercellular Lipid Lamellae'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const rxBasmaB = {
    prescriptionCode: 'RX-51861-B',
    prescriptionNumber: 'RX-51861-B',
    code: '51861',
    fileNumber: '51861',
    rxGroupId: 'RXG-51861-BASMA',
    partNumber: 2,
    totalParts: 2,
    isMultiPart: true,
    phaseName: 'Phase 2: Evening Estradiol Transdermal Cream (BHRT)',
    treatmentProgram: 'Bioidentical Hormone Replacement Therapy (BHRT)',
    treatmentType: 'Compounded Transdermal Liposomal Cream',
    dosageForm: 'Transdermal Cream (Pentravan®)',
    dispensingForm: 'Airless Metered Dispenser (Pentravan® Base)',
    status: 'active',
    intakeState: 'verified_active',
    isAtlasRegistered: true,
    isPublicIntake: false,
    date: '15/09/2026',
    duration: '90 days (3 months)',
    quantity: '90 mL airless metered pump dispenser (1 mL/dose = 90 doses)',
    volume: '90 mL',
    icd10: 'N95.9',
    diagnosis: 'ICD-10 N95.9 — Perimenopausal and Postmenopausal Disorder',
    pdfUrl: '/prescriptions/RX-51861-Basma-Bouzo.png',
    imageUrl: '/prescriptions/RX-51861-Basma-Bouzo.png',
    gdriveSource: 'https://drive.google.com/file/d/11OZyjDzE65266e-UBcS9lx5XrAgPho3h/view?usp=drive_link',
    canonicalUrl: 'https://med-peptides.com/rx/RX-51861-B',
    publicUrl: 'https://med-peptides.com/rx/RX-51861-B',
    patientId: 'basma-bouzo',
    patientName: 'Basma Haitham K Bouzo',
    patientDob: '1984-06-05',
    patientGender: 'Female',
    patient: {
      id: 'basma-bouzo',
      name: 'Basma Haitham K Bouzo',
      fullName: 'Basma Haitham K Bouzo',
      fileNumber: '51861',
      dob: '1984-06-05',
      age: 42,
      gender: 'Female',
      diagnosis: 'ICD-10 N95.9'
    },
    doctorId: 'dr-marina-cordeiro-fernandes',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    prescribingDoctor: 'Dr. Marina Cordeiro Fernandes',
    treatingDoctor: 'Dr. Marina Cordeiro Fernandes',
    supervisingDoctor: 'Dra. Haydee Camacho Gamboa (Col. 46759 COMB)',
    clinic: 'NOVA Clinic / NOVA Plastic Surgery Clinic',
    clinicName: 'NOVA Clinic',
    doctor: {
      id: 'dr-marina-cordeiro-fernandes',
      name: 'Dr. Marina Cordeiro Fernandes',
      title: 'General Practitioner · Aesthetic & Longevity Medicine',
      license: 'DHA-91105367',
      clinic: 'NOVA Clinic',
      city: 'Dubai',
      country: 'United Arab Emirates'
    },
    formula: 'Estradiol (17β-Estradiol Micronized USP) 2 mg / mL in Pentravan® Transdermal Base 1 mL',
    dosageInstructions: 'Apply 1 pump (1 mL = 2 mg) every evening at bedtime to clean skin of the inner thigh or upper arm.',
    posology: {
      regimen: '1 pump (1 mL) applied topically every evening.',
      timing: 'Evening at bedtime',
      notes: 'Nocturnal application stabilizes thermoregulatory center in the hypothalamus, mitigating vasomotor night sweats and improving REM sleep cycles.'
    },
    clinicalWarnings: [
      'Do not apply directly to breasts or mucous membranes.',
      'Regular clinical follow-up and pelvic ultrasound/mammography as clinically indicated by your specialist.',
      'Wash hands thoroughly after use.'
    ],
    specialCompoundingRequirements: [
      'Pentravan® vanishing liposomal transdermal matrix (Fagron standard)',
      '17β-Estradiol Micronized USP Bioidentical (C21H24O2)',
      'Airless calibrated pump dispensing precisely 1.0 mL per actuation',
      'No mineral oils, non-greasy, rapid stratum corneum absorption'
    ],
    prescriptionLines: [
      { drugName: '17β-Estradiol Micronized USP', strength: '2 mg / mL', instructions: 'Apply 1 pump (1 mL) topically in the evening' },
      { drugName: 'Pentravan® Transdermal Base', strength: 'q.s. 1 mL', instructions: 'Liposomal cream matrix' }
    ],
    items: [
      {
        id: 'api-basma-3',
        name: '17β-Estradiol Micronized USP',
        activeIngredient: '17β-Estradiol Bioidentical (Micronized USP)',
        dose: '2 mg / mL',
        dosage: '2 mg',
        category: 'Bioidentical Estrogen',
        therapeuticClass: 'BHRT / Endocrine Homeostasis & Vasomotor Stability',
        mechanism: 'Binds estrogen receptors alpha (ERα) and beta (ERβ), modulating gene transcription to alleviate vasomotor instability (hot flashes, night sweats), preserve dermal collagen cross-linking, maintain bone density, and support cardiovascular endothelial compliance.',
        cellularTarget: 'Estrogen Receptors ERα & ERβ / Hypothalamic Thermoregulatory Nuclei'
      },
      {
        id: 'api-basma-4',
        name: 'Pentravan® Vehicle Base',
        activeIngredient: 'Pentravan® Liposomal Transdermal Matrix (Fagron)',
        dose: 'q.s. 1 mL',
        dosage: '1 mL',
        category: 'Pharmaceutical Liposomal Transdermal Vehicle',
        therapeuticClass: 'Stratum Corneum Penetration Enhancer',
        mechanism: 'Liposomal carrier vehicle providing sustained transdermal drug delivery and steady-state systemic circulating estradiol concentrations without hepatic first-pass metabolism.',
        cellularTarget: 'Transdermal Microcirculatory Bed'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('prescriptions').doc('RX-51861-A').set(rxBasmaA, { merge: true });
  await db.collection('prescriptions').doc('RX-51861-B').set(rxBasmaB, { merge: true });
  await db.collection('prescriptions').doc('RX-51861').set({
    ...rxBasmaA,
    prescriptionCode: 'RX-51861',
    code: '51861',
    fileNumber: '51861',
    canonicalUrl: 'https://med-peptides.com/rx/RX-51861'
  }, { merge: true });
  console.log('✓ Basma Bouzo (51861) RX-51861-A & B ingested');

  // =========================================================================
  // CASE 4: Mohammed Ahmad Aishehhi (TrichoTest Sample BOX03483AATRI)
  // =========================================================================
  const patientMohammed = {
    id: 'mohammed-ahmad-aishehhi',
    fileNumber: 'BOX03483AATRI',
    sampleId: 'BOX03483AATRI',
    emiratesId: '784-1966-9170294-6',
    name: 'Mohammed Ahmad Aishehhi',
    fullName: 'Mohammed Ahmad Aishehhi',
    dob: '1966-07-15',
    age: 60,
    gender: 'Male',
    nationality: 'UAE',
    status: 'active',
    primaryGoal: 'Genetic Hair Loss (Androgenetic Alopecia) Reversal',
    testType: 'Fagron Genomics TrichoTest™',
    doctorId: 'dr-sezgin-vardarli',
    doctorName: 'Dr. Sezgin Vardarlı',
    clinic: 'Med Art Clinic Day Surgery Center',
    clinicName: 'Med Art Clinic Day Surgery Center',
    prescriptions: ['RX-BOX03483AATRI'],
    activePrescriptionId: 'RX-BOX03483AATRI',
    source: 'fagron_trichotest_pdf',
    updatedAt: new Date().toISOString()
  };
  await db.collection('patients').doc('mohammed-ahmad-aishehhi').set(patientMohammed, { merge: true });

  const rxMohammed = {
    prescriptionCode: 'RX-BOX03483AATRI',
    prescriptionNumber: 'RX-BOX03483AATRI',
    code: 'BOX03483AATRI',
    sampleId: 'BOX03483AATRI',
    sampleCode: 'BOX03483AATRI',
    emiratesId: '784-1966-9170294-6',
    fileNumber: 'BOX03483AATRI',
    partNumber: 1,
    totalParts: 1,
    isMultiPart: false,
    phaseName: 'Precision Genomic Hair Restoration Formulation',
    treatmentProgram: 'TrichoTest™ Personalized Topical Alopecia Protocol',
    treatmentType: 'Precision Compounded Topical Solution in TrichoSol™',
    dosageForm: 'Topical Solution (TrichoSol™)',
    dispensingForm: 'Amber Dropper / Spray Bottle with Calibrated Applicator',
    status: 'active',
    intakeState: 'verified_active',
    isAtlasRegistered: true,
    isPublicIntake: false,
    date: '15/09/2026',
    duration: '3 months (3 bottles x 100 mL)',
    quantity: '100 mL topical solution in TrichoSol™',
    volume: '100 mL',
    genomicsTest: 'Fagron Genomics TrichoTest™',
    pdfUrl: '/prescriptions/RX-BOX03483AATRI-Mohammed-Aishehhi.pdf',
    gdriveSource: 'https://drive.google.com/file/d/1JCLJCMYTciurnzNljkxv4HBU6usVTbsV/view?usp=drive_link',
    canonicalUrl: 'https://med-peptides.com/rx/RX-BOX03483AATRI',
    publicUrl: 'https://med-peptides.com/rx/RX-BOX03483AATRI',
    patientId: 'mohammed-ahmad-aishehhi',
    patientName: 'Mohammed Ahmad Aishehhi',
    patientDob: '1966-07-15',
    patientGender: 'Male',
    patient: {
      id: 'mohammed-ahmad-aishehhi',
      name: 'Mohammed Ahmad Aishehhi',
      fullName: 'Mohammed Ahmad Aishehhi',
      fileNumber: 'BOX03483AATRI',
      sampleId: 'BOX03483AATRI',
      emiratesId: '784-1966-9170294-6',
      dob: '1966-07-15',
      age: 60,
      gender: 'Male',
      nationality: 'UAE'
    },
    doctorId: 'dr-haytham-salem',
    doctorName: 'Dr. Haytham Salem',
    prescribingDoctor: 'Dr. Haytham Salem (Arthregen Clinic)',
    treatingDoctor: 'Dr. Haytham Salem',
    clinic: 'Med Art Clinic Day Surgery Center',
    clinicName: 'Med Art Clinic Day Surgery Center',
    doctor: {
      id: 'dr-haytham-salem',
      name: 'Dr. Haytham Salem',
      title: 'Consultant Orthopedic & Regenerative Medicine · Arthregen Clinic',
      license: 'DHA-P-0319842',
      clinic: 'Med Art Clinic Day Surgery Center',
      address: 'Med Art Clinic Day Surgery Center, Villa 823, Jumeirah St., Dubai, UAE',
      phone: '+971 4 346 6149',
      city: 'Dubai',
      country: 'United Arab Emirates'
    },
    formula: 'Minoxidil 4% + Spironolactone 1% + Arginine 1.5% in TrichoSol™ 100 mL',
    dosageInstructions: 'Apply 1 mL (approx. 6 sprays or 20 drops) once daily directly to affected scalp areas, preferably at night. Massage gently into scalp. Do not wash scalp for at least 4 hours.',
    posology: {
      regimen: '1 mL once daily topically to scalp.',
      timing: 'Night before bed',
      notes: 'TrichoSol™ technology features patented phytocomplex with low alcohol and zero propylene glycol, avoiding scalp flaking, erythema, and dryness.'
    },
    clinicalWarnings: [
      'For topical scalp use only. Do not ingest.',
      'Avoid contact with eyes, broken skin, or mucous membranes.',
      'Initial mild transient shedding may occur during first 2-4 weeks as hair follicles transition into the active anagen phase.'
    ],
    specialCompoundingRequirements: [
      'TrichoSol™ patented hydrophilic vehicle (Fagron Genomics)',
      'Free from propylene glycol and harsh alcohol solvents',
      'Alcohol-free formulation prevents contact dermatitis and scalp irritation',
      'Amber glass bottle with tamper-evident graduated 1 mL dropper pipette'
    ],
    prescriptionLines: [
      { drugName: 'Minoxidil', strength: '4% (40 mg/mL)', instructions: 'Apply 1 mL once daily at night to scalp' },
      { drugName: 'Spironolactone', strength: '1% (10 mg/mL)', instructions: 'Apply 1 mL once daily at night to scalp' },
      { drugName: 'Arginine (L-Arginine)', strength: '1.5% (15 mg/mL)', instructions: 'Apply 1 mL once daily at night to scalp' },
      { drugName: 'TrichoSol™ Vehicle', strength: 'q.s. 100 mL', instructions: 'Hydrophilic vehicle with phytocomplex' }
    ],
    items: [
      {
        id: 'api-mhd-1',
        name: 'Minoxidil',
        activeIngredient: 'Minoxidil (USP Grade)',
        dose: '4% (40 mg/mL)',
        dosage: '4% (40 mg/mL)',
        category: 'ATP-Sensitive Potassium Channel Opener',
        therapeuticClass: 'Follicular Anagen Phase Prolongation & Vasodilator',
        mechanism: 'Opens ATP-sensitive K+ channels in follicular dermal papilla cells, causing hyperpolarization of smooth muscle cell membranes, microvascular dilation, and upregulation of VEGF to prolong the anagen growth cycle.',
        cellularTarget: 'Follicular Dermal Papilla K_ATP Channels & VEGF Expression'
      },
      {
        id: 'api-mhd-2',
        name: 'Spironolactone',
        activeIngredient: 'Spironolactone (Micronized USP)',
        dose: '1% (10 mg/mL)',
        dosage: '1% (10 mg/mL)',
        category: 'Competitive Androgen Receptor Antagonist',
        therapeuticClass: 'Local Scalp DHT Blockade',
        mechanism: 'Competitively blocks dihydrotestosterone (DHT) from binding to local follicular androgen receptors in the scalp, preventing DHT-induced follicular miniaturization without systemic anti-androgenic side effects.',
        cellularTarget: 'Follicular Androgen Receptors (AR) in Dermal Papilla'
      },
      {
        id: 'api-mhd-3',
        name: 'Arginine (L-Arginine)',
        activeIngredient: 'L-Arginine (USP)',
        dose: '1.5% (15 mg/mL)',
        dosage: '1.5% (15 mg/mL)',
        category: 'Nitric Oxide (NO) Precursor Amino Acid',
        therapeuticClass: 'Endothelial Microperfusion Enhancer',
        mechanism: 'Direct substrate for endothelial nitric oxide synthase (eNOS), stimulating local nitric oxide release to promote microvascular blood flow and nutrient delivery around the hair bulb.',
        cellularTarget: 'Endothelial Nitric Oxide Synthase (eNOS) / Hair Bulb Perifollicular Capillaries'
      },
      {
        id: 'api-mhd-4',
        name: 'TrichoSol™ Patented Vehicle',
        activeIngredient: 'TrichoSol™ Hydrophilic Phytocomplex Vehicle (Fagron)',
        dose: 'q.s. 100 mL',
        dosage: '100 mL',
        category: 'Patented Trichological Vehicle',
        therapeuticClass: 'Non-Irritating Scalp Delivery Matrix',
        mechanism: 'Mineral-salts and polyphenol phytocomplex enhances solubility and epidermal deposition of Minoxidil and Spironolactone without causing scalp dryness, erythema, or contact dermatitis.',
        cellularTarget: 'Follicular Infundibulum & Stratum Corneum'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('prescriptions').doc('RX-BOX03483AATRI').set(rxMohammed, { merge: true });
  await db.collection('prescriptions').doc('RX-BOX03483').set({
    ...rxMohammed,
    prescriptionCode: 'RX-BOX03483',
    canonicalUrl: 'https://med-peptides.com/rx/RX-BOX03483'
  }, { merge: true });
  await db.collection('prescriptions').doc('BOX03483AATRI').set({
    ...rxMohammed,
    prescriptionCode: 'BOX03483AATRI',
    canonicalUrl: 'https://med-peptides.com/rx/BOX03483AATRI'
  }, { merge: true });
  console.log('✓ Mohammed Aishehhi (BOX03483AATRI) ingested');

  console.log('✅ ALL 4 PRESCRIPTIONS SUCCESSFULLY INGESTED INTO FIRESTORE!');
}

run().catch(err => {
  console.error('❌ Error ingesting prescriptions:', err);
  process.exit(1);
});

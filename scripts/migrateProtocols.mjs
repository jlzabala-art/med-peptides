import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: "AIzaSyDOV2zFeLGtPsE_O2b-gR3NHZygPspiSws",
  authDomain: "med-peptides-app-27a3a.firebaseapp.com",
  projectId: "med-peptides-app",
  storageBucket: "med-peptides-app.firebasestorage.app",
  messagingSenderId: "514143707883",
  appId: "1:514143707883:web:6c12470433ef6c992714ae",
  measurementId: "G-LYMXGY71FJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data to migrate
const templatesDataRaw = fs.readFileSync(path.join(__dirname, '../src/data/protocolTemplates.json'), 'utf-8');
const protocolTemplates = JSON.parse(templatesDataRaw);

const MONITORING_TEMPLATES = {
  "Weight Management / Obesity": [
    { week: 0, labs: ["CMP", "Lipid Panel", "HbA1c", "Thyroid Panel"], note: "Baseline Metabolic Screening" },
    { week: 4, labs: ["CMP", "Glucose"], note: "Early Adaptation Check" },
    { week: 8, labs: ["CMP", "Lipid Panel"], note: "Mid-Protocol Assessment" },
    { week: 12, labs: ["CMP", "HbA1c", "Lipid Panel"], note: "Final Phase Verification" }
  ],
  "Recovery / Injury": [
    { week: 0, labs: ["CBC", "CRP", "ESR"], note: "Baseline Inflammation Markers" },
    { week: 4, labs: ["CRP"], note: "Recovery Progress Check" },
    { week: 8, labs: ["CBC", "CRP"], note: "End-of-Protocol Verification" }
  ],
  "Cognitive Support": [
    { week: 0, labs: ["Vitamin B12", "Folate", "Thyroid Panel"], note: "Baseline Neurological Screening" },
    { week: 12, labs: ["Vitamin B12", "CMP"], note: "Maintenance Check" }
  ],
  "Energy / Mitochondrial": [
    { week: 0, labs: ["CMP", "CBC", "Mitochondrial Biomarkers"], note: "Baseline Bioenergetic Screen" },
    { week: 6, labs: ["CMP", "Glucose"], note: "Energy Substrate Utilization" },
    { week: 12, labs: ["CMP", "Lactate"], note: "Mitochondrial Function Audit" }
  ],
  "Hormonal Support": [
    { week: 0, labs: ["Hormone Panel (Comprehensive)", "CMP", "Lipid Panel"], note: "Full Endocrine Assessment" },
    { week: 6, labs: ["Hormone Markers", "IGF-1"], note: "Endocrine Response Check" },
    { week: 12, labs: ["Hormone Panel", "CMP"], note: "End-of-Cycle Hormonal Status" }
  ],
  "Immune / Inflammation": [
    { week: 0, labs: ["CRP", "ESR", "CBC w/ Diff", "ANA"], note: "Baseline Inflammatory Profiles" },
    { week: 4, labs: ["CRP", "CBC"], note: "Acute Phase Mitigation Tracking" },
    { week: 8, labs: ["CRP", "ESR"], note: "Immune Stabilization Review" }
  ],
  "Longevity": [
    { week: 0, labs: ["CMP", "HbA1c", "Lipid Panel", "hs-CRP"], note: "Baseline Biological Age Markers" },
    { week: 12, labs: ["hs-CRP", "Telomere Check (Opt)", "CMP"], note: "Longevity Outcome Review" }
  ],
  "Metabolic Health": [
    { week: 0, labs: ["CMP", "HbA1c", "Fasting Insulin", "Lipid Panel"], note: "Glucose/Insulin Sensitivity Audit" },
    { week: 12, labs: ["HbA1c", "Fasting Insulin", "CMP"], note: "Metabolic Stabilization Outcome" }
  ],
  "Skin / Anti-Aging": [
    { week: 0, labs: ["CMP", "Vitamin D", "Hormone Panel"], note: "Skin Health Foundation Check" },
    { week: 12, labs: ["CMP", "Vitamin D"], note: "Maintenance Status Audit" }
  ],
  "Sleep Support": [
    { week: 0, labs: ["Cortisol (4-point)", "Melatonin Markers", "Thyroid Panel"], note: "Circadian Rhythm Baseline" },
    { week: 8, labs: ["Cortisol", "Thyroid Panel"], note: "Stress Axis Adaptation Check" }
  ],
  "DEFAULT": [
    { week: 0, labs: ["CMP", "CBC"], note: "Baseline Safety Labs" },
    { week: 8, labs: ["CMP"], note: "Safety Verification" },
    { week: 12, labs: ["CMP", "CBC"], note: "Final Protocol Review" }
  ]
};

async function migrateProtocolTemplates() {
  console.log('🔄 Starting protocol templates migration...');
  const batch = writeBatch(db);
  const protocolsRef = collection(db, 'protocol_templates');

  let count = 0;
  for (const template of protocolTemplates) {
    const docId = template.protocol_id || `temp_${count}`;
    const docRef = doc(protocolsRef, docId);

    // Apply new required schema fields
    const enrichedTemplate = {
      ...template,
      version: 1,
      status: 'approved',
      active: true,
      visibility: 'public',
      author: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    batch.set(docRef, enrichedTemplate, { merge: true });
    count++;
  }

  await batch.commit();
  console.log(`✅ Successfully migrated ${count} protocol templates.`);
}

async function migrateMonitoringProfiles() {
  console.log('🔄 Starting monitoring profiles migration...');
  const batch = writeBatch(db);
  const profilesRef = collection(db, 'monitoring_profiles');

  let count = 0;
  for (const [objective, labs] of Object.entries(MONITORING_TEMPLATES)) {
    // Sluggify the objective for the document ID
    const docId = objective === "DEFAULT" 
        ? "default_profile" 
        : objective.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const docRef = doc(profilesRef, docId);
    
    const profileDoc = {
      id: docId,
      name: objective === "DEFAULT" ? "Standard Safety Profile" : `${objective} Monitoring Profile`,
      clinical_objective: objective === "DEFAULT" ? null : objective,
      schedule: labs,
      version: 1,
      status: 'approved',
      visibility: 'public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    batch.set(docRef, profileDoc, { merge: true });
    count++;
  }

  await batch.commit();
  console.log(`✅ Successfully migrated ${count} monitoring profiles.`);
}

async function runMigration() {
  try {
    await migrateProtocolTemplates();
    await migrateMonitoringProfiles();
    console.log('🎉 Migration fully completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();

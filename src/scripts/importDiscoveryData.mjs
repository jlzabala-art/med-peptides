
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Firebase Config — CANONICAL PROJECT: med-peptides-app ────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDOV2zFeLGtPsE_O2b-gR3NHZygPspiSws",
  authDomain: "med-peptides-app-27a3a.firebaseapp.com",
  projectId: "med-peptides-app",
  storageBucket: "med-peptides-app.firebasestorage.app",
  messagingSenderId: "514143707883",
  appId: "1:514143707883:web:6c12470433ef6c992714ae",
  measurementId: "G-LYMXGY71FJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Path Resolution ──────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const jsonPath = join(__dirname, '../../AI Prompts/med_peptides_complete_discovery_system.json');

console.log(`\n🚀 Starting Med-Peptides Discovery Data Import...`);
console.log(`📂 Reading from: ${jsonPath}`);

let discoveryData;
try {
  const rawData = readFileSync(jsonPath, 'utf-8');
  discoveryData = JSON.parse(rawData);
  console.log(`✅ Loaded JSON successfully.`);
} catch (err) {
  console.error(`❌ Failed to read or parse JSON: ${err.message}`);
  process.exit(1);
}

// ── Helper: Sync Collection ──────────────────────────────────────────────────
async function syncCollection(dataArray, collectionName, idField, docPrefix = '') {
  if (!dataArray || !Array.isArray(dataArray)) {
    console.log(`⚠️ Skipping ${collectionName}: data is not an array.`);
    return;
  }

  console.log(`📦 Syncing ${dataArray.length} items to '${collectionName}'...`);
  let successCount = 0;
  let failCount = 0;

  for (const item of dataArray) {
    const docId = idField ? (item[idField] || makeDocId(item.name || item.peptideName)) : makeDocId(item.name || item.peptideName);
    if (!docId) {
      console.error(`  ❌ Missing ID for item in ${collectionName}`);
      failCount++;
      continue;
    }

    const docReference = doc(collection(db, collectionName), docId);
    try {
      await setDoc(docReference, {
        ...item,
        syncedAt: new Date().toISOString()
      }, { merge: true });
      successCount++;
    } catch (err) {
      console.error(`  ❌ Failed to sync ${docId} in ${collectionName}: ${err.message}`);
      failCount++;
    }
  }
  console.log(`  ✅ ${successCount} synced, ❌ ${failCount} failed.`);
}

// ── Helper: Sync Single Doc ──────────────────────────────────────────────────
async function syncSingleDoc(dataObj, collectionName, docId) {
  if (!dataObj) {
    console.log(`⚠️ Skipping ${collectionName}: data is missing.`);
    return;
  }

  console.log(`📦 Syncing single doc to '${collectionName}/${docId}'...`);
  const docReference = doc(collection(db, collectionName), docId);
  try {
    await setDoc(docReference, {
      ...dataObj,
      syncedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`  ✅ Successfully synced.`);
  } catch (err) {
    console.error(`  ❌ Failed to sync doc in ${collectionName}: ${err.message}`);
  }
}

// ── ID Sanitizer ─────────────────────────────────────────────────────────────
function makeDocId(name) {
  if (!name) return null;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ── Execution Loop ───────────────────────────────────────────────────────────
async function runImport() {
  // 1. FAQ Categories
  await syncCollection(discoveryData.faqCategories, 'faq_categories', 'id');

  // 2. FAQ Documents
  await syncCollection(discoveryData.faqItems, 'peptide_faq', 'faqId');

  // 3. FAQ Peptide Mappings
  await syncCollection(discoveryData.faqPeptideMappings, 'faq_peptide_mapping', 'mappingId');

  // 4. Related Engine
  await syncCollection(discoveryData.peptideRelatedEngine, 'peptide_related_engine', 'slug');

  // 5. Peptide Compare Blocks
  await syncCollection(discoveryData.peptideCompareBlocks, 'peptide_compare_blocks', 'blockId');

  // 6. Landing Config
  await syncSingleDoc(discoveryData.faqLandingConfig, 'faq_landing_config', 'default');

  // 7. Discovery Config
  await syncSingleDoc(discoveryData.discoveryConfig, 'discovery_config', 'default');

  console.log(`\n🎉 Import Complete!`);
  process.exit(0);
}

runImport();

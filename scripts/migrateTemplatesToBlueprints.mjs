/**
 * migrateTemplatesToBlueprints.mjs
 *
 * ONE-WAY migration: protocol_templates → blueprints (master)
 *
 * Rules:
 *  - If a doc ID exists in protocol_templates but NOT in blueprints → full copy
 *  - If a doc ID exists in BOTH but blueprints is missing metadata.scientificName
 *    (or other key metadata fields) → patch those fields only
 *  - Never overwrite existing blueprints data
 *  - Skip the random UUID doc (11f3i114wNaaQ72Swzhk)
 *
 * Run:  node scripts/migrateTemplatesToBlueprints.mjs
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Initialize Firebase Admin ─────────────────────────────────────────────────
// Use a service account key file if available (.service-account.json),
// otherwise fall back to Application Default Credentials (works when
// GOOGLE_APPLICATION_CREDENTIALS is set or gcloud/firebase CLI is authenticated).
const localKeyPath = resolve(__dirname, '../.service-account.json');

if (existsSync(localKeyPath)) {
  const { cert } = await import('firebase-admin/app');
  const serviceAccount = JSON.parse(readFileSync(localKeyPath, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
  console.log('🔑  Using .service-account.json');
} else {
  initializeApp({
    credential: applicationDefault(),
    projectId: 'med-peptides-app',
  });
  console.log('🔑  Using Application Default Credentials (Firebase CLI / gcloud)');
}

const db = getFirestore();

// ── Config ────────────────────────────────────────────────────────────────────
const SOURCE_COL = 'protocol_templates';
const TARGET_COL = 'blueprints';

// Docs to skip (random UUIDs, staging-only, etc.)
const SKIP_IDS = new Set(['11f3i114wNaaQ72Swzhk']);

// Fields to patch from source → target when target exists but is missing them
const PATCH_PATHS = [
  'metadata.scientificName',
  'metadata.abbreviatedName',
  'metadata.shortCode',
  'metadata.version',
  'metadata.primary_goal',
  'metadata.primary_condition',
  'metadata.schema_version',
  'metadata.visibility',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getNestedValue(obj, dotPath) {
  return dotPath.split('.').reduce((acc, key) => acc?.[key], obj);
}

function setNestedValue(obj, dotPath, value) {
  const keys = dotPath.split('.');
  const last  = keys.pop();
  const target = keys.reduce((acc, key) => {
    if (!acc[key] || typeof acc[key] !== 'object') acc[key] = {};
    return acc[key];
  }, obj);
  target[last] = value;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n📂  Reading ${SOURCE_COL}…`);
  const sourceSnap = await db.collection(SOURCE_COL).get();
  const sourceDocs = sourceSnap.docs.filter(d => !SKIP_IDS.has(d.id));
  console.log(`   Found ${sourceDocs.length} valid source docs`);

  console.log(`\n📂  Reading ${TARGET_COL}…`);
  const targetSnap = await db.collection(TARGET_COL).get();
  const targetIds  = new Set(targetSnap.docs.map(d => d.id));
  const targetMap  = Object.fromEntries(targetSnap.docs.map(d => [d.id, d.data()]));
  console.log(`   Found ${targetSnap.docs.length} existing blueprint docs`);

  let copied  = 0;
  let patched = 0;
  let skipped = 0;

  for (const sourceDoc of sourceDocs) {
    const id   = sourceDoc.id;
    const data = sourceDoc.data();

    if (!targetIds.has(id)) {
      // ── CASE 1: doc doesn't exist in blueprints → full copy ──────────────
      console.log(`  ✅  COPY   ${id}`);
      await db.collection(TARGET_COL).doc(id).set(data);
      copied++;

    } else {
      // ── CASE 2: doc exists → check for missing metadata fields ───────────
      const targetData = targetMap[id];
      const updates    = {};
      let   needsPatch = false;

      for (const path of PATCH_PATHS) {
        const sourceVal = getNestedValue(data,       path);
        const targetVal = getNestedValue(targetData, path);
        if (sourceVal !== undefined && sourceVal !== null && !targetVal) {
          setNestedValue(updates, path, sourceVal);
          needsPatch = true;
        }
      }

      if (needsPatch) {
        // Flatten nested updates to Firestore dot-notation update
        const flat = {};
        for (const path of PATCH_PATHS) {
          const val = getNestedValue(updates, path);
          if (val !== undefined) flat[path] = val;
        }
        console.log(`  🔧  PATCH  ${id} →`, Object.keys(flat).join(', '));
        await db.collection(TARGET_COL).doc(id).update(flat);
        patched++;
      } else {
        console.log(`  ──  SKIP   ${id} (already complete)`);
        skipped++;
      }
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`✅  Done.`);
  console.log(`   Copied  : ${copied}`);
  console.log(`   Patched : ${patched}`);
  console.log(`   Skipped : ${skipped}`);
  console.log('─'.repeat(50) + '\n');
}

run().catch(err => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});

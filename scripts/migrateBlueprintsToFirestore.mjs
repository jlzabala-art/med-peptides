/**
 * Migration Script: protocolBlueprintsV2.json → Firestore `blueprints` collection
 * 
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/migrateBlueprintsToFirestore.mjs
 *
 * Or if using firebase CLI project auth:
 *   node scripts/migrateBlueprintsToFirestore.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// ── Firebase Admin initialisation ──────────────────────────────────────────
const serviceAccountPath = resolve(projectRoot, 'serviceAccount.json');

if (existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
  initializeApp({ credential: cert(serviceAccount) });
  console.log('✅ Firebase Admin initialised with service account.');
} else {
  // Fallback: use application default credentials (e.g. `gcloud auth application-default login`)
  initializeApp();
  console.log('✅ Firebase Admin initialised with application default credentials.');
}

const db = getFirestore();

// ── Load blueprints JSON ────────────────────────────────────────────────────
const blueprintsPath = resolve(projectRoot, 'src/data/protocolBlueprintsV2.json');
const blueprints = JSON.parse(readFileSync(blueprintsPath, 'utf-8'));
console.log(`📦 Loaded ${blueprints.length} blueprints from JSON.`);

// ── Migrate ─────────────────────────────────────────────────────────────────
async function migrateBlueprints() {
  const collectionRef = db.collection('blueprints');
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const blueprint of blueprints) {
    const docId = blueprint.protocol_id;
    if (!docId) {
      console.warn('⚠️  Blueprint without protocol_id – skipping:', blueprint);
      skipped++;
      continue;
    }

    try {
      const docRef = collectionRef.doc(docId);
      const snapshot = await docRef.get();

      if (snapshot.exists) {
        console.log(`⏭️  Skipping existing blueprint: ${docId}`);
        skipped++;
      } else {
        await docRef.set({
          ...blueprint,
          migratedAt: new Date().toISOString(),
        });
        console.log(`✅ Migrated: ${docId} (${blueprint.protocol_title})`);
        created++;
      }
    } catch (err) {
      console.error(`❌ Error migrating ${docId}:`, err.message);
      errors++;
    }
  }

  console.log('\n─────────────────────────────────────');
  console.log(`Migration complete:`);
  console.log(`  Created : ${created}`);
  console.log(`  Skipped : ${skipped}`);
  console.log(`  Errors  : ${errors}`);
  console.log('─────────────────────────────────────\n');
}

migrateBlueprints().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});

/**
 * seedBlueprints_adc.mjs
 *
 * Seeds protocolBlueprintsV2.json into Firestore `blueprints/` collection.
 * Uses Application Default Credentials (gcloud auth application-default login).
 *
 * Usage:
 *   node src/scripts/seedBlueprints_adc.mjs
 *
 * Requirements:
 *   npm install firebase-admin
 *   gcloud auth application-default login  (already done)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ─── Locate data file ─────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const dataPath   = join(__dirname, '../data/protocolBlueprintsV2.json');

// ─── Init Admin SDK with ADC ──────────────────────────────────────────────────
initializeApp({
  credential: applicationDefault(),
  projectId: 'med-peptides-app',
});

const db = getFirestore();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sanitize(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seedBlueprints() {
  const blueprints = JSON.parse(readFileSync(dataPath, 'utf-8'));

  if (!Array.isArray(blueprints) || blueprints.length === 0) {
    console.error('❌  No blueprints found in protocolBlueprintsV2.json');
    process.exit(1);
  }

  console.log(`\n📋  Seeding ${blueprints.length} blueprints → Firestore "blueprints/"\n`);

  // Firestore batch writes (max 500 per batch)
  const BATCH_SIZE = 400;
  let count = 0;

  for (let i = 0; i < blueprints.length; i += BATCH_SIZE) {
    const chunk = blueprints.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const blueprint of chunk) {
      const docId = blueprint.protocol_id;
      if (!docId) {
        console.warn('⚠  Skipping blueprint without protocol_id:', blueprint.protocol_title);
        continue;
      }

      const payload = sanitize({
        ...blueprint,
        active:    blueprint.active  !== undefined ? blueprint.active  : true,
        // Treat both 'approved' and 'reviewed' as approved — all curated blueprints are publication-ready
        status:    (blueprint.protocol_review_status === 'approved' || blueprint.protocol_review_status === 'reviewed') ? 'approved' : (blueprint.protocol_review_status || 'approved'),
        seeded_at: new Date().toISOString(),
      });

      const ref = db.collection('blueprints').doc(docId);
      batch.set(ref, payload, { merge: true });
      console.log(`  ✔  ${docId}  —  ${blueprint.protocol_title}`);
      count++;
    }

    await batch.commit();
    console.log(`\n  Batch committed (${Math.min(i + BATCH_SIZE, blueprints.length)}/${blueprints.length})\n`);
  }

  console.log(`\n✅  Seed complete — ${count} documents written to blueprints/\n`);
}

seedBlueprints().catch(err => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});

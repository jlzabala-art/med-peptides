/**
 * seedBlueprints.mjs
 *
 * One-time seed script: uploads protocolBlueprintsV2.json into Firestore
 * collection `blueprints/` using each blueprint's `protocol_id` as the document ID.
 *
 * Usage:
 *   node --env-file=.env src/scripts/seedBlueprints.mjs
 *
 * Requirements:
 *   npm install firebase-admin (only needed for this script, not the app bundle)
 *   Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON env var.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ─── Locate files ─────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const dataPath   = join(__dirname, '../data/protocolBlueprintsV2.json');

// ─── Init Admin SDK ───────────────────────────────────────────────────────────
let credential;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  credential = cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  throw new Error(
    'Missing credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.'
  );
}

initializeApp({ credential, projectId: 'med-peptides-app' });
const db = getFirestore();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sanitize(obj) {
  // Firestore does not accept undefined values — strip them recursively.
  return JSON.parse(JSON.stringify(obj));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seedBlueprints() {
  const blueprints = JSON.parse(readFileSync(dataPath, 'utf-8'));

  if (!Array.isArray(blueprints) || blueprints.length === 0) {
    console.error('❌  No blueprints found in protocolBlueprintsV2.json');
    process.exit(1);
  }

  console.log(`\n📋  Seeding ${blueprints.length} blueprints → Firestore collection "blueprints/"\n`);

  // Align field names expected by protocolRepository.getProtocolTemplates()
  // (queries `active == true` AND `status == 'approved'`)
  const batch = db.batch();

  for (const blueprint of blueprints) {
    const docId = blueprint.protocol_id;
    if (!docId) {
      console.warn('⚠  Skipping blueprint without protocol_id:', blueprint.protocol_title);
      continue;
    }

    const payload = sanitize({
      ...blueprint,
      // Ensure both filter fields are always present
      active:              blueprint.active  !== undefined ? blueprint.active  : true,
      status:              blueprint.protocol_review_status === 'approved' ? 'approved' : blueprint.protocol_review_status || 'approved',
      seeded_at:           new Date().toISOString(),
    });

    const ref = db.collection('blueprints').doc(docId);
    batch.set(ref, payload, { merge: true });
    console.log(`  ✔  ${docId}  —  ${blueprint.protocol_title}`);
  }

  await batch.commit();
  console.log(`\n✅  Seed complete — ${blueprints.length} documents written to blueprints/\n`);
}

seedBlueprints().catch(err => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});

/**
 * syncScientificNames.mjs
 *
 * Patches `metadata.scientificName` into every document in the Firestore
 * `protocols/` collection.
 *
 * Sources:
 *   1. protocolBlueprintsV2.json  – primary source for protocols that exist there
 *   2. FIRESTORE_ONLY_NAMES map   – manually crafted names for Firestore-only docs
 *      (sa_001, skin_003, wm_005) that have no JSON counterpart
 *
 * Strategy: Firestore FieldPath merge so we ONLY touch metadata.scientificName
 * and leave everything else on the document completely unchanged.
 *
 * Usage:
 *   node src/scripts/syncScientificNames.mjs
 *
 * Requirements:
 *   npm install firebase-admin   (already installed)
 *   src/scripts/serviceAccountKey.json must exist
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldPath } from 'firebase-admin/firestore';

// ─── Paths ────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf-8')
);
const dataPath = join(__dirname, '../data/protocolBlueprintsV2.json');

// ─── Init ─────────────────────────────────────────────────────────────────────
initializeApp({ credential: cert(serviceAccount), projectId: 'med-peptides-app' });
const db = getFirestore();

// ─── Firestore-only protocols not in the JSON ──────────────────────────────────
const FIRESTORE_ONLY_NAMES = {
  sa_001:   'GHK-Cu & BPC-157 Structured Skin & Aesthetics Dermal-Barrier Renewal Protocol',
  skin_003: 'GHK-Cu + BPC-157 + TB-500 Dermal Collagen & Microvascular Regeneration Protocol',
  wm_005:   'Advanced GLP-1/GH-Axis & Mitokine Weight Management & Metabolic Longevity Protocol',
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function syncScientificNames() {
  // Build map from JSON: protocol_id → scientificName
  const blueprints = JSON.parse(readFileSync(dataPath, 'utf-8'));
  if (!Array.isArray(blueprints) || blueprints.length === 0) {
    throw new Error('No blueprints found in protocolBlueprintsV2.json');
  }

  const jsonMap = {};
  for (const bp of blueprints) {
    const id = bp.protocol_id;
    const sciName = bp.metadata?.scientificName;
    if (id && sciName) {
      jsonMap[id] = sciName;
    }
  }

  // Merge: JSON map + Firestore-only map
  const allNames = { ...jsonMap, ...FIRESTORE_ONLY_NAMES };

  // IDs that are in JSON but missing scientificName — warn about them
  const missingInJson = blueprints
    .filter(bp => bp.protocol_id && !bp.metadata?.scientificName)
    .map(bp => bp.protocol_id);

  if (missingInJson.length > 0) {
    console.warn(
      `\n⚠  The following protocol IDs have no scientificName in JSON and will be SKIPPED\n` +
      `   (edit protocolBlueprintsV2.json to add them):\n` +
      missingInJson.map(id => `   • ${id}`).join('\n') + '\n'
    );
  }

  // Fetch all protocol docs from Firestore
  const snapshot = await db.collection('protocols').get();
  console.log(`\n🔍  Found ${snapshot.size} documents in protocols/ collection\n`);

  let updated = 0;
  let skipped = 0;
  const batch = db.batch();

  for (const doc of snapshot.docs) {
    const id = doc.id;
    const sciName = allNames[id];

    if (!sciName) {
      console.log(`  ⚠  ${id}  — no scientificName available, skipping`);
      skipped++;
      continue;
    }

    const existingSciName = doc.get('metadata.scientificName');
    if (existingSciName === sciName) {
      console.log(`  ✓  ${id}  — already up-to-date`);
      skipped++;
      continue;
    }

    // Merge only the metadata.scientificName field
    batch.update(doc.ref, new FieldPath('metadata', 'scientificName'), sciName);
    console.log(`  ✏  ${id}  — setting scientificName: "${sciName}"`);
    updated++;
  }

  if (updated === 0) {
    console.log('\n✅  All documents already have up-to-date scientificName values. Nothing to do.\n');
    return;
  }

  await batch.commit();
  console.log(
    `\n✅  Sync complete — ${updated} documents updated, ${skipped} skipped\n`
  );
}

syncScientificNames().catch(err => {
  console.error('❌  Sync failed:', err.message);
  process.exit(1);
});

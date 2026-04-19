/**
 * seedBlueprints.mjs
 *
 * Uploads all protocol blueprints from protocolBlueprintsV2.json
 * into the Firestore `blueprints/` collection.
 *
 * Each document ID = blueprint.id (e.g. "WM-001")
 * Each document gains an `active: true` flag if not already present.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/seedBlueprints.mjs
 *   -- OR --
 *   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' node scripts/seedBlueprints.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }        from 'fs';
import { resolve, dirname }    from 'path';
import { fileURLToPath }       from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Firebase Admin Init ───────────────────────────────────────────────────────
let credential;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const raw = readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
  credential = cert(JSON.parse(raw));
} else {
  // Try loading serviceAccount.json from project root
  try {
    const raw = readFileSync(resolve(__dirname, '../serviceAccount.json'), 'utf8');
    credential = cert(JSON.parse(raw));
  } catch {
    console.error('❌  No Firebase credentials found.');
    console.error('    Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON, or place serviceAccount.json in project root.');
    process.exit(1);
  }
}

initializeApp({ credential });
const db = getFirestore();

// ── Load blueprints ───────────────────────────────────────────────────────────
const blueprintsPath = resolve(__dirname, '../src/data/protocolBlueprintsV2.json');
let blueprints;

try {
  blueprints = JSON.parse(readFileSync(blueprintsPath, 'utf8'));
} catch (err) {
  console.error('❌  Could not read protocolBlueprintsV2.json:', err.message);
  process.exit(1);
}

// Support both a plain array and { blueprints: [...] }
const list = Array.isArray(blueprints) ? blueprints : (blueprints.blueprints ?? Object.values(blueprints));

console.log(`📦  Found ${list.length} blueprints to seed…`);

// ── Seed ──────────────────────────────────────────────────────────────────────
const BATCH_SIZE = 400; // Firestore batch limit is 500 ops
let written = 0;
let skipped = 0;

for (let i = 0; i < list.length; i += BATCH_SIZE) {
  const batch  = db.batch();
  const chunk  = list.slice(i, i + BATCH_SIZE);

  for (const bp of chunk) {
    const id = bp.id ?? bp.blueprint_id;
    if (!id) { skipped++; continue; }

    const ref = db.collection('blueprints').doc(String(id));
    batch.set(ref, {
      ...bp,
      active: bp.active !== false, // default to true
      seededAt: new Date().toISOString(),
    }, { merge: true });

    written++;
  }

  await batch.commit();
  console.log(`  ✔  Committed ${Math.min(i + BATCH_SIZE, list.length)} / ${list.length}`);
}

console.log(`\n✅  Done. Written: ${written}, Skipped (no id): ${skipped}`);

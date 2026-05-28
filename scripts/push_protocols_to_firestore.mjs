/**
 * push_protocols_to_firestore.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads all corrected protocol JSON files from export/protocols/ and
 * pushes phase_blueprints to Firestore using the GOOGLE_APPLICATION_CREDENTIALS
 * environment variable (Application Default Credentials).
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/push_protocols_to_firestore.mjs [--dry-run]
 *   -- OR --
 *   node scripts/push_protocols_to_firestore.mjs  (uses ADC / firebase CLI credentials)
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const PROTO_DIR = join(ROOT, 'export', 'protocols');
const DRY_RUN   = process.argv.includes('--dry-run');

// ── Firebase init: try service account first, fall back to ADC ───────────────
let credential;
const SA_KEY = join(ROOT, 'med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
try {
  const key = JSON.parse(readFileSync(SA_KEY, 'utf8'));
  // Force lowercase project id to avoid case mismatch
  key.project_id = key.project_id.toLowerCase();
  credential = cert(key);
  console.log('🔑 Using service account credential');
} catch {
  credential = applicationDefault();
  console.log('🔑 Using Application Default Credentials');
}

if (!getApps().length) {
  initializeApp({ credential, projectId: 'med-peptides-app' });
}
const db = getFirestore();

// ── Load all protocol files ───────────────────────────────────────────────────
const files = readdirSync(PROTO_DIR).filter(
  f => f.endsWith('.json') && !f.includes('bundle')
);

console.log(`\n📂 Found ${files.length} protocol files in ${PROTO_DIR}\n`);

let pushed = 0;
let skipped = 0;
const BATCH_LIMIT = 450;

let batch     = db.batch();
let batchSize = 0;

async function flushBatch() {
  if (batchSize === 0) return;
  if (!DRY_RUN) await batch.commit();
  batch     = db.batch();
  batchSize = 0;
}

for (const file of files) {
  const filePath = join(PROTO_DIR, file);
  const protocol = JSON.parse(readFileSync(filePath, 'utf8'));

  const protocolId = protocol.protocol_id;
  if (!protocolId) {
    console.warn(`  ⚠️  ${file}: no protocol_id — skipped`);
    skipped++;
    continue;
  }

  // Full document merge: update every field that's in the local JSON
  const ref = db.collection('protocols').doc(protocolId);

  const payload = {
    ...protocol,
    _last_synced_at: new Date().toISOString(),
  };

  if (DRY_RUN) {
    console.log(`  [DRY] would set protocols/${protocolId} (${(protocol.phase_blueprints||[]).length} phases)`);
  } else {
    batch.set(ref, payload, { merge: true });
    console.log(`  ✅  protocols/${protocolId} queued`);
  }

  pushed++;
  batchSize++;

  if (batchSize >= BATCH_LIMIT) {
    await flushBatch();
    console.log('  🔄 Batch committed, continuing...');
  }
}

await flushBatch();

console.log(`\n${'─'.repeat(60)}`);
console.log(`📊 Summary:`);
console.log(`   Pushed:  ${pushed}`);
console.log(`   Skipped: ${skipped}`);
if (DRY_RUN) console.log(`\n   ⚠️  DRY RUN — Firestore not modified`);
else         console.log(`\n   🔥 Firestore updated at project med-peptides-app`);

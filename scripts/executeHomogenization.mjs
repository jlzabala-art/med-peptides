/**
 * scripts/executeHomogenization.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Executes the complete homogenization pipeline across:
 * 1. Firestore `protocols` collection (all 87 documents)
 * 2. `export/protocols/` (all 25 canonical files)
 * 3. `src/services/protocol_finder_2_0_protocols_bundle/` (all 25 bundle files)
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { db } from './lib/firebase-admin.mjs';
import { homogenizeProtocol } from './homogenizeAllProtocolsSSOT.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const BUNDLE_DIR = join(PROJECT_ROOT, 'src/services/protocol_finder_2_0_protocols_bundle');
const EXPORT_DIR = join(PROJECT_ROOT, 'export/protocols');

async function runHomogenization() {
  console.log('================================================================');
  console.log('🚀 EXECUTING INSTITUTIONAL PROTOCOL HOMOGENIZATION (SSOT)');
  console.log('================================================================\n');

  // ── Step 1: Process and Update Firestore (Source of Truth) ──────────────────
  console.log('📦 Step 1: Processing Firestore `protocols` collection...');
  const snap = await db.collection('protocols').get();
  console.log(`   Found ${snap.size} protocols in Firestore.`);

  let firestoreUpdated = 0;
  const BATCH_SIZE = 450; // Firestore max batch is 500
  let batch = db.batch();
  let opsInBatch = 0;

  for (const doc of snap.docs) {
    const rawData = doc.data();
    const cleanDoc = homogenizeProtocol(rawData, doc.id);

    const docRef = db.collection('protocols').doc(doc.id);
    batch.set(docRef, cleanDoc, { merge: true });
    opsInBatch++;
    firestoreUpdated++;

    if (opsInBatch >= BATCH_SIZE) {
      await batch.commit();
      console.log(`   Committed batch of ${opsInBatch} updates...`);
      batch = db.batch();
      opsInBatch = 0;
    }
  }

  if (opsInBatch > 0) {
    await batch.commit();
    console.log(`   Committed final batch of ${opsInBatch} updates.`);
  }
  console.log(`✅ Successfully updated ${firestoreUpdated} protocols in Firestore.\n`);

  // ── Step 2: Synchronize `export/protocols/` ───────────────────────────────────
  console.log('📁 Step 2: Synchronizing `export/protocols/`...');
  const exportFiles = readdirSync(EXPORT_DIR).filter(f => f.endsWith('.json') && !f.includes('report') && !f.includes('bundle'));
  let exportUpdated = 0;

  for (const f of exportFiles) {
    const pPath = join(EXPORT_DIR, f);
    const rawData = JSON.parse(readFileSync(pPath, 'utf8'));
    const cleanDoc = homogenizeProtocol(rawData, rawData.id || rawData.protocol_id || f.replace('.json', ''));
    writeFileSync(pPath, JSON.stringify(cleanDoc, null, 2), 'utf8');
    exportUpdated++;
  }
  console.log(`✅ Successfully updated ${exportUpdated} files in ${EXPORT_DIR}.\n`);

  // ── Step 3: Synchronize `src/services/protocol_finder_2_0_protocols_bundle/` ──
  console.log('📁 Step 3: Synchronizing `src/services/protocol_finder_2_0_protocols_bundle/`...');
  const bundleFiles = readdirSync(BUNDLE_DIR).filter(f => f.endsWith('.json'));
  let bundleUpdated = 0;

  for (const f of bundleFiles) {
    const pPath = join(BUNDLE_DIR, f);
    const rawData = JSON.parse(readFileSync(pPath, 'utf8'));
    const cleanDoc = homogenizeProtocol(rawData, rawData.id || rawData.protocol_id || f.split('--')[0]);
    writeFileSync(pPath, JSON.stringify(cleanDoc, null, 2), 'utf8');
    bundleUpdated++;
  }
  console.log(`✅ Successfully updated ${bundleUpdated} files in ${BUNDLE_DIR}.\n`);

  console.log('================================================================');
  console.log('🎉 HOMOGENIZATION COMPLETE ACROSS ALL REPOSITORIES AND FIRESTORE');
  console.log('================================================================');
}

runHomogenization().catch(err => {
  console.error('❌ Homogenization failed:', err);
  process.exit(1);
});

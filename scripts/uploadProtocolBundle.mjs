#!/usr/bin/env node
/**
 * uploadProtocolBundle.mjs
 *
 * Uploads every protocol JSON from the 2.0 bundle directory into the Firestore
 * `blueprints/` collection using the protocol's `protocol_id` as the document ID.
 *
 * ─ Idempotent: uses merge:true — safe to re-run after edits.
 * ─ Mirrors the same Firebase-first pattern used for products/ and suppliers/.
 *
 * Usage:
 *   node scripts/uploadProtocolBundle.mjs
 *
 * Requirements:
 *   Place serviceAccountKey.json in the project root  OR  set env var:
 *   FIREBASE_SERVICE_ACCOUNT_JSON='{ ...json content... }'
 *
 *   npm install firebase-admin  (if not already installed)
 */

import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { db } from './lib/firebase-admin.mjs';

// ─── Paths ────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const BUNDLE_DIR   = join(
  PROJECT_ROOT,
  'src/services/protocol_finder_2_0_protocols_bundle'
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip undefined values — Firestore rejects them */
const sanitize = (obj) => JSON.parse(JSON.stringify(obj));

/** Read all *.json files from the bundle dir (skip index.js) */
function loadBundleFiles() {
  const files = readdirSync(BUNDLE_DIR)
    .filter((f) => extname(f) === '.json')
    .sort();

  return files.map((f) => {
    const raw = readFileSync(join(BUNDLE_DIR, f), 'utf-8');
    const data = JSON.parse(raw);
    return { filename: f, data };
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function uploadProtocolBundle() {
  const bundles = loadBundleFiles();
  if (bundles.length === 0) {
    console.error('❌  No JSON files found in bundle dir:', BUNDLE_DIR);
    process.exit(1);
  }

  console.log(`\n📋  Uploading ${bundles.length} protocols → Firestore blueprints/\n`);

  const batch = db.batch();
  let count = 0;
  const skipped = [];

  for (const { filename, data } of bundles) {
    const docId = data.protocol_id;
    if (!docId) {
      skipped.push(filename);
      console.warn(`  ⚠   Skipping ${filename} — no protocol_id field`);
      continue;
    }

    const payload = sanitize({
      ...data,
      // Enforce required filter fields used by protocolRepository.getProtocolTemplates()
      active:     data.active  !== undefined ? data.active  : true,
      status:     data.status  !== undefined ? data.status  : 'approved',
      // Audit trail
      uploadedAt: new Date().toISOString(),
      bundleVersion: '2.0',
    });

    batch.set(db.collection('blueprints').doc(docId), payload, { merge: true });
    console.log(`  ✔   ${docId.padEnd(14)} — ${data.protocol_title}`);
    count++;
  }

  await batch.commit();

  console.log(`\n✅  Done — ${count} protocols written to blueprints/`);
  if (skipped.length) {
    console.warn(`⚠   ${skipped.length} file(s) skipped (missing protocol_id): ${skipped.join(', ')}`);
  }
  console.log('');
}

uploadProtocolBundle().catch((err) => {
  console.error('\n❌  Upload failed:', err.message || err);
  process.exit(1);
});

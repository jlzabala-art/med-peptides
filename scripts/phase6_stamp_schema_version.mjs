#!/usr/bin/env node

/**
 * phase6_stamp_schema_version.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time migration script that stamps `_schemaVersion: 2` on every document
 * in `products/` that doesn't already have it.
 *
 * Also validates that required fields (name, type, categoryId, status) exist
 * and reports any documents that are missing them.
 *
 * SAFETY:
 *   - DRY RUN by default. Use --commit to actually write.
 *   - Uses batched writes (max 500 per batch).
 *   - Logs every change before executing.
 *
 * Usage:
 *   node scripts/phase6_stamp_schema_version.mjs          # dry run
 *   node scripts/phase6_stamp_schema_version.mjs --commit  # live run
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Firebase Admin init ─────────────────────────────────────────────────────

const saKeyPath = resolve(__dirname, '../serviceAccountKey.json');
if (!existsSync(saKeyPath)) {
  console.error('❌ serviceAccountKey.json not found at:', saKeyPath);
  console.error('   Place your Firebase Admin SDK key at the project root.');
  process.exit(1);
}

const sa = JSON.parse(readFileSync(saKeyPath, 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

// ── Config ──────────────────────────────────────────────────────────────────

const SCHEMA_VERSION = 2;
const COMMIT = process.argv.includes('--commit');
const VALID_STATUSES = ['draft', 'active', 'published', 'out of stock', 'hidden', 'archived'];
const REQUIRED_FIELDS = ['name', 'type', 'categoryId', 'status'];

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  Phase 6 — Schema Version Stamp`);
  console.log(`  Mode: ${COMMIT ? '🔴 LIVE (--commit)' : '🟢 DRY RUN'}`);
  console.log(`  Target: products/* → _schemaVersion: ${SCHEMA_VERSION}`);
  console.log(`${'═'.repeat(70)}\n`);

  const productsSnap = await db.collection('products').get();
  console.log(`📦 Found ${productsSnap.size} product documents.\n`);

  const stats = {
    alreadyStamped: 0,
    needsStamp: 0,
    missingFields: [],
    invalidStatus: [],
    updated: 0,
  };

  // ── Phase 1: Audit ──────────────────────────────────────────────────────
  const toUpdate = [];

  for (const docSnap of productsSnap.docs) {
    const data = docSnap.data();
    const id = docSnap.id;

    // Check schema version
    if (data._schemaVersion === SCHEMA_VERSION) {
      stats.alreadyStamped++;
      continue;
    }

    // Check required fields
    const missing = REQUIRED_FIELDS.filter(f => !data[f]);
    if (missing.length > 0) {
      stats.missingFields.push({ id, name: data.name || '(no name)', missing });
    }

    // Check status validity
    if (data.status && !VALID_STATUSES.includes(data.status)) {
      stats.invalidStatus.push({ id, name: data.name || '(no name)', status: data.status });
    }

    stats.needsStamp++;
    toUpdate.push(docSnap.ref);
  }

  // ── Report ────────────────────────────────────────────────────────────
  console.log(`📊 Audit Results:`);
  console.log(`   Already stamped (v${SCHEMA_VERSION}): ${stats.alreadyStamped}`);
  console.log(`   Needs stamp:                ${stats.needsStamp}`);

  if (stats.missingFields.length > 0) {
    console.log(`\n⚠️  Documents with missing required fields (${stats.missingFields.length}):`);
    for (const { id, name, missing } of stats.missingFields.slice(0, 20)) {
      console.log(`   ${id} (${name}): missing [${missing.join(', ')}]`);
    }
    if (stats.missingFields.length > 20) {
      console.log(`   ... and ${stats.missingFields.length - 20} more`);
    }
  }

  if (stats.invalidStatus.length > 0) {
    console.log(`\n⚠️  Documents with invalid status (${stats.invalidStatus.length}):`);
    for (const { id, name, status } of stats.invalidStatus.slice(0, 10)) {
      console.log(`   ${id} (${name}): status="${status}"`);
    }
  }

  // ── Phase 2: Write (if --commit) ──────────────────────────────────────
  if (toUpdate.length === 0) {
    console.log(`\n✅ All documents already have _schemaVersion: ${SCHEMA_VERSION}. Nothing to do.`);
    return;
  }

  if (!COMMIT) {
    console.log(`\n🟢 DRY RUN: Would update ${toUpdate.length} documents.`);
    console.log(`   Re-run with --commit to apply changes.`);
    return;
  }

  console.log(`\n🔴 Applying _schemaVersion: ${SCHEMA_VERSION} to ${toUpdate.length} documents...`);

  // Batch writes (max 500 per batch)
  const BATCH_SIZE = 450;
  for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = toUpdate.slice(i, i + BATCH_SIZE);

    for (const ref of chunk) {
      batch.update(ref, {
        _schemaVersion: SCHEMA_VERSION,
        updatedAt: new Date(),
      });
    }

    await batch.commit();
    stats.updated += chunk.length;
    console.log(`   ✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} docs updated (total: ${stats.updated})`);
  }

  console.log(`\n✅ Done. Updated ${stats.updated} documents with _schemaVersion: ${SCHEMA_VERSION}.`);
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

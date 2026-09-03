#!/usr/bin/env node
/**
 * migrate_quotations.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time migration script: Firestore `quotations` collection
 *
 * Changes applied per document:
 *   1. category        → recipientType  (field rename, same value)
 *   2. tier            → pricingTier    (field rename, same value)
 *   3. tierLevel       → deleted        (was duplicate of pricingTier)
 *   4. _schemaVersion  → set to 1
 *   5. updatedAt       → set to migration timestamp
 *
 * SAFE TO RUN MULTIPLE TIMES (idempotent):
 *   - Documents already migrated (no legacy fields) are skipped.
 *   - Documents with recipientType already set keep their value.
 *
 * Usage:
 *   node migrate_quotations.cjs [--dry-run]
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
 *   - OR run from Cloud Shell / Firebase emulator with auth pre-configured
 * ─────────────────────────────────────────────────────────────────────────────
 */

const admin = require('firebase-admin');

// ── Config ────────────────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes('--dry-run');
const COLLECTION = 'quotations';
const BATCH_SIZE = 400; // Firestore batch limit is 500; use 400 for safety margin

// ── Firebase init ─────────────────────────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// ── Migration Logic ───────────────────────────────────────────────────────────

/**
 * Returns true if a document needs migration.
 */
function needsMigration(data) {
  return (
    'category' in data ||
    'tier' in data ||
    'tierLevel' in data
  );
}

/**
 * Returns the migrated document update payload.
 * Does NOT include unchanged fields — only the delta.
 */
function buildMigrationPayload(data) {
  const update = {
    _schemaVersion: 1,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // 1. category → recipientType
  if ('category' in data) {
    if (!data.recipientType) {
      update.recipientType = data.category;
    }
    update.category = admin.firestore.FieldValue.delete();
  }

  // 2. tier → pricingTier
  if ('tier' in data) {
    if (!data.pricingTier) {
      update.pricingTier = data.tier;
    }
    update.tier = admin.firestore.FieldValue.delete();
  }

  // 3. tierLevel → delete (was duplicate)
  if ('tierLevel' in data) {
    update.tierLevel = admin.firestore.FieldValue.delete();
  }

  return update;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function migrate() {
  console.log(`\n🚀 Quotation Schema Migration`);
  console.log(`   Collection: ${COLLECTION}`);
  console.log(`   Mode: ${DRY_RUN ? '🔍 DRY RUN (no writes)' : '✍️  LIVE (writes enabled)'}`);
  console.log('─'.repeat(60));

  let totalDocs = 0;
  let migratedDocs = 0;
  let skippedDocs = 0;
  let errorDocs = 0;

  let lastDoc = null;
  let hasMore = true;

  while (hasMore) {
    let q = db.collection(COLLECTION).orderBy('__name__').limit(BATCH_SIZE);
    if (lastDoc) q = q.startAfter(lastDoc);

    const snap = await q.get();
    if (snap.empty) break;

    hasMore = snap.docs.length === BATCH_SIZE;
    lastDoc = snap.docs[snap.docs.length - 1];

    const batch = db.batch();
    let batchCount = 0;

    for (const docSnap of snap.docs) {
      totalDocs++;
      const data = docSnap.data();

      if (!needsMigration(data)) {
        skippedDocs++;
        continue;
      }

      try {
        const payload = buildMigrationPayload(data);
        const docId = docSnap.id;

        console.log(`  📄 ${docId}`);
        if ('category' in data) {
          console.log(`     category="${data.category}" → recipientType="${payload.recipientType ?? data.recipientType}"`);
        }
        if ('tier' in data) {
          console.log(`     tier="${data.tier}" → pricingTier="${payload.pricingTier ?? data.pricingTier}"`);
        }
        if ('tierLevel' in data) {
          console.log(`     tierLevel="${data.tierLevel}" → DELETED`);
        }

        if (!DRY_RUN) {
          batch.update(docSnap.ref, payload);
          batchCount++;
        }

        migratedDocs++;
      } catch (err) {
        errorDocs++;
        console.error(`  ❌ Error on ${docSnap.id}:`, err.message);
      }
    }

    if (!DRY_RUN && batchCount > 0) {
      await batch.commit();
      console.log(`  ✅ Batch committed: ${batchCount} documents`);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`📊 Migration Summary:`);
  console.log(`   Total documents scanned:  ${totalDocs}`);
  console.log(`   Migrated:                 ${migratedDocs}`);
  console.log(`   Skipped (already clean):  ${skippedDocs}`);
  console.log(`   Errors:                   ${errorDocs}`);
  if (DRY_RUN) {
    console.log(`\n⚠️  DRY RUN — No changes were written.`);
    console.log(`   Re-run without --dry-run to apply changes.`);
  } else {
    console.log(`\n✅ Migration complete.`);
  }
}

migrate().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

/**
 * migrateRxStatuses.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Migración de estados de prescripciones en Firestore.
 * Normaliza TODOS los valores legacy (Active, Fulfilled, sent, etc.)
 * al vocabulario canónico definido en AGENTS.md Rule #28.
 *
 * MODO DRY-RUN (por defecto): solo reporta qué cambiaría, NO escribe.
 * MODO LIVE: node src/scripts/migrateRxStatuses.mjs --live
 *
 * Uso:
 *   node src/scripts/migrateRxStatuses.mjs           # dry-run (seguro)
 *   node src/scripts/migrateRxStatuses.mjs --live    # ejecuta la migración
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf-8')
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── Modo ──────────────────────────────────────────────────────────────────────
const IS_LIVE = process.argv.includes('--live');

// ── Mapa legacy → canónico (mismo que normalizeRxStatus.js) ──────────────────
const LEGACY_TO_CANONICAL = {
  // Draft
  'draft':                     'draft',
  'Draft':                     'draft',
  'DRAFT':                     'draft',

  // Pending
  'pending':                   'pending',
  'Pending':                   'pending',
  'PENDING':                   'pending',
  'awaiting':                  'pending',
  'Awaiting':                  'pending',
  'assigned_to_wholesaler':    'pending',
  'sent':                      'pending',
  'Sent':                      'pending',

  // Approved
  'approved':                  'approved',
  'Approved':                  'approved',
  'APPROVED':                  'approved',
  'active':                    'approved',
  'Active':                    'approved',
  'ACTIVE':                    'approved',
  'viewed_by_patient':         'approved',
  'added_to_bulk':             'approved',

  // Processing
  'processing':                'processing',
  'Processing':                'processing',
  'PROCESSING':                'processing',
  'ordered':                   'processing',
  'Ordered':                   'processing',

  // En tránsito
  'en tránsito':               'en tránsito',
  'in_transit':                'en tránsito',
  'In Transit':                'en tránsito',
  'in transit':                'en tránsito',
  'shipped':                   'en tránsito',
  'Shipped':                   'en tránsito',

  // Completed
  'completed':                 'completed',
  'Completed':                 'completed',
  'COMPLETED':                 'completed',
  'fulfilled':                 'completed',
  'Fulfilled':                 'completed',
  'FULFILLED':                 'completed',
  'delivered':                 'completed',
  'Delivered':                 'completed',

  // Cancelled
  'cancelled':                 'cancelled',
  'Cancelled':                 'cancelled',
  'CANCELLED':                 'cancelled',
  'canceled':                  'cancelled',
  'Canceled':                  'cancelled',
  'expired':                   'cancelled',
  'Expired':                   'cancelled',
  'rejected':                  'cancelled',
  'Rejected':                  'cancelled',
};

function normalizeStatus(raw) {
  if (!raw) return { canonical: 'draft', changed: false, original: raw };
  const canonical = LEGACY_TO_CANONICAL[raw] ?? LEGACY_TO_CANONICAL[raw?.toLowerCase()?.trim()] ?? null;
  return {
    canonical: canonical ?? raw,
    changed: canonical !== null && canonical !== raw,
    unknown: canonical === null,
    original: raw,
  };
}

// ── Contadores ────────────────────────────────────────────────────────────────
const stats = {
  total:     0,
  skipped:   0,   // already canonical, no change needed
  toMigrate: 0,   // need update
  unknown:   0,   // status not in our map → logged but not touched
  errors:    0,
  migrated:  0,
};

const unknownStatuses = new Set();
const migrationLog   = []; // { id, original, canonical }

// ── Process in Firestore batches ──────────────────────────────────────────────
const BATCH_SIZE   = 500; // Firestore write batch limit
const READ_PAGE    = 100; // docs fetched per page

async function run() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`📋  PRESCRIPTION STATUS MIGRATION`);
  console.log(`    Mode: ${IS_LIVE ? '🔴 LIVE — writing to Firestore' : '🟡 DRY-RUN — no writes'}`);
  console.log('════════════════════════════════════════════════════════════\n');

  let cursor = null;
  let page   = 0;

  while (true) {
    page++;
    let q = db.collection('prescriptions').orderBy('createdAt', 'desc').limit(READ_PAGE);
    if (cursor) q = q.startAfter(cursor);

    const snap = await q.get();
    if (snap.empty) break;

    cursor = snap.docs[snap.docs.length - 1];
    console.log(`  → Page ${page}: ${snap.docs.length} docs`);

    for (const docSnap of snap.docs) {
      stats.total++;
      const data   = docSnap.data();
      const raw    = data.status;
      const result = normalizeStatus(raw);

      if (result.unknown) {
        stats.unknown++;
        unknownStatuses.add(raw);
        console.warn(`  ⚠️  Unknown status: "${raw}" (id: ${docSnap.id.slice(0, 8)}…) — SKIPPED`);
        continue;
      }

      if (!result.changed) {
        stats.skipped++;
        continue;
      }

      // Needs migration
      stats.toMigrate++;
      migrationLog.push({ id: docSnap.id, original: result.original, canonical: result.canonical });
    }

    if (snap.docs.length < READ_PAGE) break; // last page
  }

  // ── Summary before write ──────────────────────────────────────────────────
  console.log('\n── Pre-migration scan ───────────────────────────────────────');
  console.log(`   Total prescriptions scanned : ${stats.total}`);
  console.log(`   Already canonical (skip)    : ${stats.skipped}`);
  console.log(`   Need migration               : ${stats.toMigrate}`);
  console.log(`   Unknown statuses (skip)      : ${stats.unknown}`);
  if (unknownStatuses.size > 0) {
    console.log(`   Unknown values: ${[...unknownStatuses].join(', ')}`);
  }

  if (migrationLog.length > 0) {
    console.log('\n── Changes to apply ─────────────────────────────────────────');
    // Group by old → new
    const grouped = {};
    for (const entry of migrationLog) {
      const key = `"${entry.original}" → "${entry.canonical}"`;
      grouped[key] = (grouped[key] || 0) + 1;
    }
    for (const [change, count] of Object.entries(grouped)) {
      console.log(`   ${count.toString().padStart(4)} × ${change}`);
    }
  }

  if (!IS_LIVE) {
    console.log('\n🟡 DRY-RUN complete. No changes written.');
    console.log('   Run with --live to execute the migration.\n');
    return;
  }

  if (migrationLog.length === 0) {
    console.log('\n✅ Nothing to migrate. All statuses are already canonical.\n');
    return;
  }

  // ── Execute batched writes ────────────────────────────────────────────────
  console.log('\n── Writing batched updates ──────────────────────────────────');
  const now       = new Date().toISOString();
  const adminUser = 'migration_script';

  for (let i = 0; i < migrationLog.length; i += BATCH_SIZE) {
    const chunk = migrationLog.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const entry of chunk) {
      const ref = db.collection('prescriptions').doc(entry.id);
      batch.update(ref, {
        status:    entry.canonical,
        updatedAt: now,
        auditTrail: FieldValue.arrayUnion({
          timestamp:   now,
          action:      'status_migration',
          originalStatus: entry.original,
          newStatus:   entry.canonical,
          user:        adminUser,
          description: `Automated migration: "${entry.original}" → "${entry.canonical}" (Rule #28 normalization)`,
        }),
      });
    }

    try {
      await batch.commit();
      stats.migrated += chunk.length;
      console.log(`   ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} docs updated`);
    } catch (err) {
      stats.errors += chunk.length;
      console.error(`   ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} FAILED:`, err.message);
    }
  }

  // ── Final summary ─────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`🎉  MIGRATION COMPLETE`);
  console.log(`    Migrated  : ${stats.migrated}`);
  console.log(`    Skipped   : ${stats.skipped} (already canonical)`);
  console.log(`    Unknown   : ${stats.unknown} (untouched)`);
  console.log(`    Errors    : ${stats.errors}`);
  console.log('════════════════════════════════════════════════════════════\n');
}

run().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});

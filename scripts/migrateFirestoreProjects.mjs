/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Migración única de Firestore: regenpept-web-app → med-peptides-app
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ⚠️  DESTINO OFICIAL Y PERMANENTE: med-peptides-app  (med-peptides.com)
 *
 *     Este script se ejecutó UNA VEZ para migrar el catálogo histórico desde
 *     'regenpept-web-app' al proyecto de producción 'med-peptides-app'.
 *
 *     A partir de ahora, TODOS los datos (productos, ajustes, FAQs, etc.)
 *     viven en 'med-peptides-app'. No escribir datos en ningún otro proyecto.
 *
 * Prerrequisitos:
 *   npm install firebase-admin
 *   Coloca serviceAccount-source.json y serviceAccount-target.json en la raíz
 *   (ambos archivos están en .gitignore — nunca los commits)
 *
 * Uso (solo si necesitas re-ejecutar la migración):
 *   node scripts/migrateFirestoreProjects.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ── Collections to migrate from SOURCE → TARGET ──────────────────────────────
// Collections already in target are set to SKIP to avoid overwriting newer data.
// Change SKIP → MERGE to copy docs that don't exist in target.
const COLLECTION_PLAN = {
  catalogProducts:            'COPY',   // not in target
  discovery_config:           'COPY',   // not in target
  peptide_compare_blocks:     'COPY',   // not in target
  products:                   'COPY',   // not in target
  protocol_builder_sessions:  'COPY',   // not in target
  settings:                   'COPY',   // not in target
  // Already in target — only add docs missing from target, never overwrite
  faq_categories:             'MERGE',
  faq_landing_config:         'MERGE',
  faq_peptide_mapping:        'MERGE',
  peptide_faq:                'MERGE',
  peptide_related_engine:     'MERGE',
  pubmed_cache:               'MERGE',
  saved_protocols:            'MERGE',
  users:                      'MERGE',  // Firestore user docs only; Auth is shared
};

// ── Firebase Admin init ───────────────────────────────────────────────────────
function initAdmin(name, projectId, saPath) {
  if (getApps().find(a => a.name === name)) return getApps().find(a => a.name === name);
  const opts = { projectId };
  if (existsSync(saPath)) {
    opts.credential = cert(JSON.parse(readFileSync(saPath, 'utf-8')));
    console.log(`✅ [${name}] Initialised with service account: ${saPath}`);
  } else {
    // Relies on GOOGLE_APPLICATION_CREDENTIALS or gcloud ADC
    console.log(`⚠️  [${name}] No service account found at ${saPath} — using ADC`);
  }
  return initializeApp(opts, name);
}

const sourceApp = initAdmin(
  'source',
  'regenpept-web-app',
  resolve(root, 'serviceAccount-source.json')
);
const targetApp = initAdmin(
  'target',
  'med-peptides-app',
  resolve(root, 'serviceAccount-target.json')
);

const sourceDb = getFirestore(sourceApp);
const targetDb = getFirestore(targetApp);

// ── Migration helpers ─────────────────────────────────────────────────────────
async function migrateCollection(collectionId, mode) {
  console.log(`\n📂 [${collectionId}] mode=${mode}`);
  const srcRef = sourceDb.collection(collectionId);
  const tgtRef = targetDb.collection(collectionId);

  const snapshot = await srcRef.get();
  if (snapshot.empty) {
    console.log(`   ⬜ Empty in source — skipping.`);
    return { created: 0, skipped: 0, errors: 0 };
  }

  let created = 0, skipped = 0, errors = 0;

  // Process in batches of 400 (Firestore limit is 500 per batch)
  const BATCH_SIZE = 400;
  const docs = snapshot.docs;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = targetDb.batch();
    const chunk = docs.slice(i, i + BATCH_SIZE);

    for (const srcDoc of chunk) {
      try {
        const tgtDocRef = tgtRef.doc(srcDoc.id);

        if (mode === 'MERGE') {
          const tgtSnap = await tgtDocRef.get();
          if (tgtSnap.exists) {
            skipped++;
            continue;
          }
        }

        batch.set(tgtDocRef, {
          ...srcDoc.data(),
          _migratedAt: new Date().toISOString(),
          _migratedFrom: 'regenpept-web-app',
        });
        created++;
      } catch (err) {
        console.error(`   ❌ Error on doc ${srcDoc.id}:`, err.message);
        errors++;
      }
    }

    await batch.commit();
    console.log(`   ✅ Committed batch ${Math.ceil(i / BATCH_SIZE) + 1} (${Math.min(i + BATCH_SIZE, docs.length)}/${docs.length})`);
  }

  return { created, skipped, errors };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Starting Firestore migration: regenpept-web-app → med-peptides-app\n');
  const summary = {};

  for (const [collectionId, mode] of Object.entries(COLLECTION_PLAN)) {
    summary[collectionId] = await migrateCollection(collectionId, mode);
  }

  console.log('\n══════════════════════════════════════════');
  console.log('MIGRATION SUMMARY');
  console.log('══════════════════════════════════════════');
  let totalCreated = 0, totalSkipped = 0, totalErrors = 0;
  for (const [col, stats] of Object.entries(summary)) {
    console.log(`  ${col.padEnd(30)} created=${stats.created}  skipped=${stats.skipped}  errors=${stats.errors}`);
    totalCreated += stats.created;
    totalSkipped += stats.skipped;
    totalErrors += stats.errors;
  }
  console.log('──────────────────────────────────────────');
  console.log(`  TOTAL: created=${totalCreated}  skipped=${totalSkipped}  errors=${totalErrors}`);
  console.log('══════════════════════════════════════════\n');

  if (totalErrors > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

/**
 * PHASE 7 — Universal ID+Name Denormalization
 * ─────────────────────────────────────────────────────────────────────────────
 * Ensures every entity that has an ID also has a canonical `name` field stored
 * alongside it. This makes the frontend display-ready without any runtime joins.
 *
 * Fields added/fixed:
 *   suppliers          → { name }          (canonical, from companyName || name)
 *   variants           → { supplierName }  (denormalized from suppliers collection)
 *   variants           → { presentationName } (from PRESENTATION_LABELS constant)
 *
 * Run (dry-run):  node scripts/migration/07_denormalise_names.mjs
 * Run (execute):  node scripts/migration/07_denormalise_names.mjs --execute
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';
import { readFileSync }                  from 'fs';
import { join, dirname }                 from 'path';
import { fileURLToPath }                 from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(join(__dirname, '../serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

const DRY_RUN = !process.argv.includes('--execute');
console.log(DRY_RUN ? '🔍  DRY RUN — no writes' : '✏️   EXECUTING writes');
console.log('════════════════════════════════════════════════════════════════\n');

// ── PRESENTATION_LABELS (inline copy — same as src/constants/presentationTypes.js) ──
const PRESENTATION_LABELS = {
  vial:        'Vial',
  pen:         'Pre-filled Pen',
  nasal_spray: 'Nasal Spray',
  capsule:     'Capsule',
  tablet:      'Tablet',
  cream:       'Topical Cream',
  bottle:      'Bottle',
  kit:         'Kit',
  bundle:      'Bundle',
  digital:     'Digital Service',
  blood_test:  'Blood Test',
  dna_test:    'DNA Test',
  box:         'Box',
};

// ── STEP 1: Build supplier ID → canonical name map ───────────────────────────
console.log('STEP 1 — Building supplier name map from suppliers collection...');
const supSnap = await db.collection('suppliers').get();
const supplierMap = {}; // { 'supplier-lotusland': 'Lotusland', ... }

for (const doc of supSnap.docs) {
  const d = doc.data();
  const canonical = d.companyName || d.name || d.displayName;
  if (!canonical) {
    console.log(`  ⚠️  Supplier ${doc.id} has no name — skipping`);
    continue;
  }
  supplierMap[doc.id] = canonical;

  // Ensure the supplier doc itself has a 'name' field (canonical)
  if (!d.name || d.name !== canonical) {
    console.log(`  supplier ${doc.id}: name "${d.name}" → "${canonical}"`);
    if (!DRY_RUN) {
      await doc.ref.update({ name: canonical });
    }
  }
}
console.log(`  Built map for ${Object.keys(supplierMap).length} suppliers\n`);

// ── STEP 2: Denormalize supplierName + presentationName onto variants ─────────
console.log('STEP 2 — Scanning all variants...');
const allVarSnap = await db.collectionGroup('variants').get();
console.log(`  Loaded ${allVarSnap.size} variants\n`);

let needsUpdate = 0;
let written = 0;
let skipped = 0;
const BATCH_SIZE = 400;

let batch = db.batch();
let batchCount = 0;

const commitBatch = async () => {
  if (batchCount > 0 && !DRY_RUN) {
    await batch.commit();
    written += batchCount;
    batch = db.batch();
    batchCount = 0;
  }
};

for (const doc of allVarSnap.docs) {
  const v = doc.data();
  const updates = {};

  // — supplierName ────────────────────────────────────────────────────────────
  const sid = v.supplierId || v.supplier;
  if (sid) {
    const correctName = supplierMap[sid];
    if (correctName && v.supplierName !== correctName) {
      updates.supplierName = correctName;
    }
  }

  // — presentationName ────────────────────────────────────────────────────────
  const pres = v.presentation;
  if (pres) {
    const correctPName = PRESENTATION_LABELS[pres];
    if (correctPName && v.presentationName !== correctPName) {
      updates.presentationName = correctPName;
    }
  }

  if (Object.keys(updates).length === 0) {
    skipped++;
    continue;
  }

  needsUpdate++;
  const pid = doc.ref.parent.parent.id;
  console.log(`  [${pid} / ${doc.id}] +${Object.keys(updates).join(', ')} →`,
    Object.entries(updates).map(([k,v]) => `${k}="${v}"`).join(', '));

  if (!DRY_RUN) {
    updates.updatedAt = new Date().toISOString();
    batch.update(doc.ref, updates);
    batchCount++;

    if (batchCount >= BATCH_SIZE) {
      await commitBatch();
      console.log(`  ✓ Committed batch (${written} written so far)...`);
    }
  }
}

await commitBatch();

// ── SUMMARY ──────────────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════════════════════════');
console.log('SUMMARY');
console.log(`  Total variants scanned : ${allVarSnap.size}`);
console.log(`  Already up-to-date     : ${skipped}`);
console.log(`  Need update            : ${needsUpdate}`);
if (!DRY_RUN) {
  console.log(`  Written to Firestore   : ${written}`);
} else {
  console.log(`  (dry-run) Would write  : ${needsUpdate}`);
  console.log('\n  Run with --execute to apply changes.');
}

process.exit(0);

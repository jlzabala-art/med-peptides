/**
 * migrate_blueprints_to_protocols.cjs
 *
 * PHASE 1 — Copy blueprints NOT yet in `protocols` → `protocols`
 * PHASE 2 — Verify all 25 exist in `protocols`
 * PHASE 3 — Delete every document in `blueprints`
 *
 * Usage: node scripts/migrate_blueprints_to_protocols.cjs
 */

'use strict';

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

const SA_PATH = path.resolve(__dirname, '../Med-Peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))) });
const db = admin.firestore();

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  BLUEPRINT → PROTOCOLS MIGRATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ── PHASE 1: Read both collections ─────────────────────────────────────────
  console.log('📥  Reading blueprints and protocols collections…');
  const [bpSnap, prSnap] = await Promise.all([
    db.collection('blueprints').get(),
    db.collection('protocols').get(),
  ]);

  console.log(`   blueprints : ${bpSnap.size} docs`);
  console.log(`   protocols  : ${prSnap.size} docs\n`);

  const existingIds = new Set(prSnap.docs.map(d => d.id));
  const toMigrate   = bpSnap.docs.filter(d => !existingIds.has(d.id));

  if (toMigrate.length === 0) {
    console.log('✅  All blueprints already exist in protocols. Nothing to copy.\n');
  } else {
    console.log(`📋  ${toMigrate.length} blueprint(s) missing from protocols — copying now:\n`);

    // Write in batches of 500 (Firestore limit)
    const BATCH_SIZE = 400;
    for (let i = 0; i < toMigrate.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = toMigrate.slice(i, i + BATCH_SIZE);
      chunk.forEach(doc => {
        const ref = db.collection('protocols').doc(doc.id);
        batch.set(ref, doc.data());
        console.log(`   ✅  Copied  ${doc.id}`);
      });
      await batch.commit();
    }
    console.log(`\n   ✔  ${toMigrate.length} protocol(s) written to 'protocols'\n`);
  }

  // ── PHASE 2: Verify ─────────────────────────────────────────────────────────
  console.log('🔍  Verifying protocols collection…');
  const finalSnap = await db.collection('protocols').get();
  console.log(`   protocols now contains: ${finalSnap.size} docs`);

  const bpIds  = new Set(bpSnap.docs.map(d => d.id));
  const prIds  = new Set(finalSnap.docs.map(d => d.id));
  const missing = [...bpIds].filter(id => !prIds.has(id));

  if (missing.length > 0) {
    console.error(`\n❌  ABORT — ${missing.length} blueprint(s) still not in protocols:`);
    missing.forEach(id => console.error(`     - ${id}`));
    console.error('   NOT deleting blueprints. Fix and re-run.\n');
    process.exit(1);
  }

  console.log('   ✅  All blueprint IDs confirmed in protocols\n');

  // ── PHASE 3: Delete blueprints collection ───────────────────────────────────
  console.log('🗑️   Deleting all documents from blueprints collection…');
  const BATCH_SIZE = 400;
  const allBpDocs = bpSnap.docs;

  for (let i = 0; i < allBpDocs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = allBpDocs.slice(i, i + BATCH_SIZE);
    chunk.forEach(doc => {
      batch.delete(doc.ref);
      console.log(`   🗑  Deleted blueprint/${doc.id}`);
    });
    await batch.commit();
  }

  // ── Final check ─────────────────────────────────────────────────────────────
  const bpAfter = await db.collection('blueprints').get();
  console.log(`\n   blueprints remaining: ${bpAfter.size} docs`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✅  DONE — protocols: ${finalSnap.size} | blueprints deleted`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  process.exit(0);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });

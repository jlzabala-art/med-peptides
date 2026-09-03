/**
 * fix_lotusland_categories.mjs — v2 (strict supplierId match only)
 *
 * Modes:
 *   node scripts/fix_lotusland_categories.mjs           (dry-run)
 *   node scripts/fix_lotusland_categories.mjs --live    (write to Firestore)
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);
const sa        = require(path.join(__dirname, 'serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}

const db   = admin.firestore();
const LIVE = process.argv.includes('--live');

// STRICT: only the Firestore document IDs that belong to Lotusland supplier
const LOTUSLAND_SUPPLIER_ID = 'OLlBbQjgrj6tY7GmM2Jo';
const TARGET_CATEGORY       = 'Peptides';

async function run() {
  console.log(`\n🌿 Lotusland Category Fix — mode: ${LIVE ? '🔴 LIVE' : '🟡 DRY-RUN'}\n`);

  // Fetch only products where supplierId == Lotusland's exact Firestore ID
  const snap = await db.collection('products')
    .where('supplierId', '==', LOTUSLAND_SUPPLIER_ID)
    .get();

  console.log(`📦 Lotusland products found (by supplierId): ${snap.size}`);

  const toFix    = [];
  const alreadyOk = [];

  snap.forEach(doc => {
    const data = doc.data();
    if (data.category === TARGET_CATEGORY) {
      alreadyOk.push(doc.id);
    } else {
      toFix.push({ id: doc.id, name: data.canonicalName || data.name || doc.id, current: data.category || '(empty)' });
    }
  });

  console.log(`✅ Already "Peptides" : ${alreadyOk.length}`);
  console.log(`❌ Need fixing        : ${toFix.length}\n`);

  if (toFix.length === 0) {
    console.log('🎉 All Lotusland products already have category "Peptides".');
    return;
  }

  console.log('Will update:');
  toFix.forEach(d => console.log(`  • [${d.id}] ${d.name}  →  "${d.current}" → "Peptides"`));

  if (!LIVE) {
    console.log(`\n⚠️  DRY-RUN — no writes. Re-run with --live to apply.`);
    return;
  }

  // Write in batches of 499
  console.log('\n✍️  Writing …');
  let written = 0;
  for (let i = 0; i < toFix.length; i += 499) {
    const batch = db.batch();
    toFix.slice(i, i + 499).forEach(d => {
      batch.update(db.collection('products').doc(d.id), {
        category:  TARGET_CATEGORY,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await batch.commit();
    written += Math.min(499, toFix.length - i);
    console.log(`  ↳ Committed ${written}/${toFix.length}`);
  }

  console.log(`\n✅ Done — ${toFix.length} products updated to "Peptides".`);
}

run().catch(err => { console.error(err); process.exit(1); });

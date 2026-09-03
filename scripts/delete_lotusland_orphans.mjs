/**
 * delete_lotusland_orphans.mjs
 * Permanently deletes Firestore products of Lotusland that are NOT
 * in the current Master Price List JSON.
 *
 * node scripts/delete_lotusland_orphans.mjs           (dry-run)
 * node scripts/delete_lotusland_orphans.mjs --live    (DELETE forever)
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);
const sa        = require(path.join(__dirname, 'serviceAccountKey.json'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });

const db   = admin.firestore();
const LIVE = process.argv.includes('--live');
const LOTUSLAND_ID = 'OLlBbQjgrj6tY7GmM2Jo';

const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

const priceList = JSON.parse(
  readFileSync(path.join(__dirname, '../AI Prompts/LotusLand Master Price List.json'), 'utf8')
);
const plProductNames = new Set(priceList.map(p => norm(p.product)));

async function run() {
  console.log(`\n🗑  Lotusland Orphan DELETE — mode: ${LIVE ? '🔴 LIVE (permanent)' : '🟡 DRY-RUN'}\n`);

  const snap = await db.collection('products')
    .where('supplierId', '==', LOTUSLAND_ID)
    .get();

  console.log(`📦 Firestore docs for Lotusland: ${snap.size}`);

  const toDelete = [];
  const toKeep   = [];

  snap.forEach(doc => {
    const data = doc.data();
    const nameNorm = norm(data.canonicalName || data.name || '');
    if (plProductNames.has(nameNorm)) {
      toKeep.push(doc.id);
    } else {
      toDelete.push({ id: doc.id, name: data.canonicalName || data.name, dosage: data.dosage });
    }
  });

  console.log(`✅ Keeping (in price list) : ${toKeep.length}`);
  console.log(`🗑  To DELETE (orphans)     : ${toDelete.length}\n`);

  toDelete.forEach(d => console.log(`  • [${d.id}] "${d.name}" | ${d.dosage || 'no dosage'}`));

  if (!LIVE) {
    console.log(`\n⚠️  DRY-RUN — nothing deleted. Re-run with --live to permanently delete.`);
    return;
  }

  console.log('\n🔥 Deleting …');
  for (let i = 0; i < toDelete.length; i += 499) {
    const batch = db.batch();
    toDelete.slice(i, i + 499).forEach(d => batch.delete(db.collection('products').doc(d.id)));
    await batch.commit();
    console.log(`  ↳ Deleted ${Math.min(i + 499, toDelete.length)}/${toDelete.length}`);
  }
  console.log(`\n✅ Done — ${toDelete.length} orphan docs permanently deleted.`);
}

run().catch(err => { console.error(err); process.exit(1); });

/**
 * audit_lotusland_orphans.mjs
 * Compares Firestore Lotusland products vs the current Master Price List.
 * Shows which Firestore docs are NOT in the current price list (orphans).
 *
 * node scripts/audit_lotusland_orphans.mjs              (audit only)
 * node scripts/audit_lotusland_orphans.mjs --archive    (mark orphans as archived)
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

const db      = admin.firestore();
const ARCHIVE = process.argv.includes('--archive');
const LOTUSLAND_ID = 'OLlBbQjgrj6tY7GmM2Jo';

// Normalise a name for fuzzy matching
const norm = s => (s || '').toLowerCase()
  .replace(/[^a-z0-9]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// Load the canonical price list
const priceList = JSON.parse(
  readFileSync(path.join(__dirname, '../AI Prompts/LotusLand Master Price List.json'), 'utf8')
);

// Build a set of normalised product+dosage keys from the price list
const plKeys = new Set(
  priceList.map(p => norm(p.product) + '|' + norm(p.dosage))
);
const plProductNames = new Set(priceList.map(p => norm(p.product)));

console.log(`\n📋 Price list: ${priceList.length} entries, ${plProductNames.size} unique products\n`);

async function run() {
  const snap = await db.collection('products')
    .where('supplierId', '==', LOTUSLAND_ID)
    .get();

  console.log(`📦 Firestore docs for Lotusland: ${snap.size}`);

  const inPriceList = [];
  const orphans     = [];

  snap.forEach(doc => {
    const data = doc.data();
    const nameNorm = norm(data.canonicalName || data.name || '');
    const doseNorm = norm(data.dosage || data.dose || '');
    const key      = nameNorm + '|' + doseNorm;

    const matchExact   = plKeys.has(key);
    const matchProduct = plProductNames.has(nameNorm);

    if (matchExact || matchProduct) {
      inPriceList.push({ id: doc.id, name: data.canonicalName || data.name, dosage: data.dosage, status: data.status });
    } else {
      orphans.push({ id: doc.id, name: data.canonicalName || data.name, dosage: data.dosage, status: data.status });
    }
  });

  console.log(`✅ Matched to price list : ${inPriceList.length}`);
  console.log(`🗑  Orphans (not in list)  : ${orphans.length}\n`);

  if (orphans.length) {
    console.log('Orphan docs (old/stale variants not in current price list):');
    orphans.forEach(d => {
      console.log(`  • [${d.id}] "${d.name}" | ${d.dosage || 'no dosage'} | status: ${d.status || 'n/a'}`);
    });
  }

  if (!ARCHIVE) {
    console.log(`\n⚠️  Audit only — pass --archive to mark orphans as "archived".`);
    return;
  }

  if (orphans.length === 0) {
    console.log('No orphans to archive.');
    return;
  }

  console.log('\n✍️  Archiving orphans …');
  for (let i = 0; i < orphans.length; i += 499) {
    const batch = db.batch();
    orphans.slice(i, i + 499).forEach(d => {
      batch.update(db.collection('products').doc(d.id), {
        status: 'archived',
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await batch.commit();
    console.log(`  ↳ Archived ${Math.min(i + 499, orphans.length)}/${orphans.length}`);
  }
  console.log(`\n✅ Done — ${orphans.length} orphan docs archived.`);
}

run().catch(err => { console.error(err); process.exit(1); });

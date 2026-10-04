#!/usr/bin/env node
/**
 * fix-supplier-name.cjs
 * Sets supplierName = "BioBlend" on products where supplierName === "Magenta"
 * BioBlend is the commercial trade name for Magenta.
 * Usage: node scripts/fix-supplier-name.cjs [--dry-run]
 */
const admin = require('firebase-admin');
const path  = require('path');
const SA    = path.resolve(__dirname, '../serviceAccount-target.json');
admin.initializeApp({ credential: admin.credential.cert(SA), projectId: 'med-peptides-app' });
const db = admin.firestore();
const DRY = process.argv.includes('--dry-run');

async function main() {
  console.log(`\n🔍  Scanning for products with supplierName = "Magenta"…`);
  if (DRY) console.log(`⚠️   DRY RUN — no writes\n`);

  const snap = await db.collection('products')
    .where('supplierName', '==', 'Magenta')
    .get();

  console.log(`Found ${snap.size} products with supplierName "Magenta":\n`);
  snap.docs.forEach(doc => {
    const d = doc.data();
    console.log(`  • [${doc.id}]  ${d.name || doc.id}`);
  });

  if (!DRY && snap.size > 0) {
    console.log('\n🚀  Updating supplierName → "BioBlend"…');
    let batch = db.batch(), c = 0, tot = 0;
    for (const doc of snap.docs) {
      batch.update(doc.ref, { supplierName: 'BioBlend' });
      c++; tot++;
      if (c >= 400) { await batch.commit(); batch = db.batch(); c = 0; }
    }
    if (c) await batch.commit();
    console.log(`\n✅  Updated ${tot} products → supplierName: "BioBlend".`);
  }
  process.exit(0);
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });

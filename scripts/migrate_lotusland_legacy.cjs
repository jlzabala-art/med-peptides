/**
 * migrate_lotusland_legacy.cjs
 * Migrates products from legacy 'supplier-lotusland' → canonical 'OLlBbQjgrj6tY7GmM2Jo'
 * then deletes the orphan wholeseller doc.
 */
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'med-peptides-app' });
const db = admin.firestore();

const LEGACY_ID    = 'supplier-lotusland';
const CANONICAL_ID = 'OLlBbQjgrj6tY7GmM2Jo';

async function run() {
  console.log('=== Lotusland Legacy Migration ===\n');

  // 1. Find affected products
  const productsSnap = await db.collection('products').where('supplierId', '==', LEGACY_ID).get();
  console.log(`Found ${productsSnap.size} products with supplierId = '${LEGACY_ID}'`);

  // 2. Batch re-assign in chunks of 500
  const docs = productsSnap.docs;
  const CHUNK = 500;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = db.batch();
    docs.slice(i, i + CHUNK).forEach(d => batch.update(d.ref, { supplierId: CANONICAL_ID }));
    await batch.commit();
    console.log(`  ✓ Migrated products ${i + 1}–${Math.min(i + CHUNK, docs.length)}`);
  }

  // 3. Recalculate productsSupplied for canonical supplier
  const canonicalCount = (await db.collection('products').where('supplierId', '==', CANONICAL_ID).count().get()).data().count;
  await db.collection('wholesellers').doc(CANONICAL_ID).update({ productsSupplied: canonicalCount });
  console.log(`\n✓ Canonical supplier (${CANONICAL_ID}) → productsSupplied: ${canonicalCount}`);

  // 4. Delete the orphan legacy doc
  const legacyRef = db.collection('wholesellers').doc(LEGACY_ID);
  if ((await legacyRef.get()).exists) {
    await legacyRef.delete();
    console.log(`✓ Deleted orphan wholeseller doc '${LEGACY_ID}'`);
  } else {
    console.log(`ℹ  Orphan doc '${LEGACY_ID}' already gone.`);
  }

  // 5. Final verification
  const remaining = (await db.collection('products').where('supplierId', '==', LEGACY_ID).count().get()).data().count;
  console.log(`\n=== Final verification ===`);
  console.log(`Products still pointing to '${LEGACY_ID}': ${remaining}`);
  console.log(`Products now pointing to '${CANONICAL_ID}': ${canonicalCount}`);
  console.log(`\n✅ Migration complete.`);
}

run().catch(err => { console.error('❌ Migration failed:', err); process.exit(1); });

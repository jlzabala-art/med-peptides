/**
 * migrate_nplabs_embedded_variants.mjs
 * ────────────────────────────────────────────────────────────────────
 * GOLDEN RULE MIGRATION: NP Labs variants stored as embedded array in
 * root product doc → must move to products/{id}/variants subcollection.
 *
 * Usage:
 *   node scripts/migrate_nplabs_embedded_variants.mjs --dry-run
 *   node scripts/migrate_nplabs_embedded_variants.mjs
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const DRY_RUN = process.argv.includes('--dry-run');
const NPLABS_SUPPLIER_IDS = ['supplier-nplabs', 'nplabs', 'np-labs'];

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore(app);

function isNPLabsVariant(variant) {
  const sId = (variant.supplierId || variant.supplier_id || '').toLowerCase();
  const sName = (variant.supplierName || variant.supplier || '').toLowerCase();
  return (
    NPLABS_SUPPLIER_IDS.some(id => sId.includes(id)) ||
    sName.includes('np labs') || sName.includes('nplabs')
  );
}

async function getCanonicalNPLabsSupplierId() {
  const snap = await db.collection('suppliers').get();
  for (const doc of snap.docs) {
    const d = doc.data();
    const name = (d.name || d.supplierName || '').toLowerCase();
    if (name.includes('np labs') || name.includes('nplabs')) {
      console.log(`✅ Canonical NP Labs supplier: ${doc.id} — "${d.name}"`);
      return doc.id;
    }
  }
  console.warn('⚠️  Could not find canonical NP Labs supplier. Will use embedded supplierId.');
  return null;
}

async function run() {
  console.log(`\n${'='.repeat(65)}`);
  console.log(` NP LABS EMBEDDED VARIANTS MIGRATION ${DRY_RUN ? '[DRY RUN]' : '[LIVE]'}`);
  console.log(`${'='.repeat(65)}\n`);

  const canonicalSupplierId = await getCanonicalNPLabsSupplierId();
  const allProducts = await db.collection('products').get();
  console.log(`Scanning ${allProducts.size} products...\n`);

  const toMigrate = [];

  for (const doc of allProducts.docs) {
    const d = doc.data();
    const embeddedVariants = Array.isArray(d.variants) ? d.variants : [];
    const npLabsEmbedded = embeddedVariants.filter(isNPLabsVariant);
    if (npLabsEmbedded.length === 0) continue;

    const subSnap = await doc.ref.collection('variants').get();
    const existingSubIds = new Set(subSnap.docs.map(vd => vd.id));
    const existingSubData = subSnap.docs.map(vd => vd.data());
    const alreadyHasNPLabs = existingSubData.some(v =>
      NPLABS_SUPPLIER_IDS.some(id => (v.supplierId || '').toLowerCase().includes(id)) ||
      (v.supplierName || '').toLowerCase().includes('np labs')
    );

    toMigrate.push({
      productId: doc.id,
      name: d.canonicalName || d.name || doc.id,
      status: d.status,
      npLabsEmbedded,
      allEmbedded: embeddedVariants,
      existingSubIds,
      alreadyHasNPLabs,
      docRef: doc.ref,
      rootData: d,
    });
  }

  const needsMigration = toMigrate.filter(p => !p.alreadyHasNPLabs);
  const needsCleanup = toMigrate.filter(p => p.alreadyHasNPLabs);

  console.log(`📊 Products with NP Labs embedded variants: ${toMigrate.length}`);
  console.log(`   ❌ Need migration (not in subcollection): ${needsMigration.length}`);
  console.log(`   ⚠️  Have both embedded + subcollection (cleanup): ${needsCleanup.length}\n`);

  if (DRY_RUN) {
    console.log('[DRY RUN] Products to migrate:');
    for (const p of needsMigration) {
      const ev = p.npLabsEmbedded[0];
      console.log(`  📦 ${p.productId} — "${p.name}"`);
      console.log(`     Embedded variants: ${p.npLabsEmbedded.length} | price: ${ev?.unit_price} ${ev?.currency || 'EUR'}`);
      console.log(`     variantId in embedded: ${ev?.variantId || 'NONE'}`);
    }
    console.log(`\n[DRY RUN] Products needing cleanup only: ${needsCleanup.length}`);
    needsCleanup.forEach(p => console.log(`  ⚠️  ${p.productId} — "${p.name}"`));
    console.log('\nRun without --dry-run to apply.');
    process.exit(0);
  }

  // LIVE MIGRATION
  console.log(`🚀 Migrating ${needsMigration.length} products...\n`);
  let migrated = 0, errors = 0, cleaned = 0;

  for (const p of needsMigration) {
    try {
      const batch = db.batch();
      for (const ev of p.npLabsEmbedded) {
        const evSupplierId = canonicalSupplierId || ev.supplierId || ev.supplier_id || 'supplier-nplabs';
        const evSupplierName = ev.supplierName || ev.supplier || 'NP Labs';
        const variantDoc = {
          supplierId: evSupplierId,
          supplierName: evSupplierName,
          isActive: ev.isActive !== false,
          status: ev.status || 'active',
          migratedAt: new Date().toISOString(),
          migratedFrom: 'embedded_array_nplabs',
        };
        const skipKeys = new Set(['supplierId', 'supplier_id', 'supplier', 'supplierName', 'isActive', 'status']);
        for (const [k, v] of Object.entries(ev)) {
          if (!skipKeys.has(k) && v !== undefined) variantDoc[k] = v;
        }
        const safeProductId = p.productId.substring(0, 40);
        const variantId = ev.variantId || `${evSupplierId}_${safeProductId}`;
        if (!p.existingSubIds.has(variantId)) {
          batch.set(p.docRef.collection('variants').doc(variantId), variantDoc);
        }
      }

      const otherEmbedded = p.allEmbedded.filter(v => !isNPLabsVariant(v));
      const updatePayload = { updatedAt: new Date().toISOString(), _normalized: true };
      if (otherEmbedded.length === 0) {
        updatePayload.variants = FieldValue.delete();
      } else {
        updatePayload.variants = otherEmbedded;
      }
      const rootFields = ['supplierId', 'supplier_id', 'supplier', 'supplierName'];
      for (const f of rootFields) {
        if (p.rootData[f] !== undefined) updatePayload[f] = FieldValue.delete();
      }
      batch.update(p.docRef, updatePayload);
      await batch.commit();
      migrated++;
      if (migrated % 10 === 0) console.log(`  ✅ ${migrated}/${needsMigration.length} migrated...`);
    } catch (err) {
      errors++;
      console.error(`  ❌ Error on ${p.productId}: ${err.message}`);
    }
  }

  // CLEANUP: remove embedded array from products that already have subcollection
  if (needsCleanup.length > 0) {
    console.log(`\n🧹 Cleaning ${needsCleanup.length} duplicate embedded arrays...`);
    for (const p of needsCleanup) {
      try {
        const otherEmbedded = p.allEmbedded.filter(v => !isNPLabsVariant(v));
        const updatePayload = { updatedAt: new Date().toISOString(), _normalized: true };
        if (otherEmbedded.length === 0) {
          updatePayload.variants = FieldValue.delete();
        } else {
          updatePayload.variants = otherEmbedded;
        }
        const rootFields = ['supplierId', 'supplier_id', 'supplier', 'supplierName'];
        for (const f of rootFields) {
          if (p.rootData[f] !== undefined) updatePayload[f] = FieldValue.delete();
        }
        await p.docRef.update(updatePayload);
        cleaned++;
      } catch (err) {
        console.error(`  ❌ Cleanup error on ${p.productId}: ${err.message}`);
      }
    }
  }

  console.log(`\n${'='.repeat(65)}`);
  console.log(` DONE — migrated: ${migrated} | cleaned: ${cleaned} | errors: ${errors}`);
  console.log(`${'='.repeat(65)}`);
  console.log('\nNext: node scripts/enrich_supplier_calculations.mjs\n');
  process.exit(errors > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });

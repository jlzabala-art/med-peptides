import { adminDb } from '../lib/firebaseAdmin.js';
import {
  LARIMIDE_SUPPLIER_UPDATE,
  EXISTING_STERILIA_IDS,
  buildGroupedLarimide2026Docs,
  LARIMIDE_2026_STATS,
} from '../data/larimide2026CatalogData.js';

async function main() {
  if (!adminDb) {
    console.error('❌ adminDb not initialized. Check FIREBASE_SERVICE_ACCOUNT or .env.local');
    process.exit(1);
  }

  const now = new Date().toISOString();

  // 1. Verify existing Sterilia docs exist & are never touched
  const steriliaCheck = await Promise.all(
    EXISTING_STERILIA_IDS.map(async (id) => {
      const snap = await adminDb.collection('products').doc(id).get();
      return { id, exists: snap.exists };
    })
  );

  // 2. Update supplier-larimedical with V.260430 metadata (merge: true preserves any custom fields)
  await adminDb
    .collection('suppliers')
    .doc(LARIMIDE_SUPPLIER_UPDATE.id)
    .set(
      {
        ...LARIMIDE_SUPPLIER_UPDATE,
        skuCount2026: LARIMIDE_2026_STATS.totalSkus,
        updatedAt: now,
      },
      { merge: true }
    );

  // 3. Build grouped parent products (~96 docs, 145 variants) and batch-upsert safely
  const docs = buildGroupedLarimide2026Docs(now);
  const totalVariants = docs.reduce((sum, d) => sum + (d.variants?.length || 0), 0);

  const CHUNK_SIZE = 350;
  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const batch = adminDb.batch();
    const slice = docs.slice(i, i + CHUNK_SIZE);
    for (const productDoc of slice) {
      if (EXISTING_STERILIA_IDS.includes(productDoc.id)) {
        throw new Error(`Refusing to overwrite Sterilia product: ${productDoc.id}`);
      }
      const ref = adminDb.collection('products').doc(productDoc.id);
      batch.set(ref, productDoc, { merge: true });
    }
    await batch.commit();
  }

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        supplierUpdated: LARIMIDE_SUPPLIER_UPDATE.id,
        parentDocsWritten: docs.length,
        totalVariantsWritten: totalVariants,
        byBrand: LARIMIDE_2026_STATS.byBrand,
        existingSteriliaPreserved: steriliaCheck,
      },
      null,
      2
    )
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Larimide 2026 seed failed:', err);
  process.exit(1);
});

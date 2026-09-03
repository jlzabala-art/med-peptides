import { adminDb } from '../lib/firebaseAdmin.js';
import { enrichProductDocument } from '../services/clinicalEnrichmentEngine.js';

async function enrichAllCatalog() {
  console.log("=================================================================");
  console.log("   AUTOMATIC CLINICAL & MOLECULAR CATALOG ENRICHMENT PIPELINE    ");
  console.log("=================================================================");

  const productsSnap = await adminDb.collection('products').get();
  console.log(`📦 Found ${productsSnap.size} products to evaluate and enrich.`);

  let enrichedCount = 0;
  let batch = adminDb.batch();
  let batchOpCount = 0;

  for (const doc of productsSnap.docs) {
    const data = { id: doc.id, ...doc.data() };
    const enriched = await enrichProductDocument(data);

    batch.update(doc.ref, {
      ...enriched,
      updatedAt: new Date()
    });

    batchOpCount++;
    enrichedCount++;

    if (batchOpCount >= 300) {
      await batch.commit();
      console.log(`✓ Committed batch of ${batchOpCount} enriched products.`);
      batch = adminDb.batch();
      batchOpCount = 0;
    }
  }

  if (batchOpCount > 0) {
    await batch.commit();
    console.log(`✓ Committed final batch of ${batchOpCount} enriched products.`);
  }

  console.log(`\n🎉 Successfully enriched and saved all ${enrichedCount} products in Firestore with authoritative clinical & molecular identity!`);
}

enrichAllCatalog()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Enrichment failed:", err);
    process.exit(1);
  });

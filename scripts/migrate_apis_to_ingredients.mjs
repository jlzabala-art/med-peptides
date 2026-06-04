/**
 * scripts/migrate_apis_to_ingredients.mjs
 * Moves API Peptides and Research Supplies from local products to Firestore ingredients.
 */
import admin from "firebase-admin";
import { readFileSync, writeFileSync } from "fs";

try {
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  admin.initializeApp();
}

const db = admin.firestore();

async function run() {
  const productsRaw = readFileSync('src/data/products.js', 'utf-8');
  const startIdx = productsRaw.indexOf('export const products =');
  const jsonStart = productsRaw.indexOf('[', startIdx);
  const jsonEnd = productsRaw.lastIndexOf(']') + 1;
  const products = JSON.parse(productsRaw.substring(jsonStart, jsonEnd));

  const apiCategories = ["Other Research Peptides", "Research Supplies", "API"];
  const apiProducts = products.filter(p => 
    apiCategories.includes(p.category) || 
    (p.name && p.name.toUpperCase().includes('API'))
  );

  console.log(`Found ${apiProducts.length} APIs/Research Supplies to migrate.`);

  const batch = db.batch();
  const collectionRef = db.collection('ingredients');
  let count = 0;

  for (const prod of apiProducts) {
    const newDocRef = collectionRef.doc();
    const docData = {
      name: prod.name,
      normalizedName: prod.name.toLowerCase(),
      relativeCostScore: null,
      costTier: "Review",
      compoundingCostClass: "Manual review",
      provider: "NPLAB",
      needsReview: true,
      metadata: {
        source: "products_migration_v1",
        originalCategory: prod.category,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      // Preserve existing metadata
      cas: prod.cas || "N/A",
      description: prod.desc || "",
      dosage: prod.dosage || "",
      quantity: prod.quantity || "",
      scientificName: prod.scientificName || "",
      typeData: prod.typeData || {},
      aiContent: prod.aiContent || null
    };

    batch.set(newDocRef, docData);
    count++;
  }

  await batch.commit();
  console.log(`Successfully migrated ${count} products to ingredients collection.`);
}

run().then(() => process.exit(0)).catch(e => {
  console.error("Migration failed:", e);
  process.exit(1);
});

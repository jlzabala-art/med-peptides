#!/usr/bin/env node
/**
 * scripts/sync_firebase_to_v2.mjs
 *
 * Reverse synchronization utility. Pulls the latest canonical datasets
 * from Firestore and updates the local files:
 * - products collection (peptides) -> src/data/v2/products.v2.json
 * - supplements collection -> src/data/v2/supplements.v2.json
 * - protocols collection -> src/data/protocolBlueprintsV2.json
 *
 * Usage:
 *   node scripts/sync_firebase_to_v2.mjs
 */

import { db } from './lib/firebase-admin.mjs';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log("🔄 Pulling canonical datasets from Firestore...");

  // 1. Fetch products
  console.log("Fetching 'products' collection from Firestore...");
  const productsSnap = await db.collection("products").get();
  const allProducts = [];
  productsSnap.forEach(doc => {
    const data = doc.data();
    // Exclude syncedAt/docId if we want to keep it identical to manual schemas, or preserve them
    // Let's preserve all fields as Firestore is the source of truth
    allProducts.push({ id: doc.id, ...data });
  });

  // Filter products by productType
  const peptides = allProducts.filter(p => (p.productType || p.type) === 'peptide');
  // Supplements inside products collection
  const productsSupplements = allProducts.filter(p => (p.productType || p.type) === 'supplement');

  console.log(`- Loaded ${allProducts.length} documents from 'products' collection.`);
  console.log(`  - Peptides: ${peptides.length}`);
  console.log(`  - Supplements: ${productsSupplements.length}`);

  // 2. Fetch supplements
  console.log("Fetching 'supplements' collection from Firestore...");
  const supplementsSnap = await db.collection("supplements").get();
  const supplementsList = [];
  supplementsSnap.forEach(doc => {
    supplementsList.push({ id: doc.id, ...doc.data() });
  });
  console.log(`- Loaded ${supplementsList.length} documents from 'supplements' collection.`);

  // 3. Fetch protocols
  console.log("Fetching 'protocols' collection from Firestore...");
  const protocolsSnap = await db.collection("protocols").get();
  const protocolsList = [];
  protocolsSnap.forEach(doc => {
    protocolsList.push({ id: doc.id, ...doc.data() });
  });
  console.log(`- Loaded ${protocolsList.length} documents from 'protocols' collection.`);

  // 4. Save to local JSON files
  const productsPath = join(__dirname, '../src/data/v2/products.v2.json');
  const supplementsPath = join(__dirname, '../src/data/v2/supplements.v2.json');
  const protocolsPath = join(__dirname, '../src/data/protocolBlueprintsV2.json');
  const catalogPath = join(__dirname, '../src/data/v2/catalog.v2.json');

  console.log(`\nWriting local files...`);
  
  writeFileSync(productsPath, JSON.stringify(peptides, null, 2), 'utf-8');
  console.log(`✅ Updated ${productsPath}`);

  writeFileSync(supplementsPath, JSON.stringify(supplementsList, null, 2), 'utf-8');
  console.log(`✅ Updated ${supplementsPath}`);

  // Combine catalog: peptides + supplements list sorted by category, then name
  const catalogAll = [...peptides, ...supplementsList].sort((a, b) => {
    const catA = (a.category || '').toLowerCase();
    const catB = (b.category || '').toLowerCase();
    if (catA !== catB) return catA.localeCompare(catB);
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  writeFileSync(catalogPath, JSON.stringify(catalogAll, null, 2), 'utf-8');
  console.log(`✅ Updated ${catalogPath}`);

  writeFileSync(protocolsPath, JSON.stringify(protocolsList, null, 2), 'utf-8');
  console.log(`✅ Updated ${protocolsPath}`);

  console.log("\n🔄 Reverse synchronization complete. Local catalog files updated successfully from Firestore.");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Fatal error during sync:", err);
  process.exit(1);
});

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// Parse service account
const serviceAccountPath = join(process.cwd(), 'serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (e) {
  // If no serviceAccountKey, we can't run this script securely or easily outside the emulator
  console.log("No serviceAccountKey.json found, checking if we can use default credentials or emulator...");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/-/g, ' ')
    .replace(/10|5mg|vial|mg/g, '') // remove common suffixes
    .replace(/\s+/g, ' ')
    .trim();
}

async function findDuplicates() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  
  const products = [];
  snapshot.forEach(doc => {
    products.push({ id: doc.id, ...doc.data() });
  });

  const grouped = {};
  for (const p of products) {
    const norm = normalizeName(p.name);
    if (!grouped[norm]) grouped[norm] = [];
    grouped[norm].push(p);
  }

  console.log(`Found ${products.length} products. Checking for similarities...`);
  
  let found = false;
  for (const [norm, group] of Object.entries(grouped)) {
    if (group.length > 1) {
      found = true;
      console.log(`\nPotential Match Group for normalized name: "${norm}"`);
      group.forEach(p => {
        console.log(`  - ID: ${p.id} | Name: ${p.name} | Type: ${p.productType || 'Unknown'} | Variants: ${(p.variants || []).length}`);
      });
    }
  }
  
  if (!found) {
    console.log("No duplicates found based on normalized names.");
  }
}

findDuplicates().catch(console.error);

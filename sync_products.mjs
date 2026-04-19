/**
 * Firestore Sync Script: Products Enriched Semantic Data
 * 
 * Usage:
 *   cd /Users/joseluiszabala/Documents/Antigravity/regenpept-web
 *   node /tmp/sync_products_to_firestore.mjs
 * 
 * This script reads products from src/data/products.js and writes each to
 * the 'products' collection in Firestore, using the product name as doc ID.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// ── Firebase Config ──────────────────────────────────────────────────────────
// ⚠️ CANONICAL PROJECT: med-peptides-app — NEVER change to regenpept-web-app
const firebaseConfig = {
  apiKey: "AIzaSyDOV2zFeLGtPsE_O2b-gR3NHZygPspiSws",
  authDomain: "med-peptides-app-27a3a.firebaseapp.com",
  projectId: "med-peptides-app",
  storageBucket: "med-peptides-app.firebasestorage.app",
  messagingSenderId: "514143707883",
  appId: "1:514143707883:web:6c12470433ef6c992714ae"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Load products array from the source file ─────────────────────────────────
// We use a dynamic workaround since the file uses `export const products`
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const productsFilePath = '/Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/data/products.js';
const rawSource = readFileSync(productsFilePath, 'utf-8');

// Strip ES module export keywords for eval
const evalSource = rawSource
  .replace(/export const productCategories[\s\S]*?];/, '')
  .replace(/export const products = /, 'const products = ')
  .replace(/export default/, '// export default');

// Use Function constructor to safely evaluate
let products = [];
try {
  const fn = new Function(`${evalSource}; return products;`);
  products = fn();
  console.log(`✅ Loaded ${products.length} products from products.js`);
} catch (err) {
  console.error('❌ Failed to parse products.js:', err.message);
  process.exit(1);
}

// ── Sanitize: remove undefined fields and make docId-safe ───────────────────
const sanitize = (obj) => {
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) clean[k] = v;
  }
  return clean;
};

const makeDocId = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

// ── Sync loop ────────────────────────────────────────────────────────────────
let success = 0;
let failures = 0;

for (const product of products) {
  const docId = makeDocId(product.name);
  const docRef = doc(collection(db, 'products'), docId);

  const payload = sanitize({
    ...product,
    syncedAt: new Date().toISOString(),
    docId
  });

  try {
    await setDoc(docRef, payload, { merge: true });
    console.log(`  ✅ Synced: ${product.name} → products/${docId}`);
    success++;
  } catch (err) {
    console.error(`  ❌ Failed: ${product.name} — ${err.message}`);
    failures++;
  }
}

console.log(`\n── Sync Complete ──────────────────────────────────────`);
console.log(`  Total products: ${products.length}`);
console.log(`  ✅ Synced:  ${success}`);
console.log(`  ❌ Failed:  ${failures}`);
process.exit(failures > 0 ? 1 : 0);

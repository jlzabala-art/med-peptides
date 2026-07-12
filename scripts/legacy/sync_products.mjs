/**
 * Firestore Sync Script: Products Enriched Semantic Data
 * 
 * Usage:
 *   cd /Users/joseluiszabala/Documents/Antigravity/Med-Peptides-web
 *   node /tmp/sync_products_to_firestore.mjs
 * 
 * This script reads products from src/data/products.js and writes each to
 * the 'products' collection in Firestore, using the product name as doc ID.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { db } from './scripts/lib/firebase-admin.mjs';

// ── Load products array from the source file ─────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadSource = (path, varName) => {
  const raw = readFileSync(path, 'utf-8');
  const evalSource = raw
    .replace(/export const productCategories[\s\S]*?];/, '')
    .replace(new RegExp(`export const ${varName} = `), `const ${varName} = `)
    .replace(/export default/, '// export default');
  
  try {
    const fn = new Function(`${evalSource}; return ${varName};`);
    return fn();
  } catch (err) {
    console.error(`❌ Failed to parse ${path}:`, err.message);
    return [];
  }
};

const peptideProducts = loadSource(join(__dirname, 'src/data/products.js'), 'products');
const supplementProducts = loadSource(join(__dirname, 'src/data/supplements.js'), 'supplements');

const products = [...peptideProducts, ...supplementProducts];
console.log(`✅ Loaded ${peptideProducts.length} peptides and ${supplementProducts.length} supplements. Total: ${products.length}`);

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
  const docRef = db.collection('products').doc(docId);

  const payload = sanitize({
    ...product,
    syncedAt: new Date().toISOString(),
    docId
  });

  try {
    await docRef.set(payload, { merge: true });
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

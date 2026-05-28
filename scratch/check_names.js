import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const productsPath = join(__dirname, '../src/data/products.js');
const raw = readFileSync(productsPath, 'utf-8');

// Extract JSON array for products
const productsStartMarker = 'export const products =';
const startIdx = raw.indexOf(productsStartMarker);
if (startIdx === -1) {
  throw new Error("Could not find 'export const products =' in products.js");
}
const jsonStart = raw.indexOf('[', startIdx);
const jsonEnd = raw.lastIndexOf(']') + 1;
const products = JSON.parse(raw.substring(jsonStart, jsonEnd));

const clinicalDataPath = join(__dirname, '../src/data/v2/clinicalData.json');
const clinicalData = JSON.parse(readFileSync(clinicalDataPath, 'utf-8'));

// Normalize helper
const normalize = (name) => name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

const clinicalKeys = Object.keys(clinicalData).map(k => ({ original: k, normalized: normalize(k) }));

console.log("=== Matching Products ===");
let matched = 0;
let unmatched = [];

products.forEach(p => {
  const productType = p.productType || p.type || 'peptide';
  if (productType !== 'peptide') return;

  const normalizedProd = normalize(p.name);
  
  // Prioritize exact match
  let found = clinicalKeys.find(ck => ck.normalized === normalizedProd);
  if (!found) {
    // Then startsWith / prefix match
    found = clinicalKeys.find(ck => normalizedProd.startsWith(ck.normalized) || ck.normalized.startsWith(normalizedProd));
  }
  if (!found) {
    // Finally general includes
    found = clinicalKeys.find(ck => normalizedProd.includes(ck.normalized) || ck.normalized.includes(normalizedProd));
  }

  if (found) {
    console.log(`✅ MATCH: "${p.name}" matches "${found.original}"`);
    matched++;
  } else {
    console.log(`❌ NO MATCH: "${p.name}"`);
    unmatched.push(p.name);
  }
});

console.log(`\nMatched: ${matched}, Unmatched: ${unmatched.length}`);
console.log("Unmatched list:", unmatched);

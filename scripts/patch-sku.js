/**
 * patch-sku.js
 * Generates and patches SKU + route fields for all products in src/data/products.js
 *
 * SKU format: [PARENT_SLUG]-[DOSE_CODE]-[ROUTE_CODE]
 * Example:    BPC157-5MG-VL
 *
 * Route codes:
 *   VL   = Injectable (vial / subcutaneous / IM)
 *   TAB  = Oral tablet / capsule
 *   SPR  = Nasal spray
 *   CRM  = Cream / topical
 *   SYR  = Supplies / syringes
 *   OTH  = Other / unknown
 *
 * Run: node scripts/patch-sku.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsPath = path.resolve(__dirname, '../src/data/products.js');

// ── helpers ─────────────────────────────────────────────────────────────────

/**
 * Build the parent slug from the product name.
 * "BPC-157" → "BPC157"   "GHK-Cu" → "GHKCU"   "5-Amino 1MQ" → "5AMINO1MQ"
 */
function buildParentSlug(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // strip hyphens, spaces, dots
    .slice(0, 12);              // max 12 chars
}

/**
 * Derive a short dosage code from strength or dosage field.
 * "5 mg" → "5MG"   "10/10/75 mg" → "10-10-75MG"   "50 mg/tablet" → "50MG"
 * "2000iu/vial" → "2000IU"   "Box of 100" → "100X"
 */
function buildDoseCode(strength, dosage) {
  const raw = (strength || dosage || 'UNK').trim();
  // Remove trailing /vial, /tablet, /bottle etc.
  const cleaned = raw
    .replace(/\/(vial|tablet|bottle|box|kit|cap)/gi, '')
    .trim();
  // Normalise slashes between doses (combo products)
  const normalised = cleaned
    .replace(/\s*\/\s*/g, '-')
    .replace(/\s+/g, '')
    .toUpperCase();
  return normalised.slice(0, 14);
}

/** Map quantity + dosage strings to a route code. */
function inferRoute(quantity, dosage, tags) {
  const q = (quantity || '').toLowerCase();
  const d = (dosage || '').toLowerCase();
  const t = (tags || []).join(' ').toLowerCase();

  if (/tab|caps|bottle/.test(q) || /tablet|capsule/.test(d) || /tablet/i.test(t)) return 'TAB';
  if (/spray/.test(q) || /spray/.test(d) || /spray/i.test(t)) return 'SPR';
  if (/cream|gel|topical/.test(q) || /cream|gel/.test(d)) return 'CRM';
  // Vial check BEFORE syringe/supply — don't let a generic 'Supplies' tag override
  if (/vial/.test(q)) return 'VL';
  // Only flag as research supply if it's explicitly syringes / needles / a box of consumables
  if (/syringe|needle/.test(q) || /syringe|needle/.test(t)) return 'SYR';
  if (/box of/.test(d)) return 'SYR';
  return 'OTH';
}

/** Human-readable route label for the new `route` field. */
const ROUTE_LABELS = {
  VL:  'Injectable (Vial)',
  TAB: 'Oral (Tablet/Capsule)',
  SPR: 'Nasal Spray',
  CRM: 'Topical (Cream/Gel)',
  SYR: 'Research Supply',
  OTH: 'Other',
};

// ── load & patch ─────────────────────────────────────────────────────────────

let src = readFileSync(productsPath, 'utf8');

// Extract the JS array as JSON-parseable text (crude but effective for this file)
// The file starts with "export const productCategories = [...];\nexport const products = [...];"
// We'll eval-parse using a temporary wrapper.
const { createRequire } = await import('module');
const tmpPath = productsPath.replace('products.js', '_products_tmp.mjs');
const tmpSrc = src
  .replace('export const productCategories', 'const productCategories')
  .replace('export const products', 'export const products');
writeFileSync(tmpPath, tmpSrc, 'utf8');

const { products } = await import(tmpPath);

const skuCounts = {}; // track duplicate slugs → append counter

const patched = products.map((product) => {
  const parentSlug = buildParentSlug(product.name || '');
  const doseCode   = buildDoseCode(product.strength, product.dosage);
  const routeCode  = inferRoute(product.quantity, product.dosage, product.tags);

  // Deduplicate: if the same base SKU appears twice, append -2, -3 …
  const baseKey = `${parentSlug}-${doseCode}-${routeCode}`;
  skuCounts[baseKey] = (skuCounts[baseKey] || 0) + 1;
  const sku = skuCounts[baseKey] > 1
    ? `${baseKey}-${skuCounts[baseKey]}`
    : baseKey;

  return {
    ...product,
    sku,
    route: ROUTE_LABELS[routeCode],
  };
});

// ── serialise back to JS ──────────────────────────────────────────────────────

// Rebuild file preserving categories export
const categoriesMatch = src.match(/export const productCategories[\s\S]*?;\n/);
const categoriesBlock = categoriesMatch ? categoriesMatch[0] : '';

const output =
  categoriesBlock +
  '\nexport const products = ' +
  JSON.stringify(patched, null, 2) +
  ';\n';

writeFileSync(productsPath, output, 'utf8');

// Cleanup tmp
import { unlinkSync } from 'fs';
unlinkSync(tmpPath);

// ── report ───────────────────────────────────────────────────────────────────
console.log(`✅  Patched ${patched.length} products with SKU + route fields.`);
console.log('\nSample SKUs:');
patched.slice(0, 10).forEach(p => console.log(`  ${p.name.padEnd(30)} → ${p.sku}  [${p.route}]`));
const dupes = Object.entries(skuCounts).filter(([,v]) => v > 1);
if (dupes.length) {
  console.warn('\n⚠️  Duplicate base SKUs resolved with counter suffix:');
  dupes.forEach(([k, v]) => console.warn(`  ${k} (×${v})`));
}

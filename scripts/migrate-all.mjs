/**
 * migrate-all.mjs — Phase 3
 * ─────────────────────────────────────────────────────────────────────────────
 * Full migration pipeline: legacy products.js + supplements.js → v2 JSON.
 *
 * What this script does:
 *   1. Load all legacy records from src/data/products.js (peptides)
 *      and src/data/supplements.js (supplements).
 *   2. Normalize each record using normalizePeptide() / normalizeSupplement().
 *   3. GROUP records that share the same product name into a single canonical
 *      product, merging their variants into one array.
 *   4. Run validateProduct() on every merged product; collect warnings.
 *   5. Write two output files:
 *        dist/data/products.v2.json      — peptides
 *        dist/data/supplements.v2.json   — supplements
 *      plus a combined catalog:
 *        dist/data/catalog.v2.json       — all products (peptides + supplements)
 *   6. Print a migration report to stdout (exit 0 if clean, 1 if errors).
 *
 * Run:
 *   node scripts/migrate-all.mjs
 *   node scripts/migrate-all.mjs --dry-run   (validate only, no files written)
 *
 * Output directory: dist/data/  (created automatically)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname }                 from 'path';
import { fileURLToPath }                    from 'url';

import { products }    from '../src/data/products.js';
import { supplements } from '../src/data/supplements.js';

import {
  normalizePeptide,
  normalizeSupplement,
} from '../src/schemas/productNormalizer.js';

import {
  validateProduct,
  PRODUCT_TYPE,
} from '../src/schemas/productSchema.js';

import { enrichProduct } from '../src/schemas/productEnricher.js';

// ── CLI flags ─────────────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes('--dry-run');

// ── ANSI ──────────────────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  dim:    '\x1b[2m',
  blue:   '\x1b[34m',
};
const ok   = `${C.green}✔${C.reset}`;
const fail = `${C.red}✘${C.reset}`;
const warn = `${C.yellow}⚠${C.reset}`;
const info = `${C.cyan}ℹ${C.reset}`;

// ── Paths ─────────────────────────────────────────────────────────────────────
const __dirname  = dirname(fileURLToPath(import.meta.url));
const ROOT       = resolve(__dirname, '..');
const DIST       = resolve(ROOT, 'dist', 'data');

// ── Enrichment Data ───────────────────────────────────────────────────────────
const clinicalData = JSON.parse(readFileSync(resolve(ROOT, 'src/data/v2/clinicalData.json'), 'utf-8'));
const researchData = JSON.parse(readFileSync(resolve(ROOT, 'src/data/v2/researchData.json'), 'utf-8'));
const safetyData   = JSON.parse(readFileSync(resolve(ROOT, 'src/data/v2/safetyData.json'), 'utf-8'));

// Prepare sources map
const enrichmentSources = {};
const allNames = new Set([
  ...Object.keys(clinicalData),
  ...Object.keys(researchData),
  ...Object.keys(safetyData)
]);

for (const name of allNames) {
  enrichmentSources[name] = {
    clinical: clinicalData[name],
    research: researchData[name],
    safety:   safetyData[name]
  };
}

// ── Step 1: Normalize all records ─────────────────────────────────────────────

/**
 * Normalize a batch of legacy records with the given normalizer function.
 * Returns { normalized: Object[], errors: string[] }
 */
function normalizeBatch(records, normalizeFn, label) {
  const normalized = [];
  const errors     = [];

  for (const [i, record] of records.entries()) {
    const name = record.name || `[unnamed #${i}]`;
    try {
      const canonical = normalizeFn(record);
      normalized.push(canonical);
    } catch (err) {
      errors.push(`[${label}] "${name}" (index ${i}): ${err.message}`);
    }
  }

  return { normalized, errors };
}

// ── Step 2: Group by name and merge variants ───────────────────────────────────

/**
 * Given an array of canonical products (some sharing the same name),
 * merge those with identical names into a single product with combined variants.
 *
 * Merge strategy:
 *  - Keep the first record's root fields (id, slug, science, aiContent, etc.)
 *  - Append variants from subsequent records
 *  - Deduplicate variants by variant.id
 *  - Re-sort variants by sortOrder, then by strength.dosageMg ascending
 *
 * @param {Object[]} canonicals
 * @returns {Object[]} merged products
 */
function groupByName(canonicals) {
  const byName = new Map();

  for (const product of canonicals) {
    const key = product.name.trim().toLowerCase();

    if (!byName.has(key)) {
      // Clone so we don't mutate the original
      byName.set(key, { ...product, variants: [...product.variants] });
    } else {
      const existing = byName.get(key);
      // Merge new variants (skip duplicates by id)
      const existingIds = new Set(existing.variants.map(v => v.id));
      for (const v of product.variants) {
        if (!existingIds.has(v.id)) {
          existing.variants.push(v);
          existingIds.add(v.id);
        }
      }
    }
  }

  // Post-merge: sort variants and assign sortOrder
  const merged = [];
  for (const product of byName.values()) {
    product.variants.sort((a, b) => {
      const ma = a.strength?.dosageMg ?? 0;
      const mb = b.strength?.dosageMg ?? 0;
      return ma - mb;
    });
    // Re-index sortOrder
    product.variants.forEach((v, i) => { v.sortOrder = i + 1; });
    // First variant is default
    if (product.variants.length > 0) {
      product.variants.forEach(v => { v.isDefault = false; });
      product.variants[0].isDefault = true;
    }
    merged.push(product);
  }

  return merged;
}

/**
 * Enriches a batch of products using the global enrichmentSources.
 */
function enrichBatch(products, label) {
  let count = 0;
  for (const p of products) {
    const enriched = enrichProduct(p, enrichmentSources);
    if (enriched) count++;
  }
  return count;
}

// ── Step 3: Validate ──────────────────────────────────────────────────────────

/**
 * Run validateProduct() on each product.
 * Returns { clean: Object[], warnings: string[] }
 */
function validateBatch(products, label) {
  const clean    = [];
  const warnings = [];

  for (const p of products) {
    const { valid, errors } = validateProduct(p);
    if (valid) {
      clean.push(p);
    } else {
      // Non-blocking: include the product but record warnings
      clean.push(p);
      for (const e of errors) {
        warnings.push(`[${label}] "${p.name}" (${p.id}): ${e}`);
      }
    }
  }

  return { clean, warnings };
}

// ── Step 4: Write output ──────────────────────────────────────────────────────

function writeJson(filePath, data) {
  if (DRY_RUN) {
    console.log(`  ${info} ${C.dim}[dry-run] would write → ${filePath}${C.reset}`);
    return;
  }
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  const kb = (Buffer.byteLength(JSON.stringify(data), 'utf-8') / 1024).toFixed(1);
  console.log(`  ${ok} wrote ${C.green}${filePath.replace(ROOT + '/', '')}${C.reset} (${kb} KB, ${data.length} products)`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log(`\n${C.bold}${C.cyan}╔══════════════════════════════════════════════════════╗`);
console.log(`║      Data Model Migration v2 — Phase 3               ║`);
if (DRY_RUN) {
console.log(`║      ${C.yellow}DRY RUN — no files will be written${C.cyan}               ║`);
}
console.log(`╚══════════════════════════════════════════════════════╝${C.reset}\n`);

const allErrors   = [];
const allWarnings = [];

// ─── PEPTIDES ───────────────────────────────────────────────────────────────
console.log(`${C.bold}${C.blue}▶ Peptides${C.reset} (${products.length} legacy records)`);

const { normalized: peptideNorm, errors: peptideNormErrors } =
  normalizeBatch(products, normalizePeptide, 'peptide');

allErrors.push(...peptideNormErrors);
console.log(`  ${peptideNormErrors.length === 0 ? ok : fail} normalization: ${peptideNorm.length} succeeded, ${peptideNormErrors.length} failed`);

const peptidesMerged = groupByName(peptideNorm);
console.log(`  ${ok} grouping:       ${peptideNorm.length} records → ${peptidesMerged.length} products`);

const peptidesEnrichedCount = enrichBatch(peptidesMerged, 'peptide');
console.log(`  ${ok} enrichment:     ${peptidesEnrichedCount} products enriched`);

const { clean: peptidesClean, warnings: peptideWarnings } =
  validateBatch(peptidesMerged, 'peptide');
allWarnings.push(...peptideWarnings);
console.log(`  ${peptideWarnings.length === 0 ? ok : warn} validation:     ${peptidesClean.length} products (${peptideWarnings.length} warnings)`);

// ─── SUPPLEMENTS ────────────────────────────────────────────────────────────
console.log(`\n${C.bold}${C.blue}▶ Supplements${C.reset} (${supplements.length} legacy records)`);

const { normalized: suppNorm, errors: suppNormErrors } =
  normalizeBatch(supplements, normalizeSupplement, 'supplement');

allErrors.push(...suppNormErrors);
console.log(`  ${suppNormErrors.length === 0 ? ok : fail} normalization: ${suppNorm.length} succeeded, ${suppNormErrors.length} failed`);

const suppMerged = groupByName(suppNorm);
console.log(`  ${ok} grouping:       ${suppNorm.length} records → ${suppMerged.length} products`);

const suppEnrichedCount = enrichBatch(suppMerged, 'supplement');
console.log(`  ${ok} enrichment:     ${suppEnrichedCount} products enriched`);

const { clean: suppClean, warnings: suppWarnings } =
  validateBatch(suppMerged, 'supplement');
allWarnings.push(...suppWarnings);
console.log(`  ${suppWarnings.length === 0 ? ok : warn} validation:     ${suppClean.length} products (${suppWarnings.length} warnings)`);

// ─── CATALOG ────────────────────────────────────────────────────────────────
const catalogAll = [...peptidesClean, ...suppClean];
console.log(`\n${C.bold}${C.blue}▶ Combined catalog${C.reset}: ${catalogAll.length} total products`);

// ─── WRITE ──────────────────────────────────────────────────────────────────
console.log(`\n${C.bold}${C.blue}▶ Writing output files${DRY_RUN ? ' (dry-run)' : ''}${C.reset}`);

writeJson(resolve(DIST, 'products.v2.json'),     peptidesClean);
writeJson(resolve(DIST, 'supplements.v2.json'),  suppClean);
writeJson(resolve(DIST, 'catalog.v2.json'),      catalogAll);

// ─── REPORT ─────────────────────────────────────────────────────────────────
console.log(`\n${C.bold}━━━ Migration Report ━━━${C.reset}`);

if (allErrors.length > 0) {
  console.log(`\n${C.red}${C.bold}Errors (${allErrors.length}):${C.reset}`);
  allErrors.forEach(e => console.log(`  ${fail} ${C.red}${e}${C.reset}`));
}

if (allWarnings.length > 0) {
  console.log(`\n${C.yellow}Warnings (${allWarnings.length}):${C.reset}`);
  allWarnings.forEach(w => console.log(`  ${warn} ${C.yellow}${w}${C.reset}`));
}

// Summary table
console.log(`
┌─────────────────────┬────────────┬─────────────┬───────────┐
│ Type                │ Legacy in  │ Products out│ Warnings  │
├─────────────────────┼────────────┼─────────────┼───────────┤
│ Peptides            │ ${String(products.length).padEnd(10)} │ ${String(peptidesClean.length).padEnd(11)} │ ${String(peptideWarnings.length).padEnd(9)} │
│ Supplements         │ ${String(supplements.length).padEnd(10)} │ ${String(suppClean.length).padEnd(11)} │ ${String(suppWarnings.length).padEnd(9)} │
│ TOTAL               │ ${String(products.length + supplements.length).padEnd(10)} │ ${String(catalogAll.length).padEnd(11)} │ ${String(allWarnings.length).padEnd(9)} │
└─────────────────────┴────────────┴─────────────┴───────────┘`);

if (allErrors.length === 0 && allWarnings.length === 0) {
  console.log(`\n  ${ok} ${C.green}${C.bold}Migration complete — no errors, no warnings.${C.reset}\n`);
  process.exit(0);
} else if (allErrors.length === 0) {
  console.log(`\n  ${warn} ${C.yellow}Migration complete with ${allWarnings.length} warning(s). Review above.${C.reset}\n`);
  process.exit(0);   // warnings are non-blocking
} else {
  console.log(`\n  ${fail} ${C.red}Migration failed with ${allErrors.length} error(s). Fix and re-run.${C.reset}\n`);
  process.exit(1);
}

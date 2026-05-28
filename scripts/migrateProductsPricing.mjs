/**
 * migrateProductsPricing.mjs
 *
 * Phase 3 — Products (Peptides) Pricing Migration
 *
 * Transforms flat legacy pricing in src/data/products.js:
 *   priceUSD   → variants[0].pricing.retail.perUnit  (USD, billingUnit: 'vial')
 *   kitPriceUSD → variants[0].pricing.retail.kit      (USD, billingUnit: 'kit')
 *   dosage     → variants[0].attributes.dosageMg / label
 *   quantity   → variants[0].attributes.unitsPerPack (parsed from "10 vial/kit")
 *
 * Output schema per product:
 * {
 *   ...existing fields,
 *   productType: 'peptide',
 *   slug: <slugified name>,
 *   variants: [
 *     {
 *       variantId: '<slug>-sc-default',
 *       label: '5mg/vial – SC',
 *       attributes: { dosageMg: 5, administration: 'SC', format: 'lyophilized', unitsPerPack: 10 },
 *       pricing: {
 *         retail: {
 *           perUnit: 40, kit: 250, currency: 'USD',
 *           billingUnit: 'vial', kitBillingUnit: 'kit'
 *         }
 *       }
 *     }
 *   ]
 * }
 *
 * Legacy fields priceUSD / kitPriceUSD are PRESERVED (not deleted) in this phase
 * so any consumer that hasn't been updated yet won't break.
 * They will be removed in Phase 8 (Cleanup).
 *
 * Idempotent: products that already have a `variants` array are skipped.
 */

import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC       = path.resolve(__dirname, '../src/data/products.js');

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse dosage string like "5mg/vial" or "2mg/vial" → 5 or 2.
 * Returns null if unparseable.
 */
function parseDosageMg(dosageStr) {
  if (!dosageStr) return null;
  const m = dosageStr.match(/^(\d+(?:\.\d+)?)\s*mg/i);
  return m ? parseFloat(m[1]) : null;
}

/**
 * Parse quantity string like "10 vial/kit" → 10.
 * Returns null if unparseable.
 */
function parseUnitsPerPack(quantityStr) {
  if (!quantityStr) return null;
  const m = quantityStr.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Determine billingUnit from dosage or quantity string.
 * Defaults to 'vial' for peptides.
 */
function inferBillingUnit(dosageStr) {
  if (!dosageStr) return 'vial';
  const lower = dosageStr.toLowerCase();
  if (lower.includes('cap') || lower.includes('tab')) return 'capsule';
  if (lower.includes('ml')) return 'vial';
  return 'vial';
}

// ── Main ──────────────────────────────────────────────────────────────────────

const raw = readFileSync(SRC, 'utf-8');

// Dynamically import the module
const { products, productCategories } = await import(SRC);

let migrated = 0;
let skipped  = 0;

const updated = products.map((p) => {
  // Already has variants — skip (idempotent)
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    skipped++;
    return p;
  }

  const slug        = slugify(p.name ?? p.id ?? 'product');
  const dosageMg    = parseDosageMg(p.dosage);
  const unitsPerPack = parseUnitsPerPack(p.quantity);
  const billingUnit = inferBillingUnit(p.dosage);

  const variantLabel = [p.dosage, 'SC'].filter(Boolean).join(' – ');

  const variant = {
    variantId: `${slug}-sc-default`,
    label:     variantLabel,
    attributes: {
      ...(dosageMg    !== null ? { dosageMg }    : {}),
      ...(unitsPerPack !== null ? { unitsPerPack } : {}),
      administration: 'SC',
      format:         'lyophilized',
    },
    pricing: {
      retail: {
        perUnit:        p.priceUSD    ?? null,
        kit:            p.kitPriceUSD ?? null,
        currency:       'USD',
        billingUnit:    billingUnit,
        kitBillingUnit: 'kit',
      },
    },
  };

  migrated++;
  return {
    ...p,
    productType: 'peptide',
    slug,
    variants: [variant],
  };
});

// ── Serialize ─────────────────────────────────────────────────────────────────

const output = `export const productCategories = ${JSON.stringify(productCategories, null, 2)};

export const products = ${JSON.stringify(updated, null, 2)};
`;

writeFileSync(SRC, output, 'utf-8');

console.log(`\n✅ Products migration complete`);
console.log(`   Migrated : ${migrated}`);
console.log(`   Skipped  : ${skipped} (already have variants)`);
console.log(`   Total    : ${migrated + skipped}`);
console.log(`\nℹ️  Legacy priceUSD/kitPriceUSD fields PRESERVED for backward compatibility.`);
console.log(`   Remove them in Phase 8 (Cleanup) once all consumers are updated.`);

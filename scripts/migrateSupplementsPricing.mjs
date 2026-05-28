/**
 * migrateSupplementsPricing.mjs
 *
 * Transforms all legacy flat-field pricing (priceUSD / kitPriceUSD) in
 * src/data/supplements.js to the canonical v2 pricing engine schema:
 *
 *   pricing: {
 *     retail: {
 *       perUnit: <number>,
 *       currency: "USD"
 *     }
 *   }
 *
 * For supplements, priceUSD === kitPriceUSD (there is no "kit" concept), so
 * we map both to perUnit and drop the legacy fields.
 *
 * Usage:  node scripts/migrateSupplementsPricing.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, "../src/data/supplements.js");

// ── 1. Read raw source ──────────────────────────────────────────────────────
const raw = readFileSync(SRC, "utf-8");

// ── 2. Extract the array literal from the ES module ─────────────────────────
const arrayMatch = raw.match(/export\s+const\s+supplements\s*=\s*(\[[\s\S]*\]);\s*$/);
if (!arrayMatch) {
  console.error("❌  Could not locate `export const supplements = [...]` in the file.");
  process.exit(1);
}

let supplements;
try {
   
  supplements = new Function(`"use strict"; return ${arrayMatch[1]}`)();
} catch (err) {
  console.error("❌  Failed to parse the supplements array:", err.message);
  process.exit(1);
}

// ── 3. Transform each entry ─────────────────────────────────────────────────
let migrated = 0;
let alreadyMigrated = 0;

const transformed = supplements.map((item) => {
  if (item.pricing?.retail?.perUnit !== undefined) {
    alreadyMigrated++;
    return item;
  }

  const { priceUSD, kitPriceUSD, ...rest } = item;
  const perUnit = priceUSD ?? kitPriceUSD;

  if (perUnit === undefined) {
    console.warn(`⚠️  No price for "${item.name}" (${item.dosage})`);
    return rest;
  }

  migrated++;
  return {
    ...rest,
    pricing: {
      retail: {
        perUnit,
        currency: "USD",
      },
    },
  };
});

console.log(`✅  Migrated : ${migrated}`);
console.log(`⏭️  Already v2: ${alreadyMigrated}`);
console.log(`📦  Total    : ${transformed.length}`);

// ── 4. Serialize using JSON.stringify (reliable, pretty) ───────────────────
const json = JSON.stringify(transformed, null, 2);

// Convert JSON keys (double-quoted) to JS object keys (unquoted for simple identifiers)
// but keep double quotes for safety — valid JS, clean to read.
const output =
  `/**\n` +
  ` * supplements.js\n` +
  ` * Generated from NP_LABS_Supplements.pdf\n` +
  ` * Conversion Rate: 1 EUR = 1.08 USD\n` +
  ` * Pricing migrated to v2 schema (pricing.retail.perUnit)\n` +
  ` */\n\n` +
  `export const supplements = ${json};\n`;

writeFileSync(SRC, output, "utf-8");
console.log(`\n💾  Written back to: ${SRC}`);

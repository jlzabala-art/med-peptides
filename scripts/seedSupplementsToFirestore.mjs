#!/usr/bin/env node
/**
 * seedSupplementsToFirestore.mjs  —  Fase 0
 *
 * Migrates src/data/supplements.js  →  Firestore `supplements/` collection.
 *
 * Schema:
 *   supplements/{supplementSlug}          ← one doc per unique supplement name
 *     variants/{variantSlug}              ← one doc per SKU (dosage × quantity)
 *
 * ─ Idempotent: merge:true — safe to re-run after edits.
 * ─ supplements.js becomes the *editorial source*; Firestore is the source of truth.
 * ─ Goals are preserved as-is (will be enriched in Phase 3).
 *
 * Usage:
 *   node scripts/seedSupplementsToFirestore.mjs             # real write
 *   node scripts/seedSupplementsToFirestore.mjs --dry-run   # preview only
 *
 * Auth: serviceAccountKey.json in project root (same as all other scripts).
 */

import { db } from './lib/firebase-admin.mjs';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN   = process.argv.includes('--dry-run');

// ── Load supplements.js ───────────────────────────────────────────────────────
const filePath  = resolve(__dirname, '../src/data/supplements.js');
const rawSource = readFileSync(filePath, 'utf-8');

// Strip ES module export so we can evaluate as CommonJS
const evalSource = rawSource
  .replace(/^\/\*[\s\S]*?\*\/\s*/m, '')          // strip leading block comment
  .replace(/export const supplements\s*=\s*/, 'const supplements = ')
  .replace(/export default\s+supplements\s*;?/, '');

let rawSupplements = [];
try {
  const fn = new Function(`${evalSource}; return supplements;`);
  rawSupplements = fn();
  console.log(`✅  Loaded ${rawSupplements.length} raw entries from supplements.js\n`);
} catch (err) {
  console.error('❌  Failed to parse supplements.js:', err.message);
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const toSlug = (str = '') =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

/** Remove undefined / null values — Firestore rejects them */
const sanitize = (obj) => JSON.parse(JSON.stringify(obj));

const now = new Date().toISOString();

// ── Group raw entries by supplement name ──────────────────────────────────────
// Each unique name becomes one Firestore document.
// Each SKU (dosage + quantity combo) becomes a variant sub-document.

const supplementMap = new Map(); // slug → { productData, variants: Map<variantSlug, variantData>, rawDosages: Set, rawQuantities: Set }

for (const raw of rawSupplements) {
  if (!raw.name) continue;

  const slug = toSlug(raw.name);

  if (!supplementMap.has(slug)) {
    // First occurrence → use as canonical product-level data
    supplementMap.set(slug, {
      productData: {
        name:             raw.name,
        slug,
        category:         raw.category    || null,
        type:             raw.type        || 'supplement',
        desc:             raw.desc        || null,
        objective:        raw.objective   || null,
        image:            raw.image       || '/assets/vials/generic-supplement.png',
        goals:            Array.isArray(raw.goals) ? raw.goals : [],
        tags:             Array.isArray(raw.tags)  ? raw.tags  : [],
        semanticKeywords: Array.isArray(raw.semanticKeywords) ? raw.semanticKeywords : [],
        synonyms:         Array.isArray(raw.synonyms) ? raw.synonyms : [],
        clinical_benefits:      Array.isArray(raw.clinical_benefits)      ? raw.clinical_benefits      : [],
        mechanisms:             Array.isArray(raw.mechanisms)             ? raw.mechanisms             : [],
        protocols:              Array.isArray(raw.protocols)              ? raw.protocols              : [],
        commonly_combined_with: Array.isArray(raw.commonly_combined_with) ? raw.commonly_combined_with : [],
        status:           raw.status || 'active',
        createdAt:        now,
        updatedAt:        now,
        _source:          'supplements_js_seed',
      },
      variants: new Map(),
      rawDosages: new Set(),
      rawQuantities: new Set(),
    });
  }

  const entry = supplementMap.get(slug);
  if (raw.dosage) {
    entry.rawDosages.add(String(raw.dosage).trim());
  }
  if (raw.quantity) {
    entry.rawQuantities.add(String(raw.quantity).trim());
  }

  // Always add a variant for every SKU
  const variantSlug = toSlug(`${raw.name}-${raw.dosage || 'nodose'}-${raw.quantity || 'noqty'}`);

  if (!entry.variants.has(variantSlug)) {
    // Build canonical pricing.retail structure expected by resolvePrice.js
    // Source data may use priceUSD (supplements) or perVialPriceUSD (peptide vials)
    const perUnit = typeof raw.priceUSD       === 'number' ? raw.priceUSD
                  : typeof raw.perVialPriceUSD === 'number' ? raw.perVialPriceUSD
                  : null;
    const kit     = typeof raw.kitPriceUSD    === 'number' ? raw.kitPriceUSD  : null;

    entry.variants.set(variantSlug, {
      slug:           variantSlug,
      supplementSlug: slug,
      supplementName: raw.name,
      dosage:         raw.dosage   || null,
      quantity:       raw.quantity || null,
      status:         raw.status   || 'active',
      createdAt:      now,
      updatedAt:      now,
      // Canonical pricing schema — consumed by resolveAndFormatPrice()
      pricing: {
        retail: {
          perUnit,
          kit,
          currency: raw.currency || 'USD',
        },
      },
    });
  }

  // Merge richer product-level fields if later occurrences have them
  const existing = entry.productData;
  if (!existing.clinical_benefits.length && Array.isArray(raw.clinical_benefits)) {
    existing.clinical_benefits = raw.clinical_benefits;
  }
  if (!existing.mechanisms.length && Array.isArray(raw.mechanisms)) {
    existing.mechanisms = raw.mechanisms;
  }
  if (!existing.protocols.length && Array.isArray(raw.protocols)) {
    existing.protocols = raw.protocols;
  }
  if (!existing.commonly_combined_with.length && Array.isArray(raw.commonly_combined_with)) {
    existing.commonly_combined_with = raw.commonly_combined_with;
  }
}

// ── Consolidate Ranges for Parent Documents ──────────────────────────────────
const parseNum = (s) => {
  const m = s.match(/^([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
};

const formatRange = (set) => {
  const list = [...set].filter(Boolean);
  if (!list.length) return null;

  const allNumeric = list.every(s => parseNum(s) !== null);
  if (allNumeric) {
    list.sort((a, b) => parseNum(a) - parseNum(b));
  } else {
    list.sort();
  }

  if (list.length === 1) return list[0];
  return `${list[0]} – ${list[list.length - 1]}`;
};

for (const entry of supplementMap.values()) {
  entry.productData.dosage   = formatRange(entry.rawDosages);
  entry.productData.quantity = formatRange(entry.rawQuantities);
}

// ── Preview ────────────────────────────────────────────────────────────────────
console.log(`📦  Unique supplements: ${supplementMap.size}`);
let totalVariants = 0;
for (const { variants } of supplementMap.values()) {
  totalVariants += variants.size;
}
console.log(`🔬  Total variants:     ${totalVariants}\n`);

if (DRY_RUN) {
  console.log('── DRY RUN — no writes performed ──\n');
  for (const [slug, { productData, variants }] of supplementMap) {
    console.log(`  supplements/${slug}  (${variants.size} variants)`);
    console.log(`    dosage range: ${productData.dosage || '(none)'}`);
    console.log(`    quantity range: ${productData.quantity || '(none)'}`);
    console.log(`    goals: ${productData.goals.join(', ') || '(none)'}`);
  }
  process.exit(0);
}

// ── Write to Firestore ────────────────────────────────────────────────────────
const BATCH_SIZE = 400; // Firestore limit is 500 ops/batch

async function writeBatch(ops) {
  const batch = db.batch();
  for (const { ref, data } of ops) {
    batch.set(ref, sanitize(data), { merge: true });
  }
  await batch.commit();
}

async function seed() {
  const supplementsCol = db.collection('supplements');
  let productOps  = [];
  let variantOps  = [];
  let productCount = 0;
  let variantCount = 0;

  console.log('🚀  Uploading to Firestore...\n');

  for (const [slug, { productData, variants }] of supplementMap) {
    const docRef = supplementsCol.doc(slug);
    productOps.push({ ref: docRef, data: productData });

    for (const [variantSlug, variantData] of variants) {
      const varRef = docRef.collection('variants').doc(variantSlug);
      variantOps.push({ ref: varRef, data: variantData });
    }
  }

  // Write products in batches
  console.log(`  Writing ${productOps.length} supplement documents...`);
  for (let i = 0; i < productOps.length; i += BATCH_SIZE) {
    await writeBatch(productOps.slice(i, i + BATCH_SIZE));
    productCount += Math.min(BATCH_SIZE, productOps.length - i);
    process.stdout.write(`  ✓ ${productCount}/${productOps.length} supplements\r`);
  }
  console.log(`\n  ✅  ${productCount} supplement documents written.`);

  // Write variants in batches
  console.log(`\n  Writing ${variantOps.length} variant documents...`);
  for (let i = 0; i < variantOps.length; i += BATCH_SIZE) {
    await writeBatch(variantOps.slice(i, i + BATCH_SIZE));
    variantCount += Math.min(BATCH_SIZE, variantOps.length - i);
    process.stdout.write(`  ✓ ${variantCount}/${variantOps.length} variants\r`);
  }
  console.log(`\n  ✅  ${variantCount} variant documents written.\n`);

  console.log('🎉  Fase 0 complete — supplements collection is live in Firestore.');
  console.log('    Next: run Phase 1 (supplementRepository.js) and Phase 3 (goals enrichment).');
}

seed().catch((err) => {
  console.error('❌  Fatal error:', err);
  process.exit(1);
});

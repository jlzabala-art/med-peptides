#!/usr/bin/env node
/**
 * enrich_supplements_p1_seed.mjs  —  Phase 1
 *
 * Reads src/data/supplements.js and upserts every supplement into
 * the Firestore `supplements/{slug}` collection.
 *
 * - Idempotent (merge: true) — safe to re-run after edits.
 * - Goals are stored as-is (legacy). Phase 2 will add canonicalGoals.
 * - Variants are stored in `supplements/{slug}/variants/{variantSlug}`.
 *
 * Usage:
 *   node scripts/enrich_supplements_p1_seed.mjs --dry-run   # preview
 *   node scripts/enrich_supplements_p1_seed.mjs              # write
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

const evalSource = rawSource
  .replace(/^\/\*[\s\S]*?\*\/\s*/m, '')
  .replace(/export const supplements\s*=\s*/, 'const supplements = ')
  .replace(/export default\s+supplements\s*;?/, '');

let rawSupplements = [];
try {
  const fn = new Function(`${evalSource}; return supplements;`);
  rawSupplements = fn();
  console.log(`\n✅  Loaded ${rawSupplements.length} raw entries from supplements.js`);
} catch (err) {
  console.error('❌  Failed to parse supplements.js:', err.message);
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const toSlug = (str = '') =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const sanitize = (obj) => JSON.parse(JSON.stringify(obj));
const now = new Date().toISOString();

// ── Group by supplement name ───────────────────────────────────────────────────
const supplementMap = new Map();

for (const raw of rawSupplements) {
  if (!raw.name) continue;

  const slug = toSlug(raw.name);

  if (!supplementMap.has(slug)) {
    supplementMap.set(slug, {
      productData: {
        name:              raw.name,
        slug,
        category:          raw.category    || null,
        type:              'supplement',
        desc:              raw.desc        || null,
        objective:         raw.objective   || null,
        image:             raw.image       || '/assets/vials/generic-supplement.png',
        goals:             Array.isArray(raw.goals) ? raw.goals : [],
        tags:              Array.isArray(raw.tags)  ? raw.tags  : [],
        semanticKeywords:  Array.isArray(raw.semanticKeywords) ? raw.semanticKeywords : [],
        synonyms:          Array.isArray(raw.synonyms) ? raw.synonyms : [],
        clinical_benefits: Array.isArray(raw.clinical_benefits) ? raw.clinical_benefits : [],
        mechanisms:        Array.isArray(raw.mechanisms) ? raw.mechanisms : [],
        status:            raw.status || 'active',
        // canonical goals will be set in Phase 2
        canonicalGoals:    [],
        createdAt:         now,
        updatedAt:         now,
        _source:           'enrich_supplements_p1',
      },
      variants: new Map(),
    });
  }

  // Merge richer fields from later occurrences
  const entry = supplementMap.get(slug);
  const existing = entry.productData;
  if (!existing.clinical_benefits.length && Array.isArray(raw.clinical_benefits)) {
    existing.clinical_benefits = raw.clinical_benefits;
  }
  if (!existing.mechanisms.length && Array.isArray(raw.mechanisms)) {
    existing.mechanisms = raw.mechanisms;
  }

  // Accumulate goals from all SKUs (some may differ)
  for (const g of (raw.goals || [])) {
    if (!existing.goals.includes(g)) existing.goals.push(g);
  }

  // Variant per SKU
  const variantSlug = toSlug(`${raw.name}-${raw.dosage || 'nodose'}-${raw.quantity || 'noqty'}`);
  if (!entry.variants.has(variantSlug)) {
    entry.variants.set(variantSlug, {
      slug:            variantSlug,
      supplementSlug:  slug,
      supplementName:  raw.name,
      dosage:          raw.dosage   || null,
      quantity:        raw.quantity || null,
      perVialPriceUSD: typeof raw.perVialPriceUSD === 'number' ? raw.perVialPriceUSD : null,
      kitPriceUSD:     typeof raw.kitPriceUSD     === 'number' ? raw.kitPriceUSD     : null,
      status:          raw.status || 'active',
      createdAt:       now,
      updatedAt:       now,
    });
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
let totalVariants = 0;
for (const { variants } of supplementMap.values()) totalVariants += variants.size;

console.log(`\n📦  Unique supplements : ${supplementMap.size}`);
console.log(`🔬  Total variants     : ${totalVariants}`);
console.log(`🏷️   Mode               : ${DRY_RUN ? 'DRY RUN — no writes' : 'LIVE WRITE'}\n`);

if (DRY_RUN) {
  for (const [slug, { productData, variants }] of supplementMap) {
    console.log(`  supplements/${slug}  [${variants.size} variants]`);
    console.log(`    goals: ${productData.goals.join(', ') || '(none)'}`);
  }
  console.log('\n── DRY RUN complete — nothing written ──');
  process.exit(0);
}

// ── Write to Firestore ────────────────────────────────────────────────────────
const BATCH_SIZE = 400;

async function writeBatch(ops) {
  const batch = db.batch();
  for (const { ref, data } of ops) {
    batch.set(ref, sanitize(data), { merge: true });
  }
  await batch.commit();
}

async function run() {
  const col = db.collection('supplements');
  const productOps = [];
  const variantOps = [];

  for (const [slug, { productData, variants }] of supplementMap) {
    const docRef = col.doc(slug);
    productOps.push({ ref: docRef, data: productData });
    for (const [vSlug, vData] of variants) {
      variantOps.push({ ref: docRef.collection('variants').doc(vSlug), data: vData });
    }
  }

  console.log(`🚀  Writing ${productOps.length} supplement docs...`);
  let done = 0;
  for (let i = 0; i < productOps.length; i += BATCH_SIZE) {
    await writeBatch(productOps.slice(i, i + BATCH_SIZE));
    done += Math.min(BATCH_SIZE, productOps.length - i);
    process.stdout.write(`  ✓ ${done}/${productOps.length}\r`);
  }
  console.log(`\n  ✅  ${done} supplement documents written.`);

  console.log(`\n🚀  Writing ${variantOps.length} variant docs...`);
  done = 0;
  for (let i = 0; i < variantOps.length; i += BATCH_SIZE) {
    await writeBatch(variantOps.slice(i, i + BATCH_SIZE));
    done += Math.min(BATCH_SIZE, variantOps.length - i);
    process.stdout.write(`  ✓ ${done}/${variantOps.length}\r`);
  }
  console.log(`\n  ✅  ${done} variant documents written.\n`);
  console.log('🎉  Phase 1 complete — run Phase 2 next to add canonical goals.');
}

run().catch(err => { console.error('❌  Fatal:', err); process.exit(1); });

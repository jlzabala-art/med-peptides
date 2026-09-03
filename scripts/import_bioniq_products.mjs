/**
 * import_bioniq_products.mjs
 *
 * Imports all 39 records from "Bioniq Master Price.json" into the Firestore
 * `products` collection, tagged under supplier `supplier-bioniq`.
 *
 * SAFETY RULES:
 *  - Never deletes or modifies Lotusland, NP Labs, or any other supplier's docs.
 *  - Doc IDs are prefixed with `bioniq_` for isolation.
 *  - Uses upsert (set with merge: false) — overwrites only Bioniq docs.
 *
 * Usage:
 *   node scripts/import_bioniq_products.mjs           → DRY-RUN (safe preview)
 *   node scripts/import_bioniq_products.mjs --live    → LIVE WRITE to Firestore
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// ── Firebase Init ────────────────────────────────────────────────────────────
const credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
});

const app = initializeApp({ credential });
const db = getFirestore(app);

// ── Constants ────────────────────────────────────────────────────────────────
const BIONIQ_SUPPLIER_ID   = 'supplier-bioniq';
const BIONIQ_SUPPLIER_NAME = 'Bioniq';
const LIVE = process.argv.includes('--live');

// ── Load JSON ────────────────────────────────────────────────────────────────
const jsonPath = path.join(__dirname, '../AI Prompts/Bioniq/Bioniq Master Price.json');
const bioniqData = JSON.parse(readFileSync(jsonPath, 'utf8'));
const records = bioniqData.records;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds a stable, unique Firestore doc ID for a Bioniq product.
 * Format: bioniq_{peptide_slug}_{presentation_slug}_{strength_slug}
 */
function makeDocId(record) {
  const peptide = (record.peptide?.display_name || record.source_label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 40);

  const presentation = (record.presentation?.display_name || 'pen')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 20);

  const strength = (record.strength?.total_strength || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 20);

  return `bioniq_${peptide}_${presentation}_${strength}`
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 100);
}

/**
 * Maps a Bioniq JSON record to the Firestore product schema.
 * Compatible with existing schema used by Lotusland products.
 */
function mapRecordToDoc(record, now) {
  const peptideName    = record.peptide?.display_name || record.source_label;
  const presentationName = record.presentation?.display_name || 'Single Use Pen';
  const strength       = record.strength || {};
  const retailPriceEUR = record.retail_unit_price?.EUR ?? null;
  const retailPriceAED = record.retail_unit_price?.AED ?? null;
  const pricingTiers   = (record.pricing_tiers || []).map(tier => ({
    source_range:        tier.source_range,
    min_qty:             tier.min_qty,
    max_qty:             tier.max_qty ?? null,
    discount_pct:        tier.discount_pct,
    unit_price_eur:      tier.unit_price?.amount ?? null,
    currency:            tier.unit_price?.currency ?? 'EUR',
    white_label_qualified: tier.white_label_qualified ?? false,
  }));

  // Canonical slug for cross-referencing with peptide master catalog
  const slug = peptideName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return {
    // ── Identity ─────────────────────────────────────────────────────────
    name:             peptideName,
    canonicalName:    peptideName,
    displayName:      peptideName,
    slug:             slug,
    source_label:     record.source_label,

    // ── Classification ────────────────────────────────────────────────────
    category:         'peptide',
    type:             record.product_type || 'peptide',
    status:           'published',
    isActive:         true,

    // ── Presentation & Strength ───────────────────────────────────────────
    presentation:     presentationName,
    formatId:         presentationName.toLowerCase().replace(/\s+/g, '_'),
    strength: {
      concentration:  strength.concentration || null,
      fill_volume:    strength.fill_volume    || null,
      total_strength: strength.total_strength || null,
    },

    // ── Supplier ──────────────────────────────────────────────────────────
    supplierId:       BIONIQ_SUPPLIER_ID,
    supplierName:     BIONIQ_SUPPLIER_NAME,
    supplier:         BIONIQ_SUPPLIER_NAME,

    // ── Pricing ───────────────────────────────────────────────────────────
    currency:         'EUR',
    canonical_price_eur:    retailPriceEUR,
    canonical_price_aed:    retailPriceAED,
    retail_unit_price: {
      EUR: retailPriceEUR,
      AED: retailPriceAED,
    },

    // Volume pricing tiers (same field name as existing products)
    pricing_tiers:    pricingTiers,

    // Flat pricing structure for compatibility
    pricing: {
      retail:         retailPriceEUR,
      wholesale:      pricingTiers[0]?.unit_price_eur ?? null,
      clinic:         null,
      supplierCost:   null,
      volume10Kit:    pricingTiers.find(t => t.min_qty <= 10 && (t.max_qty === null || t.max_qty >= 10))?.unit_price_eur ?? null,
    },

    // ── Source Metadata ───────────────────────────────────────────────────
    source:           'bioniq_master_price_list',
    source_file:      record.source_file || 'Bioniq Master Price.json',

    // ── Timestamps ────────────────────────────────────────────────────────
    createdAt:        now,
    updatedAt:        now,

    // ── Commercial Status ─────────────────────────────────────────────────
    commercialStatus: {
      inStock:        true,
      priceMissing:   retailPriceEUR === null,
      supplierMissing: false,
      singleSourceRisk: false,
    },
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n🔄 Bioniq Product Import — mode: ${LIVE ? '🔴 LIVE' : '🟡 DRY-RUN'}`);
  console.log(`📋 Records to import: ${records.length}`);
  console.log(`🏭 Supplier: ${BIONIQ_SUPPLIER_NAME} (${BIONIQ_SUPPLIER_ID})\n`);

  // ── Step 0: Safety — confirm no other supplier docs will be touched ────────
  console.log('🛡  Safety check: verifying only Bioniq docs will be affected...');
  const existing = await db.collection('products')
    .where('supplierId', '==', BIONIQ_SUPPLIER_ID)
    .get();
  console.log(`   ↳ Found ${existing.size} existing Bioniq products (will be overwritten if --live)\n`);

  // ── Step 1: Build documents ────────────────────────────────────────────────
  const now = LIVE ? FieldValue.serverTimestamp() : new Date().toISOString();

  const newDocs = records.map(record => {
    const docId = makeDocId(record);
    const data  = mapRecordToDoc(record, now);
    return { id: docId, data };
  });

  // ── Step 2: Preview ────────────────────────────────────────────────────────
  console.log('📦 Preview of documents to write:\n');
  newDocs.forEach(({ id, data }) => {
    const tiers = data.pricing_tiers.map(t =>
      `    ${t.source_range}: €${t.unit_price_eur} (${t.discount_pct}% off)`
    ).join('\n');
    console.log(
      `  • [${id}]\n` +
      `    Name: ${data.name}\n` +
      `    Presentation: ${data.presentation} | Strength: ${data.strength.total_strength}\n` +
      `    Retail: €${data.canonical_price_eur} / AED ${data.canonical_price_aed}\n` +
      `    Tiers:\n${tiers}\n`
    );
  });

  if (!LIVE) {
    console.log(`\n⚠️  DRY-RUN — nothing written to Firestore.`);
    console.log(`   Re-run with --live to execute:\n`);
    console.log(`   node scripts/import_bioniq_products.mjs --live\n`);
    return;
  }

  // ── Step 3: Write in batches of 499 ───────────────────────────────────────
  console.log(`\n✍️  Writing ${newDocs.length} docs to Firestore...`);
  for (let i = 0; i < newDocs.length; i += 499) {
    const batch = db.batch();
    newDocs.slice(i, i + 499).forEach(({ id, data }) => {
      batch.set(db.collection('products').doc(id), data);
    });
    await batch.commit();
    console.log(`   ↳ Committed ${Math.min(i + 499, newDocs.length)}/${newDocs.length} docs ✅`);
  }

  // ── Step 4: Verify ────────────────────────────────────────────────────────
  const verify = await db.collection('products')
    .where('supplierId', '==', BIONIQ_SUPPLIER_ID)
    .get();

  console.log(`\n✅ Final count in Firestore: ${verify.size} Bioniq docs`);
  console.log(`   Expected: ${newDocs.length}`);

  if (verify.size === newDocs.length) {
    console.log('🎉 Perfect match — all Bioniq products imported successfully!\n');
  } else {
    console.warn(`⚠️  Mismatch! Expected ${newDocs.length} but got ${verify.size}. Check for errors.\n`);
  }
}

run().catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});

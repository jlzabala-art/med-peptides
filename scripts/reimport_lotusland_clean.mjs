/**
 * reimport_lotusland_clean.mjs
 * 
 * 1. Deletes ALL existing Firestore products with supplierId = Lotusland
 * 2. Re-imports exactly 104 entries from the Master Price List JSON
 *    with correct canonicalName, category: "Peptides", supplierId, etc.
 *
 * node scripts/reimport_lotusland_clean.mjs           (dry-run)
 * node scripts/reimport_lotusland_clean.mjs --live    (execute)
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);
const sa        = require(path.join(__dirname, 'serviceAccountKey.json'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });

const db   = admin.firestore();
const LIVE = process.argv.includes('--live');

const LOTUSLAND_SUPPLIER_ID   = 'OLlBbQjgrj6tY7GmM2Jo';
const LOTUSLAND_SUPPLIER_NAME = 'Lotusland Limited';

// Build a stable Firestore doc ID from product name + dosage
const makeDocId = (product, dosage) => {
  return `lotusland_${product}_${dosage}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 100);
};

// Parse numeric dosage value from dosage string like "5 mg / vial"
const parseDosageValue = (dosage) => {
  const m = (dosage || '').match(/^([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
};

const priceList = JSON.parse(
  readFileSync(path.join(__dirname, '../AI Prompts/LotusLand Master Price List.json'), 'utf8')
);

async function run() {
  console.log(`\n🔄 Lotusland Clean Reimport — mode: ${LIVE ? '🔴 LIVE' : '🟡 DRY-RUN'}`);
  console.log(`📋 Price list entries: ${priceList.length}\n`);

  // ── Step 1: Delete all current Lotusland docs ──────────────────────────────
  const existing = await db.collection('products')
    .where('supplierId', '==', LOTUSLAND_SUPPLIER_ID)
    .get();

  console.log(`🗑  Will DELETE ${existing.size} existing Lotusland docs`);

  if (LIVE && existing.size > 0) {
    for (let i = 0; i < existing.docs.length; i += 499) {
      const batch = db.batch();
      existing.docs.slice(i, i + 499).forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
    console.log(`   ↳ Deleted ${existing.size} docs ✅`);
  }

  // ── Step 2: Build the 104 new documents ───────────────────────────────────
  const now = admin.firestore.FieldValue.serverTimestamp();

  const newDocs = priceList.map(entry => {
    const docId = makeDocId(entry.product, entry.dosage);
    const dosageValue = parseDosageValue(entry.dosage);

    return {
      id: docId,
      data: {
        // Identity
        canonicalName:  entry.product,
        name:           entry.product,
        dosage:         entry.dosage,
        dosageValue:    dosageValue,
        presentation:   entry.presentation || 'vial',
        quantity:       entry.quantity || null,

        // Classification
        category:       'Peptides',
        type:           'peptide',
        status:         'published',
        isActive:       true,

        // Supplier
        supplierId:     LOTUSLAND_SUPPLIER_ID,
        supplierName:   LOTUSLAND_SUPPLIER_NAME,

        // Pricing
        price:          entry.perVialPriceUSD    ?? null,
        price_per_kit_10: entry.perKitPriceUSD   ?? null,
        currency:       'USD',

        // Metadata
        source:         'master_price_list',
        updatedAt:      now,
        createdAt:      now,
      }
    };
  });

  console.log(`\n✍️  Will CREATE ${newDocs.length} docs from price list`);
  if (!LIVE) {
    console.log('\nSample (first 3):');
    newDocs.slice(0, 3).forEach(d => {
      console.log(`  • [${d.id}] "${d.data.canonicalName}" | ${d.data.dosage} | $${d.data.price}`);
    });
    console.log(`\n⚠️  DRY-RUN — nothing written. Re-run with --live to execute.`);
    return;
  }

  // Write in batches of 499
  for (let i = 0; i < newDocs.length; i += 499) {
    const batch = db.batch();
    newDocs.slice(i, i + 499).forEach(({ id, data }) => {
      batch.set(db.collection('products').doc(id), data);
    });
    await batch.commit();
    console.log(`  ↳ Written ${Math.min(i + 499, newDocs.length)}/${newDocs.length}`);
  }

  // ── Step 3: Verify ─────────────────────────────────────────────────────────
  const verify = await db.collection('products')
    .where('supplierId', '==', LOTUSLAND_SUPPLIER_ID)
    .get();

  console.log(`\n✅ Final count in Firestore: ${verify.size} docs (expected: ${priceList.length})`);
  if (verify.size === priceList.length) {
    console.log('🎉 Perfect match — Firestore = Price List');
  }
}

run().catch(err => { console.error(err); process.exit(1); });

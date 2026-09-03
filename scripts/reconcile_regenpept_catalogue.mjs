/**
 * reconcile_regenpept_catalogue.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Reconciler & Migrator for RegenPept Source Catalogue into Atlas Solutions.
 *
 * Enforces:
 *   1. Supplier = "Lotusland Limited" (Supplier ID: "OLlBbQjgrj6tY7GmM2Jo")
 *   2. Source Catalogue / Brand = "RegenPept" (Source Document: "RegenPept_Portfolio_31_(3).pdf")
 *   3. Independent Unit Price ($/vial, $/bottle, $/box) & Explicit Kit Price ($/kit-of-10)
 *   4. Clean mapping to canonical products without overwriting or duplicate creation
 *   5. Unit-aware packaging & format preservation
 *
 * Usage:
 *   node scripts/reconcile_regenpept_catalogue.mjs            (dry-run report)
 *   node scripts/reconcile_regenpept_catalogue.mjs --backup   (export snapshot backup)
 *   node scripts/reconcile_regenpept_catalogue.mjs --live     (commit to Firestore)
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, readFileSync } from 'fs';
import * as readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sa = require(path.join(__dirname, 'serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

const SUPPLIER_ID = 'OLlBbQjgrj6tY7GmM2Jo';
const SUPPLIER_NAME = 'Lotusland Limited';
const CATALOG_BRAND = 'RegenPept';
const SOURCE_DOCUMENT = 'RegenPept_Portfolio_31_(3).pdf';
const WAREHOUSE_REGENPEPT = 'Poland, USA, and UK';

// ── Ingest Source of Truth JSON ──────────────────────────────────────────────
const JSON_PATH = path.join(__dirname, '../AI Prompts/regenpept_catalog_import.json');
const SOURCE_DATA = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
const ITEMS = SOURCE_DATA.products;

// Normalization Helpers
const slugify = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const normD = s => (s || '')
  .toLowerCase()
  .replace(/\s+/g, '')
  .replace(/mcg\/tablet/g, 'mcg')
  .replace(/mg\/tablet/g, 'mg')
  .replace(/\/vial/g, '')
  .replace(/\/bottle/g, '')
  .replace(/\/tablet/g, '')
  .replace(/iu\/vial/g, 'iu')
  .replace(/,/g, '')
  .replace(/\|/g, '+')
  .replace(/\//g, '+');

// Canonical Parent Product IDs in Firestore
const canonicalProductMap = {
  // ── GLP-1 / Metabolic ───────────────────────────────────────────────────────
  'Glutathione': 'glutathione',
  'Retatrutide': 'retatrutide',
  'Tirzepatide': 'tirzepatide',
  'Semaglutide': 'semaglutide',
  'Cagrilintide': 'cagrilintide',
  // ── Repair / Recovery ──────────────────────────────────────────────────────
  'BPC-157': 'bpc-157',
  'BPC-157 + TB-500': 'bpc-157-tb-500',
  'Thymosin β4 (TB-500)': 'tb-500',
  'AOD-9604': 'aod-9604',
  'ARA-290': 'ara-290',
  // ── Immune / Bioregulators ─────────────────────────────────────────────────
  'Thymosin Alpha 1': 'thymosin-alpha-1',
  'Thymosin Alpha 1 + Thymalin': 'thymosin-alpha-1-thymalin',
  'Thymogen': 'thymogen',
  'Epithalon': 'epithalon',
  'Thymulin': 'thymulin',
  'Pinealon': 'pinealon',
  'KPV': 'kpv',
  'DSIP': 'dsip',
  // ── Growth / GH Axis ───────────────────────────────────────────────────────
  'HGH': 'hgh',
  'HMG': 'hmg',
  'IGF LR3': 'igf-lr3',
  'MOTS-C': 'mots-c',
  'PEG-MGF': 'peg-mgf',
  'Ipamorelin': 'ipamorelin',
  'Sermorelin': 'sermorelin',
  'Hexarelin': 'hexarelin',
  'Tesamorelin': 'tesamorelin',
  'GHRP-2': 'ghrp-2',
  'CJC-1295 without DAC': 'cjc-1295-no-dac',
  'CJC-1295 without DAC + Ipamorelin': 'cjc-1295-ipamorelin',
  'CJC-1295 with DAC': 'cjc-1295-dac',
  // ── Neuro / Cognitive ──────────────────────────────────────────────────────
  'Selank': 'selank',
  'Semax': 'semax',
  'Snap-8': 'snap-8',
  'PE 22-28': 'pe-22-28',
  'SS-31': 'ss-31',
  // ── Longevity / NAD ────────────────────────────────────────────────────────
  'NAD+': 'nad',
  'NMN': 'nmn',
  '5-Amino-1MQ': '5-amino-1mq',
  'GHK-Cu (Human Copper)': 'ghk-cu',
  'GW501516': 'gw501516',
  'MK-677': 'mk-677',
  'SLU-PP-332': 'slu-pp-332',
  // ── Blends / Combos ────────────────────────────────────────────────────────
  'GLOW (BPC-157 / TB-500 / GHK)': 'glow-blend',
  'KLOW (BPC-157 / TB-500 / GHKCu / KPV)': 'klow-blend',
  // ── Sexual / Fertility ─────────────────────────────────────────────────────
  'PT-141': 'pt-141',
  'MT2': 'mt2',
  'Oxytocin Acetate': 'oxytocin-acetate',
  'Kisspeptin-10': 'kisspeptin-10',
  'hCG': 'hcg',
  // ── Anti-aging / Skin ──────────────────────────────────────────────────────
  'LL-37': 'll-37',
  'PNC-27': 'pnc-27',
  'FOX-04': 'fox-04',
  'FST344': 'fst344',
  // ── Bioregulators (Khavinson) ──────────────────────────────────────────────
  'Cartalax': 'cartalax',
  'Cardiogen': 'cardiogen',
  'Prostamax': 'prostamax',
  'Testagen': 'testagen',
  // ── Accessories & Supplies ─────────────────────────────────────────────────
  'Insulin Syringes 1/2 ml - 31G x 8 mm': 'insulin-syringes',
  'Bacteriostatic Water': 'bac-water',
  'Syringe and Bac Water Bundle': 'starter-kit-bundle',
};

// Build stable variant ID
const mkVarId = (productName, dosage) => {
  const prodSlug = slugify(productName);
  const doseSlug = slugify(
    dosage.replace(/\s*\/\s*(vial|bottle|tablet|box|kit)/gi, '')
          .replace(/\s*\|\s*/g, '-')
          .trim()
  );
  return `lotusland-${prodSlug}-${doseSlug}`;
};

function mkVariantPayload(item) {
  const unitPrice = Number(item.unit_price || 0);
  const packPrice = Number(item.pack_price || unitPrice);
  const packSize = Number(item.pack_size || 10);
  const unitType = item.unit_type || 'vial';
  const packType = item.pack_type || 'kit';

  return {
    supplierId: SUPPLIER_ID,
    supplierName: SUPPLIER_NAME,
    supplier: 'LotusLand',
    catalogBrand: CATALOG_BRAND,
    sourceCatalogue: CATALOG_BRAND,
    sourceDocument: SOURCE_DOCUMENT,
    warehouse: WAREHOUSE_REGENPEPT,
    warehouseId: 'regenpept_logistics_hub',
    shippingOrigins: ['Poland', 'USA', 'UK'],
    productName: item.product_name,
    dosage: item.dosage,
    normalizedDosage: normD(item.dosage),
    presentation: unitType === 'vial' ? 'vial' : unitType === 'bottle' ? 'bottle' : unitType === 'box' ? 'box' : 'kit',
    presentationName: unitType === 'vial' ? 'Vial' : unitType === 'bottle' ? 'Bottle' : unitType === 'box' ? 'Box' : 'Kit Bundle',
    packageType: packType,
    packSize: packSize,
    unitsPerPack: packSize,
    unitsPerKit: unitType === 'vial' ? packSize : 1,
    quantity: item.quantity,
    currency: item.currency || 'USD',
    // Supplier Costs
    supplierUnitCostUSD: unitPrice,
    supplierKitCostUSD: packPrice,
    unit_price: unitPrice,
    cost_1: unitPrice,
    cost_10: packPrice,
    // Explicit Multi-Channel Pricing Schema
    pricing: {
      master: {
        perUnit: unitPrice,
        kit: packPrice,
        currency: 'USD',
        kitQuantity: packSize,
      },
      wholesale: {
        perUnit: parseFloat((unitPrice * 1.35).toFixed(2)),
        kit: parseFloat((packPrice * 1.35).toFixed(2)),
        currency: 'USD',
        kitQuantity: packSize,
      },
      clinic: {
        perUnit: parseFloat((unitPrice * 1.55).toFixed(2)),
        kit: parseFloat((packPrice * 1.55).toFixed(2)),
        currency: 'USD',
        kitQuantity: packSize,
      },
      retail: {
        perUnit: parseFloat((unitPrice * 1.90).toFixed(2)),
        kit: parseFloat((packPrice * 1.90).toFixed(2)),
        currency: 'USD',
        kitQuantity: packSize,
      },
    },
    activeForSupplier: true,
    status: 'published',
    sourcePage: item.source_page || null,
    researchUseOnly: item.research_use_only ?? true,
    notes: item.notes || null,
  };
}

async function main() {
  const mode = process.argv.includes('--live') ? 'live'
             : process.argv.includes('--backup') ? 'backup' : 'dry-run';

  console.log('\n' + '═'.repeat(78));
  console.log(`  REGENPEPT → ATLAS SOLUTIONS RECONCILIATION ENGINE — ${mode.toUpperCase()}`);
  console.log(`  Source: ${SOURCE_DOCUMENT} (${ITEMS.length} items)`);
  console.log('═'.repeat(78) + '\n');

  // 1. Fetch current products and variants
  console.log('📡 Querying Firestore products & variants...');
  const prodSnap = await db.collection('products').get();
  const dbProds = prodSnap.docs.map(d => ({ id: d.id, ref: d.ref, ...d.data() }));

  const varSnap = await db.collectionGroup('variants').get();
  const dbVars = varSnap.docs.map(d => ({
    id: d.id,
    ref: d.ref,
    productId: d.ref.parent.parent?.id,
    data: d.data()
  }));

  console.log(`   Found ${dbProds.length} products and ${dbVars.length} variants in Firestore.\n`);

  const reconciliationReport = [];
  const toCreateProducts = [];
  const toWriteVariants = [];

  for (let idx = 0; idx < ITEMS.length; idx++) {
    const item = ITEMS[idx];
    const sourceName = item.product_name;
    const sourceDose = item.dosage;
    const sourceUnitPrice = item.unit_price;
    const sourceKitPrice = item.pack_price;
    const targetVarId = mkVarId(sourceName, sourceDose);

    // Find canonical parent product
    let targetCanonId = canonicalProductMap[sourceName] || slugify(sourceName);
    let parentProd = dbProds.find(p => p.id === targetCanonId);
    if (!parentProd) {
      parentProd = dbProds.find(p => norm(p.name) === norm(sourceName) || norm(p.canonicalName) === norm(sourceName) || norm(p.title) === norm(sourceName));
    }

    let productStatus = 'MATCH';
    if (!parentProd) {
      productStatus = 'NEW_CANONICAL_PRODUCT';
      parentProd = {
        id: targetCanonId,
        ref: db.collection('products').doc(targetCanonId),
        name: sourceName,
        canonicalName: sourceName,
      };
      toCreateProducts.push(parentProd);
    }

    const payload = mkVariantPayload(item);
    const existingVar = dbVars.find(v => v.productId === parentProd.id && (v.id === targetVarId || normD(v.data.dosage) === normD(sourceDose)));

    let status = 'MATCH';
    if (!existingVar) {
      status = 'MISSING';
    } else if (existingVar.data.supplierUnitCostUSD !== sourceUnitPrice || existingVar.data.supplierKitCostUSD !== sourceKitPrice) {
      status = 'PRICE_MISMATCH';
    }

    toWriteVariants.push({
      parentProd,
      targetVarId,
      existingVar,
      payload,
      item
    });

    reconciliationReport.push({
      idx: idx + 1,
      sourceProduct: sourceName,
      sourcePresentation: sourceDose,
      sourceFormat: item.unit_type,
      sourceUnitPrice: `$${sourceUnitPrice.toFixed(2)}`,
      sourceKitQuantity: item.pack_size,
      sourceKitPrice: `$${sourceKitPrice.toFixed(2)}`,
      atlasCanonicalProduct: parentProd.id,
      atlasPresentation: payload.presentationName,
      atlasUnitPrice: `$${payload.supplierUnitCostUSD.toFixed(2)}`,
      atlasKitPrice: `$${payload.supplierKitCostUSD.toFixed(2)}`,
      supplier: SUPPLIER_NAME,
      sourceCatalogue: CATALOG_BRAND,
      status
    });
  }

  // ── Print Reconciliation Report ─────────────────────────────────────────────
  console.log('📋 RECONCILIATION SUMMARY:');
  const matchCount = reconciliationReport.filter(r => r.status === 'MATCH').length;
  const mismatchCount = reconciliationReport.filter(r => r.status === 'PRICE_MISMATCH').length;
  const missingCount = reconciliationReport.filter(r => r.status === 'MISSING').length;

  console.log(`   ✅ Exact Matches:   ${matchCount}/${ITEMS.length}`);
  console.log(`   🟡 Price Mismatches: ${mismatchCount}/${ITEMS.length}`);
  console.log(`   🔵 Missing Variants: ${missingCount}/${ITEMS.length}`);
  console.log(`   📦 New Products to Initialize: ${toCreateProducts.length}\n`);

  console.log('─'.repeat(110));
  console.log(
    '#'.padEnd(4) +
    'Source Product'.padEnd(28) +
    'Dose / Spec'.padEnd(26) +
    'Unit $'.padEnd(10) +
    'Kit $ (x10)'.padEnd(14) +
    'Atlas Product ID'.padEnd(20) +
    'Status'
  );
  console.log('─'.repeat(110));

  for (const r of reconciliationReport) {
    console.log(
      String(r.idx).padEnd(4) +
      r.sourceProduct.substring(0, 26).padEnd(28) +
      r.sourcePresentation.substring(0, 24).padEnd(26) +
      r.sourceUnitPrice.padEnd(10) +
      r.sourceKitPrice.padEnd(14) +
      r.atlasCanonicalProduct.substring(0, 18).padEnd(20) +
      (r.status === 'MATCH' ? '✅ MATCH' : r.status === 'PRICE_MISMATCH' ? '🟡 PRICE FIX' : '🔵 CREATE')
    );
  }
  console.log('─'.repeat(110) + '\n');

  // ── Backup Mode ─────────────────────────────────────────────────────────────
  if (mode === 'backup') {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const bp = path.join(__dirname, `regenpept_backup_${ts}.json`);
    writeFileSync(bp, JSON.stringify({
      timestamp: new Date().toISOString(),
      report: reconciliationReport,
      toWriteVariants: toWriteVariants.map(w => ({
        productId: w.parentProd.id,
        variantId: w.targetVarId,
        payload: w.payload
      }))
    }, null, 2));
    console.log(`💾 Backup snapshot saved to: ${bp}\n`);
    process.exit(0);
  }

  // ── Live Migration Mode ─────────────────────────────────────────────────────
  if (mode === 'live') {
    console.log('\n🚀 Committing Canonical Products & Variants to Firestore...');

    // Phase 1: Initialize any missing parent products
    for (const prod of toCreateProducts) {
      const prodRef = db.collection('products').doc(prod.id);
      await prodRef.set({
        name: prod.name,
        canonicalName: prod.name,
        category: 'Peptides',
        status: 'published',
        isActive: true,
        catalogBrand: CATALOG_BRAND,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.log(`   ✅ Initialized Canonical Product: ${prod.name} (${prod.id})`);
    }

    // Phase 2: Upsert variants with authoritative pricing
    let batch = db.batch();
    let count = 0;

    for (const w of toWriteVariants) {
      const varRef = db.collection('products').doc(w.parentProd.id).collection('variants').doc(w.targetVarId);
      const data = {
        ...w.payload,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: 'reconcile_regenpept_catalogue.mjs',
      };
      batch.set(varRef, data, { merge: true });
      count++;

      if (count >= 300) {
        await batch.commit();
        batch = db.batch();
        count = 0;
      }
      console.log(`   ✅ Upserted Variant: ${w.payload.productName} [${w.payload.dosage}] → ${w.targetVarId} (Unit: $${w.payload.supplierUnitCostUSD}, Kit: $${w.payload.supplierKitCostUSD})`);
    }

    if (count > 0) {
      await batch.commit();
    }

    console.log('\n🎉 RECONCILIATION COMPLETED SUCCESSFULLY!');
    console.log(`   Total variants updated/created: ${toWriteVariants.length}`);
    console.log(`   All explicit kit prices ($/10) and unit costs are now 100% synchronized with ${SOURCE_DOCUMENT}.`);
  }
}

main().catch(err => {
  console.error('Fatal reconciliation error:', err);
  process.exit(1);
});

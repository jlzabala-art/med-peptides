#!/usr/bin/env node
/**
 * verify_suppliers_coverage.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Muestra cobertura de suppliers en productos y variantes.
 *
 * Antes: descargaba todos los productos + subcollections de variantes
 *        (~1.400 lecturas, varios minutos)
 * Ahora: lee desde `_meta/supplier_coverage` — 1 sola lectura, <200ms
 *
 * Uso:
 *   node scripts/verify_suppliers_coverage.mjs              → desde _meta
 *   node scripts/verify_suppliers_coverage.mjs --full-scan  → fuerza re-cálculo
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8')
);
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const FULL_SCAN = process.argv.includes('--full-scan');

// ─────────────────────────────────────────────────────────────────────────────
// Fast path: lee _meta/supplier_coverage (1 lectura)
// ─────────────────────────────────────────────────────────────────────────────
async function auditFromMeta() {
  const metaDoc = await db.collection('_meta').doc('supplier_coverage').get();

  if (!metaDoc.exists) {
    console.warn('⚠️  _meta/supplier_coverage no existe. Generando con full-scan...');
    return auditFullScan();
  }

  const data = metaDoc.data();
  const updatedAt = data.updatedAt?.toDate?.()?.toISOString() ?? 'unknown';
  printReport({ ...data, source: `_meta/supplier_coverage (updated: ${updatedAt})` });
}

// ─────────────────────────────────────────────────────────────────────────────
// Full scan: recalcula desde Firestore usando select() (field masks)
// ─────────────────────────────────────────────────────────────────────────────
async function auditFullScan() {
  console.log('\n⚡ Modo full-scan — leyendo con select() (field masks)...\n');

  const [prodSnap, varSnap, suppliersSnap] = await Promise.all([
    db.collection('products').select('supplierIds', 'name', 'categoryId').get(),
    db.collectionGroup('variants').select('supplierId', 'supplierName', 'supplier').get(),
    db.collection('suppliers').select('name').get(),
  ]);

  const supplierNames = {};
  suppliersSnap.forEach(doc => { supplierNames[doc.id] = doc.data().name || doc.id; });

  const bySupplier = {};
  let productsWithSupplier = 0, productsWithoutSupplier = 0;
  const orphanProductIds = [];

  prodSnap.forEach(doc => {
    const { supplierIds, name } = doc.data();
    const has = Array.isArray(supplierIds) && supplierIds.length > 0;
    if (has) {
      productsWithSupplier++;
      supplierIds.forEach(sid => {
        if (!bySupplier[sid]) bySupplier[sid] = { name: supplierNames[sid] || sid, products: 0, variants: 0 };
        bySupplier[sid].products++;
      });
    } else {
      productsWithoutSupplier++;
      orphanProductIds.push({ id: doc.id, name: name || doc.id });
    }
  });

  let variantsWithSupplier = 0, variantsWithoutSupplier = 0;
  const orphanVariantRefs = [];

  varSnap.forEach(doc => {
    const { supplierId, supplierName, supplier } = doc.data();
    const sid = supplierId || supplier;
    if (sid) {
      variantsWithSupplier++;
      if (!bySupplier[sid]) bySupplier[sid] = { name: supplierNames[sid] || supplierName || sid, products: 0, variants: 0 };
      bySupplier[sid].variants++;
    } else {
      variantsWithoutSupplier++;
      orphanVariantRefs.push(`${doc.ref.parent.parent.id}/${doc.id}`);
    }
  });

  const [prodCount, varCount] = await Promise.all([
    db.collection('products').count().get(),
    db.collectionGroup('variants').count().get(),
  ]);

  printReport({
    productsTotal: prodCount.data().count,
    variantsTotal: varCount.data().count,
    productsWithSupplier, productsWithoutSupplier,
    variantsWithSupplier, variantsWithoutSupplier,
    bySupplier, orphanProductIds, orphanVariantRefs,
    source: 'full-scan (Firestore con select)',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Report printer
// ─────────────────────────────────────────────────────────────────────────────
function printReport({
  productsTotal, variantsTotal,
  productsWithSupplier, productsWithoutSupplier,
  variantsWithSupplier, variantsWithoutSupplier,
  bySupplier, orphanProductIds, orphanVariantRefs,
  source,
}) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  POST-MIGRATION SUPPLIER COVERAGE AUDIT');
  console.log(`  Source: ${source}`);
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('📦 PRODUCTOS');
  console.log(`   Total:          ${productsTotal}`);
  console.log(`   Con supplier:   ${productsWithSupplier} ✅`);
  console.log(`   Sin supplier:   ${productsWithoutSupplier} ${productsWithoutSupplier === 0 ? '✅' : '❌'}`);

  console.log('\n🔬 VARIANTES');
  console.log(`   Total:          ${variantsTotal}`);
  console.log(`   Con supplier:   ${variantsWithSupplier} ✅`);
  console.log(`   Sin supplier:   ${variantsWithoutSupplier} ${variantsWithoutSupplier === 0 ? '✅' : '❌'}`);

  console.log('\n🏭 DISTRIBUCIÓN POR SUPPLIER');
  Object.entries(bySupplier || {})
    .sort((a, b) => b[1].products - a[1].products)
    .forEach(([sid, { name, products, variants }]) => {
      console.log(`   ${name.padEnd(25)} P:${String(products).padStart(4)}  V:${String(variants).padStart(4)}`);
    });

  if (orphanProductIds?.length > 0) {
    console.log('\n❌ Productos sin supplierIds[] (primeros 20):');
    orphanProductIds.slice(0, 20).forEach(p => {
      console.log(`   - ${p.id} → "${p.name}"`);
    });
    if (orphanProductIds.length > 20) console.log(`   ... y ${orphanProductIds.length - 20} más`);
  }

  if (orphanVariantRefs?.length > 0) {
    console.log(`\n❌ Variantes sin supplierId (primeras 20):`);
    orphanVariantRefs.slice(0, 20).forEach(ref => console.log(`   - ${ref}`));
    if (orphanVariantRefs.length > 20) console.log(`   ... y ${orphanVariantRefs.length - 20} más`);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

// ─────────────────────────────────────────────────────────────────────────────
const t0 = Date.now();
(FULL_SCAN ? auditFullScan() : auditFromMeta())
  .then(() => console.log(`Completed in ${((Date.now() - t0) / 1000).toFixed(2)}s\n`))
  .catch(err => { console.error('Fatal:', err); process.exit(1); });

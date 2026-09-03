#!/usr/bin/env node
/**
 * seed_meta_docs.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Genera (o regenera) los documentos `_meta/*` en Firestore desde cero.
 *
 * Los Cloud Functions triggers los mantienen actualizados automáticamente,
 * pero este script es necesario:
 *   1. La primera vez (bootstrap inicial)
 *   2. Cuando se despliegan los triggers en un proyecto nuevo
 *   3. Para forzar una recalculación manual tras migraciones masivas
 *
 * Docs generados:
 *   _meta/goals_coverage    → cobertura de goalIds[] en productos y variantes
 *   _meta/catalog_facets    → categorías, goals, formatos, suppliers con conteos
 *   _meta/supplier_coverage → cobertura de supplierIds[] / supplierId en variantes
 *
 * Estrategia eficiente:
 *   - count() para totales (0 docs descargados)
 *   - select() con field masks para GROUP BY (solo campos necesarios)
 *
 * Uso:
 *   node scripts/seed_meta_docs.mjs            → genera todos los docs
 *   node scripts/seed_meta_docs.mjs --dry-run  → muestra qué escribiría, no escribe
 *   node scripts/seed_meta_docs.mjs goals      → solo _meta/goals_coverage
 *   node scripts/seed_meta_docs.mjs facets     → solo _meta/catalog_facets
 *   node scripts/seed_meta_docs.mjs suppliers  → solo _meta/supplier_coverage
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8')
);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const DRY_RUN = process.argv.includes('--dry-run');
const TARGET = process.argv.find(a => ['goals', 'facets', 'suppliers'].includes(a)) || 'all';

const CANONICAL_GOALS = [
  'weight_loss_glp1', 'metabolic_health', 'anti_aging_longevity',
  'recovery_healing', 'cognitive_mood', 'hormonal_optimization',
  'fertility', 'immune_support', 'skin_hair_aesthetics',
  'performance_muscle', 'biomarkers', 'genomics', 'general_wellness',
];

const INACTIVE_STATUSES = new Set(['inactive', 'archived', 'draft', 'hidden']);

// ─────────────────────────────────────────────────────────────────────────────
// 1. GOALS COVERAGE
// ─────────────────────────────────────────────────────────────────────────────
async function seedGoalsCoverage() {
  console.log('\n📊 Calculando _meta/goals_coverage...');

  const [prodCountSnap, varCountSnap] = await Promise.all([
    db.collection('products').count().get(),
    db.collectionGroup('variants').count().get(),
  ]);
  const productsTotal = prodCountSnap.data().count;
  const variantsTotal = varCountSnap.data().count;

  console.log(`   count(): ${productsTotal} productos, ${variantsTotal} variantes`);

  const [prodSnap, varSnap] = await Promise.all([
    db.collection('products').select('goalIds').get(),
    db.collectionGroup('variants').select('goalIds').get(),
  ]);

  const byGoal = {};
  CANONICAL_GOALS.forEach(g => { byGoal[g] = { products: 0, variants: 0 }; });

  let productsWithoutGoals = 0;
  const nonCanonicalSet = new Set();

  prodSnap.forEach(doc => {
    const goals = doc.data().goalIds || [];
    if (goals.length === 0) { productsWithoutGoals++; return; }
    goals.forEach(g => {
      if (byGoal[g] !== undefined) byGoal[g].products++;
      else nonCanonicalSet.add(g);
    });
  });

  let variantsWithoutGoals = 0;
  varSnap.forEach(doc => {
    const goals = doc.data().goalIds || [];
    if (goals.length === 0) { variantsWithoutGoals++; return; }
    goals.forEach(g => {
      if (byGoal[g] !== undefined) byGoal[g].variants++;
    });
  });

  const payload = {
    updatedAt: FieldValue.serverTimestamp(),
    productsTotal,
    variantsTotal,
    productsWithoutGoals,
    variantsWithoutGoals,
    nonCanonicalValues: [...nonCanonicalSet].sort(),
    byGoal,
  };

  console.log(`   Productos sin goals: ${productsWithoutGoals}`);
  console.log(`   Variantes sin goals: ${variantsWithoutGoals}`);
  console.log(`   Valores no canónicos: ${[...nonCanonicalSet].join(', ') || 'ninguno ✅'}`);
  console.log('   Goals distribution:');
  Object.entries(byGoal).forEach(([g, { products, variants }]) => {
    console.log(`     ${g.padEnd(28)} P:${String(products).padStart(4)}  V:${String(variants).padStart(4)}`);
  });

  if (!DRY_RUN) {
    await db.collection('_meta').doc('goals_coverage').set(payload);
    console.log('   ✅ _meta/goals_coverage escrito');
  } else {
    console.log('   [DRY RUN] no escrito');
  }

  return payload;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CATALOG FACETS
// ─────────────────────────────────────────────────────────────────────────────
async function seedCatalogFacets() {
  console.log('\n🗂️  Calculando _meta/catalog_facets...');

  const [prodSnap, varSnap] = await Promise.all([
    db.collection('products')
      .select('categoryId', 'category', 'productType', 'goalIds', 'status', 'isActive')
      .get(),
    db.collectionGroup('variants')
      .select('formatId', 'format', 'presentation', 'supplierId', 'supplierName', 'supplier', 'isActive', 'status')
      .get(),
  ]);

  const activeProductIds = new Set();
  prodSnap.forEach(doc => {
    const { status, isActive } = doc.data();
    if (!INACTIVE_STATUSES.has(status) && isActive !== false) activeProductIds.add(doc.id);
  });

  const catCounts = {};
  const typeCounts = {};
  const goalCounts = {};
  prodSnap.forEach(doc => {
    if (!activeProductIds.has(doc.id)) return;
    const { categoryId, category, productType, goalIds } = doc.data();
    
    const cat = categoryId || category;
    if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;
    
    const pType = productType || 'finished_product';
    typeCounts[pType] = (typeCounts[pType] || 0) + 1;
    
    if (Array.isArray(goalIds)) goalIds.forEach(g => { goalCounts[g] = (goalCounts[g] || 0) + 1; });
  });

  const presCounts = {};
  const supplierMap = {};
  varSnap.forEach(doc => {
    const parentId = doc.ref.parent.parent.id;
    if (!activeProductIds.has(parentId)) return;
    const { formatId, format, presentation, supplierId, supplierName, supplier, isActive: vA, status: vS } = doc.data();
    if (vA === false || INACTIVE_STATUSES.has(vS)) return;

    const pres = presentation || formatId || format || 'vial';
    presCounts[pres] = (presCounts[pres] || 0) + 1;

    const sid = supplierId || supplier;
    const sname = supplierName || supplier || 'Unknown';
    if (sid) {
      if (!supplierMap[sid]) supplierMap[sid] = { count: 0, name: sname };
      supplierMap[sid].count++;
    }
  });

  const [prodCount, varCount] = await Promise.all([
    db.collection('products').count().get(),
    db.collectionGroup('variants').count().get(),
  ]);

  const toArr = obj => Object.entries(obj)
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count);

  const payload = {
    updatedAt: FieldValue.serverTimestamp(),
    totals: {
      products: prodCount.data().count,
      variants: varCount.data().count,
      activeProducts: activeProductIds.size,
    },
    productTypes: toArr(typeCounts),
    categories: toArr(catCounts),
    goals: toArr(goalCounts),
    formats: toArr(presCounts), // legacy format
    presentations: toArr(presCounts),
    suppliers: Object.entries(supplierMap)
      .map(([id, { count, name }]) => ({ id, name, count }))
      .sort((a, b) => b.count - a.count),
  };

  console.log(`   Activos: ${activeProductIds.size} productos`);
  console.log(`   Tipos: ${payload.productTypes.length}  Categorías: ${payload.categories.length}  Goals: ${payload.goals.length}  Presentations: ${payload.presentations.length}  Suppliers: ${payload.suppliers.length}`);

  if (!DRY_RUN) {
    await db.collection('_meta').doc('catalog_facets').set(payload);
    console.log('   ✅ _meta/catalog_facets escrito');
  } else {
    console.log('   [DRY RUN] no escrito');
  }

  return payload;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SUPPLIER COVERAGE
// ─────────────────────────────────────────────────────────────────────────────
async function seedSupplierCoverage() {
  console.log('\n🏭 Calculando _meta/supplier_coverage...');

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
      if (orphanProductIds.length < 100) orphanProductIds.push({ id: doc.id, name: name || doc.id });
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
      if (orphanVariantRefs.length < 100) {
        orphanVariantRefs.push(`${doc.ref.parent.parent.id}/${doc.id}`);
      }
    }
  });

  const [prodCount, varCount] = await Promise.all([
    db.collection('products').count().get(),
    db.collectionGroup('variants').count().get(),
  ]);

  const payload = {
    updatedAt: FieldValue.serverTimestamp(),
    productsTotal: prodCount.data().count,
    variantsTotal: varCount.data().count,
    productsWithSupplier,
    productsWithoutSupplier,
    variantsWithSupplier,
    variantsWithoutSupplier,
    bySupplier,
    orphanProductIds,
    orphanVariantRefs,
  };

  console.log(`   Productos: ${productsWithSupplier} con supplier, ${productsWithoutSupplier} sin ${productsWithoutSupplier === 0 ? '✅' : '❌'}`);
  console.log(`   Variantes: ${variantsWithSupplier} con supplier, ${variantsWithoutSupplier} sin ${variantsWithoutSupplier === 0 ? '✅' : '❌'}`);
  console.log(`   Suppliers activos: ${Object.keys(bySupplier).length}`);

  if (!DRY_RUN) {
    await db.collection('_meta').doc('supplier_coverage').set(payload);
    console.log('   ✅ _meta/supplier_coverage escrito');
  } else {
    console.log('   [DRY RUN] no escrito');
  }

  return payload;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  SEED _meta/* DOCUMENTS');
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : '🔴 LIVE WRITE'}`);
  console.log(`  Target: ${TARGET}`);
  console.log('══════════════════════════════════════════════════════');

  const t0 = Date.now();

  if (TARGET === 'all' || TARGET === 'goals')     await seedGoalsCoverage();
  if (TARGET === 'all' || TARGET === 'facets')    await seedCatalogFacets();
  if (TARGET === 'all' || TARGET === 'suppliers') await seedSupplierCoverage();

  console.log(`\n══════════════════════════════════════════════════════`);
  console.log(`  Completed in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  if (DRY_RUN) console.log('  [DRY RUN] — No changes written to Firestore.');
  console.log('══════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n❌ Fatal:', err);
  process.exit(1);
});

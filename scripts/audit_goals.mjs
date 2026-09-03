#!/usr/bin/env node
/**
 * audit_goals.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Muestra la cobertura de goalIds[] leyendo desde `_meta/goals_coverage`.
 *
 * Antes: descargaba 611 productos + 782 variantes (~1.400 lecturas, ~3 min)
 * Ahora: 1 sola lectura Firestore, <200ms
 *
 * Los Cloud Functions triggers mantienen el doc actualizado automáticamente.
 * Para forzar una recalculación manual:
 *   node scripts/seed_meta_docs.mjs goals
 *
 * Uso:
 *   node scripts/audit_goals.mjs              → lectura normal desde _meta
 *   node scripts/audit_goals.mjs --full-scan  → fuerza re-cálculo desde Firestore
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

const CANONICAL_GOALS = [
  'weight_loss_glp1', 'metabolic_health', 'anti_aging_longevity',
  'recovery_healing', 'cognitive_mood', 'hormonal_optimization',
  'fertility', 'immune_support', 'skin_hair_aesthetics',
  'performance_muscle', 'biomarkers', 'genomics', 'general_wellness',
];

// ─────────────────────────────────────────────────────────────────────────────
// Fast path: lee _meta/goals_coverage (1 lectura)
// ─────────────────────────────────────────────────────────────────────────────
async function auditFromMeta() {
  const metaDoc = await db.collection('_meta').doc('goals_coverage').get();

  if (!metaDoc.exists) {
    console.warn('⚠️  _meta/goals_coverage no existe. Generando con full-scan...');
    return auditFullScan();
  }

  const data = metaDoc.data();
  const updatedAt = data.updatedAt?.toDate?.()?.toISOString() ?? 'unknown';

  printReport({
    productsTotal:        data.productsTotal ?? 0,
    variantsTotal:        data.variantsTotal ?? 0,
    productsWithoutGoals: data.productsWithoutGoals ?? 0,
    variantsWithoutGoals: data.variantsWithoutGoals ?? 0,
    nonCanonicalValues:   data.nonCanonicalValues ?? [],
    byGoal:               data.byGoal ?? {},
    source: `_meta/goals_coverage (updated: ${updatedAt})`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Full scan: recalcula desde Firestore (para comparación o debug)
// ─────────────────────────────────────────────────────────────────────────────
async function auditFullScan() {
  console.log('\n⚡ Modo full-scan — leyendo todos los documentos...\n');

  const [prodCountSnap, varCountSnap] = await Promise.all([
    db.collection('products').count().get(),
    db.collectionGroup('variants').count().get(),
  ]);
  const productsTotal = prodCountSnap.data().count;
  const variantsTotal = varCountSnap.data().count;

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
    goals.forEach(g => { if (byGoal[g] !== undefined) byGoal[g].variants++; });
  });

  printReport({
    productsTotal, variantsTotal, productsWithoutGoals, variantsWithoutGoals,
    nonCanonicalValues: [...nonCanonicalSet].sort(),
    byGoal,
    source: 'full-scan (Firestore)',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Report printer
// ─────────────────────────────────────────────────────────────────────────────
function printReport({ productsTotal, variantsTotal, productsWithoutGoals, variantsWithoutGoals, nonCanonicalValues, byGoal, source }) {
  const SEP = '══════════════════════════════════════════════════════════════════════';

  console.log(`\n${SEP}`);
  console.log('GOALS COVERAGE AUDIT');
  console.log(`Source: ${source}`);
  console.log(`${SEP}\n`);

  console.log('──────────────────────────────────────────────────────────────────────');
  console.log('PRODUCT-LEVEL GOALS SUMMARY');
  console.log('──────────────────────────────────────────────────────────────────────');
  console.log(`  Products total:            ${productsTotal}`);
  console.log(`  Products WITH goalIds[]:   ${productsTotal - productsWithoutGoals}`);
  console.log(`  Products WITH NO GOALS:    ${productsWithoutGoals} ${productsWithoutGoals === 0 ? '✅' : '❌'}`);

  console.log('\n──────────────────────────────────────────────────────────────────────');
  console.log('VARIANT-LEVEL GOALS SUMMARY');
  console.log('──────────────────────────────────────────────────────────────────────');
  console.log(`  Total variants:            ${variantsTotal}`);
  console.log(`  Variants WITH goalIds[]:   ${variantsTotal - variantsWithoutGoals}`);
  console.log(`  Variants WITH NO GOALS:    ${variantsWithoutGoals} ${variantsWithoutGoals === 0 ? '✅' : '❌'}`);

  console.log('\n──────────────────────────────────────────────────────────────────────');
  console.log('UNIQUE goalIds VALUES — PRODUCTS');
  console.log('──────────────────────────────────────────────────────────────────────');
  Object.entries(byGoal)
    .sort((a, b) => b[1].products - a[1].products)
    .forEach(([g, { products }]) => {
      const isCanon = CANONICAL_GOALS.includes(g);
      console.log(`  ${isCanon ? '✅' : '⚠️ '} "${g}" → ${products} products`);
    });

  console.log('\n──────────────────────────────────────────────────────────────────────');
  console.log('UNIQUE goalIds VALUES — VARIANTS');
  console.log('──────────────────────────────────────────────────────────────────────');
  Object.entries(byGoal)
    .sort((a, b) => b[1].variants - a[1].variants)
    .forEach(([g, { variants }]) => {
      const isCanon = CANONICAL_GOALS.includes(g);
      console.log(`  ${isCanon ? '✅' : '⚠️ '} "${g}" → ${variants} variants`);
    });

  console.log('\n──────────────────────────────────────────────────────────────────────');
  console.log('CANONICAL GOALS COVERAGE CHECK');
  console.log('──────────────────────────────────────────────────────────────────────');
  console.log(`  Canonical goals defined: ${CANONICAL_GOALS.length}`);
  console.log(`  Non-canonical values found: ${nonCanonicalValues.length}`);
  if (nonCanonicalValues.length > 0) {
    nonCanonicalValues.forEach(v => console.log(`    ⚠️  "${v}"`));
  }

  console.log(`\n${SEP}`);
  console.log('AUDIT COMPLETE');
  console.log(`${SEP}\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
const t0 = Date.now();
(FULL_SCAN ? auditFullScan() : auditFromMeta())
  .then(() => console.log(`Completed in ${((Date.now() - t0) / 1000).toFixed(2)}s\n`))
  .catch(err => { console.error('Fatal:', err); process.exit(1); });

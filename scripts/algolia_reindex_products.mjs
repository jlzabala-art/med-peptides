#!/usr/bin/env node
/**
 * algolia_reindex_products.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Re-indexa los 611 productos en Algolia incluyendo el nuevo campo goalIds[].
 *
 * Lee desde Firestore con select() (field masks) para mínima transferencia de datos.
 * Usa saveObjects() en lotes de 1000 (límite de Algolia).
 *
 * Uso:
 *   node scripts/algolia_reindex_products.mjs            → re-indexa todo
 *   node scripts/algolia_reindex_products.mjs --dry-run  → muestra payload, no escribe
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { algoliasearch } from 'algoliasearch';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env vars (ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

const DRY_RUN = process.argv.includes('--dry-run');

// ── Firebase Admin ────────────────────────────────────────────────────────────
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8')
);
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

// ── Algolia ───────────────────────────────────────────────────────────────────
const APP_ID   = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const INDEX_NAME = 'products';

if (!APP_ID || !ADMIN_KEY) {
  console.error('❌ Missing ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY in .env / .env.local');
  process.exit(1);
}

const client = algoliasearch(APP_ID, ADMIN_KEY);

// ── Field mask — only what Algolia needs ──────────────────────────────────────
const FIELDS = [
  'name', 'slug', 'tier', 'tags', 'description',
  'goalIds', 'categoryId', 'category',
  'supplierIds', 'suppliersCount', 'supplier',
  'status', 'isActive', 'active',
  'sku', 'dosage', 'warehouse', 'stock',
  'healthScore', 'hasCoa', 'registrationStatus',
];

function toAlgoliaRecord(id, data) {
  return {
    objectID: id,
    name: data.name || '',
    // ── Faceting ──────────────────────────────────────────────────────────
    goalIds:        data.goalIds || [],
    categoryId:     data.categoryId || data.category || '',
    category:       data.category || '',
    supplierIds:    data.supplierIds || (data.supplier ? [data.supplier] : []),
    suppliersCount: data.suppliersCount ?? (data.supplierIds?.length ?? 0),
    status:         data.status || 'published',
    isActive:       data.isActive !== undefined ? data.isActive : (data.active !== undefined ? data.active : true),
    // ── Search ────────────────────────────────────────────────────────────
    slug:              data.slug || '',
    tier:              data.tier || '',
    tags:              data.tags || [],
    description_short: data.description ? data.description.substring(0, 200) : '',
    // ── Admin ─────────────────────────────────────────────────────────────
    sku:                data.sku || '',
    supplier:           data.supplier || '',
    dosage:             data.dosage || '',
    warehouse:          data.warehouse || '',
    stock:              data.stock || 0,
    healthScore:        data.healthScore ?? null,
    hasCoa:             data.hasCoa ?? null,
    registrationStatus: data.registrationStatus || null,
  };
}

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

async function main() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  ALGOLIA PRODUCTS RE-INDEX');
  console.log(`  Index: ${INDEX_NAME}`);
  console.log(`  Mode:  ${DRY_RUN ? 'DRY RUN' : '🔴 LIVE WRITE'}`);
  console.log('══════════════════════════════════════════════════════\n');

  const t0 = Date.now();

  // Read from Firestore with field masks
  console.log('📥 Leyendo productos desde Firestore (select)...');
  const snap = await db.collection('products').select(...FIELDS).get();
  console.log(`   ${snap.size} productos leídos`);

  const records = [];
  snap.forEach(doc => {
    records.push(toAlgoliaRecord(doc.id, doc.data()));
  });

  // Stats
  const withGoals    = records.filter(r => r.goalIds.length > 0).length;
  const withSupplier = records.filter(r => r.supplierIds.length > 0).length;
  const active       = records.filter(r => r.isActive).length;

  console.log(`\n📊 Stats del payload:`);
  console.log(`   Con goalIds[]:     ${withGoals}/${records.length}`);
  console.log(`   Con supplierIds[]: ${withSupplier}/${records.length}`);
  console.log(`   isActive=true:     ${active}/${records.length}`);

  // Preview first record
  if (DRY_RUN) {
    console.log('\n[DRY RUN] Primer record:');
    console.log(JSON.stringify(records[0], null, 2));
    console.log(`\n[DRY RUN] Total records que se indexarían: ${records.length}`);
    return;
  }

  // Batch upload to Algolia (chunks of 1000)
  console.log(`\n📤 Subiendo ${records.length} records a Algolia en lotes de 1000...`);
  const batches = chunk(records, 1000);

  let indexed = 0;
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    await client.saveObjects({ indexName: INDEX_NAME, objects: batch });
    indexed += batch.length;
    console.log(`   Lote ${i + 1}/${batches.length} — ${indexed} records enviados`);
  }

  console.log(`\n✅ Re-indexación completa: ${indexed} productos en ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log('\n⚠️  Próximo paso manual en Algolia Dashboard:');
  console.log('   → Índice "products" → Configuration → Facets');
  console.log('   → Añadir como "Attributes for Faceting":');
  console.log('     goalIds, categoryId, supplierIds, status, isActive, hasCoa');
  console.log('══════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n❌ Fatal:', err);
  process.exit(1);
});

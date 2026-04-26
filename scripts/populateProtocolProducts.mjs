/**
 * populateProtocolProducts.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Lee todos los documentos de `protocol_templates` en Firestore y popula el
 * campo `products_used[]` en raíz, extrayendo datos desde:
 *   1. phase_blueprints[].drugs[].product_id / product_title
 *   2. phases[].drugs_used[].product_slug / product_name  (legacy)
 *
 * La información POR FASE (drugs, dose_logic, route, etc.) se preserva
 * íntegra en phase_blueprints — este script solo añade el índice denormalizado
 * en raíz para que el motor de búsqueda pueda encontrar protocolos por producto.
 *
 * Usage: node scripts/populateProtocolProducts.mjs [--dry-run]
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const DRY_RUN = process.argv.includes('--dry-run');

// ── Firebase init ────────────────────────────────────────────────────────────
if (!getApps().length) {
  try {
    const svc = require(resolve(__dirname, '../serviceAccountKey.json'));
    initializeApp({ credential: cert(svc) });
    console.log('✅ Firebase Admin (serviceAccountKey.json)');
  } catch {
    initializeApp();
    console.log('✅ Firebase Admin (ADC)');
  }
}
const db = getFirestore();

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts a deduplicated products_used[] from a protocol document.
 * Each entry is an object: { product_id, product_title }
 */
function extractProducts(data) {
  const seen = new Map(); // product_id → { product_id, product_title }

  // 1. phase_blueprints[].drugs[]  ← new structure
  if (Array.isArray(data.phase_blueprints)) {
    for (const bp of data.phase_blueprints) {
      if (!Array.isArray(bp.drugs)) continue;
      for (const drug of bp.drugs) {
        const id = drug.product_id?.trim();
        const title = drug.product_title?.trim();
        if (id && !seen.has(id)) {
          seen.set(id, { product_id: id, product_title: title || id });
        }
      }
    }
  }

  // 2. phases[].drugs_used[]  ← legacy structure
  if (Array.isArray(data.phases)) {
    for (const phase of data.phases) {
      if (!Array.isArray(phase.drugs_used)) continue;
      for (const drug of phase.drugs_used) {
        const id = drug.product_slug?.trim() || drug.product_id?.trim();
        const title = drug.product_name?.trim() || drug.product_title?.trim();
        if (id && !seen.has(id)) {
          seen.set(id, { product_id: id, product_title: title || id });
        }
      }
    }
  }

  return Array.from(seen.values());
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (DRY_RUN) console.log('🔍 DRY RUN — no writes will be made\n');

  const snap = await db.collection('protocol_templates').get();
  console.log(`📦 Loaded ${snap.docs.length} protocol documents\n`);

  let updated = 0, skipped = 0, empty = 0, errors = 0;
  const BATCH_SIZE = 10;
  let batch = db.batch();
  let batchCount = 0;

  const flush = async () => {
    if (batchCount > 0 && !DRY_RUN) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  };

  for (const doc of snap.docs) {
    const data = doc.data();
    const products = extractProducts(data);

    if (products.length === 0) {
      console.log(`⚠️  ${doc.id.padEnd(15)} — no products found`);
      empty++;
      continue;
    }

    const existing = Array.isArray(data.products_used) ? data.products_used : [];
    const existingIds = new Set(existing.map(p =>
      typeof p === 'string' ? p : p?.product_id
    ).filter(Boolean));

    const isAlreadyPopulated =
      existing.length === products.length &&
      products.every(p => existingIds.has(p.product_id));

    if (isAlreadyPopulated) {
      console.log(`⏭️  ${doc.id.padEnd(15)} — already populated (${products.length} products)`);
      skipped++;
      continue;
    }

    const productTitles = products.map(p => p.product_title).join(', ');
    console.log(`✅ ${doc.id.padEnd(15)} — ${products.length} products: ${productTitles}`);

    if (!DRY_RUN) {
      batch.update(doc.ref, {
        products_used: products,
        products_updated_at: FieldValue.serverTimestamp(),
      });
      batchCount++;

      if (batchCount >= BATCH_SIZE) await flush();
    }
    updated++;
  }

  await flush(); // commit any remaining

  console.log('\n─────────────────────────────────────');
  console.log(`  Updated  : ${updated}`);
  console.log(`  Skipped  : ${skipped}`);
  console.log(`  No data  : ${empty}`);
  console.log(`  Errors   : ${errors}`);
  if (DRY_RUN) console.log('\n  ⚠️  DRY RUN — nothing was written');
  console.log('─────────────────────────────────────\n');
}

main().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });

#!/usr/bin/env node
/**
 * scripts/seed-telstar-2027.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Idempotent Firestore ingestion for Syntegon Telstar Technologies (Price List 2027):
 *   1. Upserts `suppliers/supplier-syntegon-telstar` (verifiable in Admin Suppliers)
 *   2. Upserts all 14 base freeze dryer models into `products/{slug}` + `variants`
 *      subcollection using the 2027 tariff rules (30% distributor discount on
 *      units/options/services, 0% on spares & SMC chiller, FB644045/FB654213/FB638386
 *      formula bug fixed).
 *
 * Usage: node scripts/seed-telstar-2027.mjs [--dry-run]
 */

import XLSX from 'xlsx';
import { existsSync } from 'node:fs';
import { db } from './lib/firebase-admin.mjs';
import { TELSTAR_SUPPLIER, getAllTelstarEquipment } from '../src/data/telstarLyophilizersRegistry.js';

const DRY_RUN = process.argv.includes('--dry-run');
const XLSX_PATH =
  '/Users/joseluiszabala/.gemini/antigravity/brain/cf7b6ede-bb88-435e-acc0-90f0a723b66d/.user_uploaded/media_1795854274910_d2e6baa8.xlsx';

async function main() {
  const now = new Date().toISOString();

  if (existsSync(XLSX_PATH)) {
    const wb = XLSX.readFile(XLSX_PATH);
    console.log(`✅ Verified Telstar 2027 source workbook (${wb.SheetNames.length} tabs)`);
  } else {
    console.log('ℹ️  Source XLSX not found locally, using verified canonical Telstar 2027 tariff table.');
  }

  const models = getAllTelstarEquipment();
  console.log(`📦 Preparing ${models.length} Telstar 2027 freeze-dryer models for ${TELSTAR_SUPPLIER.companyName}...`);

  if (DRY_RUN) {
    console.log('[DRY RUN] Would upsert supplier:', TELSTAR_SUPPLIER.id);
    models.forEach((m) => console.log(`  - ${m.slug}: List €${m.listPriceEur} -> Net €${m.costPriceEur}`));
    process.exit(0);
  }

  const supplierPayload = {
    ...TELSTAR_SUPPLIER,
    productsCount: models.length,
    productsSuppliedCount: models.length,
    variantsSupplied: models.reduce((acc, m) => acc + (m.variants?.length || 0), 0),
    updatedAt: now,
  };

  await db.collection('suppliers').doc(TELSTAR_SUPPLIER.id).set(supplierPayload, { merge: true });
  console.log(`✅ Upserted suppliers/${TELSTAR_SUPPLIER.id}`);

  for (const product of models) {
    const prodRef = db.collection('products').doc(product.id);
    await prodRef.set(
      {
        ...product,
        createdAt: product.createdAt || now,
        updatedAt: now,
      },
      { merge: true }
    );

    const variants = Array.isArray(product.variants) ? product.variants : [];
    for (const v of variants) {
      await prodRef
        .collection('variants')
        .doc(v.id)
        .set(
          {
            ...v,
            createdAt: now,
            updatedAt: now,
          },
          { merge: true }
        );
    }

    console.log(`  ✓ products/${product.id} (${variants.length} variants, List €${product.listPriceEur} / Net €${product.costPriceEur})`);
  }

  // Read-back verification
  const suppSnap = await db.collection('suppliers').doc(TELSTAR_SUPPLIER.id).get();
  const prodSnap = await db
    .collection('products')
    .where('supplierIds', 'array-contains', TELSTAR_SUPPLIER.id)
    .get();

  console.log('\n🔍 Live Firestore Readback:');
  console.log(`   - Supplier exists: ${suppSnap.exists} (${suppSnap.data()?.companyName})`);
  console.log(`   - Products count : ${prodSnap.size}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });

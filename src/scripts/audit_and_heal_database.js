/**
 * audit_and_heal_database.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Normalizes categories, heals unpopulated order statuses, generates variant
 * previews on root documents, and precomputes server-side facet metadata
 * in _meta/catalog_facets and _meta/orders_facets.
 *
 * Usage:
 *   node src/scripts/audit_and_heal_database.js --dry-run
 *   node src/scripts/audit_and_heal_database.js --execute
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const isDryRun = !process.argv.includes('--execute');

if (!getApps().length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccount-target.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp();
  }
}

const db = getFirestore();

// Standard Category Mapping (Rule #28 & Golden Rules)
const CATEGORY_MAP = {
  'Cardiovascular & Metabolic': 'metabolic',
  'Hormone Optimization': 'hormone',
  'peptide': 'peptide',
  'raw_material': 'raw_material',
  'api_raw_material': 'raw_material',
  'supplement': 'supplement',
  'genetic_test': 'diagnostic',
  'diagnostic_test': 'diagnostic',
  'nutricosmetics': 'nutricosmetics',
  'excipient_vehicle': 'excipient_vehicle',
  'medical_device_consumable': 'clinical_supplies',
  'clinical_supplies': 'clinical_supplies',
  'logistics_service': 'logistics_service',
  'service': 'service',
  'skincare': 'skincare',
  'weight_loss': 'metabolic',
  'hormone': 'hormone'
};

async function healDatabase() {
  console.log(`\n======================================================`);
  console.log(`🛠️ DATABASE AUDIT & HEALING SCRIPT`);
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (No writes)' : '⚡ LIVE EXECUTION'}`);
  console.log(`======================================================\n`);

  const now = new Date();

  // ── 1. Heal & Normalize Products ──────────────────────────────────────────
  console.log(`📦 [1/3] Auditing and Healing 'products' collection...`);
  const prodSnap = await db.collection('products').get();
  let normalizedCatsCount = 0;
  let variantsEnrichedCount = 0;

  const catalogFacets = {
    totalProducts: prodSnap.size,
    totalActive: 0,
    totalInStock: 0,
    totalPens: 0,
    byCategory: {},
    byType: {},
    updatedAt: now.toISOString()
  };

  for (const doc of prodSnap.docs) {
    const data = doc.data();
    const updates = {};

    // Standardize Category
    const rawCat = data.category || 'peptide';
    const canonicalCat = CATEGORY_MAP[rawCat] || rawCat.toLowerCase().replace(/\s+/g, '_');
    if (data.category !== canonicalCat) {
      updates.category = canonicalCat;
      normalizedCatsCount++;
    }

    // Standardize Status (Rule #28)
    const validProdStatuses = ['draft', 'published', 'out of stock', 'hidden', 'archived', 'active', 'inactive'];
    const currentStatus = (data.status || 'active').toLowerCase();
    const canonicalStatus = currentStatus === 'in stock' ? 'published' : validProdStatuses.includes(currentStatus) ? currentStatus : 'active';
    if (data.status !== canonicalStatus) {
      updates.status = canonicalStatus;
    }

    if (canonicalStatus === 'active' || canonicalStatus === 'published') {
      catalogFacets.totalActive++;
    }

    // Check Variants subcollection if root variants array is empty
    let rootVariants = Array.isArray(data.variants) ? data.variants : [];
    if (rootVariants.length === 0) {
      const varSnap = await doc.ref.collection('variants').get();
      if (!varSnap.empty) {
        rootVariants = varSnap.docs.map(v => ({ id: v.id, ...v.data() }));
        updates.variants = rootVariants;
        variantsEnrichedCount++;
      }
    }

    // Track Pens and Stock
    const hasPenFormat = (data.format && (data.format.includes('pen') || data.format.includes('cartridge'))) ||
                         rootVariants.some(v => v.format && (v.format.includes('pen') || v.format.includes('cartridge')));
    if (hasPenFormat) {
      catalogFacets.totalPens++;
    }

    const isInStock = data.inStock !== false && (rootVariants.length === 0 || rootVariants.some(v => v.inStock !== false));
    if (isInStock) {
      catalogFacets.totalInStock++;
    }

    // Aggregates
    catalogFacets.byCategory[canonicalCat] = (catalogFacets.byCategory[canonicalCat] || 0) + 1;
    const pType = data.productType || data.type || 'finished_product';
    catalogFacets.byType[pType] = (catalogFacets.byType[pType] || 0) + 1;

    if (Object.keys(updates).length > 0 && !isDryRun) {
      await doc.ref.update({ ...updates, updatedAt: now });
    }
  }

  console.log(`   - Normalized Categories: ${normalizedCatsCount}`);
  console.log(`   - Root Variant Summaries Synced: ${variantsEnrichedCount}`);
  console.log(`   - Active Products: ${catalogFacets.totalActive} / In-Stock: ${catalogFacets.totalInStock} / Pens: ${catalogFacets.totalPens}`);

  // ── 2. Heal & Normalize Orders ────────────────────────────────────────────
  console.log(`\n📋 [2/3] Auditing and Healing 'orders' collection...`);
  const orderSnap = await db.collection('orders').get();
  let healedOrdersCount = 0;

  const ordersFacets = {
    totalOrders: orderSnap.size,
    pendingProcessing: 0,
    deliveredCompleted: 0,
    totalRevenueUSD: 0,
    byStatus: {},
    updatedAt: now.toISOString()
  };

  for (const doc of orderSnap.docs) {
    const data = doc.data();
    const updates = {};

    let canonicalStatus = (data.status || '').toLowerCase().trim();
    if (!canonicalStatus || canonicalStatus === 'unknown') {
      // Heal unknown status based on payment or dates
      if (data.isPaid || data.paymentStatus === 'paid') {
        canonicalStatus = 'processing';
      } else {
        canonicalStatus = 'pending';
      }
      updates.status = canonicalStatus;
      healedOrdersCount++;
    }

    const totalAmount = Number(data.total || data.grandTotal || data.totalAmount || data.amount || 0);
    ordersFacets.totalRevenueUSD += totalAmount;

    if (['pending', 'processing', 'en tránsito', 'awaiting payment', 'draft'].includes(canonicalStatus)) {
      ordersFacets.pendingProcessing++;
    } else if (['delivered', 'completed'].includes(canonicalStatus)) {
      ordersFacets.deliveredCompleted++;
    }

    ordersFacets.byStatus[canonicalStatus] = (ordersFacets.byStatus[canonicalStatus] || 0) + 1;

    if (Object.keys(updates).length > 0 && !isDryRun) {
      await doc.ref.update({ ...updates, updatedAt: now });
    }
  }

  ordersFacets.totalRevenueUSD = parseFloat(ordersFacets.totalRevenueUSD.toFixed(2));

  console.log(`   - Healed Orders: ${healedOrdersCount}`);
  console.log(`   - Pending / Processing: ${ordersFacets.pendingProcessing}`);
  console.log(`   - Delivered / Completed: ${ordersFacets.deliveredCompleted}`);
  console.log(`   - Total Revenue Tracked: $${ordersFacets.totalRevenueUSD.toLocaleString()} USD`);

  // ── 3. Save Precomputed Server Facets (_meta/*_facets) ────────────────────
  console.log(`\n⚡ [3/3] Saving Facet Metadata Snapshots to '_meta'...`);
  if (!isDryRun) {
    await db.collection('_meta').doc('catalog_facets').set(catalogFacets, { merge: true });
    await db.collection('_meta').doc('orders_facets').set(ordersFacets, { merge: true });
  }

  console.log(`\n======================================================`);
  console.log(`✅ DATABASE HEALING & FACETS SNAPSHOT COMPLETED`);
  console.log(`======================================================\n`);
}

healDatabase().catch(err => {
  console.error('Error healing database:', err);
  process.exit(1);
});

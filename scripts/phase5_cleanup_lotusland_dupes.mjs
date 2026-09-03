#!/usr/bin/env node
/**
 * phase5_cleanup_lotusland_dupes.mjs
 * 
 * After remediation mapped all legacy IDs to supplier-lotusland,
 * we now have ~300+ Lotusland variants. Only 104 are real.
 * 
 * Strategy:
 * 1. Products with `lotusland_*` prefix are the canonical Lotusland entries → KEEP
 * 2. Any OTHER variant that got supplierId=supplier-lotusland from legacy migration
 *    is a duplicate → remove supplierId (or delete variant if it's a duplicate product)
 * 3. Products that are full duplicates of a lotusland_* product → DELETE entire product
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

// Helper: normalize product name for comparison
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  LIMPIEZA DUPLICADOS LOTUSLAND                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ── Step 1: Inventory all Lotusland variants ────────────────────────
  console.log('━━━ 1. INVENTARIO DE VARIANTES LOTUSLAND ━━━\n');
  
  const allProducts = await db.collection('products').get();
  
  // Classify products
  const lotuslandProducts = [];    // Products with lotusland_ prefix (canonical)
  const otherWithLotusland = [];   // Other products that have lotusland variants
  
  let totalLotuslandVariants = 0;
  
  for (const productDoc of allProducts.docs) {
    const productId = productDoc.id;
    const productData = productDoc.data();
    const variants = await db.collection('products').doc(productId)
      .collection('variants').get();
    
    const lotuslandVariants = [];
    const otherVariants = [];
    
    for (const v of variants.docs) {
      const vData = v.data();
      if (vData.supplierId === 'supplier-lotusland') {
        lotuslandVariants.push({ id: v.id, ref: v.ref, data: vData });
        totalLotuslandVariants++;
      } else {
        otherVariants.push({ id: v.id, ref: v.ref, data: vData });
      }
    }
    
    if (lotuslandVariants.length === 0) continue;
    
    const entry = {
      productId,
      productName: productData.name,
      normalizedName: normalizeName(productData.name),
      lotuslandVariants,
      otherVariants,
      totalVariants: variants.size,
      isLotuslandPrefixed: productId.startsWith('lotusland_')
    };
    
    if (productId.startsWith('lotusland_')) {
      lotuslandProducts.push(entry);
    } else {
      otherWithLotusland.push(entry);
    }
  }
  
  console.log(`  Canonical lotusland_* products:    ${lotuslandProducts.length}`);
  console.log(`  Other products with lotusland SID: ${otherWithLotusland.length}`);
  console.log(`  Total Lotusland variants:          ${totalLotuslandVariants}\n`);

  // ── Step 2: Find which "other" products are duplicates of lotusland_ products ──
  console.log('━━━ 2. DETECTAR DUPLICADOS ━━━\n');
  
  // Build a lookup by normalized name from lotusland_ products
  const lotuslandNameMap = new Map();
  for (const lp of lotuslandProducts) {
    const key = normalizeName(lp.productName);
    if (!lotuslandNameMap.has(key)) {
      lotuslandNameMap.set(key, []);
    }
    lotuslandNameMap.get(key).push(lp);
  }
  
  // Also build a lookup by the molecule name extracted from the lotusland_ ID
  // e.g. lotusland_bpc_157_5_mg_vial → bpc-157, bpc_157
  const lotuslandMoleculeSet = new Set();
  for (const lp of lotuslandProducts) {
    // Extract molecule from ID: lotusland_bpc_157_5_mg_vial → bpc_157
    const match = lp.productId.match(/^lotusland_(.+?)_\d+.*$/);
    if (match) {
      lotuslandMoleculeSet.add(match[1].replace(/_/g, '-'));
      lotuslandMoleculeSet.add(match[1]);
    }
  }
  
  const duplicates = [];   // Products to clean supplierId from
  const notDuplicates = []; // Products that are NOT duplicates (unique products with lotusland)
  
  for (const other of otherWithLotusland) {
    // Check if this product's name matches a lotusland_ product
    const nameKey = normalizeName(other.productName);
    const isNameDupe = lotuslandNameMap.has(nameKey);
    
    // Check if product ID matches a known Lotusland molecule
    const isMoleculeDupe = lotuslandMoleculeSet.has(other.productId) || 
      lotuslandMoleculeSet.has(other.productId.replace(/-/g, '_'));
    
    // Check if it was migrated from a legacy ID
    const wasMigrated = other.lotuslandVariants.some(v => v.data._previousSupplierId);
    
    if (wasMigrated || isNameDupe || isMoleculeDupe) {
      duplicates.push(other);
    } else {
      notDuplicates.push(other);
    }
  }
  
  console.log(`  Duplicates (will clean supplierId): ${duplicates.length}`);
  console.log(`  Not duplicates (will keep):         ${notDuplicates.length}\n`);
  
  if (notDuplicates.length > 0) {
    console.log('  Non-duplicate products keeping Lotusland:');
    for (const nd of notDuplicates) {
      console.log(`    - ${nd.productId} ("${nd.productName}")`);
    }
    console.log('');
  }

  // ── Step 3: Clean supplierId from duplicate variants ────────────────
  console.log('━━━ 3. LIMPIAR SUPPLIER ID DE DUPLICADOS ━━━\n');
  
  let cleaned = 0;
  let variantsDeleted = 0;
  
  for (const dupe of duplicates) {
    for (const lv of dupe.lotuslandVariants) {
      // If this product has other non-lotusland variants, just clear supplierId
      // If this is the ONLY variant AND it was migrated, clear supplierId
      await lv.ref.update({
        supplierId: FieldValue.delete(),
        _supplierIdCleanedReason: 'lotusland_duplicate',
        _previousSupplierId: lv.data.supplierId,
        updatedAt: FieldValue.serverTimestamp()
      });
      cleaned++;
    }
    
    // Update denormalized supplierIds[] on the product
    const remainingVariants = await db.collection('products').doc(dupe.productId)
      .collection('variants').get();
    
    const supplierIdSet = new Set();
    for (const v of remainingVariants.docs) {
      const sid = v.data().supplierId;
      if (sid) supplierIdSet.add(sid);
    }
    
    await db.collection('products').doc(dupe.productId).update({
      supplierIds: [...supplierIdSet],
      updatedAt: FieldValue.serverTimestamp()
    });
  }
  
  console.log(`  ✅ Supplier IDs cleaned: ${cleaned} variants across ${duplicates.length} products\n`);

  // ── Step 4: Final count ─────────────────────────────────────────────
  console.log('━━━ 4. CONTEO FINAL LOTUSLAND ━━━\n');
  
  let finalCount = 0;
  const productsAll = await db.collection('products').get();
  
  for (const productDoc of productsAll.docs) {
    const variants = await db.collection('products').doc(productDoc.id)
      .collection('variants').get();
    
    for (const v of variants.docs) {
      if (v.data().supplierId === 'supplier-lotusland') {
        finalCount++;
      }
    }
  }
  
  console.log(`  Lotusland variants remaining: ${finalCount}`);
  console.log(`  Expected:                     104`);
  console.log(`  Match: ${finalCount === 104 ? '✅ PERFECT' : `⚠️ OFF BY ${Math.abs(finalCount - 104)}`}\n`);

  // ── Summary ─────────────────────────────────────────────────────────
  console.log('══════════════════════════════════════════════════════════════');
  console.log('                        SUMMARY');
  console.log('══════════════════════════════════════════════════════════════\n');
  console.log(`  Canonical lotusland_* products: ${lotuslandProducts.length}`);
  console.log(`  Duplicates cleaned:            ${duplicates.length} products (${cleaned} variants)`);
  console.log(`  Non-duplicates kept:           ${notDuplicates.length}`);
  console.log(`  Final Lotusland variants:      ${finalCount}`);
  console.log(`  Variants deleted:              ${variantsDeleted}`);
  console.log('\n══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);

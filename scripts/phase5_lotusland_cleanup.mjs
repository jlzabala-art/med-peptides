#!/usr/bin/env node
/**
 * phase5_lotusland_cleanup.mjs
 * 
 * Strategy: Use lotus_variants_final.json as the source of truth.
 * The 104 entries with "var_*" prefix are the CANONICAL Lotusland variants.
 * Everything else in Firestore with supplierId=supplier-lotusland that
 * does NOT match one of these 104 IDs is a duplicate and should be deleted.
 * 
 * Usage:
 *   node scripts/phase5_lotusland_cleanup.mjs           # DRY RUN (report only)
 *   node scripts/phase5_lotusland_cleanup.mjs --commit   # ACTUALLY DELETE duplicates
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv.includes('--commit');

// ── Init Firebase ────────────────────────────────────────────────
const sa = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

// ── Load Master ──────────────────────────────────────────────────
const masterPath = resolve(__dirname, '..', 'lotus_variants_final.json');
const masterData = JSON.parse(readFileSync(masterPath, 'utf8'));

// The canonical 104: only var_* prefixed IDs
const canonicalIds = new Set(
  masterData
    .filter(e => e.id.startsWith('var_'))
    .map(e => e.id)
);

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  LOTUSLAND CLEANUP — Master-Based Deduplication            ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');
console.log(`  Mode:           ${COMMIT ? '🔴 COMMIT (will DELETE)' : '🟡 DRY RUN (report only)'}`);
console.log(`  Master entries: ${masterData.length}`);
console.log(`  Canonical IDs:  ${canonicalIds.size} (var_* prefixed)\n`);

async function main() {
  // ── Step 1: Scan ALL products for Lotusland variants ──────────
  const allProducts = await db.collection('products').get();
  
  const keep = [];       // Variants that ARE in the canonical 104
  const toDelete = [];   // Variants that are NOT in the canonical 104
  const orphaned = [];   // Canonical IDs not found in Firestore
  
  const foundCanonicalIds = new Set();
  
  for (const productDoc of allProducts.docs) {
    const productId = productDoc.id;
    const productName = productDoc.data().name || productId;
    const variants = await db.collection('products').doc(productId)
      .collection('variants').get();
    
    for (const v of variants.docs) {
      const vData = v.data();
      if (vData.supplierId !== 'supplier-lotusland') continue;
      
      if (canonicalIds.has(v.id)) {
        keep.push({
          productId,
          productName,
          variantId: v.id,
          dosage: vData.concentration || vData.presentation || '-',
        });
        foundCanonicalIds.add(v.id);
      } else {
        toDelete.push({
          productId,
          productName,
          variantId: v.id,
          dosage: vData.concentration || vData.presentation || '-',
          sku: vData.sku || '-',
          ref: db.collection('products').doc(productId).collection('variants').doc(v.id),
        });
      }
    }
  }
  
  // ── Step 2: Find canonical IDs missing from Firestore ─────────
  for (const cid of canonicalIds) {
    if (!foundCanonicalIds.has(cid)) {
      const masterEntry = masterData.find(e => e.id === cid);
      orphaned.push({
        id: cid,
        parentProduct: masterEntry?.parentProduct || '?',
        dosage: masterEntry?.dosage || '?',
      });
    }
  }
  
  // ── Report ────────────────────────────────────────────────────
  console.log('━━━ SUMMARY ━━━\n');
  console.log(`  ✅ Canonical variants found in Firestore: ${keep.length} / ${canonicalIds.size}`);
  console.log(`  🗑️  Duplicate variants to DELETE:         ${toDelete.length}`);
  console.log(`  ⚠️  Canonical variants MISSING:            ${orphaned.length}\n`);
  
  // ── Kept variants ─────────────────────────────────────────────
  console.log('━━━ KEPT (canonical, will NOT be touched) ━━━\n');
  keep.sort((a, b) => a.productName.localeCompare(b.productName));
  keep.forEach((k, i) => {
    console.log(`  ${String(i+1).padStart(3)}. ${k.variantId} → "${k.productName}" | ${k.dosage}`);
  });
  console.log('');
  
  // ── Duplicates to delete ──────────────────────────────────────
  if (toDelete.length > 0) {
    console.log('━━━ TO DELETE (NOT in canonical 104) ━━━\n');
    toDelete.sort((a, b) => a.productName.localeCompare(b.productName));
    toDelete.forEach((d, i) => {
      console.log(`  ${String(i+1).padStart(3)}. ${d.variantId}`);
      console.log(`       Product: "${d.productName}" (${d.productId})`);
      console.log(`       Dosage: ${d.dosage} | SKU: ${d.sku}`);
    });
    console.log('');
  }
  
  // ── Missing canonical ─────────────────────────────────────────
  if (orphaned.length > 0) {
    console.log('━━━ MISSING CANONICAL VARIANTS (not found in Firestore) ━━━\n');
    orphaned.forEach((o, i) => {
      console.log(`  ${String(i+1).padStart(3)}. ${o.id} → "${o.parentProduct}" | ${o.dosage}`);
    });
    console.log('');
  }
  
  // ── Execute deletions ─────────────────────────────────────────
  if (COMMIT && toDelete.length > 0) {
    console.log('━━━ EXECUTING DELETIONS ━━━\n');
    
    let deleted = 0;
    let errors = 0;
    
    // Process in batches of 500 (Firestore batch limit)
    const BATCH_SIZE = 450;
    for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = toDelete.slice(i, i + BATCH_SIZE);
      
      for (const d of chunk) {
        batch.delete(d.ref);
      }
      
      try {
        await batch.commit();
        deleted += chunk.length;
        console.log(`  ✅ Batch ${Math.floor(i/BATCH_SIZE) + 1}: deleted ${chunk.length} variants`);
      } catch (err) {
        errors += chunk.length;
        console.error(`  ❌ Batch ${Math.floor(i/BATCH_SIZE) + 1} FAILED:`, err.message);
      }
    }
    
    console.log(`\n  Total deleted: ${deleted}`);
    if (errors > 0) console.log(`  Errors: ${errors}`);
    
    // ── Post-cleanup verification ───────────────────────────────
    console.log('\n━━━ POST-CLEANUP VERIFICATION ━━━\n');
    let remaining = 0;
    for (const productDoc of allProducts.docs) {
      const variants = await db.collection('products').doc(productDoc.id)
        .collection('variants').where('supplierId', '==', 'supplier-lotusland').get();
      remaining += variants.size;
    }
    console.log(`  Lotusland variants remaining: ${remaining}`);
    console.log(`  Expected:                     ${canonicalIds.size}`);
    console.log(`  Status:                       ${remaining === canonicalIds.size ? '✅ CLEAN' : '⚠️ MISMATCH'}`);
  } else if (!COMMIT && toDelete.length > 0) {
    console.log('━━━ DRY RUN — No changes made ━━━');
    console.log(`  Run with --commit to delete ${toDelete.length} duplicate variants.\n`);
  } else {
    console.log('━━━ NO DUPLICATES FOUND — Lotusland is clean ━━━\n');
  }
  
  // ── Check if any products become empty after cleanup ──────────
  if (toDelete.length > 0) {
    console.log('━━━ PRODUCTS THAT MAY BECOME EMPTY ━━━\n');
    const productVariantMap = {};
    for (const d of toDelete) {
      if (!productVariantMap[d.productId]) {
        productVariantMap[d.productId] = { name: d.productName, deleteCount: 0, totalVariants: 0 };
      }
      productVariantMap[d.productId].deleteCount++;
    }
    
    // Count total variants per product
    for (const pid of Object.keys(productVariantMap)) {
      const varSnap = await db.collection('products').doc(pid).collection('variants').get();
      productVariantMap[pid].totalVariants = varSnap.size;
    }
    
    let emptyCount = 0;
    for (const [pid, info] of Object.entries(productVariantMap)) {
      const remaining = info.totalVariants - info.deleteCount;
      if (remaining === 0) {
        emptyCount++;
        console.log(`  ⚠️  ${pid} ("${info.name}") → ${info.totalVariants} variants ALL deleted → EMPTY product!`);
      }
    }
    
    if (emptyCount === 0) {
      console.log('  ✅ No products will become empty after cleanup.\n');
    } else {
      console.log(`\n  ${emptyCount} products will be empty. Consider deleting them too.\n`);
    }
  }
  
  console.log('══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);

#!/usr/bin/env node
/**
 * phase5_lotusland_audit.mjs
 * 
 * Lists ALL remaining Lotusland variants to identify which 47 are extras.
 * Groups by product and shows variant details.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  AUDITORÍA LOTUSLAND — VARIANTES RESTANTES                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const allProducts = await db.collection('products').get();
  
  // Collect all Lotusland entries
  const lotuslandEntries = [];
  
  // Also track products with multiple Lotusland variants
  const multiVariantProducts = [];
  
  for (const productDoc of allProducts.docs) {
    const productId = productDoc.id;
    const productData = productDoc.data();
    const variants = await db.collection('products').doc(productId)
      .collection('variants').get();
    
    const lotuslandVars = [];
    
    for (const v of variants.docs) {
      const vData = v.data();
      if (vData.supplierId === 'supplier-lotusland') {
        lotuslandVars.push({
          variantId: v.id,
          sku: vData.sku || '-',
          presentation: vData.presentation || '-',
          concentration: vData.concentration || '-',
          quantity: vData.quantity || '-',
          unit: vData.unit || '-',
        });
      }
    }
    
    if (lotuslandVars.length > 0) {
      lotuslandEntries.push({
        productId,
        productName: productData.name || productId,
        category: productData.categoryId || productData.category || '-',
        type: productData.type || '-',
        variantCount: lotuslandVars.length,
        totalVariantsInProduct: variants.size,
        variants: lotuslandVars,
      });
      
      if (lotuslandVars.length > 1) {
        multiVariantProducts.push({
          productId,
          productName: productData.name,
          count: lotuslandVars.length,
        });
      }
    }
  }
  
  // Sort by product name
  lotuslandEntries.sort((a, b) => a.productName.localeCompare(b.productName));
  
  // ── Summary ─────────────────────────────────────────────────────
  const totalVariants = lotuslandEntries.reduce((sum, e) => sum + e.variantCount, 0);
  console.log(`  Total products with Lotusland variants: ${lotuslandEntries.length}`);
  console.log(`  Total Lotusland variants:               ${totalVariants}`);
  console.log(`  Expected:                               104`);
  console.log(`  Excess:                                 ${totalVariants - 104}\n`);
  
  // ── Products with multiple Lotusland variants ───────────────────
  if (multiVariantProducts.length > 0) {
    console.log('━━━ PRODUCTS WITH MULTIPLE LOTUSLAND VARIANTS ━━━\n');
    for (const mp of multiVariantProducts) {
      console.log(`  ⚠️  ${mp.productId} ("${mp.productName}") → ${mp.count} variants`);
    }
    console.log('');
  }
  
  // ── Full list ──────────────────────────────────────────────────
  console.log('━━━ FULL LIST — ALL LOTUSLAND VARIANTS ━━━\n');
  
  let idx = 0;
  for (const entry of lotuslandEntries) {
    idx++;
    console.log(`  ${String(idx).padStart(3, ' ')}. ${entry.productId}`);
    console.log(`       Name: "${entry.productName}"`);
    console.log(`       Category: ${entry.category} | Type: ${entry.type}`);
    console.log(`       Lotusland variants: ${entry.variantCount} / ${entry.totalVariantsInProduct} total`);
    for (const v of entry.variants) {
      console.log(`         → ${v.variantId} | ${v.presentation} | ${v.concentration} ${v.unit}`);
    }
    console.log('');
  }
  
  // ── Look for potential duplicates among Lotusland products ─────
  console.log('━━━ POTENTIAL DUPLICATES (similar names) ━━━\n');
  
  // Normalize names and look for near-duplicates
  const nameMap = new Map();
  for (const entry of lotuslandEntries) {
    // Extract base molecule name
    const baseName = entry.productName
      .toLowerCase()
      .replace(/\s*\d+\s*(mg|iu|ml|mcg|spu|ug)\s*/gi, ' ')
      .replace(/\s*(vial|caps|capsules|x\d+|pen|kit|bundle|counts?)\s*/gi, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!nameMap.has(baseName)) {
      nameMap.set(baseName, []);
    }
    nameMap.get(baseName).push(entry);
  }
  
  let dupeGroups = 0;
  for (const [baseName, entries] of nameMap) {
    if (entries.length > 1) {
      dupeGroups++;
      console.log(`  Group "${baseName}":`);
      for (const e of entries) {
        console.log(`    - ${e.productId} ("${e.productName}") [${e.variantCount} vars]`);
      }
      console.log('');
    }
  }
  
  if (dupeGroups === 0) {
    console.log('  No obvious duplicates found by name.\n');
  }
  
  console.log('══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);

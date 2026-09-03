#!/usr/bin/env node
/**
 * phase5_lotusland_cleanup_v2.mjs
 * 
 * Strategy: The master file (lotus_variants_final.json) defines 104 canonical
 * products+dosages (the var_* entries). The IDs in the master do NOT match
 * Firestore IDs, so we match by CONTENT (product name + dosage).
 * 
 * Algorithm:
 * 1. Build canonical set from master: unique (parentProduct, dosage) pairs 
 *    from the 104 var_* entries
 * 2. Scan Firestore for all supplierId=supplier-lotusland variants
 * 3. For each Firestore variant, find matching canonical entry
 * 4. If multiple Firestore variants match the same canonical entry → keep first, delete rest
 * 5. If a Firestore variant matches NO canonical entry → it's an extra, delete it
 * 
 * Usage:
 *   node scripts/phase5_lotusland_cleanup_v2.mjs           # DRY RUN
 *   node scripts/phase5_lotusland_cleanup_v2.mjs --commit   # DELETE duplicates
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

// Build canonical set: only var_* entries, deduplicated by (parentProduct, dosage)
const canonicalEntries = masterData.filter(e => e.id.startsWith('var_'));
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  LOTUSLAND CLEANUP v2 — Content-Based Matching             ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');
console.log(`  Mode:              ${COMMIT ? '🔴 COMMIT (will DELETE)' : '🟡 DRY RUN (report only)'}`);
console.log(`  Master var_* entries: ${canonicalEntries.length}`);

// ── Normalize function ──────────────────────────────────────────
function normKey(productName, dosage) {
  const np = (productName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const nd = (dosage || '')
    .toLowerCase()
    .replace(/[^a-z0-9/|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `${np}|||${nd}`;
}

// Build canonical map: key → master entry
// Some canonical entries share the same key (same product+dosage), which means
// the product has multiple variants at different dosages. Each unique key = 1 allowed variant.
const canonicalMap = new Map();
for (const e of canonicalEntries) {
  const key = normKey(e.parentProduct, e.dosage);
  if (!canonicalMap.has(key)) {
    canonicalMap.set(key, { ...e, count: 1 });
  } else {
    canonicalMap.get(key).count++;
  }
}
console.log(`  Unique canonical keys: ${canonicalMap.size}\n`);

async function main() {
  // ── Step 1: Get all Lotusland variants from Firestore ─────────
  const allVariants = await db.collectionGroup('variants').get();
  
  const lotuslandVars = [];
  for (const v of allVariants.docs) {
    const vData = v.data();
    if (vData.supplierId !== 'supplier-lotusland') continue;
    
    const parentRef = v.ref.parent.parent;
    const parentDoc = await parentRef.get();
    const productName = parentDoc.exists ? (parentDoc.data().name || parentRef.id) : parentRef.id;
    
    // Build multiple possible keys to try matching
    const dosage = vData.concentration || vData.presentation || vData.dosage || '';
    const variantName = vData.variantName || vData.name || '';
    
    lotuslandVars.push({
      variantId: v.id,
      productId: parentRef.id,
      productName,
      dosage,
      variantName,
      ref: v.ref,
      key: normKey(productName, dosage),
      altKey: normKey(productName, variantName),
    });
  }
  
  console.log(`  Firestore Lotusland variants: ${lotuslandVars.length}`);
  console.log(`  Expected:                     104`);
  console.log(`  Excess:                       ${lotuslandVars.length - 104}\n`);
  
  // ── Step 2: Match Firestore variants to canonical entries ─────
  // Track which canonical keys have been claimed
  const claimedKeys = new Map(); // key → [{ firestoreVariant, ... }]
  const unmatched = [];
  
  for (const fv of lotuslandVars) {
    let matched = false;
    
    // Try primary key first
    for (const tryKey of [fv.key, fv.altKey]) {
      // Try exact match
      if (canonicalMap.has(tryKey)) {
        if (!claimedKeys.has(tryKey)) claimedKeys.set(tryKey, []);
        claimedKeys.get(tryKey).push(fv);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      // Try fuzzy match: find closest canonical key
      let bestMatch = null;
      let bestScore = 0;
      
      const fvProductNorm = normKey(fv.productName, '').split('|||')[0];
      const fvDosageNorm = (fv.dosage || '').toLowerCase().replace(/[^a-z0-9/|]/g, ' ').replace(/\s+/g, ' ').trim();
      
      for (const [cKey, cEntry] of canonicalMap) {
        const [cProduct, cDosage] = cKey.split('|||');
        
        // Check if product names are similar enough
        const productMatch = cProduct.includes(fvProductNorm) || fvProductNorm.includes(cProduct);
        const dosageMatch = cDosage === fvDosageNorm || 
                           cDosage.includes(fvDosageNorm) || 
                           fvDosageNorm.includes(cDosage);
        
        if (productMatch && dosageMatch) {
          const score = (productMatch ? 1 : 0) + (dosageMatch ? 1 : 0);
          if (score > bestScore) {
            bestScore = score;
            bestMatch = cKey;
          }
        }
      }
      
      if (bestMatch && bestScore >= 2) {
        if (!claimedKeys.has(bestMatch)) claimedKeys.set(bestMatch, []);
        claimedKeys.get(bestMatch).push(fv);
      } else {
        unmatched.push(fv);
      }
    }
  }
  
  // ── Step 3: Determine keep vs delete ──────────────────────────
  const toKeep = [];
  const toDelete = [];
  
  for (const [key, variants] of claimedKeys) {
    const canonical = canonicalMap.get(key);
    const allowedCount = canonical ? canonical.count : 1;
    
    // Sort: prefer var_* IDs, then lotusland-*, then by shortest ID
    variants.sort((a, b) => {
      if (a.variantId.startsWith('var_') && !b.variantId.startsWith('var_')) return -1;
      if (!a.variantId.startsWith('var_') && b.variantId.startsWith('var_')) return 1;
      return a.variantId.length - b.variantId.length;
    });
    
    // Keep first N, delete rest
    for (let i = 0; i < variants.length; i++) {
      if (i < allowedCount) {
        toKeep.push({ ...variants[i], canonicalKey: key });
      } else {
        toDelete.push({ ...variants[i], canonicalKey: key, reason: 'DUPLICATE of canonical entry' });
      }
    }
  }
  
  // All unmatched are extras to delete
  for (const u of unmatched) {
    toDelete.push({ ...u, canonicalKey: null, reason: 'NO matching canonical entry' });
  }
  
  // ── Report ────────────────────────────────────────────────────
  console.log('━━━ RESULTS ━━━\n');
  console.log(`  ✅ KEEP:     ${toKeep.length}`);
  console.log(`  🗑️  DELETE:   ${toDelete.length}`);
  console.log(`  ❓ UNMATCHED: ${unmatched.length}\n`);
  
  // ── Kept variants ─────────────────────────────────────────────
  console.log('━━━ KEPT VARIANTS (canonical) ━━━\n');
  toKeep.sort((a, b) => a.productName.localeCompare(b.productName));
  toKeep.forEach((k, i) => {
    console.log(`  ${String(i+1).padStart(3)}. ✅ ${k.variantId}`);
    console.log(`       Product: "${k.productName}" | Dosage: ${k.dosage}`);
  });
  console.log('');
  
  // ── To Delete ─────────────────────────────────────────────────
  if (toDelete.length > 0) {
    console.log('━━━ TO DELETE ━━━\n');
    toDelete.sort((a, b) => a.productName.localeCompare(b.productName));
    toDelete.forEach((d, i) => {
      console.log(`  ${String(i+1).padStart(3)}. 🗑️  ${d.variantId}`);
      console.log(`       Product: "${d.productName}" (${d.productId})`);
      console.log(`       Dosage: ${d.dosage} | Reason: ${d.reason}`);
    });
    console.log('');
  }
  
  // ── Uncovered canonical entries ───────────────────────────────
  const coveredKeys = new Set(claimedKeys.keys());
  const uncoveredCanonical = [];
  for (const [key, entry] of canonicalMap) {
    if (!coveredKeys.has(key)) {
      uncoveredCanonical.push({ key, entry });
    }
  }
  
  if (uncoveredCanonical.length > 0) {
    console.log('━━━ CANONICAL ENTRIES NOT FOUND IN FIRESTORE ━━━\n');
    uncoveredCanonical.forEach((uc, i) => {
      console.log(`  ${String(i+1).padStart(3)}. "${uc.entry.parentProduct}" | ${uc.entry.dosage}`);
    });
    console.log('');
  }
  
  // ── Execute ───────────────────────────────────────────────────
  if (COMMIT && toDelete.length > 0) {
    console.log('━━━ EXECUTING DELETIONS ━━━\n');
    
    const BATCH_SIZE = 450;
    let deleted = 0;
    
    for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = toDelete.slice(i, i + BATCH_SIZE);
      for (const d of chunk) batch.delete(d.ref);
      
      await batch.commit();
      deleted += chunk.length;
      console.log(`  ✅ Batch ${Math.floor(i/BATCH_SIZE) + 1}: deleted ${chunk.length} variants`);
    }
    
    console.log(`\n  Total deleted: ${deleted}`);
    
    // Verify
    const remaining = (await db.collectionGroup('variants').get()).docs
      .filter(d => d.data().supplierId === 'supplier-lotusland');
    console.log(`\n  Lotusland variants remaining: ${remaining.length}`);
    console.log(`  Expected:                     ${toKeep.length}`);
    console.log(`  Status: ${remaining.length === toKeep.length ? '✅ CLEAN' : '⚠️ CHECK'}\n`);
    
    // Check for empty products
    const affectedProducts = new Set(toDelete.map(d => d.productId));
    let emptyProducts = 0;
    for (const pid of affectedProducts) {
      const vars = await db.collection('products').doc(pid).collection('variants').get();
      if (vars.empty) {
        emptyProducts++;
        console.log(`  ⚠️  Empty product: ${pid}`);
      }
    }
    if (emptyProducts > 0) {
      console.log(`\n  ${emptyProducts} products are now empty — consider deleting them.`);
    }
  } else if (!COMMIT && toDelete.length > 0) {
    console.log(`━━━ DRY RUN — Run with --commit to delete ${toDelete.length} variants ━━━\n`);
  }
  
  console.log('══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);

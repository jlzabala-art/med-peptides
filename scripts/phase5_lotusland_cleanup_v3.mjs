#!/usr/bin/env node
/**
 * phase5_lotusland_cleanup_v3.mjs
 * 
 * Strategy: Match by MOLECULE BASE NAME + VARIANT DOSAGE.
 * The product names in master vs Firestore differ in their dosage suffix,
 * e.g. "BPC-157 2 mg / vial" vs "BPC-157 5mg vial", but the molecule
 * and variant dosages are the same.
 * 
 * Algorithm:
 * 1. Extract molecule base names from master (strip dosage from product name)
 * 2. Extract molecule base names from Firestore variants
 * 3. Match on (moleculeBase, variantDosage)
 * 4. For duplicates → keep one, delete rest
 * 
 * Usage:
 *   node scripts/phase5_lotusland_cleanup_v3.mjs           # DRY RUN
 *   node scripts/phase5_lotusland_cleanup_v3.mjs --commit   # DELETE duplicates
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv.includes('--commit');

const sa = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

// ── Load Master ──────────────────────────────────────────────────
const masterPath = resolve(__dirname, '..', 'lotus_variants_final.json');
const masterData = JSON.parse(readFileSync(masterPath, 'utf8'));
const canonicalEntries = masterData.filter(e => e.id.startsWith('var_'));

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  LOTUSLAND CLEANUP v3 — Molecule-Based Matching            ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');
console.log(`  Mode:                 ${COMMIT ? '🔴 COMMIT' : '🟡 DRY RUN'}`);
console.log(`  Master canonical:     ${canonicalEntries.length}\n`);

// ── Extract molecule base name ──────────────────────────────────
// Strips dosage/presentation info from product name to get pure molecule
function extractMolecule(productName) {
  return (productName || '')
    .toLowerCase()
    // Remove parenthetical dosage info like "(10ml)" 
    .replace(/\([^)]*\)/g, '')
    // Remove dosage patterns: "2 mg / vial", "5mg vial", "10 mg", "30ml", "100 counts"
    .replace(/\d+(\.\d+)?\s*(mg|mcg|iu|ml|ug|spu|g)\s*(\/\s*(vial|tablet|bottle|capsule|cap|caps))?/gi, '')
    // Remove presentation words
    .replace(/\b(vial|tablet|caps|capsules|bottle|pen|kit|bundle|x\d+|counts?)\b/gi, '')
    // Normalize separators and whitespace
    .replace(/[^a-z0-9+β\-/|()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Normalize dosage for comparison
function normDosage(dosage) {
  return (dosage || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Create canonical matching key
function matchKey(productName, dosage) {
  return `${extractMolecule(productName)}|||${normDosage(dosage)}`;
}

// ── Build canonical set ─────────────────────────────────────────
const canonicalMap = new Map(); // matchKey → canonical entry
const canonicalByMolecule = new Map(); // molecule → [entries]

for (const e of canonicalEntries) {
  const mol = extractMolecule(e.parentProduct);
  const key = matchKey(e.parentProduct, e.dosage);
  
  if (!canonicalMap.has(key)) {
    canonicalMap.set(key, e);
  }
  
  if (!canonicalByMolecule.has(mol)) {
    canonicalByMolecule.set(mol, []);
  }
  canonicalByMolecule.get(mol).push(e);
}

console.log(`  Unique canonical keys:     ${canonicalMap.size}`);
console.log(`  Unique molecules in master: ${canonicalByMolecule.size}\n`);

// Show molecule mapping for debugging
console.log('━━━ MOLECULE MAPPING (master) ━━━\n');
for (const [mol, entries] of [...canonicalByMolecule].sort((a,b) => a[0].localeCompare(b[0]))) {
  console.log(`  ${mol}`);
  for (const e of entries) {
    console.log(`    → ${e.dosage}`);
  }
}
console.log('');

async function main() {
  // ── Get all Lotusland variants from Firestore ─────────────────
  const allVariants = await db.collectionGroup('variants').get();
  
  const lotuslandVars = [];
  for (const v of allVariants.docs) {
    const vData = v.data();
    if (vData.supplierId !== 'supplier-lotusland') continue;
    
    const parentRef = v.ref.parent.parent;
    const parentDoc = await parentRef.get();
    const productName = parentDoc.exists ? (parentDoc.data().name || parentRef.id) : parentRef.id;
    
    const dosage = vData.concentration || vData.presentation || vData.dosage || '';
    const molecule = extractMolecule(productName);
    const key = matchKey(productName, dosage);
    
    lotuslandVars.push({
      variantId: v.id,
      productId: parentRef.id,
      productName,
      dosage,
      molecule,
      key,
      ref: v.ref,
    });
  }
  
  console.log(`  Firestore Lotusland variants: ${lotuslandVars.length}`);
  console.log(`  Expected:                     104`);
  console.log(`  Excess:                       ${lotuslandVars.length - 104}\n`);
  
  // ── Match and deduplicate ─────────────────────────────────────
  // Group Firestore variants by their match key
  const firestoreGroups = new Map(); // key → [variants]
  const unmatchedVars = [];
  
  for (const fv of lotuslandVars) {
    if (canonicalMap.has(fv.key)) {
      if (!firestoreGroups.has(fv.key)) firestoreGroups.set(fv.key, []);
      firestoreGroups.get(fv.key).push(fv);
    } else {
      // Try matching by molecule + dosage with fuzzy dosage
      let matched = false;
      
      // Check if this molecule exists in canonical
      const molEntries = canonicalByMolecule.get(fv.molecule);
      if (molEntries) {
        // Try to find matching dosage
        for (const ce of molEntries) {
          const ceNormDosage = normDosage(ce.dosage);
          const fvNormDosage = normDosage(fv.dosage);
          
          // Compare just the numeric+unit part
          const ceNumbers = ceNormDosage.match(/(\d+(\.\d+)?)\s*(mg|mcg|iu|ml|ug)/gi) || [];
          const fvNumbers = fvNormDosage.match(/(\d+(\.\d+)?)\s*(mg|mcg|iu|ml|ug)/gi) || [];
          
          if (ceNumbers.length > 0 && fvNumbers.length > 0 && 
              ceNumbers.join('|').replace(/\s/g,'') === fvNumbers.join('|').replace(/\s/g,'')) {
            const ceKey = matchKey(ce.parentProduct, ce.dosage);
            if (!firestoreGroups.has(ceKey)) firestoreGroups.set(ceKey, []);
            firestoreGroups.get(ceKey).push(fv);
            matched = true;
            break;
          }
        }
      }
      
      if (!matched) {
        unmatchedVars.push(fv);
      }
    }
  }
  
  // ── Determine keep vs delete ──────────────────────────────────
  const toKeep = [];
  const toDelete = [];
  
  for (const [key, variants] of firestoreGroups) {
    // Keep the first variant, delete extras
    // Prefer: shorter product paths (closer to canonical name)
    variants.sort((a, b) => a.productId.length - b.productId.length);
    
    toKeep.push(variants[0]);
    for (let i = 1; i < variants.length; i++) {
      toDelete.push({ ...variants[i], reason: `DUPLICATE (kept: ${variants[0].variantId})` });
    }
  }
  
  // All unmatched are extras
  for (const u of unmatchedVars) {
    toDelete.push({ ...u, reason: 'NO canonical match' });
  }
  
  // ── Report ────────────────────────────────────────────────────
  console.log('━━━ RESULTS ━━━\n');
  console.log(`  ✅ KEEP:      ${toKeep.length} (should be ~104)`);
  console.log(`  🗑️  DELETE:    ${toDelete.length}`);
  console.log(`  ❓ UNMATCHED:  ${unmatchedVars.length}\n`);
  
  // ── Kept ──────────────────────────────────────────────────────
  console.log('━━━ KEPT VARIANTS ━━━\n');
  toKeep.sort((a, b) => a.molecule.localeCompare(b.molecule) || a.dosage.localeCompare(b.dosage));
  toKeep.forEach((k, i) => {
    console.log(`  ${String(i+1).padStart(3)}. ✅ ${k.variantId}`);
    console.log(`       "${k.productName}" | Dosage: ${k.dosage} | Molecule: [${k.molecule}]`);
  });
  console.log('');
  
  // ── Delete ────────────────────────────────────────────────────
  if (toDelete.length > 0) {
    console.log('━━━ TO DELETE ━━━\n');
    toDelete.sort((a, b) => a.molecule.localeCompare(b.molecule));
    toDelete.forEach((d, i) => {
      console.log(`  ${String(i+1).padStart(3)}. 🗑️  ${d.variantId}`);
      console.log(`       "${d.productName}" | Dosage: ${d.dosage} | Reason: ${d.reason}`);
    });
    console.log('');
  }
  
  // ── Canonical entries not covered ─────────────────────────────
  const coveredKeys = new Set(firestoreGroups.keys());
  const uncovered = [...canonicalMap].filter(([k]) => !coveredKeys.has(k));
  
  if (uncovered.length > 0) {
    console.log(`━━━ CANONICAL NOT COVERED (${uncovered.length}) ━━━\n`);
    uncovered.forEach(([k, e], i) => {
      console.log(`  ${String(i+1).padStart(3)}. "${e.parentProduct}" | ${e.dosage}`);
      console.log(`       Molecule: [${extractMolecule(e.parentProduct)}]`);
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
      console.log(`  ✅ Batch ${Math.floor(i/BATCH_SIZE)+1}: deleted ${chunk.length}`);
    }
    
    console.log(`\n  Total deleted: ${deleted}`);
    
    // Verify
    const remaining = (await db.collectionGroup('variants').get()).docs
      .filter(d => d.data().supplierId === 'supplier-lotusland');
    console.log(`  Remaining: ${remaining.length} | Expected: ${toKeep.length}`);
    console.log(`  ${remaining.length === toKeep.length ? '✅ CLEAN' : '⚠️ CHECK'}\n`);
  } else if (!COMMIT && toDelete.length > 0) {
    console.log(`━━━ DRY RUN — Run with --commit to delete ${toDelete.length} variants ━━━\n`);
  }
  
  console.log('══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);

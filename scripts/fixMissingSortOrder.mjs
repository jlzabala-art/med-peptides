/**
 * fixMissingSortOrder.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Finds all variant documents that lack a `sortOrder` field and patches them
 * with sortOrder: 0. Variants without this field are silently dropped by the
 * Firestore orderBy('sortOrder') query in getVariants(), causing 0 products
 * to be shown on the product detail page.
 *
 * DRY RUN by default — pass --apply to write to Firestore.
 * Usage:
 *   node scripts/fixMissingSortOrder.mjs           ← dry-run (safe)
 *   node scripts/fixMissingSortOrder.mjs --apply   ← patches Firestore
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require  = createRequire(import.meta.url);
const svcAcct  = require('../serviceAccountKey.json');
const DRY_RUN  = !process.argv.includes('--apply');

if (!getApps().length) {
  initializeApp({ credential: cert(svcAcct) });
}
const db = getFirestore();

console.log(`[fixMissingSortOrder] ${DRY_RUN ? '🔍 DRY RUN' : '✏️ APPLYING PATCHES'}`);

// Fetch all products
const productsSnap = await db.collection('products').get();
console.log(`Products found: ${productsSnap.size}`);

let totalVariants = 0;
let missingCount  = 0;
let patchedCount  = 0;

for (const productDoc of productsSnap.docs) {
  const variantsSnap = await productDoc.ref.collection('variants').get();
  totalVariants += variantsSnap.size;

  for (const variantDoc of variantsSnap.docs) {
    const data = variantDoc.data();
    if (data.sortOrder === undefined || data.sortOrder === null) {
      missingCount++;
      console.log(`  MISSING sortOrder: ${variantDoc.ref.path}`);

      if (!DRY_RUN) {
        await variantDoc.ref.update({ sortOrder: 0 });
        patchedCount++;
        console.log(`    ✅ Patched with sortOrder: 0`);
      }
    }
  }
}

console.log(`\n── Summary ──────────────────────────────`);
console.log(`Total variants scanned : ${totalVariants}`);
console.log(`Missing sortOrder      : ${missingCount}`);
if (!DRY_RUN) console.log(`Patched                : ${patchedCount}`);
else if (missingCount > 0) console.log(`Run with --apply to patch all ${missingCount} variants.`);
else console.log(`✅ All variants have sortOrder — no action needed.`);

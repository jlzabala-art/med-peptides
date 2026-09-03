/**
 * reconcile_supplier_ids.mjs
 *
 * PHASE 1 (audit): Scans ALL variants to find every unique supplierId value.
 *                  Compares them against the canonical supplier docs.
 *                  Outputs a mismatch report.
 *
 * PHASE 2 (fix):   Given a manual mapping (OVERRIDE_MAP below), rewrites
 *                  supplierId on every variant and deletes ghost supplier docs.
 *
 * Run audit only:  node scripts/reconcile_supplier_ids.mjs
 * Run with fixes:  DRY_RUN=false node scripts/reconcile_supplier_ids.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const DRY_RUN = process.env.DRY_RUN !== 'false';

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore(app);

/**
 * MANUAL MAPPING: old/wrong supplierId → canonical supplier doc ID
 * Will be populated after running the audit phase once.
 */
const OVERRIDE_MAP = {
  // Example: 'old-id': 'canonical-firestore-doc-id'
};

/** Ghost supplier doc IDs to DELETE after reconciliation */
const GHOST_SUPPLIER_IDS = [];

async function run() {
  console.log('='.repeat(65));
  console.log(' SUPPLIER ID RECONCILIATION');
  console.log(' DRY_RUN =', DRY_RUN ? 'YES (no writes)' : 'NO — WRITING TO FIRESTORE');
  console.log('='.repeat(65) + '\n');

  const suppliersSnap = await db.collection('suppliers').get();
  const canonicalIds = new Set(suppliersSnap.docs.map(d => d.id));

  console.log('Canonical supplier doc IDs:');
  suppliersSnap.docs.forEach(d => {
    const data = d.data();
    console.log(`  ${d.id}  =>  "${data.companyName || data.name || '(no name)'}"  variantsSupplied=${data.variantsSupplied ?? '?'}`);
  });
  console.log();

  const productsSnap = await db.collection('products').get();
  console.log(`Scanning ${productsSnap.size} products for variants...\n`);

  const variantSupplierMap = {};

  for (const pdoc of productsSnap.docs) {
    const varSnap = await pdoc.ref.collection('variants').get();
    for (const vdoc of varSnap.docs) {
      const sid = vdoc.data().supplierId;
      if (!sid) continue;
      if (!variantSupplierMap[sid]) {
        variantSupplierMap[sid] = { count: 0, productIds: new Set(), refs: [] };
      }
      variantSupplierMap[sid].count++;
      variantSupplierMap[sid].productIds.add(pdoc.id);
      variantSupplierMap[sid].refs.push(vdoc.ref);
    }
  }

  console.log('All supplierIds found in variants:');
  const orphans = [];
  for (const [sid, info] of Object.entries(variantSupplierMap).sort((a, b) => b[1].count - a[1].count)) {
    const isCanonical = canonicalIds.has(sid);
    const isMapped = !!OVERRIDE_MAP[sid];
    const status = isCanonical ? 'CANONICAL' : isMapped ? `MAPPED => ${OVERRIDE_MAP[sid]}` : 'ORPHAN';
    console.log(`  [${status}] ${sid}  =>  ${info.count} variants, ${info.productIds.size} products`);
    if (!isCanonical && !isMapped) orphans.push(sid);
  }

  console.log();
  if (orphans.length > 0) {
    console.log('ORPHAN supplierIds (in variants but no supplier doc):');
    orphans.forEach(o => console.log('   ', o));
    console.log('\nAdd entries to OVERRIDE_MAP and re-run with DRY_RUN=false\n');
  } else {
    console.log('No orphan supplierIds found.\n');
  }

  const idsWithVariants = new Set(Object.keys(variantSupplierMap));
  const ghosts = suppliersSnap.docs.filter(d => !idsWithVariants.has(d.id));
  if (ghosts.length > 0) {
    console.log('Supplier docs with 0 variants (potential ghosts):');
    ghosts.forEach(d => {
      const data = d.data();
      console.log(`   ${d.id}  =>  "${data.companyName || data.name || '(no name)'}"`);
    });
  }

  if (Object.keys(OVERRIDE_MAP).length === 0) {
    console.log('\nOVERRIDE_MAP is empty — audit only, no fixes applied.');
    return;
  }

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Would fix:');
    for (const [oldId, newId] of Object.entries(OVERRIDE_MAP)) {
      const info = variantSupplierMap[oldId];
      if (info) console.log(`  ${info.count} variants: "${oldId}" => "${newId}"`);
    }
    return;
  }

  console.log('\n[LIVE] Applying fixes...');
  let fixCount = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const [oldId, newId] of Object.entries(OVERRIDE_MAP)) {
    const info = variantSupplierMap[oldId];
    if (!info) continue;
    for (const ref of info.refs) {
      batch.update(ref, { supplierId: newId });
      batchCount++;
      fixCount++;
      if (batchCount >= 400) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }
  }
  if (batchCount > 0) await batch.commit();
  console.log(`  Fixed ${fixCount} variants.`);

  if (GHOST_SUPPLIER_IDS.length > 0) {
    const delBatch = db.batch();
    GHOST_SUPPLIER_IDS.forEach(gid => delBatch.delete(db.collection('suppliers').doc(gid)));
    await delBatch.commit();
    console.log(`  Deleted ${GHOST_SUPPLIER_IDS.length} ghost supplier docs.`);
  }

  console.log('\n=== RECONCILIATION COMPLETE ===');
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });

#!/usr/bin/env node
/**
 * Phase 6G — Full Supplier/Wholeseller Cleanup
 * 
 * Tasks (executed sequentially):
 *   1. Purge wholesellers collection (keep only Ketone + York)
 *   2. Delete shell/orphan suppliers (24GENETICS, OLlBb..., supplier-eterna)
 *   3. Complete category field for all suppliers
 *   4. Audit Lotusland products — fix categories if wrong
 *   5. Link Bloodo products correctly
 *   6. Verify POD Poland and Vallida product links
 * 
 * Usage: node scripts/phase6g_full_cleanup.mjs
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// ─── Firebase Admin Init ─────────────────────────────────────────────
import { applicationDefault } from 'firebase-admin/app';

initializeApp({
  credential: applicationDefault(),
  projectId: 'med-peptides-app',
});
const db = getFirestore();

// ─── Constants ───────────────────────────────────────────────────────
const KEEP_WHOLESELLERS = new Set([
  'AiHYBbpkDmXTkNql5Nii',  // Ketone Clinical Laboratory
  'f97bf4fdU24qWFJPSGPS',  // York Diagnostic Laboratories DMCC
]);

const DELETE_SUPPLIERS = new Set([
  '24GENETICS',             // Shell with no name
  'OLlBbQjgrj6tY7GmM2Jo', // Shell with no name (Lotusland duplicate ID)
  'supplier-eterna',        // Duplicate — keep only supplier-eternadx
]);

const SUPPLIER_CATEGORIES = {
  'supplier-24genetics':       'Genetic Testing',
  'supplier-bioniq':           'Personalized Nutrition',
  'supplier-bloodo':           'Diagnostic Tests',
  'supplier-eternadx':         'Diagnostic Devices',
  'supplier-europeptides':     'Peptides',
  'supplier-fagron-genomics':  'Pharmacogenomics',
  'supplier-fusion':           'Peptides',
  'supplier-lotusland':        'Peptides',
  'supplier-magenta':          'Pharmaceuticals',
  'supplier-nplabs':           'Peptides',
  'supplier-pod-poland':       'Peptides',
  'supplier-vallida':          'Peptides',
};

// ─── Helper: batch delete ────────────────────────────────────────────
async function batchDelete(collectionName, docIds) {
  const CHUNK = 400;
  let deleted = 0;
  for (let i = 0; i < docIds.length; i += CHUNK) {
    const chunk = docIds.slice(i, i + CHUNK);
    const batch = db.batch();
    for (const id of chunk) {
      batch.delete(db.collection(collectionName).doc(id));
    }
    await batch.commit();
    deleted += chunk.length;
    console.log(`  🗑️  Deleted ${deleted}/${docIds.length} from ${collectionName}`);
  }
  return deleted;
}

// ═══════════════════════════════════════════════════════════════════════
// TASK 1: Purge wholesellers collection
// ═══════════════════════════════════════════════════════════════════════
async function task1_purgeWholesellers() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 TASK 1: Purge wholesellers (keep Ketone + York)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const snap = await db.collection('wholesellers').get();
  const toDelete = [];
  const kept = [];

  snap.forEach(doc => {
    if (KEEP_WHOLESELLERS.has(doc.id)) {
      kept.push(`${doc.id} → ${doc.data().companyName || doc.data().name || '?'}`);
    } else {
      toDelete.push(doc.id);
    }
  });

  console.log(`  ✅ Keeping: ${kept.join(', ')}`);
  console.log(`  🗑️  Deleting ${toDelete.length} wholeseller docs...`);

  if (toDelete.length > 0) {
    await batchDelete('wholesellers', toDelete);
  }

  console.log(`  ✅ TASK 1 DONE — ${kept.length} kept, ${toDelete.length} deleted.\n`);
}

// ═══════════════════════════════════════════════════════════════════════
// TASK 2: Delete shell/orphan suppliers
// ═══════════════════════════════════════════════════════════════════════
async function task2_deleteShellSuppliers() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 TASK 2: Delete shell/orphan suppliers');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let deleted = 0;
  for (const id of DELETE_SUPPLIERS) {
    const ref = db.collection('suppliers').doc(id);
    const doc = await ref.get();
    if (doc.exists) {
      await ref.delete();
      console.log(`  🗑️  Deleted: ${id}`);
      deleted++;
    } else {
      console.log(`  ⏭️  Skip (not found): ${id}`);
    }
  }

  console.log(`  ✅ TASK 2 DONE — ${deleted} shell suppliers deleted.\n`);
}

// ═══════════════════════════════════════════════════════════════════════
// TASK 3: Complete category field for all remaining suppliers
// ═══════════════════════════════════════════════════════════════════════
async function task3_completeCategories() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 TASK 3: Complete supplier categories');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const batch = db.batch();
  let updated = 0;

  for (const [id, category] of Object.entries(SUPPLIER_CATEGORIES)) {
    const ref = db.collection('suppliers').doc(id);
    const doc = await ref.get();
    if (doc.exists) {
      const current = doc.data().category;
      if (current !== category) {
        batch.update(ref, { 
          category, 
          updatedAt: FieldValue.serverTimestamp() 
        });
        console.log(`  ✏️  ${id}: "${current || '—'}" → "${category}"`);
        updated++;
      } else {
        console.log(`  ✅ ${id}: already "${category}"`);
      }
    }
  }

  if (updated > 0) {
    await batch.commit();
  }
  console.log(`  ✅ TASK 3 DONE — ${updated} suppliers updated.\n`);
}

// ═══════════════════════════════════════════════════════════════════════
// TASK 4: Audit Lotusland products — ensure all are category "Peptides"
// ═══════════════════════════════════════════════════════════════════════
async function task4_auditLotusland() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 TASK 4: Audit Lotusland products & categories');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const snap = await db.collection('products')
    .where('supplierIds', 'array-contains', 'supplier-lotusland')
    .get();

  console.log(`  📊 Found ${snap.size} products linked to supplier-lotusland`);

  const categoryCounts = {};
  const nonPeptides = [];
  let variantCount = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const cat = data.category || 'Uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    if (cat !== 'Peptides') {
      nonPeptides.push({ id: doc.id, name: data.name, category: cat });
    }

    const varSnap = await db.collection('products').doc(doc.id)
      .collection('variants').get();
    variantCount += varSnap.size;
  }

  console.log(`  📊 Category breakdown:`, categoryCounts);
  console.log(`  📊 Total variants: ${variantCount}`);

  if (nonPeptides.length > 0) {
    console.log(`\n  ⚠️  ${nonPeptides.length} products have wrong category (should be "Peptides"):`);
    for (const p of nonPeptides) {
      console.log(`    → ${p.id}: "${p.name}" (was: "${p.category}")`);
    }

    const CHUNK = 400;
    for (let i = 0; i < nonPeptides.length; i += CHUNK) {
      const chunk = nonPeptides.slice(i, i + CHUNK);
      const batch = db.batch();
      for (const p of chunk) {
        batch.update(db.collection('products').doc(p.id), {
          category: 'Peptides',
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
    }
    console.log(`  ✅ Fixed ${nonPeptides.length} products → category: "Peptides"`);
  } else {
    console.log(`  ✅ All Lotusland products are correctly categorized as "Peptides"`);
  }

  console.log(`  ✅ TASK 4 DONE.\n`);
  return { products: snap.size, variants: variantCount };
}

// ═══════════════════════════════════════════════════════════════════════
// TASK 5: Link Bloodo products
// ═══════════════════════════════════════════════════════════════════════
async function task5_linkBloodo() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 TASK 5: Link Bloodo products to supplier-bloodo');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const BLOODO_PRODUCT_NAMES = [
    'cortisol', 'vitamin d', 'hba1c', 'omega', 'nad', 'testosterone',
  ];

  const existingSnap = await db.collection('products')
    .where('supplierIds', 'array-contains', 'supplier-bloodo')
    .get();
  
  console.log(`  📊 Products already linked to supplier-bloodo: ${existingSnap.size}`);

  if (existingSnap.size > 0) {
    existingSnap.forEach(d => {
      console.log(`    ✅ ${d.id}: ${d.data().name}`);
    });
  }

  // Search for potential Bloodo products by name match
  const allProducts = await db.collection('products').get();
  const candidates = [];
  
  allProducts.forEach(doc => {
    const data = doc.data();
    const name = (data.name || '').toLowerCase();
    const supplierIds = data.supplierIds || [];
    
    for (const keyword of BLOODO_PRODUCT_NAMES) {
      if (name.includes(keyword) && !supplierIds.includes('supplier-bloodo')) {
        candidates.push({ id: doc.id, name: data.name, category: data.category });
        break;
      }
    }
  });

  if (candidates.length > 0) {
    console.log(`  🔍 Found ${candidates.length} potential Bloodo products to link:`);
    const batch = db.batch();
    for (const c of candidates) {
      console.log(`    → ${c.id}: "${c.name}" (${c.category})`);
      batch.update(db.collection('products').doc(c.id), {
        supplierIds: FieldValue.arrayUnion('supplier-bloodo'),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
    console.log(`  ✅ Linked ${candidates.length} products to supplier-bloodo`);
  } else if (existingSnap.size === 0) {
    // Create Bloodo test products from scratch
    console.log(`  🔧 Creating Bloodo test products...`);
    
    const bloodoTests = [
      { name: 'Cortisol Test', description: 'Cortisol (Morning Sample) - At-home dried blood spot test', category: 'Diagnostic Tests' },
      { name: 'Vitamin D Test', description: 'Vitamin D (25-OH D2 + D3) - At-home dried blood spot test', category: 'Diagnostic Tests' },
      { name: 'HbA1c Test', description: 'Hemoglobin A1c (Glycated Haemoglobin) - At-home dried blood spot test', category: 'Diagnostic Tests' },
      { name: 'Omega Ratio Test', description: 'Omega-3 / Omega-6 Fatty Acid Ratio - At-home dried blood spot test', category: 'Diagnostic Tests' },
      { name: 'NAD Level Test', description: 'NAD+ / NADH (Total NAD) - At-home dried blood spot test', category: 'Diagnostic Tests' },
      { name: 'Testosterone+ Test', description: 'Testosterone (Total + Free) - At-home dried blood spot test', category: 'Diagnostic Tests' },
    ];

    for (const test of bloodoTests) {
      const ref = db.collection('products').doc();
      await ref.set({
        ...test,
        supplierIds: ['supplier-bloodo'],
        status: 'published',
        isActive: true,
        productType: 'diagnostic_test',
        route: 'topical',
        aliases: [],
        components: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`    ✅ Created: ${test.name} (${ref.id})`);
    }
  } else {
    console.log(`  ✅ All Bloodo products are already linked.`);
  }

  console.log(`  ✅ TASK 5 DONE.\n`);
}

// ═══════════════════════════════════════════════════════════════════════
// TASK 6: Verify POD Poland & Vallida product links
// ═══════════════════════════════════════════════════════════════════════
async function task6_verifyPodVallida() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 TASK 6: Verify POD Poland & Vallida product links');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const supplierId of ['supplier-pod-poland', 'supplier-vallida']) {
    const snap = await db.collection('products')
      .where('supplierIds', 'array-contains', supplierId)
      .get();

    console.log(`\n  📊 ${supplierId}: ${snap.size} products linked`);

    let variantCount = 0;
    for (const doc of snap.docs) {
      const data = doc.data();
      const varSnap = await db.collection('products').doc(doc.id)
        .collection('variants').get();
      variantCount += varSnap.size;
      console.log(`    → ${data.name} (${data.category || '—'}) — ${varSnap.size} variants`);
    }
    console.log(`    📊 Total variants: ${variantCount}`);

    // Ensure status is active on supplier record
    const supDoc = await db.collection('suppliers').doc(supplierId).get();
    if (supDoc.exists) {
      const supData = supDoc.data();
      if (!supData.status || supData.status !== 'active') {
        await db.collection('suppliers').doc(supplierId).update({
          status: 'active',
          updatedAt: FieldValue.serverTimestamp(),
        });
        console.log(`    ✏️  Set status → "active"`);
      }
    }
  }

  console.log(`\n  ✅ TASK 6 DONE.\n`);
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 6G — Full Supplier & Wholeseller Cleanup         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  await task1_purgeWholesellers();
  await task2_deleteShellSuppliers();
  await task3_completeCategories();
  await task4_auditLotusland();
  await task5_linkBloodo();
  await task6_verifyPodVallida();

  // Final summary
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  ✅ ALL TASKS COMPLETE                                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  // Final verification — print remaining suppliers
  console.log('\n📋 Final Supplier List:');
  const finalSnap = await db.collection('suppliers').get();
  for (const doc of finalSnap.docs) {
    const d = doc.data();
    const prodSnap = await db.collection('products')
      .where('supplierIds', 'array-contains', doc.id)
      .get();
    console.log(`  ${doc.id.padEnd(30)} ${(d.name || '?').padEnd(25)} ${(d.category || '—').padEnd(22)} ${(d.status || '—').padEnd(10)} ${prodSnap.size} products`);
  }

  console.log('\n📋 Final Wholeseller List:');
  const wsSnap = await db.collection('wholesellers').get();
  wsSnap.forEach(doc => {
    const d = doc.data();
    console.log(`  ${doc.id.padEnd(30)} ${(d.companyName || d.name || '?').padEnd(40)}`);
  });

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});

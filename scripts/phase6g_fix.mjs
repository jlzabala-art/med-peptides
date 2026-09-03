#!/usr/bin/env node
/**
 * Phase 6G-FIX — Fix Bloodo false-positive links + misc cleanup
 * 
 * 1. Remove supplier-bloodo from non-test products (false positives)
 * 2. Set missing status: "active" on supplier-fusion, supplier-magenta
 * 3. Fix POD Poland product categories → "Peptides"
 * 4. Fix Vallida product categories → "Peptides"
 */
import { initializeApp } from 'firebase-admin/app';
import { applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault(), projectId: 'med-peptides-app' });
const db = getFirestore();

// Products that SHOULD be linked to Bloodo (actual diagnostic tests)
const LEGIT_BLOODO_PRODUCTS = new Set([
  'cortisol-test',
  'hemoglobin-a1c-hba1c-test',
  'nad-level-test',
  'omega-ratio-test',
  'testosterone-test',
  'vitamin-d-test',
  'bloodo-nad-level-test',
]);

async function fixBloodoLinks() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 FIX 1: Remove Bloodo false-positive links');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const snap = await db.collection('products')
    .where('supplierIds', 'array-contains', 'supplier-bloodo')
    .get();

  const batch = db.batch();
  let removed = 0;
  let kept = 0;

  for (const doc of snap.docs) {
    if (LEGIT_BLOODO_PRODUCTS.has(doc.id)) {
      console.log(`  ✅ Keep: ${doc.id} → "${doc.data().name}"`);
      kept++;
    } else {
      console.log(`  🗑️  Unlink: ${doc.id} → "${doc.data().name}"`);
      batch.update(doc.ref, {
        supplierIds: FieldValue.arrayRemove('supplier-bloodo'),
        updatedAt: FieldValue.serverTimestamp(),
      });
      removed++;
    }
  }

  if (removed > 0) await batch.commit();
  console.log(`  ✅ Kept ${kept} legit links, removed ${removed} false positives.\n`);
}

async function fixMissingStatuses() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 FIX 2: Set status active on Fusion & Magenta');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const id of ['supplier-fusion', 'supplier-magenta']) {
    const ref = db.collection('suppliers').doc(id);
    const doc = await ref.get();
    if (doc.exists && doc.data().status !== 'active') {
      await ref.update({ status: 'active', updatedAt: FieldValue.serverTimestamp() });
      console.log(`  ✏️  ${id} → status: "active"`);
    } else {
      console.log(`  ✅ ${id} already active`);
    }
  }
  console.log();
}

async function fixPodVallidaCategories() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 FIX 3: Fix POD Poland & Vallida product categories');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const supplierId of ['supplier-pod-poland', 'supplier-vallida']) {
    const snap = await db.collection('products')
      .where('supplierIds', 'array-contains', supplierId)
      .get();

    const batch = db.batch();
    let fixed = 0;

    for (const doc of snap.docs) {
      const cat = doc.data().category;
      if (cat !== 'Peptides') {
        console.log(`  ✏️  ${doc.id}: "${cat}" → "Peptides" (${doc.data().name})`);
        batch.update(doc.ref, {
          category: 'Peptides',
          updatedAt: FieldValue.serverTimestamp(),
        });
        fixed++;
      }
    }

    if (fixed > 0) await batch.commit();
    console.log(`  ✅ ${supplierId}: ${fixed} products fixed.\n`);
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 6G-FIX — Data Quality Corrections                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  await fixBloodoLinks();
  await fixMissingStatuses();
  await fixPodVallidaCategories();

  // Final verification
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Final Bloodo products:');
  const bloodoSnap = await db.collection('products')
    .where('supplierIds', 'array-contains', 'supplier-bloodo')
    .get();
  bloodoSnap.forEach(d => console.log(`  → ${d.id}: ${d.data().name} (${d.data().category})`));

  console.log('\n📋 Final Supplier Status:');
  const supSnap = await db.collection('suppliers').get();
  for (const doc of supSnap.docs) {
    const d = doc.data();
    const prodCount = (await db.collection('products')
      .where('supplierIds', 'array-contains', doc.id).get()).size;
    console.log(`  ${doc.id.padEnd(30)} ${(d.name || '?').padEnd(22)} ${(d.category || '—').padEnd(22)} ${(d.status || '—').padEnd(10)} ${prodCount} products`);
  }

  console.log('\n✅ ALL FIXES APPLIED.');
  process.exit(0);
}

main().catch(err => { console.error('❌', err); process.exit(1); });

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
let credential;

if (existsSync(join(__dirname, 'serviceAccountKey.json'))) {
  const sa = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
  credential = cert(sa);
} else {
  credential = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  });
}

if (!getApps().length) initializeApp({ credential });
const db = getFirestore();

async function runDeepAuditAndCleanup() {
  console.log('====================================================');
  console.log('🚀 DEEP CATALOG AUDIT & AUTOMATIC CLEANUP / MIGRATION');
  console.log('====================================================\n');

  const prodsSnap = await db.collection('products').get();
  console.log(`📦 Loaded ${prodsSnap.docs.length} total products from Firestore.\n`);

  let migratedProductStatuses = 0;
  let emptyProducts = [];
  let duplicateSlugs = new Map();
  let duplicateNames = new Map();
  let productsWithoutVariants = [];
  let updatedVariantsTotal = 0;
  let batch = db.batch();
  let batchCount = 0;

  async function commitBatchIfNeeded(force = false) {
    if (batchCount >= 400 || (force && batchCount > 0)) {
      await batch.commit();
      console.log(`  💾 Committed batch with ${batchCount} operations.`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  // 1. Process Products
  for (const doc of prodsSnap.docs) {
    const data = doc.data();
    const docId = doc.id;
    const name = (data.canonicalName || data.name || '').trim();
    const slug = (data.slug || docId).trim().toLowerCase();

    // Track duplicate slugs
    if (slug) {
      if (!duplicateSlugs.has(slug)) duplicateSlugs.set(slug, []);
      duplicateSlugs.get(slug).push({ id: docId, name, status: data.status });
    }

    // Track duplicate canonical names
    if (name) {
      const normName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!duplicateNames.has(normName)) duplicateNames.set(normName, []);
      duplicateNames.get(normName).push({ id: docId, name, slug, status: data.status });
    }

    // Check if product is completely empty
    if (!name && !data.description && (!data.variants || data.variants.length === 0)) {
      emptyProducts.push(docId);
    }

    // Normalization & Status migration
    let needsUpdate = false;
    const updates = {};

    let currentStatus = data.status;
    if (currentStatus === 'published' || currentStatus === 'Active' || (!currentStatus && data.isActive !== false)) {
      updates.status = 'active';
      updates.isActive = true;
      needsUpdate = true;
      migratedProductStatuses++;
    } else if (currentStatus === 'active' && data.isActive === false) {
      updates.isActive = true;
      needsUpdate = true;
    }

    // Normalize embedded variants array
    if (Array.isArray(data.variants) && data.variants.length > 0) {
      let varUpdated = false;
      const seenVariantSignatures = new Set();
      const cleanVariants = [];

      data.variants.forEach((v, idx) => {
        const vStatus = (v.status === 'published' || v.status === 'Active' || !v.status) ? 'active' : v.status;
        const vSupplier = v.supplierId || v.supplier || data.supplierId || data.supplier || 'supplier-generic';
        const vDose = String(v.dosage || v.dose || v.weight || 'standard').trim().toLowerCase();
        const vPres = (v.presentation || v.format || 'vial').trim().toLowerCase();
        
        // Check for duplicate identical variants within same product
        const sig = `${vSupplier}_${vDose}_${vPres}`;
        if (seenVariantSignatures.has(sig) && v.price === data.variants[idx - 1]?.price) {
          console.log(`    ⚠️ Found duplicate embedded variant on [${docId}]: ${sig}`);
          varUpdated = true;
          return; // Skip duplicate
        }
        seenVariantSignatures.add(sig);

        if (v.status !== vStatus || !v.supplierId) {
          varUpdated = true;
          cleanVariants.push({
            ...v,
            status: vStatus,
            supplierId: vSupplier,
            supplierName: v.supplierName || (vSupplier.startsWith('supplier-') ? vSupplier.replace(/^supplier-/, '').charAt(0).toUpperCase() + vSupplier.slice(10) : vSupplier)
          });
        } else {
          cleanVariants.push(v);
        }
      });

      if (varUpdated) {
        updates.variants = cleanVariants;
        needsUpdate = true;
      }
    } else {
      productsWithoutVariants.push({ id: docId, name, slug });
    }

    if (needsUpdate) {
      updates.updatedAt = new Date().toISOString();
      batch.update(doc.ref, updates);
      batchCount++;
      await commitBatchIfNeeded();
    }
  }

  await commitBatchIfNeeded(true);
  console.log(`✅ Migrated ${migratedProductStatuses} products to status: 'active'.\n`);

  // 2. Process Subcollection Variants
  console.log('🔄 Migrating Subcollection Variants...');
  const varSnap = await db.collectionGroup('variants').get();
  console.log(`📦 Found ${varSnap.docs.length} subcollection variants.`);

  for (const doc of varSnap.docs) {
    const data = doc.data();
    let vNeedsUpdate = false;
    const vUpdates = {};

    if (data.status === 'published' || data.status === 'Active' || (!data.status && data.isActive !== false)) {
      vUpdates.status = 'active';
      vUpdates.isActive = true;
      vNeedsUpdate = true;
    }

    if (vNeedsUpdate) {
      vUpdates.updatedAt = new Date().toISOString();
      batch.update(doc.ref, vUpdates);
      batchCount++;
      updatedVariantsTotal++;
      await commitBatchIfNeeded();
    }
  }

  await commitBatchIfNeeded(true);
  console.log(`✅ Migrated ${updatedVariantsTotal} subcollection variants to status: 'active'.\n`);

  // 3. Print Duplicate Audit Report
  console.log('====================================================');
  console.log('🔍 DUPLICATES & ANOMALIES AUDIT REPORT');
  console.log('====================================================\n');

  console.log('--- 1. Potential Duplicate Slugs ---');
  let duplicateSlugCount = 0;
  for (const [slug, prods] of duplicateSlugs.entries()) {
    if (prods.length > 1) {
      duplicateSlugCount++;
      console.log(`  🚨 Slug "${slug}" has ${prods.length} products:`);
      prods.forEach(p => console.log(`     - [${p.id}] "${p.name}" (Status: ${p.status})`));
    }
  }
  if (duplicateSlugCount === 0) console.log('  ✨ No duplicate slugs found.');

  console.log('\n--- 2. Potential Duplicate Names / Similar Products ---');
  let duplicateNameCount = 0;
  for (const [normName, prods] of duplicateNames.entries()) {
    if (prods.length > 1) {
      duplicateNameCount++;
      console.log(`  ⚠️ Similar canonical name [${normName}] shared by ${prods.length} products:`);
      prods.forEach(p => console.log(`     - [${p.id}] "${p.name}" (Slug: ${p.slug}, Status: ${p.status})`));
    }
  }
  if (duplicateNameCount === 0) console.log('  ✨ No duplicate product names found.');

  console.log('\n--- 3. Products Without Embedded Variants ---');
  console.log(`  ℹ️ Found ${productsWithoutVariants.length} products without embedded variants:`);
  productsWithoutVariants.slice(0, 10).forEach(p => console.log(`     - [${p.id}] "${p.name}"`));
  if (productsWithoutVariants.length > 10) {
    console.log(`     ... and ${productsWithoutVariants.length - 10} more.`);
  }

  if (emptyProducts.length > 0) {
    console.log('\n--- 4. Completely Empty / Orphan Products ---');
    console.log(`  🗑️ Empty products count: ${emptyProducts.length}`);
    emptyProducts.forEach(id => console.log(`     - [${id}]`));
  }

  // 4. Trigger recalculation of catalog facets metadata
  console.log('\n🔄 Recalculating _meta/catalog_facets in Firestore...');
  try {
    const { recalculateFacets } = await import('../src/services/facetsService.js');
    if (typeof recalculateFacets === 'function') {
      await recalculateFacets();
      console.log('✅ Catalog facets metadata recalculated successfully.');
    }
  } catch (err) {
    console.warn('Note on facets recalculation:', err.message);
  }

  console.log('\n✨ AUDIT AND CLEANUP SCRIPT FINISHED SUCCESSFULLY!');
}

runDeepAuditAndCleanup().catch(console.error);

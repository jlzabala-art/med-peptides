import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
try {
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {}
const adminDb = getFirestore();

async function run() {
  console.log('Fetching suppliers and categories...');
  const [suppliersSnap, categoriesSnap] = await Promise.all([
    adminDb.collection('suppliers').get(),
    adminDb.collection('categories').get()
  ]);

  const supplierIdToComputedId = {};
  suppliersSnap.forEach(doc => {
    const data = doc.data();
    const computed = (data.companyName || data.name || '').toLowerCase().replace(/\s+/g, '-');
    supplierIdToComputedId[doc.id] = computed;
  });

  const categoryIdToComputedId = {};
  categoriesSnap.forEach(doc => {
    const data = doc.data();
    const computed = (data.name || '').toLowerCase().replace(/\s+/g, '-');
    categoryIdToComputedId[doc.id] = computed;
  });

  function findSupplierId(supplierName, currentId) {
    if (currentId && supplierIdToComputedId[currentId]) return currentId;
    if (!supplierName) return null;
    const computed = supplierName.toLowerCase().replace(/\s+/g, '-');
    const foundId = Object.keys(supplierIdToComputedId).find(key => {
      const s = supplierIdToComputedId[key];
      return s === computed || s.includes(computed) || computed.includes(s);
    });
    return foundId || null;
  }

  console.log('Scanning products...');
  const productsSnap = await adminDb.collection('products').get();
  
  let batch = adminDb.batch();
  let opCount = 0;
  let totalFixed = 0;

  async function commitBatch() {
    if (opCount > 0) {
      await batch.commit();
      console.log(`Committed ${opCount} updates.`);
      batch = adminDb.batch();
      opCount = 0;
    }
  }

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    let needsUpdate = false;
    let updates = {};

    const resolvedSupplierId = findSupplierId(data.supplierName || data.supplier, data.supplierId);
    if (resolvedSupplierId && data.supplierId !== resolvedSupplierId) {
      updates.supplierId = resolvedSupplierId;
      needsUpdate = true;
    }

    if (needsUpdate) {
      batch.update(doc.ref, updates);
      opCount++;
      totalFixed++;
      if (opCount >= 400) await commitBatch();
    }
  }
  await commitBatch();

  console.log(`Scanning variants...`);
  const variantsSnap = await adminDb.collectionGroup('variants').get();
  for (const doc of variantsSnap.docs) {
    const data = doc.data();
    let needsUpdate = false;
    let updates = {};

    const resolvedSupplierId = findSupplierId(data.supplierName || data.supplier, data.supplierId);
    if (resolvedSupplierId && data.supplierId !== resolvedSupplierId) {
      updates.supplierId = resolvedSupplierId;
      needsUpdate = true;
    }

    if (needsUpdate) {
      batch.update(doc.ref, updates);
      opCount++;
      totalFixed++;
      if (opCount >= 400) await commitBatch();
    }
  }
  await commitBatch();
  
  console.log(`Done. Fixed ${totalFixed} documents total.`);
}
run();

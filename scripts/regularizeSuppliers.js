import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

async function run() {
  const serviceAccount = JSON.parse(
    await readFile(new URL('../serviceAccountKey.json', import.meta.url))
  );

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
  const db = getFirestore();

  console.log('Fetching official suppliers...');
  const suppliersSnap = await db.collection('suppliers').get();
  
  // Create mapping from possible names to supplier ID
  const supplierMap = new Map();
  suppliersSnap.forEach(doc => {
    const data = doc.data();
    const id = doc.id;
    supplierMap.set(id.toLowerCase(), { id, name: data.companyName || data.name || id });
    if (data.companyName) supplierMap.set(data.companyName.toLowerCase(), { id, name: data.companyName });
    if (data.name) supplierMap.set(data.name.toLowerCase(), { id, name: data.name });
    
    // Custom fuzzy mappings just in case
    const fuzzyName = (data.companyName || data.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (fuzzyName) supplierMap.set(fuzzyName, { id, name: data.companyName || data.name });
  });

  console.log(`Loaded ${suppliersSnap.size} official suppliers. Map has ${supplierMap.size} keys.`);

  console.log('Fetching products...');
  const productsSnap = await db.collection('products').get();
  let updatedCount = 0;
  
  const batchArray = [];
  let currentBatch = db.batch();
  let operationCount = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    let needsUpdate = false;
    let updates = {};

    const rawId = data.supplierId;
    const rawName1 = data.supplierName;
    const rawName2 = data.supplier;

    let resolvedSupplier = null;

    // Try finding by ID first
    if (rawId && supplierMap.has(rawId.toLowerCase())) {
      resolvedSupplier = supplierMap.get(rawId.toLowerCase());
    } 
    // Try finding by supplierName
    else if (rawName1 && supplierMap.has(rawName1.toLowerCase())) {
      resolvedSupplier = supplierMap.get(rawName1.toLowerCase());
    }
    // Try finding by supplier
    else if (rawName2 && supplierMap.has(rawName2.toLowerCase())) {
      resolvedSupplier = supplierMap.get(rawName2.toLowerCase());
    }
    else {
      // Fuzzy match fallback
      const matchCandidates = [rawId, rawName1, rawName2].filter(Boolean);
      for (const cand of matchCandidates) {
        const fuzzyCand = cand.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (supplierMap.has(fuzzyCand)) {
          resolvedSupplier = supplierMap.get(fuzzyCand);
          break;
        }
      }
    }

    if (resolvedSupplier) {
      if (data.supplierId !== resolvedSupplier.id || data.supplierName !== resolvedSupplier.name) {
        updates.supplierId = resolvedSupplier.id;
        updates.supplierName = resolvedSupplier.name;
        needsUpdate = true;
      }
      
      // Clean up legacy field if it exists
      if (data.supplier !== undefined) {
        updates.supplier = null;
        needsUpdate = true;
      }
    } else {
      if (rawId || rawName1 || rawName2) {
        console.log(`⚠️ Could not resolve supplier for product ${doc.id} - ${data.canonicalName || data.name}`);
        console.log(`   Candidates: ID: ${rawId}, Name1: ${rawName1}, Name2: ${rawName2}`);
      }
    }

    if (needsUpdate) {
      console.log(`[UPDATE] ${doc.id} (${data.canonicalName}) -> ${resolvedSupplier.id}`);
      currentBatch.update(doc.ref, updates);
      updatedCount++;
      operationCount++;

      if (operationCount === 450) {
        batchArray.push(currentBatch);
        currentBatch = db.batch();
        operationCount = 0;
      }
    }
  }

  if (operationCount > 0) {
    batchArray.push(currentBatch);
  }

  console.log(`Prepared ${updatedCount} products for update across ${batchArray.length} batches.`);
  
  for (let i = 0; i < batchArray.length; i++) {
    await batchArray[i].commit();
    console.log(`Batch ${i + 1}/${batchArray.length} committed.`);
  }

  console.log('✅ Normalization complete.');
}

run().catch(console.error);

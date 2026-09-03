import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

import('dotenv').then(async (dotenv) => {
  dotenv.config({path: '.env.local'});
  const app = initializeApp({ credential: applicationDefault() });
  await run(getFirestore(app));
  process.exit(0);
});

async function run(db) {
  console.log('--- Starting Database Normalization ---');

  // 1. Fetch all wholesellers
  const suppliersSnap = await db.collection('wholesellers').get();
  const suppliers = [];
  suppliersSnap.forEach(doc => {
    const data = doc.data();
    suppliers.push({
      id: doc.id,
      name: (data.companyName || data.name || '').trim()
    });
  });
  console.log(`Loaded ${suppliers.length} suppliers.`);

  // 2. Fetch all products
  const productsSnap = await db.collection('products').get();
  let updatedProducts = 0;
  
  // supplierId -> count mapping
  const supplierProductCount = {};
  suppliers.forEach(s => supplierProductCount[s.id] = 0);

  const batch = db.batch();
  let batchCount = 0;

  productsSnap.forEach(doc => {
    const p = doc.data();
    const pSupplierName = (p.supplierName || p.supplier || '').trim().toLowerCase();
    
    // Find matching supplier
    let matchedId = null;
    if (p.supplierId && supplierProductCount[p.supplierId] !== undefined) {
      matchedId = p.supplierId;
    } else {
      for (const s of suppliers) {
        const sName = s.name.toLowerCase();
        if (sName.includes(pSupplierName) || pSupplierName.includes(sName)) {
          matchedId = s.id;
          break;
        }
      }
    }

    if (matchedId) {
      supplierProductCount[matchedId]++;
      if (p.supplierId !== matchedId) {
        batch.update(doc.ref, { supplierId: matchedId });
        updatedProducts++;
        batchCount++;
      }
    }
  });

  console.log(`Updating ${updatedProducts} products with correct supplierId...`);
  if (batchCount > 0) {
    await batch.commit();
    console.log('Product updates committed.');
  }

  // 3. Update wholesellers with correct productsSupplied
  let updatedSuppliers = 0;
  const sBatch = db.batch();
  let sBatchCount = 0;

  suppliersSnap.forEach(doc => {
    const currentCount = doc.data().productsSupplied || 0;
    const realCount = supplierProductCount[doc.id] || 0;
    
    if (currentCount !== realCount) {
      sBatch.update(doc.ref, { productsSupplied: realCount });
      updatedSuppliers++;
      sBatchCount++;
      console.log(`Updated supplier ${doc.id} count: ${currentCount} -> ${realCount}`);
    }
  });

  console.log(`Updating ${updatedSuppliers} suppliers with correct productsSupplied count...`);
  if (sBatchCount > 0) {
    await sBatch.commit();
    console.log('Supplier updates committed.');
  }

  console.log('--- Normalization Complete ---');
}

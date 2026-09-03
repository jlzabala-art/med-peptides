import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}) });
const db = getFirestore(app);

async function reconcile5Suppliers() {
  console.log('=== STARTING RECONCILIATION FOR 5 PEPTIDE SUPPLIERS ===\n');

  // 1. Ensure Vallida supplier exists
  const vallidaRef = db.collection('suppliers').doc('supplier-vallida');
  await vallidaRef.set({
    id: 'supplier-vallida',
    supplier_id: 'supplier-vallida',
    name: 'Vallida',
    companyName: 'Vallida Labs',
    country: 'United Kingdom',
    currency: 'USD',
    status: 'active',
    price_semantics: { wholesale: 'acquisition_cost', retail: 'indicative_retail' },
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('✅ Ensured supplier-vallida (UK, active)');

  // 2. Ensure Europeptides supplier fields
  const euroRef = db.collection('suppliers').doc('supplier-europeptides');
  await euroRef.set({
    id: 'supplier-europeptides',
    supplier_id: 'supplier-europeptides',
    name: 'Europeptides',
    companyName: 'Europeptides',
    country: 'Bulgaria',
    currency: 'EUR',
    status: 'active',
    price_semantics: { wholesale: 'acquisition_cost', retail: 'indicative_retail' },
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('✅ Ensured supplier-europeptides (Bulgaria, active)');

  // 3. Ensure Bioniq supplier fields
  const bioniqRef = db.collection('suppliers').doc('supplier-bioniq');
  await bioniqRef.set({
    id: 'supplier-bioniq',
    supplier_id: 'supplier-bioniq',
    name: 'Bioniq',
    companyName: 'Bioniq',
    country: 'United Kingdom',
    currency: 'EUR',
    status: 'active',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('✅ Ensured supplier-bioniq (UK, active)');

  // 4. Ensure NP Labs supplier fields
  const nplabsRef = db.collection('suppliers').doc('supplier-nplabs');
  await nplabsRef.set({
    id: 'supplier-nplabs',
    supplier_id: 'supplier-nplabs',
    name: 'NP Labs',
    companyName: 'NP Labs',
    country: 'Greece',
    currency: 'USD',
    status: 'active',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('✅ Ensured supplier-nplabs (Greece, active)');

  // 5. Ensure Lotusland supplier fields
  const lotusSuppSnap = await db.collection('suppliers').where('name', '>=', 'Lotusland').get();
  let lotusSuppId = 'supplier-lotusland';
  if (!lotusSuppSnap.empty) {
    lotusSuppId = lotusSuppSnap.docs[0].id;
  }
  await db.collection('suppliers').doc(lotusSuppId).set({
    id: lotusSuppId,
    name: 'Lotusland Limited',
    companyName: 'Lotusland Limited',
    country: 'Hong Kong',
    status: 'active',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log(`✅ Ensured Lotusland supplier doc (${lotusSuppId})`);

  // 6. Batch update products
  console.log('\n--- Batch Normalizing Products ---');
  const prodsSnap = await db.collection('products').get();
  let batches = [db.batch()];
  let batchIdx = 0;
  let opCount = 0;
  let updateCount = 0;

  prodsSnap.docs.forEach(doc => {
    const p = doc.data();
    const suppId = (p.supplierId || '').toLowerCase();
    const suppName = (p.supplierName || '').toLowerCase();
    const docId = doc.id.toLowerCase();

    let updates = {};

    // Vallida
    if (suppId.includes('vallida') || suppName.includes('vallida') || docId.includes('vallida')) {
      if (p.supplierId !== 'supplier-vallida' || p.supplierName !== 'Vallida' || p.status !== 'active') {
        updates.supplierId = 'supplier-vallida';
        updates.supplierName = 'Vallida';
        updates.status = 'active';
      }
    }
    // Bioniq
    else if (suppId.includes('bioniq') || suppName.includes('bioniq')) {
      if (p.status !== 'active' || p.supplierName !== 'Bioniq') {
        updates.status = 'active';
        updates.supplierName = 'Bioniq';
        updates.supplierId = 'supplier-bioniq';
      }
    }
    // Europeptides
    else if (suppId.includes('europeptides') || suppName.includes('europeptides')) {
      if (p.status !== 'active' || p.supplierName !== 'Europeptides') {
        updates.status = 'active';
        updates.supplierName = 'Europeptides';
        updates.supplierId = 'supplier-europeptides';
      }
    }
    // NP Labs
    else if (suppId.includes('nplab') || suppName.includes('np lab')) {
      if (p.supplierName !== 'NP Labs') {
        updates.supplierName = 'NP Labs';
        updates.supplierId = 'supplier-nplabs';
      }
    }

    if (Object.keys(updates).length > 0) {
      batches[batchIdx].update(doc.ref, updates);
      updateCount++;
      opCount++;

      if (opCount >= 400) {
        batches.push(db.batch());
        batchIdx++;
        opCount = 0;
      }
    }
  });

  if (updateCount > 0) {
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
    }
    console.log(`✅ Committed batch updates for ${updateCount} products.`);
  } else {
    console.log(`✅ All products already normalized.`);
  }

  // 7. Update productsSupplied count on suppliers
  console.log('\n--- Updating productsSupplied count on supplier documents ---');
  const freshProdsSnap = await db.collection('products').select('supplierId', 'supplierName').get();
  const freshProds = freshProdsSnap.docs.map(d => d.data());

  const countMap = {
    'supplier-nplabs': 0,
    'supplier-europeptides': 0,
    'supplier-vallida': 0,
    'supplier-bioniq': 0,
    [lotusSuppId]: 0
  };

  freshProds.forEach(p => {
    const sId = (p.supplierId || '').toLowerCase();
    const sName = (p.supplierName || '').toLowerCase();

    if (sId.includes('nplab') || sName.includes('np lab')) countMap['supplier-nplabs']++;
    else if (sId.includes('europeptides') || sName.includes('europeptides')) countMap['supplier-europeptides']++;
    else if (sId.includes('vallida') || sName.includes('vallida')) countMap['supplier-vallida']++;
    else if (sId.includes('bioniq') || sName.includes('bioniq')) countMap['supplier-bioniq']++;
    else if (sId.includes('lotusland') || sName.includes('lotus land') || sId === lotusSuppId.toLowerCase()) countMap[lotusSuppId]++;
  });

  for (const [suppId, count] of Object.entries(countMap)) {
    await db.collection('suppliers').doc(suppId).set({
      productsSupplied: count
    }, { merge: true });
    console.log(`Updated ${suppId} productsSupplied: ${count}`);
  }

  console.log('\n=== RECONCILIATION COMPLETE ===');
  process.exit(0);
}

reconcile5Suppliers().catch(err => {
  console.error(err);
  process.exit(1);
});

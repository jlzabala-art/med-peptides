import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Utility for concurrency
async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item, array));
    ret.push(p);
    if (poolLimit <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

async function createMissingVariants() {
  console.log('Fetching all products...');
  const productsSnap = await db.collection('products').get();
  console.log(`Found ${productsSnap.size} products.`);

  const missingVariantProducts = [];

  console.log('Checking variants for all products...');
  await asyncPool(20, productsSnap.docs, async (doc) => {
    const variantsSnap = await doc.ref.collection('variants').limit(1).get();
    if (variantsSnap.empty) {
      missingVariantProducts.push({ id: doc.id, data: doc.data(), ref: doc.ref });
    }
  });

  console.log(`Found ${missingVariantProducts.length} products with 0 variants.`);

  if (missingVariantProducts.length === 0) {
    console.log('No missing variants to create. Exiting.');
    return;
  }

  let batch = db.batch();
  let opCount = 0;
  let totalCreated = 0;

  for (const product of missingVariantProducts) {
    const data = product.data;
    
    // Determine Supplier
    let supplierId = data.supplierId || data.supplier;
    let supplierName = data.supplierName || data.supplier;
    
    if (!supplierId || supplierId === '-' || supplierId === '—') {
      if (data.productType === 'test' || data.category === 'diagnostic_test') {
        supplierId = 'fagron_genomics';
        supplierName = 'Fagron Genomics';
      } else {
        supplierId = 'fagron_iberia';
        supplierName = 'Fagron Iberia';
      }
    }

    // Determine Presentation
    let presentation = data.presentation || data.format || data.presentationType;
    if (!presentation || presentation === '-' || presentation === '—') {
      if (data.productType === 'supplement') {
        presentation = 'oral_capsule';
      } else {
        presentation = 'vial'; 
      }
    }
    presentation = presentation.toLowerCase().replace(/\s+/g, '_');

    // Determine Dosage
    let dosage = data.dosage || data.dose;
    if (!dosage || dosage === '-' || dosage === '—') {
      dosage = 'Standard Dose';
    }

    // Price
    let price = parseFloat(data.price || data.unit_price || 0);
    if (isNaN(price)) price = 0;

    const variantId = `${product.id}-default`;
    const variantRef = product.ref.collection('variants').doc(variantId);

    const variantData = {
      name: data.name || data.canonicalName || product.id,
      productId: product.id,
      supplierId: supplierId,
      supplierName: supplierName || supplierId,
      presentation: presentation,
      dosage: dosage,
      price: price,
      unit_price: price,
      stock: parseInt(data.stock || 100, 10),
      isActive: true,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true 
    };

    batch.set(variantRef, variantData);
    opCount++;
    totalCreated++;

    if (opCount === 500) {
      console.log(`Committing batch of ${opCount} variants...`);
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    console.log(`Committing final batch of ${opCount} variants...`);
    await batch.commit();
  }

  console.log(`Successfully created ${totalCreated} default variants.`);
}

createMissingVariants().catch(console.error);

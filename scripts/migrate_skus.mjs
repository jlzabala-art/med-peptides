import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try {
  initializeApp();
} catch (e) {
  // Ignore if already initialized
}

const db = getFirestore();

function generateRandomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function getBaseSkuPrefix(name) {
  if (!name) return 'UNK';
  const prefix = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  return prefix.padEnd(3, 'X');
}

async function migrateSkus() {
  console.log('Starting SKU migration...');
  let productsUpdated = 0;
  let variantsUpdated = 0;

  const productsSnap = await db.collection('products').get();
  console.log(`Found ${productsSnap.size} products.`);

  const batch = db.batch();
  let operationCount = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    let productSku = data.sku;

    // Fix product SKU if missing
    if (!productSku || productSku.trim() === '') {
      const prefix = getBaseSkuPrefix(data.name);
      productSku = `SKU-${prefix}-${generateRandomCode()}`;
      batch.update(doc.ref, { sku: productSku, updatedAt: new Date().toISOString() });
      productsUpdated++;
      operationCount++;
      console.log(`Updated product ${doc.id} with SKU: ${productSku}`);
    }

    // Now check its variants
    const variantsSnap = await doc.ref.collection('variants').get();
    for (const vDoc of variantsSnap.docs) {
      const vData = vDoc.data();
      let variantSku = vData.sku;

      // Fix variant SKU if missing
      if (!variantSku || variantSku.trim() === '') {
        const sizeOrFormat = (vData.size || vData.format || vDoc.id.substring(0,4)).toString().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        variantSku = `${productSku}-${sizeOrFormat}-${generateRandomCode()}`;
        batch.update(vDoc.ref, { sku: variantSku, updatedAt: new Date().toISOString() });
        variantsUpdated++;
        operationCount++;
        console.log(`Updated variant ${vDoc.id} with SKU: ${variantSku}`);
      }
    }

    if (operationCount >= 400) {
      console.log('Committing batch of 400 operations...');
      await batch.commit();
      operationCount = 0;
    }
  }

  if (operationCount > 0) {
    console.log(`Committing remaining ${operationCount} operations...`);
    await batch.commit();
  }

  console.log('Migration complete!');
  console.log(`Total Products Updated: ${productsUpdated}`);
  console.log(`Total Variants Updated: ${variantsUpdated}`);
}

migrateSkus().catch(console.error);

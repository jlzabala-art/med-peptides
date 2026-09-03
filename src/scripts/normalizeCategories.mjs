import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

async function main() {
  const serviceAccount = JSON.parse(
    await readFile(
      new URL('../../serviceAccount-target.json', import.meta.url)
    )
  );

  initializeApp({
    credential: cert(serviceAccount),
  });

  const db = getFirestore();
  const snapshot = await db.collection('products').get();
  
  const batches = [];
  let currentBatch = db.batch();
  let currentBatchCount = 0;
  let updatesCount = 0;
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    let updatedCategory = data.category;
    let needsUpdate = false;
    const updates = {};
    
    // Normalize missing categories
    if (!data.category || data.category === '') {
      if (data.device_type === 'pen') {
        updatedCategory = 'Prefilled Peptide Pens';
      } else if (data.productType === 'api_peptide') {
        updatedCategory = 'API Peptide';
      } else if (data.productType === 'iv_drip') {
        updatedCategory = 'Nutraceutical / Functional Ingredients';
      } else {
        // Fallback for remaining items
        updatedCategory = 'Other';
      }
      
      updates.category = updatedCategory;
      needsUpdate = true;
    }
    
    // Consolidate redundant categories
    if (updatedCategory === 'Pharmaceutical API' || updatedCategory === 'API Magistral' || updatedCategory === 'Magistral' || updatedCategory === 'VIAL' || updatedCategory === 'Lyophilized Peptide') {
      updates.category = 'API Peptide';
      needsUpdate = true;
    }
    
    // Clean up residual fields if they exist
    const residualFields = ['device_type', 'productType', 'original_category', 'product_type', 'typeData', 'price_type'];
    residualFields.forEach(field => {
      if (data[field] !== undefined) {
        updates[field] = FieldValue.delete();
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      currentBatch.update(doc.ref, updates);
      updatesCount++;
      currentBatchCount++;
      
      if (currentBatchCount >= 450) {
        batches.push(currentBatch.commit());
        currentBatch = db.batch();
        currentBatchCount = 0;
      }
    }
  });
  
  if (currentBatchCount > 0) {
    batches.push(currentBatch.commit());
  }
  
  console.log(`Found ${updatesCount} products to normalize...`);
  
  if (updatesCount > 0) {
    await Promise.all(batches);
    console.log("All batch commits successful!");
  } else {
    console.log("No updates needed.");
  }
}

main().catch(console.error);

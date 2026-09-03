import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

try {
  initializeApp();
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    throw error;
  }
}

const db = getFirestore();

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       
    .replace(/[^\w\-]+/g, '')   
    .replace(/\-\-+/g, '-');      
};

async function run() {
  const lotusPath = path.join(process.cwd(), 'AI Prompts', 'LotusLand Master Price List.json');
  const rawData = fs.readFileSync(lotusPath, 'utf-8');
  const lotusList = JSON.parse(rawData);

  const uniqueMasterNames = [...new Set(lotusList.map(item => item.product).filter(Boolean))];
  
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();

  const batchSize = 100;
  let batch = db.batch();
  let count = 0;
  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const product = doc.data();
    let matchedPeptideIds = new Set();
    
    const fullSearchText = (product.name || '').toLowerCase();

    for (const masterName of uniqueMasterNames) {
      const lowerMaster = masterName.toLowerCase();
      const masterSlug = slugify(masterName);
      
      const regex = new RegExp(`\\b${lowerMaster.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")}\\b`, 'i');
      
      if (regex.test(fullSearchText)) {
        matchedPeptideIds.add(masterSlug);
      }
    }

    if (/\bghk\b/i.test(fullSearchText)) {
       matchedPeptideIds.add(slugify('GHK-Cu (Human Copper)'));
    }

    const peptideIdsArray = Array.from(matchedPeptideIds);
    
    if (peptideIdsArray.length > 0) {
      const updates = {
        peptideIds: peptideIdsArray,
        peptideId: peptideIdsArray[0]
      };
      
      console.log(`Product "${product.name}" => Peptides:`, peptideIdsArray);
      batch.update(doc.ref, updates);
      count++;
      updatedCount++;

      if (count === batchSize) {
        await batch.commit();
        batch = db.batch();
        count = 0;
      }
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  console.log(`Finished migrating ${updatedCount} products.`);
}

run().catch(console.error);

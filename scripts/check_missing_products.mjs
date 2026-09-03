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

async function run() {
  const lotusPath = path.join(process.cwd(), 'AI Prompts', 'LotusLand Master Price List.json');
  const rawData = fs.readFileSync(lotusPath, 'utf-8');
  const lotusList = JSON.parse(rawData);

  const uniqueMasterNames = [...new Set(lotusList.map(item => item.product).filter(Boolean))];
  const masterLower = uniqueMasterNames.map(n => n.toLowerCase());

  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();

  const missingProducts = [];

  for (const doc of snapshot.docs) {
    const product = doc.data();
    if (product.name) {
      const pNameLower = product.name.toLowerCase();
      
      // Let's do a loose inclusion check or exact match
      // Exact match is safer, but loose match might be needed
      let found = false;
      for (const mLower of masterLower) {
         if (pNameLower === mLower || pNameLower.includes(mLower) || mLower.includes(pNameLower)) {
            found = true;
            break;
         }
      }

      if (!found) {
        const pSupplier = product.supplier ? product.supplier.toLowerCase() : (product.brand ? product.brand.toLowerCase() : '');
        
        const isPeptide = pSupplier.includes('magenta') || 
                          pSupplier.includes('europeptidos') || 
                          pSupplier.includes('europeptide') || 
                          pSupplier.includes('fussion');
                          
        if (isPeptide) {
          missingProducts.push(product.name);
        }
      }
    }
  }

  console.log('--- Missing Products ---');
  if (missingProducts.length === 0) {
    console.log('All database products exist in Lotusland catalog.');
  } else {
    missingProducts.forEach(p => console.log(p));
  }
}

run().catch(console.error);

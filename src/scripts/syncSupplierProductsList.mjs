import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function run() {
  const productsSnap = await db.collection('products').get();
  
  // Group product names by supplier
  const supplierProductsMap = {};
  
  productsSnap.docs.forEach(d => {
    const data = d.data();
    let sup = data.supplier || data.manufacturer;
    if (sup) {
      sup = sup.toLowerCase().replace(' limited', '').trim();
      if (!supplierProductsMap[sup]) {
        supplierProductsMap[sup] = new Set();
      }
      if (data.name) {
        supplierProductsMap[sup].add(data.name);
      }
    }
  });
  
  const wsSnap = await db.collection('wholesellers').get();
  const batch = db.batch();
  let count = 0;
  
  wsSnap.docs.forEach(d => {
    const data = d.data();
    const name = (data.companyName || data.name || '').toLowerCase().replace(' limited', '').trim();
    
    let productNames = new Set();
    
    for (const key in supplierProductsMap) {
      if (key.includes(name) || name.includes(key)) {
        supplierProductsMap[key].forEach(p => productNames.add(p));
      }
    }
    
    const productNamesArray = Array.from(productNames);
    
    // Only update if it changed
    const currentList = data.suppliedProductNames || [];
    const changed = productNamesArray.length !== currentList.length || !productNamesArray.every(p => currentList.includes(p));
    
    if (changed) {
      batch.update(d.ref, { suppliedProductNames: productNamesArray });
      count++;
      console.log(`Updated ${name} with ${productNamesArray.length} product names.`);
    }
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`Successfully updated ${count} suppliers with product lists.`);
  } else {
    console.log('No suppliers needed updating for product lists.');
  }
}

run().catch(console.error);

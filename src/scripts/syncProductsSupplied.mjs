import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const productsSnap = await getDocs(collection(db, 'products'));
  const supplierCounts = {};
  
  productsSnap.docs.forEach(d => {
    let sup = d.data().supplier || d.data().manufacturer;
    if (sup) {
      sup = sup.toLowerCase().replace(' limited', '').trim();
      supplierCounts[sup] = (supplierCounts[sup] || 0) + 1;
    }
  });
  
  const wsSnap = await getDocs(collection(db, 'wholesellers'));
  const batch = writeBatch(db);
  let count = 0;
  
  wsSnap.docs.forEach(d => {
    const data = d.data();
    const name = (data.companyName || data.name || '').toLowerCase().replace(' limited', '').trim();
    let total = 0;
    
    // Find matching keys in supplierCounts
    for (const key in supplierCounts) {
      if (key === name) {
        total += supplierCounts[key];
      }
    }
    
    if (total > 0 || data.productsSupplied !== total) {
      batch.update(doc(db, 'wholesellers', d.id), { productsSupplied: total });
      count++;
      console.log(`Updating ${name} with ${total} products`);
    }
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`Successfully updated ${count} suppliers.`);
  } else {
    console.log('No suppliers needed updating.');
  }
}

run().catch(console.error);

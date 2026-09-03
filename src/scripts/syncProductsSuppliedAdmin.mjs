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
  const supplierCounts = {};
  
  productsSnap.docs.forEach(d => {
    let sup = d.data().supplier || d.data().manufacturer;
    if (sup) {
      sup = sup.toLowerCase()
               .replace(/\s+(limited|ltd|llc|inc|co|gmbh|slu|sl|s\.a\.|s\.l\.|uab|fz llc|dmcc)$/g, '')
               .trim();
      supplierCounts[sup] = (supplierCounts[sup] || 0) + 1;
    }
  });

  const aliases = {
    'np labs international compounding pharmacy': 'nplab',
    'np labs': 'nplab',
    '24genetics s.l.': '24 genomics',
    '24genetics sl': '24 genomics',
    '24genetics': '24 genomics'
  };
  
  const wsSnap = await db.collection('wholesellers').get();
  const batch = db.batch();
  let count = 0;
  
  wsSnap.docs.forEach(d => {
    const data = d.data();
    const name = (data.companyName || data.name || '').toLowerCase()
               .replace(/\s+(limited|ltd|llc|inc|co|gmbh|slu|sl|s\.a\.|s\.l\.|uab|fz llc|dmcc)$/g, '')
               .trim();
    
    const lookupName = aliases[name] || name;
    let total = 0;
    
    // Find matching keys in supplierCounts
    for (const key in supplierCounts) {
      if (key === lookupName) {
        total += supplierCounts[key];
      }
    }
    
    if (total > 0 || data.productsSupplied !== total) {
      batch.update(d.ref, { productsSupplied: total });
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

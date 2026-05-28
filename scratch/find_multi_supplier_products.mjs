import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const pSnap = await db.collection('products').get();
  
  let count = 0;
  for (const doc of pSnap.docs) {
    const data = doc.data();
    const vSnap = await doc.ref.collection('variants').get();
    const suppliers = new Set();
    
    // Add product-level supplier
    if (data.supplier) {
      suppliers.add(data.supplier);
    }
    
    vSnap.forEach(vdoc => {
      const vdata = vdoc.data();
      if (vdata.supplier) {
        suppliers.add(vdata.supplier);
      }
    });
    
    if (data.variants) {
      Object.values(data.variants).forEach(v => {
        if (v.supplier) {
          suppliers.add(v.supplier);
        }
      });
    }
    
    if (suppliers.size > 1) {
      count++;
      console.log(`Product ${doc.id} (${data.name}) has multiple suppliers:`, [...suppliers]);
    }
  }
  
  console.log(`Total products with multiple suppliers: ${count}`);
}

run().then(() => process.exit(0));

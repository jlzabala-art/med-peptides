import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const pSnap = await db.collection('products').get();
  
  for (const doc of pSnap.docs) {
    const data = doc.data();
    const name = data.name || '';
    if (name === 'BPC-157' || name === 'TB-500' || name.includes('TB-500 (Thymosin')) {
      console.log(`\n==========================================`);
      console.log(`Product ID: ${doc.id}`);
      console.log(`Name: ${data.name}`);
      console.log(`Supplier: ${data.supplier}`);
      console.log(`isActive: ${data.isActive}`);
      console.log(`dosage: ${data.dosage}`);
      
      // Let's print subcollection variants
      const vSnap = await doc.ref.collection('variants').get();
      console.log(`Subcollection variants count: ${vSnap.size}`);
      vSnap.forEach(vdoc => {
        const vdata = vdoc.data();
        console.log(`- Variant ID: ${vdoc.id} | Name: ${vdata.name} | dosage: ${vdata.dosage} | supplier: ${vdata.supplier} | isProfessional: ${vdata.isProfessional}`);
      });
      
      // Flat variants field
      if (data.variants) {
        console.log(`Flat variants keys:`, Object.keys(data.variants));
        Object.entries(data.variants).forEach(([k, v]) => {
          console.log(`- Flat Variant [${k}]: Name: ${v.name} | dosage: ${v.dosage} | supplier: ${v.supplier} | isProfessional: ${v.isProfessional}`);
        });
      }
    }
  }
}

run().then(() => process.exit(0));

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function checkNPLAB() {
  const pSnap = await db.collection('products').where('supplier', '==', 'NPLAB').get();
  console.log(`Found ${pSnap.size} NPLAB products.`);
  
  let currencies = new Set();
  let pricingSample = [];
  
  for (const doc of pSnap.docs) {
    const data = doc.data();
    if (data.pricing) {
      const cur = data.pricing.retail?.currency || data.pricing.currency || 'unknown';
      currencies.add(cur);
      pricingSample.push({
        id: doc.id,
        name: data.name,
        pricing: data.pricing
      });
    }
    
    // Also check variants subcollection
    const vSnap = await doc.ref.collection('variants').get();
    vSnap.forEach(vdoc => {
      const vdata = vdoc.data();
      if (vdata.pricing) {
        const cur = vdata.pricing.retail?.currency || vdata.pricing.currency || 'unknown';
        currencies.add(cur);
        pricingSample.push({
          id: `${doc.id} (variant ${vdoc.id})`,
          name: data.name,
          pricing: vdata.pricing
        });
      }
    });
  }
  
  console.log('Currencies found on NPLAB products:', [...currencies]);
  console.log('\nSample pricing entries (first 5):');
  pricingSample.slice(0, 5).forEach(s => {
    console.log(`- ${s.id} (${s.name}):`, JSON.stringify(s.pricing, null, 2));
  });
}

checkNPLAB().then(() => process.exit(0));

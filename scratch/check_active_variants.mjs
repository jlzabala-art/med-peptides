import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }       from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function inspect() {
  const snap = await db.collection('products').get();
  console.log(`Total products: ${snap.size}`);
  
  let activeCount = 0;
  let draftCount = 0;
  let activeWithVariants = 0;
  let activeMultiVariants = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const isActive = data.isActive;
    const status = data.status;
    
    if (isActive && status === 'active') {
      activeCount++;
      const variantsSnap = await doc.ref.collection('variants').get();
      if (variantsSnap.size > 0) {
        activeWithVariants++;
        if (variantsSnap.size > 1) {
          activeMultiVariants++;
          console.log(`Active Multi-Variant Product: ${doc.id} (${data.name}) - ${variantsSnap.size} variants`);
          variantsSnap.forEach(vDoc => {
            console.log(`  - Variant: ${vDoc.id} (${vDoc.data().label})`);
          });
        }
      }
    } else {
      draftCount++;
    }
  }

  console.log(`\nActive products (isActive && status=='active'): ${activeCount}`);
  console.log(`Draft/Inactive products: ${draftCount}`);
  console.log(`Active products with at least one variant: ${activeWithVariants}`);
  console.log(`Active products with multiple variants: ${activeMultiVariants}`);
}

inspect().catch(console.error);

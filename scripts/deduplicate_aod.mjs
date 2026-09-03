import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

let credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
});

initializeApp({ credential });

const db = getFirestore();

async function mergeAllAOD() {
  const canonicalId = 'aod-9604';
  
  const canonicalDocRef = await db.collection('products').doc(canonicalId).get();
  if (!canonicalDocRef.exists) {
    console.error(`Canonical document ${canonicalId} not found at all!`);
    process.exit(1);
  }
  
  const snapshot = await db.collection('products').get();
  
  const aodProducts = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.name && data.name.trim().toUpperCase() === 'AOD-9604') {
      aodProducts.push({ id: doc.id, data });
    }
  });
  
  const canonicalDoc = { id: canonicalId, data: canonicalDocRef.data() };
  const duplicates = aodProducts.filter(p => p.id !== canonicalId);
  
  console.log(`Duplicates to merge: ${duplicates.length}`);
  
  let mergedVariants = [...(canonicalDoc.data.variants || [])];
  
  for (const dup of duplicates) {
    console.log(`\nMerging duplicate: ${dup.id}...`);
    const data = dup.data;
    
    let dupVariants = data.variants || [];
    
    if (dupVariants.length === 0) {
      dupVariants = [{
        id: `migrated-${dup.id}`,
        supplierId: data.supplierId || '',
        supplier: data.supplierName || data.supplier || 'Unknown',
        price: data.price || 0,
        unit_price: data.price || 0,
        cost_tiers: {
          cost_10: data.price_per_kit_10 || 0,
          cost_20: 0,
          cost_50: 0,
          cost_100: 0
        },
        label: data.presentation || 'Standard',
        dosage: data.dosage || data.strength || '',
        presentation: data.presentation || '',
        attributes: {
          format: data.presentation || '',
        }
      }];
    }
    
    mergedVariants = [...mergedVariants, ...dupVariants];
    
    await db.collection('products').doc(dup.id).update({
      isActive: false,
      status: 'archived',
      mergedInto: canonicalId
    });
  }
  
  await db.collection('products').doc(canonicalId).update({
    variants: mergedVariants
  });
  
  console.log('Done!');
}

mergeAllAOD().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});

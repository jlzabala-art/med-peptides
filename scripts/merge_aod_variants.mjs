import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

let credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
});

initializeApp({ credential });

const db = getFirestore();

async function mergeVariants() {
  console.log('Merging lotusland 5mg into aod-9604...');
  
  // Get the 5mg standalone document
  const standaloneDocRef = db.collection('products').doc('lotusland_aod_9604_5_mg_vial');
  const standaloneDoc = await standaloneDocRef.get();
  
  if (!standaloneDoc.exists) {
    console.log('Document lotusland_aod_9604_5_mg_vial does not exist!');
    process.exit(1);
  }
  
  const data = standaloneDoc.data();
  
  // Format it as a canonical variant
  const newVariant = {
    supplierId: data.supplierId || 'OLlBbQjgrj6tY7GmM2Jo',
    supplier: data.supplierName || 'Lotusland Limited',
    price: data.price,
    label: '5mg/vial – SC',
    attributes: {
      format: data.presentation || 'lyophilized',
      administration: 'SC',
      unitsPerPack: parseInt(data.quantity) || 10,
      dosageMg: 5
    },
    dosage: '5mg',
    pricing: {
      wholesale: null,
      clinic: null,
      supplierCost: null,
      retail: data.price || 70,
      volume10Kit: data.price_per_kit_10 || 380,
      kit: data.price_per_kit_10 || 380,
      perUnit: data.price || 70,
      currency: 'USD'
    },
    variantId: 'aod-9604-5mg-sc-default',
    sampleType: 'Vial'
  };
  
  // Add it to the main canonical document
  await db.collection('products').doc('aod-9604').update({
    variants: FieldValue.arrayUnion(newVariant)
  });
  
  console.log('Successfully merged 5mg variant into aod-9604');
  
  // Optionally, hide the old one so it doesn't show up in search/catalog duplicate
  await standaloneDocRef.update({
    isActive: false,
    status: 'archived',
    mergedInto: 'aod-9604'
  });
  console.log('Archived standalone document.');
}

mergeVariants().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./src/scripts/serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function cleanKlowAtRoot() {
  console.log('🚀 Starting ROOT-level cleanup for KLOW product & variants...');

  // 1. Clean klow-peptide
  const klowPeptideRef = db.collection('products').doc('klow-peptide');
  const kpDoc = await klowPeptideRef.get();
  if (!kpDoc.exists) {
    console.error('products/klow-peptide not found!');
    return;
  }
  const kpData = kpDoc.data();
  const allEmbedded = kpData.variants || [];

  // Find genuine Refill Cartridge and genuine Pre-filled Pen
  const genuineCartridge = allEmbedded.find(v => 
    (v.presentationName === 'Refill Cartridge' || v.format === 'cartridge') &&
    (v.docId?.includes('cartridge') || v.id?.includes('cartridge'))
  ) || allEmbedded[2];

  const genuinePen = allEmbedded.find(v => 
    (v.presentationName === 'Pre-filled Pen' || v.format === 'pen') &&
    (v.docId?.includes('pen') || v.id?.includes('pen'))
  ) || allEmbedded[3];

  // Clean objects ensuring format and presentation are exact
  const cleanCartridge = {
    ...genuineCartridge,
    id: 'klow-peptide-cartridge-bpc-157-6-mg-tb-500-6-mg-ghk-cu-30-mg-kpv-6-mg-3-ml-magenta',
    docId: 'klow-peptide-cartridge-bpc-157-6-mg-tb-500-6-mg-ghk-cu-30-mg-kpv-6-mg-3-ml-magenta',
    format: 'cartridge',
    presentation: 'Refill Cartridge',
    presentationName: 'Refill Cartridge',
    unit_price: 489.1,
    price_aed: 489.1,
    price: 489.1,
    currency: 'AED',
    dosage: '6 mg + 6 mg + 30 mg + 6 mg',
    dose: '6 mg + 6 mg + 30 mg + 6 mg',
    fill_volume: '3 mL',
    supplier: 'Magenta',
    supplierName: 'Magenta',
    supplierId: 'supplier-magenta',
    supplier_id: 'supplier-magenta',
    updatedAt: new Date().toISOString()
  };

  const cleanPen = {
    ...genuinePen,
    id: 'klow-peptide-pen-bpc-157-6-mg-tb-500-6-mg-ghk-cu-30-mg-kpv-6-mg-3-ml-magenta',
    docId: 'klow-peptide-pen-bpc-157-6-mg-tb-500-6-mg-ghk-cu-30-mg-kpv-6-mg-3-ml-magenta',
    format: 'pen',
    presentation: 'Pre-filled Pen',
    presentationName: 'Pre-filled Pen',
    unit_price: 516.35,
    price_aed: 516.35,
    price: 516.35,
    currency: 'AED',
    dosage: '6 mg + 6 mg + 30 mg + 6 mg',
    dose: '6 mg + 6 mg + 30 mg + 6 mg',
    fill_volume: '3 mL',
    supplier: 'Magenta',
    supplierName: 'Magenta',
    supplierId: 'supplier-magenta',
    supplier_id: 'supplier-magenta',
    updatedAt: new Date().toISOString()
  };

  const cleanVariants = [cleanCartridge, cleanPen];

  console.log('Updating products/klow-peptide embedded variants from 4 to 2...');
  await klowPeptideRef.update({
    variants: cleanVariants,
    variantsCount: 2,
    suppliers: ['supplier-magenta'],
    updatedAt: new Date().toISOString()
  });

  // Update subcollection documents in products/klow-peptide/variants
  console.log('Updating products/klow-peptide/variants subcollection documents...');
  await klowPeptideRef.collection('variants').doc(cleanCartridge.id).set(cleanCartridge, { merge: true });
  await klowPeptideRef.collection('variants').doc(cleanPen.id).set(cleanPen, { merge: true });

  // 2. Delete the duplicate product doc 'products/klow'
  const dupDocRef = db.collection('products').doc('klow');
  const dupDoc = await dupDocRef.get();
  if (dupDoc.exists) {
    console.log('Deleting duplicate product doc products/klow and its subcollection...');
    const dupSub = await dupDocRef.collection('variants').get();
    for (const d of dupSub.docs) {
      await d.ref.delete();
      console.log(`Deleted subcollection variant ${d.id} from products/klow`);
    }
    await dupDocRef.delete();
    console.log('Deleted products/klow successfully.');
  }

  console.log('✅ Root-level cleanup complete!');
}

cleanKlowAtRoot().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});

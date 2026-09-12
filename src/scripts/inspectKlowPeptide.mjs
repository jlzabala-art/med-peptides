import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./src/scripts/serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function inspectKlowPeptide() {
  const doc = await db.collection('products').doc('klow-peptide').get();
  const data = doc.data();
  console.log('--- EMBEDDED VARIANTS ---');
  (data.variants || []).forEach((v, i) => {
    console.log(`[${i}]`, {
      docId: v.docId || v.id,
      format: v.format,
      presentation: v.presentation,
      presentationName: v.presentationName,
      unit_price: v.unit_price,
      price_aed: v.price_aed,
      currency: v.currency,
      dosage: v.dosage
    });
  });

  console.log('\n--- SUBCOLLECTION VARIANTS ---');
  const subSnap = await db.collection('products').doc('klow-peptide').collection('variants').get();
  subSnap.forEach(sv => {
    const v = sv.data();
    console.log(sv.id, {
      format: v.format,
      presentation: v.presentation,
      presentationName: v.presentationName,
      unit_price: v.unit_price,
      price_aed: v.price_aed,
      currency: v.currency,
      dosage: v.dosage
    });
  });
}

inspectKlowPeptide().then(() => process.exit(0)).catch(console.error);

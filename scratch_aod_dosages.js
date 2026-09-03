import { adminDb } from './src/lib/firebaseAdmin.js';
async function test() {
  const vSnap = await adminDb.collection('products').doc('aod-9604').collection('variants').get();
  vSnap.forEach(d => {
    const data = d.data();
    console.log(`Variant: ${d.id}, supplier: ${data.supplierId || data.supplier}, dosage: ${data.dosage || data.strength || 'N/A'}`);
  });
}
test().catch(console.error);

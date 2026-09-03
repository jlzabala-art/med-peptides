import { adminDb } from './src/lib/firebaseAdmin.js';
async function test() {
  const vSnap = await adminDb.collection('products').doc('aod-9604').collection('variants').get();
  const variants = vSnap.docs.map(d => d.data());
  const suppliers = variants.map(v => v?.supplierId || v?.supplier || 'lotusland');
  const uniqueSuppliers = [...new Set(suppliers)];
  console.log("Unique suppliers:", uniqueSuppliers);
}
test().catch(console.error);

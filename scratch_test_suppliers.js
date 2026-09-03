import { adminDb } from './src/lib/firebaseAdmin.js';

async function test() {
  const vSnap = await adminDb.collection('products').doc('aod-9604').collection('variants').get();
  vSnap.forEach(d => {
    const v = d.data();
    console.log(`id: ${d.id}, supplierId: ${v.supplierId}, supplier: ${v.supplier}`);
  });
}
test().catch(console.error);

import { adminDb } from './src/lib/firebaseAdmin.js';

async function check() {
  const pSnap = await adminDb.collection('products').where('name', '==', 'AOD-9604').get();
  for (const p of pSnap.docs) {
    const vSnap = await p.ref.collection('variants').get();
    vSnap.forEach(d => {
      console.log(`Product: ${p.id}, Variant: ${d.id}`);
      const data = d.data();
      console.log(` supplierId: ${data.supplierId}`);
      console.log(` supplier: ${data.supplier}`);
    });
  }
}
check().catch(console.error);

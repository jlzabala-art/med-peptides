import { adminDb } from './src/lib/firebaseAdmin.js';

async function check() {
  const pSnap = await adminDb.collection('products').where('name', '>=', 'AOD-9604').where('name', '<=', 'AOD-9604\uf8ff').get();
  for (const p of pSnap.docs) {
    const vSnap = await p.ref.collection('variants').get();
    vSnap.forEach(d => {
      const v = d.data();
      if ((v.supplier || '').toLowerCase().includes('fagron') || (v.supplierId || '').toLowerCase().includes('fagron')) {
         console.log(`Product: ${p.id}, Variant: ${d.id}`);
         console.log(`FormatId: ${v.formatId}, format: ${v.format}, presentation: ${v.presentation}`);
      }
    });
  }
}
check().catch(console.error);

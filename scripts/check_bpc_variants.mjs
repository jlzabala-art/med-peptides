import { db } from './lib/firebase-admin.mjs';

async function check() {
  const p = await db.collection('products').doc('bpc-157').collection('variants').get();
  p.docs.forEach(doc => {
    const d = doc.data();
    if (d.supplierId === 'supplier-nplabs' || d.supplier === 'NP LABS') {
      console.log(`BPC-157 Variant: ${doc.id}`);
      console.log(`  - supplier: ${d.supplier}, supplierId: ${d.supplierId}, presentation: ${d.presentation}, dose: ${d.dose}, dosage: ${d.dosage}`);
    }
  });
}

check().catch(console.error);

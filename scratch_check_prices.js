import { adminDb } from './src/lib/firebaseAdmin.js';

async function check() {
  const pSnap = await adminDb.collection('products').limit(5).get();
  for (const p of pSnap.docs) {
    const vSnap = await p.ref.collection('variants').get();
    vSnap.forEach(d => {
      console.log(`Product: ${p.id}, Variant: ${d.id}`);
      console.log(`Data:`, JSON.stringify(d.data(), null, 2));
    });
  }
}
check().catch(console.error);

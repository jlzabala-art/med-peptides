import { adminDb } from './src/lib/firebaseAdmin.js';
async function test() {
  const p = await adminDb.collection('products').doc('aod-9604').get();
  console.log("Parent product supplierId:", p.data().supplierId);
  console.log("Parent product supplier:", p.data().supplier);
}
test().catch(console.error);

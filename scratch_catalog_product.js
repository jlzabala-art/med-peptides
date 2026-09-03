import { adminDb } from './src/lib/firebaseAdmin.js';
async function test() {
  const p = await adminDb.collection('products').doc('aod-9604').get();
  console.log("Master catalog product fields:", Object.keys(p.data()));
  console.log("supplierId:", p.data().supplierId);
  console.log("supplier:", p.data().supplier);
}
test().catch(console.error);

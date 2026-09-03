import { adminDb } from './src/lib/firebaseAdmin.js';
async function test() {
  const p = await adminDb.collection('products').doc('aod-9604').get();
  console.log("Hierarchy suppliers:", p.data().processedHierarchy?.suppliers?.map(s => s.id));
}
test().catch(console.error);

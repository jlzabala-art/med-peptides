import { adminDb } from './src/lib/firebaseAdmin.js';
async function test() {
  const p = await adminDb.collection('suppliers').doc('fagron_iberica').get();
  console.log("fagron_iberica name:", p.data()?.name);
}
test().catch(console.error);

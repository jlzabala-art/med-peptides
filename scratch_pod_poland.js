import { adminDb } from './src/lib/firebaseAdmin.js';
async function test() {
  const p = await adminDb.collection('suppliers').doc('pod-poland').get();
  console.log("pod-poland name:", p.data()?.name);
}
test().catch(console.error);

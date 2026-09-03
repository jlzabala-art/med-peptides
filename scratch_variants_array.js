import { adminDb } from './src/lib/firebaseAdmin.js';
async function test() {
  const p = await adminDb.collection('products').doc('aod-9604').get();
  console.log("Variants array in parent doc:", p.data().variants?.length);
  if (p.data().variants?.length) console.log(p.data().variants[0]);
}
test().catch(console.error);

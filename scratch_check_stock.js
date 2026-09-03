import { adminDb } from './src/lib/firebaseAdmin.js';
async function test() {
  const pSnap = await adminDb.collection('products').limit(3).get();
  pSnap.forEach(d => {
    console.log("Product:", d.id, "supply_state:", d.data().supply_state, "stock:", d.data().stock, "status:", d.data().status);
  });
}
test().catch(console.error);

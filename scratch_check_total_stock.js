import { adminDb } from './src/lib/firebaseAdmin.js';
async function test() {
  const pSnap = await adminDb.collection('products').get();
  let countWithStock = 0;
  pSnap.forEach(d => {
    if (d.data().totalStock !== undefined && d.data().totalStock !== null) {
      console.log(`Product: ${d.id}, totalStock: ${d.data().totalStock}`);
      countWithStock++;
    }
  });
  console.log(`Total products with stock: ${countWithStock}`);
}
test().catch(console.error);

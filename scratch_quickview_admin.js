import { adminDb } from './src/lib/firebaseAdmin.js';

async function test() {
  const productDoc = await adminDb.collection('products').doc('aod-9604').get();
  const product = { id: productDoc.id, ...productDoc.data() };
  const vSnap = await adminDb.collection('products').doc('aod-9604').collection('variants').get();
  const variants = vSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const match = { ...product, variants };

  let activeSupplierFilter = "Lotusland Limited";
  let preselected = product.supplierId || product.supplier;
  if (!preselected && activeSupplierFilter && match?.variants) {
    const mVar = match.variants.find(v => 
      (v.supplier && v.supplier.toLowerCase() === activeSupplierFilter.toLowerCase()) || 
      (v.supplierId && v.supplierId === activeSupplierFilter)
    );
    if (mVar) preselected = mVar.supplierId || mVar.supplier;
  }
  console.log("Preselected:", preselected);
}
test().catch(console.error);

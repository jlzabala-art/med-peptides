import { adminDb } from './src/lib/firebaseAdmin.js';

async function test() {
  const matchSnap = await adminDb.collection('products').doc('aod-9604').get();
  const match = matchSnap.data();
  const vSnap = await adminDb.collection('products').doc('aod-9604').collection('variants').get();
  match.variants = vSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const activeSupplierFilter = "Lotusland Limited";
  
  let explicitSupplierId = null;
  if (activeSupplierFilter && match?.variants) {
    const mVar = match.variants.find(v => 
      (v.supplier && v.supplier.toLowerCase() === activeSupplierFilter.toLowerCase()) || 
      (v.supplierId && v.supplierId === activeSupplierFilter) ||
      (v.supplier && v.supplier.toLowerCase().includes(activeSupplierFilter.toLowerCase()))
    );
    if (mVar) explicitSupplierId = mVar.supplierId || mVar.supplier;
  }
  
  let preselected = explicitSupplierId || match.supplierId || match.supplier;
  
  if (preselected && match?.variants) {
     const exactMatch = match.variants.find(v => v.supplier === preselected && v.supplierId);
     if (exactMatch) preselected = exactMatch.supplierId;
  }
  
  console.log("activeSupplierFilter:", activeSupplierFilter);
  console.log("explicitSupplierId:", explicitSupplierId);
  console.log("preselected final:", preselected);
}
test().catch(console.error);

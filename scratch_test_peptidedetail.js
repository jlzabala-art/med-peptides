import { adminDb } from './src/lib/firebaseAdmin.js';

async function test() {
  const vSnap = await adminDb.collection('products').doc('aod-9604').collection('variants').get();
  const productVariants = vSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(v => true); // simulate isAdmin=true
  
  const suppliers = productVariants.map(v => v?.supplierId || v?.supplier || 'lotusland');
  const uniqueSuppliers = [...new Set(suppliers)];
  
  const activeProduct = { _preselectedSupplierId: "OLlBbQjgrj6tY7GmM2Jo" };
  
  let selectedSupplierId = uniqueSuppliers[0] || 'lotusland';
  
  if (activeProduct?._preselectedSupplierId && uniqueSuppliers.includes(activeProduct._preselectedSupplierId)) {
    if (selectedSupplierId !== activeProduct._preselectedSupplierId) {
      selectedSupplierId = activeProduct._preselectedSupplierId;
    }
  } else {
     console.log("NOT FOUND IN UNIQUE SUPPLIERS");
  }
  
  console.log("selectedSupplierId:", selectedSupplierId);
}
test().catch(console.error);

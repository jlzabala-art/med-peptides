import { getProductWithVariants } from './src/repositories/productRepository.js';

async function test() {
  const match = await getProductWithVariants('aod-9604');
  let activeSupplierFilter = "Lotusland Limited";
  let preselected = match.supplierId || match.supplier;
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

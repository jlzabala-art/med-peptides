import { db } from './lib/firebase-admin.mjs';

async function check() {
  const products = await db.collection('products').get();
  let duplicateCount = 0;
  
  for (const product of products.docs) {
    const variantsSnap = await product.ref.collection('variants').get();
    const npLabsVariants = variantsSnap.docs.filter(doc => {
      const data = doc.data();
      return (data.supplier && data.supplier.toUpperCase().includes('NP LABS')) || 
             (data.supplierName && data.supplierName.toUpperCase().includes('NP LABS'));
    });
    
    if (npLabsVariants.length > 0) {
      console.log(`\nProduct: ${product.id}`);
      npLabsVariants.forEach(v => {
        const data = v.data();
        console.log(`  - Variant: ${v.id}, supplier: ${data.supplier}, supplierId: ${data.supplierId}, dose: ${data.dose}, dosage: ${data.dosage}, strength: ${data.strength}`);
      });
    }
  }
}

check().catch(console.error);

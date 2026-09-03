import { db } from './lib/firebase-admin.mjs';

async function check() {
  const products = await db.collection('products').get();
  
  let oldEmptyVariants = [];
  let oldFilledVariants = [];
  
  for (const product of products.docs) {
    const variantsSnap = await product.ref.collection('variants').get();
    
    variantsSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.supplierId === 'supplier-nplabs' && !doc.id.includes('-np-labs-')) {
        if (!data.dose && !data.dosage) {
          oldEmptyVariants.push(`Product: ${product.id} -> Variant: ${doc.id}`);
        } else {
          oldFilledVariants.push(`Product: ${product.id} -> Variant: ${doc.id} (dose: ${data.dose})`);
        }
      }
    });
  }
  
  console.log(`Found ${oldEmptyVariants.length} old EMPTY variants.`);
  console.log(`Found ${oldFilledVariants.length} old FILLED variants.`);
  
  if (oldFilledVariants.length > 0) {
    console.log('\nFILLED VARIANTS:');
    oldFilledVariants.forEach(v => console.log(v));
  }
}

check().catch(console.error);

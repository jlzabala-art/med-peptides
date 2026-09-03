import { adminDb } from './src/lib/firebaseAdmin.js';

const TARGET_SUPPLIER_ID = "OLlBbQjgrj6tY7GmM2Jo";
const TARGET_SUPPLIER_NAME = "Lotusland";

async function normalize() {
  const pSnap = await adminDb.collection('products').get();
  let updatedCount = 0;

  for (const doc of pSnap.docs) {
    const vSnap = await doc.ref.collection('variants').get();
    
    for (const vDoc of vSnap.docs) {
      const v = vDoc.data();
      
      const isLotuslandName = v.supplier && typeof v.supplier === 'string' && v.supplier.toLowerCase().includes('lotusland');
      const isLotuslandId = v.supplierId === TARGET_SUPPLIER_ID;
      const isNullLotusland = (!v.supplier && !v.supplierId) || (v.supplier === null && v.supplierId === null);
      // Wait, is there any OTHER product that might have null? The original logic assumed null is lotusland.
      // Let's also check if the variant ID contains 'lotusland' just to be safe.
      const isVariantIdLotusland = vDoc.id.toLowerCase().includes('lotusland');
      
      if (isLotuslandName || isLotuslandId || (isNullLotusland && isVariantIdLotusland)) {
        if (v.supplierId !== TARGET_SUPPLIER_ID || v.supplier !== TARGET_SUPPLIER_NAME) {
          console.log(`Updating product ${doc.id} variant ${vDoc.id} (was supplierId: ${v.supplierId}, supplier: ${v.supplier})`);
          await vDoc.ref.update({
            supplierId: TARGET_SUPPLIER_ID,
            supplier: TARGET_SUPPLIER_NAME
          });
          updatedCount++;
        }
      } else if (isNullLotusland) {
         // what if it's null but variant ID doesn't have lotusland?
         // In PeptideDetail.jsx, `v?.supplierId || v?.supplier || 'lotusland'` assumed ALL nulls are lotusland.
         console.log(`WARNING: Product ${doc.id} variant ${vDoc.id} has null supplier, but id doesn't contain lotusland.`);
         // We will update it anyway because the system previously treated all nulls as lotusland.
         console.log(`Updating product ${doc.id} variant ${vDoc.id} (was supplierId: ${v.supplierId}, supplier: ${v.supplier})`);
          await vDoc.ref.update({
            supplierId: TARGET_SUPPLIER_ID,
            supplier: TARGET_SUPPLIER_NAME
          });
          updatedCount++;
      }
    }
    
    // Also update parent product if needed
    const pData = doc.data();
    if (
      (pData.supplier && pData.supplier.toLowerCase().includes('lotusland')) || 
      pData.supplierId === TARGET_SUPPLIER_ID || 
      (pData.supplier === null && pData.supplierId === null)
    ) {
      if (pData.supplierId !== TARGET_SUPPLIER_ID || pData.supplier !== TARGET_SUPPLIER_NAME) {
         console.log(`Updating parent product ${doc.id} (was supplierId: ${pData.supplierId}, supplier: ${pData.supplier})`);
         await doc.ref.update({
            supplierId: TARGET_SUPPLIER_ID,
            supplier: TARGET_SUPPLIER_NAME
         });
         // Also update variants array on parent
         if (pData.variants && Array.isArray(pData.variants)) {
            const newV = pData.variants.map(v => {
               if (
                 (v.supplier && v.supplier.toLowerCase().includes('lotusland')) || 
                 v.supplierId === TARGET_SUPPLIER_ID || 
                 (!v.supplier && !v.supplierId)
               ) {
                  return { ...v, supplierId: TARGET_SUPPLIER_ID, supplier: TARGET_SUPPLIER_NAME };
               }
               return v;
            });
            await doc.ref.update({ variants: newV });
         }
      }
    } else {
         if (pData.variants && Array.isArray(pData.variants)) {
            let changed = false;
            const newV = pData.variants.map(v => {
               if (
                 (v.supplier && typeof v.supplier === 'string' && v.supplier.toLowerCase().includes('lotusland')) || 
                 v.supplierId === TARGET_SUPPLIER_ID || 
                 (!v.supplier && !v.supplierId)
               ) {
                  if (v.supplierId !== TARGET_SUPPLIER_ID || v.supplier !== TARGET_SUPPLIER_NAME) {
                      changed = true;
                      return { ...v, supplierId: TARGET_SUPPLIER_ID, supplier: TARGET_SUPPLIER_NAME };
                  }
               }
               return v;
            });
            if (changed) {
               console.log(`Updating parent product ${doc.id} variants array`);
               await doc.ref.update({ variants: newV });
            }
         }
    }
  }

  console.log(`DONE! Updated ${updatedCount} variants/products.`);
}

normalize().catch(console.error);

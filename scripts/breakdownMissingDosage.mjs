import { db } from './lib/firebase-admin.mjs';

async function breakdownNeedsManual() {
  const productsSnap = await db.collection('products').get();
  const bySupplier = {};
  const bioniqList = [];
  const activePriceList = [];

  for (const productDoc of productsSnap.docs) {
    const product = productDoc.data();
    const productId = productDoc.id;
    const vSnap = await db.collection('products').doc(productId).collection('variants').get();
    
    for (const vDoc of vSnap.docs) {
      const v = vDoc.data();
      const currentDosage = (v.dosage || v.dose || '').trim();
      const isGeneric = /^standard(\s+clinical(\s+strength)?)?$/i.test(currentDosage) ||
                        currentDosage === 'Standard Dose' ||
                        currentDosage === '';
      if (!isGeneric) continue;

      const supp = v.supplierName || v.supplierId || v.supplier || 'Unknown';
      bySupplier[supp] = (bySupplier[supp] || 0) + 1;

      if (supp.toLowerCase().includes('bioniq')) {
        bioniqList.push({
          productId,
          productName: product.name,
          variantId: vDoc.id,
          unit_price: v.unit_price || v.price,
          presentation: v.presentation || v.presentationName || v.format,
          rawDoc: v
        });
      }

      if (v.unit_price || v.price) {
        activePriceList.push({
          productId,
          productName: product.name,
          supplier: supp,
          variantId: vDoc.id,
          price: v.unit_price || v.price,
          format: v.presentation || v.format
        });
      }
    }
  }

  console.log('=== BREAKDOWN BY SUPPLIER OF MISSING DOSAGE ===');
  console.log(JSON.stringify(bySupplier, null, 2));

  console.log('\n=== BIONIQ VARIANTS STILL MISSING DOSAGE ===');
  bioniqList.forEach(b => {
    console.log(`- Product: ${b.productName} (${b.productId}) | Var: ${b.variantId} | Price: €${b.unit_price} | Format: ${b.presentation}`);
  });

  console.log(`\n=== VARIANTS WITH ACTUAL PRICE (COMMERCIAL PRODUCTS) MISSING DOSAGE: ${activePriceList.length} ===`);
  activePriceList.forEach(a => {
    console.log(`- [${a.supplier}] ${a.productName} (${a.productId}): €${a.price} | Format: ${a.format} | Var: ${a.variantId}`);
  });
}

breakdownNeedsManual()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });

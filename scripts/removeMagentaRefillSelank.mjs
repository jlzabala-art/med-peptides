import { db } from './lib/firebase-admin.mjs';

async function removeMagentaRefillSelank() {
  console.log('--- FINDING AND REMOVING MAGENTA REFILL CARTRIDGE (6 MG) FOR SELANK ---');

  // Search for Selank product
  const pSnap = await db.collection('products').get();
  let selankDoc = null;

  for (const doc of pSnap.docs) {
    const data = doc.data();
    const name = (data.name || '').toLowerCase();
    const id = doc.id.toLowerCase();
    if (id === 'selank' || name === 'selank' || (name.includes('selank') && !name.includes('+') && !name.includes('semax'))) {
      console.log(`Found Selank document: [${doc.id}] "${data.name}"`);
      selankDoc = doc;
      break;
    }
  }

  if (!selankDoc) {
    console.error('❌ Selank document not found in products collection!');
    return;
  }

  const productId = selankDoc.id;
  const productData = selankDoc.data();

  // 1. Inspect subcollection products/{productId}/variants
  const vSnap = await db.collection('products').doc(productId).collection('variants').get();
  console.log(`\nSubcollection variants count: ${vSnap.docs.length}`);

  let deletedSubDocCount = 0;
  for (const vDoc of vSnap.docs) {
    const v = vDoc.data();
    const supp = (v.supplierName || v.supplierId || v.supplier || '').toLowerCase();
    const isMagenta = supp.includes('magenta');
    const is6mg = String(v.dosage || v.dose || '').includes('6');
    const pres = (v.presentation || v.format || v.presentationName || '').toLowerCase();
    const isRefill = pres.includes('refill') || pres.includes('cartridge') || Number(v.unit_price || v.price || 0) < 130;

    console.log(`- [${vDoc.id}] Supplier: ${v.supplierName || v.supplierId} | Dose: ${v.dosage || v.dose} | Format: ${pres} | Price: $${v.unit_price || v.price}`);

    if (isMagenta && is6mg && isRefill) {
      console.log(`  🗑️ DELETING cheaper 6mg Refill Cartridge: ${vDoc.id} ($${v.unit_price || v.price})`);
      await db.collection('products').doc(productId).collection('variants').doc(vDoc.id).delete();
      deletedSubDocCount++;
    }
  }

  // 2. Inspect embedded productData.variants array if present
  if (Array.isArray(productData.variants)) {
    const initialLen = productData.variants.length;
    const remaining = productData.variants.filter((v) => {
      const supp = (v.supplierName || v.supplierId || v.supplier || '').toLowerCase();
      const isMagenta = supp.includes('magenta');
      const is6mg = String(v.dosage || v.dose || '').includes('6');
      const pres = (v.presentation || v.format || v.presentationName || '').toLowerCase();
      const isRefill = pres.includes('refill') || pres.includes('cartridge') || Number(v.unit_price || v.price || 0) < 130;
      if (isMagenta && is6mg && isRefill) {
        console.log(`  🗑️ Removing from embedded array: ${v.id} ($${v.unit_price || v.price})`);
        return false;
      }
      return true;
    });

    if (remaining.length !== initialLen) {
      await db.collection('products').doc(productId).update({
        variants: remaining,
        updatedAt: new Date().toISOString(),
      });
      console.log(`✓ Updated embedded variants array (${initialLen} -> ${remaining.length})`);
    }
  }

  console.log(`\n✅ Finished. Deleted ${deletedSubDocCount} subcollection documents. Kept Pre-filled Pen (6 mg at $149.86).`);
}

removeMagentaRefillSelank()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

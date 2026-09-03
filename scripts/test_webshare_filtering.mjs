import { adminDb } from '../src/lib/firebaseAdmin.js';
import { filterProductVariantsStrictly } from '../src/utils/strictFilterEngine.js';

async function main() {
  const productsQuery = adminDb.collection('products')
    .where('status', 'in', ['active', 'published', 'out of stock']);

  const [productsSnapshot] = await Promise.all([productsQuery.get()]);

  const variantsByProduct = {};
  await Promise.all(
    productsSnapshot.docs.map(async (doc) => {
      const vSnap = await doc.ref.collection('variants').get();
      const activeVars = [];
      vSnap.docs.forEach(vd => {
        const vData = vd.data();
        if (vData.isActive !== false && vData.status !== 'archived') {
          activeVars.push({ id: vd.id, ...vData });
        }
      });
      variantsByProduct[doc.id] = activeVars;
    })
  );

  let totalMatchedVariants = 0;
  let matchedProducts = [];

  const supplierId = 'supplier-lotusland';
  const sIdLower = String(supplierId).toLowerCase();
  const sIdCore = sIdLower.replace(/^supplier-/, '');

  for (const doc of productsSnapshot.docs) {
    const data = { id: doc.id, ...doc.data() };
    const pVars = variantsByProduct[doc.id] || [];

    const matchSupplier =
      (data.supplierId && String(data.supplierId).toLowerCase().includes(sIdCore)) ||
      (Array.isArray(data.supplierIds) && data.supplierIds.some(s => String(s).toLowerCase().includes(sIdCore))) ||
      pVars.some(v => {
        const vSupplierText = `${v.supplier || ''} ${v.supplierName || ''} ${v.supplierId || ''}`.toLowerCase();
        return vSupplierText.includes(sIdCore) || (sIdCore === 'lotusland' && v.supplierId === 'OLlBbQjgrj6tY7GmM2Jo');
      });

    if (!matchSupplier) continue;

    const variants = filterProductVariantsStrictly(
      { ...data, variants: pVars },
      {
        supplierId,
        supplierFilter: supplierId,
        catalogueFilter: 'RegenPept'
      }
    );

    if (variants.length > 0) {
      totalMatchedVariants += variants.length;
      matchedProducts.push({ name: data.name, count: variants.length });
    }
  }

  console.log('Total matched products with new logic:', matchedProducts.length);
  console.log('Total matched variants with new logic:', totalMatchedVariants);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

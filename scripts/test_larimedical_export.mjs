import fs from 'fs';
import { adminDb } from '../src/lib/firebaseAdmin.js';
import { filterProductVariantsStrictly } from '../src/utils/strictFilterEngine.js';

async function testLarimedicalExport() {
  console.log('=== Testing LARIMEDICAL Export & WebShare ===');

  const pSnap = await adminDb.collection('products')
    .where('supplierIds', 'array-contains', 'supplier-larimedical')
    .get();

  console.log(`LARIMEDICAL products found by query: ${pSnap.size}`);

  let totalVariants = 0;
  for (const doc of pSnap.docs) {
    const data = { id: doc.id, ...doc.data() };
    const vSnap = await doc.ref.collection('variants').get();
    const pVars = vSnap.docs.map(vd => ({ id: vd.id, ...vd.data() }));

    const matched = filterProductVariantsStrictly(
      { ...data, variants: pVars },
      { supplierId: 'supplier-larimedical', supplierFilter: 'supplier-larimedical' }
    );

    console.log(`Product "${data.name}": ${matched.length} variants matched.`);
    matched.forEach(v => {
      console.log(`  ↳ Variant: ${v.productName} | Dosage: ${v.dosage} | Format: ${v.format} | Fill: ${v.fill_volume}`);
    });
    totalVariants += matched.length;
  }

  console.log(`Total LARIMEDICAL variants: ${totalVariants}`);
  if (totalVariants === 4) {
    console.log('✅ LARIMEDICAL export validation PASSED (4 of 4 variants).');
  } else {
    console.error('❌ Expected 4 variants, got', totalVariants);
    process.exit(1);
  }
  process.exit(0);
}

testLarimedicalExport().catch(err => {
  console.error(err);
  process.exit(1);
});

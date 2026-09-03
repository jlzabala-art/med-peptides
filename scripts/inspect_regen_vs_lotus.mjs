import { adminDb } from '../src/lib/firebaseAdmin.js';

async function main() {
  const prods = await adminDb.collection('products').get();
  const regenVariants = [];
  const allLotuslandVariants = [];
  
  for (const doc of prods.docs) {
    const p = doc.data();
    const vSnap = await doc.ref.collection('variants').get();
    vSnap.forEach(v => {
      const vData = v.data();
      const s = (vData.supplier || p.supplier || '').toLowerCase();
      if (s.includes('lotus')) {
        allLotuslandVariants.push({
          productId: doc.id,
          productName: p.name,
          variantId: v.id,
          variantName: vData.name,
          dose: vData.dose || vData.dosage,
          catalogBrand: vData.catalogBrand || p.catalogBrand,
          format: vData.format || p.format,
          pricing: vData.pricing?.master
        });
      }
      if (vData.catalogBrand === 'RegenPept' || p.catalogBrand === 'RegenPept') {
        regenVariants.push({
          productId: doc.id,
          productName: p.name,
          variantId: v.id,
          variantName: vData.name,
          dose: vData.dose || vData.dosage,
          catalogBrand: vData.catalogBrand || p.catalogBrand,
          supplier: vData.supplier,
          pricing: vData.pricing?.master
        });
      }
    });
  }
  
  console.log('Total Lotusland variants:', allLotuslandVariants.length);
  console.log('Total RegenPept variants:', regenVariants.length);
  
  const checkNames = ['mots-c', 'tirzepatide', 'bpc-157', 'calcitonin', 'fezolinetant', 'glow', 'thymogen', 'syringe'];
  for (const name of checkNames) {
    const foundRegen = regenVariants.filter(r => (r.productName || '').toLowerCase().includes(name) || (r.variantName || '').toLowerCase().includes(name));
    console.log(`\nRegenPept with '${name}':`, foundRegen.length);
    foundRegen.forEach(f => console.log('  ->', f.productName, '|', f.variantId, '|', f.dose, '|', f.pricing));
    
    const foundLotus = allLotuslandVariants.filter(r => (r.productName || '').toLowerCase().includes(name) || (r.variantName || '').toLowerCase().includes(name));
    console.log(`All Lotusland with '${name}':`, foundLotus.length);
    foundLotus.forEach(f => console.log('  ->', f.productName, '|', f.variantId, '|', f.dose, '| catalogBrand:', f.catalogBrand, '|', f.pricing));
  }
  
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });

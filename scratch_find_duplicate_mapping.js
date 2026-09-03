import { adminDb } from './src/lib/firebaseAdmin.js';
import fs from 'fs';

async function checkMissing() {
  const json = JSON.parse(fs.readFileSync('AI Prompts/LotusLand Master Price List.json', 'utf8'));

  const productsSnap = await adminDb.collection('products').get();
  const productMap = {};
  productsSnap.forEach(doc => {
    const data = doc.data();
    const name = (data.canonicalName || data.name || '').toLowerCase().trim();
    if (name) productMap[name] = doc;
  });

  const variantToItemsMap = {};

  for (const item of json) {
    const pName = item.product.toLowerCase().trim();
    let productDoc = productMap[pName];

    if (!productDoc) {
      const fuzzyMatch = Object.keys(productMap).find(k => k.includes(pName) || pName.includes(k));
      if (fuzzyMatch) productDoc = productMap[fuzzyMatch];
    }

    if (!productDoc) {
      console.log(`⚠️ Product entirely missing in DB: ${item.product}`);
      continue;
    }

    const productId = productDoc.id;
    const dosageStr = item.dosage.toLowerCase();
    const mgMatch = dosageStr.match(/([\d.]+)\s*mg/);
    const iuMatch = dosageStr.match(/([\d.]+)\s*iu/);
    const dosageValue = mgMatch ? parseFloat(mgMatch[1]) : (iuMatch ? parseFloat(iuMatch[1]) : null);

    const pVariantsSnap = await adminDb.collection(`products/${productId}/variants`).get();
    let matchedVariantDoc = null;

    for (const vDoc of pVariantsSnap.docs) {
      const vData = vDoc.data();
      const vDoseMg = vData.doseMg;
      const vName = (vData.name || '').toLowerCase();
      
      if (dosageValue && vDoseMg === dosageValue) {
        matchedVariantDoc = vDoc; break;
      }
      if (vName.includes(dosageValue + 'mg') || vName.includes(dosageValue + ' mg') || vName.includes(dosageValue + 'iu') || vName.includes(dosageValue + ' iu')) {
        matchedVariantDoc = vDoc; break;
      }
      if (vData.dosage && vData.dosage.toLowerCase().includes(dosageValue)) {
        matchedVariantDoc = vDoc; break;
      }
    }

    if (matchedVariantDoc) {
      const path = matchedVariantDoc.ref.path;
      if (!variantToItemsMap[path]) variantToItemsMap[path] = [];
      variantToItemsMap[path].push(item);
    }
  }

  // Find duplicates
  console.log("--- Multiple items mapped to the same variant document ---");
  let dupCount = 0;
  Object.keys(variantToItemsMap).forEach(path => {
    if (variantToItemsMap[path].length > 1) {
      dupCount++;
      console.log(`\nVariant: ${path}`);
      variantToItemsMap[path].forEach(i => console.log(`  -> JSON: ${i.product} - ${i.dosage} - ${i.presentation}`));
    }
  });
  console.log(`Found ${dupCount} variants mapped from multiple JSON items.`);
}

checkMissing().catch(console.error);

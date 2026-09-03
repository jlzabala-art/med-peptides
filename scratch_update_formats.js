import { adminDb } from './src/lib/firebaseAdmin.js';
import fs from 'fs';

async function updateFormatsAndCheckMissing() {
  const LOTUSLAND_ID = 'OLlBbQjgrj6tY7GmM2Jo';
  const json = JSON.parse(fs.readFileSync('AI Prompts/LotusLand Master Price List.json', 'utf8'));

  const productsSnap = await adminDb.collection('products').get();
  const productMap = {};
  productsSnap.forEach(doc => {
    const data = doc.data();
    const name = (data.canonicalName || data.name || '').toLowerCase().trim();
    if (name) productMap[name] = doc;
  });

  let batch = adminDb.batch();
  let batchCount = 0;
  let missingItems = [];
  const handledVariants = new Set();

  for (const item of json) {
    let pName = item.product.toLowerCase().trim();
    let productDoc = productMap[pName];

    if (!productDoc) {
      const fuzzyMatch = Object.keys(productMap).find(k => k.includes(pName) || pName.includes(k));
      if (fuzzyMatch) productDoc = productMap[fuzzyMatch];
    }

    if (!productDoc) {
      missingItems.push(item);
      continue;
    }

    const productId = productDoc.id;
    const dosageStr = item.dosage.toLowerCase();
    const mgMatch = dosageStr.match(/([\d.]+)\s*mg/);
    const iuMatch = dosageStr.match(/([\d.]+)\s*iu/);
    const mcgMatch = dosageStr.match(/([\d.]+)\s*mcg/);
    const dosageValue = mgMatch ? parseFloat(mgMatch[1]) : (iuMatch ? parseFloat(iuMatch[1]) : (mcgMatch ? parseFloat(mcgMatch[1]) : null));

    const pVariantsSnap = await adminDb.collection(`products/${productId}/variants`).get();
    let matchedVariantDoc = null;

    for (const vDoc of pVariantsSnap.docs) {
      const vData = vDoc.data();
      const vDoseMg = vData.doseMg;
      const vName = (vData.name || '').toLowerCase();
      
      if (handledVariants.has(vDoc.ref.path)) continue;

      if (dosageValue && vDoseMg === dosageValue && dosageStr.includes('mg')) {
        matchedVariantDoc = vDoc; break;
      }
      
      if (dosageValue) {
        if (dosageStr.includes('mg') && new RegExp("\\\\b" + dosageValue + "\\\\s*mg\\\\b").test(vName)) { matchedVariantDoc = vDoc; break; }
        if (dosageStr.includes('iu') && new RegExp("\\\\b" + dosageValue + "\\\\s*iu\\\\b").test(vName)) { matchedVariantDoc = vDoc; break; }
        if (dosageStr.includes('mcg') && new RegExp("\\\\b" + dosageValue + "\\\\s*mcg\\\\b").test(vName)) { matchedVariantDoc = vDoc; break; }
      }
      
      // strict presentation matches for accessories
      if (item.presentation === 'kit' && vName.includes('kit') && !vName.includes('bundle') && pName.includes('starter kit')) { matchedVariantDoc = vDoc; break; }
      if (item.presentation === 'kit' && vName.includes('bundle') && pName.includes('bundle')) { matchedVariantDoc = vDoc; break; }
      if (item.presentation === 'box' && vName.includes('syringes') && pName.includes('syringes')) { matchedVariantDoc = vDoc; break; }
      if (item.presentation === 'bottle' && vName.includes('30 ml') && pName.includes('bac water')) { matchedVariantDoc = vDoc; break; }
      if (item.presentation === 'box' && vName.includes('10 bottles') && pName.includes('bac water')) { matchedVariantDoc = vDoc; break; }
    }

    if (matchedVariantDoc) {
      const path = matchedVariantDoc.ref.path;
      handledVariants.add(path);
      
      let format = item.presentation;
      if (!format || format === 'vial') format = 'vial';
      else if (format === 'bottle' && dosageStr.includes('tablet')) format = 'tablet';
      else if (format === 'bottle' && dosageStr.includes('caps')) format = 'capsule';
      else format = format.toLowerCase().trim();

      if (!format) format = 'vial';
      if (format === 'bottle' && !dosageStr.includes('tablet')) format = 'vial';

      batch.update(matchedVariantDoc.ref, {
        formatId: format,
        format: format,
        supplierId: LOTUSLAND_ID,
        supplier: 'Lotusland Limited'
      });
      batchCount++;
      if (batchCount >= 400) {
        await batch.commit();
        batch = adminDb.batch();
        batchCount = 0;
      }
    } else {
      missingItems.push(item);
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }
  
  console.log(`\nUpdated ${handledVariants.size} variants formats to exactly match the JSON list!`);
  console.log(`\nTotal missing items that did not match a distinct variant: ${missingItems.length}`);
  missingItems.forEach(i => console.log(`- ${i.product} - ${i.dosage} (Presentation: ${i.presentation})`));

  if (missingItems.length > 0) {
    console.log("\nAttempting to create the missing ones...");
    batch = adminDb.batch();
    batchCount = 0;
    let created = 0;

    for (const item of missingItems) {
      const pName = item.product.toLowerCase().trim();
      let productDoc = productMap[pName];
      if (!productDoc) {
        const fuzzyMatch = Object.keys(productMap).find(k => k.includes(pName) || pName.includes(k));
        if (fuzzyMatch) productDoc = productMap[fuzzyMatch];
      }

      if (!productDoc) {
        console.log(`❌ CANNOT CREATE: Product ${item.product} doesn't exist at all in DB.`);
        continue;
      }

      const productId = productDoc.id;
      const dosageStr = item.dosage.toLowerCase();
      const mgMatch = dosageStr.match(/([\d.]+)\s*mg/);
      const iuMatch = dosageStr.match(/([\d.]+)\s*iu/);
      const dosageValue = mgMatch ? parseFloat(mgMatch[1]) : (iuMatch ? parseFloat(iuMatch[1]) : null);

      const variantName = `${productDoc.data().canonicalName || productDoc.data().name} ${item.dosage.split('/')[0].trim()}`;
      const newVariantRef = adminDb.collection(`products/${productId}/variants`).doc();
      
      let format = item.presentation;
      if (!format || format === 'vial') format = 'vial';
      else if (format === 'bottle' && dosageStr.includes('tablet')) format = 'tablet';
      else if (format === 'bottle' && dosageStr.includes('caps')) format = 'capsule';
      else format = format.toLowerCase().trim(); 

      batch.set(newVariantRef, {
        name: variantName,
        dosage: item.dosage.split('/')[0].trim(),
        doseMg: dosageValue || 0,
        totalMg: dosageValue || 0,
        vialStrengthMg: dosageValue || 0,
        format: format,
        formatId: format,
        supplierCost: item.perVialPriceUSD || 0,
        kitCost: item.perKitPriceUSD || 0,
        quantityPerKit: 10,
        retailPrice: (item.perVialPriceUSD || 0) * 3,
        supplierId: LOTUSLAND_ID,
        supplier: 'Lotusland Limited',
        status: 'active',
        isActive: true,
        totalStock: 50,
        inventoryStatus: 'in_stock',
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Created ${variantName} (${format})`);
      created++;
      batchCount++;
    }
    if (batchCount > 0) await batch.commit();
    console.log(`Successfully created ${created} missing variants.`);
  }
}

updateFormatsAndCheckMissing().catch(console.error);

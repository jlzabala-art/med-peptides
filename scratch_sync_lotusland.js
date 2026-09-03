import * as admin from 'firebase-admin';
import { adminDb } from './src/lib/firebaseAdmin.js';
import fs from 'fs';

async function syncLotusland() {
  const LOTUSLAND_ID = 'OLlBbQjgrj6tY7GmM2Jo';
  console.log('Loading JSON...');
  const json = JSON.parse(fs.readFileSync('AI Prompts/LotusLand Master Price List.json', 'utf8'));
  console.log(`Loaded ${json.length} items from JSON.`);

  // Get ALL variants currently assigned to Lotusland without collectionGroup
  const allVariantsSnap = [];
  const pSnap = await adminDb.collection('products').get();
  for(const pDoc of pSnap.docs) {
    const vSnap = await pDoc.ref.collection('variants').get();
    for(const vDoc of vSnap.docs) {
      if(vDoc.data().supplierId === LOTUSLAND_ID) {
        allVariantsSnap.push(vDoc);
      }
    }
  }
  console.log(`Found ${allVariantsSnap.length} variants currently assigned to Lotusland.`);

  // We will build a list of variant DocumentReferences that SHOULD belong to Lotusland
  const validPaths = new Set();
  const variantsToUpdate = [];
  let matchedCount = 0;

  // Cache products to avoid too many reads
  const productsSnap = await adminDb.collection('products').get();
  const productMap = {};
  productsSnap.forEach(doc => {
    const data = doc.data();
    const name = (data.canonicalName || data.name || '').toLowerCase().trim();
    if (name) productMap[name] = doc;
  });

  for (const item of json) {
    let pName = item.product.toLowerCase().trim();
    let productDoc = productMap[pName];

    if (!productDoc) {
      // Fuzzy match
      const fuzzyMatch = Object.keys(productMap).find(k => k.includes(pName) || pName.includes(k));
      if (fuzzyMatch) productDoc = productMap[fuzzyMatch];
    }

    if (!productDoc) {
      console.log(`⚠️ Product not found in DB: ${item.product}`);
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
      if (validPaths.has(vDoc.ref.path)) continue;

      const vData = vDoc.data();
      const vDoseMg = vData.doseMg;
      const vName = (vData.name || '').toLowerCase();

      if (dosageValue && vDoseMg === dosageValue && dosageStr.includes('mg')) {
        matchedVariantDoc = vDoc; break;
      }
      
      if (dosageValue) {
        if (dosageStr.includes('mg') && new RegExp("\\b" + dosageValue + "\\s*mg\\b").test(vName)) { matchedVariantDoc = vDoc; break; }
        if (dosageStr.includes('iu') && new RegExp("\\b" + dosageValue + "\\s*iu\\b").test(vName)) { matchedVariantDoc = vDoc; break; }
        if (dosageStr.includes('mcg') && new RegExp("\\b" + dosageValue + "\\s*mcg\\b").test(vName)) { matchedVariantDoc = vDoc; break; }
      }
      
      // strict presentation matches for accessories
      if (item.presentation === 'kit' && vName.includes('kit') && !vName.includes('bundle') && pName.includes('starter kit')) { matchedVariantDoc = vDoc; break; }
      if (item.presentation === 'kit' && vName.includes('bundle') && pName.includes('bundle')) { matchedVariantDoc = vDoc; break; }
      if (item.presentation === 'box' && vName.includes('syringes') && pName.includes('syringes')) { matchedVariantDoc = vDoc; break; }
      if (item.presentation === 'bottle' && vName.includes('30 ml') && pName.includes('bac water')) { matchedVariantDoc = vDoc; break; }
      if (item.presentation === 'box' && vName.includes('10 bottles') && pName.includes('bac water')) { matchedVariantDoc = vDoc; break; }
    }

    if (matchedVariantDoc) {
      validPaths.add(matchedVariantDoc.ref.path);
      variantsToUpdate.push({
        ref: matchedVariantDoc.ref,
        updates: { supplierId: LOTUSLAND_ID, supplier: 'Lotusland Limited' }
      });
      matchedCount++;
    } else {
      console.log(`⚠️ Variant not found for ${item.product} - ${item.dosage}. (productId: ${productId})`);
    }
  }

  console.log(`\nMatched ${matchedCount} variants out of ${json.length} JSON items.`);

  // 2. Identify variants that are currently Lotusland but shouldn't be
  const variantsToUnmap = [];
  allVariantsSnap.forEach(doc => {
    if (!validPaths.has(doc.ref.path)) {
      variantsToUnmap.push(doc.ref);
    }
  });

  // 3. Execute updates in batches
  let batch = adminDb.batch();
  let count = 0;

  // Delete invalid ones from DB!
  for (const ref of variantsToUnmap) {
    batch.delete(ref);
    count++;
    if (count === 400) {
      await batch.commit();
      batch = adminDb.batch();
      count = 0;
    }
  }

  // Make sure matched ones have the correct supplier ID
  for (const item of variantsToUpdate) {
    batch.update(item.ref, item.updates);
    count++;
    if (count === 400) {
      await batch.commit();
      batch = adminDb.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  console.log(`\n✅ Unmapped ${variantsToUnmap.length} extra variants.`);
  console.log(`✅ Ensured ${variantsToUpdate.length} variants belong to Lotusland.`);
}

syncLotusland().catch(console.error);

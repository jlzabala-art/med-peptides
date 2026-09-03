import { adminDb } from './src/lib/firebaseAdmin.js';
import fs from 'fs';

async function syncLotuslandAndCreateMissing() {
  const LOTUSLAND_ID = 'OLlBbQjgrj6tY7GmM2Jo';
  console.log('Loading JSON...');
  const json = JSON.parse(fs.readFileSync('AI Prompts/LotusLand Master Price List.json', 'utf8'));

  const productsSnap = await adminDb.collection('products').get();
  const productMap = {};
  productsSnap.forEach(doc => {
    const data = doc.data();
    const name = (data.canonicalName || data.name || '').toLowerCase().trim();
    if (name) productMap[name] = doc;
  });

  const variantsToKeep = new Set();
  let createdCount = 0;
  let batch = adminDb.batch();
  let batchCount = 0;

  for (const item of json) {
    try {
      const pName = item.product.toLowerCase().trim();
      let productDoc = productMap[pName];

      if (!productDoc) {
        const fuzzyMatch = Object.keys(productMap).find(k => k.includes(pName) || pName.includes(k));
        if (fuzzyMatch) productDoc = productMap[fuzzyMatch];
      }

      if (!productDoc) {
        console.log(`⚠️ Product entirely missing in DB: ${item.product}. Skipping creation.`);
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
        variantsToKeep.add(matchedVariantDoc.ref.path);
        // It's already updated to Lotusland by the previous run, but we can do it again just in case
        batch.update(matchedVariantDoc.ref, { supplierId: LOTUSLAND_ID, supplier: 'Lotusland Limited' });
        batchCount++;
      } else {
        // CREATE IT!
        const variantName = `${productDoc.data().canonicalName || productDoc.data().name} ${item.dosage.split('/')[0].trim()}`;
        
        const newVariantRef = adminDb.collection(`products/${productId}/variants`).doc();
        const formatLower = (item.presentation || 'vial').toLowerCase();
        const formatId = formatLower.includes('pen') ? 'prefilled_pen' : (formatLower.includes('spray') ? 'nasal_spray' : 'vial');

        batch.set(newVariantRef, {
          name: variantName,
          dosage: item.dosage.split('/')[0].trim(),
          doseMg: dosageValue || 0,
          totalMg: dosageValue || 0,
          vialStrengthMg: dosageValue || 0,
          format: formatId,
          formatId: formatId,
          supplierCost: item.perVialPriceUSD || 0,
          kitCost: item.perKitPriceUSD || 0,
          quantityPerKit: 10,
          retailPrice: (item.perVialPriceUSD || 0) * 3, // basic mockup
          supplierId: LOTUSLAND_ID,
          supplier: 'Lotusland Limited',
          status: 'active',
          isActive: true,
          totalStock: 50,
          inventoryStatus: 'in_stock',
          createdAt: new Date().toISOString()
        });
        
        console.log(`✅ Created missing variant: ${variantName} under ${productId}`);
        variantsToKeep.add(newVariantRef.path);
        createdCount++;
        batchCount++;
      }

      if (batchCount >= 400) {
        await batch.commit();
        batch = adminDb.batch();
        batchCount = 0;
      }
    } catch (err) {
      console.error(`Error processing item: ${item.product}`, err);
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`\n✅ Done. Created ${createdCount} new variants.`);
  console.log(`Total variants mapped for Lotusland: ${variantsToKeep.size} (Target: 104)`);
}

syncLotuslandAndCreateMissing().catch(console.error);

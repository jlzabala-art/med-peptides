import { adminDb } from './src/lib/firebaseAdmin.js';
import fs from 'fs';

const masterList = JSON.parse(fs.readFileSync('./AI Prompts/LotusLand Master Price List.json', 'utf8'));

async function importMissing() {
  const pSnap = await adminDb.collection('products').get();
  
  const map = {};
  for (const doc of pSnap.docs) {
    const vSnap = await doc.ref.collection('variants').where('supplierId', '==', 'OLlBbQjgrj6tY7GmM2Jo').get();
    for (const v of vSnap.docs) {
      const name = doc.id.toLowerCase();
      if (!map[name]) map[name] = [];
      map[name].push({ kitCost: v.data().kitCost, cost: v.data().supplierCost });
    }
  }

  let added = 0;
  for (const item of masterList) {
    if (!item.product) continue;
    const jsonSlug = item.product.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    let found = false;
    for (const dbName in map) {
      if (dbName.includes(jsonSlug) || jsonSlug.includes(dbName)) {
        const matches = map[dbName].some(v => v.kitCost === item.perKitPriceUSD || v.cost === item.perVialPriceUSD);
        if (matches) {
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      console.log(`Missing: ${item.product} - Adding now...`);
      // Find or create product
      let productRef = adminDb.collection('products').doc(jsonSlug);
      let doc = await productRef.get();
      if (!doc.exists) {
        await productRef.set({
          name: item.product,
          slug: jsonSlug,
          status: 'active',
          canonicalId: jsonSlug,
          _isCanonical: true,
          category: 'peptide'
        });
      }
      
      const variantRef = productRef.collection('variants').doc();
      const variantData = {
        name: `${item.product} ${item.dosage || ''}`.trim(),
        dosage: item.dosage || '',
        format: item.presentation || 'vial',
        formatId: item.presentation || 'vial',
        supplierCost: item.perVialPriceUSD || 0,
        kitCost: item.perKitPriceUSD || 0,
        quantityPerKit: parseInt(item.quantity) || 1,
        supplierId: 'OLlBbQjgrj6tY7GmM2Jo',
        supplier: 'Lotusland',
        status: 'active',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      await variantRef.set(variantData);
      added++;
    }
  }
  
  console.log(`Added ${added} missing variants.`);
}

importMissing();

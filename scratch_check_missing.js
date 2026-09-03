import { adminDb } from './src/lib/firebaseAdmin.js';
import fs from 'fs';

const masterList = JSON.parse(fs.readFileSync('./AI Prompts/LotusLand Master Price List.json', 'utf8'));

async function checkMissing() {
  const pSnap = await adminDb.collection('products').get();
  
  // Track all current lotusland variants by dosage/quantity
  const map = {};
  
  for (const doc of pSnap.docs) {
    const vSnap = await doc.ref.collection('variants').where('supplierId', '==', 'OLlBbQjgrj6tY7GmM2Jo').get();
    for (const v of vSnap.docs) {
      const data = v.data();
      const name = doc.id.toLowerCase();
      if (!map[name]) map[name] = [];
      map[name].push({ cost: data.supplierCost, kitCost: data.kitCost });
    }
  }

  let missing = [];
  for (const item of masterList) {
    if (!item.product) continue;
    const jsonSlug = item.product.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    // Check if this item is in our map
    let found = false;
    for (const dbName in map) {
      if (dbName.includes(jsonSlug) || jsonSlug.includes(dbName)) {
        // check cost
        const matches = map[dbName].some(v => v.kitCost === item.perKitPriceUSD || v.cost === item.perVialPriceUSD);
        if (matches) {
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      missing.push(item.product);
    }
  }
  
  console.log(`\nFound ${missing.length} items from JSON missing in DB Lotusland variants:`);
  missing.forEach(m => console.log(m));
}

checkMissing();

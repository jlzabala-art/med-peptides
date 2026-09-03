import fs from 'fs';
import { adminDb } from './src/lib/firebaseAdmin.js';

const TARGET_SUPPLIER_ID = "OLlBbQjgrj6tY7GmM2Jo";
const TARGET_SUPPLIER_NAME = "Lotusland";

async function normalizeStrict() {
  const jsonData = JSON.parse(fs.readFileSync('AI Prompts/LotusLand Master Price List.json', 'utf-8'));
  const pSnap = await adminDb.collection('products').get();
  
  let matchCount = 0;
  
  for (const doc of pSnap.docs) {
    const vSnap = await doc.ref.collection('variants').get();
    for (const vDoc of vSnap.docs) {
      const v = vDoc.data();
      
      let matchedItem = false;
      for (const item of jsonData) {
        if (v.supplierCost === item.perVialPriceUSD && v.kitCost === item.perKitPriceUSD) {
          const slug = item.product.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          if (doc.id.includes(slug) || slug.includes(doc.id)) {
             matchedItem = true;
             break;
          }
        }
      }
      
      const hasLotuslandSupplier = v.supplierId === TARGET_SUPPLIER_ID || v.supplier?.toLowerCase().includes('lotusland');
      
      if (matchedItem) {
        if (v.supplierId !== TARGET_SUPPLIER_ID || v.supplier !== TARGET_SUPPLIER_NAME) {
          await vDoc.ref.update({
            supplierId: TARGET_SUPPLIER_ID,
            supplier: TARGET_SUPPLIER_NAME
          });
        }
        matchCount++;
      } else if (hasLotuslandSupplier) {
        // Not a true match from the JSON list, remove it from Lotusland
        await vDoc.ref.update({
          supplierId: null,
          supplier: null,
          isActive: false,
          status: 'archived'
        });
      }
    }
  }

  console.log(`Matched exactly ${matchCount} variants as true Lotusland.`);
  process.exit(0);
}

normalizeStrict().catch(e => { console.error(e); process.exit(1); });

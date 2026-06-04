import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }       from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  const snap = await db.collection('products').where('supplier', '==', 'Lotusland').get();
  console.log(`Found ${snap.size} Lotusland products in DB.`);
  
  let productsWithCost = 0;
  let totalVariantsChecked = 0;
  let variantsWithCost = 0;
  
  const priceSamples = [];
  
  snap.forEach(docSnap => {
    const p = docSnap.data();
    const cost = p.costPrice || p.cost_per_gram || p.cost || 0;
    let hasCost = parseFloat(cost) > 0;
    
    let variantCosts = [];
    if (p.variants && p.variants.length > 0) {
      p.variants.forEach(v => {
        totalVariantsChecked++;
        const vCost = v.costPrice || v.cost || 0;
        if (parseFloat(vCost) > 0) {
          variantsWithCost++;
          variantCosts.push({ sku: v.sku, name: v.name, cost: vCost });
        }
      });
    }
    
    if (hasCost || variantCosts.length > 0) {
      productsWithCost++;
      priceSamples.push({
        id: docSnap.id,
        name: p.name,
        category: p.category,
        cost: cost,
        variantCosts: variantCosts
      });
    }
  });
  
  console.log(`Products with base cost defined: ${productsWithCost} / ${snap.size}`);
  console.log(`Variants with cost defined: ${variantsWithCost} / ${totalVariantsChecked}`);
  
  console.log('\n--- SAMPLES WITH COST DEFINED ---');
  console.log(JSON.stringify(priceSamples.slice(0, 15), null, 2));
}

run().catch(console.error);

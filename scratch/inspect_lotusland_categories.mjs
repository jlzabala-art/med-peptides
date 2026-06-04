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
  console.log(`Total Lotusland products: ${snap.size}`);
  
  const categories = {};
  
  snap.forEach(docSnap => {
    const p = docSnap.data();
    const cat = p.category || 'Uncategorized';
    
    if (!categories[cat]) {
      categories[cat] = { total: 0, withCost: 0, sampleCosts: [] };
    }
    
    categories[cat].total++;
    
    const cost = parseFloat(p.costPrice || p.cost_per_gram || p.cost || 0);
    if (cost > 0) {
      categories[cat].withCost++;
      categories[cat].sampleCosts.push({ name: p.name, cost });
    }
  });
  
  console.log('\n--- LOTUSLAND PRODUCTS GROUPED BY CATEGORY ---');
  Object.entries(categories).forEach(([name, stats]) => {
    console.log(`\nCategory: "${name}"`);
    console.log(`  - Total: ${stats.total}`);
    console.log(`  - With Cost: ${stats.withCost} / ${stats.total}`);
    if (stats.sampleCosts.length > 0) {
      console.log(`  - Sample Costs (First 5):`);
      stats.sampleCosts.slice(0, 5).forEach(s => {
        console.log(`    * ${s.name}: $${s.cost}`);
      });
    }
  });
}

run().catch(console.error);

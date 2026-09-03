import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}) });
const db = getFirestore(app);

const targets = [
  { id: 'supplier-nplabs', name: 'NP Labs' },
  { id: 'supplier-europeptides', name: 'Europeptides' },
  { id: 'supplier-vallida', name: 'Vallida' },
  { id: 'supplier-bioniq', name: 'Bioniq' },
  { id: 'supplier-lotusland', name: 'Lotusland' },
];

console.log('==================================================');
console.log(' FINAL AUDIT: 5 SUPPLIERS + PRODUCT STRUCTURE');
console.log('==================================================\n');

for (const t of targets) {
  // Get supplier doc
  const supDoc = await db.collection('suppliers').doc(t.id).get();
  const supData = supDoc.exists ? supDoc.data() : null;
  
  // Get products count
  const totalSnap = await db.collection('products').where('supplierId','==',t.id).count().get();
  const totalCount = totalSnap.data().count;
  
  // Get active products count
  const activeSnap = await db.collection('products').where('supplierId','==',t.id).where('status','==','active').count().get();
  const activeCount = activeSnap.data().count;

  // Sample 2 products  
  const sampleSnap = await db.collection('products').where('supplierId','==',t.id).limit(2).get();
  
  console.log(`\n--- ${t.name.toUpperCase()} (${t.id}) ---`);
  if (supData) {
    console.log(`  Supplier: name="${supData.name}" | status="${supData.status}" | currency="${supData.currency}" | country="${supData.country}"`);
    console.log(`  calculatedStats: ${JSON.stringify(supData.calculatedStats || {})}`);
  } else {
    console.log('  ❌ SUPPLIER DOC MISSING!');
  }
  console.log(`  Products: ${totalCount} total | ${activeCount} active`);
  
  if (sampleSnap.docs.length > 0) {
    console.log('  Sample products:');
    sampleSnap.docs.forEach(d => {
      const p = d.data();
      const pr = p.pricing || {};
      const hasLegacy = !!(p.price || p.priceUSD || p.priceEUR || p.originalPrice || p.retailPrice || p.costPrice);
      console.log(`    [${d.id}]`);
      console.log(`      unitPrice=${pr.unitPrice} | currency=${p.currency} | status=${p.status}`);
      console.log(`      tiers=${JSON.stringify(pr.tiers?.length)} entries | legacy fields=${hasLegacy}`);
      console.log(`      supplierId=${p.supplierId} | supplierName=${p.supplierName}`);
    });
  }
}

console.log('\n==================================================');
console.log(' DONE');
console.log('==================================================');
process.exit(0);

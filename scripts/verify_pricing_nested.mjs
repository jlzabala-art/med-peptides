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
  { id: 'supplier-nplabs',       expectedCurrency: 'EUR' },
  { id: 'supplier-europeptides', expectedCurrency: 'EUR' },
  { id: 'supplier-vallida',      expectedCurrency: 'GBP' },
  { id: 'supplier-bioniq',       expectedCurrency: 'EUR' },
  { id: 'supplier-lotusland',    expectedCurrency: 'USD' },
];

let overallOk = 0, overallBad = 0;
const issues = [];

for (const t of targets) {
  const snap = await db.collection('products').where('supplierId','==',t.id).get();
  let ok = 0, bad = 0;
  const sampleOk = [];
  const sampleBad = [];

  snap.docs.forEach(doc => {
    const p = doc.data();
    const pr = p.pricing || {};
    
    // Check nested format: pricing.retail should be an object with perUnit
    const retailIsNested = pr.retail && typeof pr.retail === 'object' && pr.retail.perUnit != null;
    const retailIsFlat   = pr.retail && typeof pr.retail === 'number';
    const hasAnyPrice    = retailIsNested || pr.wholesale?.perUnit != null || pr.clinic?.perUnit != null;
    
    if (retailIsNested || hasAnyPrice) {
      ok++;
      if (sampleOk.length < 2) sampleOk.push({ id: doc.id, retail: pr.retail });
    } else {
      bad++;
      if (sampleBad.length < 3) sampleBad.push({ id: doc.id, retail: pr.retail, wholesale: pr.wholesale });
    }
  });

  overallOk += ok;
  overallBad += bad;
  const icon = bad === 0 ? '✅' : '❌';
  console.log(`\n${icon} ${t.id}: ${ok}/${snap.size} products in correct nested format`);
  
  if (sampleOk.length > 0) {
    console.log('   OK sample:', JSON.stringify(sampleOk[0].retail));
  }
  if (sampleBad.length > 0) {
    console.log('   ❌ BAD sample:', sampleBad.map(s => `${s.id}: retail=${JSON.stringify(s.retail)}`).join(', '));
    issues.push(...sampleBad.map(s => ({ supplierId: t.id, id: s.id })));
  }
}

console.log(`\n=== TOTAL: ${overallOk} OK | ${overallBad} BROKEN ===`);
if (overallBad === 0) {
  console.log('🎉 All products have correct nested pricing format!');
}
process.exit(0);

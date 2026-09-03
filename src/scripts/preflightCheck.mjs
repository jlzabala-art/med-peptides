import admin from 'firebase-admin';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function runPreflight() {
  const data = JSON.parse(fs.readFileSync('./src/scripts/data/pod_poland_import.json', 'utf8'));
  
  console.log('==================================================');
  console.log('1. PRE-IMPORT SUPPLIER CHECK');
  console.log('==================================================');
  
  let targetSupplier = null;
  const supplierSnap = await db.collection('wholesellers').get();
  const aliases = data.supplier.supplier_aliases.map(a => a.toLowerCase());
  const supplierName = data.supplier.supplier_name.toLowerCase();
  
  supplierSnap.forEach(doc => {
    const s = doc.data();
    const name = (s.companyName || s.name || '').toLowerCase();
    
    if (name === supplierName || aliases.includes(name) || name.includes('pod poland')) {
      targetSupplier = { id: doc.id, ...s };
    }
  });

  if (targetSupplier) {
    console.log(`[FOUND] Existing supplier matched: ${targetSupplier.id} (${targetSupplier.companyName || targetSupplier.name})`);
    console.log(`Current status: ${targetSupplier.status || 'unknown'}, Has Products: ${targetSupplier.productsSupplied || 0}`);
  } else {
    console.log(`[NEW] No existing supplier found. Will create new supplier: ${data.supplier.supplier_name}`);
  }

  console.log('\n==================================================');
  console.log('2. PRE-IMPORT PRODUCT AND SKU CHECK');
  console.log('==================================================');

  const productsSnap = await db.collection('products').get();
  const allProducts = [];
  productsSnap.forEach(doc => allProducts.push({ id: doc.id, ...doc.data() }));

  let exactMatches = 0;
  let newSkus = 0;
  let relatedProducts = 0;
  
  const report = [];

  for (const item of data.products) {
    let match = null;
    let matchType = 'NEW';
    
    // Normalize components
    const itemComponentsStr = item.components.map(c => `${c.name.toLowerCase()}-${c.amount}${c.unit.toLowerCase()}`).sort().join('|');

    for (const p of allProducts) {
      if (p.supplier && targetSupplier && (p.supplier.toLowerCase() === (targetSupplier.companyName || targetSupplier.name || '').toLowerCase())) {
        
        // Simple heuristic for exact match: same name, same total active mg, same presentation
        const pComponentsStr = (p.components || []).map(c => `${(c.name||'').toLowerCase()}-${c.amount}${c.unit?c.unit.toLowerCase():'mg'}`).sort().join('|');
        
        if (pComponentsStr === itemComponentsStr && p.presentation === data.default_product_attributes.presentation) {
            match = p;
            matchType = 'EXACT';
            exactMatches++;
            break;
        } else if (p.product_name === item.product_name) {
            // Same ingredient, different strength/presentation
            match = p;
            matchType = 'RELATED (Different Strength/Presentation)';
        }
      }
    }
    
    if (matchType === 'NEW') newSkus++;
    if (matchType.includes('RELATED')) relatedProducts++;
    
    report.push(`SKU: ${item.supplier_sku} | Product: ${item.product_name} | Match: ${matchType} ${match ? '('+match.id+')' : ''}`);
  }
  
  console.log(report.join('\n'));
  
  console.log('\n==================================================');
  console.log('3. IMPORT REPORT SUMMARY');
  console.log('==================================================');
  console.log(`Supplier Action: ${targetSupplier ? 'REUSE EXISTING ('+targetSupplier.id+')' : 'CREATE NEW'}`);
  console.log(`Exact Products Found (Duplicate skipped/Price Updated): ${exactMatches}`);
  console.log(`Related Products Found (New SKUs): ${relatedProducts}`);
  console.log(`Completely New SKUs: ${newSkus}`);
  console.log(`Final total POD Poland SKUs to process: ${data.products.length}`);
}

runPreflight().catch(console.error);

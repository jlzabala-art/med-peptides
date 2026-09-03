import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

async function main() {
  const serviceAccount = JSON.parse(
    await readFile(
      new URL('../../serviceAccount-target.json', import.meta.url)
    )
  );

  initializeApp({
    credential: cert(serviceAccount),
  });

  const db = getFirestore();
  const snapshot = await db.collection('products').get();
  
  const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  console.log(`Total products: ${products.length}`);
  
  const categoryCounts = {};
  const fieldNames = new Set();
  
  let missingCategory = 0;
  
  products.forEach(p => {
    Object.keys(p).forEach(k => {
      if (k.toLowerCase().includes('cat') || k.toLowerCase().includes('type') || k.toLowerCase().includes('class')) {
        fieldNames.add(k);
      }
    });
    
    const cat = p.category;
    if (cat === undefined || cat === null || cat === '') {
      missingCategory++;
      categoryCounts['[EMPTY/NULL]'] = (categoryCounts['[EMPTY/NULL]'] || 0) + 1;
    } else {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  });
  
  console.log("\nCategory breakdown (from 'category' field):");
  Object.entries(categoryCounts).sort((a,b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(`  ${k}: ${v}`);
  });
  
  console.log(`\nProducts missing 'category' field: ${missingCategory}`);
  
  console.log("\nOther potential category/type fields found across all products:");
  console.log([...fieldNames].join(', '));
  
  const missingSamples = products.filter(p => !p.category).slice(0, 10);
  if (missingSamples.length > 0) {
    console.log("\nSamples of products with NO category:");
    missingSamples.forEach(p => {
      console.log(`- ID: ${p.id}, Name: ${p.name || p.canonicalName}`);
      [...fieldNames].forEach(f => {
        if (p[f] !== undefined) console.log(`    ${f}: ${p[f]}`);
      });
    });
  }
}

main().catch(console.error);

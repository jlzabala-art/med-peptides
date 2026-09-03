import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
import fs from 'fs';
import path from 'path';

let credential;
credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
});

if (!initializeApp.apps?.length) {
  initializeApp({ credential });
}

const db = getFirestore();

function generateCanonicalId(name) {
  if (!name) return '';
  let id = name.toLowerCase().trim();
  id = id.replace(/\s*\([^)]*\)/g, '');
  id = id.replace(/[\s\/\+]+/g, '-');
  id = id.replace(/[^a-z0-9\-]/g, '');
  id = id.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return id;
}

async function run() {
  const dataPath = path.join(process.cwd(), 'AI Prompts/LotusLand Master Price List.json');
  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  console.log(`Found ${rawData.length} products to seed.`);
  
  const batchArray = [];
  let currentBatch = db.batch();
  let opCount = 0;

  for (const item of rawData) {
    const productName = `${item.product} ${item.dosage !== 'N/A' ? item.dosage : ''}`.trim();
    const docRef = db.collection('products').doc(); // Auto-generate ID
    
    currentBatch.set(docRef, {
      name: productName,
      title: productName,
      productName: productName,
      brand: 'LotusLand',
      supplier: 'LotusLand',
      category: 'Peptides',
      price: item.perVialPriceUSD || item.perKitPriceUSD,
      currency: 'USD',
      presentation: item.presentation,
      packSize: item.quantity,
      dosage: item.dosage,
      price_per_kit_10: item.perKitPriceUSD,
      pricing: {
        retail: item.perVialPriceUSD || item.perKitPriceUSD,
        wholesale: item.perVialPriceUSD,
        volume10Kit: item.perKitPriceUSD
      },
      canonicalId: generateCanonicalId(productName),
      visibleToDoctor: true,
      visibleToPharmacy: true,
      availabilityStatus: 'in_stock',
      stockStatus: 'In Stock',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: new Date().toISOString(),
      source: 'LotusLand Master Price List.json'
    });
    
    opCount++;
    if (opCount >= 400) {
      batchArray.push(currentBatch);
      currentBatch = db.batch();
      opCount = 0;
    }
  }
  
  if (opCount > 0) {
    batchArray.push(currentBatch);
  }

  console.log(`Writing to Firestore in ${batchArray.length} batches...`);
  for (const batch of batchArray) {
    await batch.commit();
  }
  
  console.log("Seeding complete!");
}

run().catch(console.error);

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
import fs from 'fs';

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

// Helper to generate canonical ID from string
function generateCanonicalId(name) {
  if (!name) return '';
  let id = name.toLowerCase().trim();
  
  // Remove anything in parentheses
  id = id.replace(/\s*\([^)]*\)/g, '');
  
  // Replace slashes, pluses, spaces with hyphen
  id = id.replace(/[\s\/\+]+/g, '-');
  
  // Remove non-alphanumeric and hyphens
  id = id.replace(/[^a-z0-9\-]/g, '');
  
  // Deduplicate hyphens
  id = id.replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  // Custom manual mappings for common variations
  if (id.startsWith('ghk-cu')) return 'ghk-cu';
  if (id.startsWith('bpc-157')) return 'bpc-157';
  if (id.startsWith('tb-500')) return 'tb-500';
  if (id.includes('cjc') && id.includes('ipamorelin')) return 'cjc-1295-ipamorelin';
  if (id.startsWith('cjc-1295')) {
    if (id.includes('no-dac') || id.includes('without-dac')) return 'cjc-1295-no-dac';
    if (id.includes('dac')) return 'cjc-1295-dac';
    return 'cjc-1295';
  }
  if (id.startsWith('aod-9604')) return 'aod-9604';
  if (id.startsWith('pt-141')) return 'pt-141';
  if (id.startsWith('ss-31')) return 'ss-31';
  if (id.startsWith('ipamorelin')) return 'ipamorelin';
  if (id.startsWith('tesamorelin')) return 'tesamorelin';
  if (id.startsWith('thymosin-alpha-1')) return 'thymosin-alpha-1';
  
  // Remove trailing dosages like -10mg, -5mg, -5000iu
  id = id.replace(/-\d+(mg|mcg|iu|g)$/, '');
  id = id.replace(/-$/, '');
  
  return id;
}

function getProductsFromProtocol(data) {
  if (!data) return [];
  const products = new Set();
  
  if (data.peptides && Array.isArray(data.peptides)) {
    data.peptides.forEach(p => products.add(p.toLowerCase().trim()));
  }
  
  if (data.phases && Array.isArray(data.phases)) {
    data.phases.forEach(phase => {
      if (phase.items && Array.isArray(phase.items)) {
        phase.items.forEach(item => {
          if (item.name) products.add(item.name.toLowerCase().trim());
        });
      }
    });
  }
  return Array.from(products);
}

function getProductsFromPrescription(data) {
  if (!data) return [];
  const products = new Set();
  
  if (data.items && Array.isArray(data.items)) {
    data.items.forEach(item => {
      if (item.name) products.add(item.name.toLowerCase().trim());
    });
  }
  return Array.from(products);
}

async function run() {
  console.log("Seeding product_usage table...");
  const usageMap = {};

  // 1. Process Protocols
  const protocolsSnap = await db.collection('protocols').get();
  console.log(`Found ${protocolsSnap.size} protocols.`);
  
  protocolsSnap.forEach(doc => {
    const data = doc.data();
    if (data.status && ['archived', 'draft', 'inactive'].includes(data.status)) return;
    
    const products = getProductsFromProtocol(data);
    products.forEach(p => {
      if (!p) return;
      if (!usageMap[p]) usageMap[p] = { protocols: [], prescriptions: [] };
      usageMap[p].protocols.push(doc.id);
    });
  });

  // 2. Process Prescriptions
  const prescriptionsSnap = await db.collection('prescriptions').get();
  console.log(`Found ${prescriptionsSnap.size} prescriptions.`);
  
  prescriptionsSnap.forEach(doc => {
    const data = doc.data();
    if (data.status && ['archived', 'draft', 'cancelled'].includes(data.status)) return;
    
    const products = getProductsFromPrescription(data);
    products.forEach(p => {
      if (!p) return;
      if (!usageMap[p]) usageMap[p] = { protocols: [], prescriptions: [] };
      usageMap[p].prescriptions.push(doc.id);
    });
  });

  // 3. Write to Firestore in batches
  const batchArray = [];
  let currentBatch = db.batch();
  let opCount = 0;

  for (const [product, data] of Object.entries(usageMap)) {
    const canonicalId = generateCanonicalId(product);
    if (!canonicalId) continue;
    const ref = db.collection('product_usage').doc(canonicalId);
    currentBatch.set(ref, {
      productName: product, // Store original for reference
      canonicalId: canonicalId,
      protocols: Array.from(new Set(data.protocols)),
      prescriptions: Array.from(new Set(data.prescriptions))
    }, { merge: true });
    
    opCount++;
    if (opCount >= 450) {
      batchArray.push(currentBatch);
      currentBatch = db.batch();
      opCount = 0;
    }
  }
  
  if (opCount > 0) {
    batchArray.push(currentBatch);
  }

  for (const batch of batchArray) {
    await batch.commit();
  }

  console.log(`Done! Seeded ${Object.keys(usageMap).length} product usage entries.`);
}

run().catch(console.error);

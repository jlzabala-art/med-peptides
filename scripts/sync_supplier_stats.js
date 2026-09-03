import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

const db = admin.firestore();

async function run() {
  console.log('Recalculating productsSupplied for all suppliers...');
  
  // First, map supplier IDs to their actual names and IDs
  const suppliersSnap = await db.collection('wholesellers').get();
  const suppliersInfo = {};
  
  suppliersSnap.docs.forEach(doc => {
    const data = doc.data();
    suppliersInfo[doc.id] = {
      name: data.companyName || data.name || '',
      count: 0
    };
  });
  
  const productsSnap = await db.collection('products').get();
  
  // Count products by supplier
  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const supId = data.supplierId;
    const supName = (data.supplier || '').trim();
    
    if (supId && suppliersInfo[supId]) {
      suppliersInfo[supId].count++;
    } else if (supName && supName !== 'UNKNOWN') {
      // Find matching supplier by name
      const matchId = Object.keys(suppliersInfo).find(id => suppliersInfo[id].name.toLowerCase() === supName.toLowerCase());
      if (matchId) {
        suppliersInfo[matchId].count++;
      }
    }
  }
  
  console.log('Product counts computed. Updating suppliers...');
  
  let batch = db.batch();
  let count = 0;
  
  for (const doc of suppliersSnap.docs) {
    const data = doc.data();
    const info = suppliersInfo[doc.id];
    
    const actualCount = info.count;
    const updates = { productsSupplied: actualCount };
    
    // Maintain explicit category overrides
    if (info.name.toLowerCase().includes('lotusland')) {
      updates.category = 'Peptides';
    } else if (info.name.toLowerCase().includes('fagron genomics')) {
      updates.category = 'Tests';
    } else if (info.name.toLowerCase().includes('fagron iberica')) {
      updates.category = 'APIs';
    }
    
    if (data.productsSupplied !== actualCount || (updates.category && data.category !== updates.category)) {
       batch.update(doc.ref, updates);
       count++;
       console.log(`Updated ${info.name}: count ${data.productsSupplied} -> ${actualCount}, cat: ${updates.category || data.category}`);
    }
    
    if (count === 400) {
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }
  
  if (count > 0) {
    await batch.commit();
  }
  
  console.log('Supplier sync complete.');
  process.exit(0);
}

run().catch(console.error);

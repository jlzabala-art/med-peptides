import { adminDb } from './src/lib/firebaseAdmin.js';
import fs from 'fs';

const masterList = JSON.parse(fs.readFileSync('./AI Prompts/LotusLand Master Price List.json', 'utf8'));

async function deleteDuplicates() {
  const pSnap = await adminDb.collection('products').get();
  
  // Track all lotusland variants to find duplicates
  const map = {};
  
  for (const doc of pSnap.docs) {
    const vSnap = await doc.ref.collection('variants').where('supplierId', '==', 'OLlBbQjgrj6tY7GmM2Jo').get();
    for (const v of vSnap.docs) {
      const data = v.data();
      const key = `${doc.id}_${data.dosage || ''}_${data.quantity || ''}`;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(v);
    }
  }

  let deletedCount = 0;
  for (const key in map) {
    const variants = map[key];
    if (variants.length > 1) {
      console.log(`Found ${variants.length} duplicates for ${key}`);
      
      // Sort variants so we keep the first one
      // We'll keep the one with a more "normal" id if possible, or just the first one
      const [keep, ...toDelete] = variants;
      
      for (const v of toDelete) {
        await v.ref.delete();
        deletedCount++;
        console.log(`  Deleted duplicate variant: ${v.id}`);
      }
    }
  }
  
  console.log(`Total duplicate variants deleted: ${deletedCount}`);
  
  // Count final Lotusland variants
  let finalCount = 0;
  for (const doc of pSnap.docs) {
    const vSnap = await doc.ref.collection('variants').where('supplierId', '==', 'OLlBbQjgrj6tY7GmM2Jo').get();
    finalCount += vSnap.docs.length;
  }
  console.log(`Final Lotusland variant count: ${finalCount}`);
}

deleteDuplicates();

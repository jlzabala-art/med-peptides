import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { db } from './scripts/lib/firebase-admin.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backupDir = join(__dirname, 'faq_backups');

async function repair() {
  console.log("Starting FAQ mapping repair...");
  
  // 1. Fetch old mappings to delete
  const mappingRef = db.collection('faq_peptide_mapping');
  const snap = await mappingRef.get();
  
  const deleteBatches = [];
  let deleteBatch = db.batch();
  let deleteCount = 0;
  
  snap.docs.forEach((d) => {
    deleteBatch.delete(d.ref);
    deleteCount++;
    if (deleteCount % 400 === 0) {
      deleteBatches.push(deleteBatch);
      deleteBatch = db.batch();
    }
  });
  if (deleteCount % 400 !== 0 && deleteCount > 0) {
    deleteBatches.push(deleteBatch);
  }

  // 2. Read new mappings
  const newMappingsRaw = readFileSync(join(backupDir, 'new_mappings.json'), 'utf8');
  const newMappings = JSON.parse(newMappingsRaw);
  
  const addBatches = [];
  let addBatch = db.batch();
  let addCount = 0;
  
  newMappings.forEach((m) => {
    // Generate a consistent ID based on peptide name and faqId
    const safeName = m.peptideName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const customId = `${safeName}_${m.faqId}`.slice(0, 150);
    const newDocRef = mappingRef.doc(customId);
    
    addBatch.set(newDocRef, {
      ...m,
      syncedAt: new Date().toISOString()
    });
    addCount++;
    
    if (addCount % 400 === 0) {
      addBatches.push(addBatch);
      addBatch = db.batch();
    }
  });
  if (addCount % 400 !== 0 && addCount > 0) {
    addBatches.push(addBatch);
  }

  console.log(`Prepared to delete ${deleteCount} old mappings and write ${addCount} new strict mappings.`);
  
  // Execute deletes
  for (let i = 0; i < deleteBatches.length; i++) {
     await deleteBatches[i].commit();
     console.log(`  ✓ Deleted batch ${i+1}/${deleteBatches.length}`);
  }
  
  // Execute adds
  for (let i = 0; i < addBatches.length; i++) {
     await addBatches[i].commit();
     console.log(`  ✓ Written batch ${i+1}/${addBatches.length}`);
  }

  console.log("\n--- Repair Complete ---");
  process.exit(0);
}

repair().catch(err => {
  console.error(err);
  process.exit(1);
});


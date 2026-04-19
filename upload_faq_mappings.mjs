import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// ⚠️ CANONICAL PROJECT: med-peptides-app — NEVER change to regenpept-web-app
const firebaseConfig = {
  apiKey: "AIzaSyDOV2zFeLGtPsE_O2b-gR3NHZygPspiSws",
  authDomain: "med-peptides-app-27a3a.firebaseapp.com",
  projectId: "med-peptides-app",
  storageBucket: "med-peptides-app.firebasestorage.app",
  messagingSenderId: "514143707883",
  appId: "1:514143707883:web:6c12470433ef6c992714ae",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backupDir = join(__dirname, 'faq_backups');

async function repair() {
  console.log("Starting FAQ mapping repair...");
  
  // 1. Fetch old mappings to delete
  const mappingRef = collection(db, 'faq_peptide_mapping');
  const snap = await getDocs(mappingRef);
  
  const deleteBatches = [];
  let deleteBatch = writeBatch(db);
  let deleteCount = 0;
  
  snap.docs.forEach((d) => {
    deleteBatch.delete(d.ref);
    deleteCount++;
    if (deleteCount % 400 === 0) {
      deleteBatches.push(deleteBatch);
      deleteBatch = writeBatch(db);
    }
  });
  if (deleteCount % 400 !== 0) {
    deleteBatches.push(deleteBatch);
  }

  // 2. Read new mappings
  const newMappingsRaw = readFileSync(join(backupDir, 'new_mappings.json'), 'utf8');
  const newMappings = JSON.parse(newMappingsRaw);
  
  const addBatches = [];
  let addBatch = writeBatch(db);
  let addCount = 0;
  
  newMappings.forEach((m) => {
    // Generate a consistent ID based on peptide name and faqId
    const safeName = m.peptideName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const customId = `${safeName}_${m.faqId}`.slice(0, 150);
    const newRef = doc(mappingRef, customId);
    
    addBatch.set(newRef, {
      ...m,
      syncedAt: new Date().toISOString()
    });
    addCount++;
    
    if (addCount % 400 === 0) {
      addBatches.push(addBatch);
      addBatch = writeBatch(db);
    }
  });
  if (addCount % 400 !== 0) {
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

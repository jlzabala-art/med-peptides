import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import { readFileSync, writeFileSync } from 'fs';
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

async function migrate() {
  console.log("Starting full migration of extracted FAQs...");
  
  // 1. Read the extracted FAQs
  const faqDataRaw = readFileSync(join(__dirname, 'faq_migration.json'), 'utf8');
  const extractedFaqs = JSON.parse(faqDataRaw);
  
  const faqCollection = collection(db, 'peptide_faq');
  const mappingCollection = collection(db, 'faq_peptide_mapping');
  
  let faqCount = 0;
  let mappingCount = 0;
  
  // Use batches of 400 (Firebase limit is 500)
  const batches = [];
  let currentBatch = writeBatch(db);
  let batchOps = 0;
  
  extractedFaqs.forEach((faq) => {
    // Schema mapping
    const peptideName = faq.product_ids && faq.product_ids[0] ? faq.product_ids[0].toUpperCase() : 'UNKNOWN';
    const categoryId = faq.category ? faq.category.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'general';
    
    const firestoreFaq = {
      active: true,
      answer: faq.answer_long,
      audience: 'both',
      categoryId: categoryId,
      faqId: faq.id,
      question: faq.question,
      relatedCatalogKeywords: faq.tags || [],
      relatedFamilies: [],
      relatedFormats: ['vial'],
      relatedGoals: [],
      relatedPeptideNames: faq.product_ids || [],
      scope: 'peptide',
      searchWeight: 5,
      seoDescription: faq.answer_short,
      seoKeywords: faq.tags || [],
      seoTitle: faq.question,
      shortAnswer: faq.answer_short,
      suggestedCta: `Learn more about ${peptideName}`,
      syncedAt: new Date().toISOString(),
      tags: faq.tags || [],
      visibility: 'public'
    };
    
    // Set FAQ document
    const faqRef = doc(faqCollection, faq.id);
    currentBatch.set(faqRef, firestoreFaq);
    faqCount++;
    batchOps++;
    
    // Create mapping entry for each product_id
    (faq.product_ids || []).forEach((pName) => {
      const mappingId = `mapping_${pName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${faq.id}`.slice(0, 150);
      const mappingRef = doc(mappingCollection, mappingId);
      
      currentBatch.set(mappingRef, {
        familySlug: 'none',
        faqId: faq.id,
        mappingType: 'exact_product',
        peptideName: pName, // Use original casing (as extraction script did)
        priority: 5,
        syncedAt: new Date().toISOString()
      });
      mappingCount++;
      batchOps++;
    });
    
    if (batchOps >= 400) {
      batches.push(currentBatch);
      currentBatch = writeBatch(db);
      batchOps = 0;
    }
  });
  
  if (batchOps > 0) {
    batches.push(currentBatch);
  }
  
  console.log(`Processing ${batches.length} batches to upload ${faqCount} FAQs and ${mappingCount} Mappings...`);
  
  for (let i = 0; i < batches.length; i++) {
    await batches[i].commit();
    console.log(`  ✓ Committed batch ${i + 1}/${batches.length}`);
  }
  
  console.log("\n--- Full FAQ Migration Complete ---");
  process.exit(0);
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});

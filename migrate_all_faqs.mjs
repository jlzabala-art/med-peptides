import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { db } from './scripts/lib/firebase-admin.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  console.log("Starting full migration of extracted FAQs...");
  
  // 1. Read the extracted FAQs
  const faqDataRaw = readFileSync(join(__dirname, 'faq_migration.json'), 'utf8');
  const extractedFaqs = JSON.parse(faqDataRaw);
  
  const faqCollection = db.collection('peptide_faq');
  const mappingCollection = db.collection('faq_peptide_mapping');
  
  let faqCount = 0;
  let mappingCount = 0;
  
  // Use batches of 400 (Firebase limit is 500)
  const batches = [];
  let currentBatch = db.batch();
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
    const faqRef = faqCollection.doc(faq.id);
    currentBatch.set(faqRef, firestoreFaq);
    faqCount++;
    batchOps++;
    
    // Create mapping entry for each product_id
    (faq.product_ids || []).forEach((pName) => {
      const mappingId = `mapping_${pName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${faq.id}`.slice(0, 150);
      const mappingRef = mappingCollection.doc(mappingId);
      
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
      currentBatch = db.batch();
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


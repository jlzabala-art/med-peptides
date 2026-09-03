import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Assuming you have a service account key set via GOOGLE_APPLICATION_CREDENTIALS or standard local run
try {
  initializeApp();
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    throw error;
  }
}

const db = getFirestore();

// Helper to create slugs
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');      // Replace multiple - with single -
};

async function run() {
  const lotusPath = path.join(process.cwd(), 'AI Prompts', 'LotusLand Master Price List.json');
  const rawData = fs.readFileSync(lotusPath, 'utf-8');
  const lotusList = JSON.parse(rawData);

  // Extract unique product names from LotusLand
  const uniqueMasterNames = [...new Set(lotusList.map(item => item.product).filter(Boolean))];
  
  console.log(`Found ${uniqueMasterNames.length} unique master peptides.`);

  const protocolsRef = db.collection('protocols');
  const snapshot = await protocolsRef.get();

  const batchSize = 100;
  let batch = db.batch();
  let count = 0;
  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const protocol = doc.data();
    
    // We want to determine which peptideIds this protocol should have.
    // We can try to match the protocol name or its existing protocolMapping against our master names.
    let matchedPeptideIds = new Set();

    const searchTexts = [
      protocol.name?.toLowerCase() || '',
      protocol.description?.toLowerCase() || ''
    ];

    if (protocol.protocolMapping) {
      if (Array.isArray(protocol.protocolMapping)) {
         searchTexts.push(...protocol.protocolMapping.map(m => m.toLowerCase()));
      } else {
         searchTexts.push(...Object.keys(protocol.protocolMapping).map(k => k.toLowerCase()));
      }
    }

    const fullSearchText = searchTexts.join(' ');

    for (const masterName of uniqueMasterNames) {
      const lowerMaster = masterName.toLowerCase();
      const masterSlug = slugify(masterName);
      
      // Attempt to match the master name in the combined search text
      // We use word boundaries to avoid partial matches
      // Special case for names with special characters like GHK-Cu, TB-500
      const regex = new RegExp(`\\b${lowerMaster.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")}\\b`, 'i');
      
      if (regex.test(fullSearchText)) {
        matchedPeptideIds.add(masterSlug);
      }
    }

    // Special fallback: if no matches, check if any of the existing mapping matches directly
    if (matchedPeptideIds.size === 0 && protocol.protocolMapping) {
      let mappings = [];
      if (Array.isArray(protocol.protocolMapping)) {
        mappings = protocol.protocolMapping;
      } else {
        mappings = Object.keys(protocol.protocolMapping);
      }

      for (const mapping of mappings) {
         // slugify mapping and see if it loosely matches a master slug
         const mSlug = slugify(mapping);
         for (const masterName of uniqueMasterNames) {
           if (slugify(masterName) === mSlug) {
             matchedPeptideIds.add(mSlug);
           }
         }
      }
    }
    
    // Also try checking the exact mapping for GHK-Cu vs GHK
    if (fullSearchText.includes('ghk') && !matchedPeptideIds.has(slugify('GHK-Cu (Human Copper)'))) {
        // Just an example, maybe not strict. 
        // Let's rely on the user mapped protocols. 
        // The user says "hay cero protocols para GHK, cuando hay mas de uno"
        // GHK is mapped to GHK-Cu in Lotusland maybe? Lotusland has "GHK-Cu (Human Copper)".
    }

    // Hardcode GHK fix based on user message "porque me dice que hay cero protocols para GHK"
    // If the text contains ghk, let's map it to GHK-Cu
    if (/\bghk\b/i.test(fullSearchText)) {
       matchedPeptideIds.add(slugify('GHK-Cu (Human Copper)'));
    }

    const peptideIdsArray = Array.from(matchedPeptideIds);
    
    // Clean up protocolMapping to save space and avoid confusion, 
    // but maybe keep it for reference? The plan says "clears legacy protocolMapping".
    // I will use FieldValue.delete() but I need FieldValue from admin sdk.

    const updates = {
      peptideIds: peptideIdsArray
    };
    
    // We don't delete protocolMapping yet just in case. Or let's delete it.
    updates.protocolMapping = null; // Simplest way without importing FieldValue

    console.log(`Protocol "${protocol.name}" => Peptides:`, peptideIdsArray);

    batch.update(doc.ref, updates);
    count++;
    updatedCount++;

    if (count === batchSize) {
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  console.log(`Finished migrating ${updatedCount} protocols.`);
}

run().catch(console.error);

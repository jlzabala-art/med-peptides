import { adminDb } from './src/lib/firebaseAdmin.js';

async function main() {
  const isDryRun = process.argv.includes('--execute') ? false : true;
  console.log(`Starting Variant Format Normalization (Dry Run: ${isDryRun})`);

  const variantsRef = adminDb.collectionGroup('variants');
  const snapshot = await variantsRef.get();

  let totalUpdated = 0;
  let batches = [adminDb.batch()];
  let currentBatchIndex = 0;
  let currentBatchCount = 0;
  
  const changes = {
    vial: 0,
    pen: 0,
    spray: 0,
    oral: 0,
    topical: 0
  };

  snapshot.forEach((doc) => {
    const v = doc.data();
    const oldFormatId = v.formatId || '';
    let newFormatId = 'vial'; // fallback
    
    // Concatenate all relevant fields so we don't short-circuit on truthy but irrelevant values like "Standard"
    const fmt = `${v.format || ''} ${v.name || ''} ${doc.id || ''}`.toLowerCase();
    
    if (fmt.includes('pen') || fmt.includes('pre-filled') || fmt.includes('prefilled')) {
      newFormatId = 'pen';
    } else if (fmt.includes('spray') || fmt.includes('nasal')) {
      newFormatId = 'spray';
    } else if (fmt.includes('capsule') || fmt.includes('pill') || fmt.includes('oral') || fmt.includes('drop')) {
      newFormatId = 'oral';
    } else if (fmt.includes('cream') || fmt.includes('gel') || fmt.includes('topical')) {
      newFormatId = 'topical';
    } else {
      newFormatId = 'vial';
    }

    if (oldFormatId !== newFormatId) {
      if (totalUpdated < 5) {
        console.log(`[Reverting Change] Variant: ${doc.id}`);
        console.log(`  Old formatId: "${oldFormatId}"  ->  New formatId: "${newFormatId}"`);
      }

      changes[newFormatId]++;
      totalUpdated++;
      
      if (!isDryRun) {
        if (currentBatchCount === 500) {
          batches.push(adminDb.batch());
          currentBatchIndex++;
          currentBatchCount = 0;
        }
        batches[currentBatchIndex].update(doc.ref, { formatId: newFormatId });
        currentBatchCount++;
      }
    }
  });
  
  console.log('\n--- Normalization Summary ---');
  console.log(`Total variants inspected: ${snapshot.size}`);
  console.log(`Total variants requiring update: ${totalUpdated}`);
  console.log('Breakdown of new formats applied:', changes);

  if (!isDryRun && totalUpdated > 0) {
    console.log(`Committing ${batches.length} batch(es) to Firestore...`);
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`Batch ${i + 1}/${batches.length} committed successfully.`);
    }
    console.log('All updates applied!');
  } else if (isDryRun) {
    console.log('\nThis was a DRY RUN. No changes were made to Firestore.');
    console.log('Run the script with "--execute" to apply the changes.');
  }
}

main().catch(console.error);

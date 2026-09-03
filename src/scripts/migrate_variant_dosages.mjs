import { adminDb } from '../lib/firebaseAdmin.js';

async function migrateDosages() {
  console.log('--- Starting Dosage & Presentation Data Migration ---');
  const vSnap = await adminDb.collectionGroup('variants').get();
  console.log(`Scanning ${vSnap.size} variants across all products...`);

  let updatedCount = 0;
  const batchSize = 400;
  let currentBatch = adminDb.batch();
  let opsInBatch = 0;

  for (const doc of vSnap.docs) {
    const data = doc.data();
    const rawDosage = (data.dosage || data.dose || '').trim();
    let rawPres = (data.presentation || data.presentationName || data.format || '').trim();

    let cleanDosage = rawDosage;
    let cleanPres = rawPres;

    // Check if dosage contains format suffix like "/ vial", "/ pen", etc.
    const match = rawDosage.match(/^([\d.]+\s*(?:mg|mcg|iu|ml|g|ug|units|capsules|tablets))\s*[\/·\-\s]+(.*)$/i);
    if (match) {
      cleanDosage = match[1].trim();
      const extractedFormat = match[2].trim();
      if (!cleanPres || cleanPres.toLowerCase() === 'standard' || cleanPres.toLowerCase() === 'default') {
        cleanPres = extractedFormat;
      }
    } else {
      cleanDosage = cleanDosage.replace(/[\/·\-]\s*(?:vial|pen|bottle|ampoule|cap|tab|powder|spray|cartridge|syringe).*$/i, '').trim();
    }

    // Format normalization
    if (!cleanPres || cleanPres.toLowerCase() === 'standard' || cleanPres.toLowerCase() === 'default') {
      cleanPres = 'Vial';
    } else if (cleanPres.toLowerCase() === 'vial') {
      cleanPres = 'Vial';
    } else if (cleanPres.toLowerCase() === 'pen' || cleanPres.toLowerCase().includes('pen')) {
      cleanPres = 'Pre-filled Pen';
    } else if (cleanPres.toLowerCase().includes('powder') || cleanPres.toLowerCase().includes('lyophilized')) {
      cleanPres = 'Lyophilized Powder';
    } else {
      cleanPres = cleanPres.replace(/\b\w/g, l => l.toUpperCase());
    }

    // If change is detected, queue update
    if (cleanDosage !== rawDosage || cleanPres !== rawPres) {
      currentBatch.update(doc.ref, {
        dosage: cleanDosage,
        presentation: cleanPres,
        format: cleanPres,
        updatedAt: new Date().toISOString(),
      });
      opsInBatch++;
      updatedCount++;

      if (opsInBatch >= batchSize) {
        await currentBatch.commit();
        console.log(`Committed batch of ${opsInBatch} updates...`);
        currentBatch = adminDb.batch();
        opsInBatch = 0;
      }
    }
  }

  if (opsInBatch > 0) {
    await currentBatch.commit();
    console.log(`Committed final batch of ${opsInBatch} updates.`);
  }

  console.log(`--- Migration Complete: ${updatedCount} variants cleaned and updated in Firestore ---`);
  process.exit(0);
}

migrateDosages().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

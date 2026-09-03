import { adminDb } from '../lib/firebaseAdmin.js';

async function unifyRefillsToSingleCartridgePen() {
  if (!adminDb) {
    console.error('adminDb is null');
    process.exit(1);
  }

  console.log('--- Unifying refill_cartridge to single_cartridge_pen in Firestore ---');
  const snap = await adminDb.collectionGroup('variants').get();
  console.log(`Checking ${snap.size} total variants...`);

  let batch = adminDb.batch();
  let opCount = 0;
  let updatedCount = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const pres = String(data.presentation || '').trim();
    const format = String(data.format || '').trim();
    const name = String(data.presentationName || '').trim();

    if (
      pres === 'refill_cartridge' ||
      pres === 'cartridge' ||
      format === 'refill_cartridge' ||
      format === 'cartridge' ||
      name === 'Refill Cartridge'
    ) {
      batch.update(doc.ref, {
        presentation: 'single_cartridge_pen',
        format: 'single_cartridge_pen',
        presentationName: 'Single Cartridge Pen',
        updatedAt: new Date().toISOString(),
      });
      opCount++;
      updatedCount++;

      if (opCount >= 400) {
        await batch.commit();
        console.log(`Committed batch of ${opCount}...`);
        batch = adminDb.batch();
        opCount = 0;
      }
    }
  }

  if (opCount > 0) {
    await batch.commit();
  }

  console.log(`✅ Unification complete! Converted ${updatedCount} cartridge/refill variants to 'single_cartridge_pen'.`);
}

unifyRefillsToSingleCartridgePen()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });

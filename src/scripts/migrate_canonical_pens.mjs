import { adminDb } from '../lib/firebaseAdmin.js';

async function migratePensToCanonical() {
  if (!adminDb) {
    console.error('adminDb is null');
    process.exit(1);
  }

  console.log('--- Migrating Pen & Cartridge variants to canonical clinical schema ---');
  const snap = await adminDb.collectionGroup('variants').get();
  console.log(`Analyzing ${snap.size} variants across all products...`);

  let batch = adminDb.batch();
  let opCount = 0;
  let updatedCount = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const rawPres = String(data.presentation || '').trim();
    const rawPresName = String(data.presentationName || '').trim();
    const rawFormat = String(data.format || '').trim();
    const combined = `${rawPres} ${rawPresName} ${rawFormat}`.toLowerCase();

    let targetId = null;
    let targetLabel = null;

    if (combined.includes('double') && (combined.includes('cartridge') || combined.includes('pen'))) {
      targetId = 'double_cartridge_pen';
      targetLabel = 'Double Cartridge Pen';
    } else if (combined.includes('refill') || (combined.includes('cartridge') && !combined.includes('pen'))) {
      targetId = 'refill_cartridge';
      targetLabel = 'Refill Cartridge';
    } else if (
      combined.includes('pen') ||
      combined.includes('single use') ||
      combined.includes('prefilled') ||
      combined.includes('pre-filled') ||
      rawPres === 'pen'
    ) {
      targetId = 'single_cartridge_pen';
      targetLabel = 'Single Cartridge Pen';
    }

    if (targetId) {
      const needsUpdate = (
        data.presentation !== targetId ||
        data.format !== targetId ||
        data.presentationName !== targetLabel
      );

      if (needsUpdate) {
        batch.update(doc.ref, {
          presentation: targetId,
          format: targetId,
          presentationName: targetLabel,
          updatedAt: new Date().toISOString(),
        });
        opCount++;
        updatedCount++;

        if (opCount >= 400) {
          await batch.commit();
          console.log(`Committed batch of ${opCount} variants...`);
          batch = adminDb.batch();
          opCount = 0;
        }
      }
    }
  }

  if (opCount > 0) {
    await batch.commit();
  }

  console.log(`✅ Migration complete! Updated ${updatedCount} variants to canonical schema:`);
  console.log(`   - single_cartridge_pen -> 'Single Cartridge Pen'`);
  console.log(`   - double_cartridge_pen -> 'Double Cartridge Pen'`);
  console.log(`   - refill_cartridge     -> 'Refill Cartridge'`);
}

migratePensToCanonical()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });

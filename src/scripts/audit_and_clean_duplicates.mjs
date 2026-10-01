import { adminDb } from '../lib/firebaseAdmin.js';

async function auditAndCleanDuplicates(dryRun = true) {
  console.log(`[auditAndCleanDuplicates] Running (dryRun=${dryRun})...`);
  const snap = await adminDb.collection('products').get();
  console.log(`Scanning ${snap.size} products...`);
  
  let productsWithDups = 0;
  let totalDupsRemoved = 0;

  for (const doc of snap.docs) {
    const d = doc.data();
    const docVariants = Array.isArray(d.variants) ? d.variants : [];
    const vSnap = await doc.ref.collection('variants').get();
    const subVariants = vSnap.docs.map(vd => ({ id: vd.id, docRef: vd.ref, ...vd.data() }));

    // Group subcollection variants by canonical key
    const subVariantMap = new Map();
    const subVariantsToDelete = [];

    for (const v of subVariants) {
      if (!v) continue;
      const rawDose = (v.dosage || v.dose || v.strength || '').trim().toLowerCase().replace(/\s+/g, '');
      const supp = (v.supplierId || d.supplierId || '').toLowerCase();
      const fmt = (v.presentation || v.format || 'vial').toLowerCase();
      const normFmt = (fmt.includes('bottle') || fmt.includes('vial')) ? 'liquid_container' : fmt;
      const key = `${supp}__${rawDose}__${normFmt}`;

      if (!rawDose) continue;

      if (!subVariantMap.has(key)) {
        subVariantMap.set(key, v);
      } else {
        const existing = subVariantMap.get(key);
        // Determine which variant is more complete or preferred
        // Prefer variant with full pricing or higher priority
        const existingHasKit = Boolean(existing.kitPrice || existing.tier10UnitPrice || existing.quantityPerKit);
        const vHasKit = Boolean(v.kitPrice || v.tier10UnitPrice || v.quantityPerKit);
        
        let toKeep = existing;
        let toDelete = v;

        if (vHasKit && !existingHasKit) {
          toKeep = v;
          toDelete = existing;
          subVariantMap.set(key, v);
        } else if (v.id.includes('lotusland') && !existing.id.includes('lotusland') && !existingHasKit) {
          toKeep = v;
          toDelete = existing;
          subVariantMap.set(key, v);
        }

        subVariantsToDelete.push({
          duplicateId: toDelete.id,
          keptId: toKeep.id,
          key,
          docRef: toDelete.docRef
        });
      }
    }

    // Now check doc.variants array
    const cleanDocVariants = [];
    const docVariantMap = new Map();

    for (const v of docVariants) {
      if (!v) continue;
      const rawDose = (v.dosage || v.dose || v.strength || '').trim().toLowerCase().replace(/\s+/g, '');
      const supp = (v.supplierId || d.supplierId || '').toLowerCase();
      const fmt = (v.presentation || v.format || 'vial').toLowerCase();
      const normFmt = (fmt.includes('bottle') || fmt.includes('vial')) ? 'liquid_container' : fmt;
      const key = `${supp}__${rawDose}__${normFmt}`;

      if (!rawDose) {
        cleanDocVariants.push(v);
        continue;
      }

      if (!docVariantMap.has(key)) {
        docVariantMap.set(key, v);
        cleanDocVariants.push(v);
      } else {
        // Duplicate in doc.variants
      }
    }

    if (subVariantsToDelete.length > 0 || cleanDocVariants.length !== docVariants.length) {
      productsWithDups++;
      console.log(`\nProduct [${doc.id}] "${d.name || d.canonicalName}":`);
      if (subVariantsToDelete.length > 0) {
        console.log(`  Subcollection duplicates (${subVariantsToDelete.length}):`, 
          subVariantsToDelete.map(x => `Delete ${x.duplicateId} (kept ${x.keptId} for ${x.key})`));
      }
      if (cleanDocVariants.length !== docVariants.length) {
        console.log(`  docVariants array duplicates: had ${docVariants.length}, keeping ${cleanDocVariants.length}`);
      }

      if (!dryRun) {
        // Execute deletions
        for (const item of subVariantsToDelete) {
          if (item.docRef) {
            await item.docRef.delete();
            totalDupsRemoved++;
          }
        }
        // Update doc.variants
        await doc.ref.update({
          variants: cleanDocVariants,
          _variantsCleanedAt: new Date().toISOString()
        });
        console.log(`  -> Applied changes to Firestore for ${doc.id}`);
      }
    }
  }

  console.log(`\n===========================================`);
  console.log(`Total products with duplicates: ${productsWithDups}`);
  if (!dryRun) {
    console.log(`Total subcollection duplicate documents removed: ${totalDupsRemoved}`);
  }
}

const isDryRun = process.argv.includes('--execute') ? false : true;
auditAndCleanDuplicates(isDryRun).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

import { db } from './lib/firebase-admin.mjs';

/**
 * Fast dosage normalizer using collectionGroup('variants') instead of 470 sequential queries.
 */
async function fastNormalize() {
  console.log('--- FAST NORMALIZATION VIA COLLECTION GROUP ---');
  const variantsSnap = await db.collectionGroup('variants').get();
  console.log(`Loaded ${variantsSnap.size} total variants across the database.`);

  let fagronCount = 0;
  let testCount = 0;
  let bioniqCount = 0;
  let otherCount = 0;

  let batch = db.batch();
  let batchOps = 0;

  for (const doc of variantsSnap.docs) {
    const v = doc.data();
    const currentDosage = (v.dosage || v.dose || '').trim();
    const isGeneric = !currentDosage || 
                      /^standard(\s+clinical(\s+strength)?)?$/i.test(currentDosage) || 
                      currentDosage === 'Standard Dose';

    if (!isGeneric) continue;

    const supp = (v.supplierName || v.supplierId || v.supplier || '').toLowerCase();
    const vId = doc.id.toLowerCase();
    const parentProdId = (doc.ref.parent.parent ? doc.ref.parent.parent.id : '').toLowerCase();

    let targetDosage = null;

    // 1. Bioniq Products
    if (supp.includes('bioniq')) {
      if (vId.includes('semax') || parentProdId.includes('semax')) {
        targetDosage = '30 mg';
      } else if (vId.includes('dsip') || parentProdId.includes('dsip')) {
        targetDosage = '10 mg';
      } else if (vId.includes('dihexa') || parentProdId.includes('dihexa')) {
        targetDosage = '10 mg';
      } else if (vId.includes('nad') || parentProdId.includes('nad')) {
        targetDosage = '100 mg';
      } else if (vId.includes('bpc_157_kpv') || (parentProdId.includes('bpc') && parentProdId.includes('kpv'))) {
        targetDosage = '500 mcg + 500 mcg';
      } else if (vId.includes('pt_141_oxytocin') || (parentProdId.includes('pt-141') && parentProdId.includes('oxytocin'))) {
        targetDosage = '10 mg + 100 IU';
      } else if (vId.includes('oxytocin_methylene') || (parentProdId.includes('oxytocin') && parentProdId.includes('methylene'))) {
        targetDosage = '100 IU + 5 mg';
      }
      if (targetDosage) bioniqCount++;
    }

    // 2. Bacteriostatic Water
    else if (parentProdId.includes('bacteriostatic') || vId.includes('bacteriostatic')) {
      targetDosage = '30 ml';
      otherCount++;
    }

    // 3. Diagnostic Tests
    else if (
      supp.includes('24genetics') || 
      supp.includes('eterna') || 
      parentProdId.includes('test') || 
      parentProdId.includes('nutrigen') || 
      parentProdId.includes('telotest')
    ) {
      targetDosage = '1 Test Kit';
      testCount++;
    }

    // 4. Fagron Iberia (Compounding Raw Materials / Magistral)
    else if (supp.includes('fagron')) {
      targetDosage = 'Custom / Magistral';
      fagronCount++;
    }

    if (targetDosage) {
      batch.update(doc.ref, {
        dosage: targetDosage,
        dose: targetDosage,
        updatedAt: new Date().toISOString(),
        _dosageNormalizedAt: new Date().toISOString()
      });
      batchOps++;

      if (batchOps >= 400) {
        await batch.commit();
        batch = db.batch();
        batchOps = 0;
      }
    }
  }

  if (batchOps > 0) {
    await batch.commit();
  }

  console.log('--- FAST NORMALIZATION COMPLETE ---');
  console.log(`✓ Fagron Iberia (Custom / Magistral): ${fagronCount}`);
  console.log(`✓ Diagnostic Tests (1 Test Kit):     ${testCount}`);
  console.log(`✓ Bioniq Finished Products:          ${bioniqCount}`);
  console.log(`✓ Other (e.g. Bacteriostatic Water): ${otherCount}`);
  console.log(`Total variants updated:              ${fagronCount + testCount + bioniqCount + otherCount}`);
}

fastNormalize()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });

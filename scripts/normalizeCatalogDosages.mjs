import { db } from './lib/firebase-admin.mjs';

/**
 * Script to normalize non-peptide and commercial products without explicit dosage:
 * 1. Fagron Iberia (APIs/Magistral): label dosage as "Custom / Magistral"
 * 2. Diagnostic tests (24Genetics, Fagron Genomics, Eterna): label dosage as "1 Test Kit"
 * 3. NP Labs Bacteriostatic Water: label dosage as "30 ml"
 * 4. Bioniq remaining products:
 *    - Semax: 30 mg
 *    - DSIP: 10 mg
 *    - Dihexa: 10 mg (Oral Capsule)
 *    - NAD+: 100 mg / 10 ml
 *    - BPC-157 + KPV: 500 mcg + 500 mcg
 *    - PT-141 + Oxytocin: 10 mg + 100 IU
 *    - Oxytocin + Methylene Blue: 100 IU + 5 mg
 */

async function normalizeCatalogDosages() {
  console.log('--- STARTING CATALOG DOSAGE NORMALIZATION ---');
  const productsSnap = await db.collection('products').get();

  let fagronCount = 0;
  let testCount = 0;
  let bioniqCount = 0;
  let otherCount = 0;

  let batch = db.batch();
  let batchOps = 0;

  const commitBatchIfNeeded = async () => {
    if (batchOps >= 400) {
      await batch.commit();
      batch = db.batch();
      batchOps = 0;
    }
  };

  for (const productDoc of productsSnap.docs) {
    const product = productDoc.data();
    const productId = productDoc.id;
    const vSnap = await db.collection('products').doc(productId).collection('variants').get();

    for (const vDoc of vSnap.docs) {
      const v = vDoc.data();
      const currentDosage = (v.dosage || v.dose || '').trim();
      const isGeneric = !currentDosage || 
                        /^standard(\s+clinical(\s+strength)?)?$/i.test(currentDosage) || 
                        currentDosage === 'Standard Dose';

      if (!isGeneric) continue;

      const supp = (v.supplierName || v.supplierId || v.supplier || '').toLowerCase();
      const cat = (product.category || product.product_type || '').toLowerCase();
      const pName = (product.name || '').toLowerCase();
      const vId = vDoc.id.toLowerCase();

      let targetDosage = null;

      // Case 1: Bioniq Finished Products
      if (supp.includes('bioniq')) {
        if (vId.includes('semax') || pName.includes('semax')) {
          targetDosage = '30 mg';
        } else if (vId.includes('dsip') || pName.includes('dsip')) {
          targetDosage = '10 mg';
        } else if (vId.includes('dihexa') || pName.includes('dihexa')) {
          targetDosage = '10 mg';
        } else if (vId.includes('nad') || pName.includes('nad')) {
          targetDosage = '100 mg';
        } else if (vId.includes('bpc_157_kpv') || (pName.includes('bpc') && pName.includes('kpv'))) {
          targetDosage = '500 mcg + 500 mcg';
        } else if (vId.includes('pt_141_oxytocin') || (pName.includes('pt-141') && pName.includes('oxytocin'))) {
          targetDosage = '10 mg + 100 IU';
        } else if (vId.includes('oxytocin_methylene') || (pName.includes('oxytocin') && pName.includes('methylene'))) {
          targetDosage = '100 IU + 5 mg';
        }
        if (targetDosage) {
          bioniqCount++;
        }
      }

      // Case 2: Bacteriostatic Water
      else if (pName.includes('bacteriostatic water') || vId.includes('bacteriostatic-water')) {
        targetDosage = '30 ml';
        otherCount++;
      }

      // Case 3: Diagnostic Tests (24Genetics, Fagron Genomics, Eterna)
      else if (
        supp.includes('24genetics') || 
        supp.includes('eterna') || 
        pName.includes('dna test') || 
        pName.includes('test') || 
        pName.includes('nutrigen') || 
        pName.includes('telotest') ||
        cat.includes('test') || 
        cat.includes('diagnostic')
      ) {
        targetDosage = '1 Test Kit';
        testCount++;
      }

      // Case 4: Fagron Iberia (Compounding raw materials / API bulk)
      else if (supp.includes('fagron')) {
        targetDosage = 'Custom / Magistral';
        fagronCount++;
      }

      if (targetDosage) {
        batch.update(vDoc.ref, {
          dosage: targetDosage,
          dose: targetDosage,
          updatedAt: new Date().toISOString(),
          _dosageNormalizedAt: new Date().toISOString()
        });
        batchOps++;
        await commitBatchIfNeeded();
      }
    }
  }

  if (batchOps > 0) {
    await batch.commit();
  }

  console.log('--- SUMMARY OF NORMALIZATION ---');
  console.log(`✓ Fagron Iberia (Custom / Magistral): ${fagronCount}`);
  console.log(`✓ Diagnostic Tests (1 Test Kit):     ${testCount}`);
  console.log(`✓ Bioniq Finished Products:          ${bioniqCount}`);
  console.log(`✓ Other (e.g. Bacteriostatic Water): ${otherCount}`);
  console.log(`Total variants updated:              ${fagronCount + testCount + bioniqCount + otherCount}`);
}

normalizeCatalogDosages()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

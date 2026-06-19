const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateFilterSchema() {
  console.log('Starting Filter Schema Migration (Admin SDK)...');
  let updatedCount = 0;
  try {
    const productsRef = db.collection('products');
    const productsSnap = await productsRef.get();

    for (const pDoc of productsSnap.docs) {
      const pData = pDoc.data();
      let pUpdate = {};

      const oldCat = (pData.category || '').toLowerCase();
      const oldSubCat = (pData.subCategory || '').toLowerCase();
      const nameStr = (pData.name || '').toLowerCase();

      let pType = 'lyophilized_peptide';
      let goals = [];

      if (oldCat.includes('api') || oldCat.includes('raw')) {
        pType = nameStr.includes('supplement') ? 'api_supplement' : 'api_peptide';
      } else if (
        oldCat.includes('test') ||
        oldCat.includes('genomics') ||
        oldCat.includes('biomarker')
      ) {
        pType =
          nameStr.includes('dna') || nameStr.includes('genomic')
            ? 'dna_testing_kit'
            : 'biomarker_testing_kit';
      } else if (oldCat.includes('pellet')) {
        pType = 'pellet';
      } else if (oldCat.includes('injectable') && !oldCat.includes('lyo')) {
        pType = 'injectable';
      } else if (oldCat.includes('capsule') || oldCat.includes('tablet')) {
        pType = 'capsule_tablet';
      } else if (oldCat.includes('device')) {
        pType = 'medical_device';
      } else if (oldCat.includes('consumable')) {
        pType = 'consumable';
      } else if (oldCat.includes('service')) {
        pType = 'service';
      } else {
        pType = 'lyophilized_peptide';
      }

      const goalMapping = [
        { keyword: 'weight loss', goal: 'weight_loss_glp1' },
        { keyword: 'glp-1', goal: 'weight_loss_glp1' },
        { keyword: 'metabolic', goal: 'metabolic_health' },
        { keyword: 'anti-aging', goal: 'anti_aging_longevity' },
        { keyword: 'longevity', goal: 'anti_aging_longevity' },
        { keyword: 'recovery', goal: 'recovery_healing' },
        { keyword: 'healing', goal: 'recovery_healing' },
        { keyword: 'cognitive', goal: 'cognitive_mood' },
        { keyword: 'mood', goal: 'cognitive_mood' },
        { keyword: 'nootropic', goal: 'cognitive_mood' },
        { keyword: 'hormon', goal: 'hormonal_optimization' },
        { keyword: 'fertility', goal: 'fertility' },
        { keyword: 'immune', goal: 'immune_support' },
        { keyword: 'skin', goal: 'skin_hair_aesthetics' },
        { keyword: 'hair', goal: 'skin_hair_aesthetics' },
        { keyword: 'aesthetic', goal: 'skin_hair_aesthetics' },
        { keyword: 'performance', goal: 'performance_muscle' },
        { keyword: 'muscle', goal: 'performance_muscle' },
        { keyword: 'growth', goal: 'performance_muscle' },
        { keyword: 'biomarker', goal: 'biomarkers' },
        { keyword: 'genomics', goal: 'genomics' },
      ];

      const combineStr = `${oldCat} ${oldSubCat} ${nameStr}`;
      goalMapping.forEach((m) => {
        if (combineStr.includes(m.keyword) && !goals.includes(m.goal)) {
          goals.push(m.goal);
        }
      });
      if (goals.length === 0) goals.push('general_wellness');

      const commercialStatus = {
        inStock: (pData.stock || 0) > 0,
        priceMissing: pData.isMissingPricing || false,
        supplierMissing: pData.isMissingSupplier || false,
        singleSourceRisk: true,
      };

      const regulatoryStatus = {
        registered: pData.registration === 'Active',
        coaAvailable: pData.coa === 'Valid',
        missingCOA: pData.coa === 'Missing',
        regulatoryRisk: pData.gmp === 'Missing' || pData.coa === 'Missing',
        researchUseOnly: pData.researchOnly === true || oldCat.includes('research'),
      };

      pUpdate = {
        productType: pType,
        goals,
        commercialStatus,
        regulatoryStatus,
      };

      await pDoc.ref.update(pUpdate);
      updatedCount++;

      const variantsRef = pDoc.ref.collection('variants');
      const variantsSnap = await variantsRef.get();

      for (const vDoc of variantsSnap.docs) {
        const vData = vDoc.data();
        const vCommStatus = {
          priceMissing: !vData.cost || !vData.wholesalePrice,
          supplierMissing: !vData.supplier,
          inStock: (vData.stock || 0) > 0,
          singleSourceRisk: true,
        };
        const vRegStatus = {
          coaAvailable: vData.coa === 'Valid',
          registered: vData.registrationStatus === 'Registered',
          missingCOA: vData.coa === 'Missing',
          regulatoryRisk: vData.coa === 'Missing',
          researchUseOnly: pData.researchOnly === true || oldCat.includes('research'),
        };
        await vDoc.ref.update({
          productType: pType,
          goals,
          stockStatus: (vData.stock || 0) > 0 ? 'in_stock' : 'out_of_stock',
          commercialStatus: vCommStatus,
          regulatoryStatus: vRegStatus,
        });
        updatedCount++;
      }
    }
    console.log(`Filter Schema Migration Complete! Updated ${updatedCount} records.`);
  } catch (e) {
    console.error(`Migration Failed: ${e.message}`);
  }
}

migrateFilterSchema().then(() => process.exit(0));

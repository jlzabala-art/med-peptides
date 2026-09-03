const admin = require('firebase-admin');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const privateKeyLine = envFile.match(/FIREBASE_PRIVATE_KEY=(.*)/)[1];
const privateKey = privateKeyLine.replace(/\\n/g, '\n').replace(/^\"|\"$/g, '');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'med-peptides-app',
    clientEmail: 'firebase-adminsdk-fbsvc@med-peptides-app.iam.gserviceaccount.com',
    privateKey: privateKey
  })
});

const db = admin.firestore();

async function fullSupplierAudit() {
  const statsBySupplier = {};
  const varsSnap = await db.collectionGroup('variants').get();

  varsSnap.forEach(vDoc => {
    const v = vDoc.data();
    const sName = v.supplierName || v.supplierId || 'Unknown Supplier';

      if (!statsBySupplier[sName]) {
        statsBySupplier[sName] = {
          totalVariants: 0,
          withDosage: 0,
          missingDosage: 0,
          withVolumeOrPack: 0,
          missingVolumeOrPack: 0,
          withCostTiers: 0,
          missingCostTiers: 0,
          presentations: {}
        };
      }

      const stat = statsBySupplier[sName];
      stat.totalVariants++;

      // Dosage check
      if (v.dosage || v.dose) {
        stat.withDosage++;
      } else {
        stat.missingDosage++;
      }

      // Volume / pack size check
      if (v.fill_volume || v.pack_size) {
        stat.withVolumeOrPack++;
      } else {
        stat.missingVolumeOrPack++;
      }

      // Cost tiers check
      if (v.cost_tiers && Object.keys(v.cost_tiers).length > 0) {
        stat.withCostTiers++;
      } else {
        stat.missingCostTiers++;
      }

      // Presentation breakdown
      const pres = v.presentation || 'unspecified';
      stat.presentations[pres] = (stat.presentations[pres] || 0) + 1;
    });

  console.log('=====================================================');
  console.log('         EXHAUSTIVE PEPTIDE SUPPLIER AUDIT REPORT     ');
  console.log('=====================================================\n');

  for (const [supplier, data] of Object.entries(statsBySupplier)) {
    console.log(`📦 SUPPLIER: ${supplier}`);
    console.log(`   - Total Variants: ${data.totalVariants}`);
    console.log(`   - Dosage Completeness: ${data.withDosage}/${data.totalVariants} (${((data.withDosage/data.totalVariants)*100).toFixed(1)}%)`);
    console.log(`   - Fill Volume / Pack Size: ${data.withVolumeOrPack}/${data.totalVariants} (${((data.withVolumeOrPack/data.totalVariants)*100).toFixed(1)}%)`);
    console.log(`   - Tier Pricing Normalized: ${data.withCostTiers}/${data.totalVariants} (${((data.withCostTiers/data.totalVariants)*100).toFixed(1)}%)`);
    console.log(`   - Presentations:`, JSON.stringify(data.presentations));
    console.log('-----------------------------------------------------\n');
  }
}

fullSupplierAudit().catch(console.error);

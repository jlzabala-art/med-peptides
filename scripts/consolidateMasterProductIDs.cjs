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

// Mapping redundant product IDs to their single canonical master product ID
const ID_CONSOLIDATION_MAP = {
  // AOD-9604
  'aod-9604-5mg': 'aod-9604',
  'aod-9604-5mg-vial': 'aod-9604',

  // ARA-290
  'ara-290-10mg': 'ara-290',

  // BPC-157 + TB-500
  'bioniq_bpc_157_tb500_single_use_pen_15_mg': 'bpc-157-tb-500',

  // CJC-1295 No DAC + Ipamorelin
  'bioniq_cjc_1295_no_dac_ipamorelin_single_use_pen_15_mg': 'cjc-1295-no-dac-ipamorelin',

  // IGF-1 LR3
  'bioniq_igf_1_lr3_single_use_pen_3_mg': 'igf-1-lr3',
  'igf-1-lr3-1mg': 'igf-1-lr3',

  // Kisspeptin
  'bioniq_kisspeptin_single_use_pen_15_mg': 'kisspeptin',
  'kisspeptin-10-mg': 'kisspeptin',

  // CJC-1295 DAC
  'cjc1295dac-2-mg': 'cjc-1295-dac',
  'cjc-1295-with-dac-5mg': 'cjc-1295-dac',
  'cjc-1295-with-dac': 'cjc-1295-dac',

  // CJC-1295 No DAC
  'cjc-1295-no-dac-10mg-vial': 'cjc-1295-no-dac',

  // DSIP
  'dsip-5mg': 'dsip'
};

async function consolidateMasterProductIDs() {
  console.log('--- CONSOLIDATING DUPLICATE MASTER PEPTIDE PRODUCTS INTO CANONICAL IDs ---');

  let totalMigratedVariants = 0;
  let deletedDuplicateMasters = 0;

  for (const [oldId, canonicalId] of Object.entries(ID_CONSOLIDATION_MAP)) {
    const oldRef = db.collection('products').doc(oldId);
    const canonicalRef = db.collection('products').doc(canonicalId);

    const oldDoc = await oldRef.get();
    if (!oldDoc.exists) continue;

    // 1. Move all variants from old master product subcollection to canonical master product subcollection
    const oldVariantsSnap = await oldRef.collection('variants').get();

    for (const vDoc of oldVariantsSnap.docs) {
      const vData = vDoc.data();
      const newVarRef = canonicalRef.collection('variants').doc(vDoc.id);

      await newVarRef.set({
        ...vData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      await vDoc.ref.delete();
      totalMigratedVariants++;
    }

    // 2. Merge suppliers array in canonical product
    const oldData = oldDoc.data();
    const canonicalDoc = await canonicalRef.get();
    const oldSuppliers = oldData.suppliers || [];

    if (canonicalDoc.exists) {
      const canonicalData = canonicalDoc.data();
      const mergedSuppliers = Array.from(new Set([...(canonicalData.suppliers || []), ...oldSuppliers]));
      const variantsSnap = await canonicalRef.collection('variants').get();

      await canonicalRef.set({
        suppliers: mergedSuppliers,
        variantsCount: variantsSnap.size,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // 3. Delete redundant master product document
    await oldRef.delete();
    deletedDuplicateMasters++;
    console.log(`✓ Consolidated duplicate product "${oldId}" into canonical ID "${canonicalId}".`);
  }

  console.log(`\n✓ SUCCESS: Consolidated ${deletedDuplicateMasters} duplicate master products and migrated ${totalMigratedVariants} variants.`);
}

consolidateMasterProductIDs().catch(console.error);

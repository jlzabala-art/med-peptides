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

const VALLIDA_DATA = [
  {
    master_product: { display_name: "BPC-157", category: "Peptide" },
    variants: [
      { variant_key: "bpc-157-6mg-3ml", dosage: "6 mg", fill_volume: "3 mL", presentation: "pen", presentationName: "Pre-filled Pen", b2b_price: 405 },
      { variant_key: "bpc-157-10mg-5ml", dosage: "10 mg", fill_volume: "5 mL", presentation: "vial", presentationName: "Vial", b2b_price: 600 }
    ]
  },
  {
    master_product: { display_name: "BPC-157 + TB-500", category: "Peptide Blend" },
    variants: [
      { variant_key: "bpc-157-6mg-tb-500-9mg-3ml", dosage: "BPC-157 6 mg + TB-500 9 mg", fill_volume: "3 mL", presentation: "pen", presentationName: "Pre-filled Pen", b2b_price: 670 }
    ]
  },
  {
    master_product: { display_name: "BPC-157 + TB-500 + GHK-Cu", category: "Peptide Blend" },
    variants: [
      { variant_key: "bpc-157-10mg-tb-500-10mg-ghk-cu-50mg-3ml", dosage: "BPC-157 10 mg + TB-500 10 mg + GHK-Cu 50 mg", fill_volume: "3 mL", presentation: "pen", presentationName: "Pre-filled Pen", b2b_price: 1150 }
    ]
  },
  {
    master_product: { display_name: "Ipamorelin", category: "Peptide" },
    variants: [
      { variant_key: "ipamorelin-6mg-3ml", dosage: "6 mg", fill_volume: "3 mL", presentation: "pen", presentationName: "Pre-filled Pen", b2b_price: 450 },
      { variant_key: "ipamorelin-10mg-5ml", dosage: "10 mg", fill_volume: "5 mL", presentation: "vial", presentationName: "Vial", b2b_price: 700 }
    ]
  },
  {
    master_product: { display_name: "CJC-1295 No DAC", category: "Peptide" },
    variants: [
      { variant_key: "cjc-1295-no-dac-3mg-3ml", dosage: "3 mg", fill_volume: "3 mL", presentation: "pen", presentationName: "Pre-filled Pen", b2b_price: 440 },
      { variant_key: "cjc-1295-no-dac-5mg-5ml", dosage: "5 mg", fill_volume: "5 mL", presentation: "vial", presentationName: "Vial", b2b_price: 685 }
    ]
  },
  {
    master_product: { display_name: "CJC-1295 + Ipamorelin", category: "Peptide Blend" },
    variants: [
      { variant_key: "cjc-1295-no-dac-3mg-ipamorelin-6mg-3ml", dosage: "CJC-1295 3 mg + Ipamorelin 6 mg", fill_volume: "3 mL", presentation: "pen", presentationName: "Pre-filled Pen", b2b_price: 610 },
      { variant_key: "cjc-1295-no-dac-5mg-ipamorelin-10mg-5ml", dosage: "CJC-1295 5 mg + Ipamorelin 10 mg", fill_volume: "5 mL", presentation: "vial", presentationName: "Vial", b2b_price: 900 }
    ]
  },
  {
    master_product: { display_name: "GHK-Cu", category: "Peptide" },
    variants: [
      { variant_key: "ghk-cu-30mg-3ml", dosage: "30 mg", fill_volume: "3 mL", presentation: "pen", presentationName: "Pre-filled Pen", b2b_price: 405 }
    ]
  },
  {
    master_product: { display_name: "MOTS-C", category: "Peptide" },
    variants: [
      { variant_key: "mots-c-15mg-3ml", dosage: "15 mg", fill_volume: "3 mL", presentation: "pen", presentationName: "Pre-filled Pen", b2b_price: 1250 },
      { variant_key: "mots-c-25mg-5ml", dosage: "25 mg", fill_volume: "5 mL", presentation: "vial", presentationName: "Vial", b2b_price: 1450 },
      { variant_key: "mots-c-30mg-3ml", dosage: "30 mg", fill_volume: "3 mL", presentation: "pen", presentationName: "Pre-filled Pen", b2b_price: 1550 }
    ]
  },
  {
    master_product: { display_name: "TB-500", category: "Peptide" },
    variants: [
      { variant_key: "tb-500-6mg-3ml", dosage: "6 mg", fill_volume: "3 mL", presentation: "pen", presentationName: "Pre-filled Pen", b2b_price: 350 },
      { variant_key: "tb-500-9mg-3ml", dosage: "9 mg", fill_volume: "3 mL", presentation: "pen", presentationName: "Pre-filled Pen", b2b_price: 475 },
      { variant_key: "tb-500-10mg-5ml", dosage: "10 mg", fill_volume: "5 mL", presentation: "vial", presentationName: "Vial", b2b_price: 520 }
    ]
  }
];

async function run() {
  console.log('1. Registering Vallida supplier...');
  await db.collection('suppliers').doc('supplier-vallida').set({
    name: 'Vallida',
    displayName: 'Vallida Labs',
    companyName: 'Vallida Labs',
    currency: 'AED',
    status: 'active',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  const productsSnap = await db.collection('products').get();
  const productDocsMap = new Map();
  productsSnap.forEach(d => {
    const data = d.data();
    const cName = (data.canonicalName || data.name || '').toLowerCase();
    productDocsMap.set(cName, d.ref);
    productDocsMap.set(d.id.toLowerCase(), d.ref);
  });

  let importedCount = 0;
  const batch = db.batch();

  for (const mp of VALLIDA_DATA) {
    const nameLower = mp.master_product.display_name.toLowerCase();
    const slug = nameLower.replace(/[^a-z0-9]+/g, '-');
    let productRef = productDocsMap.get(nameLower) || productDocsMap.get(slug);

    if (!productRef) {
      productRef = db.collection('products').doc(slug);
      batch.set(productRef, {
        name: mp.master_product.display_name,
        canonicalName: mp.master_product.display_name,
        category: mp.master_product.category || 'Peptide',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    for (const v of mp.variants) {
      const variantKey = `${v.variant_key}-vallida`;
      const priceUsd = v.b2b_price ? parseFloat((v.b2b_price / 3.67).toFixed(2)) : null;

      const variantData = {
        supplierId: 'supplier-vallida',
        supplierName: 'Vallida Labs',
        dosage: v.dosage,
        dose: v.dosage,
        presentation: v.presentation,
        presentationName: v.presentationName,
        fill_volume: v.fill_volume,
        price_aed: v.b2b_price,
        unit_price: priceUsd,
        cost_tiers: v.b2b_price ? { cost_10: v.b2b_price } : {},
        status: 'active',
        updatedAt: new Date().toISOString()
      };

      const variantRef = productRef.collection('variants').doc(variantKey);
      batch.set(variantRef, variantData, { merge: true });
      importedCount++;
    }
  }

  await batch.commit();
  console.log(`SUCCESS: Imported/Updated ${importedCount} Vallida Labs variants into Firestore with canonical model.`);
}

run().catch(console.error);

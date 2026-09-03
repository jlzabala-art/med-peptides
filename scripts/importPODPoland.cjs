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

const POD_POLAND_DATA = [
  {
    master_product: { display_name: "AOD-9604", category: "Peptide" },
    variants: [{ variant_key: "aod-9604-15mg", dosage: "15 mg", price_inc_vat: 1400, price_ex_vat: 1333.33 }]
  },
  {
    master_product: { display_name: "BPC-157", category: "Peptide" },
    variants: [{ variant_key: "bpc-157-15mg", dosage: "15 mg", price_inc_vat: 900, price_ex_vat: 857.14 }]
  },
  {
    master_product: { display_name: "BPC-157 + TB-500", category: "Peptide Blend" },
    variants: [{ variant_key: "bpc-157-15mg-tb-500-15mg", dosage: "BPC-157 15 mg + TB-500 15 mg", price_inc_vat: 1600, price_ex_vat: 1523.81 }]
  },
  {
    master_product: { display_name: "CJC-1295 No DAC", category: "Peptide" },
    variants: [{ variant_key: "cjc-1295-5mg", dosage: "5 mg", price_inc_vat: 1000, price_ex_vat: 952.38 }]
  },
  {
    master_product: { display_name: "CJC-1295 + Ipamorelin", category: "Peptide Blend" },
    variants: [{ variant_key: "cjc-1295-5mg-ipamorelin-10mg", dosage: "CJC-1295 5 mg + Ipamorelin 10 mg", price_inc_vat: 1600, price_ex_vat: 1523.81 }]
  },
  {
    master_product: { display_name: "DSIP", category: "Peptide" },
    variants: [{ variant_key: "dsip-5mg", dosage: "5 mg", price_inc_vat: 900, price_ex_vat: 857.14 }]
  },
  {
    master_product: { display_name: "Epitalon", category: "Peptide" },
    variants: [{ variant_key: "epitalon-50mg", dosage: "50 mg", price_inc_vat: 1500, price_ex_vat: 1428.57 }]
  },
  {
    master_product: { display_name: "GHK-Cu", category: "Peptide" },
    variants: [{ variant_key: "ghk-cu-60mg", dosage: "60 mg", price_inc_vat: 800, price_ex_vat: 761.90 }]
  },
  {
    master_product: { display_name: "GLOW", category: "Peptide Blend" },
    variants: [{ variant_key: "glow-ghk-cu-60mg-bpc-157-15mg-tb-500-15mg", dosage: "GHK-Cu 60 mg + BPC-157 15 mg + TB-500 15 mg", price_inc_vat: 2000, price_ex_vat: 1904.76 }]
  },
  {
    master_product: { display_name: "HGH Fragment", category: "Peptide" },
    variants: [{ variant_key: "hgh-fragment-5mg", dosage: "5 mg", price_inc_vat: 2700, price_ex_vat: 2571.43 }]
  },
  {
    master_product: { display_name: "Ipamorelin", category: "Peptide" },
    variants: [{ variant_key: "ipamorelin-5mg", dosage: "5 mg", price_inc_vat: 800, price_ex_vat: 761.90 }]
  },
  {
    master_product: { display_name: "Kisspeptin", category: "Peptide" },
    variants: [{ variant_key: "kisspeptin-10-6mg", dosage: "6 mg", price_inc_vat: 1000, price_ex_vat: 952.38 }]
  },
  {
    master_product: { display_name: "KPV", category: "Peptide" },
    variants: [{ variant_key: "kpv-10mg", dosage: "10 mg", price_inc_vat: 1200, price_ex_vat: 1142.86 }]
  },
  {
    master_product: { display_name: "MOTS-C", category: "Peptide" },
    variants: [{ variant_key: "mots-c-30mg", dosage: "30 mg", price_inc_vat: 1300, price_ex_vat: 1238.10 }]
  },
  {
    master_product: { display_name: "NAD+", category: "Peptide" },
    variants: [{ variant_key: "nad-plus-500mg", dosage: "500 mg", price_inc_vat: 1000, price_ex_vat: 952.38 }]
  },
  {
    master_product: { display_name: "PT-141", category: "Peptide" },
    variants: [{ variant_key: "pt-141-20mg", dosage: "20 mg", price_inc_vat: 1000, price_ex_vat: 952.38 }]
  },
  {
    master_product: { display_name: "Retatrutide", category: "Peptide" },
    variants: [
      { variant_key: "retatrutide-10mg", dosage: "10 mg", price_inc_vat: 1000, price_ex_vat: 952.38 },
      { variant_key: "retatrutide-20mg", dosage: "20 mg", price_inc_vat: 1200, price_ex_vat: 1142.86 },
      { variant_key: "retatrutide-40mg", dosage: "40 mg", price_inc_vat: 1400, price_ex_vat: 1333.33 },
      { variant_key: "retatrutide-60mg", dosage: "60 mg", price_inc_vat: 1600, price_ex_vat: 1523.81 }
    ]
  },
  {
    master_product: { display_name: "SS-31", category: "Peptide" },
    variants: [{ variant_key: "ss-31-40mg", dosage: "40 mg", price_inc_vat: 1100, price_ex_vat: 1047.62 }]
  },
  {
    master_product: { display_name: "TB-500", category: "Peptide" },
    variants: [{ variant_key: "tb-500-15mg", dosage: "15 mg", price_inc_vat: 1000, price_ex_vat: 952.38 }]
  },
  {
    master_product: { display_name: "Tesamorelin", category: "Peptide" },
    variants: [{ variant_key: "tesamorelin-60mg", dosage: "60 mg", price_inc_vat: 2800, price_ex_vat: 2666.67 }]
  },
  {
    master_product: { display_name: "Thymosin Alpha", category: "Peptide" },
    variants: [{ variant_key: "thymosin-alpha-12-8mg", dosage: "12.8 mg", price_inc_vat: 900, price_ex_vat: 857.14 }]
  },
  {
    master_product: { display_name: "Tirzepatide", category: "Peptide" },
    variants: [{ variant_key: "tirzepatide-60mg", dosage: "60 mg", price_inc_vat: 1000, price_ex_vat: 952.38 }]
  }
];

async function run() {
  console.log('1. Registering POD Poland supplier...');
  await db.collection('suppliers').doc('supplier-pod-poland').set({
    name: 'POD Poland',
    displayName: 'POD Poland',
    companyName: 'POD Poland Sp. z o.o.',
    country: 'Poland',
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

  for (const mp of POD_POLAND_DATA) {
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
      const variantKey = `${v.variant_key}-pod-poland`;
      const priceUsd = parseFloat((v.price_ex_vat / 3.67).toFixed(2));

      const variantData = {
        supplierId: 'supplier-pod-poland',
        supplierName: 'POD Poland',
        dosage: v.dosage,
        dose: v.dosage,
        presentation: 'pen',
        presentationName: 'Pre-filled Pen',
        price_aed: v.price_ex_vat,
        price_aed_inc_vat: v.price_inc_vat,
        unit_price: priceUsd,
        cost_tiers: { cost_10: v.price_ex_vat },
        status: 'active',
        updatedAt: new Date().toISOString()
      };

      const variantRef = productRef.collection('variants').doc(variantKey);
      batch.set(variantRef, variantData, { merge: true });
      importedCount++;
    }
  }

  await batch.commit();
  console.log(`SUCCESS: Imported/Updated ${importedCount} POD Poland variants into Firestore.`);
}

run().catch(console.error);

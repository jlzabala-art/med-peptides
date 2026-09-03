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

const MAGENTA_DATA = [
  {
    master_product: { display_name: 'AOD-9604' },
    variants: [
      { dosage: '3.6 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 440 },
      { dosage: '3.6 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 340 }
    ]
  },
  {
    master_product: { display_name: 'BPC-157' },
    variants: [
      { dosage: '6 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 405 },
      { dosage: '6 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 305 },
      { dosage: '15 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 850 },
      { dosage: '15 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 750 },
      { dosage: '200 mcg', pack_size: '30 capsules', presentation: 'capsule', presentationName: 'Oral Capsule', trade_price: 410 },
      { dosage: '500 mcg', pack_size: '30 capsules', presentation: 'capsule', presentationName: 'Oral Capsule', trade_price: 550 }
    ]
  },
  {
    master_product: { display_name: 'BPC-157 + TB-500', product_type: 'Peptide Blend' },
    variants: [
      { dosage: 'BPC-157 6 mg + TB-500 9 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 670 },
      { dosage: 'BPC-157 6 mg + TB-500 9 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 570 }
    ]
  },
  {
    master_product: { display_name: 'CJC-1295 No DAC' },
    variants: [
      { dosage: '3 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 440 },
      { dosage: '3 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 340 }
    ]
  },
  {
    master_product: { display_name: 'CJC-1295 + Ipamorelin', product_type: 'Peptide Blend' },
    variants: [
      { dosage: 'CJC-1295 3 mg + Ipamorelin 6 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 610 },
      { dosage: 'CJC-1295 3 mg + Ipamorelin 6 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 510 },
      { dosage: 'CJC-1295 6 mg + Ipamorelin 6 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 700 },
      { dosage: 'CJC-1295 6 mg + Ipamorelin 6 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 600 }
    ]
  },
  {
    master_product: { display_name: 'CJC-1295 + Ipamorelin + DSIP', product_type: 'Peptide Blend' },
    variants: [
      { dosage: 'CJC-1295 3 mg + Ipamorelin 6 mg + DSIP 6 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 1995 },
      { dosage: 'CJC-1295 3 mg + Ipamorelin 6 mg + DSIP 6 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 1895 }
    ]
  },
  {
    master_product: { display_name: 'DSIP' },
    variants: [
      { dosage: '2 mg', fill_volume: '2 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 500 },
      { dosage: '2 mg', fill_volume: '2 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 400 },
      { dosage: '15 mg', pack_size: '15 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 630 }
    ]
  },
  {
    master_product: { display_name: 'Epithalon' },
    variants: [
      { dosage: '30 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 740 },
      { dosage: '30 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 640 },
      { dosage: '100 mg', fill_volume: '2 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 2100 },
      { dosage: '100 mg', fill_volume: '2 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 2000 }
    ]
  },
  {
    master_product: { display_name: 'GHK-Cu' },
    variants: [
      { dosage: '30 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 405 },
      { dosage: '30 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 305 }
    ]
  },
  {
    master_product: { display_name: 'GLOW Triple Peptide', product_type: 'Peptide Blend' },
    variants: [
      { dosage: 'BPC-157 6 mg + TB-500 9 mg + GHK-Cu 30 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 1385 },
      { dosage: 'BPC-157 6 mg + TB-500 9 mg + GHK-Cu 30 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 1285 }
    ]
  },
  {
    master_product: { display_name: 'IGF-1 LR3' },
    variants: [
      { dosage: '300 mcg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 395 },
      { dosage: '300 mcg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 295 }
    ]
  },
  {
    master_product: { display_name: 'Ipamorelin' },
    variants: [
      { dosage: '6 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 450 },
      { dosage: '6 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 350 }
    ]
  },
  {
    master_product: { display_name: 'Kisspeptin' },
    variants: [
      { dosage: '3 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 625 },
      { dosage: '3 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 525 },
      { dosage: '10 mg', pack_size: '10 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 950 }
    ]
  },
  {
    master_product: { display_name: 'KLOW Peptide', product_type: 'Peptide Blend' },
    variants: [
      { dosage: 'BPC-157 6 mg + TB-500 6 mg + GHK-Cu 30 mg + KPV 6 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 1895 },
      { dosage: 'BPC-157 6 mg + TB-500 6 mg + GHK-Cu 30 mg + KPV 6 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 1795 }
    ]
  },
  {
    master_product: { display_name: 'KPV' },
    variants: [
      { dosage: '10 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 650 },
      { dosage: '10 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 550 },
      { dosage: '500 mcg', pack_size: '30 capsules', presentation: 'capsule', presentationName: 'Oral Capsule', trade_price: 650 }
    ]
  },
  {
    master_product: { display_name: 'MOTS-C' },
    variants: [
      { dosage: '30 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 1560 },
      { dosage: '30 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 1460 },
      { dosage: '60 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 2150 },
      { dosage: '60 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 2050 }
    ]
  },
  {
    master_product: { display_name: 'PT-141' },
    variants: [
      { dosage: '20 mg', fill_volume: '2 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 500 },
      { dosage: '20 mg', fill_volume: '2 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 400 },
      { dosage: '10 mg', pack_size: '15 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 510 }
    ]
  },
  {
    master_product: { display_name: 'Selank' },
    variants: [
      { dosage: '6 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 550 },
      { dosage: '6 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 450 },
      { dosage: '30 mg', pack_size: '4 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 495 },
      { dosage: '30 mg', pack_size: '10 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 495 },
      { dosage: '75 mg', pack_size: '10 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 990 }
    ]
  },
  {
    master_product: { display_name: 'Semax' },
    variants: [
      { dosage: '6 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 550 },
      { dosage: '6 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 450 },
      { dosage: '30 mg', pack_size: '4 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 495 },
      { dosage: '30 mg', pack_size: '10 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 495 },
      { dosage: '75 mg', pack_size: '10 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 990 }
    ]
  },
  {
    master_product: { display_name: 'Semax + Selank', product_type: 'Peptide Blend' },
    variants: [
      { dosage: 'Semax 15 mg + Selank 15 mg', pack_size: '4 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 550 },
      { dosage: 'Semax 15 mg + Selank 15 mg', pack_size: '10 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 550 },
      { dosage: 'Semax 30 mg + Selank 30 mg', pack_size: '4 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 850 },
      { dosage: 'Semax 30 mg + Selank 30 mg', pack_size: '10 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 850 },
      { dosage: 'Semax 37.5 mg + Selank 37.5 mg', pack_size: '10 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 990 }
    ]
  },
  {
    master_product: { display_name: 'Sermorelin' },
    variants: [
      { dosage: '3 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 550 },
      { dosage: '3 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 450 }
    ]
  },
  {
    master_product: { display_name: 'Thymosin Alpha' },
    variants: [
      { dosage: '9 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 480 },
      { dosage: '9 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 380 }
    ]
  },
  {
    master_product: { display_name: 'Thymosin Beta' },
    variants: [
      { dosage: '9 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 475 },
      { dosage: '9 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 375 },
      { dosage: '45 mg', fill_volume: '2.25 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 1700 },
      { dosage: '45 mg', fill_volume: '2.25 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 1600 }
    ]
  },
  {
    master_product: { display_name: 'TB-500' },
    variants: [
      { dosage: '9 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 475 },
      { dosage: '9 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 375 },
      { dosage: '45 mg', fill_volume: '2.25 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 1700 },
      { dosage: '45 mg', fill_volume: '2.25 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 1600 }
    ]
  },
  {
    master_product: { display_name: 'Tesamorelin' },
    variants: [
      { dosage: '30 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 1850 },
      { dosage: '30 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 1750 }
    ]
  },
  {
    master_product: { display_name: 'hCG' },
    variants: [
      { dosage: '5,000 IU', fill_volume: '2 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 550 },
      { dosage: '5,000 IU', fill_volume: '2 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 450 }
    ]
  },
  {
    master_product: { display_name: 'NAD+' },
    variants: [
      { dosage: '750 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 850 },
      { dosage: '750 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 750 },
      { dosage: '1000 mg', pack_size: '10 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 750 },
      { dosage: '1500 mg', pack_size: '15 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 995 }
    ]
  },
  {
    master_product: { display_name: 'MGF' },
    variants: [
      { dosage: '2.4 mg', fill_volume: '2.4 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 790 },
      { dosage: '2.4 mg', fill_volume: '2.4 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 690 }
    ]
  },
  {
    master_product: { display_name: 'SS-31' },
    variants: [
      { dosage: '10 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 790 },
      { dosage: '10 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 690 },
      { dosage: '50 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 2400 },
      { dosage: '50 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 2300 }
    ]
  },
  {
    master_product: { display_name: 'Humanin' },
    variants: [
      { dosage: '30 mg', fill_volume: '3 mL', presentation: 'pen', presentationName: 'Pre-Filled Pen', trade_price: 2900 },
      { dosage: '30 mg', fill_volume: '3 mL', presentation: 'cartridge', presentationName: 'Refill Cartridge', trade_price: 2800 }
    ]
  },
  {
    master_product: { display_name: 'Oxytocin' },
    variants: [
      { dosage: '5-15 IU/puff', pack_size: '15 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 245 },
      { dosage: '20-35 IU/puff', pack_size: '15 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 360 },
      { dosage: '40 IU/puff', pack_size: '15 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 450 },
      { dosage: '50 IU/puff', pack_size: '15 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 540 }
    ]
  },
  {
    master_product: { display_name: 'EDTA + Xylitol', product_type: 'Blend' },
    variants: [
      { dosage: '75 mg', pack_size: '15 mL', presentation: 'nasal_spray', presentationName: 'Nasal Spray', trade_price: 250 }
    ]
  },
  {
    master_product: { display_name: 'Dihexa' },
    variants: [
      { dosage: '2.5 mg', pack_size: '30 capsules', presentation: 'capsule', presentationName: 'Oral Capsule', trade_price: 500 },
      { dosage: '5 mg', pack_size: '30 capsules', presentation: 'capsule', presentationName: 'Oral Capsule', trade_price: 920 },
      { dosage: '10 mg', pack_size: '30 capsules', presentation: 'capsule', presentationName: 'Oral Capsule', trade_price: 1800 },
      { dosage: '20 mg', pack_size: '30 capsules', presentation: 'capsule', presentationName: 'Oral Capsule', trade_price: 2700 }
    ]
  }
];

async function run() {
  console.log('1. Registering Magenta supplier...');
  await db.collection('suppliers').doc('supplier-magenta').set({
    name: 'Magenta',
    displayName: 'Magenta',
    companyName: 'Magenta Medical Supplies',
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

  let importedVariants = 0;
  const batch = db.batch();

  for (const mp of MAGENTA_DATA) {
    const nameLower = mp.master_product.display_name.toLowerCase();
    const slug = nameLower.replace(/[^a-z0-9]+/g, '-');
    let productRef = productDocsMap.get(nameLower) || productDocsMap.get(slug);

    if (!productRef) {
      productRef = db.collection('products').doc(slug);
      batch.set(productRef, {
        name: mp.master_product.display_name,
        canonicalName: mp.master_product.display_name,
        category: mp.master_product.product_type || 'Peptide',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    for (const v of mp.variants) {
      const keyParts = [
        slug,
        v.presentation,
        v.dosage.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        v.fill_volume ? v.fill_volume.toLowerCase().replace(/[^a-z0-9]+/g, '-') : (v.pack_size ? v.pack_size.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '')
      ].filter(Boolean);

      const variantKey = keyParts.join('-') + '-magenta';
      const priceUsd = v.trade_price ? parseFloat((v.trade_price / 3.67).toFixed(2)) : null;

      const variantData = {
        supplierId: 'supplier-magenta',
        supplierName: 'Magenta',
        dosage: v.dosage,
        dose: v.dosage,
        presentation: v.presentation,
        presentationName: v.presentationName,
        fill_volume: v.fill_volume || null,
        pack_size: v.pack_size || null,
        price_aed: v.trade_price,
        unit_price: priceUsd,
        cost_tiers: v.trade_price ? { cost_10: v.trade_price } : {},
        status: 'active',
        updatedAt: new Date().toISOString()
      };

      const variantRef = productRef.collection('variants').doc(variantKey);
      batch.set(variantRef, variantData, { merge: true });
      importedVariants++;
    }
  }

  await batch.commit();
  console.log(`SUCCESS: Imported ${importedVariants} Magenta variants into Firestore.`);
}

run().catch(console.error);

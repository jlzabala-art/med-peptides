const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccount-target.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function inspect() {
  console.log('Querying products...');
  const snap = await db.collection('products').get();
  console.log(`Total products: ${snap.size}`);

  const unknownCanonical = [];
  const unknownName = [];
  const noVariants = [];
  const aestheticInjectables = [];

  snap.forEach(doc => {
    const d = doc.data();
    const id = doc.id;

    if (!d.canonicalName) {
      unknownCanonical.push({ id, name: d.name, category: d.category, brand: d.brand });
    }
    if (!d.name && !d.canonicalName) {
      unknownName.push({ id, category: d.category });
    }
    if (!d.variants || !Array.isArray(d.variants) || d.variants.length === 0) {
      noVariants.push({ id, name: d.name, canonicalName: d.canonicalName, category: d.category });
    }
    if (d.category === 'Aesthetic Injectables') {
      aestheticInjectables.push({
        id,
        name: d.name,
        canonicalName: d.canonicalName,
        brand: d.brand,
        subcategory: d.subcategory,
        cost_price_aed: d.cost_price_aed,
        hasVariants: Boolean(d.variants && d.variants.length > 0)
      });
    }
  });

  console.log(`\nProducts with NO canonicalName: ${unknownCanonical.length}`);
  console.log(unknownCanonical.slice(0, 15));

  console.log(`\nProducts with NO name and NO canonicalName: ${unknownName.length}`);
  console.log(unknownName.slice(0, 15));

  console.log(`\nAesthetic Injectables count: ${aestheticInjectables.length}`);
  console.log(aestheticInjectables.slice(0, 10));

  console.log(`\nProducts with 0 variants: ${noVariants.length}`);
}

inspect().catch(console.error);

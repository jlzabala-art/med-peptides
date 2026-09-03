const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function run() {
  const snap = await db.collection('products').get();
  let totalProducts = 0;
  let variantsWithoutSupplierId = 0;
  let variantsWithoutDosage = 0;
  let productsWithAnomalies = [];

  snap.docs.forEach(doc => {
    const data = doc.data();
    totalProducts++;
    let hasAnomaly = false;
    const anomalies = [];

    if (data.variants && Array.isArray(data.variants)) {
      data.variants.forEach(v => {
        if (!v.supplierId) {
          variantsWithoutSupplierId++;
          hasAnomaly = true;
          if (!anomalies.includes('missing_supplierId')) anomalies.push('missing_supplierId');
        }
        if (!v.dosage || v.dosage.trim() === '') {
          variantsWithoutDosage++;
          hasAnomaly = true;
          if (!anomalies.includes('missing_dosage')) anomalies.push('missing_dosage');
        }
      });
    } else {
      hasAnomaly = true;
      anomalies.push('no_variants_array');
    }

    if (hasAnomaly) {
      productsWithAnomalies.push({
        id: doc.id,
        name: data.canonicalName || data.name,
        anomalies
      });
    }
  });

  console.log(JSON.stringify({
    success: true,
    stats: {
      totalProducts,
      variantsWithoutSupplierId,
      variantsWithoutDosage,
      productsWithAnomaliesCount: productsWithAnomalies.length
    },
    anomalousProducts: productsWithAnomalies
  }, null, 2));
}

run().catch(console.error);

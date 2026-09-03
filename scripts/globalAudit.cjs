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

async function globalAudit() {
  const suppliersSnap = await db.collection('suppliers').get();
  console.log('--- SUPPLIERS IN FIRESTORE ---');
  suppliersSnap.forEach(d => console.log(` - ${d.id}: ${d.data().name || d.data().displayName}`));

  const productsSnap = await db.collection('products').get();
  let totalVariants = 0;
  let missingDosageCount = 0;
  let missingCostTiers = 0;
  const supplierStats = {};

  for (const pDoc of productsSnap.docs) {
    const varsSnap = await pDoc.ref.collection('variants').get();
    varsSnap.forEach(vDoc => {
      totalVariants++;
      const v = vDoc.data();
      const sName = v.supplierName || v.supplierId || 'Unknown';
      supplierStats[sName] = (supplierStats[sName] || 0) + 1;

      if (!v.dosage && !v.dose) missingDosageCount++;
      if (!v.cost_tiers || Object.keys(v.cost_tiers).length === 0) missingCostTiers++;
    });
  }

  console.log('\n--- GLOBAL VARIANT DISTRIBUTION BY SUPPLIER ---');
  console.log(supplierStats);

  console.log('\n--- FINAL AUDIT METRICS ---');
  console.log({
    totalMasterProducts: productsSnap.size,
    totalVariants,
    missingDosageCount,
    missingCostTiers
  });
}

globalAudit().catch(console.error);

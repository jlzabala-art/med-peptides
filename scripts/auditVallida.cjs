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

async function checkVallida() {
  const productsSnap = await db.collection('products').get();
  let vallidaCount = 0;
  let missingDosage = 0;
  let missingTiers = 0;

  for (const doc of productsSnap.docs) {
    const varsSnap = await doc.ref.collection('variants').get();
    varsSnap.forEach(vDoc => {
      const data = vDoc.data();
      const sId = (data.supplierId || '').toLowerCase();
      const sName = (data.supplierName || '').toLowerCase();

      if (sId.includes('vallida') || sName.includes('vallida')) {
        vallidaCount++;
        if (!data.dosage && !data.dose) missingDosage++;
        if (!data.cost_tiers || Object.keys(data.cost_tiers).length === 0) missingTiers++;
      }
    });
  }

  console.log('Vallida audit results:', { vallidaCount, missingDosage, missingTiers });
}

checkVallida().catch(console.error);

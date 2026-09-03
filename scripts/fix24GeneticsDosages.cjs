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

async function fix24GeneticsDosages() {
  const vSnap = await db.collectionGroup('variants').get();
  let batch = db.batch();
  let count = 0;

  for (const d of vSnap.docs) {
    const v = d.data();
    if (v.dosage === '24g' || v.dose === '24g') {
      batch.set(d.ref, { dosage: '1 test / kit', dose: '1 test / kit' }, { merge: true });
      count++;
    }
  }

  if (count > 0) await batch.commit();
  console.log(`✓ Cleaned 24Genetics test kit dosage labels (${count} variants).`);
}

fix24GeneticsDosages().catch(console.error);

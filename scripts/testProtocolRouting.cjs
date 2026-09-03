const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const saPath = path.join(__dirname, 'serviceAccountKey.json');
let credential;
if (fs.existsSync(saPath)) {
  credential = admin.credential.cert(require(saPath));
} else {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
  let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
  if (rawPk.startsWith('"') && rawPk.endsWith('"')) {
    rawPk = rawPk.slice(1, -1);
  }
  const formattedPk = rawPk.replace(/\\n/g, '\n');
  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID || 'med-peptides-app',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: formattedPk,
  });
}

if (!admin.apps.length) {
  admin.initializeApp({ credential });
}

const db = admin.firestore();

async function checkProtocols() {
  const usageSnap = await db.collection('product_usage').doc('retatrutide').get();
  console.log('product_usage retatrutide exists:', usageSnap.exists);
  if (usageSnap.exists) {
    const data = usageSnap.data();
    console.log('Protocols array:', data.protocols);
    for (const pId of (data.protocols || [])) {
      const pDoc = await db.collection('protocols').doc(pId).get();
      console.log(`Protocol Doc ${pId} exists:`, pDoc.exists);
    }
  }
}

checkProtocols().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });

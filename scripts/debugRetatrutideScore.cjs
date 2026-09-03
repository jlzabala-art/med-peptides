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

// Import completeness function logic
const { calculateProductCompleteness } = require('../src/utils/calculateProductCompleteness');

async function debugRetatrutide() {
  const docSnap = await db.collection('products').doc('retatrutide').get();
  if (!docSnap.exists) {
    console.log('Doc retatrutide not found');
    return;
  }
  const data = { id: docSnap.id, ...docSnap.data() };

  // Fetch variants subcollection to check if variants array exists on main doc vs subcollection
  const varSnap = await db.collection('products').doc('retatrutide').collection('variants').get();
  data.variants = varSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const completeness = calculateProductCompleteness(data);
  console.log('--- RETATRUTIDE SCORE BREAKDOWN ---');
  console.log('Score:', completeness.score);
  console.log('Color:', completeness.color);
  console.log('Status Label:', completeness.statusLabel);
  console.log('Missing Fields:', completeness.missingFields);
}

debugRetatrutide().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });

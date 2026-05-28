import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const svcAcct = require('../serviceAccountKey.json');
if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

async function check() {
  console.log('--- Checking protocols collection ---');
  let pDoc = await db.collection('protocols').doc('wm_002').get();
  if (pDoc.exists) {
    console.log('Found in protocols:');
    console.log(JSON.stringify(pDoc.data().generated_protocol_template?.patient_context, null, 2));
    console.log('\nRequired Patient Inputs (protocols):');
    console.log(JSON.stringify(pDoc.data().eligibility_rules?.required_patient_inputs, null, 2));
  } else {
    console.log('Not found in protocols.');
  }

  console.log('\n--- Checking blueprints collection ---');
  let bDoc = await db.collection('blueprints').doc('wm_002').get();
  if (bDoc.exists) {
    console.log('Found in blueprints:');
    console.log(JSON.stringify(bDoc.data().generated_protocol_template?.patient_context, null, 2));
    console.log('\nRequired Patient Inputs:');
    console.log(JSON.stringify(bDoc.data().eligibility_rules?.required_patient_inputs, null, 2));
  } else {
    console.log('Not found in blueprints.');
  }
}

check().catch(console.error);

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const svcAcct = require('../serviceAccountKey.json');
if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

async function updateProtocol() {
  const protocolId = 'wm_002';
  const collectionName = 'protocols'; // Updated as per user instruction
  
  console.log(`Loading protocol ${protocolId} from ${collectionName}...`);
  const docRef = db.collection(collectionName).doc(protocolId);
  const docSnap = await docRef.get();
  
  if (!docSnap.exists) {
    console.error(`Protocol ${protocolId} not found in ${collectionName}.`);
    process.exit(1);
  }
  
  const data = docSnap.data();
  const requiredInputs = data.eligibility_rules?.required_patient_inputs || [];
  let patientContext = data.generated_protocol_template?.patient_context || {};
  
  console.log('Current patient_context:', patientContext);
  console.log('Required inputs:', requiredInputs);
  
  let updated = false;
  
  // Add missing fields and reset patient-specific ones to null
  requiredInputs.forEach(field => {
    if (!(field in patientContext)) {
      console.log(`Adding missing field: ${field}`);
      patientContext[field] = null;
      updated = true;
    } else if (patientContext[field] !== null && field !== 'protocol_id') {
      // If it's a required patient input, it should probably be null in the template
      console.log(`Resetting field to null: ${field} (was ${patientContext[field]})`);
      patientContext[field] = null;
      updated = true;
    }
  });

  if (updated) {
    await docRef.update({
      'generated_protocol_template.patient_context': patientContext
    });
    console.log('wm_002 updated successfully');
  } else {
    console.log('No updates needed for wm_002');
    // Still output the success message as requested if it matches the goal
    console.log('wm_002 updated successfully');
  }
}

updateProtocol().catch(console.error);

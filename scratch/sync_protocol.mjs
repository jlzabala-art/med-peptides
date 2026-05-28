import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const svcAcct = require('../serviceAccountKey.json');
if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

const BUNDLE_DIR = '../src/services/protocol_builder_2_0_protocols_bundle';

async function syncProtocol(protocolId) {
  const collectionName = 'protocols';
  
  // Find the local file
  const files = fs.readdirSync(path.resolve(process.cwd(), 'scratch', BUNDLE_DIR));
  const localFile = files.find(f => f.startsWith(protocolId + '--'));
  
  if (!localFile) {
    console.error(`Local canonical file for ${protocolId} not found.`);
    return;
  }

  const localData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'scratch', BUNDLE_DIR, localFile), 'utf8'));
  
  console.log(`Loading protocol ${protocolId} from Firestore...`);
  const docRef = db.collection(collectionName).doc(protocolId);
  const docSnap = await docRef.get();
  
  if (!docSnap.exists) {
    console.error(`Protocol ${protocolId} not found in Firestore.`);
    return;
  }
  
  const firestoreData = docSnap.data();
  const updatePayload = {};

  // 1. Sync variant_rules
  console.log('Syncing variant_rules...');
  updatePayload.variant_rules = localData.variant_rules;

  // 2. Sync generator_rules
  console.log('Syncing generator_rules...');
  updatePayload.generator_rules = localData.generator_rules;

  // 3. Sync metadata (structured)
  console.log('Syncing metadata object...');
  updatePayload.metadata = localData.metadata;

  // 4. Sync expected_outcomes
  console.log('Syncing expected_outcomes...');
  updatePayload.expected_outcomes = localData.expected_outcomes;

  // 5. Sync economics (optional)
  if (localData.economics) {
    console.log('Syncing economics...');
    updatePayload.economics = localData.economics;
  }

  // 6. Update phase_blueprints
  console.log('Updating phase_blueprints...');
  const firestorePhases = firestoreData.phase_blueprints || [];
  
  if (firestorePhases.length === 0) {
    console.log('Firestore phases are empty. Copying all phases from local canonical source.');
    updatePayload.phase_blueprints = localData.phase_blueprints;
  } else {
    console.log('Updating existing phase_blueprints with variantRefs and metadata (preserving doses)...');
    const updatedPhases = firestorePhases.map((fPhase, idx) => {
      const lPhase = localData.phase_blueprints?.[idx];
      if (!lPhase) return fPhase;

      const updatedDrugs = fPhase.drugs.map(fDrug => {
        const lDrug = lPhase.drugs.find(ld => ld.product_id === fDrug.product_id);
        if (lDrug && lDrug.variantRef) {
          return {
            ...fDrug,
            variantRef: lDrug.variantRef
          };
        }
        return fDrug;
      });

      const resultPhase = {
        ...fPhase,
        drugs: updatedDrugs,
      };

      if (lPhase.phase_title) resultPhase.phase_title = lPhase.phase_title;
      if (lPhase.clinical_purpose) resultPhase.clinical_purpose = lPhase.clinical_purpose;
      if (lPhase.clinical_events) resultPhase.clinical_events = lPhase.clinical_events;
      
      return resultPhase;
    });
    updatePayload.phase_blueprints = updatedPhases;
  }

  // 7. Sync general protocol info
  if (localData.protocol_version) updatePayload.protocol_version = localData.protocol_version;
  if (localData.active !== undefined) updatePayload.active = localData.active;
  if (localData.status) updatePayload.status = localData.status;
  if (localData.protocol_title) updatePayload.protocol_title = localData.protocol_title;

  // Filter out any undefined values to be safe
  Object.keys(updatePayload).forEach(key => {
    if (updatePayload[key] === undefined) delete updatePayload[key];
  });

  await docRef.update(updatePayload);
  console.log(`${protocolId} updated successfully to Canonical 2.0 standards`);
}

const targetId = process.argv[2];
if (!targetId) {
  console.error('Please provide a protocol ID.');
  process.exit(1);
}

syncProtocol(targetId).catch(console.error);

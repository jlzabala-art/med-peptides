import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const svcAcct = require('../serviceAccountKey.json');
if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

const CANONICAL_PATH = '../src/services/protocol_builder_2_0_protocols_bundle/wm_002--weight-management-combination.json';

async function syncProtocol() {
  const protocolId = 'wm_002';
  const collectionName = 'protocols';
  
  const localData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'scratch', CANONICAL_PATH), 'utf8'));
  
  console.log(`Loading protocol ${protocolId} from Firestore...`);
  const docRef = db.collection(collectionName).doc(protocolId);
  const docSnap = await docRef.get();
  
  if (!docSnap.exists) {
    console.error(`Protocol ${protocolId} not found in ${collectionName}.`);
    process.exit(1);
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

  // 4. Sync expected_outcomes (local is simpler, but local is canonical)
  console.log('Syncing expected_outcomes...');
  updatePayload.expected_outcomes = localData.expected_outcomes;

  // 5. Sync economics
  console.log('Syncing economics...');
  updatePayload.economics = localData.economics;

  // 6. Update phase_blueprints with variantRef while preserving Firestore dose_logic
  console.log('Updating phase_blueprints with variantRef (preserving Firestore doses)...');
  const updatedPhases = firestoreData.phase_blueprints.map((fPhase, idx) => {
    const lPhase = localData.phase_blueprints[idx];
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

    return {
      ...fPhase,
      drugs: updatedDrugs,
      // Also update clinical_purpose and clinical_events from canonical if they differ?
      // For now, let's just add variantRef as requested.
    };
  });
  updatePayload.phase_blueprints = updatedPhases;

  // 7. Update other fields if needed
  updatePayload.protocol_version = localData.protocol_version;
  updatePayload.active = localData.active;
  updatePayload.status = localData.status;

  await docRef.update(updatePayload);
  console.log('wm_002 updated successfully to Canonical 2.0 standards');
}

syncProtocol().catch(console.error);

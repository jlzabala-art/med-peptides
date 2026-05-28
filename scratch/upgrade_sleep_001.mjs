import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const svcAcct = require('../serviceAccountKey.json');
if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

async function upgradeSleep001() {
  const protocolId = 'sleep_001';
  console.log(`Upgrading ${protocolId} to Canonical 2.0...`);
  const docRef = db.collection('protocols').doc(protocolId);
  const docSnap = await docRef.get();
  const data = docSnap.data();

  const updatePayload = {};

  // 1. Upgrade variant_rules
  updatePayload.variant_rules = {
    age_variants: {
      "18-35": { default_duration_weeks: 8, monitoring_intensity: "standard" },
      "36-50": { default_duration_weeks: 8, monitoring_intensity: "standard" },
      "51-65": { default_duration_weeks: 12, monitoring_intensity: "moderate" },
      "65+": { default_duration_weeks: 12, monitoring_intensity: "enhanced" }
    },
    sex_variants: {
      female: { special_notes: ["Assess potential influence on hormonal cycle and morning alertness."] },
      male: { special_notes: ["Standard sleep architecture assessment."] }
    },
    duration_variants: {
      "8_weeks": { mode: "standard" },
      "12_weeks": { mode: "extended" }
    },
    tempo_variants: {
      conservative: { dose_step_interval_weeks: 4, monitoring_intensity_modifier: "up" },
      standard: { dose_step_interval_weeks: 4, monitoring_intensity_modifier: "none" },
      aggressive: { dose_step_interval_weeks: 2, monitoring_intensity_modifier: "up" }
    }
  };

  // 2. Upgrade generator_rules
  updatePayload.generator_rules = {
    selection_priority: ["goal_match", "sleep_score_match", "stress_level_match"],
    allow_acceleration: false,
    base_duration_weeks: 8
  };

  // 3. Upgrade phase_blueprints with better variantRefs
  if (data.phase_blueprints) {
    updatePayload.phase_blueprints = data.phase_blueprints.map(phase => ({
      ...phase,
      drugs: phase.drugs.map(drug => ({
        ...drug,
        variantRef: drug.variantRef || {
          type: "resolved",
          productId: drug.product_id,
          route: drug.route === 'protocol_defined' ? 'SC' : drug.route
        }
      }))
    }));
  }

  // 4. Update metadata
  if (data.metadata) {
    updatePayload.metadata = {
      ...data.metadata,
      schema_version: "antigravity_v2"
    };
  }

  await docRef.update(updatePayload);
  console.log(`${protocolId} upgraded successfully.`);
}

upgradeSleep001().catch(console.error);

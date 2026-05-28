import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const svcAcct = require('../serviceAccountKey.json');
if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

async function upgradeSkin001() {
  const protocolId = 'skin_001';
  console.log(`Upgrading ${protocolId} to Canonical 2.0...`);
  const docRef = db.collection('protocols').doc(protocolId);
  const docSnap = await docRef.get();
  const data = docSnap.data();

  const updatePayload = {};

  // 1. Upgrade variant_rules
  updatePayload.variant_rules = {
    age_variants: {
      "18-35": { default_duration_weeks: 8, monitoring_intensity: "standard" },
      "36-50": { default_duration_weeks: 12, monitoring_intensity: "standard" },
      "51-65": { default_duration_weeks: 12, monitoring_intensity: "moderate" },
      "65+": { default_duration_weeks: 16, monitoring_intensity: "enhanced" }
    },
    sex_variants: {
      female: { special_notes: ["Consider cycle-phase sensitivity if topical irritation occurs."] },
      male: { special_notes: ["Assess beard area for localized absorption differences if applied to face."] }
    },
    duration_variants: {
      "8_weeks": { mode: "short" },
      "12_weeks": { mode: "standard" },
      "16_weeks": { mode: "extended" }
    },
    tempo_variants: {
      conservative: { dose_step_interval_weeks: 4, monitoring_intensity_modifier: "up" },
      standard: { dose_step_interval_weeks: 4, monitoring_intensity_modifier: "none" },
      aggressive: { dose_step_interval_weeks: 2, monitoring_intensity_modifier: "up" }
    }
  };

  // 2. Upgrade generator_rules
  updatePayload.generator_rules = {
    selection_priority: ["goal_match", "age_variant_match", "skin_type_match"],
    allow_acceleration: false,
    base_duration_weeks: 12
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
          route: drug.route === 'topical' ? 'TOP' : 'SC'
        }
      }))
    }));
  }

  // 4. Ensure metadata is structured (it already seems mostly structured in data.metadata)
  if (data.metadata) {
    updatePayload.metadata = {
      ...data.metadata,
      schema_version: "antigravity_v2"
    };
  }

  await docRef.update(updatePayload);
  console.log(`${protocolId} upgraded successfully.`);
}

upgradeSkin001().catch(console.error);

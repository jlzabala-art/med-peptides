import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const svcAcct = require('../serviceAccountKey.json');
if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

async function upgradeNeuro001() {
  const protocolId = 'neuro_001';
  console.log(`Upgrading ${protocolId} to Canonical 2.0...`);
  const docRef = db.collection('protocols').doc(protocolId);
  const docSnap = await docRef.get();
  const data = docSnap.data();

  const updatePayload = {};

  // 1. Upgrade variant_rules
  updatePayload.variant_rules = {
    age_variants: {
      "18-35": { default_duration_weeks: 12, monitoring_intensity: "standard" },
      "36-50": { default_duration_weeks: 12, monitoring_intensity: "moderate" },
      "51-65": { default_duration_weeks: 16, monitoring_intensity: "enhanced" },
      "65+": { default_duration_weeks: 16, monitoring_intensity: "enhanced" }
    },
    sex_variants: {
      female: { special_notes: ["Monitor cognitive and mood stability during hormonal shifts."] },
      male: { special_notes: ["Standard monitoring."] }
    },
    duration_variants: {
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
    selection_priority: ["goal_match", "age_variant_match", "neuro_severity_match"],
    allow_acceleration: false,
    base_duration_weeks: 12
  };

  // 3. Map phases to phase_blueprints
  if (!data.phase_blueprints && data.phases) {
    updatePayload.phase_blueprints = data.phases.map(p => ({
      phase_key: p.phase_title.toLowerCase().replace(/ /g, '_'),
      phase_title: p.phase_title,
      default_start_week: p.start_week,
      default_duration_weeks: (p.end_week - p.start_week) + 1,
      drugs: p.drugs_used.map(d => ({
        product_id: d.productId || d.product_slug,
        product_title: d.product_slug.charAt(0).toUpperCase() + d.product_slug.slice(1),
        route: d.route === 'subcutaneous' ? 'SC' : (d.route === 'oral_or_sublingual' ? 'ORAL' : 'SC'),
        dose_logic: {
          dose_unit: "mg",
          administration_frequency: d.dosing_frequency || "daily",
          selected_strength: d.selected_strength
        },
        variantRef: {
          type: "resolved",
          productId: d.productId || d.product_slug,
          route: d.route === 'subcutaneous' ? 'SC' : (d.route === 'oral_or_sublingual' ? 'ORAL' : 'SC')
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

upgradeNeuro001().catch(console.error);

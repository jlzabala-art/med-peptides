import { db } from './lib/firebase-admin.mjs';

async function patchLongevity() {
  console.log('🚀 Starting patch for final longevity clinical doses...');

  const updates = [
    {
      id: 'longevity_001',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'epithalon' && !drug.weekly_dose) {
              drug.weekly_dose = '35mg';
              updated = true;
            }
            if (drug.product_slug === 'mots-c' && !drug.weekly_dose) {
              drug.weekly_dose = '15mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'longevity-circadian-mitochondrial-12w',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'mots-c' && !drug.weekly_dose) {
              drug.weekly_dose = '15mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'longevity-foundation-12w',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'mots-c' && !drug.weekly_dose) {
              drug.weekly_dose = phase.phase_number === 2 ? '10mg' : '15mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'lon_001',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'mots-c' && !drug.weekly_dose) {
              drug.weekly_dose = phase.phase_number === 2 ? '10mg' : '15mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    }
  ];

  for (const item of updates) {
    const docRef = db.collection('protocols').doc(item.id);
    const snap = await docRef.get();
    if (snap.exists) {
      const data = snap.data();
      const phases = data.phases || [];
      const isUpdated = item.updates(phases);
      if (isUpdated) {
        await docRef.update({ phases });
        console.log(`✅ Patched doses for protocol: "${item.id}"`);
      } else {
        console.log(`ℹ️ Protocol "${item.id}" was already up to date.`);
      }
    } else {
      console.log(`⚠️ Document "${item.id}" not found.`);
    }
  }

  console.log('🎉 Final longevity clinical dose patching completed successfully!');
}

patchLongevity().catch(console.error);

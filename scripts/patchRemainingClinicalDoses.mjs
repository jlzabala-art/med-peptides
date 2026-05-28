import { db } from './lib/firebase-admin.mjs';

async function patchRemaining() {
  console.log('🚀 Starting patch for remaining clinical doses...');

  const updates = [
    {
      id: 'met_001',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'mots-c' && !drug.weekly_dose) {
              drug.weekly_dose = phase.phase_number === 2 ? '10mg' : '15mg';
              updated = true;
            }
            if (drug.product_slug === 'aod-9604' && !drug.weekly_dose) {
              drug.weekly_dose = '1.75mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'met_002',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'mots-c' && !drug.weekly_dose) {
              drug.weekly_dose = phase.phase_number === 2 ? '10mg' : '15mg';
              updated = true;
            }
            if (drug.product_slug === 'ss-31' && !drug.weekly_dose) {
              drug.weekly_dose = '10mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'metabolic-optimization-10w',
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
      id: 'metabolic-retatrutide-motsc-12w',
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
      id: 'mitochondrial-energy-10w',
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
      id: 'mitochondrial-resilience-10w',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'mots-c' && !drug.weekly_dose) {
              drug.weekly_dose = '10mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'neuro_001',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'ss-31' && !drug.weekly_dose) {
              drug.weekly_dose = '10mg';
              updated = true;
            }
            if (drug.product_slug === 'pinealon' && !drug.weekly_dose) {
              drug.weekly_dose = '2.1mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'cog_002',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'pinealon' && !drug.weekly_dose) {
              drug.weekly_dose = '2.1mg';
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

  console.log('🎉 Remaining clinical dose patching completed successfully!');
}

patchRemaining().catch(console.error);

import { db } from './lib/firebase-admin.mjs';

async function patchImmune() {
  console.log('🚀 Starting patch for immune clinical doses...');

  const updates = [
    {
      id: 'immune_001',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'thymosin-alpha-1' && !drug.weekly_dose) {
              drug.weekly_dose = '3.2mg';
              updated = true;
            }
          });
        });
        return updated;
      }
    },
    {
      id: 'immune_002',
      updates: (phases) => {
        let updated = false;
        phases.forEach((phase) => {
          (phase.drugs_used || []).forEach((drug) => {
            if (drug.product_slug === 'thymosin-alpha-1' && !drug.weekly_dose) {
              drug.weekly_dose = '3.2mg';
              updated = true;
            }
            if (drug.product_slug === 'kpv' && !drug.weekly_dose) {
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

  console.log('🎉 Immune clinical dose patching completed successfully!');
}

patchImmune().catch(console.error);

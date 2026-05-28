import { db } from './lib/firebase-admin.mjs';

async function fix() {
  console.log('🚀 Starting fix for missing dosing frequencies in "protocols" collection...');

  // 1. Fix wm_001
  const wm001Ref = db.collection('protocols').doc('wm_001');
  const wm001Snap = await wm001Ref.get();
  if (wm001Snap.exists) {
    const data = wm001Snap.data();
    let updated = false;
    const phases = data.phases || [];
    
    phases.forEach((phase) => {
      const drugs = phase.drugs_used || [];
      drugs.forEach((drug) => {
        if (drug.product_slug === 'tirzepatide' && !drug.dosing_frequency) {
          drug.dosing_frequency = 'weekly';
          updated = true;
          console.log(`✅ wm_001 | Phase ${phase.phase_number}: set dosing_frequency: "weekly" for tirzepatide.`);
        }
      });
    });

    if (updated) {
      await wm001Ref.update({ phases });
      console.log('💾 wm_001 document updated in Firestore!');
    } else {
      console.log('ℹ️ wm_001 was already up to date.');
    }
  } else {
    console.log('❌ wm_001 not found.');
  }

  // 2. Fix wm_002
  const wm002Ref = db.collection('protocols').doc('wm_002');
  const wm002Snap = await wm002Ref.get();
  if (wm002Snap.exists) {
    const data = wm002Snap.data();
    let updated = false;
    const phases = data.phases || [];
    
    phases.forEach((phase) => {
      const drugs = phase.drugs_used || [];
      drugs.forEach((drug) => {
        if ((drug.product_slug === 'semaglutide' || drug.product_slug === 'cagrilintide') && !drug.dosing_frequency) {
          drug.dosing_frequency = 'weekly';
          updated = true;
          console.log(`✅ wm_002 | Phase ${phase.phase_number}: set dosing_frequency: "weekly" for ${drug.product_slug}.`);
        }
      });
    });

    if (updated) {
      await wm002Ref.update({ phases });
      console.log('💾 wm_002 document updated in Firestore!');
    } else {
      console.log('ℹ️ wm_002 was already up to date.');
    }
  } else {
    console.log('❌ wm_002 not found.');
  }

  console.log('🎉 Fix complete!');
}

fix().catch(console.error);

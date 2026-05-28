import { db } from './lib/firebase-admin.mjs';

async function patchLon002() {
  const docRef = db.collection('protocols').doc('lon_002');
  const snap = await docRef.get();
  if (snap.exists) {
    const data = snap.data();
    const phases = data.phases || [];
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
    if (updated) {
      await docRef.update({ phases });
      console.log('✅ Patched doses for lon_002!');
    }
  }
}

patchLon002().catch(console.error);

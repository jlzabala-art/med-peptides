import { db } from './lib/firebase-admin.mjs';

async function checkSelank() {
  const docRef = db.collection('protocols').doc('cog_001');
  const snap = await docRef.get();
  if (snap.exists) {
    const data = snap.data();
    console.log('=== Protocol cog_001 ===');
    const phases = data.phases || [];
    phases.forEach((phase, idx) => {
      const drugs = phase.drugs_used || [];
      drugs.forEach((drug) => {
        if (drug.product_slug === 'selank') {
          console.log(`Phase ${idx + 1} | Selank Dose: ${drug.weekly_dose} | Freq: ${drug.dosing_frequency}`);
        }
      });
    });
  }
}

checkSelank().catch(console.error);

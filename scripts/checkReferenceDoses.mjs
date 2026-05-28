import { db } from './lib/firebase-admin.mjs';

async function inspectReference() {
  const docRef = db.collection('protocols').doc('advanced-metabolic-longevity-16w');
  const snap = await docRef.get();
  if (snap.exists) {
    const data = snap.data();
    console.log('=== Reference Protocol advanced-metabolic-longevity-16w ===');
    const phases = data.phases || [];
    phases.forEach((phase, idx) => {
      console.log(`Phase ${idx + 1}:`);
      const drugs = phase.drugs_used || [];
      drugs.forEach((drug) => {
        console.log(`  - Drug: ${drug.product_slug} | Dose: ${drug.weekly_dose} | Freq: ${drug.dosing_frequency}`);
      });
    });
  } else {
    console.log('❌ Reference protocol not found');
  }
}

inspectReference().catch(console.error);

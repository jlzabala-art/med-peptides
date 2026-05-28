import { db } from './lib/firebase-admin.mjs';

async function inspectSA() {
  const docRef = db.collection('protocols').doc('sa_001');
  const snap = await docRef.get();
  if (snap.exists) {
    const data = snap.data();
    console.log('=== Protocol sa_001 ===');
    const phases = data.phases || [];
    phases.forEach((phase, idx) => {
      console.log(`  Phase ${idx + 1}:`);
      const drugs = phase.drugs_used || [];
      drugs.forEach((drug) => {
        console.log(`    - Drug: ${drug.product_slug} | Dose: ${drug.weekly_dose} | Freq: ${drug.dosing_frequency}`);
      });
    });
  }
}

inspectSA().catch(console.error);

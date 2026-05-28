import { db } from './lib/firebase-admin.mjs';

async function inspectTirz() {
  for (const pid of ['wm_001', 'wm_004']) {
    const docRef = db.collection('protocols').doc(pid);
    const snap = await docRef.get();
    if (snap.exists) {
      const data = snap.data();
      console.log(`\n=== Protocol: ${pid} ===`);
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
}

inspectTirz().catch(console.error);

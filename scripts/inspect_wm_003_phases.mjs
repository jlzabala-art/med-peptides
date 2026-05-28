import { db } from '/Users/joseluiszabala/Documents/Antigravity/regenpept-web/scripts/lib/firebase-admin.mjs';

async function run() {
  const doc = await db.collection('protocols').doc('wm_003').get();
  if (doc.exists) {
    const data = doc.data();
    console.log("has phase_blueprints:", Array.isArray(data.phase_blueprints));
    if (data.phase_blueprints) console.log("phase_blueprints length:", data.phase_blueprints.length);
    console.log("has phases:", Array.isArray(data.phases));
    if (data.phases) {
      console.log("phases length:", data.phases.length);
      console.log("First phase keys:", Object.keys(data.phases[0]));
      console.log("First phase compounds:", data.phases[0].compounds);
      console.log("First phase drugs:", data.phases[0].drugs);
    }
  } else {
    console.log("Doc wm_003 does not exist!");
  }
}

run().catch(console.error);

import { db } from '/Users/joseluiszabala/Documents/Antigravity/regenpept-web/scripts/lib/firebase-admin.mjs';

async function run() {
  const doc = await db.collection('protocols').doc('wm_003').get();
  if (doc.exists) {
    const data = doc.data();
    console.log("Phase Blueprint 0 keys:", Object.keys(data.phase_blueprints[0]));
    console.log("Phase Blueprint 0 drugs:", data.phase_blueprints[0].drugs);
    console.log("Phase Blueprint 0 compounds:", data.phase_blueprints[0].compounds);
    console.log("Phase Blueprint 0 medications:", data.phase_blueprints[0].medications);
  } else {
    console.log("Doc wm_003 does not exist!");
  }
}

run().catch(console.error);

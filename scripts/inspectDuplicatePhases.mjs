import { db } from './lib/firebase-admin.mjs';

async function compare(shortId, slugId) {
  const shortDoc = await db.collection('protocols').doc(shortId).get();
  const slugDoc = await db.collection('protocols').doc(slugId).get();

  if (!shortDoc.exists || !slugDoc.exists) {
    console.log(`❌ One of ${shortId} or ${slugId} does not exist`);
    return;
  }

  console.log(`\n==================================================`);
  console.log(`COMPARING: ${shortId} vs ${slugId}`);
  console.log(`==================================================`);

  const shortPhases = shortDoc.data().phases || [];
  const slugPhases = slugDoc.data().phases || [];

  console.log(`${shortId} phases length: ${shortPhases.length}`);
  console.log(`${slugId} phases length: ${slugPhases.length}`);

  shortPhases.forEach((p, idx) => {
    console.log(`Phase ${idx + 1}:`);
    const shortDrugs = p.drugs_used || [];
    const slugDrugs = (slugPhases[idx] || {}).drugs_used || [];

    console.log(`  - ${shortId}:`, shortDrugs.map(d => `${d.product_slug} (${d.weekly_dose || 'MISSING'})`));
    console.log(`  - ${slugId}:`, slugDrugs.map(d => `${d.product_slug} (${d.weekly_dose || 'MISSING'})`));
  });
}

async function run() {
  await compare('skin_001', 'skin-rejuvenation-12w');
  await compare('skin_002', 'skin-repair-aging-10w');
  await compare('sleep_001', 'sleep-restoration-8w');
  await compare('sleep_002', 'sleep-circadian-6w');
  await compare('wm_001', 'weight-management-structured-12w');
}

run().catch(console.error);

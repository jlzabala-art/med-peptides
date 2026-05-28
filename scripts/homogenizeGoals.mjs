import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function run() {
  console.log('Fetching all protocols from Firestore...');
  const snap = await db.collection('protocols').get();
  
  for (const d of snap.docs) {
    const data = d.data();
    let pGoal = data.primary_goal;
    let mGoal = data.metadata?.primary_goal;
    let needsUpdate = false;

    // Apply specific clinical homogenizations
    if (d.id === 'wm_005') {
      pGoal = 'Weight Management / Metabolic Longevity';
      mGoal = 'Weight Management / Metabolic Longevity';
      needsUpdate = true;
    } else if (d.id === 'energy_001' || d.id === 'energy_002') {
      pGoal = 'Energy / Mitochondrial';
      mGoal = 'Energy / Mitochondrial';
      needsUpdate = true;
    } else if (d.id === 'skin_003') {
      pGoal = 'Skin / Anti-Aging';
      mGoal = 'Skin / Anti-Aging';
      needsUpdate = true;
    } else {
      // Fallback: sync metadata.primary_goal to primary_goal
      if (pGoal && mGoal && pGoal !== mGoal) {
        mGoal = pGoal;
        needsUpdate = true;
      } else if (pGoal && !mGoal) {
        mGoal = pGoal;
        needsUpdate = true;
      }
    }

    if (needsUpdate || data.primary_goal !== pGoal || data.metadata?.primary_goal !== mGoal) {
      console.log(`Updating Doc: ${d.id}`);
      console.log(`  OLD -> primary_goal: "${data.primary_goal}" | meta_goal: "${data.metadata?.primary_goal}"`);
      console.log(`  NEW -> primary_goal: "${pGoal}" | meta_goal: "${mGoal}"`);
      
      const updateData = {
        primary_goal: pGoal,
        'metadata.primary_goal': mGoal
      };
      
      await db.collection('protocols').doc(d.id).update(updateData);
      console.log(`✅ Doc: ${d.id} successfully homogenized.`);
    } else {
      console.log(`✨ Doc: ${d.id} is already clean ("${pGoal}").`);
    }
  }

  console.log('\n🎉 All protocol goals have been perfectly homogenized in Firestore.');
}

run().catch(console.error);

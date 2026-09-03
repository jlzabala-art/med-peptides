const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve('/Users/joseluiszabala/regenpept-web.nosync', '.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
}

const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('protocols').get();
  let updatedCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const name = data.name || data.title || '';
    
    let targetGoal = data.primary_goal;
    
    // Homogenize from other fields if primary_goal is missing
    if (!targetGoal) {
      if (data.category) targetGoal = data.category;
      else if (data.goal) targetGoal = data.goal;
    }
    
    // Infer if still missing based on name
    if (!targetGoal) {
      const lowerName = name.toLowerCase();
      if (lowerName.includes('glp-1') || lowerName.includes('gip') || lowerName.includes('metabolic') || lowerName.includes('weight')) {
        targetGoal = 'Weight Management';
      } else if (lowerName.includes('longevity') || lowerName.includes('anti-aging')) {
        targetGoal = 'Longevity & Anti-Aging';
      } else if (lowerName.includes('recovery') || lowerName.includes('repair') || lowerName.includes('bpc') || lowerName.includes('tb-500')) {
        targetGoal = 'Recovery & Tissue Repair';
      } else if (lowerName.includes('libido') || lowerName.includes('sexual') || lowerName.includes('pt-141')) {
        targetGoal = 'Sexual Health';
      } else if (lowerName.includes('cognit') || lowerName.includes('neuro') || lowerName.includes('semax') || lowerName.includes('dihexa')) {
        targetGoal = 'Cognition & Brain Health';
      } else if (lowerName.includes('hair') || lowerName.includes('scalp') || lowerName.includes('skin')) {
        targetGoal = 'Skin & Aesthetics';
      } else if (lowerName.includes('immune')) {
        targetGoal = 'Immune Support';
      } else {
        targetGoal = 'General Protocol';
      }
    }
    
    // Always update to ensure homogeneity
    if (data.primary_goal !== targetGoal) {
      console.log(`Updating "${name}": ${data.primary_goal} -> ${targetGoal}`);
      await doc.ref.update({ primary_goal: targetGoal });
      updatedCount++;
    }
  }
  
  console.log(`Finished. Updated ${updatedCount} protocols.`);
  process.exit(0);
}

run().catch(console.error);

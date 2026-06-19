const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'med-peptides-app'
});

const db = admin.firestore();

async function run() {
  const productsSnap = await db.collection('products').get();
  let updatedCount = 0;
  
  for (const pDoc of productsSnap.docs) {
    const pData = pDoc.data();
    
    const oldCat = (pData.category || '').toLowerCase();
    const oldSubCat = (pData.subcategory || pData.subCategory || '').toLowerCase();
    const nameStr = (pData.name || '').toLowerCase();
    
    let goals = [];
    
    const goalMapping = [
      { keyword: 'weight loss', goal: 'weight_loss_glp1' },
      { keyword: 'glp-1', goal: 'weight_loss_glp1' },
      { keyword: 'metabolic', goal: 'metabolic_health' },
      { keyword: 'anti-aging', goal: 'anti_aging_longevity' },
      { keyword: 'longevity', goal: 'anti_aging_longevity' },
      { keyword: 'recovery', goal: 'recovery_healing' },
      { keyword: 'healing', goal: 'recovery_healing' },
      { keyword: 'cognitive', goal: 'cognitive_mood' },
      { keyword: 'mood', goal: 'cognitive_mood' },
      { keyword: 'nootropic', goal: 'cognitive_mood' },
      { keyword: 'hormon', goal: 'hormonal_optimization' },
      { keyword: 'fertility', goal: 'fertility' },
      { keyword: 'immune', goal: 'immune_support' },
      { keyword: 'skin', goal: 'skin_hair_aesthetics' },
      { keyword: 'hair', goal: 'skin_hair_aesthetics' },
      { keyword: 'aesthetic', goal: 'skin_hair_aesthetics' },
      { keyword: 'performance', goal: 'performance_muscle' },
      { keyword: 'muscle', goal: 'performance_muscle' },
      { keyword: 'growth', goal: 'performance_muscle' },
      { keyword: 'biomarker', goal: 'biomarkers' },
      { keyword: 'genomics', goal: 'genomics' },
    ];

    const combineStr = `${oldCat} ${oldSubCat} ${nameStr}`;
    goalMapping.forEach(m => {
      if (combineStr.includes(m.keyword) && !goals.includes(m.goal)) {
        goals.push(m.goal);
      }
    });
    if (goals.length === 0) goals.push('general_wellness');
    
    await pDoc.ref.update({ goals });
    updatedCount++;
  }
  
  console.log('Updated', updatedCount, 'products with new goals');
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

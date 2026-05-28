import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';

try {
  const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  }, 'target-app');

  const db = app.firestore();
  const snapshot = await db.collection('products').get();
  
  const mapping = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.supplier === 'Lotusland' && data.isActive !== false && data.status !== 'draft') {
      const name = data.name.toUpperCase().trim();
      mapping[name] = {
        id: doc.id,
        category: data.category,
        productType: data.productType,
        goals: data.goals || [],
        secondaryFactors: data.secondaryFactors || [],
        secondaryDetails: data.secondaryDetails || [],
        mechanisms: data.mechanisms || [],
        semanticKeywords: data.semanticKeywords || [],
        safetyNote: data.safetyNote || '',
        synonyms: data.synonyms || [],
        desc: data.description || data.desc || ''
      };
    }
  });

  console.log(`Found ${Object.keys(mapping).length} active Lotusland products in Firestore.`);
  
  writeFileSync('./scratch/lotusland_mapping.json', JSON.stringify(mapping, null, 2));
  console.log('Saved mapping to scratch/lotusland_mapping.json');
  
  // Sample a few mappings
  console.log('Sample mappings:');
  Object.entries(mapping).slice(0, 15).forEach(([name, data]) => {
    console.log(`- ${name} -> Category: "${data.category}" | Goals: ${JSON.stringify(data.goals)}`);
  });

} catch (e) {
  console.error(e);
}
process.exit(0);

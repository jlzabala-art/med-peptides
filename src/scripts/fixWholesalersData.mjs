import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function run() {
  const wSnap = await db.collection('wholesellers').get();
  const batch = db.batch();
  let count = 0;

  // Track 24Genetics duplicates to merge
  let geneticsDocs = [];

  wSnap.forEach(doc => {
    const data = doc.data();
    const name = (data.companyName || data.name || '').toLowerCase();
    
    // Categorize
    let category = '';
    if (name.includes('magenta') || name.includes('vallida') || name.includes('fussion') || name.includes('fusion') || name.includes('poland') || name.includes('pod') || name.includes('nplab') || name.includes('peptides')) {
      category = 'Peptides';
    } else if (name.includes('genetics') || name.includes('test') || name.includes('24genetics') || name.includes('nordic')) {
      category = 'Tests';
    } else if (name.includes('api') || name.includes('fagron') || name.includes('lotus') || name.includes('roche')) {
      category = 'APIs';
    } else {
      category = 'APIs'; // Defaulting others to APIs for now
    }

    if (name.includes('24genetics')) {
      geneticsDocs.push({ id: doc.id, data });
    }

    batch.update(doc.ref, { category });
    count++;
  });

  // Handle 24Genetics merge
  if (geneticsDocs.length > 1) {
    // Keep the first one, delete the rest
    const mainDoc = geneticsDocs[0];
    console.log('Keeping main 24Genetics doc:', mainDoc.id);
    for (let i = 1; i < geneticsDocs.length; i++) {
      console.log('Deleting duplicate 24Genetics doc:', geneticsDocs[i].id);
      batch.delete(db.collection('wholesellers').doc(geneticsDocs[i].id));
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`Successfully updated ${count} wholesellers with categories, merged duplicates.`);
  } else {
    console.log('No wholesellers found.');
  }
}

run().catch(console.error);

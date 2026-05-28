import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Admin SDK with explicit service account
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'med-peptides-app'
  });
}

const db = admin.firestore();

async function seedFaqs() {
  const dataPath = path.join(__dirname, '../final_faqs_bundle.json');
  console.log(`Reading ${dataPath}...`);
  const faqs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  console.log(`Starting migration of ${faqs.length} FAQs...`);
  
  const batchSize = 450;
  for (let i = 0; i < faqs.length; i += batchSize) {
    const batch = db.batch();
    const currentChunk = faqs.slice(i, i + batchSize);
    
    currentChunk.forEach(faq => {
      const docRef = db.collection('faqs').doc();
      batch.set(docRef, {
        ...faq,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`Committed batch ${Math.ceil((i + batchSize) / batchSize)} / ${Math.ceil(faqs.length / batchSize)}`);
  }
  
  console.log('Migration complete!');
}

seedFaqs().catch(console.error);

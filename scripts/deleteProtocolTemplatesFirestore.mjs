import { db } from './lib/firebase-admin.mjs';

async function deleteProtocolTemplates() {
  console.log('🚀 Starting deletion of "protocol_templates" collection in Firestore...');
  
  const collectionRef = db.collection('protocol_templates');
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log('ℹ️ No documents found in "protocol_templates" collection. It is already empty.');
    return;
  }
  
  console.log(`📂 Found ${snapshot.size} documents in "protocol_templates".`);
  
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    console.log(`  - Queueing deletion of: ${doc.id}`);
    batch.delete(doc.ref);
  });
  
  console.log('⏳ Committing batch delete operation...');
  await batch.commit();
  console.log('✅ Successfully deleted all documents in the "protocol_templates" collection!');
}

deleteProtocolTemplates().catch((err) => {
  console.error('❌ Error during deletion script execution:', err);
  process.exit(1);
});

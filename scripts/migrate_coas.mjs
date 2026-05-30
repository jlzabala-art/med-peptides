import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import path from 'path';

// Initialize Firebase Admin
initializeApp({
  credential: applicationDefault(),
  projectId: 'med-peptides-app'
});

const storage = getStorage();
const db = getFirestore();

async function run() {
  const sourceBucket = storage.bucket('peptides_brochures_regpeptides');
  const destBucket = storage.bucket('med-peptides-app.firebasestorage.app');
  
  console.log('Fetching files from source bucket...');
  const [files] = await sourceBucket.getFiles({ prefix: 'CoAs/COA Total/' });
  
  console.log(`Found ${files.length} files. Starting migration...`);
  let count = 0;
  
  for (const file of files) {
    if (file.name.endsWith('/')) continue; // Skip directories
    if (!file.name.toLowerCase().endsWith('.pdf')) continue; // Only migrate PDFs
    
    const fileName = path.basename(file.name);
    const timestamp = Date.now();
    const destPath = `uploads/migrated_${timestamp}_${fileName}`;
    
    try {
      console.log(`Copying ${fileName}...`);
      const destFile = destBucket.file(destPath);
      
      // Copy to new bucket
      await file.copy(destFile);
      
      // We will just construct the standard public URL or signed-like URL (using standard storage.googleapis.com)
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/med-peptides-app.firebasestorage.app/o/${encodeURIComponent(destPath).replace(/%2F/g, '/')}?alt=media`;
      
      // Register in Firestore as COA
      await db.collection('uploaded_documents').add({
        fileName: fileName,
        fileUrl: publicUrl,
        storagePath: destPath,
        uploadedBy: 'system_migration',
        uploaderName: 'Migration Agent',
        status: 'processing', // AI can pick this up
        documentType: 'COA',
        createdAt: FieldValue.serverTimestamp(),
        extractedData: null
      });
      
      count++;
    } catch (err) {
      console.error(`Failed to migrate ${fileName}:`, err.message);
    }
  }
  
  console.log(`\n🎉 Successfully migrated ${count} COAs to Firebase Storage and registered them in the database!`);
}

run().catch(console.error);

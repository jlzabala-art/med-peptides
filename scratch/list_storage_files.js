import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json'),
  storageBucket: 'med-peptides-app.firebasestorage.app'
});

const bucket = admin.storage().bucket();

async function run() {
  console.log("=== LISTING STORAGE FILES ===");
  const [files] = await bucket.getFiles({ prefix: 'temp_imports/' });
  console.log(`Found ${files.length} files under temp_imports/:`);
  files.forEach(file => {
    console.log(`- Name: ${file.name}`);
    console.log(`  Size: ${file.metadata.size} bytes`);
    console.log(`  Created: ${file.metadata.timeCreated}`);
  });
}

run().catch(console.error);

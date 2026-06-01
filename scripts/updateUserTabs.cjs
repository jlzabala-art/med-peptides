const admin = require('firebase-admin');

// Ensure we don't initialize twice if running in a watch mode
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Relies on GOOGLE_APPLICATION_CREDENTIALS or gcloud auth
    projectId: "med-peptides-app" // from your firebase project
  });
}

const db = admin.firestore();

async function updateUsers() {
  const emails = ['business@mediluxeme.com', 'dxb@mediluxeme.com'];
  
  for (const email of emails) {
    const snapshot = await db.collection('users').where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log(`No user found with email ${email}`);
      continue;
    }

    for (const doc of snapshot.docs) {
      await doc.ref.update({
        allowedAdminTabs: ['finance']
      });
      console.log(`Updated user ${email} (${doc.id}) with allowedAdminTabs: ['finance']`);
    }
  }
}

updateUsers().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(console.error);

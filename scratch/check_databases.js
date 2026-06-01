import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json'),
});

const firestoreAdmin = admin.firestore()._firestoreClient;
// Or use firebase-admin SDK's listDatabases API if available or check project id
console.log("Project:", admin.app().options.credential.projectId || "check key");

async function run() {
  const db = admin.firestore();
  console.log("Connected database path:", db._settings?.databaseId || "default");
}

run().catch(console.error);

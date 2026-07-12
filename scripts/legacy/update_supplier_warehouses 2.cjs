const admin = require('firebase-admin');
process.env.GOOGLE_APPLICATION_CREDENTIALS = "/Users/joseluiszabala/.config/gcloud/application_default_credentials.json";
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "regenpept-1"
});
const db = admin.firestore();

async function updateWarehouses() {
  const snap = await db.collection('wholesellers').get();
  for (const doc of snap.docs) {
    const data = doc.data();
    const name = data.companyName || data.name || doc.id;
    if (name.toLowerCase().includes('lotus')) {
      console.log(`Updating ${name} (${doc.id}) with warehouses...`);
      await db.collection('wholesellers').doc(doc.id).update({
        warehouses: ['Polonia', 'USA', 'HK']
      });
      console.log(`Updated ${name} successfully.`);
    }
  }
}

updateWarehouses().then(() => {
  console.log('Done.');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});

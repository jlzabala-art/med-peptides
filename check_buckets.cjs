require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.applicationDefault() });

async function listBuckets() {
  const { getStorage } = require('firebase-admin/storage');
  try {
    const [buckets] = await getStorage().getBuckets();
    console.log("Buckets found:");
    buckets.forEach(b => console.log(b.name));
  } catch(e) {
    console.error(e);
  }
}
listBuckets();

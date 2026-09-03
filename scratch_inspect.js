import { adminDb } from './src/lib/firebaseAdmin.js';
async function main() {
  const snapshot = await adminDb.collection('products').limit(5).get();
  snapshot.forEach(doc => {
    console.log(doc.id, Object.keys(doc.data()));
    console.log(JSON.stringify(doc.data(), null, 2));
  });
}
main();

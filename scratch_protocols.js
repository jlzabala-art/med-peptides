import { adminDb } from './src/lib/firebaseAdmin.js';

async function main() {
  const snapshot = await adminDb.collection('protocols').limit(3).get();
  snapshot.forEach(doc => {
    console.log(`Protocol ${doc.id}:`, doc.data());
  });
}
main().catch(console.error);

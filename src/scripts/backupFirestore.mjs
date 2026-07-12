import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

const backupDir = path.join(process.cwd(), '../data/backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

async function backupCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const data = [];
  snapshot.forEach(doc => {
    data.push({ id: doc.id, ...doc.data() });
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = path.join(backupDir, `${collectionName}_backup_${timestamp}.json`);
  
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`✅ Backed up ${data.length} documents from '${collectionName}' to ${filename}`);
}

async function runBackup() {
  console.log('Starting automated Firestore backup...');
  const collectionsToBackup = ['protocols', 'products', 'users']; // Add any others needed
  
  for (const coll of collectionsToBackup) {
    try {
      await backupCollection(coll);
    } catch (error) {
      console.error(`❌ Failed to backup collection '${coll}':`, error);
    }
  }
  
  console.log('🎉 All scheduled backups completed successfully.');
}

runBackup().catch(console.error).finally(() => process.exit(0));

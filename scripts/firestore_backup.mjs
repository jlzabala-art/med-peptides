import { db } from './lib/firebase-admin.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_DIR = path.join(__dirname, '../public/backups/db');
const MAX_BACKUPS = 5;

// Collections to skip if they are too large or transient
const SKIP_COLLECTIONS = ['search_inquiry_logs', 'page_views', 'presence'];

async function backupFirestore() {
  console.log(`[Firestore Backup] Starting full database backup at ${new Date().toISOString()}`);

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup-${timestamp}.json`;
  const backupFilePath = path.join(BACKUP_DIR, backupFileName);
  
  const exportData = {};

  try {
    console.log('[Firestore Backup] Discovering all root collections...');
    const collections = await db.listCollections();
    const colNames = collections.map(c => c.id).filter(name => !SKIP_COLLECTIONS.includes(name));
    console.log(`[Firestore Backup] Found ${colNames.length} collections to backup.`);

    for (const colName of colNames) {
      console.log(`[Firestore Backup] Fetching collection: ${colName}...`);
      try {
        const snapshot = await db.collection(colName).get();
        exportData[colName] = [];
        
        snapshot.forEach(doc => {
          exportData[colName].push({
            id: doc.id,
            ...doc.data()
          });
        });
        console.log(`[Firestore Backup] Exported ${exportData[colName].length} documents from ${colName}.`);
      } catch (colErr) {
        console.error(`[Firestore Backup] Warning: Failed to backup collection ${colName}`, colErr);
      }
    }

    fs.writeFileSync(backupFilePath, JSON.stringify(exportData, null, 2), 'utf8');
    console.log(`[Firestore Backup] Full backup saved to ${backupFilePath}`);

    // Manage Retention Policy
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // newest first

    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(MAX_BACKUPS);
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        console.log(`[Firestore Backup] Deleted old backup: ${file.name}`);
      }
    }
    
    console.log('[Firestore Backup] Backup process completed successfully.');
  } catch (error) {
    console.error('[Firestore Backup] Error during backup:', error);
  }
}

// Allow running manually
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  backupFirestore().then(() => process.exit(0)).catch(() => process.exit(1));
}

export { backupFirestore };

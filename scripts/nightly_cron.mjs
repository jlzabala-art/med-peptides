import cron from 'node-cron';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { backupFirestore } from './firestore_backup.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🤖 Nightly Cron Service Started. Scheduled to run at 1:00 AM daily.');

cron.schedule('0 1 * * *', async () => {
  console.log(`\n=========================================`);
  console.log(`🌙 Nightly Automations Triggered at ${new Date().toLocaleString()}`);
  console.log(`=========================================\n`);

  try {
    // 1. Gadget Catalog Update
    console.log('▶ Running Gadget Catalog Generator...');
    execSync('node scripts/generate_gadget_catalog.js', { cwd: rootDir, stdio: 'inherit' });
    
    // 2. Database Backup
    console.log('\n▶ Running Firestore Database Backup...');
    await backupFirestore();

    // 3. Code Backup (Git)
    console.log('\n▶ Running Code Auto Backup...');
    execSync('node scripts/autoBackup.mjs', { cwd: rootDir, stdio: 'inherit' });

    console.log(`\n✅ Nightly Automations Completed successfully at ${new Date().toLocaleString()}\n`);
  } catch (err) {
    console.error('\n❌ Error during Nightly Automations:', err);
  }
});

// To keep the process alive
process.stdin.resume();

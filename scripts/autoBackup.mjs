import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

try {
  console.log('Starting Auto Backup...');
  
  // 1. Stage all changes
  execSync('git add .', { cwd: rootDir, stdio: 'inherit' });
  
  // 2. Commit if there are changes
  const dateStr = new Date().toLocaleString();
  try {
    execSync(`git commit -m "Auto Backup: ${dateStr}"`, { cwd: rootDir, stdio: 'inherit' });
    console.log('Changes committed successfully.');
  } catch (e) {
    console.log('No changes to commit. Proceeding to update registry.');
  }

  // 3. Fetch the last 5 commits and format as JSON
  const logOut = execSync(`git log -n 5 --pretty=format:'{"hash": "%h", "date": "%ad", "message": "%s"}' --date=iso`, { cwd: rootDir }).toString();
  
  const jsonArray = '[' + logOut.split('\n').filter(l => l.trim()).join(',') + ']';
  
  // 4. Save to src/data/backups.json
  const dataDir = path.join(rootDir, 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(path.join(dataDir, 'backups.json'), jsonArray);
  
  console.log('Backup registry updated at src/data/backups.json');

} catch (err) {
  console.error('Backup process failed:', err.message);
}

/**
 * prune-deploy-payload.mjs
 *
 * Removes non-runtime compiler cache (.next/cache) from the Firebase functions packaging directory.
 * Reduces upload payload from ~491 MB to ~40 MB, speeding up deploy 5x-10x.
 */
import fs from 'fs';
import path from 'path';

const firebaseDir = path.resolve('.firebase');

function findAndPrune(dir) {
  if (!fs.existsSync(dir)) return 0;

  let bytesSaved = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'cache' && fullPath.includes('.next')) {
        console.log(`🧹 [Prune] Removing compiler cache: ${fullPath}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else if (entry.name === 'dev' && fullPath.includes('.next')) {
        console.log(`🧹 [Prune] Removing dev artifacts: ${fullPath}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        findAndPrune(fullPath);
      }
    }
  }

  // Ensure functions directories have a .gcloudignore that excludes .next/cache
  if (dir.endsWith('functions') && fs.existsSync(dir)) {
    const gcloudIgnorePath = path.join(dir, '.gcloudignore');
    const ignoreContent = [
      '.gcloudignore',
      '.git',
      '.gitignore',
      '.next/cache/**',
      '.next/dev/**',
      '*.log',
      '*.md'
    ].join('\n');
    fs.writeFileSync(gcloudIgnorePath, ignoreContent, 'utf8');
    console.log(`🛡️ [Prune] Ensured .gcloudignore in: ${dir}`);
  }
}

console.log('🚀 Checking .firebase directory for deploy bloat...');
findAndPrune(firebaseDir);
console.log('✅ .firebase deploy payload ready and optimized.');

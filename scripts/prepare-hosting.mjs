/**
 * prepare-hosting.mjs
 *
 * Prepares the high-speed static CDN directory (.hosting_public) for Firebase Hosting.
 * Copies:
 *  - public/ -> .hosting_public/
 *  - .next/static/ -> .hosting_public/_next/static/
 *
 * This allows Firebase Hosting to serve static chunks and assets globally at the edge (0ms)
 * while routing all dynamic SSR/API requests to Cloud Run (ssrmedpeptidesapp27a3a).
 */
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const HOSTING_DIR = path.join(ROOT_DIR, '.hosting_public');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const STATIC_DIR = path.join(ROOT_DIR, '.next/static');

console.log('🚀 [Prepare Hosting] Assembling static payload for Firebase Hosting CDN...');

// 1. Clean existing .hosting_public
if (fs.existsSync(HOSTING_DIR)) {
  fs.rmSync(HOSTING_DIR, { recursive: true, force: true });
}
fs.mkdirSync(HOSTING_DIR, { recursive: true });

// 2. Copy public directory assets
if (fs.existsSync(PUBLIC_DIR)) {
  fs.cpSync(PUBLIC_DIR, HOSTING_DIR, {
    recursive: true,
    filter: (src) => {
      // Exclude tests, screenshots, and logs
      const base = path.basename(src);
      if (base === '.DS_Store' || base === 'test-screenshots') return false;
      return true;
    }
  });
  console.log('✅ [Prepare Hosting] Copied public assets to .hosting_public');
} else {
  console.warn('⚠️ [Prepare Hosting] No public directory found');
}

// 3. Copy .next/static to .hosting_public/_next/static
const destStaticDir = path.join(HOSTING_DIR, '_next', 'static');
if (fs.existsSync(STATIC_DIR)) {
  fs.mkdirSync(path.dirname(destStaticDir), { recursive: true });
  fs.cpSync(STATIC_DIR, destStaticDir, { recursive: true });
  console.log('✅ [Prepare Hosting] Copied .next/static to .hosting_public/_next/static');
} else {
  console.error('❌ [Prepare Hosting] .next/static not found! Build may not have succeeded.');
  process.exit(1);
}

// 4. Verification and file count
function countFiles(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

const totalFiles = countFiles(HOSTING_DIR);
console.log(`✨ [Prepare Hosting] Static CDN bundle ready: ${totalFiles} files in .hosting_public`);

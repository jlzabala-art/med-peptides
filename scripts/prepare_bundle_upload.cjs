const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Migration Bundle Preparer
 * Prepares the production build and other configuration files for upload.
 */

const DIST_DIR = path.resolve(__dirname, '../dist');
const BUNDLE_DIR = path.resolve(__dirname, '../migration_bundle');

async function main() {
  console.log('🚀 Preparing migration bundle...');

  // 1. Ensure dist exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist directory not found. Please run npm run build first.');
    process.exit(1);
  }

  // 2. Create bundle directory
  if (fs.existsSync(BUNDLE_DIR)) {
    fs.rmSync(BUNDLE_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(BUNDLE_DIR);

  // 3. Copy dist contents
  console.log('📦 Copying web assets...');
  copyDirRecursiveSync(DIST_DIR, path.join(BUNDLE_DIR, 'public'));

  // 4. Copy Firebase config
  console.log('⚙️ Copying Firebase configurations...');
  fs.copyFileSync(path.join(__dirname, '../firebase.json'), path.join(BUNDLE_DIR, 'firebase.json'));
  fs.copyFileSync(path.join(__dirname, '../firestore.rules'), path.join(BUNDLE_DIR, 'firestore.rules'));
  fs.copyFileSync(path.join(__dirname, '../firestore.indexes.json'), path.join(BUNDLE_DIR, 'firestore.indexes.json'));

  // 5. Create a manifest
  const manifest = {
    projectName: 'Med-Peptides-app',
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    deploymentTarget: 'Firebase Hosting + Firestore'
  };
  fs.writeFileSync(path.join(BUNDLE_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log('✅ Bundle prepared at: ' + BUNDLE_DIR);
}

function copyDirRecursiveSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ?
      copyDirRecursiveSync(srcPath, destPath) :
      fs.copyFileSync(srcPath, destPath);
  }
}

main().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

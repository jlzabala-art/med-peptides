/**
 * optimize-deploy.mjs
 *
 * Supercharges Firebase Hosting deployments by:
 * 1. Patching firebase-tools webframeworks next utils to exclude .next/cache (2+ GB),
 *    dev artifacts, standalone directories, and redundant public assets.
 * 2. Pruning all compiler cache, development files, and unnecessary heavy packages
 *    from .firebase staging directories before packaging.
 * 3. Ensuring .gcloudignore is in place.
 *
 * Result: Upload payload drops from ~495 MB to ~40-60 MB.
 * Deploy time drops from 4-5 minutes to ~1 minute.
 */
import fs from 'fs';
import path from 'path';

console.log('🚀 [Optimize Deploy] Preparing fast deployment environment...');

// Step 1: Find and patch firebase-tools if available
function patchFirebaseTools() {
  const nextUtilsPaths = [
    '/Users/joseluiszabala/.npm-global/lib/node_modules/firebase-tools/lib/frameworks/next/utils.js',
    path.resolve('node_modules/firebase-tools/lib/frameworks/next/utils.js'),
  ];

  for (const filePath of nextUtilsPaths) {
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const searchRegex = /ignore:\s*\[\s*\(0,\s*path_1\.join\)\("cache",\s*"\*\*"[^\n]*\],/g;
        const robustReplacement = 'ignore: ["cache/**", "cache", "dev/**", "dev", "standalone/**", "standalone"],';

        if (searchRegex.test(content)) {
          content = content.replace(searchRegex, robustReplacement);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ [Optimize Deploy] Successfully enhanced next/utils.js glob ignore at:\n   ${filePath}`);
        } else if (content.includes(robustReplacement)) {
          console.log(`⚡ [Optimize Deploy] next/utils.js already optimized at:\n   ${filePath}`);
        }
      } catch (err) {
        console.warn(`⚠️ [Optimize Deploy] Could not patch ${filePath}: ${err.message}`);
      }
    }
  }

  // Patch next/index.js to avoid copying heavy public/ directory to Cloud Functions (served by Firebase Hosting CDN)
  const nextIndexPaths = [
    '/Users/joseluiszabala/.npm-global/lib/node_modules/firebase-tools/lib/frameworks/next/index.js',
    path.resolve('node_modules/firebase-tools/lib/frameworks/next/index.js'),
  ];

  for (const filePath of nextIndexPaths) {
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const target = 'await (0, fs_extra_1.copy)((0, path_1.join)(sourceDir, "public"), (0, path_1.join)(destDir, "public"));';
        const replacement = '// Public directory omitted from Cloud Functions payload - served by Hosting CDN\n        // await (0, fs_extra_1.copy)((0, path_1.join)(sourceDir, "public"), (0, path_1.join)(destDir, "public"));';

        if (content.includes(target)) {
          content = content.replace(target, replacement);
        }
        if (content.includes('(0, fs_extra_1.mkdirp)((0, path_1.join)(destDir, distDir)),')) {
          content = content.replace(
            '(0, fs_extra_1.mkdirp)((0, path_1.join)(destDir, distDir)),',
            '(0, fs_extra_1.emptyDir)((0, path_1.join)(destDir, distDir)),'
          );
        }
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ [Optimize Deploy] Successfully patched frameworks/next/index.js (public & emptyDir) at:\n   ${filePath}`);
      } catch (err) {
        console.warn(`⚠️ [Optimize Deploy] Could not patch ${filePath}: ${err.message}`);
      }
    }
  }

  // Patch prepareFunctionsUpload to ensure packageSource ignores .next/cache, public, and static assets
  const prepareUploadPaths = [
    '/Users/joseluiszabala/.npm-global/lib/node_modules/firebase-tools/lib/deploy/functions/prepareFunctionsUpload.js',
    path.resolve('node_modules/firebase-tools/lib/deploy/functions/prepareFunctionsUpload.js'),
  ];

  for (const filePath of prepareUploadPaths) {
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const searchRegex = /ignore\.push\(.*CONFIG_DEST_FILE\);/;
        const replacement = 'ignore.push("**/cache", "**/cache/**", "**/.next/cache", "**/.next/cache/**", "**/dev", "**/dev/**", "**/.next/dev", "**/.next/dev/**", "**/public", "**/public/**", "**/.next/static", "**/.next/static/**", "**/.next/standalone", "**/.next/standalone/**", "**/node_modules/typescript", "**/node_modules/typescript/**", "firebase-debug.log", "firebase-debug.*.log", CONFIG_DEST_FILE);';

        if (searchRegex.test(content) && !content.includes('"**/cache"')) {
          content = content.replace(searchRegex, replacement);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ [Optimize Deploy] Successfully enhanced prepareFunctionsUpload.js at:\n   ${filePath}`);
        } else if (content.includes('"**/cache"')) {
          console.log(`⚡ [Optimize Deploy] prepareFunctionsUpload.js already optimized with directory ignore rules at:\n   ${filePath}`);
        }
      } catch (err) {
        console.warn(`⚠️ [Optimize Deploy] Could not patch ${filePath}: ${err.message}`);
      }
    }
  }
}

// Step 2: Prune .firebase staging directories
function pruneDir(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'cache' && fullPath.includes('.next')) {
        console.log(`🧹 [Prune] Removed compiler cache: ${fullPath}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else if (entry.name === 'dev' && fullPath.includes('.next')) {
        console.log(`🧹 [Prune] Removed dev artifacts: ${fullPath}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else if (entry.name === 'standalone' && fullPath.includes('.next') && fullPath.includes('functions')) {
        console.log(`🧹 [Prune] Removed redundant standalone in functions: ${fullPath}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else if (entry.name === 'public' && fullPath.includes('functions')) {
        console.log(`🧹 [Prune] Removed redundant public dir in functions: ${fullPath}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else if (entry.name === 'static' && fullPath.includes('functions') && fullPath.includes('.next')) {
        console.log(`🧹 [Prune] Removed redundant static dir in functions: ${fullPath}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else if (entry.name === 'typescript' && fullPath.includes('node_modules') && fullPath.includes('functions')) {
        console.log(`🧹 [Prune] Removed typescript from functions node_modules: ${fullPath}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        pruneDir(fullPath);
      }
    }
  }

  // Ensure functions directories have a strict .gcloudignore
  if (dir.endsWith('functions') && fs.existsSync(dir)) {
    const gcloudIgnorePath = path.join(dir, '.gcloudignore');
    const ignoreContent = [
      '.gcloudignore',
      '.git',
      '.gitignore',
      'public/',
      '.next/static/',
      '.next/cache/',
      '.next/dev/',
      '.next/standalone/',
      'node_modules/typescript/',
      '*.log',
      '*.md'
    ].join('\n');
    fs.writeFileSync(gcloudIgnorePath, ignoreContent, 'utf8');
  }
}

// Step 3: Ensure root .gcloudignore exists
function ensureRootGcloudIgnore() {
  const rootIgnorePath = path.resolve('.gcloudignore');
  const content = [
    '.gcloudignore',
    '.git',
    '.gitignore',
    'node_modules/',
    '.next/cache/',
    '.next/dev/',
    '*.log',
    '*.md',
    '.firebase/*/functions/.next/cache/',
    '.firebase/*/functions/.next/dev/',
    '.firebase/*/functions/.next/standalone/',
    '.firebase/*/functions/public/'
  ].join('\n') + '\n';

  fs.writeFileSync(rootIgnorePath, content, 'utf8');
}

patchFirebaseTools();
ensureRootGcloudIgnore();
if (fs.existsSync(path.resolve('.firebase'))) {
  pruneDir(path.resolve('.firebase'));
}

console.log('✨ [Optimize Deploy] Ready for ultra-fast build & deploy!');

import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

async function build() {
  console.log("🚀 Starting Antigravity Esbuild Compiler...");
  
  // Clean dist
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Build React App
  await esbuild.build({
    entryPoints: ['src/main.jsx'],
    bundle: true,
    outdir: 'dist/assets',
    splitting: true,
    format: 'esm',
    minify: true,
    sourcemap: false,
    loader: { '.js': 'jsx', '.jsx': 'jsx', '.png': 'file', '.svg': 'file', '.css': 'css' },
    define: {
      'process.env.NODE_ENV': '"production"',
      'import.meta.env.VITE_FIREBASE_API_KEY': '"temp"',
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': '"temp"',
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': '"temp"',
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': '"temp"',
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': '"temp"',
      'import.meta.env.VITE_FIREBASE_APP_ID': '"temp"'
    }
  });

  // Inject into index.html
  let html = fs.readFileSync('index.html', 'utf8');
  html = html.replace(
    /<script type="module" src="\/src\/main\.jsx"><\/script>/,
    '<script type="module" src="/assets/main.js"></script>'
  );
  
  // Copy public folder to dist
  fs.cpSync('public', 'dist', { recursive: true });
  fs.writeFileSync('dist/index.html', html);
  
  console.log("✅ Build completed in milliseconds!");
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});

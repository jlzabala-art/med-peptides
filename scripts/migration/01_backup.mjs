/**
 * PHASE 1 — Full Backup (ESM)
 * Exports all products + variants subcollections to a timestamped JSON file.
 * Safe: read-only.
 *
 * Run: node scripts/migration/01_backup.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname }                 from 'path';
import { fileURLToPath }                 from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(join(__dirname, '../serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

async function backup() {
  console.log('📦 Starting backup…');
  const productsSnap = await db.collection('products').get();
  console.log(`  ↳ ${productsSnap.size} product documents found`);

  const allData = [];
  for (const doc of productsSnap.docs) {
    const variantsSnap = await doc.ref.collection('variants').get();
    const variants = variantsSnap.docs.map(v => ({ _id: v.id, ...v.data() }));
    allData.push({ _id: doc.id, _path: doc.ref.path, ...doc.data(), _variants: variants });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outFile   = join(__dirname, `backup_${timestamp}.json`);
  writeFileSync(outFile, JSON.stringify(allData, null, 2), 'utf8');

  const fileSizeKB = Math.round(statSync(outFile).size / 1024);
  console.log(`\n✅ Backup complete!`);
  console.log(`   File : ${outFile}`);
  console.log(`   Size : ${fileSizeKB} KB`);
  console.log(`   Docs : ${allData.length} products`);
  console.log(`   Vars : ${allData.reduce((s, p) => s + p._variants.length, 0)} variants`);
}

backup().catch(err => { console.error('❌ Backup failed:', err); process.exit(1); });

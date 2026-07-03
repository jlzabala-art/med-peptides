import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function inspectDoc() {
  const doc = await db.collection('protocols').doc('3GocJWVon5tKgOASM3it').get();
  const data = doc.data();
  console.log('Keys:', Object.keys(data));
  if (data.basic_info) console.log('basic_info.name:', data.basic_info.name);
  if (data.metadata) console.log('metadata.title:', data.metadata.title);
}

inspectDoc().catch(console.error);

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}) });
const db = getFirestore(app);

async function verify() {
  // Count by supplier
  const suppliers = {
    'OLlBbQjgrj6tY7GmM2Jo': 'Lotusland Limited',
    'supplier-bioniq':       'Bioniq',
    'supplier-nplabs':       'NP Labs',
    'supplier-magenta':      'Magenta',
    'uYkzfFcs3s6YYBr0OFQP': 'Fagron',
  };

  console.log('\n=== PRODUCT COUNTS BY SUPPLIER ===');
  for (const [id, name] of Object.entries(suppliers)) {
    const snap = await db.collection('products').where('supplierId', '==', id).get();
    console.log(`  ${name.padEnd(20)}: ${snap.size} docs`);
  }

  // Show one Bioniq sample
  const sample = await db.collection('products')
    .where('supplierId', '==', 'supplier-bioniq')
    .limit(1)
    .get();
  
  console.log('\n=== SAMPLE BIONIQ PRODUCT ===');
  const data = sample.docs[0].data();
  console.log({
    id:          sample.docs[0].id,
    name:        data.name,
    presentation: data.presentation,
    strength:    data.strength,
    retail_EUR:  data.canonical_price_eur,
    retail_AED:  data.canonical_price_aed,
    tiers:       data.pricing_tiers?.length + ' tiers',
    supplierId:  data.supplierId,
    supplierName: data.supplierName,
    status:      data.status,
    source:      data.source,
  });
}

verify().catch(console.error);

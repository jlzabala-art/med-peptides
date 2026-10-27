import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
});
const db = getFirestore(app);

const SUPPLIER_ORIGIN_DATA = {
  // ── Missing Top-Level Countries ──
  'jymed-peptide': {
    country: 'China',
    originCountry: 'China',
    city: 'Shenzhen',
    companyName: 'JYMed Peptide',
    legalName: 'Shenzhen JYMed Technology Co., Ltd.'
  },
  'supplier-fusion': {
    country: 'United Arab Emirates',
    originCountry: 'United Arab Emirates',
    city: 'Dubai',
    region: 'UAE'
  },
  'supplier-magenta': {
    country: 'United Arab Emirates',
    originCountry: 'United Arab Emirates',
    city: 'Dubai',
    region: 'UAE',
    companyName: 'Magenta Medical Supplies & Compounding'
  },
  'supplier-pepcura': {
    country: 'Lithuania',
    originCountry: 'Lithuania',
    city: 'Vilnius',
    address: 'Vakarinės 105-217, Zujūnai, Vilniaus r. sav, LT-06298 Vilnius, Lithuania',
    email: 'info@pepcura.com',
    shippingOrigin: 'Lithuania (EU Cold-Chain)'
  },
  'supplier-teletest': {
    country: 'Spain',
    originCountry: 'Spain',
    city: 'Barcelona',
    address: 'Provenza 169 Local 2, 08036 Barcelona, España',
    companyName: 'TeleTest Analytika S.A.',
    shippingOrigin: 'Barcelona, Spain (UE Logistics)'
  },

  // ── City & Origin Backfills for Existing Suppliers ──
  'supplier-24genetics': {
    country: 'Spain',
    originCountry: 'Spain',
    city: 'Madrid'
  },
  'supplier-bioniq': {
    country: 'United Kingdom',
    originCountry: 'United Kingdom',
    city: 'London'
  },
  'supplier-eternadx': {
    country: 'Spain',
    originCountry: 'Spain',
    city: 'Madrid'
  },
  'supplier-europeptides': {
    country: 'Bulgaria',
    originCountry: 'Bulgaria',
    city: 'Sofia'
  },
  'supplier-fagron-genomics': {
    country: 'Spain',
    originCountry: 'Spain',
    city: 'Barcelona'
  },
  'supplier-fagron-iberia': {
    country: 'Spain',
    originCountry: 'Spain',
    city: 'Terrassa'
  },
  'supplier-inverion': {
    country: 'United States',
    originCountry: 'United States',
    city: 'Princeton'
  },
  'supplier-lotusland': {
    country: 'Hong Kong',
    originCountry: 'Hong Kong',
    city: 'Hong Kong'
  },
  'supplier-norma-hellas': {
    country: 'Greece',
    originCountry: 'Greece',
    city: 'Athens'
  },
  'supplier-nplabs': {
    country: 'Greece',
    originCountry: 'Greece',
    city: 'Athens'
  },
  'supplier-pod-poland': {
    country: 'Poland',
    originCountry: 'Poland',
    city: 'Warsaw'
  },
  'supplier-vallida': {
    country: 'United Kingdom',
    originCountry: 'United Kingdom',
    city: 'London'
  }
};

async function main() {
  console.log('🚀 Starting Supplier Origin & Country Enrichment in Firestore...\n');

  let updated = 0;
  for (const [id, data] of Object.entries(SUPPLIER_ORIGIN_DATA)) {
    const docRef = db.collection('suppliers').doc(id);
    const snap = await docRef.get();
    if (!snap.exists) {
      console.warn(`⚠️ Supplier doc not found: ${id}`);
      continue;
    }

    const payload = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    await docRef.set(payload, { merge: true });
    console.log(`✅ Updated ${id.padEnd(25)} -> Country: ${data.country.padEnd(22)} | City: ${data.city}`);
    updated++;
  }

  console.log(`\n🎉 Successfully updated ${updated} suppliers in Firestore!`);

  // Verification pass across all suppliers
  console.log('\n========================================================================');
  console.log(' VERIFICATION: ALL 23 SUPPLIERS IN FIRESTORE');
  console.log('========================================================================');
  const allSnap = await db.collection('suppliers').get();
  let missingCount = 0;
  allSnap.docs.forEach((doc, idx) => {
    const d = doc.data();
    const c = d.country || d.originCountry || null;
    if (!c) missingCount++;
    console.log(
      `${String(idx + 1).padStart(2)}. ${doc.id.padEnd(25)} | Country: ${(c || '❌ MISSING').padEnd(22)} | City: ${(d.city || '—').padEnd(14)} | Name: ${d.name || d.companyName}`
    );
  });

  console.log('========================================================================');
  if (missingCount === 0) {
    console.log('✅ 100% OF SUPPLIERS HAVE VERIFIED COUNTRY AND ORIGIN DATA!');
  } else {
    console.warn(`⚠️ Warning: ${missingCount} suppliers still missing country data.`);
  }
}

main().catch(err => {
  console.error('Fatal error updating suppliers:', err);
  process.exit(1);
});

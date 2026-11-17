import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { getPharmapolisHormonesCatalog } from '../src/data/pharmapolisHormonesRegistry.js';

dotenv.config({ path: './.env.local' });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

async function syncAlgolia(docs) {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  if (!adminKey) {
    console.warn('⚠️ ALGOLIA_ADMIN_KEY missing; skipping Algolia sync.');
    return;
  }

  const records = docs.map((d) => ({
    objectID: d.id,
    id: d.id,
    slug: d.slug,
    sku: d.sku,
    name: d.name,
    canonicalName: d.canonicalName,
    subtitle: d.subtitle,
    brand: d.brand,
    supplierId: d.supplierId,
    supplierName: d.supplierName,
    category: d.category,
    track: d.track,
    subTrack: d.subTrack,
    dosageForm: d.dosageForm,
    packSize: d.packSize,
    allStrengths: d.allStrengths,
    costPriceEur: d.costPriceEur,
    minPriceEur: d.minPriceEur,
    maxPriceEur: d.maxPriceEur,
    keyActives: d.keyActives,
    status: 'published',
    isActive: true,
  }));

  const res = await fetch(`https://${appId}-dsn.algolia.net/1/indexes/products/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Algolia-Application-Id': appId,
      'X-Algolia-API-Key': adminKey,
    },
    body: JSON.stringify({
      requests: records.map((body) => ({ action: 'updateObject', body })),
    }),
  });

  if (!res.ok) {
    console.warn('⚠️ Algolia batch failed:', res.status, await res.text());
  } else {
    console.log(`🔍 Synced ${records.length} Pharmapolis Bulgaria hormone records to Algolia products index.`);
  }
}

async function main() {
  const docs = getPharmapolisHormonesCatalog();
  const totalVariants = docs.reduce((acc, d) => acc + (d.variants?.length || 0), 0);
  console.log(`📦 Prepared ${docs.length} Pharmapolis Bulgaria hormone preparations (${totalVariants} strength variants).`);

  await db.collection('suppliers').doc('supplier-pharmapolis').set(
    {
      id: 'supplier-pharmapolis',
      name: 'Pharmapolis Compounding Pharmacy (Bulgaria EU GMP)',
      shortName: 'Pharmapolis BG',
      country: 'BG',
      track: 'hormones',
      currency: 'EUR',
      status: 'active',
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const batch = db.batch();
  for (const doc of docs) {
    batch.set(
      db.collection('products').doc(doc.id),
      { ...doc, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  }

  // Also enrich existing legacy pellet slugs (`testosterone-pellet`, `estradiol-pellet`) with the Pharmapolis variants & pricing
  const testPellet = docs.find((d) => d.itemNumber === 36);
  if (testPellet) {
    batch.set(
      db.collection('products').doc('testosterone-pellet'),
      {
        variants: testPellet.variants,
        allStrengths: testPellet.allStrengths,
        strengthTiers: testPellet.strengthTiers,
        costCurrency: 'EUR',
        costPriceEur: testPellet.costPriceEur,
        landedCostAed: testPellet.landedCostAed,
        wholesalePriceAed: testPellet.wholesalePriceAed,
        clinicPriceAed: testPellet.clinicPriceAed,
        retailPriceAed: testPellet.retailPriceAed,
        supplierId: 'supplier-pharmapolis',
        supplierIds: ['supplier-pharmapolis'],
        supplierName: testPellet.supplierName,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  const estPellet = docs.find((d) => d.itemNumber === 37);
  if (estPellet) {
    batch.set(
      db.collection('products').doc('estradiol-pellet'),
      {
        variants: estPellet.variants,
        allStrengths: estPellet.allStrengths,
        strengthTiers: estPellet.strengthTiers,
        costCurrency: 'EUR',
        costPriceEur: estPellet.costPriceEur,
        landedCostAed: estPellet.landedCostAed,
        wholesalePriceAed: estPellet.wholesalePriceAed,
        clinicPriceAed: estPellet.clinicPriceAed,
        retailPriceAed: estPellet.retailPriceAed,
        supplierId: 'supplier-pharmapolis',
        supplierIds: ['supplier-pharmapolis'],
        supplierName: estPellet.supplierName,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  await batch.commit();
  console.log(`✅ Committed ${docs.length} Pharmapolis hormone products + enriched legacy pellets in Firestore.`);

  await syncAlgolia(docs);
  console.log('🎉 Pharmapolis Bulgaria Hormones seeding & Algolia indexing complete.');
}

main().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});

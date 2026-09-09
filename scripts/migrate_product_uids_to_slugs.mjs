import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

if (!getApps().length) {
  let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
  if (rawPk.startsWith('"') && rawPk.endsWith('"')) {
    rawPk = rawPk.slice(1, -1);
  }
  const privateKey = rawPk ? rawPk.replace(/\\n/g, '\n') : undefined;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'med-peptides-app';

  if (privateKey && clientEmail) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId
    });
  } else {
    initializeApp({ projectId });
  }
}

const db = getFirestore();

const MIGRATIONS = [
  {
    oldId: 'X4MewF5DvT4geirg12cc',
    newId: 'ldn-low-dose-naltrexone',
    isDuplicate: false,
    name: 'LDN (Low Dose Naltrexone)'
  },
  {
    oldId: 'XZGvCekvmuElDd7Ng8J4',
    newId: 'lidocaine-usp',
    isDuplicate: false,
    name: 'Lidocaine USP'
  },
  {
    oldId: 'aHB3CfYujZC70iRstVCL',
    newId: 'serrapeptase',
    isDuplicate: false,
    name: 'Serrapeptase'
  },
  {
    oldId: 'ayaRAyGlEW4uIMjRLkeK',
    newId: 'methylene-blue',
    isDuplicate: false,
    name: 'Methylene Blue'
  },
  {
    oldId: 'cxyeyu115JOlt0jjc9WI',
    newId: 'glutamine-bromelain',
    isDuplicate: false,
    name: 'Glutamine + Bromelain'
  },
  {
    oldId: 'e9URhAeNH7ygDWzvrf83',
    newId: 'insulin-syringes-1-2-ml-31g-x-8-mm-100-counts',
    isDuplicate: false,
    name: 'Insulin Syringes 1/2 ml - 31g x 8 mm 100 Counts'
  },
  {
    oldId: 'mnC4cUo9TJ8w75nIPVlB',
    newId: 'benzocaine-usp',
    isDuplicate: false,
    name: 'Benzocaine USP'
  },
  {
    oldId: 'ocWLQtrYqX9Paap9dsvz',
    newId: 'vitamin-d3-k2',
    isDuplicate: false,
    name: 'Vitamin D3 + K2'
  },
  {
    oldId: 'Rq4ZgXzSvabNjIvoxiO1',
    newId: 'alpha-lipoic-acid',
    isDuplicate: true,
    name: 'Alpha Lipoic Acid'
  },
  {
    oldId: 'kqzOAJx7dyCEcafbCej4',
    newId: 'vitamin-d3',
    isDuplicate: true,
    name: 'Vitamin D3'
  }
];

async function runMigration() {
  console.log('🚀 Starting migration of 10 auto-generated UIDs to canonical slugs in Firestore...\n');

  for (const item of MIGRATIONS) {
    console.log(`Processing [${item.oldId}] -> target [${item.newId}] (${item.name})...`);
    const oldDocRef = db.collection('products').doc(item.oldId);
    const oldSnap = await oldDocRef.get();

    if (!oldSnap.exists) {
      console.log(`  ⚠️ Old doc ${item.oldId} does not exist, skipping.`);
      continue;
    }

    const oldData = oldSnap.data();
    const oldVariantsSnap = await oldDocRef.collection('variants').get();
    const targetDocRef = db.collection('products').doc(item.newId);
    const targetSnap = await targetDocRef.get();

    if (item.isDuplicate && targetSnap.exists) {
      // MERGE INTO EXISTING CANONICAL DOC
      console.log(`  Merging variants from ${item.oldId} into existing canonical ${item.newId}...`);
      const targetData = targetSnap.data();

      // Copy subcollection variants
      for (const vDoc of oldVariantsSnap.docs) {
        const vData = vDoc.data();
        await targetDocRef.collection('variants').doc(vDoc.id).set({
          ...vData,
          productId: item.newId,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      // Merge array variants if present
      const existingArrayVariants = Array.isArray(targetData.variants) ? targetData.variants : [];
      const oldArrayVariants = Array.isArray(oldData.variants) ? oldData.variants : [];
      const combinedVariants = [...existingArrayVariants];

      for (const ov of oldArrayVariants) {
        const exists = combinedVariants.some(ev => ev.id === ov.id || (ev.dose === ov.dose && ev.price === ov.price));
        if (!exists) {
          combinedVariants.push({
            ...ov,
            productId: item.newId
          });
        }
      }

      await targetDocRef.set({
        variants: combinedVariants,
        variantsCount: Math.max(combinedVariants.length, (await targetDocRef.collection('variants').get()).size),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Clean up old subcollection & old doc
      for (const vDoc of oldVariantsSnap.docs) {
        await vDoc.ref.delete();
      }
      await oldDocRef.delete();
      console.log(`  ✔ Merged and deleted old UID doc ${item.oldId}`);
    } else {
      // MIGRATE FRESH TO NEW CANONICAL SLUG DOC
      console.log(`  Writing new canonical product document: ${item.newId}...`);
      const updatedData = {
        ...oldData,
        id: item.newId,
        slug: item.newId,
        canonicalSlug: item.newId,
        migratedFromUid: item.oldId,
        updatedAt: new Date().toISOString()
      };

      if (Array.isArray(updatedData.variants)) {
        updatedData.variants = updatedData.variants.map(v => ({
          ...v,
          productId: item.newId
        }));
      }

      await targetDocRef.set(updatedData);

      // Copy subcollection variants
      for (const vDoc of oldVariantsSnap.docs) {
        const vData = vDoc.data();
        await targetDocRef.collection('variants').doc(vDoc.id).set({
          ...vData,
          productId: item.newId,
          updatedAt: new Date().toISOString()
        });
      }

      // Clean up old subcollection & doc
      for (const vDoc of oldVariantsSnap.docs) {
        await vDoc.ref.delete();
      }
      await oldDocRef.delete();
      console.log(`  ✔ Successfully migrated and deleted old UID doc ${item.oldId}`);
    }
  }

  console.log('\n🔍 Verifying database state post-migration...');
  const verifySnap = await db.collection('products').get();
  let remainingUids = 0;
  for (const d of verifySnap.docs) {
    if (/^[A-Za-z0-9]{20}$/.test(d.id) && !d.id.includes('-')) {
      remainingUids++;
      console.log(`  Remaining UID found: ${d.id} (${d.data().name})`);
    }
  }

  console.log(`\n🎉 Verification complete. Total products: ${verifySnap.size}. Remaining UIDs: ${remainingUids}`);
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

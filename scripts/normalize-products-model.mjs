import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = path.resolve('src/scripts/serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

async function run() {
  const snap = await db.collection('products').limit(500).get();
  console.log(`Auditing ${snap.size} products in Firestore...`);

  let updatedCount = 0;
  let batch = db.batch();
  let opsInBatch = 0;

  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const patch = {};

    // 1. Normalize status (Rule #28: products use 'published', not 'active')
    if (!d.status || d.status === 'active') {
      patch.status = 'published';
    }

    // 2. Ensure categoryId
    if (!d.categoryId && (d.category || d.type)) {
      patch.categoryId = String(d.category || d.type).toLowerCase().replace(/\s+/g, '-');
    }

    // 3. Ensure unified pricing object & consistent currency
    const rootCur = d.pricing?.currency || d.currency || d.origCurrency || 'USD';
    const baseCost = Number(
      d.pricing?.masterPrice ??
      d.pricing?.master?.perUnit ??
      d.cost ??
      d.costPrice ??
      d.variants?.[0]?.pricing?.master?.perUnit ??
      d.variants?.[0]?.costPrice ??
      d.unit_price ??
      d.price ??
      0
    );

    if (!d.pricing && baseCost > 0) {
      const masterPrice = round2(baseCost);
      const mediluxePrice = round2(masterPrice * 1.15);
      const wholesalePrice = round2(mediluxePrice * 1.15);
      patch.pricing = {
        masterPrice,
        mediluxePrice,
        wholesalePrice,
        currency: rootCur
      };
    } else if (d.pricing && !d.pricing.currency) {
      patch['pricing.currency'] = rootCur;
    }

    // 4. Align variants[0] currency with rootCur to eliminate mismatches
    if (Array.isArray(d.variants) && d.variants.length > 0) {
      const v0 = d.variants[0];
      const vCur = v0?.pricing?.master?.currency || v0?.currency;
      if (vCur && vCur !== rootCur) {
        const nextVariants = [...d.variants];
        nextVariants[0] = {
          ...v0,
          currency: rootCur,
          ...(v0.pricing ? {
            pricing: {
              ...v0.pricing,
              ...(v0.pricing.master ? { master: { ...v0.pricing.master, currency: rootCur } } : {}),
              ...(v0.pricing.wholesale ? { wholesale: { ...v0.pricing.wholesale, currency: rootCur } } : {})
            }
          } : {})
        };
        patch.variants = nextVariants;
      }
    }

    if (Object.keys(patch).length > 0) {
      patch.updatedAt = new Date().toISOString();
      batch.update(doc.ref, patch);
      opsInBatch++;
      updatedCount++;

      if (opsInBatch >= 400) {
        await batch.commit();
        batch = db.batch();
        opsInBatch = 0;
      }
    }
  }

  if (opsInBatch > 0) {
    await batch.commit();
  }

  console.log(`✓ Normalized ${updatedCount} / ${snap.size} products in Firestore.`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Normalization error:', err);
  process.exit(1);
});

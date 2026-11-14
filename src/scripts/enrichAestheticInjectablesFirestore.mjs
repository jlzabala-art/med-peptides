/**
 * src/scripts/enrichAestheticInjectablesFirestore.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Enriches all Aesthetic Injectable documents in Firestore `/products` with
 * IFU-grounded clinical, rheological, usage/protocol, safety, regulatory,
 * and imageUrl metadata from `aestheticInjectablesEnrichment.js`.
 *
 * Run:
 *   node src/scripts/enrichAestheticInjectablesFirestore.mjs
 */

import dotenv from 'dotenv';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  getInjectableMonograph,
  getInjectableImageUrl,
  isKnownInjectableSlug,
} from '../data/aestheticInjectablesEnrichment.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

function initAdmin() {
  if (getApps().length > 0) return getApps()[0];
  let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
  if (rawPk.startsWith('"') && rawPk.endsWith('"')) rawPk = rawPk.slice(1, -1);
  const privateKey = rawPk ? rawPk.replace(/\\n/g, '\n') : undefined;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    'med-peptides-app';

  if (privateKey && clientEmail) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
  }
  return null;
}

const app = initAdmin();
if (!app) {
  console.error('❌ Firebase Admin could not initialize (missing credentials).');
  process.exit(1);
}

const db = getFirestore(app);

async function main() {
  const [snap1, snap2] = await Promise.all([
    db.collection('products').where('is_aesthetic_injectable', '==', true).get(),
    db.collection('products').where('primaryType', '==', 'aesthetic_injectable').get(),
  ]);

  const docsMap = new Map();
  snap1.forEach((d) => docsMap.set(d.id, d));
  snap2.forEach((d) => docsMap.set(d.id, d));

  console.log(`Found ${docsMap.size} aesthetic injectable documents in Firestore.`);

  let batch = db.batch();
  let batchCount = 0;
  let updated = 0;
  let skipped = 0;

  for (const [docId, docSnap] of docsMap.entries()) {
    const data = docSnap.data();
    const slug = data.slug || docId;
    const monograph = getInjectableMonograph(slug, data);

    if (!monograph && !isKnownInjectableSlug(slug)) {
      skipped++;
      console.log(`  ⚠️  No monograph mapping for ${docId} (${data.name || data.displayName})`);
      continue;
    }

    const imageUrl = getInjectableImageUrl(slug, data);
    const updatePayload = {
      is_aesthetic_injectable: true,
      primaryType: 'aesthetic_injectable',
      category_taxonomy: 'Aesthetic Injectables',
      manufacturer: monograph.manufacturer,
      originCountry: monograph.originCountry,
      technology: monograph.platformTechnology,
      active_ingredient: monograph.activeIngredient,
      packSize: monograph.packSize,
      needlesIncluded: monograph.needlesIncluded,
      injectionDepth: monograph.injectionDepth,
      injectionTechnique: monograph.injectionTechnique,
      longevity: monograph.longevity,
      treatment_areas: monograph.treatmentAreas,
      indication: monograph.indications.join('; '),
      indications: monograph.indications,
      description: monograph.clinicalOverview.en,
      description_es: monograph.clinicalOverview.es,
      mechanismOfAction: monograph.mechanismOfAction,
      rheology: monograph.rheology,
      clinicalProtocol: monograph.clinicalProtocol,
      contraindications: monograph.contraindications,
      expectedReactions: monograph.expectedReactions,
      regulatoryProfile: monograph.regulatory,
      ...(imageUrl ? { imageUrl, image: imageUrl } : {}),
      clinicalEnrichedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    batch.set(docSnap.ref, updatePayload, { merge: true });
    batchCount++;
    updated++;

    if (batchCount >= 400) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✅ Enriched ${updated} aesthetic injectable documents in Firestore (${skipped} skipped).`);
}

main().catch((err) => {
  console.error('❌ Enrichment failed:', err);
  process.exit(1);
});

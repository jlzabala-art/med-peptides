/**
 * scripts/regularizeAllProtocolsSSOT.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal SSOT Normalizer & Clinical Benchmark Enricher for ALL Firestore Protocols.
 * 
 * Ensures:
 * 1. 100% of protocols have clean, unique `slug` and `protocol_slug` fields.
 * 2. 100% of protocols have `active: true` and `status: 'active'`.
 * 3. 100% of protocols have normalized `durationWeeks` and `duration`.
 * 4. All phases contain clinically validated compound dosages, frequencies, and routes.
 * 5. Guarantees complete consistency across Public Protocol Pages, Collection Pages,
 *    and Product Datasheet Reconstitution Consoles.
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { resolveClinicalCompoundDose, matchClinicalBenchmark } from '../src/utils/clinicalDosingEngine.js';

dotenv.config({ path: '.env.local' });

let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
if (rawPk.startsWith('"') && rawPk.endsWith('"')) rawPk = rawPk.slice(1, -1);
const privateKey = rawPk ? rawPk.replace(/\\n/g, '\n') : undefined;

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey
  })
});

const db = admin.firestore();

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function regularizeAllProtocols() {
  console.log('🚀 Starting Universal Protocol SSOT Regularization...');
  
  const snap = await db.collection('protocols').get();
  console.log(`📦 Found ${snap.size} protocols in Firestore.`);

  const usedSlugs = new Set();
  const updates = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    const docId = doc.id;
    const name = data.name || data.title || data.protocol_name || docId;

    // 1. Resolve canonical slug
    let chosenSlug = data.slug || data.protocol_slug;
    if (!chosenSlug || chosenSlug === 'undefined' || chosenSlug.length < 3) {
      if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(docId)) {
        chosenSlug = docId;
      } else {
        chosenSlug = slugify(name);
      }
    } else {
      chosenSlug = slugify(chosenSlug);
    }

    // Ensure uniqueness
    let finalSlug = chosenSlug;
    let counter = 1;
    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${chosenSlug}-${counter}`;
      counter++;
    }
    usedSlugs.add(finalSlug);

    // 2. Resolve phases
    let rawPhases = Array.isArray(data.phases) && data.phases.length > 0 
      ? data.phases 
      : (Array.isArray(data.phase_blueprints) ? data.phase_blueprints : []);

    if (rawPhases.length === 0) {
      // Default single phase for monotherapy or simple protocol
      rawPhases = [{
        id: 'phase_1',
        name: 'Active Protocol Cycle',
        durationWeeks: Number(data.durationWeeks || data.duration_weeks) || 8,
        objective: data.clinicalRationale || data.description || 'Clinical administration cycle.',
        compounds: Array.isArray(data.peptides) ? data.peptides : []
      }];
    }

    const totalPhases = rawPhases.length;
    let computedDurationWeeks = 0;

    const normalizedPhases = rawPhases.map((ph, pIdx) => {
      const pDuration = Number(ph.durationWeeks || ph.duration_weeks || ph.default_duration_weeks) || 4;
      computedDurationWeeks += pDuration;

      const rawCompounds = [
        ...(Array.isArray(ph.compounds) ? ph.compounds : []),
        ...(Array.isArray(ph.items) ? ph.items : []),
        ...(Array.isArray(ph.drugs) ? ph.drugs : []),
        ...(Array.isArray(ph.drugs_used) ? ph.drugs_used : [])
      ];

      // Deduplicate compounds by name
      const seenCompounds = new Set();
      const normalizedCompounds = [];

      rawCompounds.forEach((c) => {
        const cName = c.name || c.product_name || c.title || c.product_title || name;
        const cleanKey = String(cName).toLowerCase().replace(/[^a-z0-9]/g, '');
        if (seenCompounds.has(cleanKey)) return;
        seenCompounds.add(cleanKey);

        const clinical = resolveClinicalCompoundDose(c, ph, pIdx, totalPhases, cName);
        const bm = matchClinicalBenchmark(cName);

        normalizedCompounds.push({
          id: c.id || c.productId || cleanKey,
          name: clinical.compoundName || cName,
          product_name: clinical.compoundName || cName,
          dosage: clinical.unitDose,
          dose: `${clinical.unitDose} ${clinical.shortCadence}`,
          unit: clinical.doseUnit,
          frequency: c.frequency || (bm?.cadence) || `${clinical.shortCadence} Subcutaneous`,
          route: c.route || bm?.route || 'Subcutaneous',
          timing: c.timing || bm?.timing || 'As directed by physician',
          storage: c.storage || bm?.storage || 'Refrigerate at 2°C – 8°C (Do Not Freeze).'
        });
      });

      return {
        id: ph.id || `phase_${pIdx + 1}`,
        name: ph.name || ph.phase_title || `Phase ${pIdx + 1}`,
        durationWeeks: pDuration,
        objective: ph.objective || ph.clinical_goal || 'Phase administration checkpoint.',
        compounds: normalizedCompounds
      };
    });

    const finalDurationWeeks = Number(data.durationWeeks || data.duration_weeks) || computedDurationWeeks || 8;

    const updatePayload = {
      slug: finalSlug,
      protocol_slug: finalSlug,
      status: 'active',
      active: true,
      durationWeeks: finalDurationWeeks,
      duration: `${finalDurationWeeks} Weeks`,
      phases: normalizedPhases,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    updates.push({ docId, name, slug: finalSlug, updatePayload });
  }

  // Execute in batches of 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = updates.slice(i, i + BATCH_SIZE);
    chunk.forEach(({ docId, updatePayload }) => {
      const ref = db.collection('protocols').doc(docId);
      batch.update(ref, updatePayload);
    });
    await batch.commit();
    console.log(`✅ Committed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(updates.length / BATCH_SIZE)} (${chunk.length} protocols)`);
  }

  console.log(`\n🎉 Successfully regularized ${updates.length} protocols in Firestore!`);
  console.log('Sample updated records:');
  updates.slice(0, 8).forEach(u => {
    console.log(`- [${u.docId}] "${u.name}" -> /proto/${u.slug} (${u.updatePayload.durationWeeks}w, ${u.updatePayload.phases.length} phases)`);
  });
  
  process.exit(0);
}

regularizeAllProtocols().catch(err => {
  console.error('❌ Error during protocol regularization:', err);
  process.exit(1);
});

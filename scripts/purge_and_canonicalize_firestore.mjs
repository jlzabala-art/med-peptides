import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./src/scripts/serviceAccountKey.json', 'utf8'));
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

const APPLY = process.argv.includes('--apply');

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function purgeAndCanonicalize() {
  console.log('====================================================================');
  console.log('   PURGING FIRESTORE TO STRICT CANONICAL DATA MODEL (ZERO MAPPINGS)');
  console.log(`   MODE: ${APPLY ? '🚀 LIVE WRITE (PERMANENT PURGE)' : '🛡️ DRY RUN (PREVIEW ONLY)'}`);
  console.log('====================================================================\n');

  // ── 1. PROTOCOLS ──────────────────────────────────────────────────────────
  console.log('--- Step 1: Processing Protocols (Strict Canonical Model) ---');
  const protoSnap = await db.collection('protocols').get();
  console.log(`Auditing ${protoSnap.size} protocols...`);

  const protocolCleanDocs = [];

  for (const doc of protoSnap.docs) {
    const d = doc.data();
    const id = doc.id;

    const name = d.name || d.protocol_name || d.title || 'Therapeutic Protocol';
    const slug = d.slug || d.protocol_slug || slugify(name);
    const categoryId = d.categoryId || d.category || 'peptide';
    const goals = Array.isArray(d.goals) && d.goals.length > 0 
      ? d.goals 
      : [d.goal || d.primary_goal || 'General Health'];
    
    const validStatuses = new Set(['draft', 'active', 'paused', 'archived']);
    const status = validStatuses.has(d.status) ? d.status : 'active';

    const dur = Number(d.duration_weeks || d.durationWeeks || (d.duration ? parseInt(d.duration) : 8)) || 8;

    const rawPhases = Array.isArray(d.phases) && d.phases.length > 0
      ? d.phases
      : (Array.isArray(d.phase_blueprints) ? d.phase_blueprints : []);

    let weekCursor = 1;
    const canonicalPhases = rawPhases.map((ph, pIdx) => {
      const pNum = ph.phase_number || ph.phaseNumber || (pIdx + 1);
      const pName = ph.name || ph.phase_name || ph.phaseName || ph.phase_title || `Phase ${pNum}`;
      const durWeeks = Number(ph.duration_weeks || ph.durationWeeks || ph.default_duration_weeks) || 4;
      const startWeek = ph.start_week != null ? Number(ph.start_week) : (ph.startWeek != null ? Number(ph.startWeek) : weekCursor);
      const endWeek = ph.end_week != null ? Number(ph.end_week) : (ph.endWeek != null ? Number(ph.endWeek) : (startWeek + durWeeks - 1));
      weekCursor = endWeek + 1;

      const rawCompounds = ph.compounds || ph.drugs || ph.medications || [];
      const compounds = rawCompounds.map((c, cIdx) => {
        const cId = c.id || c.productId || c.product_slug || `compound_${cIdx + 1}`;
        const cName = c.name || c.product_name || c.compound || c.product_title || 'Compound';
        const doseAmt = c.doseAmount != null ? Number(c.doseAmount) : (c.dose_amount != null ? Number(c.dose_amount) : (c.dose ? parseFloat(c.dose) : null));
        const doseUnit = c.doseUnit || c.dose_unit || 'mg';
        const dosage = c.dosage || (doseAmt != null ? `${doseAmt} ${doseUnit}` : 'Active');
        const freq = c.frequency || c.dosing_frequency || 'Weekly';
        const freqTimes = c.frequencyTimesPerWeek != null ? Number(c.frequencyTimesPerWeek) : (freq.toLowerCase().includes('daily') ? 7 : 1);
        const weeklyDose = c.weeklyDose || c.weekly_dose || (doseAmt != null ? `${doseAmt * freqTimes} ${doseUnit}/wk` : 'Active');
        const route = c.route || 'Subcutaneous';
        const timing = c.timing || 'Morning on empty stomach';
        const storage = c.storage || 'Refrigerate at 2°C – 8°C strictly post-reconstitution.';
        const reconstitution = c.reconstitution || null;
        const clinicalNotes = c.clinicalNotes || c.notes || '';
        const catalogRef = c.catalogRef || { productId: cId };

        return {
          id: cId,
          name: cName,
          dosage,
          doseAmount: doseAmt,
          doseUnit,
          frequency: freq,
          frequencyTimesPerWeek: freqTimes,
          weeklyDose,
          route,
          timing,
          storage,
          reconstitution,
          clinicalNotes,
          catalogRef
        };
      });

      return {
        id: ph.id || `phase_${pNum}`,
        name: pName,
        phase_number: pNum,
        start_week: startWeek,
        end_week: endWeek,
        duration_weeks: durWeeks,
        clinical_goal: ph.clinical_goal || ph.objective || '',
        instructions: ph.instructions || '',
        compounds
      };
    });

    const cleanProtocol = {
      id,
      name,
      slug,
      categoryId,
      goals,
      status,
      duration_weeks: dur,
      overview_summary: d.overview_summary || d.summary || d.description || '',
      description: d.description || d.overview_summary || '',
      clinical_rationale: d.clinical_rationale || d.clinicalRationale || '',
      expected_outcomes: Array.isArray(d.expected_outcomes) ? d.expected_outcomes : (Array.isArray(d.expectedOutcomes) ? d.expectedOutcomes : []),
      contraindications: Array.isArray(d.contraindications) ? d.contraindications : [],
      required_labs: Array.isArray(d.required_labs) ? d.required_labs : (Array.isArray(d.requiredLabs) ? d.requiredLabs : []),
      monitoring_cadence: d.monitoring_cadence || d.monitoringPlan || '',
      check_in_weeks: d.check_in_weeks || null,
      evidence_level: d.evidence_level || d.evidenceGrade || d.evidence_grade || 'Tier 2 - Clinical Consensus',
      target_audience: d.target_audience || 'Clinical and Healthcare Professionals',
      tags: Array.isArray(d.tags) ? d.tags : [],
      phases: canonicalPhases,
      bom: Array.isArray(d.bom) ? d.bom : [],
      _schemaVersion: 1,
      updatedAt: new Date().toISOString()
    };

    protocolCleanDocs.push({ id, ref: doc.ref, cleanData: cleanProtocol, oldKeysCount: Object.keys(d).length, newKeysCount: Object.keys(cleanProtocol).length });
  }

  console.log(`Protocols to clean: ${protocolCleanDocs.length}`);
  const avgOldKeys = (protocolCleanDocs.reduce((acc, p) => acc + p.oldOldKeysCount || p.oldKeysCount, 0) / protocolCleanDocs.length).toFixed(1);
  const avgNewKeys = (protocolCleanDocs.reduce((acc, p) => acc + p.newKeysCount, 0) / protocolCleanDocs.length).toFixed(1);
  console.log(`Protocol fields reduction: from avg ${avgOldKeys} keys down to strictly ${avgNewKeys} canonical keys!`);

  // ── 2. PRODUCTS ───────────────────────────────────────────────────────────
  console.log('\n--- Step 2: Processing Products (Purging Duplicate Keys) ---');
  const prodSnap = await db.collection('products').get();
  console.log(`Auditing ${prodSnap.size} products...`);

  const productCleanDocs = [];
  for (const doc of prodSnap.docs) {
    const d = doc.data();
    const id = doc.id;

    // Fields to delete explicitly if present
    const fieldsToDelete = [
      'title', 'productType', 'category', 'primaryGoal', 'goal',
      'costPrice', 'retailPrice', 'wholesalePrice', 'clinicPrice', 'price',
      'priceUSD', 'msrp'
    ];

    const updates = {};
    let needsUpdate = false;

    // Remove legacy duplicate fields
    fieldsToDelete.forEach(f => {
      if (d[f] !== undefined) {
        updates[f] = db.FieldValue ? db.FieldValue.delete() : undefined;
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      productCleanDocs.push({ id, ref: doc.ref, fieldsRemoved: fieldsToDelete.filter(f => d[f] !== undefined) });
    }
  }

  console.log(`Products with legacy duplicate keys to purge: ${productCleanDocs.length}`);

  if (!APPLY) {
    console.log('\n====================================================');
    console.log('🛡️ DRY RUN COMPLETE. No data was modified.');
    console.log(`Sample protocol before/after:`);
    console.log(`ID: ${protocolCleanDocs[0].id}`);
    console.log(`Old Keys (${protocolCleanDocs[0].oldKeysCount}):`, Object.keys(protoSnap.docs[0].data()).slice(0, 15), '...');
    console.log(`New Canonical Keys (${protocolCleanDocs[0].newKeysCount}):`, Object.keys(protocolCleanDocs[0].cleanData));
    console.log('\nTo execute permanent purge on Firestore, run:');
    console.log('  node scripts/purge_and_canonicalize_firestore.mjs --apply');
    console.log('====================================================');
    process.exit(0);
  }

  // ── 3. APPLY PERMANENT PURGE ──────────────────────────────────────────────
  console.log('\n🚀 APPLYING PERMANENT CLEANSE TO FIRESTORE...');

  // 1. Overwrite all protocols with strictly canonical documents
  const BATCH_SIZE = 300;
  for (let i = 0; i < protocolCleanDocs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = protocolCleanDocs.slice(i, i + BATCH_SIZE);
    chunk.forEach(p => {
      batch.set(p.ref, p.cleanData); // .set completely replaces the document!
    });
    await batch.commit();
    console.log(`  Committed protocols batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} docs replaced)`);
  }

  // 2. Remove legacy duplicate fields from products
  const { FieldValue } = await import('firebase-admin/firestore');
  for (let i = 0; i < productCleanDocs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = productCleanDocs.slice(i, i + BATCH_SIZE);
    chunk.forEach(p => {
      const deletePayload = {};
      p.fieldsRemoved.forEach(f => {
        deletePayload[f] = FieldValue.delete();
      });
      deletePayload.updatedAt = new Date().toISOString();
      batch.update(p.ref, deletePayload);
    });
    await batch.commit();
    console.log(`  Committed products purge batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} docs purged)`);
  }

  // 3. Resync Facets
  console.log('\n--- Step 3: Resyncing _meta/catalog_facets ---');
  const freshProducts = await db.collection('products').get();
  const freshVariants = await db.collectionGroup('variants').get();
  const freshSuppliers = await db.collection('suppliers').get();

  const suppliersMap = {};
  freshSuppliers.forEach(d => {
    const s = d.data();
    suppliersMap[d.id] = s.companyName || s.name || s.displayName || d.id;
  });

  const categoriesCount = {};
  const goalsCount = {};
  const presentationsCount = {};
  const suppliersCount = {};

  freshProducts.forEach(d => {
    const p = d.data();
    if (p.categoryId) categoriesCount[p.categoryId] = (categoriesCount[p.categoryId] || 0) + 1;
    if (p.goals && Array.isArray(p.goals)) {
      p.goals.forEach(g => goalsCount[g] = (goalsCount[g] || 0) + 1);
    }
  });

  freshVariants.forEach(d => {
    const v = d.data();
    if (v.presentation) presentationsCount[v.presentation] = (presentationsCount[v.presentation] || 0) + 1;
    const sId = v.supplier_id || v.supplierId;
    if (sId) suppliersCount[sId] = (suppliersCount[sId] || 0) + 1;
  });

  const categories = Object.keys(categoriesCount).map(c => ({ id: c, name: c, count: categoriesCount[c] }));
  const goals = Object.keys(goalsCount).map(g => ({ id: g, name: g, count: goalsCount[g] }));
  const presentations = Object.keys(presentationsCount).map(p => ({ id: p, name: p, count: presentationsCount[p] }));
  const suppliers = Object.keys(suppliersCount).map(s => ({ id: s, name: suppliersMap[s] || s, count: suppliersCount[s] }));

  await db.collection('_meta').doc('catalog_facets').set({
    categories,
    goals,
    presentations,
    suppliers,
    totalProducts: freshProducts.size,
    totalVariants: freshVariants.size,
    updatedAt: new Date().toISOString()
  });

  console.log('✅ Facets resynced. Pure canonical database established.');
  console.log('🎉 ALL LEGACY MAPPINGS PURGED AT DATABASE LEVEL.');
  process.exit(0);
}

purgeAndCanonicalize().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

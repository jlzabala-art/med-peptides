import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import { KNOWN_CANONICAL_PEPTIDES } from '../src/utils/canonicalProductRegistry.js';
import { KNOWN_PEPTIDE_DATA } from '../src/utils/knownPeptideData.js';
import { CATEGORY_ALIASES, VALID_CATEGORIES } from '../src/constants/categoryTypes.js';

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

// Map alias or name to canonical peptide key
function findKnownPeptideKey(name, canonicalKey) {
  if (canonicalKey && KNOWN_PEPTIDE_DATA[canonicalKey.toLowerCase()]) {
    return canonicalKey.toLowerCase();
  }
  const cleanName = (name || '').toLowerCase().trim();
  for (const [key, data] of Object.entries(KNOWN_CANONICAL_PEPTIDES)) {
    if (data.aliases && data.aliases.some(a => cleanName.includes(a.toLowerCase()))) {
      return key;
    }
  }
  for (const key of Object.keys(KNOWN_PEPTIDE_DATA)) {
    if (cleanName.includes(key)) {
      return key;
    }
  }
  return null;
}

// Normalize type
function normalizeType(type) {
  if (!type) return 'finished_product';
  const t = type.toLowerCase().trim();
  if (t === 'raw_ingredient' || t === 'raw_api' || t === 'api_raw_material') return 'raw_material';
  if (t === 'supplement' || t === 'peptide' || t === 'hormone') return 'finished_product';
  if (t === 'consumable') return 'clinical_supplies';
  if (t === 'test_kit' || t === 'diagnostic_test') return 'diagnostic';
  const valid = ['finished_product', 'raw_material', 'clinical_supplies', 'diagnostic', 'iv_drip', 'dual', 'service', 'logistics_service'];
  return valid.includes(t) ? t : 'finished_product';
}

// Normalize category
function normalizeCategory(cat, type, name) {
  const c = (cat || '').toLowerCase().trim();
  if (CATEGORY_ALIASES[c]) {
    const resolved = CATEGORY_ALIASES[c];
    return resolved.toLowerCase();
  }
  if (c === 'consumable') return 'clinical_supplies';
  if (c === 'compounding_material') return 'raw_material';
  if (c === 'aesthetic_injectables' || c === 'aesthetic injectables') return 'Aesthetic Injectables';
  if (c === 'dermatology & cosmeceuticals') return 'cosmetics';
  if (c === 'corporate_services') return 'service';
  if (c === 'diagnostic_test') return 'diagnostic';

  // Fallback from type or name
  if (type === 'raw_material') return 'raw_material';
  if (type === 'clinical_supplies') return 'clinical_supplies';
  if (type === 'diagnostic') return 'diagnostic';
  if (type === 'service') return 'service';

  const n = (name || '').toLowerCase();
  if (n.includes('peptide') || n.includes('bpc') || n.includes('semaglutide') || n.includes('tirzepatide')) return 'peptide';
  if (n.includes('capsule') || n.includes('extract') || n.includes('powder')) return 'supplement';

  return 'supplement';
}

async function runNormalization() {
  console.log(`====================================================`);
  console.log(`   FIRESTORE CANONICAL DATA NORMALIZER`);
  console.log(`   MODE: ${APPLY ? '🚀 LIVE WRITE (APPLY)' : '🛡️ DRY RUN (PREVIEW ONLY)'}`);
  console.log(`====================================================\n`);

  // ── 1. PROTOCOLS ──────────────────────────────────────────────────────────
  console.log('--- Step 1: Normalizing Protocols ---');
  const protocolsSnap = await db.collection('protocols').get();
  console.log(`Auditing ${protocolsSnap.size} protocols...`);

  const protocolUpdates = [];
  for (const doc of protocolsSnap.docs) {
    const d = doc.data();
    const updates = {};

    // Standardize status: 'approved' -> 'active'
    if (d.status === 'approved') {
      updates.status = 'active';
    }

    // Canonical name
    const canonicalName = d.name || d.protocol_name || d.title || 'Untitled Protocol';
    if (d.name !== canonicalName) updates.name = canonicalName;
    if (d.protocol_name !== canonicalName) updates.protocol_name = canonicalName;

    // Canonical slug
    const slug = d.slug || d.protocol_slug || slugify(canonicalName);
    if (d.slug !== slug) updates.slug = slug;
    if (d.protocol_slug !== slug) updates.protocol_slug = slug;

    // Schema version
    if (d._schemaVersion !== 1) updates._schemaVersion = 1;

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      protocolUpdates.push({ id: doc.id, ref: doc.ref, updates });
    }
  }

  console.log(`Protocols requiring update: ${protocolUpdates.length}`);
  if (protocolUpdates.length > 0) {
    console.log(`Sample protocol updates:`, protocolUpdates.slice(0, 3).map(u => ({ id: u.id, updates: u.updates })));
  }

  // ── 2. PRODUCTS ───────────────────────────────────────────────────────────
  console.log('\n--- Step 2: Normalizing Products ---');
  const productsSnap = await db.collection('products').get();
  console.log(`Auditing ${productsSnap.size} products...`);

  const productUpdates = [];
  let scientificEnrichmentCount = 0;

  for (const doc of productsSnap.docs) {
    const d = doc.data();
    const updates = {};

    const name = d.name || d.title || doc.id;
    if (d.name !== name) updates.name = name;

    // Slug
    const slug = d.slug || (doc.id.includes('-') && !/^[0-9a-zA-Z]{20}$/.test(doc.id) ? doc.id : slugify(name));
    if (d.slug !== slug) updates.slug = slug;

    // Type
    const normType = normalizeType(d.type);
    if (d.type !== normType) updates.type = normType;

    // Category
    const normCat = normalizeCategory(d.categoryId || d.category, normType, name);
    if (d.categoryId !== normCat) updates.categoryId = normCat;
    if (d.category !== normCat) updates.category = normCat;

    // CanonicalKey & CanonicalName
    let canonicalKey = d.canonicalKey;
    if (!canonicalKey) {
      const knownKey = findKnownPeptideKey(name, null);
      canonicalKey = knownKey || slug;
      updates.canonicalKey = canonicalKey;
    }
    if (!d.canonicalName) {
      updates.canonicalName = name;
    }

    // Status
    const validStatuses = new Set(['draft', 'active', 'published', 'out of stock', 'hidden', 'archived']);
    const currentStatus = (d.status || '').toLowerCase().trim();
    if (!validStatuses.has(currentStatus)) {
      updates.status = 'active';
    } else if (d.status !== currentStatus) {
      updates.status = currentStatus;
    }

    // Goals
    if (!d.goals || !Array.isArray(d.goals) || d.goals.length === 0) {
      if (normCat === 'peptide') updates.goals = ['Recovery & Tissue Repair'];
      else if (normCat === 'metabolic') updates.goals = ['Metabolic Health & Weight Management'];
      else if (normCat === 'diagnostic') updates.goals = ['Biomarker Profiling & Health Assessment'];
      else updates.goals = ['General Health & Longevity'];
    }

    // Scientific metadata enrichment from KNOWN_PEPTIDE_DATA
    const peptideKey = findKnownPeptideKey(name, canonicalKey);
    if (peptideKey && KNOWN_PEPTIDE_DATA[peptideKey]) {
      const spec = KNOWN_PEPTIDE_DATA[peptideKey];
      let enriched = false;

      if (!d.cas && !d.casNumber && spec.casNumber) {
        updates.cas = spec.casNumber;
        updates.casNumber = spec.casNumber;
        enriched = true;
      }
      if (!d.molecularFormula && spec.molecularFormula) {
        updates.molecularFormula = spec.molecularFormula;
        enriched = true;
      }
      if (!d.molecularWeight && spec.molecularWeight) {
        updates.molecularWeight = spec.molecularWeight;
        enriched = true;
      }
      if (!d.pubchemCid && spec.pubchemCid) {
        updates.pubchemCid = spec.pubchemCid;
        enriched = true;
      }
      if (!d.targetSystem && spec.targetSystem) {
        updates.targetSystem = spec.targetSystem;
        enriched = true;
      }
      if (!d.mechanismOfAction && spec.mechanismOfAction) {
        updates.mechanismOfAction = spec.mechanismOfAction;
        enriched = true;
      }
      if (!d.sequence && spec.sequence) {
        updates.sequence = spec.sequence;
        enriched = true;
      }
      if (!d.halfLife && spec.halfLife) {
        updates.halfLife = spec.halfLife;
        enriched = true;
      }

      if (enriched) scientificEnrichmentCount++;
    }

    // Schema version
    if (d._schemaVersion !== 2) {
      updates._schemaVersion = 2;
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      productUpdates.push({ id: doc.id, ref: doc.ref, updates });
    }
  }

  console.log(`Products requiring update: ${productUpdates.length}`);
  console.log(`Products receiving scientific metadata enrichment: ${scientificEnrichmentCount}`);
  if (productUpdates.length > 0) {
    console.log(`Sample product updates:`, productUpdates.slice(0, 3).map(u => ({ id: u.id, updates: u.updates })));
  }

  // ── 3. VARIANTS (Missing Pricing Fix) ──────────────────────────────────────
  console.log('\n--- Step 3: Auditing Variants Pricing ---');
  const vSnap = await db.collectionGroup('variants').get();
  const variantUpdates = [];
  vSnap.forEach(vd => {
    const v = vd.data();
    if (!v.pricing || Object.keys(v.pricing).length === 0) {
      variantUpdates.push({
        id: vd.id,
        ref: vd.ref,
        updates: {
          pricing: {
            retail: { amount: 0, currency: 'USD' }
          },
          updatedAt: new Date().toISOString()
        }
      });
    }
  });
  console.log(`Variants missing pricing to fix: ${variantUpdates.length}`);

  // ── 4. EXECUTE BATCHES (IF APPLY) ─────────────────────────────────────────
  if (!APPLY) {
    console.log('\n====================================================');
    console.log('🛡️ DRY RUN COMPLETE. No data was modified.');
    console.log('To apply these changes permanently to Firestore, run:');
    console.log('  node scripts/normalize_canonical_firestore_data.mjs --apply');
    console.log('====================================================');
    process.exit(0);
  }

  console.log('\n🚀 APPLYING BATCHED WRITES TO FIRESTORE...');
  const allOps = [...protocolUpdates, ...productUpdates, ...variantUpdates];
  console.log(`Total documents to write: ${allOps.length}`);

  const BATCH_SIZE = 400;
  for (let i = 0; i < allOps.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = allOps.slice(i, i + BATCH_SIZE);
    chunk.forEach(op => {
      batch.update(op.ref, op.updates);
    });
    await batch.commit();
    console.log(`  Committed batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(allOps.length / BATCH_SIZE)} (${chunk.length} docs)`);
  }

  // ── 5. RECALCULATE FACETS ─────────────────────────────────────────────────
  console.log('\n--- Step 5: Recalculating _meta/catalog_facets ---');
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
    const cat = p.categoryId || p.category;
    if (cat) categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
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

  console.log('✅ _meta/catalog_facets successfully updated with canonical counts!');
  console.log('🎉 ALL DATA REMEDIATION AND NORMALIZATION FINISHED CLEANLY.');
  process.exit(0);
}

runNormalization().catch(err => {
  console.error('Fatal error during normalization:', err);
  process.exit(1);
});

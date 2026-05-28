/**
 * sync-clinicalai-live-catalog.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Dynamically queries active Firestore products and protocols, parses their categories,
 * builds a live similarity relationship map and metadata taxonomy, merges them with the
 * baseline clinicalAI_rules.json, and writes the compiled config directly to Firestore.
 *
 * Usage:
 *   node scripts/sync-clinicalai-live-catalog.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Firebase Admin SDK ───────────────────────────────────────────────────────
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = 'med-peptides-app';

// ── Init Admin SDK ───────────────────────────────────────────────────────────
if (!getApps().length) {
  const serviceAccountPath = resolve(__dirname, '../serviceAccountKey.json');
  try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount),
      projectId: PROJECT_ID
    });
    console.log('[sync-live] Connected via serviceAccountKey.json');
  } catch (err) {
    initializeApp({ projectId: PROJECT_ID });
    console.log('[sync-live] Connected via default Application Credentials (ADC)');
  }
}
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

const BASE_RULES_PATH = resolve(__dirname, '../AI Prompts/clinicalAI_rules.json');
const baseRules = JSON.parse(readFileSync(BASE_RULES_PATH, 'utf-8'));

async function syncLiveCatalog() {
  console.log('\n🚀 Starting Live Firebase Catalog Synchronizer...');
  console.log('───────────────────────────────────────────────────');

  // 1. Fetch live products from Firestore
  console.log('📥 Querying active products from Firestore...');
  const productsSnap = await db.collection('products').get();
  const rawProducts = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Filter active and non-draft products
  const activeProducts = rawProducts.filter(p => p.isActive !== false && p.status !== 'draft');
  console.log(`   Found ${activeProducts.length} active products in the database.`);

  // 2. Fetch live protocols from Firestore
  console.log('📥 Querying active protocols from Firestore...');
  const protocolsSnap = await db.collection('protocols').get();
  const activeProtocols = protocolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(`   Found ${activeProtocols.length} active protocols in the database.`);

  // 3. Dynamically build metadata labels & taxonomy
  console.log('⚡ Parsing product taxonomy and metadata labels...');
  const dynamicLabels = [];
  const categoryGroups = {}; // category slug -> list of product names

  activeProducts.forEach(prod => {
    const name = prod.name || prod.displayName || prod.id;
    const type = prod.productType || 'peptide';
    const category = (prod.category || 'general').toLowerCase();
    
    // Track categories for similarity map
    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
    }
    categoryGroups[category].push(name);

    // Dynamic Audience Inferences
    let audience = 'beginner-friendly';
    if (type === 'peptide') {
      const advancedList = ['retatrutide', 'tirzepatide', 'dihexa', 'mots-c', 'semax'];
      const intermediateList = ['tb-500', 'selank', 'epithalon', 'cjc-1295'];
      
      const lowerName = name.toLowerCase();
      if (advancedList.some(item => lowerName.includes(item))) {
        audience = 'advanced researcher';
      } else if (intermediateList.some(item => lowerName.includes(item))) {
        audience = 'intermediate';
      } else {
        audience = 'beginner-friendly';
      }
    }

    // Goal alignment based on product category
    let goal = 'recovery-focused';
    if (category.includes('longev') || category.includes('repair') || category.includes('age') || category.includes('antioxidant')) {
      goal = 'longevity-oriented';
    } else if (category.includes('fat') || category.includes('weight') || category.includes('metabol')) {
      goal = 'metabolic support';
    } else if (category.includes('focus') || category.includes('cognitive') || category.includes('brain') || category.includes('nootropic')) {
      goal = 'cognitive enhancement';
    } else if (category.includes('hormon') || category.includes('vitality') || category.includes('testosteron')) {
      goal = 'hormonal support';
    } else if (category.includes('immune') || category.includes('defense') || category.includes('protect')) {
      goal = 'immune support';
    } else if (category.includes('sleep') || category.includes('rest') || category.includes('relax')) {
      goal = 'sleep & restoration';
    } else if (category.includes('muscle') || category.includes('mass') || category.includes('strength')) {
      goal = 'body composition';
    }

    // Style label
    const style = type === 'supplement' ? 'support compound' : 'standalone compound';

    dynamicLabels.push({
      compound: name,
      audience,
      goal,
      style
    });
  });

  console.log(`   Generated ${dynamicLabels.length} dynamic compound labels.`);

  // 4. Dynamically build similar compounds map from category groupings
  console.log('⚡ Generating dynamic similarity relationships...');
  const dynamicSimilarityMap = [];

  // Seed with base manual definitions if any
  const baseSimilarMap = baseRules.similar_compounds_rules?.known_relationships || [];
  const registeredCompounds = new Set();

  baseSimilarMap.forEach(rel => {
    dynamicSimilarityMap.push(rel);
    registeredCompounds.add(rel.compound.toLowerCase());
  });

  // Supplement with live category overlap similarity
  Object.entries(categoryGroups).forEach(([cat, prods]) => {
    if (prods.length < 2) return;
    
    prods.forEach(prod => {
      const prodLower = prod.toLowerCase();
      // Find other products in same category
      const similarTo = prods.filter(p => p !== prod).slice(0, 3);
      
      if (!registeredCompounds.has(prodLower)) {
        dynamicSimilarityMap.push({
          compound: prod,
          similar_to: similarTo
        });
        registeredCompounds.add(prodLower);
      } else {
        // Merge lists
        const existing = dynamicSimilarityMap.find(item => item.compound.toLowerCase() === prodLower);
        if (existing) {
          const merged = Array.from(new Set([...(existing.similar_to || []), ...similarTo]));
          existing.similar_to = merged.slice(0, 4);
        }
      }
    });
  });

  console.log(`   Established similar compound maps for ${dynamicSimilarityMap.length} compounds.`);

  // 5. Dynamically build stacks from active protocols
  console.log('⚡ Building live combinations and stacks index...');
  const liveStacks = [];
  
  activeProtocols.forEach(prot => {
    const name = prot.title || prot.id;
    // Extract products used
    const productsUsed = (prot.products_used || []).map(p => 
      typeof p === 'string' ? p : p.product_title || p.product_id
    ).filter(Boolean);

    if (productsUsed.length >= 2) {
      productsUsed.forEach(prod => {
        const others = productsUsed.filter(p => p !== prod);
        liveStacks.push({
          compound: prod,
          often_combined_with: others.slice(0, 3),
          stack_rationale: `Featured together in research protocol: "${name}".`
        });
      });
    }
  });

  console.log(`   Indexed ${liveStacks.length} protocol-derived stack components.`);

  // 6. Merge live mappings into behavioral rules config payload
  console.log('📝 Merging dynamic catalog with base guidelines...');
  
  const rulesPayload = {
    _meta_version:   baseRules._meta_version ?? baseRules.meta?.version ?? '6.0.0-live',
    _synced_at:      new Date().toISOString(),
    _live_enriched:  true,

    // Base query configs
    query_types: Object.fromEntries(
      Object.entries(baseRules.query_types ?? {})
        .filter(([k]) => k !== 'storage')
        .map(([k, v]) => [k, {
          id:             v.id,
          description:    v.description,
          section_order:  v.response_format?.section_order ?? [],
          critical_rules: v.critical_rules ?? [],
        }])
    ),

    // Base rules arrays
    safety_rules: (baseRules.safety_rules?.rules ?? []).map(s => ({
      id:                s.id,
      rule:              s.rule,
      closing_statement: s.closing_statement,
      fallback_phrase:   s.fallback_phrase,
    })),

    reconstitution_rules: (baseRules.reconstitution_rules?.rules ?? []).map(rc => ({
      id:              rc.id,
      rule:            rc.rule,
      default_solvent: rc.default_solvent,
      tag_format:      rc.tag_format,
    })),

    navigation_rules: {
      rules: (baseRules.navigation_rules?.rules ?? []).map(n => ({ id: n.id, rule: n.rule })),
      tags:  baseRules.navigation_rules?.tags ?? {},
    },

    language_rules: (baseRules.language_rules?.rules ?? []).map(l => ({ id: l.id, rule: l.rule })),

    behavioral_principles: (baseRules.behavioral_principles?.rules ?? []).map(bp => ({
      id:   bp.id,
      name: bp.name,
      rule: bp.rule ?? bp.goal ?? [bp.beginner, bp.advanced].filter(Boolean).join(' / '),
    })),

    user_mode_rules: {
      modes: baseRules.user_mode_rules?.modes ?? {},
      rules: baseRules.user_mode_rules?.rules ?? [],
    },

    // Enriched dynamic rules
    similar_compounds:       dynamicSimilarityMap,
    similar_compounds_rules: baseRules.similar_compounds_rules?.response_section?.rules ?? [],
    commonly_combined_with:  liveStacks,
    usage_metadata_labels:   dynamicLabels,

    contextual_next_actions_rules: baseRules.contextual_next_actions_rules?.rules ?? [],
  };

  const fewShotPayload = {
    _meta_version: baseRules._meta_version ?? baseRules.meta?.version ?? '6.0.0-live',
    _synced_at:    new Date().toISOString(),
    examples:      (baseRules.few_shot_examples?.examples ?? []).map(ex => ({
      id:               ex.id,
      type:             ex.type,
      user_input:       ex.user_input,
      notes:            ex.notes,
      expected_response: ex.expected_response ?? {},
    })),
  };

  // 7. Write to Firestore
  const COLLECTION = 'clinicalai_config';
  console.log('📤 Uploading live, dynamic ClinicalAI configuration to Firestore...');
  
  await db
    .collection(COLLECTION)
    .doc('behavioral_rules')
    .set(rulesPayload, { merge: false });
  console.log('   ✅ Uploaded enriched "behavioral_rules" successfully.');

  await db
    .collection(COLLECTION)
    .doc('few_shot_examples')
    .set(fewShotPayload, { merge: false });
  console.log('   ✅ Uploaded "few_shot_examples" successfully.');

  console.log('───────────────────────────────────────────────────');
  console.log('🎉 Live ClinicalAI Catalog Rules Sync Complete!');
}

syncLiveCatalog().catch(err => {
  console.error('\n❌ Sync Failed:', err);
  process.exit(1);
});

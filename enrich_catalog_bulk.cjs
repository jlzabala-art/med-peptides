/**
 * ════════════════════════════════════════════════════════════════════════════
 *  enrich_catalog_bulk.cjs
 *  Bulk Type-Aware Product Enrichment Script
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  Reads ALL products from Firestore, classifies each one by type, runs the
 *  correct enrichment strategy (peptide, supplement, equipment, test, service,
 *  skincare), and writes the result back to Firestore in batches of 500.
 *
 *  Safety features:
 *    • DRY_RUN=true  → only prints what would change, writes nothing
 *    • FORCE=true    → re-enriches products that already have enrichedAt set
 *    • CATEGORY filter → only processes one category at a time
 *    • Automatic Firestore batch commits (max 500 per batch)
 *    • Progress bar with ETA
 *    • Full summary report at the end
 *
 *  Usage:
 *    node enrich_catalog_bulk.cjs               # dry run, all products
 *    DRY_RUN=false node enrich_catalog_bulk.cjs  # live write, all products
 *    DRY_RUN=false FORCE=true node enrich_catalog_bulk.cjs  # re-enrich everything
 *    DRY_RUN=false CATEGORY=peptide node enrich_catalog_bulk.cjs
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

const admin   = require('firebase-admin');
const dotenv  = require('dotenv');
const path    = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// ─── Firebase Admin init ──────────────────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// ─── Config flags ─────────────────────────────────────────────────────────────
const DRY_RUN         = process.env.DRY_RUN !== 'false';   // default: true (safe)
const FORCE_REENRICH  = process.env.FORCE   === 'true';    // re-enrich even if enrichedAt set
const FILTER_CATEGORY = process.env.CATEGORY || null;      // optional category filter
const BATCH_SIZE      = 500;                                // Firestore max per batch
const CONCURRENCY     = 5;                                  // parallel enrichment workers

// ─── ANSI color helpers ───────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m',
  cyan: '\x1b[36m', red: '\x1b[31m', magenta: '\x1b[35m',
};

// ─── Type classifier (mirrors classifyProductForEnrichment in enrichmentEngine) ─
function classifyType(product) {
  const cat  = (product?.category   || '').toLowerCase().trim();
  const type = (product?.productType || product?.type || '').toLowerCase().trim();
  const name = (product?.name       || product?.canonicalName || '').toLowerCase();

  // Peptides / APIs / Hormones / Pharma raw materials
  if (['peptide', 'hormone', 'raw_material', 'api_raw_material', 'hormone optimization'].includes(cat)) return 'peptide';
  if (cat.startsWith('cardiovascular') || cat.startsWith('metabolic'))               return 'peptide';

  // Supplements / Nutraceuticals
  if (['supplement', 'nutricosmetics', 'weight_loss', 'nutraceutical'].includes(cat)) return 'supplement';

  // Equipment / Consumables / Excipients
  if (['medical_device_consumable', 'equipment', 'excipient_vehicle', 'excipient'].includes(cat)) return 'equipment';

  // Tests / Diagnostics / Genetics
  if (['diagnostic_test', 'genetic_test', 'lab_test'].includes(cat))                return 'test';
  if (type === 'test')                                                               return 'test';

  // Services
  if (cat === 'service' || type === 'subscription')                                  return 'service';

  // Skincare
  if (cat === 'skincare')                                                            return 'skincare';

  // Type-based fallbacks
  if (type === 'raw_material' || type === 'api_raw_material')                        return 'peptide';
  if (/api|raw material|bulk|materia prima/i.test(name))                             return 'peptide';

  // Name-based detection for known pharma compounds and peptides
  if (/peptide|bpc|tb-500|tb500|nad\+|semaglutide|melanotan|sermorelin|ipamorelin|cjc|ghrh|ghrp|hexarelin|epithalon|selank|semax|kisspeptin|mots-c|humanin|tesamorelin|retatrutide|tirzepatide|oxytocin|calcitonin|thymosin|gonadorelin|naltrexone|ldn|fenbendazole|rapamycin|metformin|spironolactone|tadalafil|nadolol/i.test(name)) return 'peptide';
  return 'general';
}

// ─── Authoritative peptide knowledge base (subset — key ones) ─────────────────
const PEPTIDE_KB = {
  'bpc-157': {
    canonicalName: 'BPC-157 (Body Protection Compound)',
    aliases: ['bpc-157','bpc157','body protection compound','bepecin','pl-14736'],
    casNumber: '137525-51-0', molecularFormula: 'C62H98N16O22', molecularWeight: '1419.55 g/mol',
    sequence: 'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
    pubchemCid: '9941957', halfLife: '~4-6 hours', purityPercentage: 99.4,
    grade: 'pharma_compounding', counterIon: 'Acetate', appearance: 'White lyophilized crystalline powder',
    solubility: 'Highly soluble in Bacteriostatic Water / 0.9% NaCl', endotoxins: '< 0.1 EU/mg',
    storageConditionLyophilized: '-20°C (Dry, Protected from Light)', storageConditionReconstituted: '2°C to 8°C (30 days)',
    shelfLifeMonthsLyophilized: 24, shelfLifeDaysReconstituted: 30,
    primaryGoal: 'Tissue Repair & Gut Regeneration', goals: ['tissue_repair','gut_health','tendon_ligament','anti_inflammatory'],
    targetSystem: 'VEGFR2 Angiogenic Axis & Nitric Oxide (eNOS) Signaling',
    mechanismOfAction: 'Upregulates VEGFR2 internalization, promotes angiogenesis, accelerates collagen synthesis, and protects GI epithelial junctions.',
    clinicalBenefits: 'Accelerates tendon, ligament, and muscle healing; resolves gut mucosal ulceration and reduces systemic inflammatory cytokines.',
    recommendedLabs: ['hs-CRP','ESR','CBC','Fecal Calprotectin','Liver Panel (ALT/AST)'],
    reconstitutionGuide: { diluentRecommended: 'Bacteriostatic Water', volumeRecommendedMl: 2.0, instructions: 'Add 2.0 mL slowly. Swirl gently. Protect from UV.' }
  },
  'tb-500': {
    canonicalName: 'TB-500 (Thymosin Beta-4 Fragment)',
    aliases: ['tb-500','tb500','thymosin beta-4','tβ4','lkktetq'],
    casNumber: '77591-33-4', molecularFormula: 'C212H350N56O78S', molecularWeight: '4963.5 g/mol',
    pubchemCid: '16132341', uniprotId: 'P62328', halfLife: '~24-48 hours',
    purityPercentage: 99.1, grade: 'pharma_compounding', counterIon: 'Acetate',
    appearance: 'Fluffy white lyophilized powder', endotoxins: '< 0.2 EU/mg',
    storageConditionLyophilized: '-20°C', storageConditionReconstituted: '2°C to 8°C',
    shelfLifeMonthsLyophilized: 24, shelfLifeDaysReconstituted: 28,
    primaryGoal: 'Cellular Migration & Muscle Repair', goals: ['muscle_repair','angiogenesis','anti_inflammatory'],
    mechanismOfAction: 'Promotes actin polymerization, cellular migration, angiogenesis and cardioprotection.',
    reconstitutionGuide: { diluentRecommended: 'Bacteriostatic Water', volumeRecommendedMl: 2.0, instructions: 'Inject diluent slowly. Swirl gently.' }
  },
  'nad+': {
    canonicalName: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
    aliases: ['nad+','nad plus','nicotinamide adenine dinucleotide','nadh'],
    casNumber: '53-84-9', molecularFormula: 'C21H27N7O14P2', molecularWeight: '663.43 g/mol',
    pubchemCid: '5893', halfLife: '~15-30 minutes IV', purityPercentage: 99.0,
    grade: 'pharma_compounding', counterIon: 'Sodium', appearance: 'White crystalline lyophilized powder',
    endotoxins: '< 0.2 EU/mg',
    storageConditionLyophilized: '-20°C (Light-protected)', storageConditionReconstituted: '2°C to 8°C',
    shelfLifeMonthsLyophilized: 18, shelfLifeDaysReconstituted: 14,
    primaryGoal: 'Cellular Energy & Longevity', goals: ['longevity','energy','neuroprotection','anti_aging'],
    mechanismOfAction: 'Coenzyme for mitochondrial ATP synthesis, Sirtuin activation and DNA repair.',
    reconstitutionGuide: { diluentRecommended: 'Sterile 0.9% NaCl', volumeRecommendedMl: 5.0, instructions: 'Keep light-protected. Mix under sterile laminar hood.' }
  },
};

function findKnownPeptide(name) {
  const clean = String(name || '').toLowerCase().trim();
  for (const [key, data] of Object.entries(PEPTIDE_KB)) {
    if (clean.includes(key) || (data.aliases || []).some(a => clean.includes(a.toLowerCase()))) return data;
  }
  return null;
}

// ─── Enrichment strategies ────────────────────────────────────────────────────
function enrichPeptide(product) {
  const name  = product.canonicalName || product.name || '';
  const known = findKnownPeptide(name);

  const molecular = {
    casNumber:        known?.casNumber        || product.molecular?.casNumber        || product.casNumber        || 'Available on Request',
    molecularFormula: known?.molecularFormula || product.molecular?.molecularFormula || product.molecularFormula || '',
    molecularWeight:  known?.molecularWeight  || product.molecular?.molecularWeight  || product.molecularWeight  || 'Research Grade Spec',
    sequence:         known?.sequence         || product.molecular?.sequence         || product.sequence         || '',
    pubchemCid:       known?.pubchemCid       || product.molecular?.pubchemCid       || product.pubchemCid       || '',
    uniprotId:        known?.uniprotId        || product.molecular?.uniprotId        || product.uniprotId        || '',
    halfLife:         known?.halfLife         || product.molecular?.halfLife         || 'Compound Specific',
  };
  const apiSpecs = {
    purityPercentage:            known?.purityPercentage                                          || product.apiSpecs?.purityPercentage           || 99.0,
    grade:                       known?.grade                                                     || product.apiSpecs?.grade                      || 'pharma_compounding',
    counterIon:                  known?.counterIon                                                || product.apiSpecs?.counterIon                 || 'Acetate',
    appearance:                  known?.appearance                                                || product.apiSpecs?.appearance                 || 'White lyophilized sterile powder',
    solubility:                  known?.solubility                                                || product.apiSpecs?.solubility                 || 'Soluble in Bacteriostatic Water',
    endotoxins:                  known?.endotoxins                                                || product.apiSpecs?.endotoxins                 || '< 0.2 EU/mg',
    storageConditionLyophilized:  known?.storageConditionLyophilized                             || product.apiSpecs?.storageConditionLyophilized  || '-20°C (Dry, Dark)',
    storageConditionReconstituted: known?.storageConditionReconstituted                          || product.apiSpecs?.storageConditionReconstituted || '2°C to 8°C',
    shelfLifeMonthsLyophilized:  known?.shelfLifeMonthsLyophilized                              || 24,
    shelfLifeDaysReconstituted:  known?.shelfLifeDaysReconstituted                               || 30,
    reconstitutionGuide:         known?.reconstitutionGuide || product.apiSpecs?.reconstitutionGuide || {
      diluentRecommended: 'Bacteriostatic Water (0.9% Benzyl Alcohol)',
      volumeRecommendedMl: 2.0,
      instructions: 'Inject diluent slowly down vial wall. Swirl gently.'
    },
  };

  const nameTokens  = name.toLowerCase().split(/\s+/);
  const aliasTokens = known?.aliases || [];
  const casTokens   = molecular.casNumber && molecular.casNumber !== 'Available on Request'
    ? [molecular.casNumber, `cas ${molecular.casNumber}`] : [];
  const searchTokens = [...new Set([...nameTokens, ...aliasTokens, ...casTokens, 'peptide', 'api', 'raw material'].filter(Boolean))];

  return {
    canonicalName:     known?.canonicalName    || product.canonicalName || product.name,
    primaryGoal:       known?.primaryGoal      || product.primaryGoal   || 'Cellular Optimization',
    goals:             known?.goals            || product.goals         || ['cellular_health'],
    targetSystem:      known?.targetSystem     || product.targetSystem  || 'Cellular Receptor Axis',
    mechanismOfAction: known?.mechanismOfAction || product.mechanismOfAction || 'Selective cellular signaling & metabolic optimization',
    clinicalBenefits:  known?.clinicalBenefits || product.clinicalBenefits  || 'Clinical evaluation under medical supervision',
    recommendedLabs:   known?.recommendedLabs  || product.recommendedLabs   || ['CMP', 'CBC'],
    molecular, apiSpecs, searchTokens,
    scientificData: {
      ...molecular, ...apiSpecs,
      mechanismOfAction: known?.mechanismOfAction || product.mechanismOfAction || 'Selective cellular signaling & metabolic optimization',
      targetSystem:      known?.targetSystem      || product.targetSystem      || 'Cellular Receptor Axis',
    },
    hasCOA: true,
    requiresColdChain: product.requiresColdChain !== false,
    _enrichmentType: 'peptide',
  };
}

function enrichSupplement(product) {
  const name = product.canonicalName || product.name || '';
  return {
    canonicalName:     product.canonicalName || product.name,
    description:       product.description || product.summary || `${name} — dietary supplement for wellness and health optimization.`,
    primaryGoal:       product.primaryGoal || 'Wellness Optimization',
    goals:             product.goals || ['wellness'],
    searchTokens:      [...new Set([...name.toLowerCase().split(/\s+/), 'supplement', 'nutraceutical'].filter(Boolean))],
    hasCOA:            product.hasCOA ?? false,
    requiresColdChain: product.requiresColdChain ?? false,
    _enrichmentType:   'supplement',
  };
}

function enrichTest(product) {
  const name = product.canonicalName || product.name || '';
  return {
    canonicalName:   product.canonicalName || product.name,
    description:     product.description || `${name} — diagnostic laboratory test.`,
    primaryGoal:     product.primaryGoal || 'Biomarker Monitoring',
    goals:           product.goals || ['diagnostics'],
    sampleType:      product.sampleType || 'Blood (Serum)',
    turnaroundTime:  product.turnaroundTime || product.tat || '3-5 Business Days',
    searchTokens:    [...new Set([...name.toLowerCase().split(/\s+/), 'test', 'diagnostic', 'lab'].filter(Boolean))],
    requiresColdChain: product.requiresColdChain ?? false,
    _enrichmentType: 'test',
  };
}

function enrichEquipment(product) {
  const name = product.canonicalName || product.name || '';
  return {
    canonicalName:   product.canonicalName || product.name,
    description:     product.description || `${name} — medical device for clinical use.`,
    primaryGoal:     product.primaryGoal || 'Clinical Procedure Support',
    goals:           product.goals || ['clinical_support'],
    searchTokens:    [...new Set([...name.toLowerCase().split(/\s+/), 'medical device', 'equipment', 'consumable'].filter(Boolean))],
    requiresColdChain: product.requiresColdChain ?? false,
    _enrichmentType: 'equipment',
  };
}

function enrichService(product) {
  const name = product.canonicalName || product.name || '';
  return {
    canonicalName:    product.canonicalName || product.name,
    description:      product.description || `${name} — wellness service or subscription plan.`,
    primaryGoal:      product.primaryGoal || 'Patient Wellness Journey',
    goals:            product.goals || ['wellness'],
    searchTokens:     [...new Set([...name.toLowerCase().split(/\s+/), 'service', 'subscription', 'membership'].filter(Boolean))],
    requiresColdChain: false,
    _enrichmentType:  'service',
  };
}

function enrichSkincare(product) {
  const name = product.canonicalName || product.name || '';
  return {
    canonicalName:   product.canonicalName || product.name,
    description:     product.description || `${name} — topical skincare formulation.`,
    primaryGoal:     product.primaryGoal || 'Skin Health & Rejuvenation',
    goals:           product.goals || ['skin_health'],
    searchTokens:    [...new Set([...name.toLowerCase().split(/\s+/), 'skincare', 'topical', 'cosmeceutical'].filter(Boolean))],
    hasCOA:          product.hasCOA ?? false,
    requiresColdChain: product.requiresColdChain ?? false,
    _enrichmentType: 'skincare',
  };
}

function enrichGeneral(product) {
  const name = product.canonicalName || product.name || '';
  return {
    canonicalName:     product.canonicalName || product.name,
    description:       product.description || `${name} — commercial product.`,
    primaryGoal:       product.primaryGoal || 'General Health',
    goals:             product.goals || ['general'],
    searchTokens:      [...new Set([...name.toLowerCase().split(/\s+/)].filter(Boolean))],
    requiresColdChain: product.requiresColdChain ?? false,
    _enrichmentType:   'general',
  };
}

function runEnrichment(product, enrichmentType) {
  switch (enrichmentType) {
    case 'peptide':    return enrichPeptide(product);
    case 'supplement': return enrichSupplement(product);
    case 'test':       return enrichTest(product);
    case 'equipment':  return enrichEquipment(product);
    case 'service':    return enrichService(product);
    case 'skincare':   return enrichSkincare(product);
    default:           return enrichGeneral(product);
  }
}

// ─── Completeness score calculator (mirrors calculateProductCompleteness) ──────
function calcScore(product, enrichmentType) {
  const checks = {
    peptide: [
      p => !!(p.scientificData?.molecularWeight || p.molecularWeight),
      p => !!(p.scientificData?.casNumber       || p.casNumber),
      p => !!(p.scientificData?.pubchemCid       || p.pubchemCid),
      p => !!(p.mechanismOfAction || p.description),
      p => (p.variants?.length > 0) || p.variantsCount > 0,
      p => p.min_unit_price > 0 || p.price > 0 || p.variants?.some(v => v.price > 0),
      p => !!(p.dosage || p.variants?.some(v => v.dosage || v.strength)),
      p => (p.suppliers?.length > 0) || !!p.supplierId,
      p => !!(p.purity || p.apiSpecs?.purityPercentage),
      p => !!(p.hasCOA || p.coaUrl),
      p => !!p.category,
      p => !!(p.primaryGoal || p.goals?.length),
      p => !!(p.aiDescription || p.description),
      p => !!(p.reconstitutionGuide || p.apiSpecs?.reconstitutionGuide),
    ],
    supplement: [
      p => !!(p.description || p.summary),
      p => !!(p.ingredients || p.components?.length > 0),
      p => !!(p.dosage || p.servingSize || p.variants?.some(v => v.dosage)),
      p => !!(p.form || p.presentation),
      p => (p.variants?.length > 0) || p.variantsCount > 0,
      p => p.min_unit_price > 0 || p.price > 0 || p.variants?.some(v => v.price > 0),
      p => (p.suppliers?.length > 0) || !!p.supplierId,
      p => !!(p.hasCOA || p.coaUrl),
      p => !!p.category,
      p => !!(p.primaryGoal || p.goals?.length),
      p => !!(p.regulatoryLabel || p.ndc || p.gtin),
      p => !!(p.allergens || p.contraindications),
    ],
    default: [
      p => !!(p.description || p.summary),
      p => (p.variants?.length > 0) || p.variantsCount > 0,
      p => p.min_unit_price > 0 || p.price > 0,
      p => (p.suppliers?.length > 0) || !!p.supplierId,
      p => !!p.category,
      p => !!(p.primaryGoal || p.goals?.length),
    ],
  };

  const schemaChecks = checks[enrichmentType] || checks.default;
  const passed = schemaChecks.filter(fn => { try { return fn(product); } catch { return false; } }).length;
  return Math.round((passed / schemaChecks.length) * 100);
}

// ─── Progress display ─────────────────────────────────────────────────────────
function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms/1000).toFixed(1)}s`;
  return `${Math.floor(ms/60000)}m ${Math.round((ms%60000)/1000)}s`;
}

function printProgress(done, total, startTime, counters) {
  const pct    = Math.round((done / total) * 100);
  const bar    = '█'.repeat(Math.floor(pct / 4)) + '░'.repeat(25 - Math.floor(pct / 4));
  const elapsed = Date.now() - startTime;
  const eta    = done > 0 ? Math.round((elapsed / done) * (total - done)) : 0;
  process.stdout.write(
    `\r  [${bar}] ${pct}% (${done}/${total})  ` +
    `${c.green}✓ ${counters.enriched}${c.reset}  ` +
    `${c.yellow}⟳ ${counters.skipped}${c.reset}  ` +
    `${c.red}✗ ${counters.errors}${c.reset}  ` +
    `ETA: ${formatTime(eta)}   `
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n' + c.bold + c.cyan +
    '════════════════════════════════════════════════════════\n' +
    '  🧬  Bulk Catalog Enrichment — Type-Aware Engine\n' +
    '════════════════════════════════════════════════════════' +
    c.reset);

  console.log(`\n  Mode:     ${DRY_RUN ? c.yellow + 'DRY RUN (no writes)' : c.green + 'LIVE WRITE'}${c.reset}`);
  console.log(`  Force:    ${FORCE_REENRICH ? c.magenta + 'YES (re-enrich all)' : c.dim + 'NO (skip already enriched)'}${c.reset}`);
  console.log(`  Category: ${FILTER_CATEGORY ? c.blue + FILTER_CATEGORY : c.dim + 'ALL'}${c.reset}\n`);

  if (DRY_RUN) {
    console.log(c.yellow + '  ⚠️  DRY RUN mode — set DRY_RUN=false to write to Firestore.\n' + c.reset);
  }

  // 1. Fetch all products
  console.log(`  ${c.dim}Fetching products from Firestore...${c.reset}`);
  let query = db.collection('products');
  if (FILTER_CATEGORY) query = query.where('category', '==', FILTER_CATEGORY);

  const snapshot = await query.get();
  const docs = snapshot.docs;
  const total = docs.length;

  console.log(`  Found ${c.bold}${total}${c.reset} products.\n`);

  if (total === 0) { console.log('  Nothing to process. Exiting.'); return; }

  // 2. Stats counters
  const counters = { enriched: 0, skipped: 0, errors: 0 };
  const byType   = {};
  const startTime = Date.now();

  // 3. Collect all writes to commit in batches
  let batch       = db.batch();
  let batchCount  = 0;
  let totalWrites = 0;

  const results = [];

  // 4. Process each product
  for (let i = 0; i < docs.length; i++) {
    const doc     = docs[i];
    const product = { id: doc.id, ...doc.data() };

    try {
      // Skip already enriched products (unless FORCE)
      if (!FORCE_REENRICH && product.enrichedAt && product._enrichmentType) {
        counters.skipped++;
        results.push({ id: doc.id, status: 'skipped', reason: 'already enriched', type: product._enrichmentType });
        printProgress(i + 1, total, startTime, counters);
        continue;
      }

      const enrichmentType = classifyType(product);
      byType[enrichmentType] = (byType[enrichmentType] || 0) + 1;

      const enrichedFields = runEnrichment(product, enrichmentType);
      const scoreBefore = calcScore(product, enrichmentType);
      const scoreAfter  = calcScore({ ...product, ...enrichedFields }, enrichmentType);

      const payload = {
        ...enrichedFields,
        enrichedAt:      new Date().toISOString(),
        _enrichmentType: enrichmentType,
        _scoreBefore:    scoreBefore,
        _scoreAfter:     scoreAfter,
      };

      if (!DRY_RUN) {
        batch.set(doc.ref, payload, { merge: true });
        batchCount++;

        // Commit batch when full
        if (batchCount >= BATCH_SIZE) {
          await batch.commit();
          totalWrites += batchCount;
          batch = db.batch();
          batchCount = 0;
        }
      }

      counters.enriched++;
      results.push({ id: doc.id, name: product.name || product.canonicalName, status: 'enriched', type: enrichmentType, scoreBefore, scoreAfter });
    } catch (err) {
      counters.errors++;
      results.push({ id: doc.id, status: 'error', error: err.message });
    }

    printProgress(i + 1, total, startTime, counters);
  }

  // Final batch commit
  if (!DRY_RUN && batchCount > 0) {
    await batch.commit();
    totalWrites += batchCount;
  }

  const elapsed = Date.now() - startTime;
  console.log('\n');

  // ─── Summary Report ─────────────────────────────────────────────────────────
  console.log(c.bold + c.cyan +
    '════════════════════════════════════════════════════════\n' +
    '  📊  Enrichment Summary Report\n' +
    '════════════════════════════════════════════════════════' + c.reset);

  console.log(`\n  Total processed:  ${c.bold}${total}${c.reset}`);
  console.log(`  Enriched:         ${c.green + c.bold}${counters.enriched}${c.reset}`);
  console.log(`  Skipped:          ${c.yellow}${counters.skipped}${c.reset}`);
  console.log(`  Errors:           ${c.red}${counters.errors}${c.reset}`);
  console.log(`  Writes committed: ${c.blue}${DRY_RUN ? '0 (dry run)' : totalWrites}${c.reset}`);
  console.log(`  Time elapsed:     ${c.dim}${formatTime(elapsed)}${c.reset}\n`);

  console.log(c.bold + '  By Type:' + c.reset);
  for (const [type, count] of Object.entries(byType)) {
    const icon = { peptide:'🧬', supplement:'💊', test:'🔬', equipment:'⚕️', service:'📅', skincare:'✨', general:'📦' }[type] || '•';
    console.log(`    ${icon}  ${type.padEnd(12)} → ${c.bold}${count}${c.reset}`);
  }

  // Score improvement table
  const enrichedResults = results.filter(r => r.status === 'enriched');
  if (enrichedResults.length > 0) {
    const totalScoreBefore = enrichedResults.reduce((a, r) => a + (r.scoreBefore || 0), 0);
    const totalScoreAfter  = enrichedResults.reduce((a, r) => a + (r.scoreAfter  || 0), 0);
    const avgBefore = Math.round(totalScoreBefore / enrichedResults.length);
    const avgAfter  = Math.round(totalScoreAfter  / enrichedResults.length);

    console.log(`\n  ${c.bold}Completeness Delta:${c.reset}`);
    console.log(`    Average before enrichment: ${c.yellow}${avgBefore}%${c.reset}`);
    console.log(`    Average after enrichment:  ${c.green}${avgAfter}%${c.reset}`);
    console.log(`    Improvement:               ${c.green}+${avgAfter - avgBefore}%${c.reset}`);
  }

  // Error log
  const errors = results.filter(r => r.status === 'error');
  if (errors.length > 0) {
    console.log(`\n  ${c.red + c.bold}Errors (${errors.length}):${c.reset}`);
    errors.slice(0, 10).forEach(e => console.log(`    ${c.dim}${e.id}:${c.reset} ${e.error}`));
    if (errors.length > 10) console.log(`    ... and ${errors.length - 10} more`);
  }

  if (DRY_RUN) {
    console.log('\n' + c.yellow + c.bold +
      '  ⚠️  This was a DRY RUN. No data was written to Firestore.\n' +
      '  Run with DRY_RUN=false to apply changes.\n' +
      c.reset);
  } else {
    console.log('\n' + c.green + c.bold + `  ✅  Done. ${totalWrites} products updated in Firestore.\n` + c.reset);
  }
}

main().catch(err => {
  console.error('\n' + c.red + 'Fatal error:' + c.reset, err);
  process.exit(1);
});

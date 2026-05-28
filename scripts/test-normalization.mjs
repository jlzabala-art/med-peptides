/**
 * test-normalization.mjs — Phase 2d
 * ─────────────────────────────────────────────────────────────────────────────
 * Smoke-tests the normalizePeptide() and normalizeSupplement() functions by
 * processing 3 sample peptides and 3 sample supplements and validating each
 * output against the canonical v2 schema.
 *
 * Run:
 *   node scripts/test-normalization.mjs
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more validation errors detected
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { normalizePeptide, normalizeSupplement } from '../src/schemas/productNormalizer.js';
import { validateProduct, PRODUCT_TYPE }         from '../src/schemas/productSchema.js';

// ── ANSI colors for readable output ──────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  dim:    '\x1b[2m',
};
const ok   = `${C.green}✔${C.reset}`;
const fail = `${C.red}✘${C.reset}`;
const info = `${C.cyan}ℹ${C.reset}`;

// ── Sample peptides (real records from src/data/products.js) ─────────────────
const SAMPLE_PEPTIDES = [
  {
    // BPC-157 — full record with faqModalItems and scientificModalEnabled
    category: 'Recovery & Repair',
    name: 'BPC-157',
    cas: '137525-51-0',
    desc: 'A pentadecapeptide with potent cytoprotective, angiogenic, and wound-healing properties under experimental conditions.',
    dosage: '5mg/vial',
    quantity: '10 vial/kit',
    objective: 'Healing, Recovery, Inflammation, Repair',
    image: '/assets/vials/bpc157.png',
    goals: ['healing', 'recovery', 'inflammation', 'repair'],
    secondaryFactors: ['gut_health', 'joint_support', 'tendon_repair'],
    tags: ['Healing', 'Recovery', 'Anti-inflammatory'],
    mechanisms: ['cytoprotective', 'angiogenic', 'collagen synthesis'],
    semanticKeywords: ['injury', 'wound healing', 'gut', 'repair peptide', 'recovery'],
    synonyms: ['body protection compound 157', 'pentadecapeptide', 'bpc157'],
    safetyNote: 'Ensure strictly for research purposes.',
    mechanismOfAction: {
      summary: 'Repair-oriented research peptide commonly surfaced in tissue-response, recovery, and integrity-related contexts.',
      researchFocus: ['recovery', 'tissue support', 'repair-related research'],
    },
    faqModalItems: [
      { q: 'What is the main research positioning for BPC-157?', a: 'BPC-157 is commonly positioned around repair, recovery, and tissue-support themes.' },
    ],
    scientificModalEnabled: true,
    faqModalEnabled: true,
    productType: 'peptide',
    slug: 'bpc-157',
    variants: [
      {
        variantId: 'bpc-157-sc-default',
        label: '5mg/vial – SC',
        attributes: { dosageMg: 5, unitsPerPack: 10, administration: 'SC', format: 'lyophilized' },
        pricing: { retail: { perUnit: 40, kit: 250, currency: 'USD', billingUnit: 'vial', kitBillingUnit: 'kit' } },
      },
    ],
  },
  {
    // TB-500 — recovery peptide, tests multiple synonyms
    category: 'Recovery & Repair',
    name: 'TB-500 (Thymosin β4)',
    cas: '77591-33-4',
    desc: 'A synthetic version of the naturally occurring peptide present in all cellular components.',
    objective: 'Healing, Recovery, Performance, Injury',
    image: '/assets/vials/tb500.png',
    goals: ['healing', 'recovery', 'injury_repair'],
    secondaryFactors: ['flexibility', 'inflammation_reduction', 'muscle_repair'],
    tags: ['Healing', 'Recovery', 'Performance'],
    mechanisms: ['actin-binding', 'endothelial cell migration', 'angiogenesis stimulus'],
    semanticKeywords: ['injury', 'wound healing', 'TB-500', 'repair peptide'],
    synonyms: ['thymosin beta 4', 'tb500', 'tb-500'],
    safetyNote: 'Research-grade peptide.',
    mechanismOfAction: {
      summary: 'Recovery-oriented research peptide family commonly surfaced in repair and tissue-response exploration.',
      researchFocus: [],
    },
    faqModalItems: [],
    scientificModalEnabled: true,
    faqModalEnabled: true,
    productType: 'peptide',
    slug: 'tb-500-thymosin-4',
    variants: [
      {
        variantId: 'tb-500-thymosin-4-sc-default',
        label: '2mg/vial – SC',
        attributes: { dosageMg: 2, unitsPerPack: 10, administration: 'SC', format: 'lyophilized' },
        pricing: { retail: { perUnit: 22, kit: 140, currency: 'USD', billingUnit: 'vial', kitBillingUnit: 'kit' } },
      },
    ],
  },
  {
    // Minimal peptide — NEGATIVE TEST: verifies the schema catches missing cas + empty variants
    __expectInvalid: true,
    __expectedErrors: ['Missing root field: "cas"', 'variants must be a non-empty array'],
    category: 'Cognitive & Mood',
    name: 'Selank',
    desc: 'A synthetic analogue of the immunomodulatory peptide tuftsin with anxiolytic properties.',
    objective: 'Anxiety, Cognitive Enhancement',
    goals: ['focus', 'stress_reduction'],
    tags: ['Cognitive', 'Mood'],
    mechanisms: ['GABAergic modulation', 'BDNF upregulation'],
    semanticKeywords: ['anxiety', 'cognitive enhancement', 'nootropic'],
    synonyms: ['selank peptide'],
    productType: 'peptide',
    variants: [],  // intentionally empty → validator must reject
    // no cas field    → validator must reject
  },
];

// ── Sample supplements (real records from src/data/supplements.js) ────────────
const SAMPLE_SUPPLEMENTS = [
  {
    // Ashwagandha 100mg — typical supplement with all fields
    category: 'Adaptogens & Botanicals',
    name: 'Ashwagandha',
    type: 'supplement',
    desc: 'A potent Ayurvedic adaptogen studied for its ability to modulate the HPA axis and lower cortisol levels.',
    dosage: '100mg',
    quantity: '60 caps',
    objective: 'Stress & Recovery',
    image: '/assets/vials/generic-supplement.png',
    goals: ['sleep', 'recovery', 'stress_reduction'],
    tags: ['Recovery', 'Stress', 'Adaptogen'],
    semanticKeywords: ['adaptogens & botanicals', 'ashwagandha', 'stress & recovery', 'sleep'],
    synonyms: ['ashwagandha'],
    status: 'active',
    clinical_benefits: ['Stress reduction', 'Cortisol management', 'Sleep improvement', 'Fatigue reduction'],
    mechanisms: ['HPA axis modulation', 'GABAergic signaling support'],
    protocols: ['Stress & HPA Axis Reset', 'Sleep Optimization Protocol', 'Athletic Recovery Protocol'],
    commonly_combined_with: ['Rhodiola Rosea', 'Magnolia', 'L-Theanine', 'Melatonin'],
    pricing: { retail: { perUnit: 21.6, currency: 'USD' } },
  },
  {
    // Rhodiola Rosea 200mg — tests a different dosage of the same product name
    category: 'Adaptogens & Botanicals',
    name: 'Rhodiola Rosea',
    type: 'supplement',
    desc: 'An arctic adaptogen researched for reducing stress-related fatigue and enhancing mental clarity.',
    dosage: '200mg',
    quantity: '60 caps',
    objective: 'Energy & Focus',
    image: '/assets/vials/generic-supplement.png',
    goals: ['focus', 'stamina', 'energy'],
    tags: ['Energy', 'Cognitive', 'Adaptogen'],
    semanticKeywords: ['adaptogens & botanicals', 'focus', 'energy', 'rhodiola rosea'],
    synonyms: ['rhodiola rosea'],
    status: 'active',
    clinical_benefits: ['Fatigue reduction', 'Stress resilience', 'Cognitive support', 'Physical stamina'],
    mechanisms: ['Monoamine modulation', 'Beta-endorphin support'],
    protocols: ['Stress & HPA Axis Reset', 'Cognitive Performance Protocol'],
    commonly_combined_with: ['Ashwagandha', 'L-Theanine', 'Ginkgo Biloba', 'B-Complex'],
    pricing: { retail: { perUnit: 23.76, currency: 'USD' } },
  },
  {
    // Minimal supplement — tests fallbacks (no status, no protocols, no synonyms)
    category: 'Vitamins & Minerals',
    name: 'Vitamin D3',
    type: 'supplement',
    desc: 'An essential fat-soluble vitamin produced by the skin upon sunlight exposure.',
    dosage: '5000 IU',
    quantity: '90 softgels',
    objective: 'Immune Support & Bone Health',
    goals: ['immune_support', 'bone_health'],
    tags: ['Vitamins', 'Immune'],
    pricing: { retail: { perUnit: 15.0, currency: 'USD' } },
  },
];

// ── Validation helpers ────────────────────────────────────────────────────────

/**
 * Assert a value is truthy; returns a result object.
 */
function check(label, value) {
  return { label, passed: Boolean(value) };
}

/**
 * Run shape checks on a canonical product.
 * Returns an array of { label, passed } objects.
 */
function shapeChecks(product, expectedType) {
  return [
    check('has id (string)',                    typeof product.id === 'string' && product.id.length > 0),
    check('has name (string)',                  typeof product.name === 'string' && product.name.length > 0),
    check('has slug matching id',              product.slug === product.id),
    check(`productType === "${expectedType}"`, product.productType === expectedType),
    check('has status',                         Boolean(product.status)),
    check('has identity block',                 product.identity && typeof product.identity === 'object'),
    check('has science block',                  product.science  && typeof product.science  === 'object'),
    check('has classification block',           product.classification && typeof product.classification === 'object'),
    check('has aiContent block',                product.aiContent && typeof product.aiContent === 'object'),
    check('has typeData block',                 product.typeData && typeof product.typeData === 'object'),
    check('has ui block',                       product.ui && typeof product.ui === 'object'),
    check('has meta block',                     product.meta && typeof product.meta === 'object'),
    check('variants is array',                  Array.isArray(product.variants)),
    check('meta.schemaVersion exists',         product.meta.schemaVersion !== undefined),
    check('identity.searchAliases is array',    Array.isArray(product.identity.searchAliases)),
    check('classification.goals is array',      Array.isArray(product.classification.goals)),
  ];
}

/**
 * Run schema validator and collect errors.
 */
function runSchemaValidator(product) {
  const result = validateProduct(product);
  return {
    valid:  result.valid,
    errors: result.errors || [],
  };
}

// ── Test runner ───────────────────────────────────────────────────────────────

function runGroup(label, samples, normalizeFn, expectedType) {
  console.log(`\n${C.bold}${C.cyan}━━━ ${label} ━━━${C.reset}\n`);

  let groupPassed = 0;
  let groupFailed = 0;

  for (const [i, sample] of samples.entries()) {
    const displayName = sample.name || `sample-${i + 1}`;
    const expectInvalid = sample.__expectInvalid === true;
    const label_prefix = expectInvalid ? `${C.yellow}[NEGATIVE]${C.reset} ` : '';
    console.log(`${C.bold}  [${i + 1}] ${label_prefix}${displayName}${C.reset}`);

    let product;
    try {
      product = normalizeFn(sample);
    } catch (err) {
      console.log(`  ${fail} normalization threw: ${C.red}${err.message}${C.reset}\n`);
      groupFailed++;
      continue;
    }

    // Shape checks (always run)
    const checks = shapeChecks(product, expectedType);
    for (const c of checks) {
      if (c.passed) {
        console.log(`    ${ok} ${C.dim}${c.label}${C.reset}`);
        groupPassed++;
      } else {
        console.log(`    ${fail} ${C.red}${c.label}${C.reset}`);
        groupFailed++;
      }
    }

    // Schema validator
    const { valid, errors } = runSchemaValidator(product);

    if (expectInvalid) {
      // Negative test: we EXPECT the validator to find errors
      const expectedErrors = sample.__expectedErrors || [];
      if (!valid) {
        // Check that each expected error pattern appears in the actual errors
        let allExpectedFound = true;
        for (const pattern of expectedErrors) {
          const found = errors.some((e) => e.includes(pattern));
          if (found) {
            console.log(`    ${ok} ${C.dim}(expected) validator caught: "${pattern}"${C.reset}`);
            groupPassed++;
          } else {
            console.log(`    ${fail} ${C.red}expected error not found: "${pattern}"${C.reset}`);
            groupFailed++;
            allExpectedFound = false;
          }
        }
        if (expectedErrors.length === 0) {
          console.log(`    ${ok} ${C.dim}(expected) validateProduct() → invalid as expected${C.reset}`);
          groupPassed++;
        }
      } else {
        console.log(`    ${fail} ${C.red}(negative test) expected validation errors but none were found${C.reset}`);
        groupFailed++;
      }
    } else {
      // Positive test: we EXPECT the validator to pass
      if (valid) {
        console.log(`    ${ok} ${C.dim}validateProduct() → valid${C.reset}`);
        groupPassed++;
      } else {
        console.log(`    ${fail} ${C.red}validateProduct() errors:${C.reset}`);
        for (const e of errors) {
          console.log(`       ${C.yellow}• ${e}${C.reset}`);
        }
        groupFailed++;
      }
    }

    // Variant summary
    const vCount = product.variants.length;
    console.log(`    ${info} ${C.dim}variants: ${vCount}${C.reset}`);
    if (vCount > 0) {
      const v = product.variants[0];
      console.log(`    ${info} ${C.dim}variant[0].id = "${v.id}"  sku = "${v.sku}"${C.reset}`);
      console.log(`    ${info} ${C.dim}variant[0].route = "${v.route}"${C.reset}`);
    }

    console.log();
  }

  return { groupPassed, groupFailed };
}

// ── Entry point ───────────────────────────────────────────────────────────────

console.log(`\n${C.bold}${C.cyan}╔══════════════════════════════════════════════════════╗`);
console.log(`║        Normalization Test Suite — Phase 2d           ║`);
console.log(`╚══════════════════════════════════════════════════════╝${C.reset}`);

let totalPassed = 0;
let totalFailed = 0;

const { groupPassed: pp, groupFailed: pf } = runGroup(
  'Peptides (normalizePeptide)',
  SAMPLE_PEPTIDES,
  normalizePeptide,
  PRODUCT_TYPE.PEPTIDE,
);
totalPassed += pp;
totalFailed += pf;

const { groupPassed: sp, groupFailed: sf } = runGroup(
  'Supplements (normalizeSupplement)',
  SAMPLE_SUPPLEMENTS,
  normalizeSupplement,
  PRODUCT_TYPE.SUPPLEMENT,
);
totalPassed += sp;
totalFailed += sf;

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`${C.bold}━━━ Summary ━━━${C.reset}`);
console.log(`  ${ok} Passed: ${C.green}${totalPassed}${C.reset}`);
if (totalFailed > 0) {
  console.log(`  ${fail} Failed: ${C.red}${totalFailed}${C.reset}`);
} else {
  console.log(`  ${ok} ${C.green}${C.bold}All checks passed!${C.reset}`);
}
console.log();

process.exit(totalFailed > 0 ? 1 : 0);

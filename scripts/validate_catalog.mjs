/**
 * scripts/validate_catalog.mjs
 * Validates the schema, formatting, route types, and clinical goals of the
 * products (peptides) and supplements in the local data files before syncing.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Standard Sets for Validation ──────────────────────────────────────────
const ALLOWED_GOALS = new Set([
  'healing', 'recovery', 'inflammation', 'repair', 'sleep', 'stress_reduction',
  'focus', 'stamina', 'energy', 'circulation', 'memory', 'joint_health',
  'mobility', 'brain_health', 'neuroregeneration', 'anti_aging', 'cardio_health',
  'longevity', 'metabolism', 'weight_loss', 'blood_sugar', 'insulin_sensitivity',
  'obesity', 'appetite_suppression', 'cardiovascular_health', 'immune_support',
  'gut_health', 'joint_support', 'tendon_repair', 'skin_health', 'collagen_production',
  'wound_healing', 'rejuvenation', 'health_optimization', 'aging', 'detox',
  'hair_growth', 'cognitive', 'adaptogens_botanicals', 'amino_acids', 'testing',
  'cell_health', 'muscle_growth'
]);

const ALLOWED_ROUTES = new Set([
  'injectable_vial', 'injectable_pen', 'oral_capsule', 'oral_tablet', 'topical', 'nasal', 'testing'
]);

const ALLOWED_PRODUCT_TYPES = new Set([
  'peptide', 'supplement', 'testing', 'supplies'
]);

// ── Load Helper ──────────────────────────────────────────────────────────
const loadSource = (path, varName) => {
  try {
    const raw = readFileSync(path, 'utf-8');
    const evalSource = raw
      .replace(/export const productCategories[\s\S]*?];/, '')
      .replace(new RegExp(`export const ${varName} = `), `const ${varName} = `)
      .replace(/export default/, '// export default');
    
    const fn = new Function(`${evalSource}; return ${varName};`);
    return fn();
  } catch (err) {
    console.error(`❌ Failed to parse ${path}:`, err.message);
    return null;
  }
};

async function validate() {
  console.log("\n🧪 Med-Peptides Catalog Schema Validator");
  console.log("──────────────────────────────────────────────────\n");

  const peptidePath = join(__dirname, '../src/data/products.js');
  const supplementPath = join(__dirname, '../src/data/supplements.js');

  const peptides = loadSource(peptidePath, 'products');
  const supplements = loadSource(supplementPath, 'supplements');

  if (!peptides || !supplements) {
    console.error("❌ Critical parse error: Unable to load data files.");
    process.exit(1);
  }

  console.log(`Loaded ${peptides.length} peptides and ${supplements.length} supplements for validation.\n`);

  let errors = 0;
  let warnings = 0;

  const validateProduct = (p, index, fileLabel) => {
    const pName = p.name || `Unnamed (Index ${index})`;
    const pType = p.productType || p.type || 'unknown';

    // 1. Mandatory Core Fields
    if (!p.name) {
      console.log(`  ❌ [ERROR] ${fileLabel}: Item at index ${index} is missing 'name'`);
      errors++;
    }
    if (!p.desc && !p.description) {
      console.log(`  ❌ [ERROR] ${fileLabel}: ${pName} is missing description ('desc' or 'description')`);
      errors++;
    }
    if (!p.category) {
      console.log(`  ❌ [ERROR] ${fileLabel}: ${pName} is missing 'category'`);
      errors++;
    }

    // 2. Product Type check
    if (!ALLOWED_PRODUCT_TYPES.has(pType)) {
      console.log(`  ❌ [ERROR] ${fileLabel}: ${pName} has invalid productType '${pType}'`);
      errors++;
    }

    // 3. Goals validation
    if (!p.goals) {
      console.log(`  ❌ [ERROR] ${fileLabel}: ${pName} is missing 'goals' array`);
      errors++;
    } else if (!Array.isArray(p.goals)) {
      console.log(`  ❌ [ERROR] ${fileLabel}: ${pName} 'goals' field must be an array`);
      errors++;
    } else if (p.goals.length === 0) {
      console.log(`  ⚠️  [WARN] ${fileLabel}: ${pName} has an empty 'goals' array`);
      warnings++;
    } else {
      p.goals.forEach(goal => {
        if (!ALLOWED_GOALS.has(goal)) {
          console.log(`  ⚠️  [WARN] ${fileLabel}: ${pName} has non-standard goal '${goal}'`);
          warnings++;
        }
      });
    }

    // 4. Clinical Guidelines Check
    const t = p.typeData || {};
    const hasDosageRange = !!(t.dosageRange || p.dosageRange);
    const hasPK = !!(p.pharmacokinetics || t.halfLife);
    const hasMOA = !!(t.mechanismOfAction || p.mechanismOfAction || p.aiContent?.scientificSummary || p.scientificSummary);

    if (!hasDosageRange) {
      console.log(`  ⚠️  [WARN] ${fileLabel}: ${pName} lacks clinical dosage ranges.`);
      warnings++;
    }
    if (!hasPK && pType === 'peptide') {
      console.log(`  ⚠️  [WARN] ${fileLabel}: ${pName} (peptide) lacks pharmacokinetics / half-life info.`);
      warnings++;
    }
    if (!hasMOA) {
      console.log(`  ⚠️  [WARN] ${fileLabel}: ${pName} is missing scientific mechanism summaries.`);
      warnings++;
    }

    // 5. Scientific/Synonyms metadata
    if (!p.scientificName && pType === 'peptide') {
      console.log(`  ⚠️  [WARN] ${fileLabel}: ${pName} is missing scientific / chemical nomenclature.`);
      warnings++;
    }

    // 6. Stability Note
    if (!(p.stabilityNote || t.stabilityNote || p.storage_conditions || t.storage)) {
      console.log(`  ⚠️  [WARN] ${fileLabel}: ${pName} is missing stability and storage conditions.`);
      warnings++;
    }

    // 7. Route and Variants check
    const variants = p.variants || [];
    if (variants.length > 0) {
      variants.forEach((v, idx) => {
        const vRoute = v.route || p.route || 'unknown';
        if (vRoute === 'unknown') {
          console.log(`  ⚠️  [WARN] ${fileLabel}: ${pName} variant #${idx} is missing a route`);
          warnings++;
        } else if (!ALLOWED_ROUTES.has(vRoute)) {
          console.log(`  ❌ [ERROR] ${fileLabel}: ${pName} variant #${idx} has invalid route '${vRoute}'`);
          errors++;
        }
        if (!v.pricing && !p.pricing) {
          console.log(`  ❌ [ERROR] ${fileLabel}: ${pName} variant #${idx} lacks pricing structures`);
          errors++;
        }
        if (!v.sku) {
          console.log(`  ⚠️  [WARN] ${fileLabel}: ${pName} variant #${idx} is missing a canonical SKU`);
          warnings++;
        }
      });
    } else {
      // If flat structure, check route at product level
      const pRoute = p.route || 'unknown';
      if (pRoute === 'unknown') {
        console.log(`  ⚠️  [WARN] ${fileLabel}: ${pName} is missing a route`);
        warnings++;
      } else if (!ALLOWED_ROUTES.has(pRoute)) {
        console.log(`  ❌ [ERROR] ${fileLabel}: ${pName} has invalid route '${pRoute}'`);
        errors++;
      }
    }
  };

  console.log("=== Validating Peptides ===");
  peptides.forEach((p, idx) => validateProduct(p, idx, 'products.js'));

  console.log("\n=== Validating Supplements ===");
  supplements.forEach((s, idx) => validateProduct(s, idx, 'supplements.js'));

  console.log("\n──────────────────────────────────────────────────");
  console.log(`Validation finished:`);
  console.log(`  ❌ Errors   : ${errors}`);
  console.log(`  ⚠️  Warnings : ${warnings}`);

  if (errors > 0) {
    console.error(`\n❌ Schema Validation FAILED: ${errors} errors must be resolved.`);
    process.exit(1);
  } else {
    console.log(`\n✅ Schema Validation PASSED: Catalog is clean and ready!`);
    process.exit(0);
  }
}

validate().catch(err => {
  console.error("Fatal exception during validation:", err);
  process.exit(1);
});

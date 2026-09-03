/**
 * seedIvDrips.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Importa el catálogo IV Drip desde iv_drip_catalog_import.json a Firestore.
 * Colecciones: iv_ingredients_master, iv_vials
 *
 * Uso:
 *   node src/scripts/seedIvDrips.mjs
 *   node src/scripts/seedIvDrips.mjs --dry-run   (solo valida, no escribe)
 *   node src/scripts/seedIvDrips.mjs --force      (sobreescribe registros existentes)
 *
 * Reglas de negocio (iv_drip_application_prompt.txt):
 *  1. Un vial = formulación única. No duplicar si dos nombres usan la misma fórmula.
 *  2. quantity > 0 o null + requires_review=true.
 *  3. unit es obligatorio si quantity está presente.
 *  4. Precio por defecto: cost=250, clinic=500, margin=50%.
 *  5. No hacer alias de ingredientes opcionales como base — van a optional_separate_vials.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');

// ─── Firebase Admin init ──────────────────────────────────────────────────────
const svcPath = fs.existsSync(path.join(ROOT, 'serviceAccountKey.json'))
  ? path.join(ROOT, 'serviceAccountKey.json')
  : path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(svcPath)) {
  console.error('❌  serviceAccountKey.json not found. Place it at the project root or in src/scripts/');
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(svcPath, 'utf8'));
if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

// ─── CLI flags ────────────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE   = process.argv.includes('--force');
if (DRY_RUN) console.log('🔍  DRY-RUN mode — no writes will happen.\n');
if (FORCE)   console.log('⚡  FORCE mode — existing records will be overwritten.\n');

// ─── Load source JSON ─────────────────────────────────────────────────────────
const catalogPath = path.join(ROOT, 'iv_drip_catalog_import.json');
if (!fs.existsSync(catalogPath)) {
  console.error('❌  iv_drip_catalog_import.json not found at:', catalogPath);
  process.exit(1);
}
const source = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const { catalog, ingredients_master: ingredients, vials } = source;

// ─── Counters ─────────────────────────────────────────────────────────────────
const summary = {
  ingredients: { created: 0, updated: 0, skipped: 0, errors: 0 },
  vials:       { created: 0, updated: 0, skipped: 0, errors: 0, warnings: 0 },
};
const warnings = [];

// ─── Validation helpers ────────────────────────────────────────────────────────
function validateIngredient(ing) {
  const errs = [];
  if (!ing.ingredient_id) errs.push('missing ingredient_id');
  if (!ing.name)          errs.push('missing name');
  return errs;
}

function validateVialIngredient(item, vialId) {
  const errs = [];
  if (!item.ingredient_id) errs.push(`${vialId}: ingredient entry missing ingredient_id`);
  if (item.quantity != null && item.quantity <= 0) {
    errs.push(`${vialId}: ingredient ${item.ingredient_id} has quantity <= 0`);
  }
  if (item.quantity != null && !item.unit) {
    errs.push(`${vialId}: ingredient ${item.ingredient_id} has quantity but no unit`);
  }
  return errs;
}

function normalizeIngredient(item, knownIds) {
  const needs_review = item.quantity == null;
  if (!knownIds.has(item.ingredient_id)) {
    warnings.push(`⚠️  ingredient_id "${item.ingredient_id}" not in ingredients_master`);
  }
  return {
    ingredient_id:   item.ingredient_id,
    quantity:        item.quantity ?? null,
    unit:            item.unit     ?? null,
    requires_review: needs_review,
    sequence:        item.sequence ?? null,
  };
}

// ─── 1. Seed ingredients_master ───────────────────────────────────────────────
console.log('── Step 1: Seeding ingredients_master ──────────────────────────────');
const knownIngredientIds = new Set(ingredients.map(i => i.ingredient_id));

for (const ing of ingredients) {
  const errs = validateIngredient(ing);
  if (errs.length > 0) {
    console.error('  ✗ Validation error:', errs.join(', '));
    summary.ingredients.errors++;
    continue;
  }

  const docRef = db.collection('iv_ingredients_master').doc(ing.ingredient_id);

  if (!FORCE) {
    const existing = await docRef.get();
    if (existing.exists) {
      console.log(`  ↷  SKIP ingredient: ${ing.ingredient_id}`);
      summary.ingredients.skipped++;
      continue;
    }
  }

  const data = {
    ingredient_id: ing.ingredient_id,
    name:          ing.name,
    common_name:   ing.common_name || null,
    active:        true,
    created_at:    FieldValue.serverTimestamp(),
    updated_at:    FieldValue.serverTimestamp(),
  };

  if (DRY_RUN) {
    console.log(`  ✓  [DRY] Would write ingredient: ${ing.ingredient_id}`);
  } else {
    await docRef.set(data, { merge: true });
    console.log(`  ✓  ingredient: ${ing.ingredient_id}`);
  }
  summary.ingredients.created++;
}

console.log(`\n  Ingredients → created: ${summary.ingredients.created}, skipped: ${summary.ingredients.skipped}, errors: ${summary.ingredients.errors}\n`);

// ─── 2. Seed iv_vials ─────────────────────────────────────────────────────────
console.log('── Step 2: Seeding iv_vials ────────────────────────────────────────');
const DEFAULT_PRICING = catalog.default_pricing;

for (const vial of vials) {
  if (!vial.vial_id) {
    console.error('  ✗  Vial missing vial_id — skipping');
    summary.vials.errors++;
    continue;
  }
  if (!vial.sku) {
    console.error(`  ✗  Vial ${vial.vial_id} missing SKU — skipping`);
    summary.vials.errors++;
    continue;
  }

  // Validate + normalize ingredients
  const normalizedIngredients = [];
  for (const item of (vial.ingredients || [])) {
    const errs = validateVialIngredient(item, vial.vial_id);
    if (errs.length > 0) {
      errs.forEach(e => warnings.push(`⚠️  ${e}`));
      summary.vials.warnings++;
    }
    normalizedIngredients.push(normalizeIngredient(item, knownIngredientIds));
  }

  const normalizedOptionals = (vial.optional_separate_vials || []).map(opt =>
    normalizeIngredient(opt, knownIngredientIds)
  );

  const hasReview = normalizedIngredients.some(i => i.requires_review) ||
                    normalizedOptionals.some(i => i.requires_review);

  // Build Firestore document
  const data = {
    vial_id:               vial.vial_id,
    sku:                   vial.sku,
    type:                  vial.type || 'standard',
    commercial_names:      vial.commercial_names || [],
    categories:            vial.categories || [],
    volume_ml:             vial.volume_ml || null,
    ingredients:           normalizedIngredients,
    optional_separate_vials: normalizedOptionals,
    requires_review:       hasReview,
    administration:        catalog.administration || null,
    pricing: {
      internal_cost_aed:     vial.pricing?.internal_cost_aed     ?? DEFAULT_PRICING.internal_cost_aed,
      clinic_price_aed:      vial.pricing?.clinic_price_aed      ?? DEFAULT_PRICING.clinic_price_aed,
      gross_profit_aed:      vial.pricing?.gross_profit_aed      ?? DEFAULT_PRICING.gross_profit_aed,
      markup_on_cost_percent:vial.pricing?.markup_on_cost_percent ?? DEFAULT_PRICING.markup_on_cost_percent,
      gross_margin_percent:  vial.pricing?.gross_margin_percent  ?? DEFAULT_PRICING.gross_margin_percent,
    },
    professional_use_only: catalog.professional_use_only ?? true,
    active:                true,
    version:               1,
    created_at:            FieldValue.serverTimestamp(),
    updated_at:            FieldValue.serverTimestamp(),
    created_by:            'seed_script',
    updated_by:            'seed_script',
  };

  const docRef = db.collection('iv_vials').doc(vial.vial_id);

  if (!FORCE) {
    const existing = await docRef.get();
    if (existing.exists) {
      console.log(`  ↷  SKIP vial: ${vial.vial_id} (${vial.sku})`);
      summary.vials.skipped++;
      continue;
    }
  }

  if (DRY_RUN) {
    console.log(`  ✓  [DRY] Would write vial: ${vial.vial_id} — "${vial.commercial_names?.[0]}" (${normalizedIngredients.length} ingredients${normalizedOptionals.length > 0 ? ` + ${normalizedOptionals.length} add-ons` : ''})`);
    if (hasReview) console.log(`     ⚠️  requires_review=true`);
  } else {
    await docRef.set(data, { merge: !FORCE });
    console.log(`  ✓  vial: ${vial.vial_id} — "${vial.commercial_names?.[0]}"`);
    if (hasReview) console.log(`     ⚠️  requires_review=true`);
  }
  summary.vials.created++;
}

// ─── Summary report ───────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════════════════════════════');
console.log('  IMPORT SUMMARY');
console.log('════════════════════════════════════════════════════════════════════');
console.log(`  Ingredients  →  created: ${summary.ingredients.created}  |  skipped: ${summary.ingredients.skipped}  |  errors: ${summary.ingredients.errors}`);
console.log(`  Vials        →  created: ${summary.vials.created}        |  skipped: ${summary.vials.skipped}        |  errors: ${summary.vials.errors}  |  warnings: ${summary.vials.warnings}`);

if (warnings.length > 0) {
  console.log('\n  ── Validation Warnings ──────────────────────────────────────────────');
  warnings.forEach(w => console.log(`  ${w}`));
}

console.log('\n  ── Unique vials created ─────────────────────────────────────────────');
vials.forEach(v => {
  if (v.vial_id) console.log(`  • ${v.vial_id.padEnd(40)} ${(v.commercial_names || []).join(' / ')}`);
});

console.log('\n✅  IV Drip import complete.\n');

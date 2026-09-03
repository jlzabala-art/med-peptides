/**
 * importIvDripCatalog.mjs
 * ─────────────────────────────────────────────────────────────────────────
 * Importa iv_drip_catalog_import.json a Firestore (Admin SDK).
 * Colecciones creadas:
 *   • iv_ingredients_master  — 31 ingredientes normalizados
 *   • iv_vials               — 13 formulaciones únicas (15 con aliases)
 *   • iv_catalog_meta        — configuración global del catálogo
 *
 * Uso: node src/scripts/importIvDripCatalog.mjs
 * ─────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf-8')
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const jsonPath = join(__dirname, '../../iv_drip_catalog_import.json');

// ── Import Summary ───────────────────────────────────────────────────────────
const summary = {
  ingredients:    { created: 0, updated: 0, skipped: 0, errors: [] },
  vials:          { created: 0, updated: 0, skipped: 0, errors: [] },
  warnings:       [],
  requiresReview: []
};

const now = () => new Date().toISOString();

const log = {
  info:    (m) => console.log(`  ℹ️  ${m}`),
  success: (m) => console.log(`  ✅ ${m}`),
  warn:    (m) => console.warn(`  ⚠️  ${m}`),
  error:   (m) => console.error(`  ❌ ${m}`),
  section: (m) => console.log(`\n${'─'.repeat(60)}\n🔹 ${m}\n${'─'.repeat(60)}`),
};

function formulaFingerprint(ingredients) {
  if (!ingredients || ingredients.length === 0) return 'empty';
  return ingredients
    .map(i => `${i.ingredient_id}:${i.quantity ?? 'null'}:${i.unit ?? 'null'}`)
    .sort().join('|');
}

function validateIngredientRef(entry, masterIds, vialId) {
  const errors = [], warns = [];
  if (!masterIds.has(entry.ingredient_id))
    errors.push(`Vial ${vialId}: ingredient_id '${entry.ingredient_id}' NOT in master`);
  if (entry.quantity === null || entry.quantity === undefined)
    warns.push(`Vial ${vialId}: '${entry.ingredient_id}' has null quantity → requires_review`);
  else if (typeof entry.quantity !== 'number' || entry.quantity <= 0)
    errors.push(`Vial ${vialId}: '${entry.ingredient_id}' invalid quantity: ${entry.quantity}`);
  if (entry.quantity != null && !entry.unit)
    errors.push(`Vial ${vialId}: '${entry.ingredient_id}' has quantity but no unit`);
  return { errors, warns };
}

function validateVial(vial, masterIds, fpMap) {
  const errors = [], warns = [], requiresReview = [];
  if (!vial.vial_id) errors.push('Missing vial_id');
  if (!vial.sku)     errors.push(`Vial ${vial.vial_id}: Missing SKU`);
  if (!Array.isArray(vial.commercial_names) || vial.commercial_names.length === 0)
    errors.push(`Vial ${vial.vial_id}: Must have at least one commercial_name`);

  for (const ing of (vial.ingredients || [])) {
    const v = validateIngredientRef(ing, masterIds, vial.vial_id);
    errors.push(...v.errors); warns.push(...v.warns);
    if (ing.quantity == null)
      requiresReview.push({ vial_id: vial.vial_id, ingredient_id: ing.ingredient_id, reason: 'null quantity' });
  }
  for (const opt of (vial.optional_separate_vials || [])) {
    const v = validateIngredientRef(opt, masterIds, `${vial.vial_id}[optional]`);
    errors.push(...v.errors); warns.push(...v.warns);
    if (opt.quantity == null)
      requiresReview.push({ vial_id: vial.vial_id, ingredient_id: opt.ingredient_id, reason: 'null quantity in optional', note: opt.note || null });
  }

  const p = vial.pricing || {};
  if (p.clinic_price_aed && p.internal_cost_aed && p.clinic_price_aed < p.internal_cost_aed)
    warns.push(`Vial ${vial.vial_id}: clinic_price < internal_cost — Admin confirmation required`);

  if (vial.type === 'standard' && (vial.ingredients || []).length > 0) {
    const fp = formulaFingerprint(vial.ingredients);
    if (fpMap.has(fp)) warns.push(`Vial ${vial.vial_id}: same formula as '${fpMap.get(fp)}' — alias detected`);
    else fpMap.set(fp, vial.vial_id);
  }
  return { errors, warns, requiresReview };
}

// ── Import Ingredients (batch) ───────────────────────────────────────────────
async function importIngredients(ingredients) {
  log.section(`Importing ${ingredients.length} ingredients → 'iv_ingredients_master'`);
  const masterIds = new Set();
  const batch = db.batch();

  for (const ing of ingredients) {
    if (!ing.ingredient_id) { summary.ingredients.skipped++; continue; }
    masterIds.add(ing.ingredient_id);
    const ref = db.collection('iv_ingredients_master').doc(ing.ingredient_id);
    batch.set(ref, {
      ingredient_id: ing.ingredient_id,
      name:          ing.name,
      common_name:   ing.common_name || null,
      active:        true,
      created_at:    now(),
      updated_at:    now(),
      created_by:    'import_iv_drip_v1',
    }, { merge: true });
    summary.ingredients.created++;
    log.info(`${ing.ingredient_id} — ${ing.name}${ing.common_name ? ` (${ing.common_name})` : ''}`);
  }

  await batch.commit();
  log.success(`${summary.ingredients.created} ingredients committed`);
  return masterIds;
}

// ── Import Catalog Meta ──────────────────────────────────────────────────────
async function importCatalogMeta(catalog) {
  log.section(`Importing catalog metadata → 'iv_catalog_meta'`);
  await db.collection('iv_catalog_meta').doc(catalog.catalog_id).set({
    catalog_id:            catalog.catalog_id,
    name:                  catalog.name,
    currency:              catalog.currency,
    professional_use_only: catalog.professional_use_only,
    source_note:           catalog.source_note,
    default_pricing:       catalog.default_pricing,
    administration:        catalog.administration,
    disclaimer:            'All IV formulations are for professional clinic use only. They require a valid prescription and physician approval before administration.',
    created_at:            now(),
    updated_at:            now(),
    created_by:            'import_iv_drip_v1',
  }, { merge: true });
  log.success(`Catalog meta saved: ${catalog.catalog_id}`);
}

// ── Import Vials ─────────────────────────────────────────────────────────────
async function importVials(vials, masterIds) {
  log.section(`Importing ${vials.length} vials → 'iv_vials'`);
  const fpMap  = new Map();
  const skuSet = new Set();

  for (const vial of vials) {
    const { errors, warns, requiresReview } = validateVial(vial, masterIds, fpMap);

    if (errors.length > 0) {
      errors.forEach(e => { log.error(e); summary.vials.errors.push(e); });
      summary.vials.skipped++;
      continue;
    }
    warns.forEach(w  => { log.warn(w);  summary.warnings.push(w); });
    requiresReview.forEach(r => summary.requiresReview.push(r));

    if (skuSet.has(vial.sku)) {
      const msg = `Duplicate SKU '${vial.sku}' (${vial.vial_id}) — SKIPPED`;
      log.error(msg); summary.vials.errors.push(msg); summary.vials.skipped++;
      continue;
    }
    skuSet.add(vial.sku);

    const ingredients = (vial.ingredients || []).map((ing, idx) => ({
      ingredient_id:   ing.ingredient_id,
      quantity:        ing.quantity ?? null,
      unit:            ing.unit ?? null,
      sequence:        idx + 1,
      requires_review: ing.quantity == null,
    }));

    const optionalSeparateVials = (vial.optional_separate_vials || []).map(opt => ({
      ingredient_id:                  opt.ingredient_id,
      quantity:                       opt.quantity ?? null,
      unit:                           opt.unit ?? null,
      presentation:                   opt.presentation || 'separate_vial',
      applies_to:                     opt.applies_to || null,
      requires_specific_prescription: opt.requires_specific_prescription || false,
      requires_review:                opt.quantity == null,
      note:                           opt.note || null,
    }));

    const payload = {
      vial_id:                 vial.vial_id,
      sku:                     vial.sku,
      type:                    vial.type,
      commercial_names:        vial.commercial_names || [],
      volume_ml:               vial.volume_ml ?? null,
      categories:              vial.categories || [],
      ingredients,
      optional_separate_vials: optionalSeparateVials,
      pricing: {
        internal_cost_aed:      vial.pricing?.internal_cost_aed   ?? 250,
        clinic_price_aed:       vial.pricing?.clinic_price_aed    ?? 500,
        gross_profit_aed:       vial.pricing?.gross_profit_aed    ?? 250,
        gross_margin_percent:   vial.pricing?.gross_margin_percent ?? 50,
        markup_on_cost_percent: 100,
        currency:               'AED',
      },
      administration: {
        route:                       'intravenous',
        requires_prescription:       true,
        requires_physician_approval: true,
        compatible_fluid_options:    ['250 mL NSS', '500 mL NSS'],
        consumables:                 ['Cannula G24', 'Macroset'],
        instruction:                 'Dilute the vial into an appropriate isotonic IV solution as directed by the prescribing clinician.',
      },
      disclaimer:            'For professional clinic use only. Requires prescription and physician approval.',
      professional_use_only: true,
      active:                vial.active ?? true,
      notes:                 vial.notes || null,
      formula_fingerprint:   formulaFingerprint(vial.ingredients),
      version:               1,
      created_at:            now(),
      updated_at:            now(),
      created_by:            'import_iv_drip_v1',
      updated_by:            'import_iv_drip_v1',
    };

    const ref = db.collection('iv_vials').doc(vial.vial_id);
    const existing = await ref.get();

    if (existing.exists) {
      payload.version    = (existing.data().version || 1) + 1;
      payload.created_at = existing.data().created_at;
      payload.created_by = existing.data().created_by;
      await ref.set(payload, { merge: true });
      summary.vials.updated++;
      log.info(`UPDATED: ${vial.vial_id} — ${vial.commercial_names[0]}`);
    } else {
      await ref.set(payload);
      summary.vials.created++;
      log.success(`CREATED: ${vial.vial_id} — ${vial.commercial_names.join(' / ')}`);
    }
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
function printSummary() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊  IV DRIP CATALOG — IMPORT SUMMARY`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`\n📦  Ingredients:`);
  console.log(`    Created : ${summary.ingredients.created} | Skipped: ${summary.ingredients.skipped} | Errors: ${summary.ingredients.errors.length}`);
  console.log(`\n🧪  Vials:`);
  console.log(`    Created : ${summary.vials.created} | Updated: ${summary.vials.updated} | Skipped: ${summary.vials.skipped} | Errors: ${summary.vials.errors.length}`);

  if (summary.warnings.length > 0) {
    console.log(`\n⚠️   Validation Warnings (${summary.warnings.length}):`);
    summary.warnings.forEach((w, i) => console.log(`    ${i + 1}. ${w}`));
  }
  if (summary.requiresReview.length > 0) {
    console.log(`\n🔍  Requires Manual Review (${summary.requiresReview.length}):`);
    summary.requiresReview.forEach((r, i) =>
      console.log(`    ${i + 1}. [${r.vial_id}] ${r.ingredient_id} — ${r.reason}${r.note ? ` (${r.note})` : ''}`)
    );
  }
  const allErrors = [...summary.ingredients.errors, ...summary.vials.errors];
  if (allErrors.length > 0) {
    console.log(`\n❌  Errors (${allErrors.length}):`);
    allErrors.forEach((e, i) => console.log(`    ${i + 1}. ${e}`));
  }
  console.log(`\n${'═'.repeat(60)}`);
  console.log(allErrors.length === 0 ? '🎉  Import completed successfully!' : '🚨  Import completed with errors.');
  console.log(`${'═'.repeat(60)}\n`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function runImport() {
  console.log(`\n${'═'.repeat(60)}\n🚀  IV DRIP CATALOG IMPORT (Admin SDK)\n${'═'.repeat(60)}`);
  console.log(`📂  Source: ${jsonPath}`);

  let data;
  try {
    const raw = readFileSync(jsonPath, 'utf-8');
    data = JSON.parse(raw);
    console.log(`✅  JSON loaded — ${data.ingredients_master.length} ingredients, ${data.vials.length} vials`);
  } catch (err) {
    console.error(`❌  Failed: ${err.message}`);
    process.exit(1);
  }

  const { catalog, ingredients_master, vials } = data;

  const masterIds = await importIngredients(ingredients_master);
  await importCatalogMeta(catalog);
  await importVials(vials, masterIds);

  printSummary();
  process.exit(0);
}

runImport().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});

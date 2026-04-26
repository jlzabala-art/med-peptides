/**
 * enrichPhase1.mjs — Fase 1: Farmacología + Variantes 4 niveles
 * Lee el export base, aplica datos clínicos del lookup table,
 * reconstruye variantes con 4-tier pricing, elimina duplicados.
 *
 * Input:  exports/products_for_validation_*.json  (más reciente)
 * Output: exports/products_phase1.json
 *
 * Usage: node scripts/enrichPhase1.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';

const require   = createRequire(import.meta.url);
const clinical  = require('./data/clinicalData.json');

// ── Load newest export ────────────────────────────────────────────────────────
const exportsDir = path.resolve('exports');
const latest = readdirSync(exportsDir)
  .filter(f => f.startsWith('products_for_validation') && f.endsWith('.json'))
  .sort().at(-1);

if (!latest) { console.error('No export file found in exports/'); process.exit(1); }
console.log(`\n📂 Input: exports/${latest}`);

const raw  = JSON.parse(readFileSync(path.join(exportsDir, latest), 'utf8'));

// ── Helpers ───────────────────────────────────────────────────────────────────
const num   = v => (v != null && !isNaN(Number(v))) ? Number(v) : null;
const round = v => v !== null ? Math.round(v * 100) / 100 : null;

function buildVariants(p) {
  // Extract flat prices from root doc
  const guestVial  = num(p.guestVialPrice  ?? p.perVialPriceUSD ?? null);
  const proVial    = num(p.proVialPrice    ?? null);
  const guestKit   = num(p.guestKitPrice   ?? p.kitPriceUSD     ?? null);
  const proKit     = num(p.proKitPrice     ?? null);

  // Skip if no prices at all
  if (guestVial === null && proVial === null) return [];

  const retail    = guestVial;
  const clinic    = proVial ?? (guestVial ? round(guestVial * 0.85) : null);
  const wholesale = clinic  ? round(clinic  * 0.90) : null;
  const master    = clinic  ? round(clinic  * 0.85) : null;

  // Determine size/form from id or fields
  const sizeMatch = p.id?.match(/[\d.]+(?:mg|ml|iu|mcg|g)\b/i);
  const size  = p.size ?? (sizeMatch ? sizeMatch[0] : null);
  const form  = p.form ?? (p.id?.includes('tablet') ? 'tablet' : 'vial');
  const label = size ? `${size} ${form}` : form;

  return [{
    id:        'default',
    label,
    size:      size ?? null,
    form,
    isDefault: true,
    stock:     { available: true, quantity: null },
    pricing: {
      retail:    { perUnit: retail,    kit: guestKit ?? null },
      clinic:    { perUnit: clinic,    kit: proKit   ?? null },
      wholesale: { perUnit: wholesale, kit: wholesale && guestKit ? round(guestKit * 0.90) : null },
      master:    { perUnit: master,    kit: master   && guestKit ? round(guestKit * 0.85) : null },
    },
    legacy: { guestVialPrice: guestVial, proVialPrice: proVial, guestKitPrice: guestKit, proKitPrice: proKit },
  }];
}

// ── Deduplicate: keep canonical doc (longer id / has prices) ─────────────────
function deduplicateProducts(products) {
  const seen = new Map();
  for (const p of products) {
    const key = p.name?.trim().toLowerCase();
    if (!key) continue;
    const prev = seen.get(key);
    if (!prev) { seen.set(key, p); continue; }
    // Prefer the one with flat prices, or longer id (more specific)
    const hasPrice    = x => x.guestVialPrice || x.proVialPrice || x.perVialPriceUSD;
    const prevWins    = hasPrice(prev) && !hasPrice(p);
    if (!prevWins) seen.set(key, p);
  }
  return [...seen.values()];
}

// ── Enrich with Phase 1 clinical data ────────────────────────────────────────
function applyClinical(p) {
  // Match by name (case-insensitive, partial)
  const nameKey = Object.keys(clinical).find(k =>
    p.name?.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(p.name?.toLowerCase())
  );
  const c = nameKey ? clinical[nameKey] : {};

  return {
    ...p,
    scientificName:    c.scientificName    ?? p.scientificName    ?? null,
    molecular_weight:  c.molecular_weight  ?? null,
    molecular_formula: c.molecular_formula ?? null,
    pharmacokinetics:  c.pharmacokinetics  ?? null,
    storage_conditions: c.storage_conditions ?? {
      temperature: '-20°C',
      light:       'Protect from UV',
      shelf_life:  '24 months',
    },
    mechanisms: c.mechanisms?.length ? c.mechanisms : p.mechanisms,
    variants:   buildVariants(p),
  };
}

// ── Process ───────────────────────────────────────────────────────────────────
const unique    = deduplicateProducts(raw.products);
const enriched  = unique.map(applyClinical);

const withVariants    = enriched.filter(p => p.variants.length > 0).length;
const withoutVariants = enriched.filter(p => p.variants.length === 0).length;
const withClinical    = enriched.filter(p => p.pharmacokinetics).length;

console.log(`\n📊 Summary:`);
console.log(`   Original docs  : ${raw.products.length}`);
console.log(`   After dedup    : ${enriched.length}`);
console.log(`   With variants  : ${withVariants}`);
console.log(`   No price data  : ${withoutVariants}`);
console.log(`   Clinical data  : ${withClinical}`);

// ── Write output ──────────────────────────────────────────────────────────────
const outPath = path.join(exportsDir, 'products_phase1.json');
writeFileSync(outPath, JSON.stringify({
  meta: {
    ...raw.meta,
    phase:       1,
    phase1At:    new Date().toISOString(),
    productCount: enriched.length,
    note:        'Phase 1: clinical data + 4-tier variant pricing applied. Duplicates removed.',
  },
  products: enriched,
}, null, 2));

console.log(`\n✅ Written: exports/products_phase1.json`);
console.log(`   → Ready for Phase 2 (safetyNote + contraindications)\n`);

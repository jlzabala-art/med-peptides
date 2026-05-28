/**
 * exportProductsForValidation.mjs
 *
 * Exports all product + variant data from Firestore to a flat JSON file
 * suitable for external database validation (CAS lookup, pricing audit, etc.).
 *
 * Output file:  exports/products_for_validation_{timestamp}.json
 *
 * Usage:
 *   node scripts/exportProductsForValidation.mjs
 *   node scripts/exportProductsForValidation.mjs --pretty   # readable JSON
 *   node scripts/exportProductsForValidation.mjs --flat     # flat row-per-variant (CSV-ready)
 *
 * Auth:
 *   Same as other admin scripts — uses GOOGLE_APPLICATION_CREDENTIALS or ADC.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');

const PRETTY    = process.argv.includes('--pretty');
const FLAT      = process.argv.includes('--flat');
const PROJECT_ID = 'Med-Peptides-app';

// ── Init firebase-admin ────────────────────────────────────────────────────────
let adminApp;
if (getApps().length) {
  adminApp = getApps()[0];
} else {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) {
    console.log(`🔑 Using service account: ${keyPath}`);
    const sa = JSON.parse(readFileSync(resolve(keyPath), 'utf-8'));
    adminApp = initializeApp({ credential: cert(sa), projectId: PROJECT_ID });
  } else {
    console.log('🔑 Using Application Default Credentials (ADC)...');
    adminApp = initializeApp({ projectId: PROJECT_ID });
  }
}

const db = getFirestore(adminApp);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip Firestore Timestamps to ISO strings for JSON serialisation */
function sanitiseValue(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'object' && typeof v.toDate === 'function') return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(sanitiseValue);
  if (typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, sanitiseValue(val)]));
  }
  return v;
}

/** Pick the best available price for a tier from a variant */
function pickPrice(pricing, tier) {
  return pricing?.[tier]?.base?.perUnit ?? pricing?.[tier]?.base?.perVialUSD ?? null;
}
function pickKit(pricing, tier) {
  return pricing?.[tier]?.base?.kit ?? pricing?.[tier]?.base?.kitUSD ?? null;
}

// ── Export ────────────────────────────────────────────────────────────────────

console.log('\n🔄 Fetching products from Firestore...\n');

const productsSnap = await db.collection('products').get();

if (productsSnap.empty) {
  console.error('❌  No products found in Firestore. Check your project ID and credentials.');
  process.exit(1);
}

console.log(`✅  Found ${productsSnap.size} products. Fetching variants...\n`);

const exportedAt = new Date().toISOString();
const products   = [];
const flatRows   = [];

for (const productDoc of productsSnap.docs) {
  const p = sanitiseValue(productDoc.data());

  // Fetch subcollection variants
  const variantsSnap = await productDoc.ref.collection('variants').get();
  const variants = variantsSnap.docs.map(vd => sanitiseValue(vd.data()));

  // ── Build enriched product record ─────────────────────────────────────────
  const record = {
    // ── Identity ──────────────────────────────────────────────────────────
    id:              p.id ?? productDoc.id,
    name:            p.name,
    displayName:     p.displayName ?? p.name,
    scientificName:  p.scientificName ?? p.science?.scientificName ?? null,
    cas:             p.cas ?? null,
    category:        p.category,
    status:          p.status ?? 'unknown',
    isBlend:         p.isBlend ?? false,
    blendComponents: p.blendComponents ?? [],

    // ── Science ───────────────────────────────────────────────────────────
    description:     p.science?.desc ?? p.desc ?? '',
    objective:       p.science?.objective ?? p.objective ?? '',
    mechanisms:      p.science?.mechanisms ?? p.mechanisms ?? [],
    safetyNote:      p.science?.safetyNote ?? p.safetyNote ?? '',

    // ── Classification ────────────────────────────────────────────────────
    goals:           p.classification?.goals ?? p.goals ?? [],
    tags:            p.classification?.tags  ?? p.tags  ?? [],
    synonyms:        p.identity?.synonyms    ?? p.synonyms ?? [],

    // ── Variants summary ──────────────────────────────────────────────────
    variantCount:    variants.length,
    variants: variants.map(v => {
      const pricing = v.pricing ?? {};
      return {
        variantId:     v.id,
        sku:           v.sku ?? null,
        dosage:        v.strength?.dosageLabel ?? v.dosage ?? null,
        dosageMg:      v.strength?.dosageMg    ?? null,
        kitLabel:      v.kit?.label ?? v.quantity ?? null,
        kitSize:       v.kit?.size  ?? null,
        kitUnit:       v.kit?.unit  ?? 'vial',
        isDefault:     v.isDefault  ?? false,
        inStock:       v.stock?.available ?? true,

        // Pricing — all 4 tiers
        pricing: {
          retail: {
            perUnit: pickPrice(pricing, 'retailPrice'),
            kit:     pickKit(pricing,   'retailPrice'),
          },
          wholesale: {
            perUnit: pickPrice(pricing, 'wholesalePrice'),
            kit:     pickKit(pricing,   'wholesalePrice'),
          },
          clinic: {
            perUnit: pickPrice(pricing, 'clinicPrice'),
            kit:     pickKit(pricing,   'clinicPrice'),
          },
          master: {
            perUnit: pickPrice(pricing, 'masterPrice'),
            kit:     pickKit(pricing,   'masterPrice'),
          },
          // Legacy flat fields (if present)
          legacy: {
            guestVialPrice: v.guestVialPrice ?? null,
            proVialPrice:   v.proVialPrice   ?? null,
            guestKitPrice:  v.guestKitPrice  ?? null,
            proKitPrice:    v.proKitPrice    ?? null,
            perVialPriceUSD: v.perVialPriceUSD ?? null,
            kitPriceUSD:    v.kitPriceUSD    ?? null,
          },
        },
      };
    }),

    // ── Metadata ──────────────────────────────────────────────────────────
    meta: {
      source:     p.meta?.source      ?? 'firestore',
      seedVersion: p.meta?.seedVersion ?? null,
      createdAt:  p.meta?.createdAt   ?? null,
      updatedAt:  p.meta?.updatedAt   ?? null,
    },
  };

  products.push(record);

  // ── Flat rows (one row per variant) ─────────────────────────────────────
  if (FLAT) {
    for (const v of record.variants) {
      flatRows.push({
        productId:       record.id,
        name:            record.name,
        cas:             record.cas,
        category:        record.category,
        status:          record.status,
        scientificName:  record.scientificName,
        variantId:       v.variantId,
        sku:             v.sku,
        dosage:          v.dosage,
        dosageMg:        v.dosageMg,
        kitLabel:        v.kitLabel,
        kitSize:         v.kitSize,
        kitUnit:         v.kitUnit,
        isDefault:       v.isDefault,
        inStock:         v.inStock,
        retailPerUnit:   v.pricing.retail.perUnit,
        retailKit:       v.pricing.retail.kit,
        wholesalePerUnit: v.pricing.wholesale.perUnit,
        wholesaleKit:    v.pricing.wholesale.kit,
        clinicPerUnit:   v.pricing.clinic.perUnit,
        clinicKit:       v.pricing.clinic.kit,
        masterPerUnit:   v.pricing.master.perUnit,
        masterKit:       v.pricing.master.kit,
        // Legacy fields
        legacyGuestVial: v.pricing.legacy.guestVialPrice,
        legacyProVial:   v.pricing.legacy.proVialPrice,
        legacyGuestKit:  v.pricing.legacy.guestKitPrice,
        legacyProKit:    v.pricing.legacy.proKitPrice,
      });
    }
  }

  console.log(`  📦 ${record.name.padEnd(35)} — ${variants.length} variant(s)`);
}

// ── Sort products alphabetically ─────────────────────────────────────────────
products.sort((a, b) => a.name.localeCompare(b.name));
flatRows.sort((a, b) => a.name.localeCompare(b.name) || (a.dosageMg ?? 0) - (b.dosageMg ?? 0));

// ── Write output ──────────────────────────────────────────────────────────────
const exportsDir = resolve(ROOT, 'exports');
mkdirSync(exportsDir, { recursive: true });

const timestamp  = exportedAt.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
const outputData = FLAT ? flatRows : {
  meta: {
    exportedAt,
    projectId:    PROJECT_ID,
    productCount: products.length,
    variantCount: products.reduce((acc, p) => acc + p.variantCount, 0),
    format:       'nested',
    note:         'Exported from Firestore. Use for external DB validation only.',
  },
  products,
};

const filename   = `products_for_validation_${timestamp}${FLAT ? '_flat' : ''}.json`;
const outputPath = resolve(exportsDir, filename);
const json       = PRETTY
  ? JSON.stringify(outputData, null, 2)
  : JSON.stringify(outputData);

writeFileSync(outputPath, json, 'utf-8');

// ── Summary ───────────────────────────────────────────────────────────────────
const totalVariants = products.reduce((acc, p) => acc + p.variantCount, 0);
const sizeKB        = (Buffer.byteLength(json, 'utf-8') / 1024).toFixed(1);

console.log(`
── Export Complete ─────────────────────────────────────
  Products:  ${products.length}
  Variants:  ${totalVariants}
  Format:    ${FLAT ? 'flat (row-per-variant)' : 'nested (product + variants)'}
  File:      exports/${filename}
  Size:      ${sizeKB} KB
─────────────────────────────────────────────────────────
`);

process.exit(0);

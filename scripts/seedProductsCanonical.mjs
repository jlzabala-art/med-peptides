/**
 * seedProductsCanonical.mjs
 *
 * Migrates products.js to the canonical Firestore schema using firebase-admin
 * (bypasses Firestore Security Rules — runs server-side with admin privileges).
 *
 * Schema:
 *   products/{productId}              — product-level data (stable)
 *     variants/{variantId}            — SKU per strength × kit (index primary)
 *
 * Usage (from project root):
 *   node scripts/seedProductsCanonical.mjs              # real write
 *   node scripts/seedProductsCanonical.mjs --dry-run    # preview only
 *
 * Auth:
 *   Uses Application Default Credentials (ADC).
 *   Run `firebase login` or set GOOGLE_APPLICATION_CREDENTIALS env var before executing.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const PROJECT_ID = 'med-peptides-app';

// ── Init firebase-admin ────────────────────────────────────────────────────
// Priority: explicit service account key > Application Default Credentials
let adminApp;
if (getApps().length) {
  adminApp = getApps()[0];
} else {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) {
    console.log(`🔑 Using service account key: ${keyPath}`);
    const serviceAccount = JSON.parse(readFileSync(resolve(keyPath), 'utf-8'));
    adminApp = initializeApp({ credential: cert(serviceAccount), projectId: PROJECT_ID });
  } else {
    console.log('🔑 Using Application Default Credentials (ADC)...');
    adminApp = initializeApp({ projectId: PROJECT_ID });
  }
}

const db = getFirestore(adminApp);

// ── Load products.js ─────────────────────────────────────────────────────────
const productsFilePath = 'src/data/products.js';
const rawSource = readFileSync(productsFilePath, 'utf-8');

const evalSource = rawSource
  .replace(/export const productCategories[\s\S]*?];/, '')
  .replace(/export const products = /, 'const products = ')
  .replace(/export default/, '// export default');

let rawProducts = [];
try {
  const fn = new Function(`${evalSource}; return products;`);
  rawProducts = fn();
  console.log(`✅ Loaded ${rawProducts.length} raw entries from products.js\n`);
} catch (err) {
  console.error('❌ Failed to parse products.js:', err.message);
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const toSlug = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const parseDosageMg = (dosageStr = '') => {
  if (!dosageStr) return null;
  const blendMatch = dosageStr.match(/^\d+\/\d+/);
  if (blendMatch) return null;
  const match = dosageStr.match(/^(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

const parseKitSize = (quantityStr = '') => {
  const match = quantityStr.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

const parseKitUnit = (quantityStr = '') => {
  if (/tab/i.test(quantityStr)) return 'tablet';
  if (/cap/i.test(quantityStr)) return 'capsule';
  if (/ml/i.test(quantityStr)) return 'ml';
  return 'vial';
};

const sanitize = (obj) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out;
};

const now = new Date().toISOString();

// ── Group raw entries by product name → canonical model ──────────────────────
const productMap = new Map();

for (const raw of rawProducts) {
  const slug = toSlug(raw.name);

  if (!productMap.has(slug)) {
    const isBlend = raw.cas === 'Mixed' || (raw.blendComponents && raw.blendComponents.length > 0);

    const productDoc = sanitize({
      id: slug,
      name: raw.name,
      displayName: raw.displayName || raw.name,
      scientificName: raw.scientificName || null,
      cas: raw.cas || null,
      category: raw.category,
      status: raw.status || 'active',
      isBlend,
      blendComponents: raw.blendComponents || [],

      identity: sanitize({
        synonyms: raw.synonyms || [],
        searchAliases: raw.searchAliases || [],
        semanticKeywords: raw.semanticKeywords || [],
      }),

      science: sanitize({
        desc: raw.desc || '',
        objective: raw.objective || '',
        mechanisms: raw.mechanisms || [],
        mechanismSummary: raw.mechanismOfAction?.summary || '',
        researchFocus: raw.mechanismOfAction?.researchFocus || [],
        safetyNote: raw.safetyNote || '',
      }),

      classification: sanitize({
        goals: raw.goals || [],
        secondaryFactors: raw.secondaryFactors || [],
        tags: raw.tags || [],
      }),

      ui: sanitize({
        image: raw.image || '/assets/vials/standard-vial.png',
        scientificModalEnabled: raw.scientificModalEnabled ?? true,
        faqModalEnabled: raw.faqModalEnabled ?? true,
      }),

      meta: {
        source: raw.source || 'wholesale',
        seedVersion: 2,
        createdAt: now,
        updatedAt: now,
      },
    });

    productMap.set(slug, { productDoc, variants: [] });
  }

  // ── Build variant ──────────────────────────────────────────────────────────
  const dosageMg    = parseDosageMg(raw.dosage || raw.strength || '');
  const kitSize     = parseKitSize(raw.quantity || '');
  const kitUnit     = parseKitUnit(raw.quantity || '');
  const dosageLabel = raw.dosage || raw.strength || '';
  const kitLabel    = raw.quantity || '';

  const doseSlug  = dosageMg !== null ? `${dosageMg}mg` : toSlug(dosageLabel) || 'blend';
  const kitSlug   = kitSize !== null ? `${kitSize}${kitUnit}` : 'kit';
  const variantId = `${doseSlug}-${kitSlug}`;

  const variant = sanitize({
    id: variantId,
    productId: slug,
    productName: raw.name,
    category: raw.category,
    sku: `${slug.toUpperCase().replace(/-/g, '')}-${doseSlug.toUpperCase()}-${kitSlug.toUpperCase()}`,

    strength: sanitize({
      dosageMg,
      dosageLabel,
      isBlendStrength: dosageMg === null,
    }),

    kit: sanitize({
      size: kitSize,
      unit: kitUnit,
      label: kitLabel,
    }),

    pricing: {
      base: sanitize({
        perVialUSD: raw.perVialPriceUSD ?? null,
        kitUSD: raw.kitPriceUSD ?? null,
        currency: 'USD',
      }),
      byCountry: {},
    },

    stock: {
      available: raw.status === 'active',
      note: '',
    },

    isDefault: false,
    sortOrder: 0,

    meta: {
      seedVersion: 2,
      createdAt: now,
      updatedAt: now,
    },
  });

  productMap.get(slug).variants.push(variant);
}

// ── Sort & mark defaults ─────────────────────────────────────────────────────
for (const { variants } of productMap.values()) {
  variants.sort((a, b) => {
    const aActive = a.stock?.available ? 0 : 1;
    const bActive = b.stock?.available ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    const aDose = a.strength?.dosageMg ?? 999;
    const bDose = b.strength?.dosageMg ?? 999;
    if (aDose !== bDose) return aDose - bDose;
    return (a.kit?.size ?? 0) - (b.kit?.size ?? 0);
  });
  variants.forEach((v, i) => {
    v.isDefault = i === 0;
    v.sortOrder = i + 1;
  });
}

// ── Preview ──────────────────────────────────────────────────────────────────
console.log(`📦 Products to seed: ${productMap.size}`);
let totalVariants = 0;
for (const [slug, { productDoc, variants }] of productMap.entries()) {
  console.log(`  → ${slug} (${productDoc.status}) | ${variants.length} variant(s):`);
  for (const v of variants) {
    console.log(`       • ${v.id}  $${v.pricing?.base?.kitUSD ?? '-'}/kit  default=${v.isDefault}`);
    totalVariants++;
  }
}
console.log(`\n📊 Total: ${productMap.size} products, ${totalVariants} variants\n`);

if (DRY_RUN) {
  console.log('🔍 DRY RUN — no data written to Firestore.');
  process.exit(0);
}

// ── Write to Firestore via Admin SDK (batch per product) ─────────────────────
console.log('🚀 Writing to Firestore (Admin SDK)...\n');
let productSuccess = 0;
let variantSuccess = 0;
let failures = 0;

for (const [slug, { productDoc, variants }] of productMap.entries()) {
  try {
    const batch = db.batch();

    // Product document
    const productRef = db.collection('products').doc(slug);
    batch.set(productRef, productDoc);

    // Variant subcollection documents
    for (const variant of variants) {
      const variantRef = productRef.collection('variants').doc(variant.id);
      batch.set(variantRef, variant);
    }

    await batch.commit();
    productSuccess++;
    variantSuccess += variants.length;
    console.log(`  ✅ ${slug} (${variants.length} variants)`);
  } catch (err) {
    console.error(`  ❌ ${slug} — ${err.message}`);
    failures++;
  }
}

console.log(`
── Seed Complete ────────────────────────────────────
  Products:  ${productSuccess} ✅  ${failures} ❌
  Variants:  ${variantSuccess} ✅
  Total docs written: ${productSuccess + variantSuccess}
`);

process.exit(failures > 0 ? 1 : 0);

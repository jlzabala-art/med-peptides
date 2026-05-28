/**
 * qa-pricing-validation.mjs — Phase 9: Canonical Pricing QA
 * ─────────────────────────────────────────────────────────────────────────────
 * Run: node src/scripts/qa-pricing-validation.mjs
 *
 * Validates that the canonical pricing architecture (Engine v2) is consistent
 * across all Firestore product documents. Reports:
 *   ✅ Products with complete canonical pricing (all 4 tiers)
 *   ⚠️  Products with partial pricing (some tiers missing)
 *   ❌  Products with NO pricing data (missing variants or pricing field)
 *   🔍  Tier consistency: retail ≥ clinic ≥ wholesale ≥ master
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node src/scripts/qa-pricing-validation.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';

// ── Config ─────────────────────────────────────────────────────────────────────

const PRODUCTS_COLLECTION = 'products';
const TIERS = ['retail', 'clinic', 'wholesale', 'master'];
const EXPECTED_PRICE_FIELDS = ['perUnit', 'unit', 'base'];

// ── Init Firebase Admin ────────────────────────────────────────────────────────

const SA_PATHS = [
  './serviceAccountKey.json',
  './med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json',
  './serviceAccount.json',
  './service-account.json',
  './firebase-service-account.json',
];

let initialized = false;
for (const p of SA_PATHS) {
  if (existsSync(p)) {
    const sa = JSON.parse(readFileSync(p, 'utf-8'));
    initializeApp({ credential: cert(sa) });
    initialized = true;
    console.log(`✅ Firebase initialized with: ${p}\n`);
    break;
  }
}

if (!initialized) {
  // Try GOOGLE_APPLICATION_CREDENTIALS env
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    initializeApp();
    initialized = true;
    console.log('✅ Firebase initialized via GOOGLE_APPLICATION_CREDENTIALS\n');
  } else {
    console.error('❌ No service account found. Provide serviceAccount.json or set GOOGLE_APPLICATION_CREDENTIALS.');
    process.exit(1);
  }
}

const db = getFirestore();

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Extract price amount from a tier pricing entry.
 * Handles both { perUnit } and { unit } and { base } schemas.
 */
function extractAmount(entry) {
  if (!entry) return null;
  return entry.perUnit ?? entry.unit ?? entry.base ?? null;
}

/**
 * Validate pricing for a single variant document.
 */
function validateVariant(variant, productId) {
  const issues = [];
  const pricing = variant.pricing ?? {};
  const tierResults = {};

  for (const tier of TIERS) {
    const entry = pricing[tier] ?? pricing[`${tier}Price`];
    const amount = extractAmount(entry);
    tierResults[tier] = amount;

    if (amount == null) {
      issues.push(`  ⚠️  Tier [${tier}] missing — no ${EXPECTED_PRICE_FIELDS.join('/')} field`);
    } else if (typeof amount !== 'number' || isNaN(amount)) {
      issues.push(`  ❌  Tier [${tier}] invalid value: ${amount}`);
    } else if (amount < 0) {
      issues.push(`  ❌  Tier [${tier}] negative price: ${amount}`);
    }
  }

  // Tier ordering check: retail >= clinic >= wholesale >= master
  const [retail, clinic, wholesale, master] = TIERS.map(t => tierResults[t]);
  if (retail != null && clinic != null && clinic > retail) {
    issues.push(`  🔍 Tier order violation: clinic (${clinic}) > retail (${retail})`);
  }
  if (clinic != null && wholesale != null && wholesale > clinic) {
    issues.push(`  🔍 Tier order violation: wholesale (${wholesale}) > clinic (${clinic})`);
  }
  if (wholesale != null && master != null && master > wholesale) {
    issues.push(`  🔍 Tier order violation: master (${master}) > wholesale (${wholesale})`);
  }

  return { tierResults, issues };
}

// ── Main QA Runner ─────────────────────────────────────────────────────────────

async function runQA() {
  console.log('════════════════════════════════════════════════');
  console.log('  PHASE 9 — CANONICAL PRICING QA REPORT');
  console.log('════════════════════════════════════════════════\n');

  const snapshot = await db.collection(PRODUCTS_COLLECTION).get();
  const total = snapshot.size;

  console.log(`📦 Total products found: ${total}\n`);

  const results = {
    complete:   [],  // all 4 tiers present on all variants
    partial:    [],  // some tiers missing
    noPricing:  [],  // no variants or no pricing field at all
    violations: [],  // tier order violations
    legacyHits: [],  // any remaining legacy flat fields detected
  };

  const LEGACY_FLAT_FIELDS = [
    'priceUSD', 'perVialPriceUSD', 'kitPriceUSD',
    'guestVialPrice', 'proVialPrice', 'base_price',
    'unit_price', 'price', 'costPrice',
  ];

  for (const doc of snapshot.docs) {
    const data   = doc.data();
    const id     = doc.id;
    const name   = data.name ?? data.productName ?? id;

    // Check for legacy flat fields at root level
    const legacyFound = LEGACY_FLAT_FIELDS.filter(f => data[f] !== undefined);
    if (legacyFound.length > 0) {
      results.legacyHits.push({ id, name, fields: legacyFound });
    }

    // Extract variants
    const variants = Array.isArray(data.variants) && data.variants.length > 0
      ? data.variants
      : data.pricing ? [data] : [];

    if (variants.length === 0) {
      results.noPricing.push({ id, name, reason: 'No variants and no root pricing field' });
      continue;
    }

    let allComplete   = true;
    let anyIssue      = false;
    let anyViolation  = false;
    const variantSummary = [];

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const varLabel = v.label ?? v.variantId ?? v.id ?? `variant[${i}]`;
      const { tierResults, issues } = validateVariant(v, id);

      const tiersPresent = TIERS.filter(t => tierResults[t] != null).length;
      if (tiersPresent < TIERS.length) { allComplete = false; anyIssue = true; }

      const hasViolation = issues.some(i => i.includes('Tier order violation'));
      if (hasViolation) anyViolation = true;

      variantSummary.push({ varLabel, tierResults, issues, tiersPresent });
    }

    const entry = { id, name, variants: variantSummary };

    if (anyViolation)  results.violations.push(entry);
    if (!anyIssue)     results.complete.push(entry);
    else               results.partial.push(entry);
  }

  // ── Print Report ──────────────────────────────────────────────────────────────

  console.log(`✅ COMPLETE  (all tiers): ${results.complete.length}/${total}`);
  console.log(`⚠️  PARTIAL  (some tiers): ${results.partial.length}/${total}`);
  console.log(`❌  NO PRICING            : ${results.noPricing.length}/${total}`);
  console.log(`🔍  TIER VIOLATIONS       : ${results.violations.length}`);
  console.log(`🚨  LEGACY FIELDS (Firestore): ${results.legacyHits.length}\n`);

  // --- Partial pricing detail ---
  if (results.partial.length > 0) {
    console.log('─────────────────────────────────────────');
    console.log('⚠️  PRODUCTS WITH PARTIAL PRICING:');
    console.log('─────────────────────────────────────────');
    for (const p of results.partial) {
      console.log(`\n  [${p.id}] ${p.name}`);
      for (const v of p.variants) {
        const tierStr = TIERS.map(t => `${t}=${v.tierResults[t] ?? 'NULL'}`).join(', ');
        console.log(`    Variant "${v.varLabel}": ${tierStr}`);
        for (const issue of v.issues) console.log(`    ${issue}`);
      }
    }
  }

  // --- No pricing detail ---
  if (results.noPricing.length > 0) {
    console.log('\n─────────────────────────────────────────');
    console.log('❌  PRODUCTS WITH NO PRICING DATA:');
    console.log('─────────────────────────────────────────');
    for (const p of results.noPricing) {
      console.log(`  [${p.id}] ${p.name} — ${p.reason}`);
    }
  }

  // --- Tier violations ---
  if (results.violations.length > 0) {
    console.log('\n─────────────────────────────────────────');
    console.log('🔍  TIER ORDER VIOLATIONS:');
    console.log('─────────────────────────────────────────');
    for (const p of results.violations) {
      console.log(`\n  [${p.id}] ${p.name}`);
      for (const v of p.variants) {
        for (const issue of v.issues.filter(i => i.includes('violation'))) {
          console.log(`    ${issue}`);
        }
      }
    }
  }

  // --- Legacy fields in Firestore ---
  if (results.legacyHits.length > 0) {
    console.log('\n─────────────────────────────────────────');
    console.log('🚨  LEGACY FLAT FIELDS STILL IN FIRESTORE:');
    console.log('─────────────────────────────────────────');
    console.log('  (These should be removed via a migration script)');
    for (const p of results.legacyHits) {
      console.log(`  [${p.id}] ${p.name} — fields: ${p.fields.join(', ')}`);
    }
  }

  // --- Summary ---
  console.log('\n════════════════════════════════════════════════');
  const healthy = total - results.partial.length - results.noPricing.length;
  const pct = ((healthy / total) * 100).toFixed(1);
  console.log(`  PRICING HEALTH: ${pct}% (${healthy}/${total} products fully canonical)`);
  if (results.legacyHits.length === 0) {
    console.log('  LEGACY FIELDS:  ✅ None detected in Firestore');
  }
  if (results.violations.length === 0) {
    console.log('  TIER ORDER:     ✅ All tiers consistent');
  }
  console.log('════════════════════════════════════════════════\n');

  // Exit code: 0 = healthy, 1 = issues found
  const hasIssues = results.partial.length > 0 || results.noPricing.length > 0
                    || results.violations.length > 0 || results.legacyHits.length > 0;
  process.exit(hasIssues ? 1 : 0);
}

runQA().catch(err => {
  console.error('❌ QA script failed:', err.message);
  process.exit(2);
});

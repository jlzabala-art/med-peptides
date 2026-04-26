/**
 * migrateProtocolVariantRef.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 2 migration script — Typed Variant References in Protocol Bundles
 *
 * What this does:
 *  1. Reads every JSON file inside protocol_builder_2_0_protocols_bundle/
 *  2. Injects a canonical `variantRef` object into every `drug` entry that
 *     does not already carry one.
 *  3. Writes the updated JSON back to disk (idempotent — safe to re-run).
 *  4. Builds a map { variantId → [protocol_id, ...] } and writes those
 *     arrays to Firestore `products/{pid}/variants/{vid}` as `usedInProtocols`.
 *
 * Route normalization map (expand as needed):
 *   "subcutaneous" → "SC"
 *   "intramuscular" → "IM"
 *   "intranasal"   → "IN"
 *   "oral"         → "ORAL"
 *   "topical"      → "TOPICAL"
 *
 * Run:
 *   node scripts/migrateProtocolVariantRef.mjs [--dry-run]
 *
 * Flags:
 *   --dry-run   Print the proposed changes to stdout without writing anything.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ─── Paths ────────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE_DIR = resolve(__dirname, '../src/services/protocol_builder_2_0_protocols_bundle');
const SERVICE_ACCOUNT_PATH = resolve(__dirname, '../serviceAccountKey.json');

// ─── CLI Flags ────────────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes('--dry-run');

// ─── Route normalisation ─────────────────────────────────────────────────────
const ROUTE_CANONICAL = {
  subcutaneous: 'SC',
  intramuscular: 'IM',
  intravenous:   'IV',
  intranasal:    'IN',
  oral:          'ORAL',
  sublingual:    'SL',
  topical:       'TOP',
  transdermal:   'TD',
};

function normalizeRoute(raw = 'subcutaneous') {
  return ROUTE_CANONICAL[(raw || '').toLowerCase().trim()] || 'SC';
}

// ─── Product-ID → known variant-ID mapping ───────────────────────────────────
// This is a best-effort seed list. For products that have a single SKU per
// route we can supply an exact variantId. For multi-SKU products we default
// to `resolved` type and let the engine pick the best variant at runtime.
//
// Format:  '<product_id>': { '<route_enum>': '<variantId>' | null }
// null = use type:'resolved' (engine chooses)
const KNOWN_VARIANT_IDS = {
  'prd_tirzepatide': { SC: null },
  'prd_retatrutide': { SC: null },
  'prd_semaglutide': { SC: null, IN: null },
  'prd_mots-c':      { SC: 'var_mots-c_sc_5mg' },
  'prd_aod-9604':    { SC: 'var_aod9604_sc_2mg' },
  'prd_bpc-157':     { IM: 'var_bpc157_im_250mcg', ORAL: 'var_bpc157_oral_500mcg' },
  'prd_semax':       { IN: 'var_semax_in_600mcg' },
  'prd_selank':      { IN: 'var_selank_in_250mcg' },
  'prd_pt-141':      { IN: 'var_pt141_in_10mg', SC: null },
  'prd_nad+':        { SC: null, ORAL: null },
  'prd_tb-500':      { SC: 'var_tb500_sc_5mg' },
  'prd_ghk-cu':      { SC: null, TOP: null },
};

// ─── Build variantRef for a drug entry ───────────────────────────────────────
function buildVariantRef(drug) {
  const productId = drug.product_id || drug.compound || '';
  const routeEnum = normalizeRoute(drug.route || 'subcutaneous');
  const knownRoutes = KNOWN_VARIANT_IDS[productId];
  const variantId   = knownRoutes?.[routeEnum] ?? null;

  if (variantId) {
    return { type: 'exact', variantId, productId, route: routeEnum };
  }
  return { type: 'resolved', productId, route: routeEnum };
}

// ─── Process a single protocol JSON ──────────────────────────────────────────
function processProtocol(filePath) {
  const raw  = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  let changed = false;

  const phases = data.phase_blueprints || data.phases || [];
  phases.forEach(phase => {
    const drugs = phase.drugs || phase.medications || [];
    drugs.forEach(d => {
      if (!d.variantRef) {
        d.variantRef = buildVariantRef(d);
        changed = true;
      }
    });
  });

  return { data, changed };
}

// ─── Collect all variantRefs across protocols ─────────────────────────────────
// Returns Map<variantId, Set<protocol_id>>
function collectVariantProtocolMap(protocols) {
  const map = new Map();

  protocols.forEach(({ data }) => {
    const protocolId = data.protocol_id;
    const phases = data.phase_blueprints || data.phases || [];
    phases.forEach(phase => {
      const drugs = phase.drugs || phase.medications || [];
      drugs.forEach(d => {
        const ref = d.variantRef;
        if (!ref) return;

        // We only track exact refs to Firestore (resolved refs are dynamic)
        if (ref.type === 'exact' && ref.variantId) {
          if (!map.has(ref.variantId)) map.set(ref.variantId, new Set());
          map.get(ref.variantId).add(protocolId);
        }

        // Always track by productId for the `resolved` case
        const productKey = `product:${ref.productId}:${ref.route}`;
        if (!map.has(productKey)) map.set(productKey, new Set());
        map.get(productKey).add(protocolId);
      });
    });
  });

  return map;
}

// ─── Write usedInProtocols to Firestore ──────────────────────────────────────
async function writeFirestoreLinks(variantProtocolMap) {
  let db;
  try {
    const sa = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
    if (!getApps().length) initializeApp({ credential: cert(sa) });
    db = getFirestore();
  } catch (e) {
    console.warn('[WARN] Could not initialise Firestore:', e.message);
    console.warn('[WARN] Skipping Firestore step. Run with correct serviceAccountKey.json to enable.');
    return;
  }

  const batch = db.batch();
  let opCount = 0;

  for (const [key, protocolSet] of variantProtocolMap) {
    const protocolIds = Array.from(protocolSet);

    if (key.startsWith('product:')) {
      // key format: product:<productId>:<route>
      // We can't update without a concrete variantId — log for manual review.
      console.log(`  [INFO] Resolved ref — ${key} → used in: ${protocolIds.join(', ')}`);
      continue;
    }

    // key is a concrete variantId — find its parent product
    // Convention: variantId = var_<compound>_<route>_<dose>
    // We query for it across all products.
    const variantsQuery = await db.collectionGroup('variants')
      .where('variantId', '==', key)
      .limit(1)
      .get();

    if (variantsQuery.empty) {
      console.warn(`  [WARN] Variant not found in Firestore: ${key}`);
      continue;
    }

    const variantRef = variantsQuery.docs[0].ref;
    batch.update(variantRef, { usedInProtocols: protocolIds });
    opCount++;

    console.log(`  [LINK] ${key} → ${protocolIds.join(', ')}`);
  }

  if (opCount > 0) {
    await batch.commit();
    console.log(`[✓] Firestore: ${opCount} variant(s) updated with usedInProtocols`);
  } else {
    console.log('[INFO] No exact-match variants to update in Firestore (all refs are resolved type).');
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔬 migrateProtocolVariantRef — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);

  const files = readdirSync(BUNDLE_DIR)
    .filter(f => extname(f) === '.json')
    .map(f => join(BUNDLE_DIR, f));

  console.log(`Found ${files.length} protocol bundle file(s).\n`);

  const results = [];

  for (const filePath of files) {
    const { data, changed } = processProtocol(filePath);
    results.push({ data, filePath });

    if (!changed) {
      console.log(`  [SKIP]    ${filePath.split('/').pop()} — already has variantRef`);
      continue;
    }

    if (DRY_RUN) {
      const phases = data.phase_blueprints || data.phases || [];
      phases.forEach(p => {
        const drugs = p.drugs || p.medications || [];
        drugs.forEach(d => {
          if (d.variantRef) {
            console.log(`  [DRY] ${data.protocol_id} / ${p.phase_key} / ${d.product_id} → variantRef:`, JSON.stringify(d.variantRef));
          }
        });
      });
    } else {
      writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`  [UPDATED] ${filePath.split('/').pop()}`);
    }
  }

  // Step 2: Firestore bidirectional links
  if (!DRY_RUN) {
    console.log('\n📡 Writing usedInProtocols to Firestore...\n');
    const variantProtocolMap = collectVariantProtocolMap(results);
    await writeFirestoreLinks(variantProtocolMap);
  } else {
    console.log('\n[DRY] Firestore write skipped.\n');
  }

  console.log('\n✅ Migration complete.\n');
}

main().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

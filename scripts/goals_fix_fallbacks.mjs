#!/usr/bin/env node
/**
 * goals_fix_fallbacks.mjs
 * --------------------------------------------------------
 * Fixes the 45 products that received generic "fallback"
 * goals. Each product gets a manually-curated goalId.
 *
 * Usage:
 *   node scripts/goals_fix_fallbacks.mjs --dry-run   # preview
 *   node scripts/goals_fix_fallbacks.mjs              # live write
 * --------------------------------------------------------
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sa = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

const DRY = process.argv.includes('--dry-run');

// ── Manual goal assignments for every fallback product ──────────
// Canonical goals:
//   anti_aging_longevity, hormonal_optimization, weight_loss_glp1,
//   immune_support, sexual_health, cognitive_enhancement,
//   skin_hair_aesthetics, performance_muscle, general_wellness,
//   metabolic_health, genomics
// ─────────────────────────────────────────────────────────────────

const FIXES = {
  // --- Peptides / APIs ---
  '5-amino-1-50-mg':            ['weight_loss_glp1', 'metabolic_health'],      // 5-Amino-1MQ - metabolic / obesity
  'oral-green-tea-greenselect':  ['weight_loss_glp1', 'anti_aging_longevity'],  // Green tea extract - antioxidant / weight
  'piperin':                     ['metabolic_health', 'anti_aging_longevity'],  // Piperine - bioavailability enhancer
  'pnc-27':                      ['immune_support'],                           // PNC-27 - anti-cancer peptide
  'prilocaine':                  ['skin_hair_aesthetics'],                     // Local anesthetic - topical
  'progesterone':                ['hormonal_optimization'],                    // Hormone
  'progesterona-progesterone':   ['hormonal_optimization'],                    // Progesterone raw material
  'prostamax':                   ['hormonal_optimization'],                    // Prostate health peptide
  'prostaquinon-tm':             ['hormonal_optimization'],                    // Prostate health
  'pt':                          ['immune_support', 'anti_aging_longevity'],   // PT-141 variant or generic peptide
  'retrotrotide-magistral':      ['weight_loss_glp1', 'metabolic_health'],     // Retatrutide - GLP-1 triple agonist
  'silimarin':                   ['metabolic_health', 'immune_support'],       // Silymarin - liver protection
  'snap-8':                      ['skin_hair_aesthetics', 'anti_aging_longevity'], // Anti-wrinkle peptide
  'snap-8-10-mg-cosmetic':       ['skin_hair_aesthetics', 'anti_aging_longevity'], // Anti-wrinkle cosmetic
  'tacrolimus':                  ['immune_support', 'skin_hair_aesthetics'],   // Immunosuppressant / dermatology
  'testagen':                    ['hormonal_optimization', 'anti_aging_longevity'], // Bioregulator peptide - testes
  'thymogen':                    ['immune_support', 'anti_aging_longevity'],   // Thymus peptide - immune
  'thymosin':                    ['immune_support', 'anti_aging_longevity'],   // Thymus peptide
  'thymosin-beta-4':             ['immune_support', 'anti_aging_longevity'],   // TB-4 - tissue repair / immune
  'thymulin':                    ['immune_support', 'anti_aging_longevity'],   // Thymus hormone - immune regulation
  'topiramate':                  ['weight_loss_glp1', 'cognitive_mood'],       // Anti-epileptic used for weight loss
  'vancomycin-hcl':              ['immune_support'],                           // Antibiotic
  'vip-10-mg':                   ['immune_support', 'cognitive_mood'],         // Vasoactive intestinal peptide
  'vip-vasoactive-intestinal-peptide-10mg': ['immune_support', 'cognitive_mood'],

  // --- Tricho series (hair) ---
  'trichocond':                  ['skin_hair_aesthetics'],
  'trichofoam':                  ['skin_hair_aesthetics'],
  'trichooil':                   ['skin_hair_aesthetics'],
  'trichoserum':                 ['skin_hair_aesthetics'],
  'trichosol':                   ['skin_hair_aesthetics'],
  'trichowash':                  ['skin_hair_aesthetics'],

  // --- Nutraceuticals / supplements ---
  'greenselect-phytosome':       ['weight_loss_glp1', 'anti_aging_longevity'],
  'potassium-iodide':            ['hormonal_optimization', 'immune_support'], // Thyroid support
  'slimaluma':                   ['weight_loss_glp1'],                        // Weight management extract

  // --- Capsules & consumables (compounding materials) ---
  'capsicards-4-50-white':       ['general_wellness'],   // Capsule cards - compounding supply
  'capsule-excipient-no-2':      ['general_wellness'],   // Excipient - compounding supply
  'capsules-size-0-yellow':      ['general_wellness'],   // Empty capsule
  'capsules-size-00-green-o-green-c': ['general_wellness'],
  'capsules-size-00-red-td-free':['general_wellness'],
  'capsules-size-00-yellow':     ['general_wellness'],
  'capsules-size-2-white':       ['general_wellness'],
  'capsules-size-2-yellow':      ['general_wellness'],
  'fagroncaps-size-0-blue-capsules': ['general_wellness'],

  // --- Equipment & compounding materials ---
  'fagronlab-fg2-plate-set-n0':  ['general_wellness'],   // Lab equipment
  'fagronlab-green-homogeneous-container-30-ml': ['general_wellness'],
  'juego-placas-fagronlab-fg2-n2': ['general_wellness'], // Lab plate set
};

async function main() {
  console.log('Goals Fix Fallbacks');
  console.log(`  Mode: ${DRY ? 'DRY RUN' : 'LIVE WRITE'}`);
  console.log('------------------------------------------------\n');

  const ids = Object.keys(FIXES);
  console.log(`Products to fix: ${ids.length}\n`);

  // Verify all docs exist
  let found = 0;
  let notFound = [];
  const batch = db.batch();

  for (const id of ids) {
    const ref = db.collection('products').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      notFound.push(id);
      continue;
    }
    found++;
    const goals = FIXES[id];
    console.log(`  ${id} -> [${goals.join('; ')}]`);

    if (!DRY) {
      batch.update(ref, { goalIds: goals });
    }
  }

  console.log(`\nFound: ${found}  |  Not found: ${notFound.length}`);
  if (notFound.length > 0) {
    console.log('  Missing IDs:', notFound.join(', '));
  }

  if (!DRY && found > 0) {
    console.log('\nCommitting batch...');
    await batch.commit();
    console.log('Done - all fallback products now have specific goals.');
  } else if (DRY) {
    console.log('\n[DRY RUN] No changes written.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });

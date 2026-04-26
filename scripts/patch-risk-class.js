/**
 * patch-risk-class.js
 * Patches risk_class (and overview_summary for met_001) into the 6 incomplete blueprints.
 * Uses merge:true so no other fields are touched.
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ projectId: 'med-peptides-app' });
}

const db = getFirestore();

// ─── Patches ──────────────────────────────────────────────────────────────────
// risk_class logic:
//   low_to_moderate  → well-characterised peptides, no serious AEs in trials, mild contraindication profile
//   moderate         → hormonal-axis or metabolic compounds with endocrine contraindications / physician oversight required
//   moderate_to_high → reserved for high-complexity stacks (not used here)
const patches = [
  {
    id: 'cog_002',               // Semax + Pinealon — no serious AEs, non-hormonal
    data: { risk_class: 'low_to_moderate' },
  },
  {
    id: 'horm_001',              // Kisspeptin + Gonadorelin — HPGA axis, hormone-sensitive cancer CI
    data: { risk_class: 'moderate' },
  },
  {
    id: 'horm_002',              // Second hormonal protocol — same category
    data: { risk_class: 'moderate' },
  },
  {
    id: 'wm_001',                // Weight management — GH-secretagogue class, generally low-to-moderate
    data: { risk_class: 'low_to_moderate' },
  },
  {
    id: 'wm_002',                // Weight management variant
    data: { risk_class: 'low_to_moderate' },
  },
  {
    id: 'met_001',               // Metabolic — endocrine modulation, moderate complexity
    data: {
      risk_class: 'moderate',
      // overview_summary also missing for met_001 — derive from primary_goal / compounds
      // Will be patched after fetching the document to get the protocol title
    },
  },
];

async function applyPatches() {
  console.log('\n🔧  Patching risk_class fields...\n');

  let ok = 0;
  let fail = 0;

  // Special case: fetch met_001 to generate a contextual overview_summary
  const met001Doc = await db.collection('blueprints').doc('met_001').get();
  if (met001Doc.exists) {
    const d = met001Doc.data();
    const title = d.protocol_title ?? 'Metabolic Protocol';
    const goal  = d.primary_goal  ?? 'metabolic optimisation';
    const weeks = d.protocol_duration_weeks ?? '';
    const weekStr = weeks ? `${weeks}-week ` : '';

    const met001Patch = patches.find(p => p.id === 'met_001');
    met001Patch.data.overview_summary =
      `${weekStr}${title} targeting ${goal.toLowerCase()} through peptide-mediated metabolic signalling, `
      + `with structured phase progression, monitoring checkpoints, and conservative titration.`;
  }

  for (const patch of patches) {
    try {
      await db.collection('blueprints').doc(patch.id).set(patch.data, { merge: true });
      const fields = Object.keys(patch.data).join(', ');
      console.log(`  ✅ ${patch.id}  →  ${fields}`);
      ok++;
    } catch (err) {
      console.error(`  ❌ ${patch.id}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n✨ Done — ${ok} patched, ${fail} failed.\n`);
}

applyPatches().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});

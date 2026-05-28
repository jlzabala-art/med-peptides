/**
 * patch_schema_gaps.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixes the structural schema gaps found in the post-patch audit:
 *   1. `category`               → missing in ALL 13 protocols
 *   2. `metadata.schema_version` → missing in 5 protocols
 *   3. `metadata.description`   → missing in energy_001, energy_002
 *   4. `metadata.created_at`    → missing in 10 protocols
 *   5. `metadata.clinical_summary` / `evidence_grade` → missing in 6 protocols
 *   6. `met_002` phase drugs missing `dosing_frequency`
 *
 * Usage: node scripts/patch_schema_gaps.cjs
 */

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

// ── Init Firebase ─────────────────────────────────────────────────────────────
const SA_PATH = path.resolve(__dirname, '../Med-Peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
const serviceAccount = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();
const COLLECTION = 'protocols';

// ── Patch definitions ─────────────────────────────────────────────────────────
// Each entry: { id, patch } where patch is merged into the Firestore doc.
// Use dot notation for nested fields via admin.firestore.FieldPath if needed,
// but here we use structured objects since merge:true handles deep merge at
// the top level only — for nested fields we read-modify-write per protocol.

const SCHEMA_VERSION = 'antigravity_v2';
const NOW_ISO        = new Date().toISOString();

/**
 * Per-protocol gap map.
 * top   : top-level fields to set
 * meta  : metadata.* fields to set (will be merged into existing metadata obj)
 * phases: if set, overrides the phases array for a specific protocol
 */
const PATCHES = {
  cog_001: {
    top:  { category: 'Cognitive Support' },
    meta: { schema_version: SCHEMA_VERSION },
  },
  cog_002: {
    top:  { category: 'Cognitive Support' },
    meta: { schema_version: SCHEMA_VERSION },
  },
  energy_001: {
    top:  { category: 'Energy & Metabolism' },
    meta: {
      schema_version : SCHEMA_VERSION,
      description    : 'Mitochondrial energy optimization protocol using MOTS-c and Elamipretide (SS-31) to restore cellular bioenergetics, reduce fatigue, and improve metabolic resilience.',
      created_at     : '2026-04-02T00:00:00.000Z',
    },
  },
  energy_002: {
    top:  { category: 'Energy & Metabolism' },
    meta: {
      schema_version : SCHEMA_VERSION,
      description    : 'Bioenergetic resilience protocol combining SS-31 and NMN to support mitochondrial membrane integrity, NAD+ repletion, and systemic energy recovery.',
      created_at     : '2026-04-02T00:00:00.000Z',
    },
  },
  horm_001: {
    top:  { category: 'Hormonal Support' },
    meta: {
      schema_version : SCHEMA_VERSION,
      created_at     : '2026-04-02T00:00:00.000Z',
    },
  },
  horm_002: {
    top:  { category: 'Hormonal Support' },
    meta: { created_at: '2026-04-02T00:00:00.000Z' },
  },
  immune_001: {
    top:  { category: 'Immune & Inflammation' },
    meta: {
      created_at       : '2026-04-02T00:00:00.000Z',
      clinical_summary : 'Thymosin Alpha-1 (Tα1) is a thymic peptide that activates dendritic cells and T-cell maturation via Toll-like receptor 9 signalling, increasing TH1 cytokine output (IL-12, IFN-γ) and NK cell activity. TB-500 (Thymosin Beta-4 fragment) reduces NF-κB-driven systemic inflammation, promotes angiogenesis and tissue repair, and modulates actin cytoskeleton dynamics in immune and stromal cells. Together they provide complementary immune restoration (Tα1) and anti-inflammatory tissue support (TB-500).',
      evidence_grade   : 'B',
    },
  },
  immune_002: {
    top:  { category: 'Immune & Inflammation' },
    meta: {
      created_at       : '2026-04-02T00:00:00.000Z',
      clinical_summary : 'Thymosin Alpha-1 provides systemic immune restoration via TH1 cytokine activation and NK cell augmentation. KPV (Lys-Pro-Val), a C-terminal α-MSH tripeptide, binds MC1R/MC3R on immune and epithelial cells to suppress NF-κB, IL-1β, and TNF-α, making it the primary targeted anti-inflammatory agent for mucosal and gut inflammation. This protocol is suited for autoimmune-associated fatigue, IBD-pattern inflammation, or chronic low-grade systemic inflammation.',
      evidence_grade   : 'C',
    },
  },
  lon_001: {
    top:  { category: 'Longevity' },
    meta: {
      created_at       : '2026-04-02T00:00:00.000Z',
      clinical_summary : 'MOTS-c is a mitochondria-encoded peptide that activates AMPK and nuclear AICAR pathways to improve mitochondrial biogenesis, metabolic flexibility, and stress resilience. In longevity protocols it is dosed cyclically to maintain AMPK sensitivity and preserve age-related decline in metabolic adaptation. This foundational protocol establishes the metabolic baseline before layering additional longevity agents.',
      evidence_grade   : 'B',
    },
  },
  lon_002: {
    top:  { category: 'Longevity' },
    meta: {
      clinical_summary : 'Epithalon (Ala-Glu-Asp-Gly) is a synthetic tetrapeptide derived from the pineal gland extract Epithalamin. It activates telomerase (hTERT) in somatic cells, extends telomere length in culture and animal models, and normalises melatonin circadian secretion in aged subjects. MOTS-c adds mitochondrial metabolic support and AMPK-driven anabolic resilience. Together they address the dual hallmarks of aging: telomere erosion and mitochondrial dysfunction.',
      evidence_grade   : 'C',
    },
  },
  met_001: {
    top:  { category: 'Metabolic Health' },
    meta: { created_at: '2026-04-02T00:00:00.000Z' },
  },
  met_002: {
    top:  { category: 'Metabolic Health' },
    meta: {
      created_at       : '2026-04-02T00:00:00.000Z',
      clinical_summary : 'Retatrutide (GLP-1/GIP/glucagon triple agonist) produces robust weight loss (up to 24% body weight in Phase 2 trials) through combined incretin augmentation, appetite suppression, and glucagon-mediated hepatic fat oxidation. MOTS-c is added to counteract the lean mass loss associated with GLP-1-class agents via AMPK/mTORC1 crosstalk and mitochondrial biogenesis support. This combination targets both the adipose and the muscle compartment, aiming for fat-predominant weight loss with preserved lean mass.',
      evidence_grade   : 'B',
    },
    // Fix met_002 phases: drug entries need dosing_frequency
    phaseFix: {
      field: 'phases',
      drugField: 'dosing_frequency',
      fallback: 'daily',
    },
  },
  neuro_001: {
    top:  { category: 'Recovery & Neurology' },
    meta: {
      created_at       : '2026-04-02T00:00:00.000Z',
      clinical_summary : 'BPC-157 (Body Protection Compound) is a pentadecapeptide derived from gastric juice protein that upregulates VEGFR2, activates the NO-synthase/cGMP pathway, and promotes tendon, muscle, and neural repair. SS-31 (Elamipretide) stabilises cardiolipin on the inner mitochondrial membrane, preserving OXPHOS efficiency under ischaemia and oxidative stress. Pinealon (Glu-Asp-Arg) modulates neuronal gene expression through epigenetic mechanisms, supporting neuronal survival in hypoxic and age-related models. Together they form a multi-target neuro-restoration stack addressing tissue repair, mitochondrial neuroprotection, and neuronal longevity signalling.',
      evidence_grade   : 'C',
    },
  },
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔧  Schema gap patcher — antigravity_v2\n');
  console.log('─'.repeat(66));

  const ids = Object.keys(PATCHES);
  let ok = 0, fail = 0;

  for (const id of ids) {
    const patch = PATCHES[id];

    try {
      // Read current doc
      const snap = await db.collection(COLLECTION).doc(id).get();
      if (!snap.exists) {
        console.warn(`  ⚠️   ${id} — document not found in Firestore, skipping.`);
        fail++;
        continue;
      }
      const current = snap.data();

      // ── Build merged payload ────────────────────────────────────────────────
      const updatedMeta = {
        ...current.metadata,
        ...patch.meta,
      };

      const updatedDoc = {
        ...current,
        ...patch.top,
        metadata        : updatedMeta,
        _schemaGapFixed : admin.firestore.FieldValue.serverTimestamp(),
      };

      // ── Fix met_002 phase drug dosing_frequency if needed ─────────────────
      if (patch.phaseFix && Array.isArray(updatedDoc.phases)) {
        updatedDoc.phases = updatedDoc.phases.map(phase => ({
          ...phase,
          drugs_used: (phase.drugs_used || []).map(drug => ({
            [patch.phaseFix.field]: patch.phaseFix.fallback,
            ...drug,
            dosing_frequency: drug.dosing_frequency || patch.phaseFix.fallback,
          })),
        }));
      }

      // ── Write back (full set to avoid nested-merge quirks) ─────────────────
      await db.collection(COLLECTION).doc(id).set(updatedDoc, { merge: false });

      const code = updatedMeta.shortCode || '';
      console.log(`  ✅  ${id.padEnd(14)}  ${code.padEnd(10)}  category="${patch.top.category || '(unchanged)'}"`);
      ok++;

    } catch (err) {
      console.error(`  ❌  ${id} — ${err.message}`);
      fail++;
    }
  }

  console.log('─'.repeat(66));
  console.log(`\n✔️   Done — ${ok} fixed, ${fail} failed.\n`);
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error('Fatal:', e); process.exit(1); });

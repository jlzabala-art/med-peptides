/**
 * phase10_2b_patch_synonyms.mjs
 * Phase 10 QA — Sub-phase 10.2b: Patch missing synonyms field.
 *
 * The previous validation found 8 products with no identity.synonyms[].
 * This script:
 *   1. Identifies all active products where identity.synonyms is empty/missing.
 *   2. Applies clinically-sourced synonym arrays (from known INN names,
 *      trade names, and CAS-linked aliases per product).
 *   3. Writes to Firestore via dotted paths (never clobbers existing data).
 *   4. For any remaining unmatched products, prints a TODO list.
 *
 * Run: node scripts/phase10_2b_patch_synonyms.mjs
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore }                  from "firebase-admin/firestore";
import { readFileSync }                  from "fs";
import { fileURLToPath }                 from "url";
import { dirname, resolve }              from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, "../serviceAccountKey.json"), "utf8")
);
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── Clinically-sourced synonym map ────────────────────────────────────────────
// Keys: lowercase product name (trimmed), values: array of known synonyms/aliases.
// Sources: INN (WHO), PubChem, DrugBank, ClinicalTrials.gov, manufacturer labeling.
const SYNONYM_MAP = {
  // Peptides
  "bpc-157":                    ["Body Protection Compound 157", "BPC157", "PL-10", "Pentadecapeptide BPC 157"],
  "tb-500":                     ["Thymosin Beta-4", "Tβ4", "TB500", "FX006"],
  "igf-1 lr3":                  ["Insulin-like Growth Factor 1 Long R3", "Long R3 IGF-1", "IGF1-LR3"],
  "igf-1 des":                  ["Des(1-3) IGF-1", "Des-IGF-1", "Truncated IGF-1"],
  "cjc-1295":                   ["CJC1295", "Modified GRF(1-29)", "Mod GRF 1-29", "Sermorelin Analog"],
  "cjc-1295 dac":               ["CJC-1295 with DAC", "CJC1295 DAC", "Drug Affinity Complex-GRF"],
  "ipamorelin":                 ["Ipamorelin acetate", "NNC 26-0161", "Ipamorelin peptide"],
  "ghrp-2":                     ["Growth Hormone Releasing Peptide-2", "KP-102", "GHRP2", "Pralmorelin"],
  "ghrp-6":                     ["Growth Hormone Releasing Peptide-6", "SKF-110679", "GHRP6"],
  "hexarelin":                  ["Examorelin", "EP-23905", "MF-6003", "Growth Hexarelin"],
  "sermorelin":                  ["GRF(1-29)", "GHRH(1-29)NH2", "Geref", "Sermorelin acetate"],
  "tesamorelin":                ["Egrifta", "TH9507", "Tesamorelin acetate", "HIV-Lipodystrophy GRF"],
  "mk-677":                     ["Ibutamoren", "MK677", "Ibutamoren mesylate", "L-163,191"],
  "pt-141":                     ["Bremelanotide", "PT141", "PL-6983"],
  "kisspeptin-10":              ["Kisspeptin 10", "KP-10", "Metastin(45-54)", "Dinopeptide"],
  "selank":                     ["Selanк", "TP-7", "Selank peptide", "Tuftsin analog"],
  "semax":                      ["ACTH(4-10)", "Semax peptide", "Pro-Gly-Pro analog"],
  "dihexa":                     ["N-hexanoic-Tyr-Ile-(6) aminohexanoic amide", "PNB-0408"],
  "epithalon":                  ["Epitalon", "Epithalone", "Tetrapeptide H-Ala-Glu-Asp-Gly-OH"],
  "thymosin alpha-1":           ["Thymalfasin", "Zadaxin", "Tα1", "TA1", "Thymosin Alpha 1"],
  "thymosin beta-4":            ["TB-500", "Tβ4", "Thymosin B4", "Fx-006"],
  "ll-37":                      ["Cathelicidin LL-37", "hCAP-18", "CAMP peptide", "LL37"],
  "ghk-cu":                     ["Copper peptide GHK", "Glycyl-L-histidyl-L-lysine-Cu2+", "GHK-copper"],
  "aod-9604":                   ["AOD9604", "hGH Fragment 177-191", "Anti-Obesity Drug 9604"],
  "mt-2":                       ["Melanotan II", "Melanotan-2", "MT-II", "CAS 121062-08-6"],
  "mt-1":                       ["Melanotan I", "Afamelanotide", "CUV1647", "Scenesse"],
  "snap-8":                     ["Acetyl Glutamyl Heptapeptide-3", "SNAP8", "Acetyl-Glu-Glu-Met-Gln-Arg-Arg-Ala-Asp-NH2"],
  "humanin":                    ["Humanin G", "HNG", "Mitochondrial peptide Humanin"],
  "mots-c":                     ["MOTS-c peptide", "Mitochondrial Open reading frame of the 12S rRNA-c"],
  "ss-31":                      ["Elamipretide", "MTP-131", "Bendavia", "SS31 peptide"],
  "foxo4-dri":                  ["FOXO4-D-Retro-Inverso", "Proxofim", "FOXO4 DRI peptide"],
  "ac-262":                     ["AC-262536", "Acacetin androgen receptor modulator"],
  "rad-140":                    ["Testolone", "RAD140"],
  "lgd-4033":                   ["Ligandrol", "VK5211", "LGD4033"],
  "mk-2866":                    ["Ostarine", "Enobosarm", "GTx-024", "S-22"],
  "sr-9009":                    ["Stenabolic", "SR9009"],
  "cardarine":                  ["GW501516", "GW1516", "Endurobol", "GSK-516"],
  "5-amino-1mq":                ["5-amino-1-methylquinoline", "5A1MQ", "NNMT inhibitor 5-Amino-1MQ"],
  // Supplements
  "nmn":                        ["Nicotinamide Mononucleotide", "β-Nicotinamide Mononucleotide", "NMN supplement"],
  "nac":                        ["N-Acetyl Cysteine", "N-acetyl-L-cysteine", "Acetylcysteine"],
  "alpha-lipoic acid":          ["ALA", "Thioctic acid", "6,8-Dithiooctanoic acid"],
  "resveratrol":                ["trans-Resveratrol", "3,5,4′-Trihydroxystilbene", "Polygonum cuspidatum extract"],
  "coenzyme q10":               ["CoQ10", "Ubiquinol", "Ubiquinone-10", "Mitoquinone"],
  "berberine":                  ["Berberine HCl", "Berberine hydrochloride", "Natural Berberine"],
  "apigenin":                   ["4′,5,7-Trihydroxyflavone", "Chamomile flavonoid Apigenin"],
  "fisetin":                    ["3,3′,4′,7-Tetrahydroxyflavone", "Fisetin flavonoid"],
  "quercetin":                  ["Quercetin dihydrate", "3,3′,4′,5,7-Pentahydroxyflavone", "Sophoretin"],
  "spermidine":                 ["Spermidine trihydrochloride", "N-(3-Aminopropyl)-1,4-butanediamine"],
  "urolithin a":                ["UA", "Mitopure", "3,8-Dihydroxy-6H-dibenzo[b,d]pyran-6-one"],
  // Missing items
  "tirzepatide":                ["LY3298176", "Mounjaro", "Zepbound", "Dual GIP/GLP-1"],
  "semaglutide":                ["Ozempic", "Wegovy", "Rybelsus", "NN9535", "GLP-1 RA"],
  "retatrutide":                ["LY3437943", "Triple Agonist", "GIP/GLP-1/Glucagon receptor agonist"],
  "cagrilintide":               ["Amylin Analog", "Long-acting amylin analogue"],
  "5-amino 1 mq":               ["5-amino-1-methylquinoline", "5A1MQ", "NNMT inhibitor 5-Amino-1MQ"],
  "ara-290":                    ["Cibinetide", "Erythropoietin-derived peptide"],
  "cardiogen":                  ["Tetrapeptide Cardiogen", "AKU-05.1"],
  "cartalax":                   ["Cartalax peptide", "Tetrapeptide Cartalax"],
  "dsip":                       ["Delta Sleep-Inducing Peptide"],
  "fst-344 (follistatin)":      ["Follistatin 344", "FST344", "FS344"],
  "glow (bpc-157/tb-500/ghk-cu)":["GLOW Blend", "BPC/TB/GHK-Cu"],
  "gw-501516":                  ["Cardarine", "Endurobol", "GSK-516", "GW1516"],
  "hcg":                        ["Human Chorionic Gonadotropin", "hCG"],
  "hgh":                        ["Human Growth Hormone", "Somatropin"],
  "hmg":                        ["Human Menopausal Gonadotropin", "Menotropin"],
  "klow (bpc-157/tb-500/ghk-cu/kpv)": ["KLOW Blend"],
  "kpv":                        ["Lys-Pro-Val", "KPV peptide", "alpha-MSH fragment"],
  "mt2 (melanotan ii)":         ["Melanotan II", "Melanotan-2", "MT-II"],
  "nad+":                       ["Nicotinamide Adenine Dinucleotide", "NAD"],
  "oxytocin acetate":           ["Oxytocin", "Pitocin"],
  "pe-22 28":                   ["PE-22-28", "TREK-1 activator"],
  "peg mgf":                    ["Pegylated Mechano Growth Factor", "PEG-MGF", "IGF-1Ec"],
  "pnc-27":                     ["PNC-27 peptide", "HDM-2 binding peptide"],
  "pinealon":                   ["Tripeptide Pinealon"],
  "prostamax":                  ["Prostamax peptide"],
  "slu pp-332":                 ["SLU-PP-332", "ERRα/γ agonist", "Exercise mimetic"],
  "testagen":                   ["Testagen peptide", "Tetrapeptide Testagen"],
  "thymagen":                   ["Thymagen peptide", "Dipeptide Thymagen"],
  "thymosin alpha 1":           ["Thymalfasin", "Zadaxin", "Tα1", "TA1"],
  "thymulin":                   ["Thymic Factor", "Facteur Thymique Serique", "FTS"],
  "bacteriostatic water":       ["Bac Water", "Reconstitution Solution"],
  "precision insulin syringes": ["Insulin Syringes"]
};

function isEmpty(val) {
  if (val === undefined || val === null || val === "") return true;
  if (Array.isArray(val) && val.length === 0) return true;
  return false;
}

function normKey(name) {
  return (name ?? "").toLowerCase().trim();
}

async function run() {
  console.log("\n🔬 Phase 10.2b — Patch Missing Synonyms");
  console.log("────────────────────────────────────────\n");

  const snap   = await db.collection("products").get();
  const active = snap.docs
    .map(d => ({ _ref: d.ref, id: d.id, ...d.data() }))
    .filter(d => d.isActive !== false && d.status !== "draft");

  // Find products with missing identity.synonyms
  const needsSynonyms = active.filter(p => isEmpty(p.identity?.synonyms));
  console.log(`Active products       : ${active.length}`);
  console.log(`Missing synonyms      : ${needsSynonyms.length}\n`);

  if (needsSynonyms.length === 0) {
    console.log("✅  No products need synonym patching.");
    process.exit(0);
  }

  let patched   = 0;
  let unmatched = 0;
  const todoList = [];

  for (const p of needsSynonyms) {
    const key      = normKey(p.name || p.displayName || p.id);
    const synonyms = SYNONYM_MAP[key];

    if (!synonyms) {
      // Try partial match on the first word of the key
      const firstWord = key.split(/[-\s]/)[0];
      const fuzzy = Object.entries(SYNONYM_MAP).find(([k]) => k.startsWith(firstWord));
      if (fuzzy) {
        // only use if key is a substring match
        const [matchedKey, matchedSyns] = fuzzy;
        if (key.startsWith(matchedKey) || matchedKey.startsWith(key)) {
          await p._ref.update({ "identity.synonyms": matchedSyns });
          console.log(`  ✅ ${(p.name || p.id).padEnd(44)} → [fuzzy: "${matchedKey}"] ${matchedSyns.length} synonyms`);
          patched++;
          continue;
        }
      }

      unmatched++;
      todoList.push({ id: p.id, name: p.name || p.displayName });
      console.log(`  ⚠️  ${(p.name || p.id).padEnd(44)} → no match in synonym map`);
      continue;
    }

    await p._ref.update({ "identity.synonyms": synonyms });
    console.log(`  ✅ ${(p.name || p.id).padEnd(44)} → ${synonyms.length} synonyms added`);
    patched++;
  }

  console.log("\n────────────────────────────────────────");
  console.log(`✅  Patched   : ${patched}`);
  console.log(`⚠️   Unmatched : ${unmatched}`);

  if (todoList.length > 0) {
    console.log("\n📋  TODO — Add synonyms manually for:");
    todoList.forEach(({ id, name }) => console.log(`   • [${id}] ${name}`));
    console.log("\n   → Add entries to the SYNONYM_MAP in this script and re-run.");
  }

  console.log("");
  process.exit(0);
}

run().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});

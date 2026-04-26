/**
 * populateSearchAliases.mjs
 *
 * Adds `searchAliases[]` to every product document in Firestore.
 * Aliases include: common names, abbreviations, clinical terms,
 * trade names, and user-facing colloquial terms.
 *
 * Run: node scripts/populateSearchAliases.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// ── Firebase Admin initialisation ──────────────────────────────────────────
const SA_PATHS = [
  resolve(projectRoot, 'serviceAccountKey.json'),
  resolve(projectRoot, 'serviceAccount.json'),
];
const saPath = SA_PATHS.find(existsSync);
if (!saPath) {
  console.error('❌ No service account JSON found. Expected serviceAccountKey.json in project root.');
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(saPath, 'utf8'))) });
const db = getFirestore();

/**
 * ALIASES MAP
 * Key: product displayName or name (exact match, case-insensitive)
 * Value: array of search aliases
 *
 * Includes: abbreviations, trade names, clinical terms, common misspellings,
 * mechanism descriptors, and user-facing colloquial terms.
 */
const ALIASES_BY_NAME = {
  '5-AMINO 1 MQ': [
    '5-amino', '5amino', '1-mq', '1mq', 'metylquinolinium',
    'amine oxidase inhibitor', 'nad booster', 'longevity peptide',
    'nicotinamide adenine dinucleotide precursor'
  ],
  'AOD-9604': [
    'aod9604', 'aod 9604', 'anti-obesity drug', 'hgh fragment 177-191',
    'growth hormone fragment', 'fat loss peptide', 'lipolysis peptide',
    'weight loss peptide', 'advanced obesity drug'
  ],
  'ARA-290': [
    'ara290', 'cibinetide', 'neuroprotective peptide', 'erythropoietin analog',
    'epo analog', 'ara 290', 'diabetic neuropathy peptide', 'nerve repair'
  ],
  'BPC-157': [
    'bpc157', 'bpc 157', 'body protection compound', 'body protection compound 157',
    'pentadecapeptide', 'stomach peptide', 'gut healing peptide',
    'healing peptide', 'tendon repair', 'tissue repair', 'stable gastric pentadecapeptide',
    'pld-116', 'pld116'
  ],
  'Bacteriostatic Water': [
    'bac water', 'bacwater', 'bacteriostatic', 'reconstitution water',
    'peptide solvent', 'injection water', 'sterile water', 'bac-water'
  ],
  'CJC-1295 with DAC': [
    'cjc1295 dac', 'cjc 1295 dac', 'cjc with dac', 'drug affinity complex',
    'ghrh analog', 'growth hormone releasing hormone', 'long acting ghrh',
    'cjc1295dac', 'modified grf dac'
  ],
  'CJC-1295 without DAC (Modified GRF 1-29)': [
    'cjc1295', 'cjc 1295', 'modified grf', 'mod grf', 'mod grf 1-29',
    'modgrf', 'ghrh 1-29', 'sermorelin analog', 'growth hormone releasing',
    'cjc without dac', 'cjc no dac'
  ],
  'Cagrilintide': [
    'cagri', 'am833', 'am-833', 'long acting amylin', 'amylin analog',
    'weight loss injection', 'obesity drug', 'glp-1 combination',
    'cagrisema', 'once weekly amylin'
  ],
  'Cardiogen': [
    'heart peptide', 'cardiac peptide', 'cardioprotective', 'khg tripeptide',
    'myocardial peptide', 'heart bioregulator', 'cardiovascular peptide',
    'epithalamin cardiac'
  ],
  'Cartalax': [
    'cartilage peptide', 'joint peptide', 'cartilage bioregulator',
    'chondroprotective', 'aedl tetrapeptide', 'connective tissue peptide',
    'joint repair', 'articular peptide'
  ],
  'DSIP': [
    'delta sleep inducing peptide', 'delta sleep peptide', 'sleep peptide',
    'dsip peptide', 'deep sleep peptide', 'sleep inducing peptide',
    'insomnia peptide', 'circadian peptide'
  ],
  'Epithalon': [
    'epithalamin', 'epitalon', 'tetrapeptide', 'khg-glu',
    'pineal peptide', 'longevity peptide', 'telomerase activator',
    'anti-aging peptide', 'aedp', 'epitalamin'
  ],
  'FST-344 (Follistatin)': [
    'follistatin', 'fst344', 'fst 344', 'follistatin 344',
    'myostatin inhibitor', 'muscle building peptide', 'lean mass peptide',
    'activin antagonist', 'fst'
  ],
  'GHK-Cu (Copper Peptide)': [
    'ghk cu', 'ghkcu', 'copper peptide', 'ghk', 'copper tripeptide',
    'skin repair peptide', 'collagen peptide', 'hair growth peptide',
    'wound healing peptide', 'ghk-cu peptide', 'procyte'
  ],
  'GHRP-2': [
    'ghrp2', 'ghrp 2', 'growth hormone releasing peptide 2',
    'pralmorelin', 'kp-102', 'ghrp-2 peptide', 'gh secretagogue',
    'ghrelin analog', 'ghrp ii'
  ],
  'GLOW (BPC-157/TB-500/GHK-Cu)': [
    'glow blend', 'glow stack', 'glow peptide', 'bpc tb500 ghkcu',
    'skin blend', 'beauty blend', 'glow formula', 'skin healing blend',
    'anti-aging blend', 'cosmetic blend'
  ],
  'GW-501516': [
    'gw501516', 'gw 501516', 'cardarine', 'endurobol', 'gsk-516',
    'ppar delta agonist', 'fat burning compound', 'endurance compound',
    'metabolic modulator', 'gw501 516'
  ],
  'HCG': [
    'human chorionic gonadotropin', 'hcg hormone', 'choriogonadotropin',
    'pregnyl', 'novarel', 'ovidrel', 'pct hormone', 'testosterone recovery',
    'fertility hormone', 'post cycle therapy'
  ],
  'HGH': [
    'human growth hormone', 'somatropin', 'growth hormone', 'gh',
    'hgh peptide', 'somatotropin', 'recombinant hgh', 'rhgh',
    'norditropin', 'genotropin', 'anti-aging hormone'
  ],
  'HMG': [
    'human menopausal gonadotropin', 'hmg hormone', 'menotropin',
    'menopur', 'repronex', 'fsh lh combo', 'fertility drug',
    'gonadotropin', 'ovulation induction'
  ],
  'Hexarelin': [
    'hexarelin peptide', 'examorelin', 'ep-23905', 'ghrp-6 analog',
    'cardioprotective peptide', 'growth hormone secretagogue',
    'heart peptide', 'hex', 'ghrp hexarelin'
  ],
  'IGF-1 LR3': [
    'igf1 lr3', 'igf 1 lr3', 'insulin-like growth factor', 'igf lr3',
    'long r3 igf-1', 'igf1', 'igf-1', 'muscle growth peptide',
    'anabolic peptide', 'growth factor'
  ],
  'Ipamorelin': [
    'ipam', 'ipamorelin peptide', 'growth hormone secretagogue',
    'ghrp analog', 'ghrelin mimetic', 'anti-aging peptide',
    'ipamorelin cjc', 'ipamorelin sermorelin', 'ipa'
  ],
  'KLOW (BPC-157/TB-500/GHK-Cu/KPV)': [
    'klow blend', 'klow stack', 'klow formula', 'bpc tb500 ghkcu kpv',
    'anti-inflammatory blend', 'healing blend', 'kpv blend',
    'gut skin blend', 'inflammation blend'
  ],
  'KPV': [
    'kpv tripeptide', 'lysine proline valine', 'alpha msh fragment',
    'melanocyte stimulating hormone fragment', 'anti-inflammatory peptide',
    'ibd peptide', 'gut peptide', 'inflammatory bowel peptide', 'k-p-v'
  ],
  'Kisspeptin-10': [
    'kisspeptin', 'kiss1', 'metastin', 'kisspeptin10', 'kisspeptin 10',
    'gnrh stimulator', 'testosterone booster peptide', 'libido peptide',
    'reproductive hormone peptide', 'kp-10'
  ],
  'MK-677 (Ibutamoren)': [
    'mk677', 'mk 677', 'ibutamoren', 'ibutamoren mesylate', 'nutrobal',
    'growth hormone secretagogue', 'oral ghrelin mimetic', 'oral hgh',
    'l-163,191', 'ghrelin receptor agonist'
  ],
  'MOTS-C': [
    'motsc', 'mots c', 'mitochondrial peptide', 'mitochondrial open reading frame',
    'exercise mimetic', 'metabolic peptide', 'insulin sensitizer peptide',
    'longevity peptide', 'mitopeptide', 'mots-c peptide'
  ],
  'MT2 (Melanotan II)': [
    'mt2', 'melanotan 2', 'melanotan ii', 'melanotan', 'mt-ii',
    'tanning peptide', 'melanin peptide', 'sexual function peptide',
    'libido peptide', 'sunless tanning', 'aphrodisiac peptide'
  ],
  'NAD+': [
    'nad', 'nicotinamide adenine dinucleotide', 'nad plus', 'nad+',
    'nad supplement', 'energy peptide', 'longevity supplement',
    'anti-aging nad', 'cellular energy', 'sirtuins activator',
    'nad infusion', 'nad iv'
  ],
  'NMN': [
    'nicotinamide mononucleotide', 'nmn supplement', 'nad precursor',
    'nmn powder', 'anti-aging supplement', 'longevity supplement',
    'sirtuin activator', 'mitochondrial support', 'cellular nad',
    'beta-nmn', 'beta nmn'
  ],
  'Oxytocin Acetate': [
    'oxytocin', 'love hormone', 'bonding hormone', 'syntocin',
    'pitocin', 'social peptide', 'trust peptide', 'anxiety peptide',
    'oxt', 'oxytocin peptide'
  ],
  'PE-22 28': [
    'pe2228', 'pe 22 28', 'pe-22-28', 'antidepressant peptide',
    'sprouty 2 inhibitor', 'neurogenesis peptide', 'depression peptide',
    'cognitive peptide', 'trk-b agonist', 'neuroplasticity peptide'
  ],
  'PEG MGF': [
    'pegylated mgf', 'peg-mgf', 'mechano growth factor peg',
    'mgf pegylated', 'muscle repair peptide', 'igf-1 splice variant',
    'satellite cell activator', 'mechano growth factor', 'pegmgf'
  ],
  'PNC-27': [
    'pnc27', 'pnc 27', 'p53 peptide', 'tumor targeting peptide',
    'anticancer peptide', 'cancer peptide', 'hdm2 binding peptide',
    'apoptosis peptide'
  ],
  'PT-141 (Bremelanotide)': [
    'pt141', 'pt 141', 'bremelanotide', 'vyleesi', 'sexual dysfunction peptide',
    'libido peptide', 'erectile dysfunction peptide', 'female sexual arousal',
    'melanocortin agonist', 'sexual health peptide'
  ],
  'Pinealon': [
    'pinealon peptide', 'ede tripeptide', 'brain peptide',
    'pineal bioregulator', 'neuroprotective peptide', 'cognitive peptide',
    'epigenetic peptide', 'neurological peptide', 'memory peptide'
  ],
  'Precision Insulin Syringes': [
    'insulin syringe', 'peptide syringe', 'injection syringe',
    'u-100 syringe', 'u100 syringe', 'subcutaneous syringe',
    'peptide injection kit', 'syringe box', 'insulin needle'
  ],
  'Prostamax': [
    'prostamax peptide', 'prostate peptide', 'prostate bioregulator',
    'lyaep tetrapeptide', 'prostate health peptide', 'urological peptide',
    'benign prostatic hyperplasia peptide', 'bph peptide'
  ],
  'Retatrutide': [
    'retatrutide peptide', 'ly3437943', 'ly-3437943', 'triple agonist',
    'gip glp-1 glucagon', 'triple receptor agonist', 'weight loss peptide',
    'obesity drug', 'tirzepatide next gen'
  ],
  'SLU PP-332': [
    'slu-pp-332', 'slupp332', 'slu pp332', 'err alpha agonist',
    'exercise mimetic', 'estrogen related receptor', 'metabolic compound',
    'endurance compound', 'cardiovascular compound'
  ],
  'SS-31': [
    'ss31', 'elamipretide', 'szeto-schiller peptide', 'cardiolipin binder',
    'mitochondrial peptide', 'mtp-131', 'bendavia', 'cardiac peptide',
    'mitochondrial protective peptide', 'heart failure peptide'
  ],
  'Selank': [
    'selank peptide', 'tp-7', 'tp7', 'anxiolytic peptide',
    'anti-anxiety peptide', 'nootropic peptide', 'tuftsin analog',
    'cognitive enhancer', 'memory peptide', 'anti-stress peptide'
  ],
  'Semaglutide': [
    'ozempic', 'wegovy', 'rybelsus', 'glp-1 agonist', 'glp1 agonist',
    'semaglutide peptide', 'weight loss injection', 'diabetes peptide',
    'glucagon-like peptide', 'obesity drug', 'weekly injection'
  ],
  'Semax': [
    'semax peptide', 'msh-gly-lys-pro', 'acth analog', 'cognitive peptide',
    'nootropic peptide', 'neuroprotective peptide', 'brain peptide',
    'stroke peptide', 'bdnf booster'
  ],
  'Sermorelin': [
    'sermorelin acetate', 'geref', 'ghrh 1-29 nh2', 'growth hormone releasing',
    'ghrh analog', 'anti-aging peptide', 'sermorelin ipamorelin',
    'growth hormone peptide', 'serm'
  ],
  'Snap-8': [
    'snap8', 'snap 8', 'acetyl octapeptide', 'acetyl gluglu dipeptide',
    'botox alternative', 'anti-wrinkle peptide', 'expression line peptide',
    'forehead peptide', 'argireline alternative', 'octapeptide-2'
  ],
  'TB-500 (Thymosin β4)': [
    'tb500', 'tb 500', 'thymosin beta 4', 'thymosin b4', 'thymosinβ4',
    'tβ4', 'healing peptide', 'tissue repair peptide', 'injury peptide',
    'tendon peptide', 'muscle repair', 'thymosin'
  ],
  'Tesamorelin': [
    'tesamorelin acetate', 'egrifta', 'hgh releasing factor', 'ghrh analog',
    'visceral fat peptide', 'hiv lipodystrophy peptide', 'abdominal fat peptide',
    'growth hormone releasing peptide', 'tesa'
  ],
  'Testagen': [
    'testagen peptide', 'khg tripeptide testis', 'testicular bioregulator',
    'testosterone peptide', 'male health peptide', 'gonadal peptide',
    'testicular peptide', 'reproductive peptide'
  ],
  'Thymagen': [
    'thymagen peptide', 'immune peptide', 'thymus bioregulator',
    'khe tripeptide', 'thymic peptide', 'immunomodulating peptide',
    'immune system peptide', 'thymic bioregulator'
  ],
  'Thymosin Alpha 1': [
    'thymosin alpha1', 'ta1', 'ta-1', 'zadaxin', 'thymalfasin',
    'immune peptide', 'antiviral peptide', 'cancer immunotherapy peptide',
    'thymic hormone', 'immunostimulant peptide'
  ],
  'Thymulin': [
    'thymulin peptide', 'facteur thymique serique', 'fts', 'thymic hormone',
    'zinc thymulin', 'hair growth peptide', 'immune modulator peptide',
    'thymus hormone', 'zinc peptide'
  ],
  'Tirzepatide': [
    'mounjaro', 'zepbound', 'twincretin', 'gip glp-1 dual agonist',
    'dual agonist', 'ly3298176', 'tirzepatide peptide', 'weight loss peptide',
    'diabetes drug', 'obesity drug', 'weekly injection', 'glp-1 gip'
  ],
};

// ── Normalizer ───────────────────────────────────────────────────────────────
function normalizeName(name) {
  return (name || '').toLowerCase().trim();
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('🚀 Starting searchAliases population...\n');

  const snap = await db.collection('products').get();
  const products = snap.docs.map(d => ({ docId: d.id, ...d.data() }));

  console.log(`📦 Found ${products.length} products in Firestore\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const product of products) {
    const productName = product.displayName || product.name || '';
    const normalizedProductName = normalizeName(productName);

    // Try exact match first
    let aliases = ALIASES_BY_NAME[productName];

    // Fallback: try case-insensitive match
    if (!aliases) {
      const key = Object.keys(ALIASES_BY_NAME).find(
        k => normalizeName(k) === normalizedProductName
      );
      if (key) aliases = ALIASES_BY_NAME[key];
    }

    // Fallback: partial match for products with same base name (e.g. Tirzepatide multiple dosages)
    if (!aliases) {
      const key = Object.keys(ALIASES_BY_NAME).find(
        k => normalizedProductName.startsWith(normalizeName(k))
      );
      if (key) aliases = ALIASES_BY_NAME[key];
    }

    if (!aliases) {
      console.log(`  ⚠️  No aliases defined for: "${productName}" [${product.docId}]`);
      notFound++;
      continue;
    }

    try {
      await db.collection('products').doc(product.docId).update({
        searchAliases: aliases
      });
      console.log(`  ✅ ${productName.padEnd(50)} → ${aliases.length} aliases`);
      updated++;
    } catch (err) {
      console.error(`  ❌ Failed: ${productName}`, err.message);
      skipped++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`✅ Updated:   ${updated} products`);
  console.log(`⚠️  Not found: ${notFound} products (no alias map entry)`);
  console.log(`❌ Failed:    ${skipped} products`);
  console.log('\n🎉 Done! searchAliases are now live in Firestore.');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Script failed:', err.message);
  process.exit(1);
});

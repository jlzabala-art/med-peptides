import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

if (!ADMIN_KEY) {
  console.error("Missing ALGOLIA_ADMIN_KEY in .env.local");
  process.exit(1);
}

const client = algoliasearch(APP_ID, ADMIN_KEY);

const CLINICAL_SYNONYMS = [
  // 1. Incretins / Weight Loss / Metabolic
  {
    objectID: 'syn-semaglutide',
    type: 'synonym',
    synonyms: ['semaglutide', 'ozempic', 'wegovy', 'rybelsus']
  },
  {
    objectID: 'syn-tirzepatide',
    type: 'synonym',
    synonyms: ['tirzepatide', 'mounjaro', 'zepbound']
  },
  {
    objectID: 'syn-retatrutide',
    type: 'synonym',
    synonyms: ['retatrutide', 'triple g', 'reta', 'ggg peptide']
  },
  {
    objectID: 'syn-aod9604',
    type: 'synonym',
    synonyms: ['aod-9604', 'aod 9604', 'aod', 'lipotropin']
  },
  {
    objectID: 'syn-cagrilintide',
    type: 'synonym',
    synonyms: ['cagrilintide', 'cagrisema']
  },

  // 2. Tissue Repair & Recovery
  {
    objectID: 'syn-bpc157',
    type: 'synonym',
    synonyms: ['bpc-157', 'bpc 157', 'bpc', 'bepecin', 'body protection compound', 'wolverine']
  },
  {
    objectID: 'syn-tb500',
    type: 'synonym',
    synonyms: ['tb-500', 'tb 500', 'tb500', 'thymosin beta 4', 'thymosin beta-4']
  },
  {
    objectID: 'syn-kpv',
    type: 'synonym',
    synonyms: ['kpv', 'alpha-msh fragment', 'lysine-proline-valine']
  },

  // 3. Growth Hormone & Secretagogues
  {
    objectID: 'syn-cjc1295',
    type: 'synonym',
    synonyms: ['cjc-1295', 'cjc 1295', 'cjc', 'mod grf', 'mod grf 1-29']
  },
  {
    objectID: 'syn-ipamorelin',
    type: 'synonym',
    synonyms: ['ipamorelin', 'ipam']
  },
  {
    objectID: 'syn-sermorelin',
    type: 'synonym',
    synonyms: ['sermorelin', 'geref']
  },
  {
    objectID: 'syn-tesamorelin',
    type: 'synonym',
    synonyms: ['tesamorelin', 'egrifta']
  },
  {
    objectID: 'syn-mk677',
    type: 'synonym',
    synonyms: ['mk-677', 'mk 677', 'mk677', 'ibutamoren']
  },

  // 4. Longevity & Cellular Health
  {
    objectID: 'syn-epithalon',
    type: 'synonym',
    synonyms: ['epithalon', 'epitalon', 'epithalamin', 'khavinson peptide']
  },
  {
    objectID: 'syn-nad',
    type: 'synonym',
    synonyms: ['nad+', 'nad', 'nicotinamide adenine dinucleotide']
  },
  {
    objectID: 'syn-motsc',
    type: 'synonym',
    synonyms: ['mots-c', 'motsc', 'mitochondrial peptide']
  },
  {
    objectID: 'syn-ss31',
    type: 'synonym',
    synonyms: ['ss-31', 'ss31', 'elamipretide']
  },
  {
    objectID: 'syn-foxo4',
    type: 'synonym',
    synonyms: ['foxo4-dri', 'foxo4']
  },

  // 5. Aesthetics / Skin / Hair
  {
    objectID: 'syn-ghkcu',
    type: 'synonym',
    synonyms: ['ghk-cu', 'ghk cu', 'ghk', 'copper peptide', 'copper tripeptide']
  },
  {
    objectID: 'syn-melanotan',
    type: 'synonym',
    synonyms: ['melanotan 2', 'melanotan ii', 'mt-2', 'mt2']
  },

  // 6. Sexual & Hormonal Health
  {
    objectID: 'syn-pt141',
    type: 'synonym',
    synonyms: ['pt-141', 'pt 141', 'pt141', 'bremelanotide', 'vyleesi']
  },
  {
    objectID: 'syn-kisspeptin',
    type: 'synonym',
    synonyms: ['kisspeptin', 'kisspeptin-10', 'kisspeptin 10']
  },

  // 7. Sleep & Neuro
  {
    objectID: 'syn-dsip',
    type: 'synonym',
    synonyms: ['dsip', 'delta sleep inducing peptide', 'deep sleep peptide']
  },
  {
    objectID: 'syn-semax',
    type: 'synonym',
    synonyms: ['semax', 'heptapeptide semax']
  },
  {
    objectID: 'syn-selank',
    type: 'synonym',
    synonyms: ['selank', 'tp-7', 'anxiolytic peptide']
  },
  {
    objectID: 'syn-dihexa',
    type: 'synonym',
    synonyms: ['dihexa', 'pnb-0408']
  }
];

async function syncSynonyms() {
  console.log(`\n🏥 Syncing ${CLINICAL_SYNONYMS.length} clinical synonym groups to Algolia...\n`);

  const indices = ['products', 'protocols'];

  for (const indexName of indices) {
    try {
      console.log(`📡 Saving synonyms to index: "${indexName}"...`);
      await client.saveSynonyms({
        indexName,
        synonymHit: CLINICAL_SYNONYMS,
        replaceExistingSynonyms: true
      });
      console.log(`✅ Synonyms synced to "${indexName}" successfully.`);
    } catch (err) {
      console.error(`❌ Error syncing synonyms to "${indexName}":`, err.message);
    }
  }

  console.log('\n🎉 Clinical Synonyms Synchronization Complete!\n');
}

syncSynonyms();

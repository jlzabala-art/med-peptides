import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY
);

// Comprehensive peptide, GLP-1, and wellness medical synonyms
const MEDICAL_SYNONYMS = [
  // GLP-1 & Incretin mimetics
  {
    objectID: 'syn-semaglutide',
    type: 'synonym',
    synonyms: ['semaglutide', 'semaglutida', 'ozempic', 'wegovy', 'rybelsus']
  },
  {
    objectID: 'syn-tirzepatide',
    type: 'synonym',
    synonyms: ['tirzepatide', 'tirzepatida', 'mounjaro', 'zepbound']
  },
  {
    objectID: 'syn-retatrutide',
    type: 'synonym',
    synonyms: ['retatrutide', 'retatrutida', 'ggg tri-agonist', 'ggg']
  },
  {
    objectID: 'syn-liraglutide',
    type: 'synonym',
    synonyms: ['liraglutide', 'liraglutida', 'victoza', 'saxenda']
  },

  // Regenerative & Healing Peptides
  {
    objectID: 'syn-bpc157',
    type: 'synonym',
    synonyms: ['bpc-157', 'bpc157', 'bpc 157', 'body protection compound', 'pentadecapeptide']
  },
  {
    objectID: 'syn-tb500',
    type: 'synonym',
    synonyms: ['tb-500', 'tb500', 'tb 500', 'thymosin beta 4', 'tb4', 'thymosin']
  },
  {
    objectID: 'syn-kpv',
    type: 'synonym',
    synonyms: ['kpv', 'alpha-msh', 'alpha msh', 'melanocortin']
  },
  {
    objectID: 'syn-ll37',
    type: 'synonym',
    synonyms: ['ll-37', 'll37', 'antimicrobial peptide', 'cathelicidin']
  },

  // Growth Hormone Secretagogues & Longevity
  {
    objectID: 'syn-cjc1295',
    type: 'synonym',
    synonyms: ['cjc-1295', 'cjc1295', 'cjc 1295', 'mod grf', 'mod-grf', 'dac']
  },
  {
    objectID: 'syn-ipamorelin',
    type: 'synonym',
    synonyms: ['ipamorelin', 'ipamorelina', 'ipam']
  },
  {
    objectID: 'syn-sermorelin',
    type: 'synonym',
    synonyms: ['sermorelin', 'sermorelina', 'geref']
  },
  {
    objectID: 'syn-tesamorelin',
    type: 'synonym',
    synonyms: ['tesamorelin', 'tesamorelina', 'egrifta']
  },
  {
    objectID: 'syn-ghrp',
    type: 'synonym',
    synonyms: ['ghrp-2', 'ghrp2', 'ghrp-6', 'ghrp6', 'hexarelin']
  },
  {
    objectID: 'syn-mk677',
    type: 'synonym',
    synonyms: ['mk-677', 'mk677', 'ibutamoren']
  },

  // Cellular Energy & Anti-Aging
  {
    objectID: 'syn-nad',
    type: 'synonym',
    synonyms: ['nad+', 'nad', 'nicotinamide adenine dinucleotide', 'nicotinamida']
  },
  {
    objectID: 'syn-nmn',
    type: 'synonym',
    synonyms: ['nmn', 'nicotinamide mononucleotide']
  },
  {
    objectID: 'syn-glutathione',
    type: 'synonym',
    synonyms: ['glutathione', 'glutation', 'gsh']
  },
  {
    objectID: 'syn-epithalon',
    type: 'synonym',
    synonyms: ['epithalon', 'epitalon', 'epithalone', 'telomerase peptide']
  },
  {
    objectID: 'syn-ss31',
    type: 'synonym',
    synonyms: ['ss-31', 'ss31', 'elamipretide', 'bendavia']
  },
  {
    objectID: 'syn-motsc',
    type: 'synonym',
    synonyms: ['mots-c', 'motsc', 'mots c', 'mitochondrial peptide']
  },

  // Aesthetics & Skin/Hair
  {
    objectID: 'syn-ghkcu',
    type: 'synonym',
    synonyms: ['ghk-cu', 'ghkcu', 'ghk cu', 'copper peptide', 'peptido de cobre']
  },
  {
    objectID: 'syn-ptd-dbm',
    type: 'synonym',
    synonyms: ['ptd-dbm', 'ptddbm', 'wnt beta catenin', 'hair peptide']
  },

  // Weight Loss & Lipolysis
  {
    objectID: 'syn-aod9604',
    type: 'synonym',
    synonyms: ['aod-9604', 'aod9604', 'aod 9604', 'lipolytic fragment']
  },
  {
    objectID: 'syn-tesofensine',
    type: 'synonym',
    synonyms: ['tesofensine', 'tesofensina']
  },

  // Libido & Sexual Health
  {
    objectID: 'syn-pt141',
    type: 'synonym',
    synonyms: ['pt-141', 'pt141', 'pt 141', 'bremelanotide', 'vyleesi']
  },

  // Nootropics & Neuroprotection
  {
    objectID: 'syn-semax',
    type: 'synonym',
    synonyms: ['semax', 'semaks', 'na semax']
  },
  {
    objectID: 'syn-selank',
    type: 'synonym',
    synonyms: ['selank', 'na selank', 'anxiolytic peptide']
  },
  {
    objectID: 'syn-cerebrolysin',
    type: 'synonym',
    synonyms: ['cerebrolysin', 'cerebrolisina', 'brain peptides']
  }
];

async function applySynonyms() {
  console.log('🚀 Configuring medical synonyms in Algolia indices...');
  const indices = ['products', 'protocols'];

  for (const indexName of indices) {
    try {
      console.log(`Setting ${MEDICAL_SYNONYMS.length} synonyms on index "${indexName}"...`);
      await client.saveSynonyms({
        indexName,
        synonymHit: MEDICAL_SYNONYMS,
        forwardToReplicas: true,
        replaceExistingSynonyms: true,
      });
      console.log(`✅ Synonyms successfully saved for index "${indexName}".`);
    } catch (err) {
      console.error(`❌ Failed setting synonyms on "${indexName}":`, err.message);
    }
  }

  // Verification test
  console.log('\n🔍 Verifying synonyms resolution...');
  const testQueries = ['ozempic', 'semaglutida', 'bpc157', 'copper peptide', 'glutation'];
  for (const q of testQueries) {
    try {
      const res = await client.search({
        requests: [{ indexName: 'products', query: q, hitsPerPage: 1 }]
      });
      const hits = res.results[0]?.hits || [];
      console.log(`Query "${q}" -> Hits: ${hits.length} ${hits[0] ? `(${hits[0].name})` : '(No hits)'}`);
    } catch (e) {
      console.error(`Query "${q}" error:`, e.message);
    }
  }
}

applySynonyms().catch(console.error);

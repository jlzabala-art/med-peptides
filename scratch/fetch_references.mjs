import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import path from 'path';

const PEPTIDES = [
  { name: 'BPC-157', query: 'BPC-157 OR BPC157 OR "body protection compound"' },
  { name: 'TB-500', query: 'TB-500 OR TB500 OR "Thymosin beta-4"' },
  { name: 'GHK-Cu', query: 'GHK-Cu OR "GHK copper" OR "Glyyl-L-histidyl-L-lysine"' },
  { name: 'MOTS-c', query: 'MOTS-c OR "mitochondria-derived peptide"' },
  { name: 'Epitalon', query: 'Epitalon OR Epithalon OR "Ala-Glu-Asp-Gly"' },
  { name: 'Ipamorelin', query: 'Ipamorelin' },
  { name: 'Melanotan II', query: 'Melanotan II OR MT-2' },
  { name: 'Kisspeptin-10', query: 'Kisspeptin-10 OR Kisspeptin10' },
  { name: 'Semaglutide', query: 'Semaglutide' },
  { name: 'Tirzepatide', query: 'Tirzepatide' }
];

const pubmedApiScript = '/Users/joseluiszabala/.gemini/config/plugins/science/skills/pubmed_database/scripts/pubmed_api.py';
const results = {};

console.log('🧪 Starting PubMed extraction for Catalog Enrichment...');

for (const peptide of PEPTIDES) {
  console.log(`\n🔍 Searching PubMed for: ${peptide.name}...`);
  const searchOut = path.resolve(`./scratch/search_${peptide.name}.json`);
  const fetchOut = path.resolve(`./scratch/fetch_${peptide.name}.json`);
  
  try {
    // 1. Search PubMed
    const cmdSearch = `/Users/joseluiszabala/.local/bin/uv run "${pubmedApiScript}" "${searchOut}" search_pubmed "${peptide.query}" --max_results 3 --sort_by relevance`;
    console.log(`   Running: ${cmdSearch}`);
    execSync(cmdSearch, { stdio: 'inherit' });
    
    if (!existsSync(searchOut)) {
      console.warn(`   ⚠️ No search results written for ${peptide.name}`);
      continue;
    }
    
    const searchData = JSON.parse(execSync(`cat "${searchOut}"`));
    if (searchData.length === 0) {
      console.log(`   ⏭️ No PMIDs found.`);
      continue;
    }
    
    console.log(`   Found PMIDs: ${searchData.join(', ')}. Fetching metadata...`);
    
    // 2. Fetch abstracts
    const cmdFetch = `/Users/joseluiszabala/.local/bin/uv run "${pubmedApiScript}" "${fetchOut}" fetch_article_abstracts "${searchData.join(',')}"`;
    execSync(cmdFetch, { stdio: 'inherit' });
    
    if (!existsSync(fetchOut)) {
      console.warn(`   ⚠️ No metadata details written for ${peptide.name}`);
      continue;
    }
    
    const fetchData = JSON.parse(execSync(`cat "${fetchOut}"`));
    results[peptide.name] = fetchData.map(paper => ({
      pmid: paper.pmid,
      title: paper.title ? paper.title.replace(/<\/?[^>]+(>|$)/g, "") : 'Research Article',
      journal: paper.journal || 'PubMed Literature',
      year: paper.pubdate ? paper.pubdate.substring(0, 4) : 'N/D'
    }));
    
    console.log(`   ✅ Extracted ${results[peptide.name].length} papers.`);
  } catch (err) {
    console.error(`   ❌ Failed for ${peptide.name}:`, err.message);
  }
}

// Write the final mapped references
const finalOut = path.resolve('./scratch/peptide_references.json');
writeFileSync(finalOut, JSON.stringify(results, null, 2), 'utf-8');
console.log(`\n🎉 Success! References written to ${finalOut}`);

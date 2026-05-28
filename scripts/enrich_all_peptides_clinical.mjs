import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsPath = path.resolve(__dirname, '../src/data/products.js');
const pubmedApiScript = '/Users/joseluiszabala/.gemini/config/plugins/science/skills/pubmed_database/scripts/pubmed_api.py';

// Load GEMINI_API_KEY
let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  const envPaths = [path.resolve(__dirname, '../.env.local'), path.resolve(__dirname, '../.env')];
  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      const lines = readFileSync(envPath, 'utf-8').split('\n');
      for (const line of lines) {
        const parts = line.split('=');
        if (parts[0]?.trim() === 'GEMINI_API_KEY') {
          apiKey = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, "");
          break;
        }
      }
    }
    if (apiKey) break;
  }
}

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing. Cannot proceed with AI enrichment.");
  process.exit(1);
}

// 1. Read existing products.js
const rawProducts = readFileSync(productsPath, 'utf-8');
const productsStartMarker = 'export const products =';
const startIdx = rawProducts.indexOf(productsStartMarker);
const jsonStart = rawProducts.indexOf('[', startIdx);
const jsonEnd = rawProducts.lastIndexOf(']') + 1;
const products = JSON.parse(rawProducts.substring(jsonStart, jsonEnd));

console.log(`Loaded ${products.length} products from products.js.`);

// 2. Identify unique peptides that are not yet enriched with references
const groups = new Map();
products.forEach((p, idx) => {
  if (p.productType !== 'peptide' && p.type !== 'peptide' && p.category === 'Research Supplies') {
    return;
  }
  const key = p.name.trim().toLowerCase();
  if (!groups.has(key)) {
    groups.set(key, []);
  }
  groups.get(key).push({ item: p, index: idx });
});

console.log(`Found ${groups.size} unique peptides.`);

// Helper function to call Gemini
async function getGeminiMetadata(name, desc) {
  const prompt = `
You are a world-class clinical researcher and molecular pharmacologist specializing in peptide therapeutics.
Analyze the peptide "${name}" and return a STRICT JSON object containing scientific and clinical metadata.
Do not wrap the JSON in markdown blocks (like \`\`\`json). Return raw JSON only.

Product Name: ${name}
Description: ${desc || 'N/A'}

Return a valid JSON object matching the following structure:
{
  "scientificName": "IUPAC or standard scientific name",
  "cas": "CAS registry number, or 'N/A'",
  "halfLife": "pharmacokinetic half-life, e.g., '2 hours', '30 minutes', '7 days'",
  "clearance": "primary clearance organ/route, e.g., 'Renal filtration', 'Hepatic proteolysis'",
  "contraindications": ["list", "of", "contraindications", "e.g.", "active_malignancy"],
  "synergies": ["list", "of", "synergistic", "compounds"]
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.15,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini status ${response.status}: ${await response.text()}`);
  }
  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
}

// Helper function to search PubMed for a peptide
function getPubMedReferences(name) {
  const cleanName = name.replace(/\b\d+mg\b/i, '').replace(/\b\d+mcg\b/i, '').trim();
  const searchOut = path.resolve(`./scratch/search_all_${cleanName.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
  const fetchOut = path.resolve(`./scratch/fetch_all_${cleanName.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
  
  try {
    const cmdSearch = `/Users/joseluiszabala/.local/bin/uv run "${pubmedApiScript}" "${searchOut}" search_pubmed "${cleanName}" --max_results 2 --sort_by relevance`;
    execSync(cmdSearch, { stdio: 'ignore' });
    if (!existsSync(searchOut)) return [];
    
    const searchData = JSON.parse(readFileSync(searchOut, 'utf-8'));
    if (searchData.length === 0) return [];
    
    const cmdFetch = `/Users/joseluiszabala/.local/bin/uv run "${pubmedApiScript}" "${fetchOut}" fetch_article_abstracts "${searchData.join(',')}"`;
    execSync(cmdFetch, { stdio: 'ignore' });
    if (!existsSync(fetchOut)) return [];
    
    const fetchData = JSON.parse(readFileSync(fetchOut, 'utf-8'));
    return fetchData.map(paper => ({
      pmid: paper.pmid,
      title: paper.title ? paper.title.replace(/<\/?[^>]+(>|$)/g, "") : 'Research Article',
      journal: paper.journal || 'PubMed Literature',
      year: paper.pubdate ? paper.pubdate.substring(0, 4) : 'N/D'
    }));
  } catch (e) {
    console.error(`  ⚠️ PubMed fetch failed for ${name}:`, e.message);
    return [];
  }
}

async function main() {
  let enriched = 0;
  
  for (const [name, items] of groups.entries()) {
    const first = items[0].item;
    
    // Check if references are already present
    if (first.typeData?.references && first.typeData.references.length > 0) {
      console.log(`⏭️  Skipping "${first.name}" (already enriched).`);
      continue;
    }
    
    console.log(`\n🧪 Enriching clinical data for: "${first.name}"`);
    
    try {
      // 1. Get references from PubMed
      console.log(`   Searching PubMed...`);
      const refs = getPubMedReferences(first.name);
      console.log(`   Found ${refs.length} references.`);
      
      // 2. Get PK and chemical metadata from Gemini
      console.log(`   Querying Gemini for PK/clinical metadata...`);
      const aiData = await getGeminiMetadata(first.name, first.desc || first.description);
      console.log(`   Received metadata: halfLife="${aiData.halfLife}", clearance="${aiData.clearance}"`);
      
      // 3. Apply to all variants
      items.forEach(({ item }) => {
        item.scientificName = aiData.scientificName || item.scientificName || '';
        item.cas = (aiData.cas && aiData.cas !== 'N/A') ? aiData.cas : (item.cas || 'N/A');
        
        if (!item.typeData) {
          item.typeData = {};
        }
        
        item.typeData.halfLife = aiData.halfLife || '';
        item.typeData.clearance = aiData.clearance || '';
        item.typeData.references = refs;
        item.typeData.contraindications = aiData.contraindications || [];
        item.typeData.synergies = aiData.synergies || [];
      });
      
      enriched++;
      
      // 4. Sleep 7 seconds to avoid rate limits
      await new Promise(r => setTimeout(r, 7000));
    } catch (err) {
      console.error(`   ❌ Failed to enrich "${first.name}":`, err.message);
      // Still sleep a bit on failure
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  
  console.log(`\nEnrichment completed. Total enriched: ${enriched}`);
  
  if (enriched > 0) {
    console.log('Saving updates to src/data/products.js...');
    const prefix = rawProducts.substring(0, jsonStart);
    const suffix = rawProducts.substring(jsonEnd);
    const outputContent = prefix + JSON.stringify(products, null, 2) + suffix;
    writeFileSync(productsPath, outputContent, 'utf-8');
    console.log('✅ Local products.js file updated.');
  }
}

main().catch(console.error);

import { db } from '../scripts/lib/firebase-admin.mjs';

const getPharmaBaseName = (name) => {
  if (!name) return '';
  return name
    .replace(/\s*\d+(mg|mcg|ml|g|iu|ui)\b/gi, '') // Removes dosage
    .replace(/\/?\s?vial\b/gi, '')               // Removes format
    .replace(/\b(pure|grade|research|grade|lyophilized|acetate)\b/gi, '') // Commercial noise
    .trim();
};

const API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

async function testProduct(name) {
  const baseName = getPharmaBaseName(name);
  const searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(baseName)}&retmode=json&retmax=3`;
  try {
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult?.idlist || [];
    console.log(`Product: "${name}" -> Query: "${baseName}" -> Count: ${searchData.esearchresult?.count || 0} -> IDs:`, ids);
    return ids.length;
  } catch (err) {
    console.error(`Error for ${name}:`, err.message);
    return 0;
  }
}

async function run() {
  const snapshot = await db.collection('products').get();
  console.log('Testing', snapshot.size, 'products...');
  for (const doc of snapshot.docs) {
    const data = doc.data();
    await testProduct(data.name);
    // Sleep to avoid rate limiting
    await new Promise(r => setTimeout(r, 400));
  }
}

run().catch(console.error);

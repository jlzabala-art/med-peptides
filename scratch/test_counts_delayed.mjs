const API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

async function testQuery(term) {
  const searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=3`;
  try {
    const searchRes = await fetch(searchUrl);
    if (searchRes.status === 429) {
      console.log(`Term: "${term}" -> 429 Rate Limit Exceeded`);
      return;
    }
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult?.idlist || [];
    console.log(`Term: "${term}" -> Count: ${searchData.esearchresult?.count || 0} -> IDs:`, ids);
  } catch (err) {
    console.error(`Term: "${term}" -> Error:`, err.message);
  }
}

async function run() {
  const terms = [
    "Modified GRF 1-29",
    "Modified GRF",
    "Thymosin β4",
    "Thymosin beta 4",
    "Thymosin beta-4",
    "Thymosin alpha 1",
    "Acetyl Octapeptide-3",
    "Acetyl Octapeptide 3",
    "Snap-8",
    "Snap 8"
  ];
  for (const term of terms) {
    await testQuery(term);
    await new Promise(r => setTimeout(r, 600)); // 600ms delay to avoid 429
  }
}

run();

const API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

async function testQuery(term) {
  const searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=3`;
  try {
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult?.idlist || [];
    console.log(`Term: "${term}" -> Count: ${searchData.esearchresult?.count || 0} -> IDs:`, ids);
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await testQuery("Modified GRF 1-29");
  await testQuery("Modified GRF");
  await testQuery("Thymosin β4");
  await testQuery("Thymosin beta 4");
  await testQuery("Thymosin beta-4");
  await testQuery("Thymosin alpha 1");
  await testQuery("Acetyl Octapeptide-3");
  await testQuery("Acetyl Octapeptide 3");
  await testQuery("Snap-8");
  await testQuery("Snap 8");
}

run();

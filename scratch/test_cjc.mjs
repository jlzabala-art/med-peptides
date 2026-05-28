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
  await testQuery("CJC1295");
  await testQuery("CJC 1295");
  await testQuery("Modified GRF");
  await testQuery("GRF 1-29");
  await testQuery("Sermorelin");
  await testQuery("BPC 157");
  await testQuery("BPC-157");
}

run();

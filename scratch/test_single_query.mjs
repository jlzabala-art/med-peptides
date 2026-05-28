const API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

async function testQuery(term) {
  const searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=3`;
  try {
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult?.idlist || [];
    console.log(`Term: "${term}" -> Count: ${searchData.esearchresult?.count || 0} -> IDs:`, ids);
    if (ids.length > 0) {
      const summaryUrl = `${API_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
      const summaryRes = await fetch(summaryUrl);
      const summaryData = await summaryRes.json();
      for (const id of ids) {
        console.log(`  - ID ${id}: ${summaryData.result?.[id]?.title}`);
      }
    }
  } catch (err) {
    console.error(`Error:`, err);
  }
}

async function run() {
  await testQuery("5-AMINO 1 MQ");
  await testQuery("5-amino-1-methylquinolinium");
  await testQuery("CJC-1295");
  await testQuery("CJC-1295 with DAC");
  await testQuery("CJC-1295 without DAC");
  await testQuery("Melanotan II");
  await testQuery("MT2");
  await testQuery("Snap-8");
  await testQuery("Acetyl Octapeptide-3");
}

run();
